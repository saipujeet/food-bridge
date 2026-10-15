package com.foodbridge.backend.analytics.service;

import com.foodbridge.backend.admin.entity.DeliveryRecord;
import com.foodbridge.backend.admin.entity.DonationRecord;
import com.foodbridge.backend.admin.repository.DeliveryRecordRepository;
import com.foodbridge.backend.admin.repository.DonationRecordRepository;
import com.foodbridge.backend.analytics.dto.*;
import com.foodbridge.backend.user.Role;
import com.foodbridge.backend.user.User;
import com.foodbridge.backend.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class AnalyticsService {

    public static final ZoneId ZONE = ZoneId.of("Asia/Kolkata");
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    private final UserRepository userRepository;
    private final DonationRecordRepository donationRecordRepository;
    private final DeliveryRecordRepository deliveryRecordRepository;

    public AnalyticsService(
            UserRepository userRepository,
            DonationRecordRepository donationRecordRepository,
            DeliveryRecordRepository deliveryRecordRepository) {
        this.userRepository = userRepository;
        this.donationRecordRepository = donationRecordRepository;
        this.deliveryRecordRepository = deliveryRecordRepository;
    }

    public AdminOverviewDto getAdminOverview(LocalDate from, LocalDate to) {
        LocalDate today = LocalDate.now(ZONE);
        if (from == null) from = today.minusDays(30);
        if (to == null) to = today;

        LocalDateTime startOfToday = today.atStartOfDay();
        LocalDateTime endOfToday = today.plusDays(1).atStartOfDay();

        AdminOverviewDto dto = new AdminOverviewDto();
        dto.setPeriod(new PeriodDto(from, to, ZONE.getId()));

        dto.setTotalDonors(userRepository.countByRole(Role.DONOR));
        dto.setTotalNGOs(userRepository.countByRole(Role.NGO));
        dto.setTotalVolunteers(userRepository.countByRole(Role.VOLUNTEER));

        dto.setActiveNGOs(userRepository.countByRoleAndActive(Role.NGO, true));
        dto.setActiveVolunteers(userRepository.countByRoleAndActive(Role.VOLUNTEER, true));

        List<DonationRecord> allDonations = donationRecordRepository.findAll();
        List<DeliveryRecord> allDeliveries = deliveryRecordRepository.findAll();

        long createdToday = allDonations.stream()
                .filter(d -> d.getCreatedAt() != null && !d.getCreatedAt().isBefore(startOfToday) && d.getCreatedAt().isBefore(endOfToday))
                .count();
        dto.setDonationsCreatedToday(createdToday);

        Double donatedTodayKg = donationRecordRepository.sumCreatedQuantityBetween(startOfToday, endOfToday);
        dto.setFoodDonatedTodayKg(donatedTodayKg != null ? donatedTodayKg : 0.0);

        Double distributedTodayKg = donationRecordRepository.sumDeliveredQuantityBetween(startOfToday, endOfToday);
        dto.setFoodDistributedTodayKg(distributedTodayKg != null ? distributedTodayKg : 0.0);

        dto.setPendingDonations(allDonations.stream().filter(d -> "AVAILABLE".equals(d.getStatus()) || "MATCHING".equals(d.getStatus())).count());
        dto.setAcceptedDonations(allDonations.stream().filter(d -> "ACCEPTED".equals(d.getStatus()) || "MATCHED".equals(d.getStatus())).count());
        dto.setInProgressDonations(allDonations.stream().filter(d -> "PICKUP_PENDING".equals(d.getStatus()) || "PICKED_UP".equals(d.getStatus()) || "IN_TRANSIT".equals(d.getStatus())).count());
        dto.setCompletedDonations(allDonations.stream().filter(d -> "DELIVERED".equals(d.getStatus())).count());
        dto.setCancelledDonations(allDonations.stream().filter(d -> "CANCELLED".equals(d.getStatus())).count());
        dto.setExpiredDonations(allDonations.stream().filter(d -> "EXPIRED".equals(d.getStatus())).count());

        long eligible = dto.getCompletedDonations() + dto.getExpiredDonations() + dto.getCancelledDonations();
        double completionRate = eligible > 0 ? (dto.getCompletedDonations() * 100.0 / eligible) : (allDonations.size() > 0 ? 75.0 : 0.0);
        dto.setCompletionRate(Math.round(completionRate * 10.0) / 10.0);

        double totalOffered = allDonations.stream().mapToDouble(d -> d.getQuantity() != null ? d.getQuantity() : 0.0).sum();
        Double totalDelivered = donationRecordRepository.sumDeliveredQuantity();
        dto.setTotalFoodOfferedKg(totalOffered);
        dto.setTotalFoodDistributedKg(totalDelivered != null ? totalDelivered : 0.0);

        // Recent activities
        List<RecentActivityDto> activities = new ArrayList<>();
        allDonations.stream().sorted(Comparator.comparing(DonationRecord::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder()))).limit(5).forEach(d -> {
            activities.add(new RecentActivityDto("DONATION", d.getDonationCode(), d.getFoodName(), "Donated by " + d.getDonorName() + " (" + d.getQuantity() + " " + d.getUnit() + ")", d.getStatus(), d.getCreatedAt() != null ? d.getCreatedAt().toString() : ""));
        });
        allDeliveries.stream().sorted(Comparator.comparing(DeliveryRecord::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder()))).limit(5).forEach(del -> {
            activities.add(new RecentActivityDto("DELIVERY", del.getDeliveryCode(), del.getNgoName(), "Delivery by " + del.getVolunteerName() + " to " + del.getNgoName(), del.getStatus(), del.getCreatedAt() != null ? del.getCreatedAt().toString() : ""));
        });
        dto.setRecentActivities(activities);
        dto.setLastUpdated(LocalDateTime.now(ZONE).toString());

        return dto;
    }

    public List<TrendPointDto> getAdminTrends(String period) {
        LocalDate today = LocalDate.now(ZONE);
        int days = "day".equalsIgnoreCase(period) ? 1 : "month".equalsIgnoreCase(period) ? 30 : 7;
        LocalDate startDate = today.minusDays(days - 1);

        List<DonationRecord> allDonations = donationRecordRepository.findAll();
        List<DeliveryRecord> allDeliveries = deliveryRecordRepository.findAll();

        List<TrendPointDto> points = new ArrayList<>();
        for (int i = 0; i < days; i++) {
            LocalDate d = startDate.plusDays(i);
            LocalDateTime dayStart = d.atStartOfDay();
            LocalDateTime dayEnd = d.plusDays(1).atStartOfDay();

            long created = allDonations.stream()
                    .filter(don -> don.getCreatedAt() != null && !don.getCreatedAt().isBefore(dayStart) && don.getCreatedAt().isBefore(dayEnd))
                    .count();

            double offeredKg = allDonations.stream()
                    .filter(don -> don.getCreatedAt() != null && !don.getCreatedAt().isBefore(dayStart) && don.getCreatedAt().isBefore(dayEnd))
                    .mapToDouble(don -> don.getQuantity() != null ? don.getQuantity() : 0.0)
                    .sum();

            double distributedKg = allDonations.stream()
                    .filter(don -> "DELIVERED".equals(don.getStatus()) && don.getDeliveredAt() != null && !don.getDeliveredAt().isBefore(dayStart) && don.getDeliveredAt().isBefore(dayEnd))
                    .mapToDouble(don -> don.getQuantity() != null ? don.getQuantity() : 0.0)
                    .sum();

            long deliveredTasks = allDeliveries.stream()
                    .filter(del -> "DELIVERED".equals(del.getStatus()) && del.getDeliveredAt() != null && !del.getDeliveredAt().isBefore(dayStart) && del.getDeliveredAt().isBefore(dayEnd))
                    .count();

            points.add(new TrendPointDto(d.format(DATE_FORMATTER), created, offeredKg, distributedKg, deliveredTasks));
        }

        return points;
    }

    public List<DistributionStatusDto> getAdminDistributionStatus() {
        List<DonationRecord> all = donationRecordRepository.findAll();
        long total = all.size();

        Map<String, List<DonationRecord>> grouped = all.stream()
                .collect(Collectors.groupingBy(DonationRecord::getStatus));

        List<DistributionStatusDto> result = new ArrayList<>();
        grouped.forEach((status, list) -> {
            long count = list.size();
            double foodKg = list.stream().mapToDouble(d -> d.getQuantity() != null ? d.getQuantity() : 0.0).sum();
            double pct = total > 0 ? (count * 100.0 / total) : 0.0;
            result.add(new DistributionStatusDto(status, count, foodKg, Math.round(pct * 10.0) / 10.0));
        });

        return result;
    }

    public NGOOverviewDto getNGOOverview(Long ngoUserId) {
        User ngoUser = userRepository.findById(ngoUserId)
                .orElseThrow(() -> new IllegalArgumentException("NGO user not found: " + ngoUserId));

        LocalDate today = LocalDate.now(ZONE);
        LocalDateTime startOfToday = today.atStartOfDay();
        LocalDateTime endOfToday = today.plusDays(1).atStartOfDay();

        NGOOverviewDto dto = new NGOOverviewDto();
        dto.setPeriod(new PeriodDto(today.minusDays(7), today, ZONE.getId()));

        List<DonationRecord> ngoDonations = donationRecordRepository.findByMatchedNgoIdOrderByCreatedAtDesc(ngoUserId);

        dto.setNewOffersAvailable(ngoDonations.stream().filter(d -> "MATCHED".equals(d.getStatus())).count());
        dto.setOffersAccepted(ngoDonations.stream().filter(d -> "ACCEPTED".equals(d.getStatus())).count());
        dto.setUpcomingPickups(ngoDonations.stream().filter(d -> "PICKUP_PENDING".equals(d.getStatus())).count());
        dto.setPendingDeliveries(ngoDonations.stream().filter(d -> "PICKED_UP".equals(d.getStatus()) || "IN_TRANSIT".equals(d.getStatus())).count());
        dto.setCompletedPickups(ngoDonations.stream().filter(d -> "DELIVERED".equals(d.getStatus())).count());

        Double foodToday = donationRecordRepository.sumNgoReceivedQuantityBetween(ngoUserId, startOfToday, endOfToday);
        double foodReceivedTodayKg = foodToday != null ? foodToday : 0.0;
        dto.setFoodReceivedTodayKg(foodReceivedTodayKg);

        double dailyCapacity = ngoUser.getMaxCapacity() != null ? ngoUser.getMaxCapacity() : 250.0;
        dto.setDailyCapacityKg(dailyCapacity);

        // Required Formula: remaining capacity = max(0, daily capacity − food received today)
        double remaining = Math.max(0.0, dailyCapacity - foodReceivedTodayKg);
        dto.setRemainingCapacityKg(remaining);

        double utilization = dailyCapacity > 0 ? (foodReceivedTodayKg / dailyCapacity * 100.0) : 0.0;
        dto.setCapacityUtilizationRate(Math.round(utilization * 10.0) / 10.0);

        dto.setRecentReceipts(ngoDonations.stream().filter(d -> "DELIVERED".equals(d.getStatus())).limit(5).collect(Collectors.toList()));

        // 7-day weekly trend of received food
        List<TrendPointDto> weekly = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            LocalDate d = today.minusDays(i);
            LocalDateTime dStart = d.atStartOfDay();
            LocalDateTime dEnd = d.plusDays(1).atStartOfDay();

            double receivedKg = ngoDonations.stream()
                    .filter(don -> "DELIVERED".equals(don.getStatus()) && don.getDeliveredAt() != null && !don.getDeliveredAt().isBefore(dStart) && don.getDeliveredAt().isBefore(dEnd))
                    .mapToDouble(don -> don.getQuantity() != null ? don.getQuantity() : 0.0)
                    .sum();

            weekly.add(new TrendPointDto(d.format(DATE_FORMATTER), 0, 0, receivedKg, 0));
        }
        dto.setWeeklyTrends(weekly);
        dto.setLastUpdated(LocalDateTime.now(ZONE).toString());

        return dto;
    }

    public DonorOverviewDto getDonorOverview(Long donorUserId) {
        LocalDate today = LocalDate.now(ZONE);
        LocalDateTime startOfToday = today.atStartOfDay();
        LocalDateTime endOfToday = today.plusDays(1).atStartOfDay();

        DonorOverviewDto dto = new DonorOverviewDto();
        dto.setPeriod(new PeriodDto(today.minusDays(30), today, ZONE.getId()));

        List<DonationRecord> donorDonations = donationRecordRepository.findByDonorIdOrderByCreatedAtDesc(donorUserId);

        long createdToday = donorDonations.stream()
                .filter(d -> d.getCreatedAt() != null && !d.getCreatedAt().isBefore(startOfToday) && d.getCreatedAt().isBefore(endOfToday))
                .count();
        dto.setDonationsCreatedToday(createdToday);

        dto.setActiveOffers(donorDonations.stream().filter(d -> "AVAILABLE".equals(d.getStatus()) || "MATCHING".equals(d.getStatus()) || "MATCHED".equals(d.getStatus())).count());
        dto.setAcceptedOffers(donorDonations.stream().filter(d -> "ACCEPTED".equals(d.getStatus()) || "PICKUP_PENDING".equals(d.getStatus()) || "IN_TRANSIT".equals(d.getStatus())).count());
        dto.setCompletedDistributions(donorDonations.stream().filter(d -> "DELIVERED".equals(d.getStatus())).count());
        dto.setCancelledOrExpiredOffers(donorDonations.stream().filter(d -> "CANCELLED".equals(d.getStatus()) || "EXPIRED".equals(d.getStatus())).count());

        Double totalOffered = donationRecordRepository.sumDonorOfferedQuantity(donorUserId);
        dto.setTotalFoodOfferedKg(totalOffered != null ? totalOffered : 0.0);

        Double totalDistributed = donationRecordRepository.sumDonorDistributedQuantity(donorUserId);
        dto.setTotalFoodDistributedKg(totalDistributed != null ? totalDistributed : 0.0);

        double todayOffered = donorDonations.stream()
                .filter(d -> d.getCreatedAt() != null && !d.getCreatedAt().isBefore(startOfToday) && d.getCreatedAt().isBefore(endOfToday))
                .mapToDouble(d -> d.getQuantity() != null ? d.getQuantity() : 0.0)
                .sum();
        dto.setTodayFoodOfferedKg(todayOffered);

        double todayDistributed = donorDonations.stream()
                .filter(d -> "DELIVERED".equals(d.getStatus()) && d.getDeliveredAt() != null && !d.getDeliveredAt().isBefore(startOfToday) && d.getDeliveredAt().isBefore(endOfToday))
                .mapToDouble(d -> d.getQuantity() != null ? d.getQuantity() : 0.0)
                .sum();
        dto.setTodayFoodDistributedKg(todayDistributed);

        dto.setRecentDonations(donorDonations.stream().limit(5).collect(Collectors.toList()));

        // Monthly trends (past 4 weeks)
        List<TrendPointDto> trends = new ArrayList<>();
        for (int i = 27; i >= 0; i -= 7) {
            LocalDate d = today.minusDays(i);
            LocalDateTime dStart = d.atStartOfDay();
            LocalDateTime dEnd = d.plusDays(7).atStartOfDay();

            double offKg = donorDonations.stream()
                    .filter(don -> don.getCreatedAt() != null && !don.getCreatedAt().isBefore(dStart) && don.getCreatedAt().isBefore(dEnd))
                    .mapToDouble(don -> don.getQuantity() != null ? don.getQuantity() : 0.0)
                    .sum();

            double distKg = donorDonations.stream()
                    .filter(don -> "DELIVERED".equals(don.getStatus()) && don.getDeliveredAt() != null && !don.getDeliveredAt().isBefore(dStart) && don.getDeliveredAt().isBefore(dEnd))
                    .mapToDouble(don -> don.getQuantity() != null ? don.getQuantity() : 0.0)
                    .sum();

            trends.add(new TrendPointDto(d.format(DATE_FORMATTER), 0, offKg, distKg, 0));
        }
        dto.setMonthlyTrends(trends);
        dto.setLastUpdated(LocalDateTime.now(ZONE).toString());

        return dto;
    }

    public VolunteerOverviewDto getVolunteerOverview(Long volunteerUserId) {
        LocalDate today = LocalDate.now(ZONE);
        LocalDateTime startOfToday = today.atStartOfDay();
        LocalDateTime endOfToday = today.plusDays(1).atStartOfDay();

        VolunteerOverviewDto dto = new VolunteerOverviewDto();
        dto.setPeriod(new PeriodDto(today.minusDays(7), today, ZONE.getId()));

        List<DeliveryRecord> volDeliveries = deliveryRecordRepository.findByVolunteerIdOrderByCreatedAtDesc(volunteerUserId);

        dto.setAssignedDeliveries(volDeliveries.stream().filter(d -> !"CANCELLED".equals(d.getStatus())).count());
        dto.setPickupsAwaitingAction(volDeliveries.stream().filter(d -> "PENDING_ASSIGNMENT".equals(d.getStatus()) || "ACCEPTED".equals(d.getStatus()) || "PICKUP_PENDING".equals(d.getStatus())).count());
        dto.setDeliveriesInProgress(volDeliveries.stream().filter(d -> "PICKED_UP".equals(d.getStatus()) || "IN_TRANSIT".equals(d.getStatus())).count());
        dto.setCompletedDeliveries(volDeliveries.stream().filter(d -> "DELIVERED".equals(d.getStatus())).count());
        dto.setCancelledTasks(volDeliveries.stream().filter(d -> "CANCELLED".equals(d.getStatus())).count());

        long completedToday = volDeliveries.stream()
                .filter(d -> "DELIVERED".equals(d.getStatus()) && d.getDeliveredAt() != null && !d.getDeliveredAt().isBefore(startOfToday) && d.getDeliveredAt().isBefore(endOfToday))
                .count();
        dto.setTodayDeliveriesCompleted(completedToday);

        // Approximate 5.2 km per completed delivery task
        dto.setTotalKmEstimated(Math.round(dto.getCompletedDeliveries() * 5.2 * 10.0) / 10.0);
        dto.setRecentDeliveries(volDeliveries.stream().limit(5).collect(Collectors.toList()));

        // 7-day delivery trend
        List<TrendPointDto> weekly = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            LocalDate d = today.minusDays(i);
            LocalDateTime dStart = d.atStartOfDay();
            LocalDateTime dEnd = d.plusDays(1).atStartOfDay();

            long count = volDeliveries.stream()
                    .filter(del -> "DELIVERED".equals(del.getStatus()) && del.getDeliveredAt() != null && !del.getDeliveredAt().isBefore(dStart) && del.getDeliveredAt().isBefore(dEnd))
                    .count();

            weekly.add(new TrendPointDto(d.format(DATE_FORMATTER), 0, 0, 0, count));
        }
        dto.setWeeklyTrends(weekly);
        dto.setLastUpdated(LocalDateTime.now(ZONE).toString());

        return dto;
    }

    public List<DonationRecord> getDonationsHistory(User user, LocalDate from, LocalDate to) {
        LocalDateTime start = (from != null ? from : LocalDate.now(ZONE).minusDays(90)).atStartOfDay();
        LocalDateTime end = (to != null ? to : LocalDate.now(ZONE)).plusDays(1).atStartOfDay();

        if (user.getRole() == Role.ADMIN) {
            return donationRecordRepository.findByCreatedAtBetween(start, end);
        } else if (user.getRole() == Role.DONOR) {
            return donationRecordRepository.findByDonorIdAndCreatedAtBetween(user.getId(), start, end);
        } else if (user.getRole() == Role.NGO) {
            return donationRecordRepository.findByMatchedNgoIdAndCreatedAtBetween(user.getId(), start, end);
        } else {
            return Collections.emptyList();
        }
    }

    public List<DeliveryRecord> getDeliveriesHistory(User user, LocalDate from, LocalDate to) {
        LocalDateTime start = (from != null ? from : LocalDate.now(ZONE).minusDays(90)).atStartOfDay();
        LocalDateTime end = (to != null ? to : LocalDate.now(ZONE)).plusDays(1).atStartOfDay();

        if (user.getRole() == Role.ADMIN) {
            return deliveryRecordRepository.findByCreatedAtBetween(start, end);
        } else if (user.getRole() == Role.VOLUNTEER) {
            return deliveryRecordRepository.findByVolunteerIdAndCreatedAtBetween(user.getId(), start, end);
        } else {
            return Collections.emptyList();
        }
    }
}

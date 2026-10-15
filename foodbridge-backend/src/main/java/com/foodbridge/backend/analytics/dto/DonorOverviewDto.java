package com.foodbridge.backend.analytics.dto;

import com.foodbridge.backend.admin.entity.DonationRecord;
import java.util.ArrayList;
import java.util.List;

public class DonorOverviewDto {
    private PeriodDto period;

    private long donationsCreatedToday;
    private long activeOffers;
    private long acceptedOffers;
    private long completedDistributions;
    private long cancelledOrExpiredOffers;

    private double totalFoodOfferedKg;
    private double totalFoodDistributedKg;
    private double todayFoodOfferedKg;
    private double todayFoodDistributedKg;

    private List<DonationRecord> recentDonations = new ArrayList<>();
    private List<TrendPointDto> monthlyTrends = new ArrayList<>();
    private String lastUpdated;

    public DonorOverviewDto() {}

    public PeriodDto getPeriod() { return period; }
    public void setPeriod(PeriodDto period) { this.period = period; }

    public long getDonationsCreatedToday() { return donationsCreatedToday; }
    public void setDonationsCreatedToday(long donationsCreatedToday) { this.donationsCreatedToday = donationsCreatedToday; }

    public long getActiveOffers() { return activeOffers; }
    public void setActiveOffers(long activeOffers) { this.activeOffers = activeOffers; }

    public long getAcceptedOffers() { return acceptedOffers; }
    public void setAcceptedOffers(long acceptedOffers) { this.acceptedOffers = acceptedOffers; }

    public long getCompletedDistributions() { return completedDistributions; }
    public void setCompletedDistributions(long completedDistributions) { this.completedDistributions = completedDistributions; }

    public long getCancelledOrExpiredOffers() { return cancelledOrExpiredOffers; }
    public void setCancelledOrExpiredOffers(long cancelledOrExpiredOffers) { this.cancelledOrExpiredOffers = cancelledOrExpiredOffers; }

    public double getTotalFoodOfferedKg() { return totalFoodOfferedKg; }
    public void setTotalFoodOfferedKg(double totalFoodOfferedKg) { this.totalFoodOfferedKg = totalFoodOfferedKg; }

    public double getTotalFoodDistributedKg() { return totalFoodDistributedKg; }
    public void setTotalFoodDistributedKg(double totalFoodDistributedKg) { this.totalFoodDistributedKg = totalFoodDistributedKg; }

    public double getTodayFoodOfferedKg() { return todayFoodOfferedKg; }
    public void setTodayFoodOfferedKg(double todayFoodOfferedKg) { this.todayFoodOfferedKg = todayFoodOfferedKg; }

    public double getTodayFoodDistributedKg() { return todayFoodDistributedKg; }
    public void setTodayFoodDistributedKg(double todayFoodDistributedKg) { this.todayFoodDistributedKg = todayFoodDistributedKg; }

    public List<DonationRecord> getRecentDonations() { return recentDonations; }
    public void setRecentDonations(List<DonationRecord> recentDonations) { this.recentDonations = recentDonations; }

    public List<TrendPointDto> getMonthlyTrends() { return monthlyTrends; }
    public void setMonthlyTrends(List<TrendPointDto> monthlyTrends) { this.monthlyTrends = monthlyTrends; }

    public String getLastUpdated() { return lastUpdated; }
    public void setLastUpdated(String lastUpdated) { this.lastUpdated = lastUpdated; }
}

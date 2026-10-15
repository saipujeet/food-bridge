package com.foodbridge.backend.analytics.dto;

import java.util.ArrayList;
import java.util.List;

public class AdminOverviewDto {
    private PeriodDto period;

    private long totalDonors;
    private long totalNGOs;
    private long totalVolunteers;

    private long donationsCreatedToday;
    private double foodDonatedTodayKg;
    private double foodDistributedTodayKg;

    private long pendingDonations;
    private long acceptedDonations;
    private long inProgressDonations;
    private long completedDonations;
    private long cancelledDonations;
    private long expiredDonations;

    private long activeNGOs;
    private long activeVolunteers;

    private double completionRate;

    private double totalFoodOfferedKg;
    private double totalFoodDistributedKg;

    private List<RecentActivityDto> recentActivities = new ArrayList<>();
    private String lastUpdated;

    public AdminOverviewDto() {}

    public PeriodDto getPeriod() { return period; }
    public void setPeriod(PeriodDto period) { this.period = period; }

    public long getTotalDonors() { return totalDonors; }
    public void setTotalDonors(long totalDonors) { this.totalDonors = totalDonors; }

    public long getTotalNGOs() { return totalNGOs; }
    public void setTotalNGOs(long totalNGOs) { this.totalNGOs = totalNGOs; }

    public long getTotalVolunteers() { return totalVolunteers; }
    public void setTotalVolunteers(long totalVolunteers) { this.totalVolunteers = totalVolunteers; }

    public long getDonationsCreatedToday() { return donationsCreatedToday; }
    public void setDonationsCreatedToday(long donationsCreatedToday) { this.donationsCreatedToday = donationsCreatedToday; }

    public double getFoodDonatedTodayKg() { return foodDonatedTodayKg; }
    public void setFoodDonatedTodayKg(double foodDonatedTodayKg) { this.foodDonatedTodayKg = foodDonatedTodayKg; }

    public double getFoodDistributedTodayKg() { return foodDistributedTodayKg; }
    public void setFoodDistributedTodayKg(double foodDistributedTodayKg) { this.foodDistributedTodayKg = foodDistributedTodayKg; }

    public long getPendingDonations() { return pendingDonations; }
    public void setPendingDonations(long pendingDonations) { this.pendingDonations = pendingDonations; }

    public long getAcceptedDonations() { return acceptedDonations; }
    public void setAcceptedDonations(long acceptedDonations) { this.acceptedDonations = acceptedDonations; }

    public long getInProgressDonations() { return inProgressDonations; }
    public void setInProgressDonations(long inProgressDonations) { this.inProgressDonations = inProgressDonations; }

    public long getCompletedDonations() { return completedDonations; }
    public void setCompletedDonations(long completedDonations) { this.completedDonations = completedDonations; }

    public long getCancelledDonations() { return cancelledDonations; }
    public void setCancelledDonations(long cancelledDonations) { this.cancelledDonations = cancelledDonations; }

    public long getExpiredDonations() { return expiredDonations; }
    public void setExpiredDonations(long expiredDonations) { this.expiredDonations = expiredDonations; }

    public long getActiveNGOs() { return activeNGOs; }
    public void setActiveNGOs(long activeNGOs) { this.activeNGOs = activeNGOs; }

    public long getActiveVolunteers() { return activeVolunteers; }
    public void setActiveVolunteers(long activeVolunteers) { this.activeVolunteers = activeVolunteers; }

    public double getCompletionRate() { return completionRate; }
    public void setCompletionRate(double completionRate) { this.completionRate = completionRate; }

    public double getTotalFoodOfferedKg() { return totalFoodOfferedKg; }
    public void setTotalFoodOfferedKg(double totalFoodOfferedKg) { this.totalFoodOfferedKg = totalFoodOfferedKg; }

    public double getTotalFoodDistributedKg() { return totalFoodDistributedKg; }
    public void setTotalFoodDistributedKg(double totalFoodDistributedKg) { this.totalFoodDistributedKg = totalFoodDistributedKg; }

    public List<RecentActivityDto> getRecentActivities() { return recentActivities; }
    public void setRecentActivities(List<RecentActivityDto> recentActivities) { this.recentActivities = recentActivities; }

    public String getLastUpdated() { return lastUpdated; }
    public void setLastUpdated(String lastUpdated) { this.lastUpdated = lastUpdated; }
}

package com.foodbridge.backend.analytics.dto;

import com.foodbridge.backend.admin.entity.DonationRecord;
import java.util.ArrayList;
import java.util.List;

public class NGOOverviewDto {
    private PeriodDto period;

    private long newOffersAvailable;
    private long offersAccepted;
    private long upcomingPickups;
    private long pendingDeliveries;
    private long completedPickups;

    private double foodReceivedTodayKg;
    private double dailyCapacityKg;
    private double remainingCapacityKg;
    private double capacityUtilizationRate;

    private List<DonationRecord> recentReceipts = new ArrayList<>();
    private List<TrendPointDto> weeklyTrends = new ArrayList<>();
    private String lastUpdated;

    public NGOOverviewDto() {}

    public PeriodDto getPeriod() { return period; }
    public void setPeriod(PeriodDto period) { this.period = period; }

    public long getNewOffersAvailable() { return newOffersAvailable; }
    public void setNewOffersAvailable(long newOffersAvailable) { this.newOffersAvailable = newOffersAvailable; }

    public long getOffersAccepted() { return offersAccepted; }
    public void setOffersAccepted(long offersAccepted) { this.offersAccepted = offersAccepted; }

    public long getUpcomingPickups() { return upcomingPickups; }
    public void setUpcomingPickups(long upcomingPickups) { this.upcomingPickups = upcomingPickups; }

    public long getPendingDeliveries() { return pendingDeliveries; }
    public void setPendingDeliveries(long pendingDeliveries) { this.pendingDeliveries = pendingDeliveries; }

    public long getCompletedPickups() { return completedPickups; }
    public void setCompletedPickups(long completedPickups) { this.completedPickups = completedPickups; }

    public double getFoodReceivedTodayKg() { return foodReceivedTodayKg; }
    public void setFoodReceivedTodayKg(double foodReceivedTodayKg) { this.foodReceivedTodayKg = foodReceivedTodayKg; }

    public double getDailyCapacityKg() { return dailyCapacityKg; }
    public void setDailyCapacityKg(double dailyCapacityKg) { this.dailyCapacityKg = dailyCapacityKg; }

    public double getRemainingCapacityKg() { return remainingCapacityKg; }
    public void setRemainingCapacityKg(double remainingCapacityKg) { this.remainingCapacityKg = remainingCapacityKg; }

    public double getCapacityUtilizationRate() { return capacityUtilizationRate; }
    public void setCapacityUtilizationRate(double capacityUtilizationRate) { this.capacityUtilizationRate = capacityUtilizationRate; }

    public List<DonationRecord> getRecentReceipts() { return recentReceipts; }
    public void setRecentReceipts(List<DonationRecord> recentReceipts) { this.recentReceipts = recentReceipts; }

    public List<TrendPointDto> getWeeklyTrends() { return weeklyTrends; }
    public void setWeeklyTrends(List<TrendPointDto> weeklyTrends) { this.weeklyTrends = weeklyTrends; }

    public String getLastUpdated() { return lastUpdated; }
    public void setLastUpdated(String lastUpdated) { this.lastUpdated = lastUpdated; }
}

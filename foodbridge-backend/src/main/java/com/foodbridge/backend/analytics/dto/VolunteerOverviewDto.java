package com.foodbridge.backend.analytics.dto;

import com.foodbridge.backend.admin.entity.DeliveryRecord;
import java.util.ArrayList;
import java.util.List;

public class VolunteerOverviewDto {
    private PeriodDto period;

    private long assignedDeliveries;
    private long pickupsAwaitingAction;
    private long deliveriesInProgress;
    private long completedDeliveries;
    private long cancelledTasks;
    private long todayDeliveriesCompleted;
    private double totalKmEstimated;

    private List<DeliveryRecord> recentDeliveries = new ArrayList<>();
    private List<TrendPointDto> weeklyTrends = new ArrayList<>();
    private String lastUpdated;

    public VolunteerOverviewDto() {}

    public PeriodDto getPeriod() { return period; }
    public void setPeriod(PeriodDto period) { this.period = period; }

    public long getAssignedDeliveries() { return assignedDeliveries; }
    public void setAssignedDeliveries(long assignedDeliveries) { this.assignedDeliveries = assignedDeliveries; }

    public long getPickupsAwaitingAction() { return pickupsAwaitingAction; }
    public void setPickupsAwaitingAction(long pickupsAwaitingAction) { this.pickupsAwaitingAction = pickupsAwaitingAction; }

    public long getDeliveriesInProgress() { return deliveriesInProgress; }
    public void setDeliveriesInProgress(long deliveriesInProgress) { this.deliveriesInProgress = deliveriesInProgress; }

    public long getCompletedDeliveries() { return completedDeliveries; }
    public void setCompletedDeliveries(long completedDeliveries) { this.completedDeliveries = completedDeliveries; }

    public long getCancelledTasks() { return cancelledTasks; }
    public void setCancelledTasks(long cancelledTasks) { this.cancelledTasks = cancelledTasks; }

    public long getTodayDeliveriesCompleted() { return todayDeliveriesCompleted; }
    public void setTodayDeliveriesCompleted(long todayDeliveriesCompleted) { this.todayDeliveriesCompleted = todayDeliveriesCompleted; }

    public double getTotalKmEstimated() { return totalKmEstimated; }
    public void setTotalKmEstimated(double totalKmEstimated) { this.totalKmEstimated = totalKmEstimated; }

    public List<DeliveryRecord> getRecentDeliveries() { return recentDeliveries; }
    public void setRecentDeliveries(List<DeliveryRecord> recentDeliveries) { this.recentDeliveries = recentDeliveries; }

    public List<TrendPointDto> getWeeklyTrends() { return weeklyTrends; }
    public void setWeeklyTrends(List<TrendPointDto> weeklyTrends) { this.weeklyTrends = weeklyTrends; }

    public String getLastUpdated() { return lastUpdated; }
    public void setLastUpdated(String lastUpdated) { this.lastUpdated = lastUpdated; }
}

package com.foodbridge.backend.admin.dto;

public class AdminDashboardSummaryDto {
    private long totalUsers;
    private long totalNGOs;
    private long verifiedNGOs;
    private long pendingNGOs;
    private long totalVolunteers;
    private long pendingVolunteers;
    private long totalDonations;
    private long activeDonations;
    private long acceptedDonations;
    private long deliveredDonations;
    private long expiredDonations;
    private long activeDeliveries;
    private double totalFoodDistributedKg;
    private double todayFoodDistributedKg;
    private long todayDonations;
    private long todayDeliveries;
    private double systemMatchingRate;

    public AdminDashboardSummaryDto() {}

    public long getTotalUsers() { return totalUsers; }
    public void setTotalUsers(long totalUsers) { this.totalUsers = totalUsers; }

    public long getTotalNGOs() { return totalNGOs; }
    public void setTotalNGOs(long totalNGOs) { this.totalNGOs = totalNGOs; }

    public long getVerifiedNGOs() { return verifiedNGOs; }
    public void setVerifiedNGOs(long verifiedNGOs) { this.verifiedNGOs = verifiedNGOs; }

    public long getPendingNGOs() { return pendingNGOs; }
    public void setPendingNGOs(long pendingNGOs) { this.pendingNGOs = pendingNGOs; }

    public long getTotalVolunteers() { return totalVolunteers; }
    public void setTotalVolunteers(long totalVolunteers) { this.totalVolunteers = totalVolunteers; }

    public long getPendingVolunteers() { return pendingVolunteers; }
    public void setPendingVolunteers(long pendingVolunteers) { this.pendingVolunteers = pendingVolunteers; }

    public long getTotalDonations() { return totalDonations; }
    public void setTotalDonations(long totalDonations) { this.totalDonations = totalDonations; }

    public long getActiveDonations() { return activeDonations; }
    public void setActiveDonations(long activeDonations) { this.activeDonations = activeDonations; }

    public long getAcceptedDonations() { return acceptedDonations; }
    public void setAcceptedDonations(long acceptedDonations) { this.acceptedDonations = acceptedDonations; }

    public long getDeliveredDonations() { return deliveredDonations; }
    public void setDeliveredDonations(long deliveredDonations) { this.deliveredDonations = deliveredDonations; }

    public long getExpiredDonations() { return expiredDonations; }
    public void setExpiredDonations(long expiredDonations) { this.expiredDonations = expiredDonations; }

    public long getActiveDeliveries() { return activeDeliveries; }
    public void setActiveDeliveries(long activeDeliveries) { this.activeDeliveries = activeDeliveries; }

    public double getTotalFoodDistributedKg() { return totalFoodDistributedKg; }
    public void setTotalFoodDistributedKg(double totalFoodDistributedKg) { this.totalFoodDistributedKg = totalFoodDistributedKg; }

    public double getTodayFoodDistributedKg() { return todayFoodDistributedKg; }
    public void setTodayFoodDistributedKg(double todayFoodDistributedKg) { this.todayFoodDistributedKg = todayFoodDistributedKg; }

    public long getTodayDonations() { return todayDonations; }
    public void setTodayDonations(long todayDonations) { this.todayDonations = todayDonations; }

    public long getTodayDeliveries() { return todayDeliveries; }
    public void setTodayDeliveries(long todayDeliveries) { this.todayDeliveries = todayDeliveries; }

    public double getSystemMatchingRate() { return systemMatchingRate; }
    public void setSystemMatchingRate(double systemMatchingRate) { this.systemMatchingRate = systemMatchingRate; }
}

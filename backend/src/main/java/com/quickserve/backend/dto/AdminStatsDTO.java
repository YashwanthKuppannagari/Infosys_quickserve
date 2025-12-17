package com.quickserve.backend.dto;

public class AdminStatsDTO {
    private long totalUsers;
    private long activeProviders;
    private long recentBookings;

    public AdminStatsDTO(long totalUsers, long activeProviders, long recentBookings) {
        this.totalUsers = totalUsers;
        this.activeProviders = activeProviders;
        this.recentBookings = recentBookings;
    }
    public long getTotalUsers() { return totalUsers; }
    public long getActiveProviders() { return activeProviders; }
    public long getRecentBookings() { return recentBookings; }
}
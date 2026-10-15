package com.foodbridge.backend.auth.dto;

public class RegisterResponse {
    private UserDto user;
    private boolean requiresVerification;

    public RegisterResponse() {}

    public RegisterResponse(UserDto user, boolean requiresVerification) {
        this.user = user;
        this.requiresVerification = requiresVerification;
    }

    public UserDto getUser() { return user; }
    public void setUser(UserDto user) { this.user = user; }

    public boolean isRequiresVerification() { return requiresVerification; }
    public void setRequiresVerification(boolean requiresVerification) { this.requiresVerification = requiresVerification; }
}

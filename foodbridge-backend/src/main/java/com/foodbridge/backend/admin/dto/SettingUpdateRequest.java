package com.foodbridge.backend.admin.dto;

public class SettingUpdateRequest {
    private String value;

    public SettingUpdateRequest() {}

    public SettingUpdateRequest(String value) {
        this.value = value;
    }

    public String getValue() { return value; }
    public void setValue(String value) { this.value = value; }
}

package com.foodbridge.backend.analytics.dto;

import java.time.LocalDate;

public class PeriodDto {
    private LocalDate from;
    private LocalDate to;
    private String timezone;

    public PeriodDto() {}

    public PeriodDto(LocalDate from, LocalDate to, String timezone) {
        this.from = from;
        this.to = to;
        this.timezone = timezone;
    }

    public LocalDate getFrom() { return from; }
    public void setFrom(LocalDate from) { this.from = from; }

    public LocalDate getTo() { return to; }
    public void setTo(LocalDate to) { this.to = to; }

    public String getTimezone() { return timezone; }
    public void setTimezone(String timezone) { this.timezone = timezone; }
}

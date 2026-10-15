package com.foodbridge.backend.admin.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "match_records")
public class MatchRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long donationId;
    private String donationCode;

    private Long ngoId;
    private String ngoName;

    private Double distanceKm;
    private Double searchRadiusKm;

    @Column(nullable = false)
    private String status; // OFFERED, ACCEPTED, REJECTED, EXPIRED, CANCELLED

    private LocalDateTime offeredAt;
    private LocalDateTime respondedAt;

    public MatchRecord() {}

    public MatchRecord(Long donationId, String donationCode, Long ngoId, String ngoName, Double distanceKm, Double searchRadiusKm, String status) {
        this.donationId = donationId;
        this.donationCode = donationCode;
        this.ngoId = ngoId;
        this.ngoName = ngoName;
        this.distanceKm = distanceKm;
        this.searchRadiusKm = searchRadiusKm;
        this.status = status;
        this.offeredAt = LocalDateTime.now();
    }

    @PrePersist
    protected void onCreate() {
        if (offeredAt == null) {
            offeredAt = LocalDateTime.now();
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getDonationId() { return donationId; }
    public void setDonationId(Long donationId) { this.donationId = donationId; }

    public String getDonationCode() { return donationCode; }
    public void setDonationCode(String donationCode) { this.donationCode = donationCode; }

    public Long getNgoId() { return ngoId; }
    public void setNgoId(Long ngoId) { this.ngoId = ngoId; }

    public String getNgoName() { return ngoName; }
    public void setNgoName(String ngoName) { this.ngoName = ngoName; }

    public Double getDistanceKm() { return distanceKm; }
    public void setDistanceKm(Double distanceKm) { this.distanceKm = distanceKm; }

    public Double getSearchRadiusKm() { return searchRadiusKm; }
    public void setSearchRadiusKm(Double searchRadiusKm) { this.searchRadiusKm = searchRadiusKm; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getOfferedAt() { return offeredAt; }
    public void setOfferedAt(LocalDateTime offeredAt) { this.offeredAt = offeredAt; }

    public LocalDateTime getRespondedAt() { return respondedAt; }
    public void setRespondedAt(LocalDateTime respondedAt) { this.respondedAt = respondedAt; }
}

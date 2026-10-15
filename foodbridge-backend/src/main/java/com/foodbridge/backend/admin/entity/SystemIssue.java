package com.foodbridge.backend.admin.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "system_issues")
public class SystemIssue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String category;

    @Column(nullable = false)
    private String title;

    @Column(length = 2000)
    private String description;

    @Column(nullable = false)
    private String status = "OPEN"; // OPEN, UNDER_REVIEW, RESOLVED, DISMISSED

    private String relatedEntityType;
    private String relatedEntityId;

    private String reportedBy;
    private String assignedAdmin;

    @Column(length = 1000)
    private String resolutionNotes;

    private LocalDateTime createdAt;
    private LocalDateTime resolvedAt;

    public SystemIssue() {}

    public SystemIssue(String category, String title, String description, String relatedEntityType, String relatedEntityId, String reportedBy) {
        this.category = category;
        this.title = title;
        this.description = description;
        this.relatedEntityType = relatedEntityType;
        this.relatedEntityId = relatedEntityId;
        this.reportedBy = reportedBy;
        this.status = "OPEN";
        this.createdAt = LocalDateTime.now();
    }

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getRelatedEntityType() { return relatedEntityType; }
    public void setRelatedEntityType(String relatedEntityType) { this.relatedEntityType = relatedEntityType; }

    public String getRelatedEntityId() { return relatedEntityId; }
    public void setRelatedEntityId(String relatedEntityId) { this.relatedEntityId = relatedEntityId; }

    public String getReportedBy() { return reportedBy; }
    public void setReportedBy(String reportedBy) { this.reportedBy = reportedBy; }

    public String getAssignedAdmin() { return assignedAdmin; }
    public void setAssignedAdmin(String assignedAdmin) { this.assignedAdmin = assignedAdmin; }

    public String getResolutionNotes() { return resolutionNotes; }
    public void setResolutionNotes(String resolutionNotes) { this.resolutionNotes = resolutionNotes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getResolvedAt() { return resolvedAt; }
    public void setResolvedAt(LocalDateTime resolvedAt) { this.resolvedAt = resolvedAt; }
}

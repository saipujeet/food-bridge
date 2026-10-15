package com.foodbridge.backend.notification.dto;

import com.foodbridge.backend.notification.entity.Notification;
import com.foodbridge.backend.notification.entity.NotificationPriority;
import com.foodbridge.backend.notification.entity.NotificationType;

import java.time.LocalDateTime;

public class NotificationResponse {
    private Long id;
    private Long userId;
    private NotificationType type;
    private String title;
    private String message;
    private NotificationPriority priority;
    private String referenceType;
    private Long referenceId;
    private boolean isRead;
    private LocalDateTime createdAt;
    private LocalDateTime readAt;

    public NotificationResponse() {}

    public NotificationResponse(Long id, Long userId, NotificationType type, String title, String message, NotificationPriority priority, String referenceType, Long referenceId, boolean isRead, LocalDateTime createdAt, LocalDateTime readAt) {
        this.id = id;
        this.userId = userId;
        this.type = type;
        this.title = title;
        this.message = message;
        this.priority = priority;
        this.referenceType = referenceType;
        this.referenceId = referenceId;
        this.isRead = isRead;
        this.createdAt = createdAt;
        this.readAt = readAt;
    }

    public static NotificationResponse fromEntity(Notification entity) {
        return new NotificationResponse(
                entity.getId(),
                entity.getUser().getId(),
                entity.getType(),
                entity.getTitle(),
                entity.getMessage(),
                entity.getPriority(),
                entity.getReferenceType(),
                entity.getReferenceId(),
                entity.isRead(),
                entity.getCreatedAt(),
                entity.getReadAt()
        );
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public NotificationType getType() { return type; }
    public void setType(NotificationType type) { this.type = type; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public NotificationPriority getPriority() { return priority; }
    public void setPriority(NotificationPriority priority) { this.priority = priority; }

    public String getReferenceType() { return referenceType; }
    public void setReferenceType(String referenceType) { this.referenceType = referenceType; }

    public Long getReferenceId() { return referenceId; }
    public void setReferenceId(Long referenceId) { this.referenceId = referenceId; }

    public boolean isRead() { return isRead; }
    public void setRead(boolean read) { isRead = read; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getReadAt() { return readAt; }
    public void setReadAt(LocalDateTime readAt) { this.readAt = readAt; }
}

package com.foodbridge.backend.notification.service;

import com.foodbridge.backend.notification.dto.NotificationResponse;
import com.foodbridge.backend.notification.entity.Notification;
import com.foodbridge.backend.notification.entity.NotificationPreference;
import com.foodbridge.backend.notification.entity.NotificationPriority;
import com.foodbridge.backend.notification.entity.NotificationType;
import com.foodbridge.backend.notification.repository.NotificationPreferenceRepository;
import com.foodbridge.backend.notification.repository.NotificationRepository;
import com.foodbridge.backend.user.User;
import com.foodbridge.backend.user.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

    private final NotificationRepository notificationRepository;
    private final NotificationPreferenceRepository preferenceRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public NotificationService(NotificationRepository notificationRepository,
                               NotificationPreferenceRepository preferenceRepository,
                               UserRepository userRepository,
                               SimpMessagingTemplate messagingTemplate) {
        this.notificationRepository = notificationRepository;
        this.preferenceRepository = preferenceRepository;
        this.userRepository = userRepository;
        this.messagingTemplate = messagingTemplate;
    }

    @Transactional
    public NotificationResponse createAndSendNotification(
            Long userId,
            NotificationType type,
            String title,
            String message,
            NotificationPriority priority,
            String referenceType,
            Long referenceId
    ) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            log.warn("Cannot create notification. User not found: {}", userId);
            return null;
        }

        // Check user preferences if available
        NotificationPreference preference = preferenceRepository.findByUserId(userId).orElse(null);
        if (preference != null && !preference.isInAppEnabled()) {
            log.info("In-app notifications disabled for user: {}", userId);
            return null;
        }

        // Check category preferences
        if (preference != null) {
            if (isDonationCategory(type) && !preference.isDonationUpdates()) return null;
            if (isMatchingCategory(type) && !preference.isMatchingUpdates()) return null;
            if (isDeliveryCategory(type) && !preference.isDeliveryUpdates()) return null;
            if (isSystemCategory(type) && !preference.isSystemUpdates()) return null;
        }

        // Prevent Duplicate Notifications for the same business event
        if (referenceType != null && referenceId != null) {
            boolean duplicateExists = notificationRepository.existsByUserIdAndTypeAndReferenceTypeAndReferenceId(
                    userId, type, referenceType, referenceId
            );
            if (duplicateExists) {
                log.info("Duplicate notification suppressed for user {} and refId {}", userId, referenceId);
                return null;
            }
        }

        Notification notification = new Notification(
                user,
                type,
                title,
                message,
                priority != null ? priority : NotificationPriority.NORMAL,
                referenceType,
                referenceId
        );

        Notification saved = notificationRepository.save(notification);
        NotificationResponse response = NotificationResponse.fromEntity(saved);

        // Real-Time Delivery via WebSocket
        try {
            messagingTemplate.convertAndSendToUser(userId.toString(), "/queue/notifications", response);
            messagingTemplate.convertAndSend("/topic/notifications/" + userId, response);
            log.info("WebSocket notification sent to user {}: {}", userId, title);
        } catch (Exception e) {
            log.error("Failed to send WebSocket message to user {}. Notification remains saved in DB.", userId, e);
        }

        return response;
    }

    @Transactional(readOnly = true)
    public Page<NotificationResponse> getUserNotifications(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return notificationRepository.findByUserId(userId, pageable).map(NotificationResponse::fromEntity);
    }

    @Transactional(readOnly = true)
    public Page<NotificationResponse> getUnreadNotifications(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return notificationRepository.findByUserIdAndIsRead(userId, false, pageable).map(NotificationResponse::fromEntity);
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Transactional
    public NotificationResponse markAsRead(Long userId, Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found with ID: " + notificationId));

        if (!notification.getUser().getId().equals(userId)) {
            throw new SecurityException("User not authorized to access notification ID: " + notificationId);
        }

        if (!notification.isRead()) {
            notification.setRead(true);
            notification.setReadAt(LocalDateTime.now());
            notificationRepository.save(notification);
        }

        return NotificationResponse.fromEntity(notification);
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        notificationRepository.markAllAsReadForUser(userId, LocalDateTime.now());
    }

    @Transactional
    public void deleteNotification(Long userId, Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found with ID: " + notificationId));

        if (!notification.getUser().getId().equals(userId)) {
            throw new SecurityException("User not authorized to delete notification ID: " + notificationId);
        }

        notificationRepository.delete(notification);
    }

    private boolean isDonationCategory(NotificationType type) {
        return type == NotificationType.DONATION_CREATED ||
               type == NotificationType.DONATION_ACCEPTED ||
               type == NotificationType.DONATION_EXPIRED ||
               type == NotificationType.DONATION_CANCELLED;
    }

    private boolean isMatchingCategory(NotificationType type) {
        return type == NotificationType.MATCH_FOUND ||
               type == NotificationType.MATCH_RADIUS_EXPANDED ||
               type == NotificationType.DONATION_REJECTED;
    }

    private boolean isDeliveryCategory(NotificationType type) {
        return type == NotificationType.VOLUNTEER_ASSIGNED ||
               type == NotificationType.DELIVERY_ACCEPTED ||
               type == NotificationType.PICKUP_PENDING ||
               type == NotificationType.FOOD_PICKED_UP ||
               type == NotificationType.DELIVERY_STARTED ||
               type == NotificationType.DELIVERY_COMPLETED;
    }

    private boolean isSystemCategory(NotificationType type) {
        return type == NotificationType.NGO_VERIFICATION ||
               type == NotificationType.VOLUNTEER_VERIFICATION ||
               type == NotificationType.SYSTEM_ALERT;
    }
}

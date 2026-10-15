package com.foodbridge.backend;

import com.foodbridge.backend.notification.dto.NotificationResponse;
import com.foodbridge.backend.notification.entity.NotificationPriority;
import com.foodbridge.backend.notification.entity.NotificationType;
import com.foodbridge.backend.notification.service.NotificationService;
import com.foodbridge.backend.user.Role;
import com.foodbridge.backend.user.User;
import com.foodbridge.backend.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
public class NotificationServiceTest {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private UserRepository userRepository;

    private User testUser;

    @BeforeEach
    public void setup() {
        testUser = userRepository.save(new User(
                "Test Donor",
                "testdonor@foodbridge.org",
                "pass123",
                Role.DONOR,
                "+1234567890"
        ));
    }

    @Test
    public void testCreateNotificationAndUnreadCount() {
        NotificationResponse response = notificationService.createAndSendNotification(
                testUser.getId(),
                NotificationType.DONATION_CREATED,
                "Test Donation Created",
                "Your donation has been created.",
                NotificationPriority.NORMAL,
                "DONATION",
                101L
        );

        assertNotNull(response);
        assertEquals("Test Donation Created", response.getTitle());
        assertFalse(response.isRead());

        long unreadCount = notificationService.getUnreadCount(testUser.getId());
        assertEquals(1, unreadCount);
    }

    @Test
    public void testMarkAsReadAndMarkAllAsRead() {
        NotificationResponse n1 = notificationService.createAndSendNotification(
                testUser.getId(),
                NotificationType.DONATION_ACCEPTED,
                "Accepted",
                "Donation accepted",
                NotificationPriority.HIGH,
                "DONATION",
                102L
        );

        NotificationResponse n2 = notificationService.createAndSendNotification(
                testUser.getId(),
                NotificationType.FOOD_PICKED_UP,
                "Picked Up",
                "Food picked up",
                NotificationPriority.NORMAL,
                "DELIVERY",
                501L
        );

        assertEquals(2, notificationService.getUnreadCount(testUser.getId()));

        // Mark one as read
        notificationService.markAsRead(testUser.getId(), n1.getId());
        assertEquals(1, notificationService.getUnreadCount(testUser.getId()));

        // Mark all as read
        notificationService.markAllAsRead(testUser.getId());
        assertEquals(0, notificationService.getUnreadCount(testUser.getId()));
    }

    @Test
    public void testDuplicateNotificationPrevention() {
        NotificationResponse first = notificationService.createAndSendNotification(
                testUser.getId(),
                NotificationType.DONATION_EXPIRED,
                "Donation Expired",
                "Expired notice",
                NotificationPriority.URGENT,
                "DONATION",
                999L
        );

        assertNotNull(first);

        // Attempting duplicate creation for same user, type, refType, and refId
        NotificationResponse duplicate = notificationService.createAndSendNotification(
                testUser.getId(),
                NotificationType.DONATION_EXPIRED,
                "Donation Expired",
                "Expired notice",
                NotificationPriority.URGENT,
                "DONATION",
                999L
        );

        assertNull(duplicate, "Duplicate notification should be suppressed");
        assertEquals(1, notificationService.getUnreadCount(testUser.getId()));
    }
}

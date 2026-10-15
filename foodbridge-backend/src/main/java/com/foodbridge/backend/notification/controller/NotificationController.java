package com.foodbridge.backend.notification.controller;

import com.foodbridge.backend.notification.dto.NotificationPreferenceDto;
import com.foodbridge.backend.notification.dto.NotificationResponse;
import com.foodbridge.backend.notification.dto.UnreadCountResponse;
import com.foodbridge.backend.notification.service.NotificationPreferenceService;
import com.foodbridge.backend.notification.service.NotificationService;
import com.foodbridge.backend.user.User;
import com.foodbridge.backend.user.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {

    private final NotificationService notificationService;
    private final NotificationPreferenceService preferenceService;
    private final UserRepository userRepository;

    public NotificationController(NotificationService notificationService, NotificationPreferenceService preferenceService, UserRepository userRepository) {
        this.notificationService = notificationService;
        this.preferenceService = preferenceService;
        this.userRepository = userRepository;
    }

    private Long getAuthenticatedUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            // Development fallback user ID if unauthenticated (e.g. User ID 1)
            return 1L;
        }
        String email = auth.getName();
        return userRepository.findByEmail(email)
                .map(User::getId)
                .orElse(1L);
    }

    @GetMapping
    public ResponseEntity<Page<NotificationResponse>> getNotifications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "false") boolean unreadOnly
    ) {
        Long userId = getAuthenticatedUserId();
        Page<NotificationResponse> notifications = unreadOnly
                ? notificationService.getUnreadNotifications(userId, page, size)
                : notificationService.getUserNotifications(userId, page, size);
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/unread-count")
    public ResponseEntity<UnreadCountResponse> getUnreadCount() {
        Long userId = getAuthenticatedUserId();
        long count = notificationService.getUnreadCount(userId);
        return ResponseEntity.ok(new UnreadCountResponse(count));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<NotificationResponse> markAsRead(@PathVariable Long id) {
        Long userId = getAuthenticatedUserId();
        NotificationResponse response = notificationService.markAsRead(userId, id);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead() {
        Long userId = getAuthenticatedUserId();
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotification(@PathVariable Long id) {
        Long userId = getAuthenticatedUserId();
        notificationService.deleteNotification(userId, id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/preferences")
    public ResponseEntity<NotificationPreferenceDto> getPreferences() {
        Long userId = getAuthenticatedUserId();
        NotificationPreferenceDto preferences = preferenceService.getPreferences(userId);
        return ResponseEntity.ok(preferences);
    }

    @PutMapping("/preferences")
    public ResponseEntity<NotificationPreferenceDto> updatePreferences(
            @RequestBody NotificationPreferenceDto dto
    ) {
        Long userId = getAuthenticatedUserId();
        NotificationPreferenceDto updated = preferenceService.updatePreferences(userId, dto);
        return ResponseEntity.ok(updated);
    }
}

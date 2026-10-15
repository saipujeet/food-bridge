package com.foodbridge.backend.notification.repository;

import com.foodbridge.backend.notification.entity.Notification;
import com.foodbridge.backend.notification.entity.NotificationType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    Page<Notification> findByUserId(Long userId, Pageable pageable);

    Page<Notification> findByUserIdAndIsRead(Long userId, boolean isRead, Pageable pageable);

    long countByUserIdAndIsReadFalse(Long userId);

    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true, n.readAt = :readAt WHERE n.user.id = :userId AND n.isRead = false")
    int markAllAsReadForUser(@Param("userId") Long userId, @Param("readAt") LocalDateTime readAt);

    boolean existsByUserIdAndTypeAndReferenceTypeAndReferenceId(
            Long userId, NotificationType type, String referenceType, Long referenceId
    );
}

package com.foodbridge.backend.admin.repository;

import com.foodbridge.backend.admin.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    Page<AuditLog> findAllByOrderByCreatedAtDesc(Pageable pageable);
    List<AuditLog> findTop15ByOrderByCreatedAtDesc();
    List<AuditLog> findByEntityType(String entityType);
    List<AuditLog> findByAction(String action);

    @org.springframework.data.jpa.repository.Query("SELECT a FROM AuditLog a WHERE " +
           "(:entityType IS NULL OR a.entityType = :entityType) AND " +
           "(:action IS NULL OR a.action = :action) AND " +
           "(:actorRole IS NULL OR a.actorRole = :actorRole) AND " +
           "(:search IS NULL OR LOWER(a.actorAdminEmail) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(a.action) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(a.entityId) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(a.reason) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:fromTime IS NULL OR a.createdAt >= :fromTime) AND " +
           "(:toTime IS NULL OR a.createdAt <= :toTime) " +
           "ORDER BY a.createdAt DESC, a.id DESC")
    Page<AuditLog> filterAuditLogs(
            @org.springframework.data.repository.query.Param("entityType") String entityType,
            @org.springframework.data.repository.query.Param("action") String action,
            @org.springframework.data.repository.query.Param("actorRole") String actorRole,
            @org.springframework.data.repository.query.Param("search") String search,
            @org.springframework.data.repository.query.Param("fromTime") java.time.LocalDateTime fromTime,
            @org.springframework.data.repository.query.Param("toTime") java.time.LocalDateTime toTime,
            Pageable pageable
    );
}

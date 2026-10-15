package com.foodbridge.backend.admin.repository;

import com.foodbridge.backend.admin.entity.DeliveryRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface DeliveryRecordRepository extends JpaRepository<DeliveryRecord, Long> {
    Optional<DeliveryRecord> findByDeliveryCode(String deliveryCode);
    List<DeliveryRecord> findAllByOrderByCreatedAtDesc();
    List<DeliveryRecord> findByStatus(String status);
    List<DeliveryRecord> findByVolunteerId(Long volunteerId);
    List<DeliveryRecord> findByVolunteerIdOrderByCreatedAtDesc(Long volunteerId);
    List<DeliveryRecord> findByCreatedAtBetween(LocalDateTime from, LocalDateTime to);
    List<DeliveryRecord> findByVolunteerIdAndCreatedAtBetween(Long volunteerId, LocalDateTime from, LocalDateTime to);
    long countByStatus(String status);
    long countByVolunteerId(Long volunteerId);
    long countByVolunteerIdAndStatus(Long volunteerId, String status);
}

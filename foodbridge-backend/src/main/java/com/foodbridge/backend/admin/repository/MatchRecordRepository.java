package com.foodbridge.backend.admin.repository;

import com.foodbridge.backend.admin.entity.MatchRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MatchRecordRepository extends JpaRepository<MatchRecord, Long> {
    List<MatchRecord> findAllByOrderByOfferedAtDesc();
    List<MatchRecord> findByDonationId(Long donationId);
    List<MatchRecord> findByNgoId(Long ngoId);
    List<MatchRecord> findByStatus(String status);
}

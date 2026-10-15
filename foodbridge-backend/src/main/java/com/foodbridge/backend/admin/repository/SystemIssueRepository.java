package com.foodbridge.backend.admin.repository;

import com.foodbridge.backend.admin.entity.SystemIssue;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SystemIssueRepository extends JpaRepository<SystemIssue, Long> {
    List<SystemIssue> findAllByOrderByCreatedAtDesc();
    List<SystemIssue> findByStatus(String status);
    List<SystemIssue> findByCategory(String category);
    long countByStatus(String status);
}

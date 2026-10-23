package com.trustvault.repository;

import com.trustvault.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    List<AuditLog> findTop100ByOrderByTimestampDesc();

    List<AuditLog> findByUserEmailIgnoreCaseOrderByTimestampDesc(String userEmail);
}

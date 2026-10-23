package com.trustvault.repository;

import com.trustvault.DocumentPermission;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DocumentPermissionRepository extends JpaRepository<DocumentPermission, Long> {

    List<DocumentPermission> findByViewerEmailIgnoreCase(String viewerEmail);

    List<DocumentPermission> findByDocumentId(Long documentId);

    Optional<DocumentPermission> findByDocumentIdAndViewerEmailIgnoreCase(Long documentId, String viewerEmail);

    List<DocumentPermission> findByViewerEmailIgnoreCaseAndStatus(String viewerEmail, String status);
}

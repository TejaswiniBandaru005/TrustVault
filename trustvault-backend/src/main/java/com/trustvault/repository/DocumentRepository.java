package com.trustvault.repository;

import com.trustvault.Document;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DocumentRepository extends JpaRepository<Document, Long> {

    List<Document> findByOwnerEmailIgnoreCaseOrderByUpdatedAtDesc(String ownerEmail);

    List<Document> findAllByOrderByUpdatedAtDesc();

    long countByOwnerEmailIgnoreCase(String ownerEmail);
}

package com.trustvault.repository;

import com.trustvault.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface DocumentRepository extends JpaRepository<Document, Long> {

    List<Document> findByOwnerEmailIgnoreCaseOrderByUpdatedAtDesc(String ownerEmail);

    @Query("SELECT d FROM Document d WHERE LOWER(d.ownerEmail) = LOWER(:email) AND (d.deleted IS NULL OR d.deleted = false) ORDER BY d.updatedAt DESC")
    List<Document> findActiveOwnerDocuments(@Param("email") String email);

    @Query("SELECT d FROM Document d WHERE LOWER(d.ownerEmail) = LOWER(:email) AND d.deleted = true ORDER BY d.deletedAt DESC")
    List<Document> findDeletedOwnerDocuments(@Param("email") String email);

    List<Document> findAllByOrderByUpdatedAtDesc();

    @Query("SELECT d FROM Document d WHERE (d.deleted IS NULL OR d.deleted = false) ORDER BY d.updatedAt DESC")
    List<Document> findActiveCatalogDocuments();

    @Query("SELECT d FROM Document d WHERE d.deleted = true ORDER BY d.deletedAt DESC")
    List<Document> findAllDeletedDocuments();

    long countByOwnerEmailIgnoreCase(String ownerEmail);
}

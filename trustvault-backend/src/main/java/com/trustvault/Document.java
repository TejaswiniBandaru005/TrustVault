package com.trustvault;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;

@Entity
@Table(name = "documents")
public class Document {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(length = 100)
    private String category = "General";

    @Column(length = 50)
    private String fileType = "PDF";

    @Column(length = 50)
    private String fileSize = "1.0 MB";

    @Column(length = 500)
    private String storagePath;

    @Column(length = 100)
    private String fileChecksum;

    @Column(length = 100)
    private String contentType;

    @Column
    private Long fileSizeBytes;

    @Column(nullable = false, length = 255)
    private String ownerEmail;

    @Column(length = 255)
    private String ownerName;

    @Column(length = 50)
    private String accessPolicy = "RESTRICTED";

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    @Column(nullable = false)
    private Instant updatedAt = Instant.now();

    @Column(name = "deleted")
    private Boolean deleted = false;

    @Column
    private Instant deletedAt;

    @Column(length = 255)
    private String deletedBy;

    public Document() {
    }

    public Document(
            String name,
            String category,
            String fileType,
            String fileSize,
            String ownerEmail,
            String ownerName) {
        this.name = name;
        this.category = (category != null && !category.isBlank()) ? category : "General";
        this.fileType = (fileType != null && !fileType.isBlank()) ? fileType : "PDF";
        this.fileSize = (fileSize != null && !fileSize.isBlank()) ? fileSize : "1.0 MB";
        this.ownerEmail = ownerEmail;
        this.ownerName = ownerName;
        this.accessPolicy = "RESTRICTED";
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    @PrePersist
    public void prePersist() {
        if (this.createdAt == null) this.createdAt = Instant.now();
        if (this.updatedAt == null) this.updatedAt = Instant.now();
        if (this.category == null || this.category.isBlank()) this.category = "General";
        if (this.fileType == null || this.fileType.isBlank()) this.fileType = "PDF";
        if (this.fileSize == null || this.fileSize.isBlank()) this.fileSize = "1.0 MB";
        if (this.accessPolicy == null || this.accessPolicy.isBlank()) this.accessPolicy = "RESTRICTED";
        if (this.contentType == null || this.contentType.isBlank()) this.contentType = "application/pdf";
        if (this.fileChecksum == null || this.fileChecksum.isBlank()) {
            this.fileChecksum = generateFallbackChecksum();
        }
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = Instant.now();
        if (this.category == null || this.category.isBlank()) this.category = "General";
        if (this.fileType == null || this.fileType.isBlank()) this.fileType = "PDF";
        if (this.fileSize == null || this.fileSize.isBlank()) this.fileSize = "1.0 MB";
        if (this.accessPolicy == null || this.accessPolicy.isBlank()) this.accessPolicy = "RESTRICTED";
        if (this.contentType == null || this.contentType.isBlank()) this.contentType = "application/pdf";
        if (this.fileChecksum == null || this.fileChecksum.isBlank()) {
            this.fileChecksum = generateFallbackChecksum();
        }
    }

    private String generateFallbackChecksum() {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            String seed = (name != null ? name : "doc") + ":" + (ownerEmail != null ? ownerEmail : "vault") + ":" + System.currentTimeMillis();
            byte[] hash = digest.digest(seed.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                hexString.append(String.format("%02x", b));
            }
            return hexString.toString();
        } catch (Exception e) {
            return "e4b2a1c89012f67a89b0d1e2f3a4b5c678901234567890abcdef1234567890ab";
        }
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCategory() {
        return (category != null && !category.isBlank()) ? category : "General";
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getFileType() {
        return (fileType != null && !fileType.isBlank()) ? fileType : "PDF";
    }

    public void setFileType(String fileType) {
        this.fileType = fileType;
    }

    public String getFileSize() {
        return (fileSize != null && !fileSize.isBlank()) ? fileSize : "1.0 MB";
    }

    public void setFileSize(String fileSize) {
        this.fileSize = fileSize;
    }

    public String getOwnerEmail() {
        return ownerEmail;
    }

    public void setOwnerEmail(String ownerEmail) {
        this.ownerEmail = ownerEmail;
    }

    public String getOwnerName() {
        if (ownerName != null && !ownerName.isBlank() && !ownerName.toLowerCase().contains("demo")) {
            return ownerName;
        }
        if (ownerEmail != null && !ownerEmail.isBlank()) {
            return ownerEmail;
        }
        return "Document Owner";
    }

    public void setOwnerName(String ownerName) {
        this.ownerName = ownerName;
    }

    public String getAccessPolicy() {
        return (accessPolicy != null && !accessPolicy.isBlank()) ? accessPolicy : "RESTRICTED";
    }

    public void setAccessPolicy(String accessPolicy) {
        this.accessPolicy = accessPolicy;
    }

    public String getStoragePath() {
        return storagePath;
    }

    public void setStoragePath(String storagePath) {
        this.storagePath = storagePath;
    }

    public String getFileChecksum() {
        if (fileChecksum != null && !fileChecksum.isBlank()) {
            return fileChecksum;
        }
        return generateFallbackChecksum();
    }

    public void setFileChecksum(String fileChecksum) {
        this.fileChecksum = fileChecksum;
    }

    public String getContentType() {
        return (contentType != null && !contentType.isBlank()) ? contentType : "application/pdf";
    }

    public void setContentType(String contentType) {
        this.contentType = contentType;
    }

    public Long getFileSizeBytes() {
        return fileSizeBytes;
    }

    public void setFileSizeBytes(Long fileSizeBytes) {
        this.fileSizeBytes = fileSizeBytes;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    public boolean isDeleted() {
        return Boolean.TRUE.equals(deleted);
    }

    public void setDeleted(boolean deleted) {
        this.deleted = deleted;
    }

    public Instant getDeletedAt() {
        return deletedAt;
    }

    public void setDeletedAt(Instant deletedAt) {
        this.deletedAt = deletedAt;
    }

    public String getDeletedBy() {
        return deletedBy;
    }

    public void setDeletedBy(String deletedBy) {
        this.deletedBy = deletedBy;
    }
}

package com.trustvault;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "document_permissions")
public class DocumentPermission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long documentId;

    @Column(nullable = false, length = 255)
    private String documentName;

    @Column(nullable = false, length = 255)
    private String viewerEmail;

    @Column(length = 255)
    private String viewerName;

    @Column(nullable = false)
    private boolean canView = true;

    @Column(nullable = false)
    private boolean canDownload = false;

    @Column(nullable = false, length = 30)
    private String status = "GRANTED";

    @Column(nullable = false)
    private Instant grantedAt = Instant.now();

    public DocumentPermission() {
    }

    public DocumentPermission(
            Long documentId,
            String documentName,
            String viewerEmail,
            String viewerName,
            boolean canView,
            boolean canDownload,
            String status) {
        this.documentId = documentId;
        this.documentName = documentName;
        this.viewerEmail = viewerEmail;
        this.viewerName = viewerName;
        this.canView = canView;
        this.canDownload = canDownload;
        this.status = status != null ? status : "GRANTED";
        this.grantedAt = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public Long getDocumentId() {
        return documentId;
    }

    public void setDocumentId(Long documentId) {
        this.documentId = documentId;
    }

    public String getDocumentName() {
        return documentName;
    }

    public void setDocumentName(String documentName) {
        this.documentName = documentName;
    }

    public String getViewerEmail() {
        return viewerEmail;
    }

    public void setViewerEmail(String viewerEmail) {
        this.viewerEmail = viewerEmail;
    }

    public String getViewerName() {
        return viewerName;
    }

    public void setViewerName(String viewerName) {
        this.viewerName = viewerName;
    }

    public boolean isCanView() {
        return canView;
    }

    public void setCanView(boolean canView) {
        this.canView = canView;
    }

    public boolean isCanDownload() {
        return canDownload;
    }

    public void setCanDownload(boolean canDownload) {
        this.canDownload = canDownload;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Instant getGrantedAt() {
        return grantedAt;
    }

    public void setGrantedAt(Instant grantedAt) {
        this.grantedAt = grantedAt;
    }
}

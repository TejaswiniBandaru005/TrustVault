package com.trustvault;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "audit_logs")
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String action;

    @Column(length = 255)
    private String userEmail;

    @Column(length = 50)
    private String userCode;

    @Column(length = 50)
    private String role;

    @Column(length = 500)
    private String detail;

    @Column(length = 50)
    private String status = "SUCCESS";

    @Column(nullable = false)
    private Instant timestamp = Instant.now();

    public AuditLog() {
    }

    public AuditLog(
            String action,
            String userEmail,
            String userCode,
            String role,
            String detail,
            String status) {
        this.action = action;
        this.userEmail = userEmail;
        this.userCode = userCode;
        this.role = role;
        this.detail = detail;
        this.status = status != null ? status : "SUCCESS";
        this.timestamp = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public String getUserCode() {
        return userCode;
    }

    public void setUserCode(String userCode) {
        this.userCode = userCode;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getDetail() {
        return detail;
    }

    public void setDetail(String detail) {
        this.detail = detail;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Instant timestamp) {
        this.timestamp = timestamp;
    }
}

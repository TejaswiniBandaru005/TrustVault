package com.trustvault;

import com.trustvault.repository.AuditLogRepository;
import com.trustvault.repository.DocumentRepository;
import com.trustvault.repository.UserRepository;
import com.trustvault.user.Role;
import com.trustvault.user.User;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.Optional;

@Configuration
public class AdminSeeder {

    @Bean
    CommandLineRunner createDefaultAdmin(
            UserRepository userRepository,
            DocumentRepository documentRepository,
            AuditLogRepository auditLogRepository,
            PasswordEncoder passwordEncoder,
            JdbcTemplate jdbcTemplate,
            @Value("${app.admin.email:admin123@gmail.com}") String adminEmail,
            @Value("${app.admin.password:admin@123}") String adminPassword) {

        return args -> {
            syncIdSequence(jdbcTemplate);
            cleanLegacyData(jdbcTemplate);

            // Seed only the System Administrator account
            seedUser(
                    userRepository,
                    passwordEncoder,
                    adminEmail,
                    adminPassword,
                    Role.ADMIN,
                    "System Administrator",
                    "TV-USR-0001"
            );

            // Seed Day 1 to Day 7 Authentic Engineering Progress Reports
            seedDayReports(documentRepository, auditLogRepository, adminEmail);

            syncIdSequence(jdbcTemplate);
        };
    }

    private void cleanLegacyData(JdbcTemplate jdbcTemplate) {
        try {
            // Remove old template demo users so user list starts fresh
            jdbcTemplate.update("DELETE FROM app_users WHERE LOWER(email) IN (" +
                    "'owner1@example.com', 'viewer1@example.com', 'olivia@example.com', " +
                    "'jordan@example.com', 'alex@example.com', 'taylor@example.com', " +
                    "'morgan@example.com', 'casey@example.com', 'riley@example.com')");

            // Remove legacy mock template documents
            jdbcTemplate.update("DELETE FROM documents WHERE name LIKE '%Employee Handbook%' " +
                    "OR name LIKE '%Q4 Financial%' OR name LIKE '%Project Roadmap%' " +
                    "OR name LIKE '%2.1.pdf%' OR name LIKE '%2.2.pdf%'");

            System.out.println("[TrustVault] Legacy mock users and template files purged.");
        } catch (Exception e) {
            System.err.println("[TrustVault] Legacy data cleanup notice: " + e.getMessage());
        }
    }

    private void seedDayReports(
            DocumentRepository documentRepository,
            AuditLogRepository auditLogRepository,
            String adminEmail) {

        String[][] reports = {
            {
                "Day 01 - Architecture and Zero-Trust Foundations.pdf",
                "Architecture",
                "1.2 MB",
                "2026-10-19T09:30:00Z",
                "Day 1 Engineering Report: Problem statement analysis, Zero-Trust architectural axioms (explicit verification, least privilege, assumed breach), triple-tier role clearance definitions (Admin, Owner, Viewer), and enclave protocol boundary design."
            },
            {
                "Day 02 - Security Threat Modeling & STRIDE Matrix.pdf",
                "Security",
                "1.8 MB",
                "2026-10-20T11:15:00Z",
                "Day 2 Engineering Report: STRIDE threat modeling & DREAD risk assessment matrix. Identified attack surfaces including cross-tenant IDOR, token interception, and file tampering. Designed SHA-256 cryptographic integrity verification."
            },
            {
                "Day 03 - Cryptographic Hashing & Storage Engine.pdf",
                "Cryptography",
                "2.1 MB",
                "2026-10-21T14:20:00Z",
                "Day 3 Engineering Report: Implementation of SHA-256 digest computation pipeline, Neon AWS Serverless PostgreSQL distributed connection pooling, immutable audit ledger schema, and initial Git repository scaffolding."
            },
            {
                "Day 04 - Multi-Factor Authentication & OTP Engine.pdf",
                "Authentication",
                "1.6 MB",
                "2026-10-22T16:45:00Z",
                "Day 4 Engineering Report: Spring Security 6 stateless filter chain, 6-digit cryptographic OTP generation with purpose-email binding (Login vs Reset), rate-limited 30s cooldown timer, and role switcher architecture."
            },
            {
                "Day 05 - Vercel & Render Cloud Infrastructure.pdf",
                "DevOps",
                "2.4 MB",
                "2026-10-23T10:00:00Z",
                "Day 5 Engineering Report: Distributed multi-cloud deployment on Vercel Global Edge CDN (Frontend SPA) and Render Cloud Web Service (Spring Boot 3 API). Solved Vite Linux build exit 126, SPA rewrites, and CORS headers."
            },
            {
                "Day 06 - Enclave Soft-Delete & Access Gating.pdf",
                "Governance",
                "1.9 MB",
                "2026-10-24T18:30:00Z",
                "Day 6 Engineering Report: Segregated soft-deletion preservation enclave with instant restoration, unverified user sandboxed preview isolation gate (PENDING_APPROVAL), and instant account revocation protocol."
            },
            {
                "Day 07 - Autocomplete Delegation & Security Hardening.pdf",
                "Security",
                "2.3 MB",
                "2026-10-25T01:00:00Z",
                "Day 7 Engineering Report: Real-time viewer autocomplete delegation with starting-letter prefix matching, dynamic owner attribution sanitization, dynamic $PORT containerization for Render, and automated unit test suite."
            }
        };

        for (String[] r : reports) {
            String name = r[0];
            String category = r[1];
            String size = r[2];
            Instant timestamp = Instant.parse(r[3]);
            String summary = r[4];

            Optional<Document> existing = documentRepository.findByNameIgnoreCase(name);
            if (existing.isEmpty()) {
                String checksum = computeSha256(summary);
                Document doc = new Document(
                        name,
                        category,
                        "PDF",
                        size,
                        adminEmail,
                        "System Administrator"
                );
                doc.setCreatedAt(timestamp);
                doc.setUpdatedAt(timestamp);
                doc.setFileChecksum(checksum);
                doc.setContentType("application/pdf");
                doc.setFileSizeBytes(1024L * 1024L);

                Document saved = documentRepository.save(doc);

                auditLogRepository.save(new AuditLog(
                        "DOC_UPLOADED",
                        adminEmail,
                        "TV-USR-0001",
                        "ADMIN",
                        "Uploaded daily engineering milestone: " + saved.getName() + " (Date: " + r[3].substring(0, 10) + ")",
                        "SUCCESS"
                ));
                System.out.println("[TrustVault] Ingested: " + saved.getName());
            }
        }
    }

    private String computeSha256(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder();
            for (byte b : hash) {
                hex.append(String.format("%02x", b));
            }
            return hex.toString();
        } catch (Exception e) {
            return "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
        }
    }

    private void syncIdSequence(JdbcTemplate jdbcTemplate) {
        try {
            jdbcTemplate.execute(
                "SELECT setval(pg_get_serial_sequence('app_users', 'id'), COALESCE((SELECT MAX(id) FROM app_users), 0) + 1, false)"
            );
            System.out.println("[TrustVault] Database id sequence synchronized.");
        } catch (Exception e) {
            System.err.println("[TrustVault] Sequence sync notice: " + e.getMessage());
        }
    }

    private void seedUser(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            String email,
            String password,
            Role role,
            String fullName,
            String defaultUserCode) {

        String cleanEmail = (email == null || email.isBlank())
                ? "admin123@gmail.com"
                : email.trim().toLowerCase();

        String cleanPassword = (password == null || password.isBlank())
                ? "admin@123"
                : password.trim();

        var existingUser = userRepository.findByEmailIgnoreCase(cleanEmail);

        if (existingUser.isPresent()) {
            User user = existingUser.get();
            user.setStatus("APPROVED");
            if (!passwordEncoder.matches(cleanPassword, user.getPassword())) {
                user.setPassword(passwordEncoder.encode(cleanPassword));
                System.out.println("[TrustVault] Password updated for account: " + cleanEmail);
            }
            if (user.getUserCode() == null || user.getUserCode().isBlank()) {
                user.setUserCode(defaultUserCode);
            }
            user.setFullName(fullName);
            userRepository.save(user);
            return;
        }

        User user = new User(
                cleanEmail,
                passwordEncoder.encode(cleanPassword),
                role,
                fullName,
                ""
        );
        user.setStatus("APPROVED");
        User saved = userRepository.save(user);
        saved.setUserCode(defaultUserCode != null ? defaultUserCode : String.format("TV-USR-%04d", saved.getId()));
        userRepository.save(saved);
        System.out.println("[TrustVault] Account ready: " + cleanEmail);
    }
}

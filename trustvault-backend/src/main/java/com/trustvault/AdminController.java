package com.trustvault;

import com.trustvault.repository.AuditLogRepository;
import com.trustvault.repository.DocumentPermissionRepository;
import com.trustvault.repository.DocumentRepository;
import com.trustvault.repository.UserRepository;
import com.trustvault.user.User;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserRepository userRepository;
    private final AuditLogRepository auditLogRepository;
    private final DocumentRepository documentRepository;
    private final DocumentPermissionRepository permissionRepository;

    public AdminController(
            UserRepository userRepository,
            AuditLogRepository auditLogRepository,
            DocumentRepository documentRepository,
            DocumentPermissionRepository permissionRepository) {
        this.userRepository = userRepository;
        this.auditLogRepository = auditLogRepository;
        this.documentRepository = documentRepository;
        this.permissionRepository = permissionRepository;
    }

    @GetMapping("/pending-users")
    public ResponseEntity<List<Map<String, Object>>> getPendingUsers() {
        List<User> pending = userRepository.findByStatus("PENDING_APPROVAL");
        List<Map<String, Object>> response = new ArrayList<>();
        for (User u : pending) {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", u.getId());
            map.put("userCode", u.getUserCode());
            map.put("name", u.getFullName() != null && !u.getFullName().isBlank() ? u.getFullName() : u.getEmail());
            map.put("email", u.getEmail());
            map.put("role", u.getRole() != null ? u.getRole().name() : "VIEWER");
            map.put("status", u.getStatus());
            map.put("phone", u.getPhone());
            map.put("date", "Pending Admin Verification");
            response.add(map);
        }
        return ResponseEntity.ok(response);
    }

    @GetMapping("/users")
    public ResponseEntity<List<Map<String, Object>>> getAllUsers() {
        List<User> all = userRepository.findAll();
        List<Map<String, Object>> response = new ArrayList<>();
        for (User u : all) {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", u.getId());
            map.put("userCode", u.getUserCode());
            map.put("name", u.getFullName() != null && !u.getFullName().isBlank() ? u.getFullName() : u.getEmail());
            map.put("email", u.getEmail());
            map.put("role", u.getRole() != null ? u.getRole().name() : "VIEWER");
            
            String displayStatus = "Active";
            if ("PENDING_APPROVAL".equalsIgnoreCase(u.getStatus())) {
                displayStatus = "Pending";
            } else if ("REVOKED".equalsIgnoreCase(u.getStatus())) {
                displayStatus = "Revoked";
            }
            map.put("status", displayStatus);
            map.put("rawStatus", u.getStatus());
            map.put("phone", u.getPhone());
            map.put("lastLogin", u.getLastLoginAt() != null ? u.getLastLoginAt().toString() : "Never signed in");
            map.put("lastLogout", u.getLastLogoutAt() != null ? u.getLastLogoutAt().toString() : "None");
            // Passwords are strictly omitted for security
            response.add(map);
        }
        return ResponseEntity.ok(response);
    }

    @PostMapping("/approve-user")
    public ResponseEntity<Map<String, String>> approveUser(@RequestBody Map<String, Object> body) {
        String email = body.get("email") != null ? body.get("email").toString().trim().toLowerCase() : null;
        Long id = body.get("id") != null ? Long.valueOf(body.get("id").toString()) : null;

        User user = null;
        if (email != null && !email.isBlank()) {
            user = userRepository.findByEmailIgnoreCase(email).orElse(null);
        }
        if (user == null && id != null) {
            user = userRepository.findById(id).orElse(null);
        }

        if (user == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found.");
        }

        user.setStatus("APPROVED");
        userRepository.save(user);

        auditLogRepository.save(new AuditLog(
                "USER_APPROVED",
                user.getEmail(),
                user.getUserCode(),
                user.getRole().name(),
                "Administrator approved account access for " + user.getEmail() + " (" + user.getUserCode() + ")",
                "SUCCESS"
        ));

        return ResponseEntity.ok(Map.of(
                "message", "User " + user.getEmail() + " has been approved.",
                "email", user.getEmail(),
                "userCode", user.getUserCode(),
                "status", "APPROVED"
        ));
    }

    @PostMapping("/revoke-user")
    public ResponseEntity<Map<String, String>> revokeUser(@RequestBody Map<String, Object> body) {
        String email = body.get("email") != null ? body.get("email").toString().trim().toLowerCase() : null;
        Long id = body.get("id") != null ? Long.valueOf(body.get("id").toString()) : null;

        User user = null;
        if (email != null && !email.isBlank()) {
            user = userRepository.findByEmailIgnoreCase(email).orElse(null);
        }
        if (user == null && id != null) {
            user = userRepository.findById(id).orElse(null);
        }

        if (user == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found.");
        }

        user.setStatus("REVOKED");
        userRepository.save(user);

        auditLogRepository.save(new AuditLog(
                "USER_REVOKED",
                user.getEmail(),
                user.getUserCode(),
                user.getRole().name(),
                "Administrator revoked access for " + user.getEmail() + " (" + user.getUserCode() + ")",
                "DANGER"
        ));

        return ResponseEntity.ok(Map.of(
                "message", "User " + user.getEmail() + " access has been revoked.",
                "email", user.getEmail(),
                "userCode", user.getUserCode(),
                "status", "REVOKED"
        ));
    }

    @PostMapping("/restore-user")
    public ResponseEntity<Map<String, String>> restoreUser(@RequestBody Map<String, Object> body) {
        return approveUser(body);
    }

    @GetMapping("/audit-logs")
    public ResponseEntity<List<AuditLog>> getAuditLogs() {
        List<AuditLog> logs = auditLogRepository.findTop100ByOrderByTimestampDesc();
        return ResponseEntity.ok(logs);
    }

    /**
     * Admin Owner Activity History:
     * Full audit history of what documents the owner uploaded, deleted, and which viewers they granted access to.
     */
    @GetMapping("/owner-history")
    public ResponseEntity<Map<String, Object>> getOwnerHistory(@RequestParam("email") String email) {
        if (email == null || email.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Owner email is required.");
        }
        String normalizedEmail = email.trim().toLowerCase();
        User owner = userRepository.findByEmailIgnoreCase(normalizedEmail).orElse(null);

        // Uploaded active documents
        List<Document> activeDocs = documentRepository.findActiveOwnerDocuments(normalizedEmail);

        // Uploaded deleted documents
        List<Document> deletedDocs = documentRepository.findDeletedOwnerDocuments(normalizedEmail);

        // All document IDs belonging to this owner
        List<Document> allOwnerDocs = documentRepository.findByOwnerEmailIgnoreCaseOrderByUpdatedAtDesc(normalizedEmail);
        List<Long> docIds = allOwnerDocs.stream().map(Document::getId).toList();

        // Permissions granted for these documents
        List<DocumentPermission> permissions = docIds.isEmpty() ? List.of() : permissionRepository.findByDocumentIdIn(docIds);

        // Distinct viewers granted access
        Set<String> distinctViewers = new HashSet<>();
        List<Map<String, Object>> grantedList = new ArrayList<>();
        for (DocumentPermission p : permissions) {
            distinctViewers.add(p.getViewerEmail().toLowerCase());
            Map<String, Object> pMap = new LinkedHashMap<>();
            pMap.put("id", p.getId());
            pMap.put("documentId", p.getDocumentId());
            pMap.put("documentName", p.getDocumentName());
            pMap.put("viewerEmail", p.getViewerEmail());
            pMap.put("viewerName", p.getViewerName());
            pMap.put("canView", p.isCanView());
            pMap.put("canDownload", p.isCanDownload());
            pMap.put("status", p.getStatus());
            pMap.put("grantedAt", p.getGrantedAt() != null ? p.getGrantedAt().toString() : "");
            grantedList.add(pMap);
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("ownerEmail", normalizedEmail);
        result.put("ownerName", owner != null && owner.getFullName() != null ? owner.getFullName() : normalizedEmail);
        result.put("userCode", owner != null ? owner.getUserCode() : "TV-OWN");
        result.put("status", owner != null ? owner.getStatus() : "ACTIVE");
        result.put("activeDocuments", activeDocs);
        result.put("deletedDocuments", deletedDocs);
        result.put("grantedPermissions", grantedList);
        result.put("totalUploaded", allOwnerDocs.size());
        result.put("totalActive", activeDocs.size());
        result.put("totalDeleted", deletedDocs.size());
        result.put("totalGrantedViewers", distinctViewers.size());

        return ResponseEntity.ok(result);
    }
}

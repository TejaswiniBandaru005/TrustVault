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

import java.time.Instant;
import java.util.*;

@RestController
@RequestMapping("/api/documents")
public class DocumentController {

    private final DocumentRepository documentRepository;
    private final DocumentPermissionRepository permissionRepository;
    private final UserRepository userRepository;
    private final AuditLogRepository auditLogRepository;

    public DocumentController(
            DocumentRepository documentRepository,
            DocumentPermissionRepository permissionRepository,
            UserRepository userRepository,
            AuditLogRepository auditLogRepository) {
        this.documentRepository = documentRepository;
        this.permissionRepository = permissionRepository;
        this.userRepository = userRepository;
        this.auditLogRepository = auditLogRepository;
    }

    /**
     * Owner Workspace: Returns ONLY documents owned by this specific owner.
     * Newly approved owners receive an empty list [] ensuring a completely clean workspace.
     */
    @GetMapping("/owner")
    public ResponseEntity<List<Document>> getOwnerDocuments(@RequestParam(name = "email") String email) {
        if (email == null || email.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Owner email is required.");
        }
        String normalizedEmail = email.trim().toLowerCase();
        
        // Verify user exists and is not revoked
        User user = userRepository.findByEmailIgnoreCase(normalizedEmail).orElse(null);
        if (user != null && "REVOKED".equalsIgnoreCase(user.getStatus())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Account access has been revoked by an Administrator.");
        }

        List<Document> docs = documentRepository.findByOwnerEmailIgnoreCaseOrderByUpdatedAtDesc(normalizedEmail);
        return ResponseEntity.ok(docs);
    }

    /**
     * Owner Document Upload: Securely adds a new file to the owner's personal vault.
     */
    @PostMapping("/owner")
    public ResponseEntity<Document> uploadDocument(@RequestBody DocumentUploadRequest request) {
        if (request.email() == null || request.email().isBlank() || request.name() == null || request.name().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Document name and owner email are required.");
        }
        String normalizedEmail = request.email().trim().toLowerCase();

        User user = userRepository.findByEmailIgnoreCase(normalizedEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User account not found."));

        if (!"APPROVED".equalsIgnoreCase(user.getStatus())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Account is not approved to manage documents.");
        }

        Document doc = new Document(
                request.name().trim(),
                request.category() != null ? request.category().trim() : "General",
                request.fileType() != null ? request.fileType().trim() : "PDF",
                request.fileSize() != null ? request.fileSize().trim() : "1.5 MB",
                normalizedEmail,
                user.getFullName() != null && !user.getFullName().isBlank() ? user.getFullName() : normalizedEmail
        );
        Document saved = documentRepository.save(doc);

        auditLogRepository.save(new AuditLog(
                "DOC_UPLOADED",
                normalizedEmail,
                user.getUserCode(),
                user.getRole().name(),
                "Uploaded document: " + saved.getName() + " (" + saved.getCategory() + ")",
                "SUCCESS"
        ));

        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    /**
     * Owner Document Deletion: Only the owner can delete their own document.
     */
    @DeleteMapping("/owner/{id}")
    public ResponseEntity<Map<String, String>> deleteDocument(
            @PathVariable("id") Long id,
            @RequestParam(name = "email") String email) {
        String normalizedEmail = email != null ? email.trim().toLowerCase() : "";
        Document doc = documentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Document not found."));

        if (!doc.getOwnerEmail().equalsIgnoreCase(normalizedEmail)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not own this document.");
        }

        // Remove associated permissions
        List<DocumentPermission> perms = permissionRepository.findByDocumentId(id);
        permissionRepository.deleteAll(perms);
        documentRepository.delete(doc);

        auditLogRepository.save(new AuditLog(
                "DOC_DELETED",
                normalizedEmail,
                "",
                "OWNER",
                "Deleted document: " + doc.getName(),
                "WARNING"
        ));

        return ResponseEntity.ok(Map.of("message", "Document deleted successfully."));
    }

    /**
     * Viewer Workspace: Returns ONLY documents explicitly allocated/granted to this Viewer.
     * Newly approved viewers receive an empty list [] until an Owner shares a document with them.
     */
    @GetMapping("/viewer")
    public ResponseEntity<List<Map<String, Object>>> getViewerAllocatedDocuments(@RequestParam(name = "email") String email) {
        if (email == null || email.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Viewer email is required.");
        }
        String normalizedEmail = email.trim().toLowerCase();

        User user = userRepository.findByEmailIgnoreCase(normalizedEmail).orElse(null);
        if (user != null && "REVOKED".equalsIgnoreCase(user.getStatus())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Account access has been revoked by an Administrator.");
        }

        List<DocumentPermission> permissions = permissionRepository.findByViewerEmailIgnoreCase(normalizedEmail);
        List<Map<String, Object>> result = new ArrayList<>();

        for (DocumentPermission perm : permissions) {
            Optional<Document> docOpt = documentRepository.findById(perm.getDocumentId());
            if (docOpt.isPresent()) {
                Document doc = docOpt.get();
                Map<String, Object> map = new LinkedHashMap<>();
                map.put("id", doc.getId());
                map.put("permissionId", perm.getId());
                map.put("name", doc.getName());
                map.put("category", doc.getCategory());
                map.put("fileType", doc.getFileType());
                map.put("fileSize", doc.getFileSize());
                map.put("owner", doc.getOwnerName() != null ? doc.getOwnerName() : doc.getOwnerEmail());
                map.put("ownerEmail", doc.getOwnerEmail());
                map.put("updated", doc.getUpdatedAt().toString().substring(0, 10));
                map.put("access", perm.getStatus());
                map.put("canDownload", perm.isCanDownload());
                map.put("canView", perm.isCanView());
                result.add(map);
            }
        }

        return ResponseEntity.ok(result);
    }

    /**
     * Document Catalog: Discovers all documents in the system metadata-only (for access requests).
     */
    @GetMapping("/catalog")
    public ResponseEntity<List<Map<String, Object>>> getCatalog(
            @RequestParam(name = "viewerEmail", required = false) String viewerEmail) {
        List<Document> allDocs = documentRepository.findAllByOrderByUpdatedAtDesc();
        List<Map<String, Object>> result = new ArrayList<>();

        Map<Long, DocumentPermission> permMap = new HashMap<>();
        if (viewerEmail != null && !viewerEmail.isBlank()) {
            List<DocumentPermission> perms = permissionRepository.findByViewerEmailIgnoreCase(viewerEmail.trim().toLowerCase());
            for (DocumentPermission p : perms) {
                permMap.put(p.getDocumentId(), p);
            }
        }

        for (Document d : allDocs) {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", d.getId());
            map.put("name", d.getName());
            map.put("category", d.getCategory());
            map.put("type", d.getFileType());
            map.put("size", d.getFileSize());
            map.put("owner", d.getOwnerName() != null ? d.getOwnerName() : d.getOwnerEmail());
            map.put("ownerEmail", d.getOwnerEmail());
            map.put("updated", d.getUpdatedAt().toString().substring(0, 10));

            DocumentPermission perm = permMap.get(d.getId());
            if (perm != null) {
                map.put("access", perm.getStatus());
                map.put("canDownload", perm.isCanDownload());
                map.put("canView", perm.isCanView());
                map.put("requested", "REQUESTED".equalsIgnoreCase(perm.getStatus()));
            } else {
                map.put("access", "Restricted");
                map.put("canDownload", false);
                map.put("canView", false);
                map.put("requested", false);
            }
            result.add(map);
        }

        return ResponseEntity.ok(result);
    }

    /**
     * Request Document Access: Viewer requests permission from Document Owner.
     */
    @PostMapping("/request-access")
    public ResponseEntity<Map<String, String>> requestAccess(@RequestBody AccessRequestDto dto) {
        if (dto.documentId() == null || dto.viewerEmail() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Document ID and Viewer email are required.");
        }
        String normalizedEmail = dto.viewerEmail().trim().toLowerCase();
        Document doc = documentRepository.findById(dto.documentId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Document not found."));

        DocumentPermission permission = permissionRepository
                .findByDocumentIdAndViewerEmailIgnoreCase(dto.documentId(), normalizedEmail)
                .orElse(new DocumentPermission(
                        doc.getId(),
                        doc.getName(),
                        normalizedEmail,
                        dto.viewerName() != null ? dto.viewerName() : normalizedEmail,
                        false,
                        false,
                        "REQUESTED"
                ));

        permission.setStatus("REQUESTED");
        permissionRepository.save(permission);

        auditLogRepository.save(new AuditLog(
                "ACCESS_REQUESTED",
                normalizedEmail,
                "",
                "VIEWER",
                "Requested access to document: " + doc.getName() + " (Owner: " + doc.getOwnerEmail() + ")",
                "INFO"
        ));

        return ResponseEntity.ok(Map.of("message", "Access request submitted to document owner."));
    }

    /**
     * Grant or Update Permission: Document Owner grants/modifies permissions for a Viewer.
     */
    @PostMapping("/grant-access")
    public ResponseEntity<Map<String, String>> grantAccess(@RequestBody GrantAccessDto dto) {
        Document doc = documentRepository.findById(dto.documentId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Document not found."));

        if (!doc.getOwnerEmail().equalsIgnoreCase(dto.ownerEmail().trim())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not authorized to grant permissions for this document.");
        }

        String viewerEmail = dto.viewerEmail().trim().toLowerCase();
        DocumentPermission permission = permissionRepository
                .findByDocumentIdAndViewerEmailIgnoreCase(dto.documentId(), viewerEmail)
                .orElse(new DocumentPermission(
                        doc.getId(),
                        doc.getName(),
                        viewerEmail,
                        dto.viewerName() != null ? dto.viewerName() : viewerEmail,
                        dto.canView(),
                        dto.canDownload(),
                        "GRANTED"
                ));

        permission.setCanView(dto.canView());
        permission.setCanDownload(dto.canDownload());
        permission.setStatus("GRANTED");
        permission.setGrantedAt(Instant.now());
        permissionRepository.save(permission);

        auditLogRepository.save(new AuditLog(
                "PERMISSION_GRANTED",
                dto.ownerEmail().trim().toLowerCase(),
                "",
                "OWNER",
                "Granted access on " + doc.getName() + " to " + viewerEmail + " (Download: " + dto.canDownload() + ")",
                "SUCCESS"
        ));

        return ResponseEntity.ok(Map.of("message", "Permission granted successfully."));
    }

    /**
     * Revoke Permission: Document Owner revokes access for a specific Viewer.
     */
    @PostMapping("/revoke-access")
    public ResponseEntity<Map<String, String>> revokeAccess(@RequestBody RevokeAccessDto dto) {
        Document doc = documentRepository.findById(dto.documentId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Document not found."));

        if (!doc.getOwnerEmail().equalsIgnoreCase(dto.ownerEmail().trim())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not authorized to revoke permissions for this document.");
        }

        String viewerEmail = dto.viewerEmail().trim().toLowerCase();
        Optional<DocumentPermission> permOpt = permissionRepository
                .findByDocumentIdAndViewerEmailIgnoreCase(dto.documentId(), viewerEmail);

        permOpt.ifPresent(p -> {
            p.setStatus("REVOKED");
            p.setCanView(false);
            p.setCanDownload(false);
            permissionRepository.save(p);
        });

        auditLogRepository.save(new AuditLog(
                "PERMISSION_REVOKED",
                dto.ownerEmail().trim().toLowerCase(),
                "",
                "OWNER",
                "Revoked access on " + doc.getName() + " for " + viewerEmail,
                "WARNING"
        ));

        return ResponseEntity.ok(Map.of("message", "Permission revoked successfully."));
    }

    public record DocumentUploadRequest(String name, String category, String fileType, String fileSize, String email) {}
    public record AccessRequestDto(Long documentId, String viewerEmail, String viewerName) {}
    public record GrantAccessDto(Long documentId, String viewerEmail, String viewerName, boolean canView, boolean canDownload, String ownerEmail) {}
    public record RevokeAccessDto(Long documentId, String viewerEmail, String ownerEmail) {}
}

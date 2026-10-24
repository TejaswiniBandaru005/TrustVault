package com.trustvault;

import com.trustvault.repository.AuditLogRepository;
import com.trustvault.repository.UserRepository;
import com.trustvault.user.Role;
import com.trustvault.user.User;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@Validated
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogRepository auditLogRepository;

    public AuthController(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            AuditLogRepository auditLogRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.auditLogRepository = auditLogRepository;
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> register(
            @Valid @RequestBody RegistrationRequest request) {
        String normalizedEmail = request.email().trim().toLowerCase();
        var existingUserOpt = userRepository.findByEmailIgnoreCase(normalizedEmail);
        if (existingUserOpt.isPresent()) {
            User existing = existingUserOpt.get();
            if ("REVOKED".equalsIgnoreCase(existing.getStatus())) {
                throw new ResponseStatusException(
                        HttpStatus.FORBIDDEN,
                        "Your account has been revoked by an Administrator. You no longer have access to sign up or use TrustVault."
                );
            }
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "An account with this email already exists. Please sign in."
            );
        }

        Role role;
        try {
            role = Role.valueOf(request.role().trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Role must be VIEWER, OWNER, or ADMIN."
            );
        }

        String phone = (request.phone() != null) ? request.phone().trim() : "";

        User newUser = new User(
                normalizedEmail,
                passwordEncoder.encode(request.password()),
                role,
                request.fullName().trim(),
                phone
        );
        newUser.setStatus("PENDING_APPROVAL");
        User savedUser = userRepository.save(newUser);

        // Assign guaranteed distinct unique ID: TV-USR-xxxx
        String userCode = String.format("TV-USR-%04d", savedUser.getId());
        savedUser.setUserCode(userCode);
        userRepository.save(savedUser);

        auditLogRepository.save(new AuditLog(
                "REGISTER",
                normalizedEmail,
                userCode,
                role.name(),
                "New account registered: " + savedUser.getFullName() + " (" + role.name() + ")",
                "INFO"
        ));

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "message", "Registration completed successfully.",
                "email", normalizedEmail,
                "userCode", userCode,
                "role", role.name(),
                "fullName", savedUser.getFullName() != null ? savedUser.getFullName() : normalizedEmail,
                "status", savedUser.getStatus() != null ? savedUser.getStatus() : "PENDING_APPROVAL"
        ));
    }

    public record RegistrationRequest(
            @NotBlank String fullName,
            @NotBlank @Email String email,
            String phone,
            @NotBlank @Size(min = 8) String password,
            @NotBlank String role) {
    }
}

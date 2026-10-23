package com.trustvault;

import com.trustvault.repository.AuditLogRepository;
import com.trustvault.repository.UserRepository;
import com.trustvault.user.Role;
import com.trustvault.user.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class OtpController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final OtpService otpService;
    private final AuditLogRepository auditLogRepository;
    private final String adminEmail;

    public OtpController(
            AuthenticationManager authenticationManager,
            UserRepository userRepository,
            EmailService emailService,
            OtpService otpService,
            AuditLogRepository auditLogRepository,
            @Value("${app.admin.email:admin123@gmail.com}") String adminEmail) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.emailService = emailService;
        this.otpService = otpService;
        this.auditLogRepository = auditLogRepository;
        this.adminEmail = adminEmail;
    }

    @PostMapping({"/send-otp", "/login"})
    public ResponseEntity<Map<String, String>> sendOtpOrLogin(
            @RequestBody LoginRequest request) {
        if (request.email() == null || request.password() == null
                || request.email().isBlank() || request.password().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Email/username and password are required."
            );
        }

        String input = request.email().trim().toLowerCase();
        String lookupEmail = "admin".equals(input) ? adminEmail.trim().toLowerCase() : input;

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            lookupEmail,
                            request.password()
                    )
            );
            lookupEmail = authentication.getName().toLowerCase();
        } catch (AuthenticationException ex) {
            auditLogRepository.save(new AuditLog(
                    "LOGIN_FAILED",
                    lookupEmail,
                    "",
                    "UNKNOWN",
                    "Invalid password or unauthorized login attempt.",
                    "WARNING"
            ));
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Invalid email or password."
            );
        }

        User user = userRepository.findByEmailIgnoreCase(lookupEmail)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Account not found."
                ));

        // Enforce access revocation immediately (Requirement 1, 3 & 5)
        if ("REVOKED".equalsIgnoreCase(user.getStatus())) {
            auditLogRepository.save(new AuditLog(
                    "LOGIN_BLOCKED",
                    user.getEmail(),
                    user.getUserCode(),
                    user.getRole().name(),
                    "Sign-in blocked: Account access has been revoked by an Administrator.",
                    "DANGER"
            ));
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Access denied: This account has been revoked by an Administrator. Contact admin for assistance."
            );
        }

        // Enforce role matching if a specific role was selected on the login page
        if (request.role() != null && !request.role().isBlank()) {
            try {
                Role expectedRole = Role.valueOf(request.role().trim().toUpperCase());
                if (user.getRole() != expectedRole) {
                    throw new ResponseStatusException(
                            HttpStatus.FORBIDDEN,
                            "Access denied: You selected '" + expectedRole + "' mode, but this account is registered as '" + user.getRole() + "'."
                    );
                }
            } catch (IllegalArgumentException ignored) {
            }
        }

        // Admin accounts bypass OTP verification directly
        if (user.getRole() == Role.ADMIN) {
            user.setLastLoginAt(Instant.now());
            userRepository.save(user);

            auditLogRepository.save(new AuditLog(
                    "LOGIN_SUCCESS",
                    user.getEmail(),
                    user.getUserCode(),
                    user.getRole().name(),
                    "Administrator signed in directly.",
                    "SUCCESS"
            ));

            return ResponseEntity.ok(Map.of(
                    "requiresOtp", "false",
                    "message", "Administrator signed in successfully.",
                    "email", user.getEmail(),
                    "userCode", user.getUserCode(),
                    "fullName", user.getFullName() != null ? user.getFullName() : "Administrator",
                    "role", user.getRole().name(),
                    "status", user.getStatus()
            ));
        }

        String otp;
        try {
            otp = otpService.generateAndStoreOtp(
                    lookupEmail,
                    OtpService.Purpose.LOGIN
            );
        } catch (IllegalStateException ex) {
            throw new ResponseStatusException(
                    HttpStatus.TOO_MANY_REQUESTS,
                    ex.getMessage()
            );
        }

        boolean sent = emailService.sendOtpEmail(lookupEmail, otp);
        String msg = sent
                ? "Verification code sent to " + lookupEmail + ". (Code: " + otp + ")"
                : "Verification code (" + otp + ") is pre-filled below (Real mail delivery requires Gmail app password in .env).";

        return ResponseEntity.ok(Map.of(
                "requiresOtp", "true",
                "otp", otp,
                "emailSent", String.valueOf(sent),
                "message", msg,
                "userCode", user.getUserCode(),
                "status", user.getStatus()
        ));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<Map<String, String>> verifyOtp(
            @RequestBody OtpVerificationRequest request) {

        if (request.email() == null || request.otp() == null
                || request.email().isBlank()
                || !request.otp().matches("\\d{6}")) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "A valid email and six-digit OTP are required."
            );
        }

        String input = request.email().trim().toLowerCase();
        String lookupEmail = "admin".equals(input) ? adminEmail.trim().toLowerCase() : input;

        boolean valid = otpService.verifyOtp(
                lookupEmail,
                request.otp(),
                OtpService.Purpose.LOGIN
        );

        if (!valid) {
            auditLogRepository.save(new AuditLog(
                    "OTP_FAILED",
                    lookupEmail,
                    "",
                    "UNKNOWN",
                    "Invalid or expired OTP submitted.",
                    "WARNING"
            ));
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Invalid or expired OTP. Please request a new code."
            );
        }

        User user = userRepository.findByEmailIgnoreCase(lookupEmail)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Account not found."
                ));

        if ("REVOKED".equalsIgnoreCase(user.getStatus())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Access denied: This account has been revoked by an Administrator."
            );
        }

        // Record successful login date and time
        user.setLastLoginAt(Instant.now());
        userRepository.save(user);

        auditLogRepository.save(new AuditLog(
                "LOGIN_SUCCESS",
                user.getEmail(),
                user.getUserCode(),
                user.getRole().name(),
                "User completed OTP verification and signed in.",
                "SUCCESS"
        ));

        return ResponseEntity.ok(Map.of(
                "message", "OTP verified successfully.",
                "email", user.getEmail(),
                "userCode", user.getUserCode(),
                "fullName", user.getFullName() != null && !user.getFullName().isBlank() ? user.getFullName() : user.getEmail(),
                "role", user.getRole().name(),
                "status", user.getStatus()
        ));
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(@RequestBody Map<String, String> body) {
        String email = body != null ? body.get("email") : null;
        if (email != null && !email.isBlank()) {
            userRepository.findByEmailIgnoreCase(email.trim().toLowerCase()).ifPresent(user -> {
                user.setLastLogoutAt(Instant.now());
                userRepository.save(user);

                auditLogRepository.save(new AuditLog(
                        "LOGOUT",
                        user.getEmail(),
                        user.getUserCode(),
                        user.getRole().name(),
                        "User logged out.",
                        "INFO"
                ));
            });
        }
        return ResponseEntity.ok(Map.of("message", "User logged out successfully."));
    }

    public record OtpVerificationRequest(String email, String otp, String role) {}
    public record LoginRequest(String email, String password, String role) {}
}

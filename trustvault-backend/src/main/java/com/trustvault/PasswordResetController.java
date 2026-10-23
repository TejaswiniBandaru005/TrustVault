package com.trustvault;

import com.trustvault.repository.UserRepository;
import com.trustvault.user.User;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestController
@RequestMapping("/api/auth/password-reset")
public class PasswordResetController {

    private final UserRepository userRepository;
    private final EmailService emailService;
    private final OtpService otpService;
    private final PasswordEncoder passwordEncoder;

    public PasswordResetController(
            UserRepository userRepository,
            EmailService emailService,
            OtpService otpService,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.emailService = emailService;
        this.otpService = otpService;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/send-otp")
    public ResponseEntity<Map<String, String>> sendOtp(
            @Valid @RequestBody EmailRequest request) {
        String email = request.email().trim().toLowerCase();
        if (userRepository.findByEmailIgnoreCase(email).isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "No account found with email '" + email + "'. Please check the address or register a new account."
            );
        }

        String otp;
        try {
            otp = otpService.generateAndStoreOtp(
                    email,
                    OtpService.Purpose.PASSWORD_RESET
            );
        } catch (IllegalStateException ex) {
            throw new ResponseStatusException(
                    HttpStatus.TOO_MANY_REQUESTS,
                    ex.getMessage()
            );
        }

        boolean sent = emailService.sendOtpEmail(email, otp);
        String msg = sent
                ? "Password reset code sent to " + email + ". (Code: " + otp + ")"
                : "Reset code (" + otp + ") is pre-filled below (Real mail delivery requires Gmail app password in .env).";

        return ResponseEntity.ok(Map.of(
                "otp", otp,
                "emailSent", String.valueOf(sent),
                "message", msg
        ));
    }

    @PostMapping
    public ResponseEntity<Map<String, String>> resetPassword(
            @Valid @RequestBody PasswordResetRequest request) {
        String email = request.email().trim().toLowerCase();
        if (!otpService.verifyOtp(
                email,
                request.otp(),
                OtpService.Purpose.PASSWORD_RESET
        )) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Invalid or expired verification code."
            );
        }

        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Account not found."
                ));
        user.setPassword(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);

        return ResponseEntity.ok(Map.of(
                "message", "Password reset successfully. You can now sign in with your new password."
        ));
    }

    public record EmailRequest(@NotBlank @Email String email) {}

    public record PasswordResetRequest(
            @NotBlank @Email String email,
            @NotBlank @Size(min = 6, max = 6) String otp,
            @NotBlank @Size(min = 8) String newPassword) {}
}

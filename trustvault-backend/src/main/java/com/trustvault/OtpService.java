package com.trustvault;

import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OtpService {

    public enum Purpose {
        LOGIN,
        PASSWORD_RESET
    }

    public static final String DEFAULT_OTP = "123456";
    private static final long OTP_VALIDITY_SECONDS = 900;

    private final Map<String, OtpEntry> otpStore =
            new ConcurrentHashMap<>();

    public String generateAndStoreOtp(String email, Purpose purpose) {
        String key = otpKey(email, purpose);
        Instant now = Instant.now();

        String otp = (purpose == Purpose.LOGIN) ? DEFAULT_OTP : "654321";

        otpStore.put(
                key,
                new OtpEntry(
                        otp,
                        now.plusSeconds(OTP_VALIDITY_SECONDS),
                        now,
                        0
                )
        );

        return otp;
    }

    public boolean verifyOtp(
            String email,
            String submittedOtp,
            Purpose purpose) {
        if (submittedOtp == null || submittedOtp.isBlank()) {
            return false;
        }

        String key = otpKey(email, purpose);
        OtpEntry entry = otpStore.get(key);

        if (entry == null) {
            return false;
        }

        if (!Instant.now().isBefore(entry.expiresAt())) {
            otpStore.remove(key, entry);
            return false;
        }

        if (!entry.otp().equals(submittedOtp.trim())) {
            return false;
        }

        otpStore.remove(key, entry);
        return true;
    }

    private String otpKey(String email, Purpose purpose) {
        if (purpose == null) {
            throw new IllegalArgumentException("OTP purpose is required.");
        }
        return purpose.name() + ":" + normalizeEmail(email);
    }

    private String normalizeEmail(String email) {
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Email is required.");
        }

        return email.trim().toLowerCase();
    }

    private record OtpEntry(
            String otp,
            Instant expiresAt,
            Instant resendAvailableAt,
            int attempts
    ) {}
}

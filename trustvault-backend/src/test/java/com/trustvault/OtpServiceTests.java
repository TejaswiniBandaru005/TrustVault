package com.trustvault;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class OtpServiceTests {

    private final OtpService otpService = new OtpService();

    @Test
    void otpIsScopedToEmailAndPurpose() {
        String email = "user@example.com";
        String loginOtp = otpService.generateAndStoreOtp(
                email,
                OtpService.Purpose.LOGIN
        );
        String resetOtp = otpService.generateAndStoreOtp(
                email,
                OtpService.Purpose.PASSWORD_RESET
        );

        assertFalse(otpService.verifyOtp(
                email,
                loginOtp,
                OtpService.Purpose.PASSWORD_RESET
        ));
        assertTrue(otpService.verifyOtp(
                email,
                loginOtp,
                OtpService.Purpose.LOGIN
        ));
        assertTrue(otpService.verifyOtp(
                email,
                resetOtp,
                OtpService.Purpose.PASSWORD_RESET
        ));
    }

    @Test
    void otpCanOnlyBeUsedOnce() {
        String email = "user@example.com";
        String otp = otpService.generateAndStoreOtp(
                email,
                OtpService.Purpose.LOGIN
        );

        assertTrue(otpService.verifyOtp(
                email,
                otp,
                OtpService.Purpose.LOGIN
        ));
        assertFalse(otpService.verifyOtp(
                email,
                otp,
                OtpService.Purpose.LOGIN
        ));
    }

    @Test
    void tamperedOtpIsRejected() {
        String email = "victim@example.com";
        otpService.generateAndStoreOtp(email, OtpService.Purpose.LOGIN);

        // An attacker guessing or tampering with OTP
        assertFalse(otpService.verifyOtp(email, "999999", OtpService.Purpose.LOGIN));
        assertFalse(otpService.verifyOtp(email, "000000", OtpService.Purpose.LOGIN));
        assertFalse(otpService.verifyOtp(email, "", OtpService.Purpose.LOGIN));
        assertFalse(otpService.verifyOtp(email, null, OtpService.Purpose.LOGIN));
    }

    @Test
    void wrongEmailCannotUseOtherUsersOtp() {
        String victimEmail = "victim@example.com";
        String attackerEmail = "attacker@example.com";
        String otp = otpService.generateAndStoreOtp(victimEmail, OtpService.Purpose.LOGIN);

        // Attacker attempting to intercept or replay victim's OTP
        assertFalse(otpService.verifyOtp(attackerEmail, otp, OtpService.Purpose.LOGIN));
    }
}

package com.trustvault;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;
    private final String senderEmail;

    public EmailService(
            JavaMailSender mailSender,
            @Value("${spring.mail.username:}") String senderEmail) {
        this.mailSender = mailSender;
        this.senderEmail = senderEmail;
    }

    public boolean sendOtpEmail(String recipientEmail, String otp) {
        System.out.println("\n========================================================");
        System.out.println("[TrustVault OTP] Verification code for " + recipientEmail + " is: " + otp);
        System.out.println("========================================================\n");

        if (senderEmail == null || senderEmail.isBlank() || senderEmail.contains("your-email@gmail.com")) {
            System.out.println("[TrustVault OTP] Notice: Real email dispatch skipped because MAIL_USERNAME is a placeholder in .env.");
            System.out.println("[TrustVault OTP] To send real emails, update MAIL_USERNAME and MAIL_PASSWORD in .env with your Gmail and Google App Password.");
            return false;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(senderEmail);
            message.setTo(recipientEmail);
            message.setSubject("Your TrustVault Verification Code: " + otp);
            message.setText(
                    "Hello,\n\n"
                    + "Your TrustVault email verification code is: " + otp + "\n\n"
                    + "This code expires in 15 minutes.\n"
                    + "If you did not request this verification, please ignore this email.\n\n"
                    + "TrustVault Security Team"
            );

            mailSender.send(message);
            System.out.println("[TrustVault OTP] Successfully delivered OTP email to: " + recipientEmail);
            return true;
        } catch (Exception ex) {
            System.err.println("[TrustVault OTP] Warning: Could not deliver email via Gmail SMTP: " + ex.getMessage());
            return false;
        }
    }
}

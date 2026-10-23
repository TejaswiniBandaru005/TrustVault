package com.trustvault;

import com.trustvault.repository.UserRepository;
import com.trustvault.user.Role;
import com.trustvault.user.User;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

@Configuration
public class AdminSeeder {

    @Bean
    CommandLineRunner createDefaultAdmin(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JdbcTemplate jdbcTemplate,
            @Value("${app.admin.email:admin123@gmail.com}") String adminEmail,
            @Value("${app.admin.password:admin@123}") String adminPassword) {

        return args -> {
            syncIdSequence(jdbcTemplate);
            seedAdmin(
                    userRepository,
                    passwordEncoder,
                    adminEmail,
                    adminPassword
            );
            syncIdSequence(jdbcTemplate);
        };
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

    @Transactional
    void seedAdmin(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            String adminEmail,
            String adminPassword) {

        String cleanEmail = (adminEmail == null || adminEmail.isBlank())
                ? "admin123@gmail.com"
                : adminEmail.trim().toLowerCase();

        String cleanPassword = (adminPassword == null || adminPassword.isBlank())
                ? "admin@123"
                : adminPassword.trim();

        var existingAdmin = userRepository.findByEmailIgnoreCase(cleanEmail);

        if (existingAdmin.isPresent()) {
            User admin = existingAdmin.get();
            admin.setStatus("APPROVED");
            String resetFlag = System.getProperty("APP_ADMIN_RESET_PASSWORD", System.getenv("APP_ADMIN_RESET_PASSWORD"));
            boolean shouldReset = Boolean.parseBoolean(resetFlag) || !passwordEncoder.matches(cleanPassword, admin.getPassword());

            if (shouldReset) {
                admin.setPassword(passwordEncoder.encode(cleanPassword));
                System.out.println("[TrustVault] Admin account password synchronized for: " + cleanEmail);
            } else {
                System.out.println("[TrustVault] Admin account ready: " + cleanEmail);
            }
            userRepository.save(admin);
            return;
        }

        User admin = new User(
                cleanEmail,
                passwordEncoder.encode(cleanPassword),
                Role.ADMIN
        );
        admin.setStatus("APPROVED");

        userRepository.save(admin);
        System.out.println("[TrustVault] Default TrustVault admin created: " + cleanEmail);
    }
}

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

            // Default Admin account (admin123@gmail.com / admin@123)
            seedUser(
                    userRepository,
                    passwordEncoder,
                    adminEmail,
                    adminPassword,
                    Role.ADMIN,
                    "System Administrator",
                    "TV-USR-0001"
            );

            // Owner account (owner1@example.com / Owner1@123)
            seedUser(
                    userRepository,
                    passwordEncoder,
                    "owner1@example.com",
                    "Owner1@123",
                    Role.OWNER,
                    "Document Owner",
                    "TV-USR-0002"
            );

            // Viewer account (viewer1@example.com / Viewer1@123)
            seedUser(
                    userRepository,
                    passwordEncoder,
                    "viewer1@example.com",
                    "Viewer1@123",
                    Role.VIEWER,
                    "Verified Viewer",
                    "TV-USR-0003"
            );

            syncIdSequence(jdbcTemplate);
            sanitizeNames(jdbcTemplate);
        };
    }

    private void sanitizeNames(JdbcTemplate jdbcTemplate) {
        try {
            jdbcTemplate.update("UPDATE documents SET owner_name = 'Document Owner' WHERE LOWER(owner_name) LIKE '%demo%'");
            jdbcTemplate.update("UPDATE app_users SET full_name = 'Document Owner' WHERE LOWER(full_name) LIKE '%demo%' AND role = 'OWNER'");
            jdbcTemplate.update("UPDATE app_users SET full_name = 'Verified Viewer' WHERE LOWER(full_name) LIKE '%demo%' AND role = 'VIEWER'");
        } catch (Exception e) {
            System.err.println("[TrustVault] Name sanitization notice: " + e.getMessage());
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

    @Transactional
    void seedUser(
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
            if (user.getFullName() == null || user.getFullName().isBlank() || user.getFullName().toLowerCase().contains("demo")) {
                user.setFullName(fullName);
            }
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
        System.out.println("[TrustVault] Default " + role + " account ready: " + cleanEmail);
    }
}

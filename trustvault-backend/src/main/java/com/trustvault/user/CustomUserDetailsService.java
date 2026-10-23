package com.trustvault.user;

import com.trustvault.repository.UserRepository;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;
    private final String adminEmail;

    public CustomUserDetailsService(
            UserRepository userRepository,
            @Value("${app.admin.email:admin123@gmail.com}") String adminEmail) {
        this.userRepository = userRepository;
        this.adminEmail = adminEmail;
    }

    @Override
    public UserDetails loadUserByUsername(String email)
            throws UsernameNotFoundException {

        String lookupEmail = email;
        if ("admin".equalsIgnoreCase(email)) {
            lookupEmail = adminEmail;
        }

        User user = userRepository.findByEmailIgnoreCase(lookupEmail)
                .orElseThrow(() ->
                        new UsernameNotFoundException("User not found"));

        return org.springframework.security.core.userdetails.User
                .withUsername(user.getEmail())
                .password(user.getPassword())
                .roles(user.getRole().name())
                .build();
    }
}

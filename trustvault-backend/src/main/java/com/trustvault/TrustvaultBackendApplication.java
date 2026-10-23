package com.trustvault;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.nio.charset.StandardCharsets;

@SpringBootApplication
public class TrustvaultBackendApplication {

    static {
        loadDotEnv();
    }

    public static void main(String[] args) {
        loadDotEnv();
        SpringApplication.run(TrustvaultBackendApplication.class, args);
    }

    public static void loadDotEnv() {
        String[] possiblePaths = {
            ".env",
            "../.env",
            "trustvault-backend/.env",
            "../trustvault-backend/.env"
        };

        for (String path : possiblePaths) {
            File envFile = new File(path);
            if (envFile.exists() && envFile.isFile()) {
                try (BufferedReader reader = new BufferedReader(new FileReader(envFile, StandardCharsets.UTF_8))) {
                    String line;
                    while ((line = reader.readLine()) != null) {
                        line = line.trim();
                        if (line.isEmpty() || line.startsWith("#")) {
                            continue;
                        }

                        if (line.startsWith("$env:")) {
                            line = line.substring(5).trim();
                        } else if (line.startsWith("export ")) {
                            line = line.substring(7).trim();
                        }

                        int equalsIndex = line.indexOf('=');
                        if (equalsIndex > 0) {
                            String key = line.substring(0, equalsIndex).trim();
                            String value = line.substring(equalsIndex + 1).trim();

                            if ((value.startsWith("\"") && value.endsWith("\"")) ||
                                (value.startsWith("'") && value.endsWith("'"))) {
                                if (value.length() >= 2) {
                                    value = value.substring(1, value.length() - 1);
                                }
                            }

                            if (System.getProperty(key) == null && System.getenv(key) == null) {
                                System.setProperty(key, value);
                            }
                        }
                    }
                } catch (Exception e) {
                    System.err.println("[TrustVault] Warning: Failed to parse .env file: " + e.getMessage());
                }
                break;
            }
        }
    }
}

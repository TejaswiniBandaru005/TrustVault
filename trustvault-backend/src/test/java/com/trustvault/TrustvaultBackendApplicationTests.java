package com.trustvault;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
@Disabled("Requires live external cloud network connection to Neon AWS PostgreSQL")
class TrustvaultBackendApplicationTests {

    static {
        TrustvaultBackendApplication.loadDotEnv();
    }

    @Test
    void contextLoads() {
    }

}

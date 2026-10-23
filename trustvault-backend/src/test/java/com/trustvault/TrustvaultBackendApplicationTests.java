package com.trustvault;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class TrustvaultBackendApplicationTests {

    static {
        TrustvaultBackendApplication.loadDotEnv();
    }

    @Test
    void contextLoads() {
    }

}

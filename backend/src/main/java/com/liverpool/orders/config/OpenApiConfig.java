package com.liverpool.orders.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(
        info = @Info(
                title = "Liverpool Orders API",
                version = "1.0.0",
                description = """
                        REST API for managing customers and orders for
                        the Liverpool Orders Management System.

                        Customer operations include creation, retrieval,
                        search, update, and deletion.

                        Order operations include creation, retrieval,
                        search, filtering, update, and deletion.
                        """
        )
)
public class OpenApiConfig {
}

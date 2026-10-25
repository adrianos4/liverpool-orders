
package com.liverpool.orders.system;

import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/system")
public class SystemStatusController {

    private final MongoTemplate mongoTemplate;

    public SystemStatusController(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getStatus() {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("application", "Liverpool Orders API");
        response.put("timestamp", Instant.now().toString());

        try {
            mongoTemplate.getDb().runCommand(
                    new org.bson.Document("ping", 1)
            );

            response.put("status", "UP");
            response.put("database", "CONNECTED");

            return ResponseEntity.ok(response);
        } catch (Exception exception) {
            response.put("status", "DEGRADED");
            response.put("database", "DISCONNECTED");
            response.put("message", "Database connection failed");

            return ResponseEntity
                    .status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(response);
        }
    }
}

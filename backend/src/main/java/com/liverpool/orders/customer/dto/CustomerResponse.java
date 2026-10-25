package com.liverpool.orders.customer.dto;

import java.time.Instant;

import com.liverpool.orders.customer.model.Customer;

public record CustomerResponse(
        String id,
        String firstName,
        String lastName,
        String motherLastName,
        String email,
        Instant createdAt,
        Instant updatedAt
) {

    public static CustomerResponse from(Customer customer) {
        return new CustomerResponse(
                customer.getId(),
                customer.getFirstName(),
                customer.getLastName(),
                customer.getMotherLastName(),
                customer.getEmail(),
                customer.getCreatedAt(),
                customer.getUpdatedAt()
        );
    }
}

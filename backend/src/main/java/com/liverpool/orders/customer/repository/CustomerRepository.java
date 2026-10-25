package com.liverpool.orders.customer.repository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import com.liverpool.orders.customer.model.Customer;

public interface CustomerRepository
        extends MongoRepository<Customer, String> {

    Optional<Customer> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);

    Page<Customer>
    findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCaseOrMotherLastNameContainingIgnoreCaseOrEmailContainingIgnoreCase(
            String firstName,
            String lastName,
            String motherLastName,
            String email,
            Pageable pageable
    );
}

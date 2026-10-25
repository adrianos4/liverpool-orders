package com.liverpool.orders.customer.service;

import java.time.Instant;
import java.util.Locale;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.liverpool.orders.common.dto.PageResponse;
import com.liverpool.orders.customer.dto.CustomerRequest;
import com.liverpool.orders.customer.dto.CustomerResponse;
import com.liverpool.orders.customer.model.Customer;
import com.liverpool.orders.customer.repository.CustomerRepository;
import com.liverpool.orders.exception.BusinessRuleException;
import com.liverpool.orders.exception.ResourceNotFoundException;
import com.liverpool.orders.order.repository.OrderRepository;

@Service
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final OrderRepository orderRepository;

    public CustomerService(
            CustomerRepository customerRepository,
            OrderRepository orderRepository
    ) {
        this.customerRepository = customerRepository;
        this.orderRepository = orderRepository;
    }

    public CustomerResponse create(CustomerRequest request) {
        String email = normalizeEmail(request.email());

        if (customerRepository.existsByEmailIgnoreCase(email)) {
            throw new BusinessRuleException(
                    "Ya existe un cliente con ese correo electrónico"
            );
        }

        Instant now = Instant.now();

        Customer customer = new Customer(
                normalizeName(request.firstName()),
                normalizeName(request.lastName()),
                normalizeName(request.motherLastName()),
                email
        );

        customer.setCreatedAt(now);
        customer.setUpdatedAt(now);

        try {
            return CustomerResponse.from(customerRepository.save(customer));
        } catch (DuplicateKeyException exception) {
            throw new BusinessRuleException(
                    "Ya existe un cliente con ese correo electrónico"
            );
        }
    }

    public PageResponse<CustomerResponse> findAll(
            String search,
            int page,
            int size
    ) {
        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by(Sort.Direction.DESC, "createdAt")
        );

        Page<Customer> customers;

        if (!StringUtils.hasText(search)) {
            customers = customerRepository.findAll(pageable);
        } else {
            String term = search.trim();

            customers =
                    customerRepository
                            .findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCaseOrMotherLastNameContainingIgnoreCaseOrEmailContainingIgnoreCase(
                                    term, term, term, term, pageable
                            );
        }

        return PageResponse.from(customers, CustomerResponse::from);
    }

    public CustomerResponse findById(String id) {
        return CustomerResponse.from(getCustomer(id));
    }

    public CustomerResponse update(
            String id,
            CustomerRequest request
    ) {
        Customer customer = getCustomer(id);
        String email = normalizeEmail(request.email());

        customerRepository.findByEmailIgnoreCase(email)
                .filter(existing -> !existing.getId().equals(id))
                .ifPresent(existing -> {
                    throw new BusinessRuleException(
                            "Ya existe un cliente con ese correo electrónico"
                    );
                });

        customer.setFirstName(normalizeName(request.firstName()));
        customer.setLastName(normalizeName(request.lastName()));
        customer.setMotherLastName(normalizeName(request.motherLastName()));
        customer.setEmail(email);
        customer.setUpdatedAt(Instant.now());

        try {
            return CustomerResponse.from(customerRepository.save(customer));
        } catch (DuplicateKeyException exception) {
            throw new BusinessRuleException(
                    "Ya existe un cliente con ese correo electrónico"
            );
        }
    }

    public void delete(String id) {
        Customer customer = getCustomer(id);

        if (orderRepository.existsByCustomerId(id)) {
            throw new BusinessRuleException(
                    "No se puede eliminar el cliente porque tiene pedidos asociados"
            );
        }

        customerRepository.delete(customer);
    }

    private Customer getCustomer(String id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No se encontró el cliente con ID: " + id
                ));
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private String normalizeName(String name) {
        return name.trim();
    }
}

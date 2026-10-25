package com.liverpool.orders.order.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.liverpool.orders.order.model.Order;
import com.liverpool.orders.order.model.OrderStatus;

public interface OrderRepository extends MongoRepository<Order, String> {

    boolean existsByCustomerId(String customerId);

    List<Order> findByCustomerId(String customerId);

    List<Order> findByStatus(OrderStatus status);
}

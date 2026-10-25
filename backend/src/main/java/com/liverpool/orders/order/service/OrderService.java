package com.liverpool.orders.order.service;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import java.util.regex.Pattern;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import com.liverpool.orders.common.dto.PageResponse;
import com.liverpool.orders.customer.dto.CustomerResponse;
import com.liverpool.orders.customer.model.Customer;
import com.liverpool.orders.customer.repository.CustomerRepository;
import com.liverpool.orders.exception.ResourceNotFoundException;
import com.liverpool.orders.order.dto.OrderRequest;
import com.liverpool.orders.order.dto.OrderResponse;
import com.liverpool.orders.order.model.Order;
import com.liverpool.orders.order.model.OrderSource;
import com.liverpool.orders.order.model.OrderStatus;
import com.liverpool.orders.order.repository.OrderRepository;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final CustomerRepository customerRepository;
    private final MongoTemplate mongoTemplate;

    public OrderService(
            OrderRepository orderRepository,
            CustomerRepository customerRepository,
            MongoTemplate mongoTemplate
    ) {
        this.orderRepository = orderRepository;
        this.customerRepository = customerRepository;
        this.mongoTemplate = mongoTemplate;
    }

    public OrderResponse create(OrderRequest request) {
        Customer customer = getCustomer(request.customerId());
        Instant now = Instant.now();

        Order order = new Order();
        order.setOrderNumber(generateOrderNumber());
        order.setCustomerId(customer.getId());
        order.setShippingAddress(toAddress(request.shippingAddress()));
        order.setItems(toItems(request.items()));
        order.setSource(request.source());
        order.setStatus(
                request.status() == null
                        ? OrderStatus.CREATED
                        : request.status()
        );
        order.setTotal(calculateTotal(order.getItems()));
        order.setCreatedAt(now);
        order.setUpdatedAt(now);

        Order saved = orderRepository.save(order);
        return toResponse(saved);
    }

    public PageResponse<OrderResponse> findAll(
            String search,
            OrderStatus status,
            int page,
            int size
    ) {
        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by(Sort.Direction.DESC, "createdAt")
        );

        List<Criteria> filters = new ArrayList<>();

        if (status != null) {
            filters.add(Criteria.where("status").is(status));
        }

        if (StringUtils.hasText(search)) {
            String term = search.trim();
            String regex = Pattern.quote(term);
            List<String> customerIds = findMatchingCustomerIds(term);

            Criteria orderSearch = Criteria.where("orderNumber")
                    .regex(regex, "i");

            if (!customerIds.isEmpty()) {
                filters.add(new Criteria().orOperator(
                        orderSearch,
                        Criteria.where("customerId").in(customerIds)
                ));
            } else {
                filters.add(orderSearch);
            }
        }

        Query query;

        if (filters.isEmpty()) {
            query = new Query();
        } else if (filters.size() == 1) {
            query = new Query(filters.get(0));
        } else {
            query = new Query(
                    new Criteria().andOperator(filters.toArray(Criteria[]::new))
            );
        }

        long total = mongoTemplate.count(query, Order.class);
        List<Order> orders = mongoTemplate.find(
                query.with(pageable),
                Order.class
        );

        List<OrderResponse> content = orders.stream()
                .map(this::toResponse)
                .toList();

        return PageResponse.of(content, page, size, total);
    }

    public OrderResponse findById(String id) {
        return toResponse(getOrder(id));
    }

    public OrderResponse update(String id, OrderRequest request) {
        Order order = getOrder(id);
        Customer customer = getCustomer(request.customerId());

        order.setCustomerId(customer.getId());
        order.setShippingAddress(toAddress(request.shippingAddress()));
        order.setItems(toItems(request.items()));
        order.setSource(request.source());

        if (request.status() != null) {
            order.setStatus(request.status());
        }

        order.setTotal(calculateTotal(order.getItems()));
        order.setUpdatedAt(Instant.now());

        return toResponse(orderRepository.save(order));
    }

    public void delete(String id) {
        Order order = getOrder(id);
        orderRepository.delete(order);
    }

    private Order getOrder(String id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No se encontró el pedido con ID: " + id
                ));
    }

    private Customer getCustomer(String id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No se encontró el cliente con ID: " + id
                ));
    }

    private List<String> findMatchingCustomerIds(String search) {
        String regex = Pattern.quote(search);

        Criteria customerSearch = new Criteria().orOperator(
                Criteria.where("firstName").regex(regex, "i"),
                Criteria.where("lastName").regex(regex, "i"),
                Criteria.where("motherLastName").regex(regex, "i"),
                Criteria.where("email").regex(regex, "i")
        );

        return mongoTemplate.find(
                        Query.query(customerSearch),
                        Customer.class
                )
                .stream()
                .map(Customer::getId)
                .toList();
    }

    private OrderResponse toResponse(Order order) {
        Customer customer = getCustomer(order.getCustomerId());

        return OrderResponse.from(
                order,
                CustomerResponse.from(customer)
        );
    }

    private Order.ShippingAddress toAddress(
            OrderRequest.ShippingAddressRequest request
    ) {
        Order.ShippingAddress address = new Order.ShippingAddress();

        address.setStreet(request.street().trim());
        address.setExteriorNumber(request.exteriorNumber().trim());
        address.setInteriorNumber(trimToNull(request.interiorNumber()));
        address.setNeighborhood(request.neighborhood().trim());
        address.setCity(request.city().trim());
        address.setState(request.state().trim());
        address.setPostalCode(request.postalCode().trim());
        address.setReferences(trimToNull(request.references()));

        return address;
    }

    private List<Order.OrderItem> toItems(
            List<OrderRequest.OrderItemRequest> requests
    ) {
        return requests.stream()
                .map(request -> {
                    Order.OrderItem item = new Order.OrderItem();

                    item.setProductCode(request.productCode().trim());
                    item.setProductName(request.productName().trim());
                    item.setQuantity(request.quantity());
                    item.setUnitPrice(request.unitPrice());

                    return item;
                })
                .toList();
    }

    private BigDecimal calculateTotal(List<Order.OrderItem> items) {
        return items.stream()
                .map(item -> item.getUnitPrice().multiply(
                        BigDecimal.valueOf(item.getQuantity())
                ))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private String generateOrderNumber() {
        return "LIV-" + UUID.randomUUID()
                .toString()
                .replace("-", "")
                .toUpperCase(Locale.ROOT);
    }

    private String trimToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        return value.trim();
    }
}

package com.liverpool.orders.order.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

import com.liverpool.orders.customer.dto.CustomerResponse;
import com.liverpool.orders.order.model.Order;
import com.liverpool.orders.order.model.OrderSource;
import com.liverpool.orders.order.model.OrderStatus;

public record OrderResponse(
        String id,
        String orderNumber,
        CustomerResponse customer,
        ShippingAddressResponse shippingAddress,
        List<OrderItemResponse> items,
        OrderSource source,
        OrderStatus status,
        BigDecimal total,
        Instant createdAt,
        Instant updatedAt
) {

    public static OrderResponse from(
            Order order,
            CustomerResponse customer
    ) {
        Order.ShippingAddress address = order.getShippingAddress();

        ShippingAddressResponse addressResponse =
                new ShippingAddressResponse(
                        address.getStreet(),
                        address.getExteriorNumber(),
                        address.getInteriorNumber(),
                        address.getNeighborhood(),
                        address.getCity(),
                        address.getState(),
                        address.getPostalCode(),
                        address.getReferences()
                );

        List<OrderItemResponse> itemResponses =
                order.getItems().stream()
                        .map(item -> new OrderItemResponse(
                                item.getProductCode(),
                                item.getProductName(),
                                item.getQuantity(),
                                item.getUnitPrice(),
                                item.getUnitPrice().multiply(
                                        BigDecimal.valueOf(item.getQuantity())
                                )
                        ))
                        .toList();

        return new OrderResponse(
                order.getId(),
                order.getOrderNumber(),
                customer,
                addressResponse,
                itemResponses,
                order.getSource(),
                order.getStatus(),
                order.getTotal(),
                order.getCreatedAt(),
                order.getUpdatedAt()
        );
    }

    public record ShippingAddressResponse(
            String street,
            String exteriorNumber,
            String interiorNumber,
            String neighborhood,
            String city,
            String state,
            String postalCode,
            String references
    ) {
    }

    public record OrderItemResponse(
            String productCode,
            String productName,
            int quantity,
            BigDecimal unitPrice,
            BigDecimal subtotal
    ) {
    }
}

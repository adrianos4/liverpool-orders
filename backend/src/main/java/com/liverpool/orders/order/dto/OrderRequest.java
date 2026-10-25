package com.liverpool.orders.order.dto;

import java.math.BigDecimal;
import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import com.liverpool.orders.order.model.OrderSource;
import com.liverpool.orders.order.model.OrderStatus;

public record OrderRequest(

        @NotBlank(message = "El cliente es obligatorio")
        String customerId,

        @NotNull(message = "La dirección de entrega es obligatoria")
        @Valid
        ShippingAddressRequest shippingAddress,

        @NotEmpty(message = "El pedido debe contener al menos un producto")
        List<@Valid OrderItemRequest> items,

        @NotNull(message = "El origen del pedido es obligatorio")
        OrderSource source,

        OrderStatus status

) {

    public record ShippingAddressRequest(

            @NotBlank(message = "La calle es obligatoria")
            @Size(max = 120)
            String street,

            @NotBlank(message = "El número exterior es obligatorio")
            @Size(max = 20)
            String exteriorNumber,

            @Size(max = 20)
            String interiorNumber,

            @NotBlank(message = "La colonia es obligatoria")
            @Size(max = 100)
            String neighborhood,

            @NotBlank(message = "La ciudad es obligatoria")
            @Size(max = 100)
            String city,

            @NotBlank(message = "El estado es obligatorio")
            @Size(max = 100)
            String state,

            @NotBlank(message = "El código postal es obligatorio")
            @Size(min = 5, max = 10)
            String postalCode,

            @Size(max = 250)
            String references

    ) {
    }

    public record OrderItemRequest(

            @NotBlank(message = "El código del producto es obligatorio")
            @Size(max = 50)
            String productCode,

            @NotBlank(message = "El nombre del producto es obligatorio")
            @Size(max = 150)
            String productName,

            @Min(value = 1, message = "La cantidad mínima es 1")
            int quantity,

            @NotNull(message = "El precio unitario es obligatorio")
            @DecimalMin(value = "0.01", message = "El precio debe ser mayor que cero")
            BigDecimal unitPrice

    ) {
    }
}

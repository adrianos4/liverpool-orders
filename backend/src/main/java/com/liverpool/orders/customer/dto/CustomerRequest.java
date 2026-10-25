package com.liverpool.orders.customer.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CustomerRequest(

        @NotBlank(message = "El nombre es obligatorio")
        @Size(max = 80, message = "El nombre no puede superar 80 caracteres")
        String firstName,

        @NotBlank(message = "El apellido paterno es obligatorio")
        @Size(max = 80, message = "El apellido paterno no puede superar 80 caracteres")
        String lastName,

        @NotBlank(message = "El apellido materno es obligatorio")
        @Size(max = 80, message = "El apellido materno no puede superar 80 caracteres")
        String motherLastName,

        @NotBlank(message = "El correo electrónico es obligatorio")
        @Email(message = "El correo electrónico no tiene un formato válido")
        @Size(max = 254, message = "El correo electrónico es demasiado largo")
        String email

) {
}

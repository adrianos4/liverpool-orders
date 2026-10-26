
package com.liverpool.orders.order;

import com.liverpool.orders.order.controller.OrderController;
import com.liverpool.orders.order.service.OrderService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.verifyNoInteractions;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(OrderController.class)
class OrderControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private OrderService orderService;

    @Test
    void createOrderWithEmptyBodyReturnsBadRequest() throws Exception {
        mockMvc.perform(post("/api/v1/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.validationErrors").exists());

        verifyNoInteractions(orderService);
    }

    @Test
    void createOrderWithInvalidItemQuantityReturnsBadRequest()
            throws Exception {

        String requestBody = """
                {
                  "customerId": "customer-123",
                  "shippingAddress": {
                    "street": "Avenida Insurgentes",
                    "exteriorNumber": "100",
                    "interiorNumber": "",
                    "neighborhood": "Del Valle",
                    "city": "Ciudad de Mexico",
                    "state": "CDMX",
                    "postalCode": "03100",
                    "references": "Cerca del parque"
                  },
                  "items": [
                    {
                      "productCode": "SKU-001",
                      "productName": "Producto de prueba",
                      "quantity": 0,
                      "unitPrice": 250.00
                    }
                  ],
                  "source": "WEB",
                  "status": "CREATED"
                }
                """;

        mockMvc.perform(post("/api/v1/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.validationErrors").exists());

        verifyNoInteractions(orderService);
    }

    @Test
    void listOrdersWithInvalidStatusReturnsBadRequest() throws Exception {
        mockMvc.perform(get("/api/v1/orders")
                        .param("status", "INVALID_STATUS"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));

        verifyNoInteractions(orderService);
    }

    @Test
    void listOrdersWithPageSizeAboveLimitReturnsBadRequest()
            throws Exception {

        mockMvc.perform(get("/api/v1/orders")
                        .param("page", "0")
                        .param("size", "101"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));

        verifyNoInteractions(orderService);
    }
}

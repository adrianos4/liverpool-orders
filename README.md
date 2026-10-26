# Liverpool Orders Management System

## Overview

The Liverpool Orders Management System is a full-stack application designed to manage customer information and orders received through the company's website and mobile application.

The system provides a web interface for managing customers and orders, supported by a REST API and MongoDB database.

## Features

### Customer Management

- Create new customers.
- View and search customer records.
- Retrieve customer details.
- Update customer information.
- Delete customers when they are not associated with existing orders.
- Validate customer information, including email addresses.

### Order Management

- Create orders associated with registered customers.
- Manage delivery addresses and order items.
- Calculate order totals on the backend.
- Track order status.
- Identify whether an order originated from the website or mobile application.
- Search and filter orders.
- Retrieve, update, and delete orders.

### Application Interface

- Dashboard for accessing the main application sections.
- Customer management interface.
- Order management interface.
- Search and pagination support.
- Form validation and error handling.

## Technology Stack

### Frontend

- React
- TypeScript
- Vite
- CSS

### Backend

- Java
- Spring Boot
- Spring Web
- Spring Data MongoDB
- Maven

### Database and Development Tools

- MongoDB
- Docker
- Docker Compose
- Node.js and npm

## Prerequisites

Install the following software before running the application:

- **Java Development Kit (JDK):** Java 21 or the version specified in the backend build configuration.
- **Maven:** Required to build and run the backend, unless the project includes a Maven Wrapper.
- **Node.js and npm:** Required to install dependencies and run the frontend.
- **Docker Desktop:** Required to run MongoDB through Docker Compose.

Ensure Docker Desktop is running before starting the database container.

## Getting Started

### 1. Start MongoDB

From the root directory of the project, run:

```bash
docker compose up -d
```

Verify the running containers:

```bash
docker compose ps
```

To inspect the database container logs, use:

```bash
docker compose logs -f mongodb
```

The MongoDB connection string used by the backend is:

mongodb://localhost:27017/liverpool_orders

If the Docker Compose configuration uses a different MongoDB service name or connection string, use the values defined in that configuration.

### 2. Configure and Run the Backend

Open a terminal and navigate to the backend directory:

```bash
cd backend
```

Build the application and run its tests:

```bash
mvn clean verify
```

Start the Spring Boot application:

```bash
mvn spring-boot:run
```

The backend is expected to run at:

```text
http://localhost:8080
```

The MongoDB connection settings are configured in the application's configuration file. Ensure they match the running database instance.

### 3. Configure and Run the Frontend

Open a separate terminal and navigate to the frontend directory:

```bash
cd frontend
```

Install the dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Vite will display the local URL for accessing the application. The default development address is:

```text
http://localhost:5173
```

To create a production build, run:

```bash
npm run build
```

## API Documentation

The backend exposes a REST API under the `/api/v1` prefix.


### Interactive API Documentation

The backend uses OpenAPI 3 and Swagger UI to document and explore the REST API.

Once the backend is running, access:

- **Swagger UI:** http://localhost:8080/swagger-ui/index.html
- **OpenAPI JSON:** http://localhost:8080/v3/api-docs

Swagger UI allows developers to inspect the available endpoints, review request and response schemas, and execute API operations against the running backend.

The OpenAPI document is generated from the backend controllers and their request and response types.

### Customer Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/customers` | Create a customer |
| `GET` | `/api/v1/customers` | Retrieve customers with pagination and optional search |
| `GET` | `/api/v1/customers/{id}` | Retrieve a customer by ID |
| `PUT` | `/api/v1/customers/{id}` | Update a customer |
| `DELETE` | `/api/v1/customers/{id}` | Delete a customer |

The customer resource includes the following fields:

- `firstName`
- `lastName`
- `motherLastName`
- `email`

### Order Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/orders` | Create an order |
| `GET` | `/api/v1/orders` | Retrieve orders with pagination and optional filters |
| `GET` | `/api/v1/orders/{id}` | Retrieve an order by ID |
| `PUT` | `/api/v1/orders/{id}` | Update an order |
| `DELETE` | `/api/v1/orders/{id}` | Delete an order |

Order records support customer association, delivery address information, order items, order source, status, and calculated totals.

### Order Statuses

The supported order statuses are:

- `CREATED`
- `PROCESSING`
- `SHIPPED`
- `DELIVERED`
- `CANCELLED`

### Order Sources

Orders can originate from:

- `WEB`
- `APP`

### Pagination and Filtering

Customer and order listing endpoints support pagination using the `page` and `size` query parameters. Pagination is zero-based, and the maximum supported page size is 100.

The customer listing endpoint supports search through the `search` parameter.

The order listing endpoint supports search and filtering by status.

Paginated responses contain the following fields:

- `content`: Records returned for the requested page.
- `page`: Current zero-based page number.
- `size`: Number of records requested per page.
- `totalElements`: Total number of matching records.
- `totalPages`: Total number of available pages.

## Validation and Error Handling

The backend validates incoming data and returns structured error responses when requests cannot be processed.

The application includes centralized exception handling for errors such as:

- Invalid request data.
- Resources that cannot be found.
- Conflicts with existing data or business rules.
- Unexpected server errors.

Customer deletion is restricted when the customer is associated with an existing order.

## Testing and Build Verification

### Backend

From the `backend` directory, run:

```bash
mvn clean test
```

To execute the build lifecycle, including verification steps:

```bash
mvn clean verify
```

### Frontend

From the `frontend` directory, install dependencies and create a production build:

```bash
npm install
npm run build
```

Run these commands to check for backend test failures and frontend compilation or build errors before delivering the application.

## Troubleshooting

### MongoDB Connection Issues

- Ensure Docker Desktop is running.
- Check that the MongoDB container is active.
- Verify the MongoDB URI in the backend configuration.
- Check the container logs for startup or database errors.

### Backend Startup Issues

- Verify that the required Java version is installed.
- Confirm that Maven is available.
- Check the application configuration for database connection settings.
- Review the terminal output for compilation errors or port conflicts.

### Frontend Startup Issues

- Verify that Node.js and npm are installed.
- Run `npm install` from the frontend directory.
- Confirm that the frontend development server starts successfully.
- Check the browser console and terminal for errors.

### API Connectivity Issues

- Ensure the backend is running.
- Verify the API base URL configured in the frontend.
- Check that the backend CORS configuration permits requests from the frontend development origin.

## Stopping the Application

Stop the frontend and backend development servers using `Ctrl+C` in their respective terminals.

To stop the Docker containers, run the following command from the project root:

```bash
docker compose down
```

This stops the containers without deleting the persisted database volume.

## License

This project was developed as a technical assessment for the management of customers and orders.

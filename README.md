# Liverpool Orders

Full-stack order management application built with Java, Spring Boot, React, TypeScript, and MongoDB.

## Technology stack

- Java 21
- Spring Boot 3
- Maven
- MongoDB
- React
- TypeScript
- Vite
- Docker Compose

## Prerequisites

- Java 21
- Maven 3.9+
- Node.js LTS and npm
- Docker Desktop
- Git

## Project structure

```text
liverpool-orders/
├── backend/
├── frontend/
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

## Run MongoDB

From the repository root:

```bash
docker compose up -d mongodb
docker compose ps
```

Wait for MongoDB to become healthy.

## Run the backend

Open a terminal in `backend`:

```bash
mvn spring-boot:run
```

Backend URL: http://localhost:8080

Health check: http://localhost:8080/actuator/health

System diagnostic endpoint: http://localhost:8080/api/v1/system/status

## Run the frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend URL: http://localhost:5173

## Configuration

The backend supports these environment variables:

- `SERVER_PORT`
- `MONGODB_URI`
- `FRONTEND_ORIGIN`

The frontend supports:

- `VITE_API_BASE_URL`

See `.env.example` for the local defaults.

## Current implementation

Phase 1 establishes the local development environment, React application, Spring Boot application, MongoDB connectivity, and an initial system status screen.

Customer and order CRUD endpoints, API documentation, automated domain tests, and production deployment will be added in subsequent phases.

## Security

This local development environment is not intended for production. Do not commit credentials, production connection strings, or real customer information.

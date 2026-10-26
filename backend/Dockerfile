# Build the Spring Boot application.
FROM maven:3.9.9-eclipse-temurin-21 AS build

WORKDIR /app

COPY pom.xml .
COPY src ./src

RUN mvn -B -DskipTests package

# Run the packaged application on a smaller Java runtime image.
FROM eclipse-temurin:21-jre

WORKDIR /app

RUN groupadd --system app \
    && useradd --system --gid app app

COPY --from=build /app/target/orders-0.0.1-SNAPSHOT.jar app.jar

USER app

EXPOSE 8080

ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75.0", "-jar", "/app/app.jar"]

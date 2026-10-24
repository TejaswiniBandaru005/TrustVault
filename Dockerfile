# ==============================================================================
# TrustVault - Multi-Stage Production Dockerfile
# Builds the Vite + React frontend, compiles the Spring Boot backend,
# and packages everything into an ultra-lean, secure OpenJDK 21 container.
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Build Frontend Assets
# ------------------------------------------------------------------------------
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

# Install dependencies
COPY frontend/package*.json ./
RUN npm ci

# Copy frontend source and build static distribution
COPY frontend/ ./
RUN npm run build

# ------------------------------------------------------------------------------
# Stage 2: Build Spring Boot Backend
# ------------------------------------------------------------------------------
FROM eclipse-temurin:21-jdk-alpine AS backend-builder
WORKDIR /app/backend

# Copy Maven wrapper and POM to leverage Docker layer caching
COPY trustvault-backend/.mvn/ .mvn/
COPY trustvault-backend/mvnw trustvault-backend/pom.xml ./
RUN chmod +x mvnw && ./mvnw dependency:go-offline -B

# Copy backend source code
COPY trustvault-backend/src/ src/

# Embed compiled frontend assets directly into Spring Boot static resources
COPY --from=frontend-builder /app/frontend/dist/ src/main/resources/static/

# Package executable production JAR
RUN ./mvnw clean package -DskipTests -B

# ------------------------------------------------------------------------------
# Stage 3: Minimal Production Runtime
# ------------------------------------------------------------------------------
FROM eclipse-temurin:21-jre-alpine AS runner
WORKDIR /app

# Create unprivileged system user for zero-trust runtime container security
RUN addgroup -S trustvault && adduser -S trustvault -G trustvault

# Copy executable JAR from build stage
COPY --from=backend-builder /app/backend/target/*.jar app.jar
RUN chown -R trustvault:trustvault /app

USER trustvault

# Expose default HTTP application port
EXPOSE 8080

# Production JVM flags for optimal container memory management & security
ENV JAVA_OPTS="-XX:+UseG1GC -XX:+OptimizeStringConcat -XX:MaxRAMPercentage=75.0 -Djava.security.egd=file:/dev/./urandom"

# Healthcheck to verify service availability
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:8080/api/health || exit 1

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]

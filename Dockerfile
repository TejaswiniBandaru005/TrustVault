# ==============================================================================
# TrustVault - Enterprise Cloud & Production Dockerfile
# Optimized for:
#  - Render Cloud Backend Deployment (Dynamic $PORT binding, Neon AWS PostgreSQL)
#  - Vercel Frontend Integration (CORS, API Proxy Routing)
#  - Zero-Trust Rootless Container Security (Eclipse Temurin JDK 21 Alpine)
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Build Frontend Assets (Vite + React)
# ------------------------------------------------------------------------------
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
# Pass production environment variables for Vite bundle
ENV NODE_ENV=production
RUN npm run build

# ------------------------------------------------------------------------------
# Stage 2: Build Spring Boot Backend
# ------------------------------------------------------------------------------
FROM eclipse-temurin:21-jdk-alpine AS backend-builder
WORKDIR /app/backend

# Copy Maven wrapper & POM to leverage layer caching
COPY trustvault-backend/.mvn/ .mvn/
COPY trustvault-backend/mvnw trustvault-backend/pom.xml ./
RUN chmod +x mvnw && ./mvnw dependency:go-offline -B

# Copy backend source
COPY trustvault-backend/src/ src/

# Embed compiled Vite frontend into static resources as fallback
COPY --from=frontend-builder /app/frontend/dist/ src/main/resources/static/

# Build production JAR
RUN ./mvnw clean package -DskipTests -B

# ------------------------------------------------------------------------------
# Stage 3: Minimal, High-Security Production Runtime
# ------------------------------------------------------------------------------
FROM eclipse-temurin:21-jre-alpine AS runner
WORKDIR /app

# Create unprivileged system user for zero-trust security
RUN addgroup -S trustvault && adduser -S trustvault -G trustvault

# Create upload directory with proper permissions
RUN mkdir -p uploads/documents && chown -R trustvault:trustvault /app

# Copy executable JAR
COPY --from=backend-builder /app/backend/target/*.jar app.jar
RUN chown trustvault:trustvault app.jar

USER trustvault

# Expose Render standard port / default port
EXPOSE 8080 10000

# Production JVM flags with container memory limits & fast entropy
ENV JAVA_OPTS="-XX:+UseG1GC -XX:+OptimizeStringConcat -XX:MaxRAMPercentage=75.0 -Djava.security.egd=file:/dev/./urandom"

# Healthcheck supporting dynamic Render PORT (defaults to 8080)
HEALTHCHECK --interval=30s --timeout=5s --start-period=45s --retries=3 \
  CMD wget --quiet --tries=1 --spider "http://127.0.0.1:${PORT:-8080}/api/health" || exit 1

# Render dynamically injects $PORT environment variable; Spring Boot binds to it
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -Dserver.port=${PORT:-8080} -jar app.jar"]

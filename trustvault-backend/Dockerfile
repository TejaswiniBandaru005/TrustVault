# ==============================================================================
# TrustVault Backend - Render Cloud Web Service Dockerfile
# Builds and deploys the Spring Boot 3 API with Neon PostgreSQL on Render
# ==============================================================================

FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /app

COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x mvnw && ./mvnw dependency:go-offline -B

COPY src/ src/
RUN ./mvnw clean package -DskipTests -B

# Runtime Image
FROM eclipse-temurin:21-jre-alpine AS runner
WORKDIR /app

RUN addgroup -S trustvault && adduser -S trustvault -G trustvault
RUN mkdir -p uploads/documents && chown -R trustvault:trustvault /app

COPY --from=builder /app/target/*.jar app.jar
RUN chown trustvault:trustvault app.jar

USER trustvault

EXPOSE 8080 10000

ENV JAVA_OPTS="-XX:+UseG1GC -XX:+OptimizeStringConcat -XX:MaxRAMPercentage=75.0 -Djava.security.egd=file:/dev/./urandom"

HEALTHCHECK --interval=30s --timeout=5s --start-period=45s --retries=3 \
  CMD wget --quiet --tries=1 --spider "http://127.0.0.1:${PORT:-8080}/api/health" || exit 1

# Render dynamically injects $PORT environment variable
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -Dserver.port=${PORT:-8080} -jar app.jar"]

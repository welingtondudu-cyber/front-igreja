# ─── STAGE 1: Build do JAR ────────────────────────────────────────────────────
FROM maven:3.9.6-eclipse-temurin-17-alpine AS builder

WORKDIR /app

# Copia o pom.xml e baixa dependências (cache de layer)
COPY pom.xml .
RUN mvn dependency:go-offline -q

# Copia o código-fonte e gera o JAR
COPY src ./src
RUN mvn package -DskipTests -q

# ─── STAGE 2: Imagem de execução leve ─────────────────────────────────────────
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Copia apenas o JAR gerado
COPY --from=builder /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]

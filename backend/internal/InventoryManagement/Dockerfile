# Stage 1: Build the Go binary
FROM golang:1.23 AS builder

WORKDIR /app

# Copy go.mod and go.sum to download dependencies
COPY ./backend/internal/InventoryManagement/go.mod ./backend/internal/InventoryManagement/go.sum ./
RUN go mod download

# Copy the entire code for the `loyverse` service
COPY ./backend/internal/InventoryManagement /app

# Build the binary and ensure it's statically linked
RUN CGO_ENABLED=0 go build -o inventory-management /app/cmd/main.go

# Stage 2: Create the final runtime image
FROM alpine:latest

# Install certificates and timezone data
RUN apk --no-cache add ca-certificates tzdata

# Set timezone
ENV TZ=Asia/Bangkok

WORKDIR /root/

# Copy the binary from the builder stage
COPY --from=builder /app/inventory-management .

# Copy the credentials.json
COPY ./backend/internal/InventoryManagement/credentials.json /root/credentials.json

# Verify the binary and credentials.json
RUN ls -la /root/inventory-management
RUN ls -la /root/credentials.json

# Run the binary
CMD ["./inventory-management"]

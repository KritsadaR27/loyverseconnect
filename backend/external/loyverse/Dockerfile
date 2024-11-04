#Loyverse Dockerfile Stage 1: Build the Go binary
FROM golang:1.23 AS builder

WORKDIR /app

# Copy go.mod and go.sum to download dependencies
COPY ./backend/external/loyverse/go.mod ./backend/external/loyverse/go.sum ./
RUN go mod download

# Copy the entire code for the `loyverse` service
COPY ./backend/external/loyverse /app

# Build the binary and ensure it's statically linked
RUN CGO_ENABLED=0 go build -o loyverse /app/cmd/main.go

# Stage 2: Create the final runtime image
FROM alpine:latest

# Install certificates and timezone data
RUN apk --no-cache add ca-certificates tzdata

# Set timezone
ENV TZ=Asia/Bangkok

WORKDIR /root/

# Copy the binary from the builder stage
COPY --from=builder /app/loyverse .

# Verify the binary
RUN ls -la /root/loyverse
RUN chmod +x /root/loyverse

# Run the binary
CMD ["./loyverse"]

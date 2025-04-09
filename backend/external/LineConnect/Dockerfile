# Stage 1: Build the Go binary
FROM golang:1.23 AS builder

# Set the working directory in the container
WORKDIR /app

# Copy go.mod and go.sum to download dependencies
COPY ./backend/internal/LineConnect/go.mod ./backend/internal/LineConnect/go.sum ./
RUN go mod download

# Copy the source code into the container
COPY ./backend/internal/LineConnect /app

# Build the Go binary
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o line-connect cmd/main.go

# Stage 2: Create the final runtime image
FROM alpine:latest

# Install certificates and timezone data
RUN apk --no-cache add ca-certificates tzdata

# Set timezone
ENV TZ=Asia/Bangkok

# Set the working directory for the runtime image
WORKDIR /root/

# Copy the binary from the builder stage
COPY --from=builder /app/line-connect .

# Expose port (modify if necessary)
EXPOSE 8085

# Run the binary
CMD ["./line-connect"]
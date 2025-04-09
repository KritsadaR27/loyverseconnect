#airtable-connect Dockerfile Stage 1: Build the Go binary
FROM golang:1.23 AS builder

WORKDIR /app

# Copy go.mod and go.sum to download dependencies
COPY ./backend/external/airtable-connect/go.mod ./backend/external/airtable-connect/go.sum ./
RUN go mod download

# Copy the entire code for the `airtable-connect` service
COPY ./backend/external/airtable-connect /app

# Build the binary and ensure it's statically linked
RUN CGO_ENABLED=0 go build -o airtable-connect /app/cmd/main.go

# Stage 2: Create the final runtime image
FROM alpine:latest

# Install certificates and timezone data
RUN apk --no-cache add ca-certificates tzdata

# Set timezone
ENV TZ=Asia/Bangkok

WORKDIR /root/

# Copy the binary from the builder stage
COPY --from=builder /app/airtable-connect .

# Verify the binary
RUN ls -la /root/airtable-connect
RUN chmod +x /root/airtable-connect

# Run the binary
CMD ["./airtable-connect"]

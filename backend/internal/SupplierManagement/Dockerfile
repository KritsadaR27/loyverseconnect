# Stage 1: Build the Go binary
FROM golang:1.23 AS builder

WORKDIR /app

# Copy go.mod and go.sum
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Debug: ตรวจสอบโครงสร้างไฟล์
RUN ls -la
RUN find /app -type f -name "main.go"

# Build with correct path (หลังจากรู้ path ที่ถูกต้องแล้ว)
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o supplier-management ./backend/internal/SupplierManagement/cmd/main.go

# Stage 2: Create the final runtime image
FROM alpine:latest

# Install certificates and timezone data
RUN apk --no-cache add ca-certificates tzdata

# Set timezone
ENV TZ=Asia/Bangkok

# Set the working directory for the runtime image
WORKDIR /root/

# Copy the binary from the builder stage
COPY --from=builder /app/supplier-management .

# Expose port
EXPOSE 8083

# Run the binary
CMD ["./supplier-management"]

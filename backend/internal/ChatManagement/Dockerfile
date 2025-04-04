# Stage 1: Build the Go binary
FROM golang:1.23 AS builder

# ติดตั้ง git และ curl เพื่อใช้สำหรับ go get และดาวน์โหลดแพ็กเกจ
RUN apt-get update && apt-get install -y git curl

WORKDIR /app

# Copy go.mod and go.sum เพื่อดาวน์โหลด dependencies ก่อน
COPY ./backend/internal/ChatManagement/go.mod ./backend/internal/ChatManagement/go.sum ./
RUN go mod download

# ติดตั้ง gorilla/websocket
RUN go get -u github.com/gorilla/websocket

# Copy โค้ดทั้งหมดที่เหลือของ ChatManagement
COPY ./backend/internal/ChatManagement /app

# Build the binary
RUN CGO_ENABLED=0 go build -o chat-management /app/cmd/main.go

# Stage 2: Create the final runtime image
FROM alpine:latest

# ติดตั้ง dependencies ที่จำเป็น
RUN apk --no-cache add ca-certificates tzdata

WORKDIR /root/

# Copy binary จาก builder stage
COPY --from=builder /app/chat-management .

# Copy credentials.json ถ้ามีการเชื่อมต่อ Google Sheets
COPY ./backend/internal/ChatManagement/credentials.json /root/credentials.json

# เริ่มต้นแอปพลิเคชัน
CMD ["./chat-management"]

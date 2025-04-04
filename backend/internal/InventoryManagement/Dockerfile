# Stage 1: Build the Go binary
FROM golang:1.23 AS builder

# ติดตั้ง git และ curl เพื่อใช้สำหรับ go get และดาวน์โหลดแพ็กเกจ
RUN apt-get update && apt-get install -y git curl

WORKDIR /app

# Copy go.mod and go.sum เพื่อดาวน์โหลด dependencies ก่อน
COPY go.mod go.sum ./
RUN go mod download

# ติดตั้ง gorilla/websocket
RUN go get -u github.com/gorilla/websocket

# Copy โค้ดทั้งหมด
COPY . .

# ตรวจสอบว่าไฟล์ main.go อยู่ที่ไหน และแสดง directory structure
RUN find /app -name "main.go"
RUN ls -la /app
RUN ls -la /app/backend/internal/InventoryManagement/cmd 2>/dev/null || echo "Directory not found"

# Build the binary with correct path
# หากพบไฟล์ main.go ใน /app/backend/internal/InventoryManagement/cmd/
RUN CGO_ENABLED=0 go build -o inventory-management ./backend/internal/InventoryManagement/cmd/main.go || \
    # หากพบไฟล์ main.go ใน /app/cmd/
    CGO_ENABLED=0 go build -o inventory-management ./cmd/main.go || \
    # หากพบไฟล์ main.go ใน root directory
    CGO_ENABLED=0 go build -o inventory-management main.go

# Stage 2: Create the final runtime image
FROM alpine:latest

# ติดตั้ง dependencies ที่จำเป็น
RUN apk --no-cache add ca-certificates tzdata

WORKDIR /root/

# Copy binary จาก builder stage
COPY --from=builder /app/inventory-management .

# Copy credentials.json ถ้ามีการเชื่อมต่อ Google Sheets
# ใช้ --from=builder เพื่อให้แน่ใจว่าไฟล์มีอยู่ จาก context ที่ได้ COPY มาแล้ว
COPY --from=builder /app/backend/internal/InventoryManagement/credentials.json /root/credentials.json 2>/dev/null || echo "No credentials file found"

# เริ่มต้นแอปพลิเคชัน
CMD ["./inventory-management"]

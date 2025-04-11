# internal/POManagement/Dockerfile
# เปลี่ยนจาก golang:1.21-alpine เป็น golang:1.23-alpine
FROM golang:1.23 AS builder

WORKDIR /app

# โหลด dependencies ก่อน
COPY go.mod go.sum ./
RUN go mod download

# คัดลอกโค้ดทั้งหมด
COPY ./backend/internal/POManagement /app


# สร้างไฟล์ binary
RUN CGO_ENABLED=0 go build -o po-management /app/cmd/main.go

# สร้าง image สุดท้าย
FROM alpine:latest


RUN apk --no-cache add ca-certificates tzdata

WORKDIR /root

# คัดลอกไฟล์ binary จาก stage ก่อนหน้า
COPY --from=builder /app/po-management .



# expose port ที่ใช้
EXPOSE 8088

# รัน application
CMD ["./po-management"]
FROM golang:1.23-alpine

# ติดตั้ง git และ curl เพื่อดาวน์โหลด air
RUN apk add --no-cache git curl

# ดาวน์โหลดไบนารีของ air และติดตั้ง
RUN curl -sSfL https://github.com/cosmtrek/air/releases/download/v1.43.0/air_1.43.0_Linux_arm64.tar.gz | tar -xz -C /usr/local/bin air

# ตั้งค่า working directory
WORKDIR /app

# คัดลอก go.mod และ go.sum ก่อน เพื่อใช้ caching ในการติดตั้ง dependencies
COPY go.mod go.sum ./
RUN go mod download

# คัดลอกไฟล์โค้ดที่เหลือ
COPY . .

# สร้างไฟล์ main ในตำแหน่งที่ Docker คาดหวัง
RUN go build -o main .

# เปิดพอร์ตที่ต้องการ
EXPOSE 8080

# ใช้ air ในการรันแอปพลิเคชัน
CMD ["air"]

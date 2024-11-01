# ใช้ Node.js base image
FROM node:18-alpine

# กำหนดไดเรกทอรีทำงานเป็น /app
WORKDIR /app

# คัดลอก package.json และ package-lock.json ไปยัง container
COPY package*.json ./

# ติดตั้ง dependencies โดยข้ามการตรวจสอบ peer dependencies
RUN npm install --legacy-peer-deps

# คัดลอกไฟล์ทั้งหมดจากโฟลเดอร์ frontend ไปยัง /app ใน container
COPY . .

# เปิดพอร์ต 3000 เพื่อเข้าถึงแอป
EXPOSE 3000

# เรียกใช้แอปพลิเคชันในโหมด development
CMD ["npm", "run", "dev"]

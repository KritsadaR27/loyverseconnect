package database

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	_ "github.com/lib/pq"
)

func ConnectDB() (*sql.DB, error) {
	// อ่านค่า DATABASE_URL จาก environment variable
	psqlInfo := os.Getenv("DATABASE_URL")
	if psqlInfo == "" {
		log.Fatal("DATABASE_URL environment variable is not set")
		return nil, fmt.Errorf("DATABASE_URL is not set")
	}

	// เปิดการเชื่อมต่อฐานข้อมูล
	db, err := sql.Open("postgres", psqlInfo)
	if err != nil {
		log.Fatalf("Unable to connect: %v", err)
		return nil, err
	}

	// ตั้งค่า Connection Pool
	db.SetMaxOpenConns(25)   // จำนวน connection สูงสุด
	db.SetMaxIdleConns(25)   // จำนวน connection ที่ idle
	db.SetConnMaxLifetime(0) // ค่าต่ออายุ connection (0 คือไม่มีการจำกัด)

	// ทดสอบการเชื่อมต่อ
	err = db.Ping()
	if err != nil {
		return nil, err
	}

	fmt.Println("Successfully connected to database!")
	return db, nil
}

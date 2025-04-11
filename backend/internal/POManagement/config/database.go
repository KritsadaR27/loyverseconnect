// internal/POManagement/config/database.go
package config

import (
	"database/sql"
	"fmt"
	"os"
	"time"
)

// ConnectDB สร้างการเชื่อมต่อกับฐานข้อมูล
func ConnectDB() (*sql.DB, error) {
	// อ่านค่า DATABASE_URL จาก environment variable
	psqlInfo := os.Getenv("DATABASE_URL")
	if psqlInfo == "" {
		return nil, fmt.Errorf("DATABASE_URL environment variable is not set")
	}

	// เปิดการเชื่อมต่อฐานข้อมูล
	db, err := sql.Open("postgres", psqlInfo)
	if err != nil {
		return nil, fmt.Errorf("failed to open database connection: %w", err)
	}

	// ตั้งค่า connection pool
	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(5)
	db.SetConnMaxLifetime(5 * time.Minute)

	// ตรวจสอบการเชื่อมต่อ
	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	return db, nil
}

// getEnv รับค่าจาก environment variable หรือใช้ค่า default
func getEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}

// InitDB สร้างตารางที่จำเป็นสำหรับระบบ
func InitDB(db *sql.DB) error {
	// SQL สำหรับสร้างตาราง
	createTablesSQL := `
    -- สร้างตาราง purchase_orders
    CREATE TABLE IF NOT EXISTS purchase_orders (
        id SERIAL PRIMARY KEY,
        po_number VARCHAR(50) NOT NULL UNIQUE,
        supplier_id VARCHAR(50) NOT NULL,
        supplier_name VARCHAR(255) NOT NULL,
        status VARCHAR(20) NOT NULL,
        delivery_date TIMESTAMP NOT NULL,
        target_coverage_date TIMESTAMP NOT NULL,
        total_amount DECIMAL(10, 2) NOT NULL,
        notes TEXT,
        created_by VARCHAR(50) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    -- สร้างตาราง purchase_order_items
    CREATE TABLE IF NOT EXISTS purchase_order_items (
        id SERIAL PRIMARY KEY,
        po_id INTEGER NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
        item_id VARCHAR(50) NOT NULL,
        item_name VARCHAR(255) NOT NULL,
        supplier_item_name VARCHAR(255),
        quantity INTEGER NOT NULL,
        suggested_quantity INTEGER NOT NULL,
        unit_price DECIMAL(10, 2) NOT NULL,
        total_price DECIMAL(10, 2) NOT NULL,
        buffer INTEGER NOT NULL,
        current_stock DECIMAL(10, 2) NOT NULL,
        projected_stock DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    -- สร้างตาราง buffer_settings
    CREATE TABLE IF NOT EXISTS buffer_settings (
        item_id VARCHAR(50) PRIMARY KEY,
        reserve_quantity INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    -- สร้าง index เพื่อเพิ่มประสิทธิภาพการค้นหา
    CREATE INDEX IF NOT EXISTS idx_po_supplier_id ON purchase_orders(supplier_id);
    CREATE INDEX IF NOT EXISTS idx_po_delivery_date ON purchase_orders(delivery_date);
    CREATE INDEX IF NOT EXISTS idx_po_items_po_id ON purchase_order_items(po_id);
    CREATE INDEX IF NOT EXISTS idx_po_items_item_id ON purchase_order_items(item_id);
    `

	// รันคำสั่ง SQL
	_, err := db.Exec(createTablesSQL)
	return err
}

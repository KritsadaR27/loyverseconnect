package handlers

import (
	"backend/external/loyverse/config"
	"backend/external/loyverse/repository"
	"backend/external/loyverse/services"
	"database/sql"
	"log"
	"net/http"
)

// SyncMasterDataHandler handles the initial data sync or reset
func SyncMasterDataHandler(w http.ResponseWriter, r *http.Request) {
	// ตรวจสอบสิทธิ์ของผู้ใช้ (จำเป็นต้องเป็น role 'super')
	// userRole := r.Context().Value("userRole")
	// if userRole != "super" {
	// 	http.Error(w, "Access denied", http.StatusForbidden)
	// 	return
	// }

	// สร้างการเชื่อมต่อฐานข้อมูล
	dbConn, err := config.ConnectDB()
	if err != nil {
		log.Fatalf("Could not connect to the database: %v", err)
		return
	}
	// เคลียร์ข้อมูลเก่า
	if err := repository.ClearOldMasterData(dbConn); err != nil {
		http.Error(w, "Failed to clear old data", http.StatusInternalServerError)
		return
	}

	// ดึงข้อมูล master data ใหม่
	masterData, err := services.FetchMasterData()
	if err != nil {
		http.Error(w, "Failed to fetch master data", http.StatusInternalServerError)
		return
	}
	log.Printf("Fetched %d items from API", len(masterData.Items))
	log.Printf("Fetched %d category from API", len(masterData.Categories))
	log.Printf("Fetched %d PaymentTypes from API", len(masterData.PaymentTypes))
	log.Printf("Fetched %d Stores from API", len(masterData.Stores))
	log.Printf("Fetched %d Suppliers from API", len(masterData.Suppliers))

	// บันทึกข้อมูลใหม่ลงในฐานข้อมูล
	if err := repository.SaveMasterData(dbConn, masterData); err != nil {
		http.Error(w, "Failed to save master data", http.StatusInternalServerError)
		return
	}

	log.Println("Master data synced successfully")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Master data synced successfully"))
}

// SyncReceipts ดึงข้อมูล receipts และบันทึกลงฐานข้อมูล โดยไม่ใช้ HTTP response
func SyncReceipts(dbConn *sql.DB) error {
	// เคลียร์ข้อมูลเก่า
	if err := repository.ClearOldReceiptsData(dbConn); err != nil {
		return err
	}

	// กำหนดค่าการดึงข้อมูลแบบ Batch
	limit := 250
	cursor := ""

	for {
		// ดึงข้อมูลใบเสร็จทีละ batch
		receipts, nextCursor, err := services.FetchReceiptsBatch(cursor, limit)
		if err != nil {
			log.Println("Error fetching receipts:", err)
			return err
		}

		// บันทึกข้อมูลใบเสร็จใน batch นี้
		if err := repository.SaveReceipts(dbConn, receipts); err != nil {
			log.Println("Error saving receipts:", err)
			return err
		}
		log.Printf("Saved %d receipts to database", len(receipts))

		// ตรวจสอบว่าเป็น batch สุดท้ายหรือไม่
		if nextCursor == "" {
			break // ออกจาก loop ถ้าไม่มีข้อมูลเพิ่มเติม
		}
		cursor = nextCursor // อัปเดต cursor สำหรับ batch ถัดไป
	}

	log.Println("Receipts synced successfully")
	return nil
}

// SyncReceiptsHandler handles the syncing of receipts through HTTP request
func SyncReceiptsHandler(w http.ResponseWriter, r *http.Request) {
	// สร้างการเชื่อมต่อฐานข้อมูล
	dbConn, err := config.ConnectDB()
	if err != nil {
		log.Fatalf("Could not connect to the database: %v", err)
		http.Error(w, "Failed to connect to the database", http.StatusInternalServerError)
		return
	}
	defer dbConn.Close()

	// เรียกใช้ฟังก์ชัน SyncReceipts ที่ทำงานหลัก
	if err := SyncReceipts(dbConn); err != nil {
		http.Error(w, "Failed to sync receipts", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Receipts synced successfully"))
}

// SyncInventoryLevels ดึงข้อมูล inventory levels และบันทึกลงฐานข้อมูล
func SyncInventoryLevels(db *sql.DB) error {
	// เคลียร์ข้อมูลเก่า
	if err := repository.ClearOldInventoryLevelsData(db); err != nil {
		return err
	}

	// ดึงข้อมูล inventory levels จาก Loyverse API
	inventoryLevels, err := services.FetchInventoryLevels()
	if err != nil {
		return err
	}

	// บันทึกข้อมูล inventory levels ลงฐานข้อมูล
	if err := repository.SaveInventoryLevels(db, inventoryLevels); err != nil {
		return err
	}

	log.Println("Inventory levels synced successfully")
	return nil
}

// SyncInventoryLevelsHandler handles the syncing of inventory levels through HTTP request
func SyncInventoryLevelsHandler(w http.ResponseWriter, r *http.Request) {
	// สร้างการเชื่อมต่อฐานข้อมูล
	dbConn, err := config.ConnectDB()
	if err != nil {
		log.Fatalf("Could not connect to the database: %v", err)
		http.Error(w, "Failed to connect to the database", http.StatusInternalServerError)
		return
	}
	defer dbConn.Close()

	// เรียกใช้ฟังก์ชัน SyncInventoryLevels ที่ทำงานหลัก
	if err := SyncInventoryLevels(dbConn); err != nil {
		http.Error(w, "Failed to sync inventory levels", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Inventory levels synced successfully"))
}

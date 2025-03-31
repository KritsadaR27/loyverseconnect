package handlers

import (
	"backend/external/loyverse/models"
	"backend/external/loyverse/repository"
	"database/sql"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
)

// WebhookHandler จัดการ Webhook จาก Loyverse สำหรับเหตุการณ์ต่าง ๆ
func LoyverseWebhookHandler(db *sql.DB, w http.ResponseWriter, r *http.Request) {
	var webhookPayload struct {
		Event         string                     `json:"type"`
		Receipts      []models.LoyReceipt        `json:"receipts"`
		InventoryData []models.LoyInventoryLevel `json:"inventory_levels"`
		Items         []models.LoyItem           `json:"items"`
		Customers     []models.LoyCustomer       `json:"customers"`
	}

	// อ่านและ Decode JSON จาก body
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Bad Request", http.StatusBadRequest)
		return
	}
	if err := json.Unmarshal(body, &webhookPayload); err != nil {
		http.Error(w, "Bad Request", http.StatusBadRequest)
		return
	}

	// ตรวจสอบประเภทของเหตุการณ์และจัดการตามประเภทนั้น ๆ
	switch webhookPayload.Event {
	case "receipts.update":
		log.Println("Received receipts.update event")
		if err := repository.SaveReceipts(db, webhookPayload.Receipts); err != nil {
			log.Println("Error saving receipts:", err)
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}
		log.Println("Webhook Receipts updated successfully.")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("Receipts updated successfully"))

	case "inventory_levels.update":
		log.Println("Received inventory_levels.update event")
		if err := repository.SaveInventoryLevels(db, webhookPayload.InventoryData); err != nil {
			log.Println("Error saving inventory levels:", err)
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}
		log.Println("Webhook Inventory levels updated successfully.")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("Inventory levels updated successfully"))

	case "items.update":
		log.Println("Received items.update event")
		if err := repository.SaveItems(db, webhookPayload.Items); err != nil {
			log.Println("Error saving items:", err)
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}
		log.Println("Items updated successfully.")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("Items updated successfully"))

	case "customers.update":
		if err := repository.SaveCustomers(db, webhookPayload.Customers); err != nil {
			log.Println("Error saving customers:", err)
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}
		log.Println("Customers updated successfully.")

	default:
		log.Printf("Unhandled event type: %s\n", webhookPayload.Event)
		http.Error(w, "Unhandled event type", http.StatusNotImplemented)
		return
	}

	// ตอบกลับด้วย 200 OK
	w.WriteHeader(http.StatusOK)
}

// exportToGoogleSheet ฟังก์ชันที่ทำการเรียก API เพื่อส่งข้อมูลไป Google Sheets
func exportToGoogleSheet() error {
	// สร้าง HTTP request
	req, err := http.NewRequest("POST", "http://host.docker.internal:8082/api/export-to-google-sheet", nil)
	if err != nil {
		return err
	}

	// ส่ง HTTP request
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	// ตรวจสอบผลลัพธ์จากการเรียก API
	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("Failed to export to Google Sheets: %s", resp.Status)
	}

	return nil
}

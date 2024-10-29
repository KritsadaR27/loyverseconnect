package loyhandlers

import (
	"backend/database"
	"backend/models"
	"database/sql"
	"encoding/json"
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
		if err := database.SaveReceipts(db, webhookPayload.Receipts); err != nil {
			log.Println("Error saving receipts:", err)
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}
		log.Println("Receipts updated successfully.")

	case "inventory_levels.update":
		if err := database.SaveInventoryLevels(db, webhookPayload.InventoryData); err != nil {
			log.Println("Error saving inventory levels:", err)
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}
		log.Println("Inventory levels updated successfully.")

	case "items.update":
		if err := database.SaveItems(db, webhookPayload.Items); err != nil {
			log.Println("Error saving items:", err)
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}
		log.Println("Items updated successfully.")

	case "customers.update":
		if err := database.SaveCustomers(db, webhookPayload.Customers); err != nil {
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

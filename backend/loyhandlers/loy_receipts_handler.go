package loyhandlers

import (
	"backend/database"
	"backend/models"
	"bytes"
	"database/sql"
	"encoding/json"
	"io/ioutil"
	"log"
	"net/http"
)

// WebhookHandler handles incoming webhook requests from Loyverse
func WebhookHandler(db *sql.DB, w http.ResponseWriter, r *http.Request) {
	var webhookPayload struct {
		Event    string              `json:"type"` // Adjusted to match the payload structure
		Receipts []models.LoyReceipt `json:"receipts"`
	}

	// Read the request body
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		log.Println("Error reading request body:", err)
		http.Error(w, "Bad Request", http.StatusBadRequest)
		return
	}
	log.Println("Raw request body:", string(body))
	r.Body = ioutil.NopCloser(bytes.NewBuffer(body)) // Reset the body for further use

	// Decode JSON
	if err := json.Unmarshal(body, &webhookPayload); err != nil {
		log.Println("Error decoding JSON:", err)
		http.Error(w, "Bad Request", http.StatusBadRequest)
		return
	}

	// Log the received payload
	log.Printf("Received webhook payload: %+v\n", webhookPayload)

	switch webhookPayload.Event {
	case "receipts.update":
		// Handle receipt update
		for _, receipt := range webhookPayload.Receipts {
			if err := database.SaveReceipts(db, []models.LoyReceipt{receipt}); err != nil { // Pass db as the first argument
				log.Println("Error saving receipt:", err)
				http.Error(w, "Internal Server Error", http.StatusInternalServerError)
				return
			}
			log.Println("Receipt updated successfully.")
		}
	default:
		log.Printf("Unhandled event type: %s\n", webhookPayload.Event)
	}

	// Respond with a 200 OK
	w.WriteHeader(http.StatusOK)
}

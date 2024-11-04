// background/receipts_loader.go
package background

import (
	"backend/external/loyverse/handlers"

	"database/sql"
	"log"
)

// ReceiptsLoader syncs receipts.
func ReceiptsLoader(dbConn *sql.DB) {
	log.Println("Starting receipts sync...")
	if err := handlers.SyncReceipts(dbConn); err != nil {
		log.Printf("Error syncing receipts: %v", err)
	} else {
		log.Println("Receipts sync completed successfully.")
	}
}

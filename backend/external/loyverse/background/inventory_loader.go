// background/inventory_loader.go
package background

import (
	"backend/external/loyverse/handlers"

	"database/sql"
	"log"
)

// InventoryLoader syncs inventory levels.
func InventoryLoader(dbConn *sql.DB) {
	log.Println("Starting inventory sync...")
	if err := handlers.SyncInventoryLevels(dbConn); err != nil {
		log.Printf("Error syncing inventory levels: %v", err)
	} else {
		log.Println("Inventory sync completed successfully.")
	}
}

// loyhandlers/settings_handler.go
package handlers

import (
	"backend/external/loyverse/repository"
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
)

// GetSettingsHandler อ่านค่า settings ทั้งหมด
func GetSettingsHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		keys := []string{"inventory_sync_time", "receipts_sync_time"}
		settings := make(map[string]string)

		for _, key := range keys {
			value, err := repository.GetSetting(db, key)
			if err != nil {
				log.Printf("Could not retrieve setting for key %s: %v", key, err)
				continue
			}
			settings[key] = value
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(settings)
	}
}

// UpdateSettingsHandler อัปเดตค่า settings
func UpdateSettingsHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var settings map[string]string
		if err := json.NewDecoder(r.Body).Decode(&settings); err != nil {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
		}

		for key, value := range settings {
			if err := repository.UpdateSetting(db, key, value); err != nil {
				log.Printf("Could not update setting for key %s: %v", key, err)
			}
		}

		w.WriteHeader(http.StatusOK)
	}
}

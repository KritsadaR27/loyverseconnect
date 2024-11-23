// backend/external/loyverse/handlers/masterdata_handler.go
package handlers

import (
	"backend/external/loyverse/services"
	"encoding/json"
	"net/http"
)

// GetMasterDataHandler handles the request for fetching master data
func GetMasterDataHandler(w http.ResponseWriter, r *http.Request) {
	masterData, err := services.FetchMasterData()
	if err != nil {
		http.Error(w, "Failed to fetch master data", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(masterData)
}

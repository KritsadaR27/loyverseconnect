// backend/internal/InventoryManagement/application/handlers/item_stock_handler.go
package handlers

import (
	"backend/internal/InventoryManagement/application/services"
	"encoding/json"
	"net/http"
)

type ItemStockHandler struct {
	itemStockService *services.ItemService
}

func NewItemStockHandler(itemStockService *services.ItemService) *ItemStockHandler {
	return &ItemStockHandler{itemStockService: itemStockService}
}

// GetItemStockHandler handles requests to retrieve item stock data.
func (h *ItemStockHandler) GetItemStockHandler(w http.ResponseWriter, r *http.Request) {
	data, err := h.itemStockService.GetItemStockData() // เรียกใช้ฟังก์ชัน GetItemStockData
	if err != nil {
		http.Error(w, "Error retrieving item stock data", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(data)
}

func (h *ItemStockHandler) GetItemStockByStoreHandler(w http.ResponseWriter, r *http.Request) {
	itemID := r.URL.Query().Get("item_id")
	if itemID == "" {
		http.Error(w, "Missing item_id parameter", http.StatusBadRequest)
		return
	}

	data, err := h.itemStockService.GetItemStockByStore(itemID)
	if err != nil {
		http.Error(w, "Error retrieving store stock data", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(data)
}

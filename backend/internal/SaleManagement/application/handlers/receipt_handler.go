// SaleManagement/application/handlers/receipt_handler.go
package handlers

import (
	"backend/internal/SaleManagement/application/services"
	"encoding/json"
	"log"
	"net/http"
)

type ReceiptHandler struct {
	receiptService *services.ReceiptService // แก้ไขเป็น pointer
}

func NewReceiptHandler(receiptService *services.ReceiptService) *ReceiptHandler {
	return &ReceiptHandler{receiptService: receiptService}
}

func (h *ReceiptHandler) ListReceipts(w http.ResponseWriter, r *http.Request) {
	receipts, err := h.receiptService.GetReceiptsWithDetails()
	if err != nil {
		log.Println("Error fetching receipts:", err) // เพิ่มการ log เมื่อเกิด error
		http.Error(w, "Failed to fetch receipts", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(receipts); err != nil {
		log.Println("Error encoding receipts to JSON:", err) // log error ในกรณีที่ JSON encoding มีปัญหา
		http.Error(w, "Failed to encode receipts", http.StatusInternalServerError)
		return
	}
	// json.NewEncoder(w).Encode(receipts)
}

func (h *ReceiptHandler) ListSalesByItem(w http.ResponseWriter, r *http.Request) {
	sales, err := h.receiptService.GetSalesByItem()
	if err != nil {
		log.Println("Error fetching sales by item:", err) // เพิ่มการ log เมื่อเกิด error
		http.Error(w, "Failed to fetch sales by item", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(sales); err != nil {
		log.Println("Error encoding sales by item to JSON:", err) // log error ในกรณีที่ JSON encoding มีปัญหา
		http.Error(w, "Failed to encode sales by item", http.StatusInternalServerError)
		return
	}
}

func (h *ReceiptHandler) ListSalesByDay(w http.ResponseWriter, r *http.Request) {
	salesByDay, err := h.receiptService.GetSalesByDay()
	if err != nil {
		log.Println("Error fetching sales by day:", err) // เพิ่มการ log เมื่อเกิด error
		http.Error(w, "Failed to fetch sales by day", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(salesByDay); err != nil {
		log.Println("Error encoding sales by day to JSON:", err) // log error ในกรณีที่ JSON encoding มีปัญหา
		http.Error(w, "Failed to encode sales by day", http.StatusInternalServerError)
		return
	}
}

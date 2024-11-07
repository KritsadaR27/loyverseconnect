// handlers/sales_handler.go
package handlers

import (
	"backend/internal/SaleManagement/application/services"
	"encoding/json"
	"net/http"
	"time"
)

type SalesHandler struct {
	service *services.SalesService
}

func NewSalesHandler(service *services.SalesService) *SalesHandler {
	return &SalesHandler{service: service}
}

func (h *SalesHandler) GetMonthlyCategorySales(w http.ResponseWriter, r *http.Request) {
	// รับ startDate และ endDate จาก query parameters
	startDateStr := r.URL.Query().Get("startDate")
	endDateStr := r.URL.Query().Get("endDate")

	// แปลงวันที่จาก string เป็น time.Time
	startDate, _ := time.Parse("2006-01-02", startDateStr)
	endDate, _ := time.Parse("2006-01-02", endDateStr)

	sales, err := h.service.GetMonthlyCategorySales(startDate, endDate)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(sales)
}

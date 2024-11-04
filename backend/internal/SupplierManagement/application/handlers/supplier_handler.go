// application/handlers/supplier_handler.go
package handlers

import (
	"encoding/json"
	"net/http"

	"backend/internal/SupplierManagement/application/services"
	"backend/internal/SupplierManagement/domain/models"
	"log"
)

type SupplierHandler struct {
	service *services.SupplierService
}

func NewSupplierHandler(service *services.SupplierService) *SupplierHandler {
	return &SupplierHandler{service: service}
}

func (h *SupplierHandler) GetSuppliers(w http.ResponseWriter, r *http.Request) {
	suppliers, err := h.service.GetAllSuppliers()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(suppliers)
}

func (h *SupplierHandler) SaveSupplierSettings(w http.ResponseWriter, r *http.Request) {
	var suppliersInput []models.SupplierInput
	if err := json.NewDecoder(r.Body).Decode(&suppliersInput); err != nil {
		log.Println("Error decoding suppliers data:", err)
		http.Error(w, "Invalid input", http.StatusBadRequest)
		return
	}

	if err := h.service.SaveSupplierSettings(suppliersInput); err != nil {
		log.Println("Error saving supplier settings:", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Supplier settings saved successfully"))
}

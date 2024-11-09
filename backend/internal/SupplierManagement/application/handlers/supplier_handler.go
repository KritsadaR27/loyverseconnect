// application/handlers/supplier_handler.go
package handlers

import (
	"encoding/json"
	"net/http"

	"backend/internal/SupplierManagement/application/services"
	"backend/internal/SupplierManagement/domain/models"
)

type SupplierHandler struct {
	service *services.SupplierService
}

func NewSupplierHandler(service *services.SupplierService) *SupplierHandler {
	return &SupplierHandler{service: service}
}

// Existing method to get all suppliers
func (h *SupplierHandler) GetSuppliers(w http.ResponseWriter, r *http.Request) {
	suppliers, err := h.service.GetAllSuppliers()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(suppliers)
}

// New method to save supplier settings
func (h *SupplierHandler) SaveSupplierSettings(w http.ResponseWriter, r *http.Request) {
	var supplierFields []models.CustomSupplierField
	if err := json.NewDecoder(r.Body).Decode(&supplierFields); err != nil {
		http.Error(w, "Invalid input", http.StatusBadRequest)
		return
	}

	if err := h.service.SaveCustomSupplierFields(supplierFields); err != nil {
		http.Error(w, "Failed to save supplier settings", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Supplier settings saved successfully"))
}

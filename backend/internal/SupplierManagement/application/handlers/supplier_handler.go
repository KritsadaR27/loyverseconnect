// application/handlers/supplier_handler.go
package handlers

import (
	"encoding/json"
	"io/ioutil"
	"log"
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
func (h *SupplierHandler) SaveSupplierSettings(w http.ResponseWriter, r *http.Request) {
	var supplierFields []models.CustomSupplierField

	// อ่านข้อมูลจาก body และ decode JSON ไปยัง supplierFields
	bodyBytes, err := ioutil.ReadAll(r.Body)
	if err != nil {
		log.Println("Error reading request body:", err)
		http.Error(w, "Error reading request body", http.StatusInternalServerError)
		return
	}

	// Log ข้อมูล JSON ที่ได้รับ
	log.Printf("Request body: %s", string(bodyBytes))

	// Decode JSON เป็น Go struct
	if err := json.Unmarshal(bodyBytes, &supplierFields); err != nil {
		log.Println("Error decoding suppliers:", err)
		http.Error(w, "Invalid input", http.StatusBadRequest)
		return
	}

	// ตรงนี้ให้ไปทำการบันทึกข้อมูลต่อไป
	if err := h.service.SaveCustomSupplierFields(supplierFields); err != nil {
		http.Error(w, "Failed to save supplier settings", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Supplier settings saved successfully",
	})
}

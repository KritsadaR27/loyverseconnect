package handlers

import (
	"backend/database"
	"backend/models"
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"strings"
)

func GetSuppliersHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		suppliers, err := database.GetSuppliers(db)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		responseSuppliers := make([]map[string]interface{}, 0)
		for _, supplier := range suppliers {
			orderCycle := ""
			if supplier.OrderCycle.Valid {
				orderCycle = supplier.OrderCycle.String
			}

			selectedDays := []string{}
			if supplier.SelectedDays.Valid {
				selectedDays = strings.Split(supplier.SelectedDays.String, ",")
			}

			responseSuppliers = append(responseSuppliers, map[string]interface{}{
				"id":            supplier.SupplierID,
				"name":          supplier.SupplierName,
				"order_cycle":   orderCycle,
				"sort_order":    supplier.SortOrder,
				"selected_days": selectedDays,
			})
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(responseSuppliers)
	}
}

func SaveSupplierSettingsHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var suppliersInput []models.SupplierInput
		if err := json.NewDecoder(r.Body).Decode(&suppliersInput); err != nil {
			log.Println("Error decoding suppliers data:", err)
			http.Error(w, "Invalid input", http.StatusBadRequest)
			return
		}

		// แปลงจาก SupplierInput เป็น LoySupplier
		var suppliers []models.LoySupplier
		for _, input := range suppliersInput {
			orderCycle := sql.NullString{String: input.OrderCycle, Valid: input.OrderCycle != ""}
			selectedDays := sql.NullString{String: strings.Join(input.SelectedDays, ","), Valid: len(input.SelectedDays) > 0}

			supplier := models.LoySupplier{
				SupplierID:   input.SupplierID,
				SupplierName: input.SupplierName,
				OrderCycle:   orderCycle,
				SortOrder:    input.SortOrder,
				SelectedDays: selectedDays,
			}
			suppliers = append(suppliers, supplier)
		}

		if err := database.SaveSupplierSettings(db, suppliers); err != nil {
			log.Println("Error saving supplier settings:", err)
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		log.Println("Supplier settings saved successfully")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("Supplier settings saved successfully"))
	}
}

// FetchSupplierCyclesHandler returns a handler function that fetches supplier cycles
func FetchSupplierCyclesHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		suppliers, err := database.FetchSupplierCycles(db)
		if err != nil {
			http.Error(w, "Error fetching supplier cycles", http.StatusInternalServerError)
			return
		}

		// Set response headers and encode the response as JSON
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(suppliers)
	}
}

// backend/internal/InventoryManagement/handlers/masterdata_handler.go
package handlers

import (
	"backend/internal/InventoryManagement/application/services"
	"backend/internal/InventoryManagement/infrastructure/data"
	"database/sql"
	"encoding/json"
	"net/http"
)

// GetCategoriesHandler handles the request for fetching categories
func GetCategoriesHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		repo := data.NewItemRepository(db)
		service := services.NewMasterDataService(repo)
		categories, err := service.GetCategories()
		if err != nil {
			http.Error(w, "Failed to fetch categories", http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(categories)
	}
}

// GetItemsHandler handles the request for fetching items
func GetItemsHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		repo := data.NewItemRepository(db)
		service := services.NewMasterDataService(repo)
		items, err := service.GetItems()
		if err != nil {
			http.Error(w, "Failed to fetch items", http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(items)
	}
}

// GetPaymentTypesHandler handles the request for fetching payment types
func GetPaymentTypesHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		repo := data.NewItemRepository(db)
		service := services.NewMasterDataService(repo)
		paymentTypes, err := service.GetPaymentTypes()
		if err != nil {
			http.Error(w, "Failed to fetch payment types", http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(paymentTypes)
	}
}

// GetStoresHandler handles the request for fetching stores
func GetStoresHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		repo := data.NewItemRepository(db)
		service := services.NewMasterDataService(repo)
		stores, err := service.GetStores()
		if err != nil {
			http.Error(w, "Failed to fetch stores", http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(stores)
	}
}

// GetSuppliersHandler handles the request for fetching suppliers
func GetSuppliersHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		repo := data.NewItemRepository(db)
		service := services.NewMasterDataService(repo)
		suppliers, err := service.GetSuppliers()
		if err != nil {
			http.Error(w, "Failed to fetch suppliers", http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(suppliers)
	}
}

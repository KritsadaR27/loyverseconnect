// backend/internal/InventoryManagement/infrastructure/router/router.go
package router

import (
	"backend/internal/InventoryManagement/application/handlers"
	"backend/internal/InventoryManagement/application/services"
	"backend/internal/InventoryManagement/infrastructure/data"
	"backend/internal/InventoryManagement/infrastructure/external"
	"database/sql"
	"net/http"
)

// RegisterRoutes sets up all the routes for the application
func RegisterRoutes(mux *http.ServeMux, db *sql.DB, sheetsClient *external.GoogleSheetsClient) {
	RegisterItemRoutes(mux, db)
	RegisterExportRoutes(mux, db, sheetsClient)
}

// RegisterItemRoutes registers routes related to items
func RegisterItemRoutes(mux *http.ServeMux, db *sql.DB) {
	itemRepo := data.NewItemRepository(db)
	itemService := services.NewItemService(itemRepo)
	itemHandler := handlers.NewItemStockHandler(itemService)

	// Route to get all item stock data
	mux.HandleFunc("/api/item-stock", itemHandler.GetItemStockHandler)

	// Route to get store-specific stock data for a given item ID
	mux.HandleFunc("/api/item-stock/store", itemHandler.GetItemStockByStoreHandler)
}

// RegisterExportRoutes registers the route for exporting data to Google Sheets
func RegisterExportRoutes(mux *http.ServeMux, db *sql.DB, sheetsClient *external.GoogleSheetsClient) {
	itemRepo := data.NewItemRepository(db)
	exportService := services.NewExportService(itemRepo, sheetsClient)
	exportHandler := handlers.NewExportHandler(exportService)

	mux.HandleFunc("/api/export-to-google-sheet", exportHandler.ExportToGoogleSheetHandler)
}

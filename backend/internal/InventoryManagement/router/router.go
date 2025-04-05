// backend/internal/InventoryManagement/infrastructure/router/router.go
package router

import (
	"backend/internal/InventoryManagement/application/handlers"
	"backend/internal/InventoryManagement/application/services"
	"backend/internal/InventoryManagement/infrastructure/data"
	"backend/internal/InventoryManagement/middleware"
	"database/sql"
	"net/http"

	"google.golang.org/api/sheets/v4"
)

// RegisterRoutes sets up all the routes for the application
func RegisterRoutes(mux *http.ServeMux, db *sql.DB, sheetsClient *sheets.Service) {
	RegisterItemRoutes(mux, db)
	RegisterExportRoutes(mux, db, sheetsClient)
	RegisterMasterDataRoutes(mux, db)
}

// RegisterItemRoutes registers routes related to items
func RegisterItemRoutes(mux *http.ServeMux, db *sql.DB) {
	itemRepo := data.NewItemRepository(db)
	itemService := services.NewItemService(itemRepo)
	itemHandler := handlers.NewItemStockHandler(itemService)

	// Route to get all item stock data
	mux.Handle("/item-stock", middleware.CORS(http.HandlerFunc(itemHandler.GetItemStockHandler)))

	// Route to get store-specific stock data for a given item ID
	mux.HandleFunc("/api/item-stock/store", itemHandler.GetItemStockByStoreHandler)
	// Route to save item supplier settings
	mux.HandleFunc("/api/item-supplier-settings", itemHandler.SaveItemSupplierSettingHandler) // ฟังก์ชันใหม่
}

// RegisterExportRoutes registers the route for exporting data to Google Sheets
func RegisterExportRoutes(mux *http.ServeMux, db *sql.DB, sheetsClient *sheets.Service) {
	itemRepo := data.NewItemRepository(db)
	exportService := services.NewExportService(itemRepo, sheetsClient)

	exportHandler := handlers.NewExportHandler(exportService)

	mux.HandleFunc("/api/export-to-google-sheet", exportHandler.ExportToGoogleSheetHandler)
}

// RegisterMasterDataRoutes registers routes related to master data
func RegisterMasterDataRoutes(mux *http.ServeMux, db *sql.DB) {
	mux.HandleFunc("/api/categories", handlers.GetCategoriesHandler(db))
	mux.HandleFunc("/api/items", handlers.GetItemsHandler(db))
	mux.HandleFunc("/api/paymenttypes", handlers.GetPaymentTypesHandler(db))
	mux.HandleFunc("/api/stores", handlers.GetStoresHandler(db))
	mux.HandleFunc("/api/suppliers", handlers.GetSuppliersHandler(db))
}

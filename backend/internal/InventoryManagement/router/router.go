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
	mux.Handle("/api/item-stock", middleware.CORS(http.HandlerFunc(itemHandler.GetItemStockHandler)))

	// Route to get store-specific stock data for a given item ID
	mux.Handle("/api/item-stock/store", middleware.CORS(http.HandlerFunc(itemHandler.GetItemStockByStoreHandler)))

	// Route to save item supplier settings
	mux.Handle("/api/item-supplier-settings", middleware.CORS(http.HandlerFunc(itemHandler.SaveItemSupplierSettingHandler)))
}

// RegisterExportRoutes registers the route for exporting data to Google Sheets
func RegisterExportRoutes(mux *http.ServeMux, db *sql.DB, sheetsClient *sheets.Service) {
	itemRepo := data.NewItemRepository(db)
	exportService := services.NewExportService(itemRepo, sheetsClient)

	exportHandler := handlers.NewExportHandler(exportService)

	mux.Handle("/api/export-to-google-sheet", middleware.CORS(http.HandlerFunc(exportHandler.ExportToGoogleSheetHandler)))
}

// RegisterMasterDataRoutes registers routes related to master data
func RegisterMasterDataRoutes(mux *http.ServeMux, db *sql.DB) {
	mux.Handle("/api/categories", middleware.CORS(http.HandlerFunc(handlers.GetCategoriesHandler(db))))
	mux.Handle("/api/items", middleware.CORS(http.HandlerFunc(handlers.GetItemsHandler(db))))
	mux.Handle("/api/paymenttypes", middleware.CORS(http.HandlerFunc(handlers.GetPaymentTypesHandler(db))))
	mux.Handle("/api/stores", middleware.CORS(http.HandlerFunc(handlers.GetStoresHandler(db))))
	mux.Handle("/api/suppliers", middleware.CORS(http.HandlerFunc(handlers.GetSuppliersHandler(db))))
}

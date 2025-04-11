// internal/POManagement/router/router.go
package router

import (
	"database/sql"
	"net/http"

	"backend/internal/POManagement/application/handlers"
	"backend/internal/POManagement/application/services"
	"backend/internal/POManagement/infrastructure/data"
	"backend/internal/POManagement/infrastructure/external"
)

// RegisterRoutes ลงทะเบียนเส้นทาง API
// internal/POManagement/router/router.go
func RegisterRoutes(mux *http.ServeMux, db *sql.DB) {
	// สร้าง repositories
	poRepo := data.NewPurchaseOrderRepository(db)

	// สร้าง services
	inventoryService := external.NewInventoryClient()
	salesService := external.NewSalesClient()
	lineService := external.NewLineClient()
	calculationService := services.NewCalculationService() // ประกาศตัวแปรนี้

	// สร้าง poService และส่ง calculationService เข้าไปใช้งาน
	poService := services.NewPOService(
		poRepo,
		inventoryService,
		salesService,
		lineService,
		calculationService, // เพิ่มพารามิเตอร์นี้
	)

	// สร้าง handlers
	poHandler := handlers.NewPOHandler(poService)

	// ลงทะเบียนเส้นทาง
	mux.HandleFunc("/api/po", poHandler.GetPOData)
	mux.HandleFunc("/api/po/calculate", poHandler.CalculateSuggestedQuantities)
	mux.HandleFunc("/api/po/buffers", poHandler.SaveBufferSettings)
	mux.HandleFunc("/api/po/buffers/batch", poHandler.GetBufferSettingsBatch) // เพิ่ม endpoint ใหม่

	mux.HandleFunc("/api/po/create", poHandler.CreatePO)
	mux.HandleFunc("/api/po/detail", poHandler.GetPOByID)
	mux.HandleFunc("/api/po/list", poHandler.GetAllPOs)
	mux.HandleFunc("/api/po/notify", poHandler.SendLineNotification)
	mux.HandleFunc("/api/sales/days", poHandler.GetSalesByDay)

}

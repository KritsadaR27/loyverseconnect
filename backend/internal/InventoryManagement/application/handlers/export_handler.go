// backend/internal/InventoryManagement/application/handlers/export_handler.go
package handlers

import (
	"backend/internal/InventoryManagement/application/services"
	"net/http"
)

type ExportHandler struct {
	exportService *services.ExportService
}

func NewExportHandler(exportService *services.ExportService) *ExportHandler {
	return &ExportHandler{exportService: exportService}
}

func (h *ExportHandler) ExportToGoogleSheetHandler(w http.ResponseWriter, r *http.Request) {
	if err := h.exportService.ExportItemStockDataToGoogleSheet(); err != nil {
		http.Error(w, "Failed to export data to Google Sheets", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Data exported to Google Sheet successfully!"))
}

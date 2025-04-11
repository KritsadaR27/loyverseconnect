// internal/POManagement/application/handlers/po_handler.go
package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"backend/internal/POManagement/application/services"
	"backend/internal/POManagement/domain/models"
)

// POHandler จัดการกับ HTTP requests ที่เกี่ยวกับ PO
type POHandler struct {
	poService *services.POService
}

// NewPOHandler สร้าง POHandler ใหม่
func NewPOHandler(poService *services.POService) *POHandler {
	return &POHandler{
		poService: poService,
	}
}

// GetPOData จัดการคำขอข้อมูลสำหรับหน้า PO
func (h *POHandler) GetPOData(w http.ResponseWriter, r *http.Request) {
	// ตรวจสอบวิธี HTTP
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// ดึงพารามิเตอร์วันที่
	deliveryDateStr := r.URL.Query().Get("delivery_date")
	var deliveryDate time.Time
	var err error

	if deliveryDateStr == "" {
		deliveryDate = time.Now()
	} else {
		deliveryDate, err = time.Parse("2006-01-02", deliveryDateStr)
		if err != nil {
			http.Error(w, "Invalid date format", http.StatusBadRequest)
			return
		}
	}

	// ดึงข้อมูล PO
	poData, err := h.poService.GetPOData(r.Context(), deliveryDate)
	if err != nil {
		http.Error(w, "Failed to get PO data: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// ส่งผลตอบกลับ
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(poData)
}

// CalculateSuggestedQuantities คำนวณยอดแนะนำตามวันที่ต้องการให้พอขาย
func (h *POHandler) CalculateSuggestedQuantities(w http.ResponseWriter, r *http.Request) {
	// ตรวจสอบวิธี HTTP
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// แยกวิเคราะห์คำขอ
	var req struct {
		TargetDate time.Time       `json:"target_date"`
		Items      []models.POItem `json:"items"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// ดึงข้อมูลยอดขายย้อนหลัง
	startDate := req.TargetDate.AddDate(0, 0, -7) // 7 วันก่อน
	endDate := req.TargetDate.AddDate(0, 0, 2)    // 2 วันหลัง
	salesData, err := h.poService.GetSalesByDay(r.Context(), startDate, endDate)
	if err != nil {
		http.Error(w, "Failed to get sales data: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// คำนวณยอดแนะนำ
	items, err := h.poService.CalculateSuggestedQuantities(r.Context(), req.TargetDate, req.Items, salesData)
	if err != nil {
		http.Error(w, "Failed to calculate suggested quantities: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// ส่งผลตอบกลับ
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(items)
}

// Add this method to POHandler
// GetSalesByDay handles the request to get sales data by day
func (h *POHandler) GetSalesByDay(w http.ResponseWriter, r *http.Request) {
	// Parse query parameters
	startDateStr := r.URL.Query().Get("startDate")
	endDateStr := r.URL.Query().Get("endDate")

	var startDate, endDate time.Time
	var err error

	// Parse start date
	startDate, err = time.Parse(time.RFC3339, startDateStr)
	if err != nil {
		http.Error(w, "Invalid startDate format, should be RFC3339", http.StatusBadRequest)
		return
	}

	// Parse end date
	endDate, err = time.Parse(time.RFC3339, endDateStr)
	if err != nil {
		http.Error(w, "Invalid endDate format, should be RFC3339", http.StatusBadRequest)
		return
	}

	// Get sales data from service
	salesData, err := h.poService.GetSalesByDay(r.Context(), startDate, endDate)
	if err != nil {
		http.Error(w, "Failed to get sales data: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Send response
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(salesData)
}

// SaveBufferSettings บันทึกยอดเผื่อ
func (h *POHandler) SaveBufferSettings(w http.ResponseWriter, r *http.Request) {
	// ตรวจสอบวิธี HTTP
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// แยกวิเคราะห์คำขอ
	var settings []models.BufferSettings
	if err := json.NewDecoder(r.Body).Decode(&settings); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// บันทึกยอดเผื่อ
	if err := h.poService.SaveBufferSettings(r.Context(), settings); err != nil {
		http.Error(w, "Failed to save buffer settings: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// ส่งผลตอบกลับ
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Buffer settings saved successfully"})
}

// CreatePO สร้างใบสั่งซื้อ
func (h *POHandler) CreatePO(w http.ResponseWriter, r *http.Request) {
	// ตรวจสอบวิธี HTTP
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// แยกวิเคราะห์คำขอ
	var po models.PurchaseOrder
	if err := json.NewDecoder(r.Body).Decode(&po); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// สร้างใบสั่งซื้อ
	if err := h.poService.CreatePO(r.Context(), &po); err != nil {
		http.Error(w, "Failed to create PO: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// ส่งผลตอบกลับ
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(po)
}

// GetPOByID ดึงใบสั่งซื้อตาม ID
func (h *POHandler) GetPOByID(w http.ResponseWriter, r *http.Request) {
	// ตรวจสอบวิธี HTTP
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// ดึง ID จาก URL
	idStr := r.URL.Query().Get("id")
	if idStr == "" {
		http.Error(w, "Missing ID parameter", http.StatusBadRequest)
		return
	}

	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "Invalid ID format", http.StatusBadRequest)
		return
	}

	// ดึงข้อมูล PO
	po, err := h.poService.GetPOByID(r.Context(), id)
	if err != nil {
		http.Error(w, "Failed to get PO: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// ส่งผลตอบกลับ
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(po)
}

// GetAllPOs ดึงใบสั่งซื้อทั้งหมด
func (h *POHandler) GetAllPOs(w http.ResponseWriter, r *http.Request) {
	// ตรวจสอบวิธี HTTP
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// สร้าง filters จาก query parameters
	filters := make(map[string]interface{})

	if supplierID := r.URL.Query().Get("supplier_id"); supplierID != "" {
		filters["supplier_id"] = supplierID
	}

	if status := r.URL.Query().Get("status"); status != "" {
		filters["status"] = status
	}

	if startDateStr := r.URL.Query().Get("start_date"); startDateStr != "" {
		startDate, err := time.Parse("2006-01-02", startDateStr)
		if err != nil {
			http.Error(w, "Invalid start_date format", http.StatusBadRequest)
			return
		}
		filters["start_date"] = startDate
	}

	if endDateStr := r.URL.Query().Get("end_date"); endDateStr != "" {
		endDate, err := time.Parse("2006-01-02", endDateStr)
		if err != nil {
			http.Error(w, "Invalid end_date format", http.StatusBadRequest)
			return
		}
		filters["end_date"] = endDate
	}

	// ดึงข้อมูล PO
	pos, err := h.poService.GetAllPOs(r.Context(), filters)
	if err != nil {
		http.Error(w, "Failed to get POs: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// ส่งผลตอบกลับ
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(pos)
}

// SendLineNotification ส่งแจ้งเตือนทางไลน์
func (h *POHandler) SendLineNotification(w http.ResponseWriter, r *http.Request) {
	// ตรวจสอบวิธี HTTP
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// แยกวิเคราะห์คำขอ
	var req struct {
		GroupIDs []string             `json:"group_ids"`
		PO       models.PurchaseOrder `json:"po"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// ส่งแจ้งเตือนทางไลน์
	if err := h.poService.SendLineNotification(r.Context(), req.GroupIDs, &req.PO); err != nil {
		http.Error(w, "Failed to send LINE notification: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// ส่งผลตอบกลับ
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "LINE notification sent successfully"})
}

// แก้ไข GetBufferSettingsBatch handler ในไฟล์ po_handler.go

// GetBufferSettingsBatch จัดการคำขอข้อมูลสำหรับดึงข้อมูล buffer settings จำนวนมาก
func (h *POHandler) GetBufferSettingsBatch(w http.ResponseWriter, r *http.Request) {
	// ตรวจสอบวิธี HTTP
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// แยกวิเคราะห์คำขอ
	var req struct {
		ItemIDs []string `json:"item_ids"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body: "+err.Error(), http.StatusBadRequest)
		return
	}

	if len(req.ItemIDs) == 0 {
		// ส่งกลับ map ว่างหากไม่มี item IDs
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]int{})
		return
	}

	// ดึงข้อมูล buffer settings
	bufferSettings, err := h.poService.GetBufferSettingsBatch(r.Context(), req.ItemIDs)
	if err != nil {
		http.Error(w, "Failed to get buffer settings: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// เพิ่ม log เพื่อตรวจสอบข้อมูลที่ส่งกลับ
	fmt.Printf("Buffer settings for %d items: %+v\n", len(req.ItemIDs), bufferSettings)

	// ส่งผลตอบกลับ
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(bufferSettings); err != nil {
		http.Error(w, "Error encoding response: "+err.Error(), http.StatusInternalServerError)
		return
	}
}

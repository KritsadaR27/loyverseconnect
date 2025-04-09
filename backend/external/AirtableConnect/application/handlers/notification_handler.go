// backend/external/AirtableConnect/application/handlers/notification_handler.go

package handlers

import (
	"backend/external/AirtableConnect/application/services"
	"encoding/json"
	"net/http"
	"time"
)

// NotificationRequest เป็นโครงสร้างสำหรับรับคำขอส่งข้อมูลจาก Airtable ไปยัง LINE
type NotificationRequest struct {
	TableID         string   `json:"table_id"`
	ViewName        string   `json:"view_name"`
	Fields          []string `json:"fields"`
	MessageTemplate string   `json:"message_template"`
	GroupIDs        []string `json:"group_ids"`
}

// ScheduleRequest คำขอสำหรับสร้างหรืออัพเดทการแจ้งเตือนตามกำหนดเวลา
type ScheduleRequest struct {
	TableID         string   `json:"table_id"`
	ViewName        string   `json:"view_name"`
	Fields          []string `json:"fields"`
	MessageTemplate string   `json:"message_template"`
	GroupIDs        []string `json:"group_ids"`
	Schedule        string   `json:"schedule"`
	Active          bool     `json:"active"`
}

// NotificationHandler จัดการ HTTP requests สำหรับการส่งการแจ้งเตือน
type NotificationHandler struct {
	notificationService *services.NotificationService
}

// NewNotificationHandler สร้าง instance ใหม่ของ NotificationHandler
func NewNotificationHandler(notificationService *services.NotificationService) *NotificationHandler {
	return &NotificationHandler{
		notificationService: notificationService,
	}
}

// SendAirtableToLine จัดการคำขอส่งข้อมูลจาก Airtable ไปยัง LINE
func (h *NotificationHandler) SendAirtableToLine(w http.ResponseWriter, r *http.Request) {
	// รับเฉพาะ POST method
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// แปลงข้อมูลจาก request body
	var req NotificationRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body: "+err.Error(), http.StatusBadRequest)
		return
	}

	// ตรวจสอบความถูกต้องของข้อมูล
	if req.TableID == "" {
		http.Error(w, "Table ID is required", http.StatusBadRequest)
		return
	}
	if len(req.Fields) == 0 {
		http.Error(w, "At least one field is required", http.StatusBadRequest)
		return
	}
	if req.MessageTemplate == "" {
		http.Error(w, "Message template is required", http.StatusBadRequest)
		return
	}
	if len(req.GroupIDs) == 0 {
		http.Error(w, "At least one group ID is required", http.StatusBadRequest)
		return
	}

	// ส่งข้อมูลจาก Airtable ไปยัง LINE
	recordsSent, err := h.notificationService.SendAirtableViewToLine(
		req.TableID,
		req.ViewName,
		req.Fields,
		req.MessageTemplate,
		req.GroupIDs,
	)
	if err != nil {
		http.Error(w, "Failed to send notification: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// ส่ง response กลับ
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success":      true,
		"records_sent": recordsSent,
		"timestamp":    time.Now().Format(time.RFC3339),
	})
}

// CreateSchedule จัดการคำขอสร้างการแจ้งเตือนตามกำหนดเวลา
func (h *NotificationHandler) CreateSchedule(w http.ResponseWriter, r *http.Request) {
	// รับเฉพาะ POST method
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// แปลงข้อมูลจาก request body
	var req ScheduleRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body: "+err.Error(), http.StatusBadRequest)
		return
	}

	// ตรวจสอบความถูกต้องของข้อมูล
	if req.TableID == "" {
		http.Error(w, "Table ID is required", http.StatusBadRequest)
		return
	}
	if len(req.Fields) == 0 {
		http.Error(w, "At least one field is required", http.StatusBadRequest)
		return
	}
	if req.MessageTemplate == "" {
		http.Error(w, "Message template is required", http.StatusBadRequest)
		return
	}
	if len(req.GroupIDs) == 0 {
		http.Error(w, "At least one group ID is required", http.StatusBadRequest)
		return
	}
	if req.Schedule == "" {
		http.Error(w, "Schedule is required (in cron format)", http.StatusBadRequest)
		return
	}

	// บันทึกการตั้งค่าการแจ้งเตือนตามกำหนดเวลา
	// ในกรณีนี้เราจะเพียงแค่ส่ง response กลับว่าสำเร็จ
	// ในการใช้งานจริง คุณควรบันทึกข้อมูลลงในฐานข้อมูล
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success":   true,
		"message":   "Schedule created successfully",
		"timestamp": time.Now().Format(time.RFC3339),
	})
}

// GetSchedules ดึงรายการการแจ้งเตือนตามกำหนดเวลาทั้งหมด
func (h *NotificationHandler) GetSchedules(w http.ResponseWriter, r *http.Request) {
	// รับเฉพาะ GET method
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// ในกรณีนี้เราจะเพียงแค่ส่ง response กลับเป็นข้อมูลตัวอย่าง
	// ในการใช้งานจริง คุณควรดึงข้อมูลจากฐานข้อมูล
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode([]services.ScheduledNotification{
		{
			ID:              1,
			TableID:         "tblInventory",
			ViewName:        "Low Stock Items",
			Fields:          []string{"Name", "Quantity", "MinimumLevel"},
			MessageTemplate: "🚨 รายการสินค้าใกล้หมด {{.Count}} รายการ:\n{{range .Records}}• {{.Name}} เหลือ {{.Quantity}} (ขั้นต่ำ {{.MinimumLevel}})\n{{end}}",
			GroupIDs:        []string{"inventory_alerts"},
			Schedule:        "0 9 * * *", // ทุกวันเวลา 9:00
			LastRun:         time.Now().AddDate(0, 0, -1).Format(time.RFC3339),
			Active:          true,
		},
	})
}

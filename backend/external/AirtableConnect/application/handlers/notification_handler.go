// backend/external/AirtableConnect/application/handlers/notification_handler.go

package handlers

import (
	"backend/external/AirtableConnect/application/services"
	"backend/external/AirtableConnect/domain/interfaces"
	"backend/external/AirtableConnect/domain/models"
	"encoding/json"
	"net/http"
	"strconv"
	"time"
)

// NotificationHandler จัดการ HTTP requests สำหรับการส่งการแจ้งเตือน
type NotificationHandler struct {
	notificationService *services.NotificationService
	notificationRepo    interfaces.NotificationRepository
}

// NewNotificationHandler สร้าง instance ใหม่ของ NotificationHandler
func NewNotificationHandler(notificationService *services.NotificationService, notificationRepo interfaces.NotificationRepository) *NotificationHandler {
	return &NotificationHandler{
		notificationService: notificationService,
		notificationRepo:    notificationRepo,
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
	var req models.NotificationTestRequest
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
	if !req.EnableBubbles && req.MessageTemplate == "" {
		http.Error(w, "Message template is required for non-bubble notifications", http.StatusBadRequest)
		return
	}
	if len(req.GroupIDs) == 0 {
		http.Error(w, "At least one group ID is required", http.StatusBadRequest)
		return
	}

	var recordsSent int
	var err error

	// ส่งข้อมูลจาก Airtable ไปยัง LINE
	if req.EnableBubbles {
		recordsSent, err = h.notificationService.SendRecordPerBubbleToLine(
			req.TableID,
			req.ViewName,
			req.Fields,
			req.GroupIDs,
			req.HeaderTemplate,
			req.BubbleTemplate,
			req.FooterTemplate,
		)
	} else {
		recordsSent, err = h.notificationService.SendAirtableViewToLine(
			req.TableID,
			req.ViewName,
			req.Fields,
			req.MessageTemplate,
			req.GroupIDs,
		)
	}

	if err != nil {
		http.Error(w, "Failed to send notification: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// ส่ง response กลับ
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*") // แก้ไขปัญหา CORS
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success":      true,
		"records_sent": recordsSent,
		"timestamp":    time.Now().Format(time.RFC3339),
	})
}

// CreateNotification จัดการคำขอสร้างการแจ้งเตือนใหม่
func (h *NotificationHandler) CreateNotification(w http.ResponseWriter, r *http.Request) {
	// รับเฉพาะ POST method
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// แปลงข้อมูลจาก request body
	var req models.NotificationRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body: "+err.Error(), http.StatusBadRequest)
		return
	}

	// ตรวจสอบความถูกต้องของข้อมูล
	if req.Name == "" {
		http.Error(w, "Name is required", http.StatusBadRequest)
		return
	}
	if req.TableID == "" {
		http.Error(w, "Table ID is required", http.StatusBadRequest)
		return
	}
	if req.ViewName == "" {
		http.Error(w, "View name is required", http.StatusBadRequest)
		return
	}
	if len(req.Fields) == 0 {
		http.Error(w, "At least one field is required", http.StatusBadRequest)
		return
	}
	if !req.EnableBubbles && req.MessageTemplate == "" {
		http.Error(w, "Message template is required for non-bubble notifications", http.StatusBadRequest)
		return
	}
	if len(req.GroupIDs) == 0 {
		http.Error(w, "At least one group ID is required", http.StatusBadRequest)
		return
	}

	// สร้าง notification ใหม่
	notification := models.Notification{
		Name:              req.Name,
		TableID:           req.TableID,
		ViewName:          req.ViewName,
		Fields:            req.Fields,
		MessageTemplate:   req.MessageTemplate,
		HeaderTemplate:    req.HeaderTemplate,
		EnableBubbles:     req.EnableBubbles,
		GroupIDs:          req.GroupIDs,
		Schedule:          req.Schedule,
		NotificationTimes: req.NotificationTimes,
		Active:            req.Active,
		CreatedAt:         time.Now(),
		UpdatedAt:         time.Now(),
	}

	// บันทึก notification
	id, err := h.notificationRepo.SaveNotification(notification)
	if err != nil {
		http.Error(w, "Failed to create notification: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// ดึง notification ที่สร้างเพื่อส่งกลับ
	notification, err = h.notificationRepo.GetNotificationByID(id)
	if err != nil {
		http.Error(w, "Notification created but failed to retrieve: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// ส่ง response กลับ
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(notification)
}

// GetNotification จัดการคำขอดึงข้อมูลการแจ้งเตือน
func (h *NotificationHandler) GetNotification(w http.ResponseWriter, r *http.Request) {
	// รับเฉพาะ GET method
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// ดึง id จาก query parameter
	idStr := r.URL.Query().Get("id")
	if idStr == "" {
		// หากไม่ระบุ id ให้ดึงทั้งหมด
		h.GetAllNotifications(w, r)
		return
	}

	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "Invalid notification ID", http.StatusBadRequest)
		return
	}

	// ดึงข้อมูล notification
	notification, err := h.notificationRepo.GetNotificationByID(id)
	if err != nil {
		http.Error(w, "Failed to retrieve notification: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// ส่ง response กลับ
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(notification)
}

// GetAllNotifications จัดการคำขอดึงข้อมูลการแจ้งเตือนทั้งหมด
func (h *NotificationHandler) GetAllNotifications(w http.ResponseWriter, r *http.Request) {
	// รับเฉพาะ GET method
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// ตรวจสอบ query parameter สำหรับการกรองเฉพาะที่ active
	activeOnlyStr := r.URL.Query().Get("active_only")
	activeOnly := activeOnlyStr == "true"

	// ดึงข้อมูล notifications
	notifications, err := h.notificationRepo.ListNotifications(activeOnly)
	if err != nil {
		http.Error(w, "Failed to retrieve notifications: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// ส่ง response กลับ
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(notifications)
}

// UpdateNotification จัดการคำขออัพเดทการแจ้งเตือน
func (h *NotificationHandler) UpdateNotification(w http.ResponseWriter, r *http.Request) {
	// รับเฉพาะ PUT method
	if r.Method != http.MethodPut {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// ดึง id จาก query parameter
	idStr := r.URL.Query().Get("id")
	if idStr == "" {
		http.Error(w, "Notification ID is required", http.StatusBadRequest)
		return
	}

	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "Invalid notification ID", http.StatusBadRequest)
		return
	}

	// ดึงข้อมูล notification เดิม
	existingNotification, err := h.notificationRepo.GetNotificationByID(id)
	if err != nil {
		http.Error(w, "Failed to retrieve notification: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// แปลงข้อมูลจาก request body
	var req models.NotificationRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body: "+err.Error(), http.StatusBadRequest)
		return
	}

	// อัพเดทข้อมูล notification
	existingNotification.Name = req.Name
	existingNotification.TableID = req.TableID
	existingNotification.ViewName = req.ViewName
	existingNotification.Fields = req.Fields
	existingNotification.MessageTemplate = req.MessageTemplate
	existingNotification.HeaderTemplate = req.HeaderTemplate
	existingNotification.BubbleTemplate = req.BubbleTemplate
	existingNotification.FooterTemplate = req.FooterTemplate
	existingNotification.EnableBubbles = req.EnableBubbles
	existingNotification.GroupIDs = req.GroupIDs
	existingNotification.Schedule = req.Schedule
	existingNotification.NotificationTimes = req.NotificationTimes
	existingNotification.Active = req.Active
	existingNotification.UpdatedAt = time.Now()

	// บันทึกการอัพเดท
	err = h.notificationRepo.UpdateNotification(existingNotification)
	if err != nil {
		http.Error(w, "Failed to update notification: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// ส่ง response กลับ
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(existingNotification)
}

// DeleteNotification จัดการคำขอลบการแจ้งเตือน
func (h *NotificationHandler) DeleteNotification(w http.ResponseWriter, r *http.Request) {
	// รับเฉพาะ DELETE method
	if r.Method != http.MethodDelete {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// ดึง id จาก query parameter
	idStr := r.URL.Query().Get("id")
	if idStr == "" {
		http.Error(w, "Notification ID is required", http.StatusBadRequest)
		return
	}

	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "Invalid notification ID", http.StatusBadRequest)
		return
	}

	// ลบ notification
	err = h.notificationRepo.DeleteNotification(id)
	if err != nil {
		http.Error(w, "Failed to delete notification: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// ส่ง response กลับ
	w.WriteHeader(http.StatusNoContent)
}

// RunNotificationNow จัดการคำขอรันการแจ้งเตือนทันที
func (h *NotificationHandler) RunNotificationNow(w http.ResponseWriter, r *http.Request) {
	// รับเฉพาะ POST method
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// ดึง id จาก query parameter
	idStr := r.URL.Query().Get("id")
	if idStr == "" {
		http.Error(w, "Notification ID is required", http.StatusBadRequest)
		return
	}

	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "Invalid notification ID", http.StatusBadRequest)
		return
	}

	// รันการแจ้งเตือนทันที
	recordsSent, err := h.notificationService.RunNotificationNow(id)
	if err != nil {
		http.Error(w, "Failed to run notification: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// ส่ง response กลับ
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*") // แก้ไขปัญหา CORS
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success":         true,
		"records_sent":    recordsSent,
		"notification_id": id,
		"timestamp":       time.Now().Format(time.RFC3339),
	})
}

// SendRecordPerBubbleToLine จัดการคำขอส่งข้อมูลแต่ละรายการเป็น bubble แยกกัน
func (h *NotificationHandler) SendRecordPerBubbleToLine(w http.ResponseWriter, r *http.Request) {
	// รับเฉพาะ POST method
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// แปลงข้อมูลจาก request body
	var req models.NotificationTestRequest
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
	if len(req.GroupIDs) == 0 {
		http.Error(w, "At least one group ID is required", http.StatusBadRequest)
		return
	}

	// ส่งข้อมูลจาก Airtable เป็น bubble แยกกัน
	count, err := h.notificationService.SendRecordPerBubbleToLine(
		req.TableID,
		req.ViewName,
		req.Fields,
		req.GroupIDs,
		req.HeaderTemplate,
		req.BubbleTemplate,
		req.FooterTemplate,
	)
	if err != nil {
		http.Error(w, "Failed to send bubble messages: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// ส่ง response กลับ
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*") // แก้ไขปัญหา CORS
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message":      "Successfully sent bubble messages",
		"recordCount":  count,
		"records_sent": count, // เพิ่มฟิลด์ให้ตรงกับที่ frontend คาดหวัง
	})
}

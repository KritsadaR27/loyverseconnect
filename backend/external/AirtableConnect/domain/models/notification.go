// backend/external/AirtableConnect/domain/models/notification.go

package models

import "time"

// Notification เป็นโมเดลที่เก็บข้อมูลการแจ้งเตือนจาก Airtable ไปยัง LINE
type Notification struct {
	ID                int       `json:"id"`
	Name              string    `json:"name"`
	TableID           string    `json:"table_id"`
	ViewName          string    `json:"view_name"`
	Fields            []string  `json:"fields"`
	MessageTemplate   string    `json:"message_template"`
	HeaderTemplate    string    `json:"header_template,omitempty"`
	BubbleTemplate    string    `json:"bubble_template,omitempty"`
	FooterTemplate    string    `json:"footer_template,omitempty"`
	EnableBubbles     bool      `json:"enable_bubbles"`
	GroupIDs          []string  `json:"group_ids"`
	Schedule          string    `json:"schedule"`
	NotificationTimes []string  `json:"notification_times,omitempty"`
	LastRun           time.Time `json:"last_run,omitempty"`
	CreatedAt         time.Time `json:"created_at"`
	UpdatedAt         time.Time `json:"updated_at"`
	Active            bool      `json:"active"`
}

// NotificationLog เป็นโมเดลที่เก็บประวัติการส่งการแจ้งเตือน
type NotificationLog struct {
	ID             int       `json:"id"`
	NotificationID int       `json:"notification_id"`
	Status         string    `json:"status"`
	RecordsSent    int       `json:"records_sent"`
	ErrorMessage   string    `json:"error_message,omitempty"`
	SentAt         time.Time `json:"sent_at"`
}

// ScheduledNotification เก็บรายละเอียดการแจ้งเตือนที่ตั้งเวลาไว้
type ScheduledNotification struct {
	ID              int      `json:"id"`
	TableID         string   `json:"table_id"`
	ViewName        string   `json:"view_name"`
	Fields          []string `json:"fields"`
	MessageTemplate string   `json:"message_template"`
	HeaderTemplate  string   `json:"header_template,omitempty"`
	BubbleTemplate  string   `json:"bubble_template,omitempty"`
	FooterTemplate  string   `json:"footer_template,omitempty"`
	EnableBubbles   bool     `json:"enable_bubbles"`
	GroupIDs        []string `json:"group_ids"`
	Schedule        string   `json:"schedule"` // cron format เช่น "0 9 * * *" สำหรับทุกวันเวลา 9:00
	LastRun         string   `json:"last_run,omitempty"`
	Active          bool     `json:"active"`
}

// NotificationRequest เป็นโครงสร้างสำหรับรับคำขอสร้างหรืออัพเดทการแจ้งเตือน
type NotificationRequest struct {
	Name              string   `json:"name"`
	TableID           string   `json:"table_id"`
	ViewName          string   `json:"view_name"`
	Fields            []string `json:"fields"`
	MessageTemplate   string   `json:"message_template"`
	HeaderTemplate    string   `json:"header_template,omitempty"`
	BubbleTemplate    string   `json:"bubble_template,omitempty"`
	FooterTemplate    string   `json:"footer_template,omitempty"`
	EnableBubbles     bool     `json:"enable_bubbles"`
	GroupIDs          []string `json:"group_ids"`
	Schedule          string   `json:"schedule,omitempty"`
	NotificationTimes []string `json:"notification_times,omitempty"`
	Active            bool     `json:"active"`
}

// NotificationResponse เป็นโครงสร้างสำหรับตอบกลับข้อมูลการแจ้งเตือน
type NotificationResponse struct {
	ID                int       `json:"id"`
	Name              string    `json:"name"`
	TableID           string    `json:"table_id"`
	ViewName          string    `json:"view_name"`
	Fields            []string  `json:"fields"`
	MessageTemplate   string    `json:"message_template"`
	HeaderTemplate    string    `json:"header_template,omitempty"`
	EnableBubbles     bool      `json:"enable_bubbles"`
	GroupIDs          []string  `json:"group_ids"`
	Schedule          string    `json:"schedule"`
	NotificationTimes []string  `json:"notification_times,omitempty"`
	LastRun           time.Time `json:"last_run,omitempty"`
	RecordCount       int       `json:"record_count,omitempty"`
	Active            bool      `json:"active"`
}

// NotificationTestRequest เป็นโครงสร้างสำหรับรับคำขอทดสอบการแจ้งเตือน
type NotificationTestRequest struct {
	TableID         string   `json:"table_id"`
	ViewName        string   `json:"view_name"`
	Fields          []string `json:"fields"`
	MessageTemplate string   `json:"message_template,omitempty"`
	HeaderTemplate  string   `json:"header_template,omitempty"`
	BubbleTemplate  string   `json:"bubble_template,omitempty"`
	FooterTemplate  string   `json:"footer_template,omitempty"`
	EnableBubbles   bool     `json:"enable_bubbles"`
	GroupIDs        []string `json:"group_ids"`
}

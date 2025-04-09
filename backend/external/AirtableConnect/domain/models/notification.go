// backend/external/AirtableConnect/domain/models/notification.go

package models

import "time"

// Notification เป็นโมเดลที่เก็บข้อมูลการแจ้งเตือนจาก Airtable ไปยัง LINE
type Notification struct {
	ID              int       `json:"id"`
	TableID         string    `json:"table_id"`
	ViewName        string    `json:"view_name"`
	Fields          []string  `json:"fields"`
	MessageTemplate string    `json:"message_template"`
	GroupIDs        []string  `json:"group_ids"`
	Schedule        string    `json:"schedule"`
	LastRun         time.Time `json:"last_run,omitempty"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
	Active          bool      `json:"active"`
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
	GroupIDs        []string `json:"group_ids"`
	Schedule        string   `json:"schedule"` // cron format เช่น "0 9 * * *" สำหรับทุกวันเวลา 9:00
	LastRun         string   `json:"last_run"`
	Active          bool     `json:"active"`
}

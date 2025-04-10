package models

type View struct {
	ViewID   string `json:"view_id" db:"view_id"` // <- สำคัญมาก
	ViewName string `json:"name" db:"view_name"`
	TableID  string `json:"table_id" db:"table_id"` // ใช้ตอน filter
}

// เพิ่มเซอร์วิสใหม่เพื่อส่งข้อมูลจาก Airtable ไปยัง LINE
// backend/external/AirtableConnect/application/services/notification_service.go

package services

import (
	"backend/external/AirtableConnect/domain/interfaces"
	"backend/external/AirtableConnect/domain/models"
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"
	"text/template"
	"time"
	"unicode/utf8"
)

// LineMessageRequest สำหรับ request ไปยัง LINE API
type LineMessageRequest struct {
	Content  string   `json:"content"`
	GroupIDs []string `json:"group_ids"`
	Type     string   `json:"type"`
}

// NotificationService สำหรับส่งข้อมูลจาก Airtable ไปยังช่องทางต่างๆ เช่น LINE
type NotificationService struct {
	airtableClient interfaces.AirtableClient
	baseID         string
	lineAPIURL     string
}

// NewNotificationService สร้าง instance ใหม่ของ NotificationService
func NewNotificationService(
	airtableClient interfaces.AirtableClient,
	baseID string,
	lineAPIURL string,
	notificationRepo interfaces.NotificationRepository,

) *NotificationService {
	return &NotificationService{
		airtableClient: airtableClient,
		baseID:         baseID,
		lineAPIURL:     lineAPIURL,
	}
}

// SendAirtableViewToLine ส่งข้อมูลจาก Airtable view ไปยัง LINE group
func (s *NotificationService) SendAirtableViewToLine(tableID string, viewName string, fields []string, messageTemplate string, groupIDs []string) (int, error) {

	// ดึงข้อมูลจาก Airtable
	records, err := s.airtableClient.GetRecordsFromView(s.baseID, tableID, viewName)
	if err != nil {
		return 0, fmt.Errorf("error fetching records from Airtable: %v", err)
	}

	// กรองเฉพาะ fields ที่ต้องการ
	var filteredRecords []map[string]interface{}
	for _, record := range records {
		filteredRecord := make(map[string]interface{})
		for _, field := range fields {
			if value, ok := record.Fields[field]; ok {
				filteredRecord[field] = value
			}
		}

		// ✅ Normalize field names (เช่น "ชื่อออเดอร์" → "OrderName")
		normalized := models.NormalizeFields(filteredRecord)

		filteredRecords = append(filteredRecords, normalized)
	}

	// สร้างข้อความจาก template
	formattedMessage, err := s.formatMessage(messageTemplate, filteredRecords)
	if err != nil {
		return 0, fmt.Errorf("error formatting message: %v", err)
	}

	// ส่งข้อความไปยัง LINE
	err = s.sendToLine(formattedMessage, groupIDs)
	if err != nil {
		return 0, fmt.Errorf("error sending message to LINE: %v", err)
	}

	return len(records), nil
}
func ensureUTF8(input string) string {
	// ตัด invalid Unicode ออกเพื่อไม่ให้ template.Parse error
	if utf8.ValidString(input) {
		return input
	}
	// หรือ: แปลงให้อยู่ในรูปที่ parser รับได้
	return strings.ToValidUTF8(input, "")
}

// formatMessage ใช้ template เพื่อจัดรูปแบบข้อความ
func (s *NotificationService) formatMessage(messageTemplate string, records []map[string]interface{}) (string, error) {
	// เตรียมข้อมูลสำหรับ template
	data := map[string]interface{}{
		"Records": records,
		"Count":   len(records),
		"Date":    time.Now().Format("2006-01-02"),
		"Time":    time.Now().Format("15:04:05"),
	}

	// ตรวจสอบว่า messageTemplate เป็น UTF-8 หรือไม่
	// ถ้าไม่ใช่ ให้แปลงเป็น UTF-8
	// หรือ: ใช้ฟังก์ชัน ensureUTF8 เพื่อให้แน่ใจว่าเป็น UTF-8
	// ถ้าไม่ใช่ ให้แปลงเป็น UTF-8
	// Parse และ execute template
	safeTemplate := ensureUTF8(messageTemplate)
	tmpl, err := template.New("message").Parse(safeTemplate)
	if err != nil {
		return "", err
	}

	var buf strings.Builder
	if err := tmpl.Execute(&buf, data); err != nil {
		return "", err
	}

	return buf.String(), nil
}

// sendToLine ส่งข้อความไปยัง LINE group
func (s *NotificationService) sendToLine(message string, groupIDs []string) error {
	// สร้าง request body
	request := LineMessageRequest{
		Content:  message,
		GroupIDs: groupIDs,
		Type:     "text",
	}

	// แปลงเป็น JSON
	jsonData, err := json.Marshal(request)
	if err != nil {
		return err
	}

	// ส่ง HTTP request
	resp, err := http.Post(
		s.lineAPIURL,
		"application/json",
		bytes.NewBuffer(jsonData),
	)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	// ตรวจสอบ response
	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("LINE API returned non-OK status: %s", resp.Status)
	}

	return nil
}

// ScheduledNotification รายละเอียดการแจ้งเตือนที่ตั้งเวลาไว้
type ScheduledNotification struct {
	ID              int      `json:"id"`
	TableID         string   `json:"table_id"`
	ViewName        string   `json:"view_name"`
	Fields          []string `json:"fields"`
	MessageTemplate string   `json:"message_template"`
	GroupIDs        []string `json:"group_ids"`
	Schedule        string   `json:"schedule"` // cron format: "0 9 * * *" สำหรับทุกวันตอน 9:00
	LastRun         string   `json:"last_run"`
	Active          bool     `json:"active"`
}

// SendScheduledNotifications ส่งการแจ้งเตือนที่ถึงกำหนดเวลา
func (s *NotificationService) SendScheduledNotifications(schedules []ScheduledNotification) []error {
	var errors []error
	now := time.Now()

	for _, schedule := range schedules {
		if !schedule.Active {
			continue
		}

		// ตรวจสอบว่าถึงเวลาส่งหรือยัง (ในกรณีนี้เป็นแค่การจำลองอย่างง่าย)
		// ในระบบจริงควรใช้ cron parser อย่างเช่น github.com/robfig/cron
		shouldRun := true // ตรรกะการตรวจสอบว่าถึงเวลาหรือยัง

		if shouldRun {
			_, err := s.SendAirtableViewToLine(
				schedule.TableID,
				schedule.ViewName,
				schedule.Fields,
				schedule.MessageTemplate,
				schedule.GroupIDs,
			)
			if err != nil {
				errors = append(errors, fmt.Errorf("failed to send notification for schedule %d: %v", schedule.ID, err))
			}

			// อัพเดทเวลาล่าสุดที่ส่ง
			// ในระบบจริงควรอัพเดทในฐานข้อมูล
			log.Printf("Sent scheduled notification %d at %s", schedule.ID, now.Format(time.RFC3339))
		}
	}

	return errors
}

func (s *NotificationService) SendRecordPerBubbleToLine(tableID string, viewName string, fields []string, groupIDs []string) (int, error) {
	records, err := s.airtableClient.GetRecordsFromView(s.baseID, tableID, viewName)
	if err != nil {
		return 0, fmt.Errorf("error fetching records from Airtable: %v", err)
	}

	// Normalize & filter fields
	var filtered []map[string]interface{}
	for _, r := range records {
		rec := make(map[string]interface{})
		for _, f := range fields {
			if val, ok := r.Fields[f]; ok {
				rec[f] = val
			}
		}
		filtered = append(filtered, rec)
	}

	// Generate messages
	messages := generateRecordBubbles(filtered)
	return len(records), s.sendBubblesToLine(messages, groupIDs)
}

func generateRecordBubbles(records []map[string]interface{}) []string {
	var messages []string
	weekday := thaiWeekday(time.Now().Weekday())
	date := time.Now().Format("02/01/2006")
	head := fmt.Sprintf("วันนี้ %s %s มีจัดส่ง %d กล่อง", weekday, date, len(records))
	messages = append(messages, head)

	for i, r := range records {
		var b strings.Builder
		fmt.Fprintf(&b, "• กล่องที่ %d\n", i+1)
		if order, ok := r["OrderName"]; ok {
			orderStr := fmt.Sprintf("%v", first(order)) // แปลงค่าเป็น string
			if idx := strings.Index(orderStr, "-"); idx != -1 {
				orderStr = orderStr[:idx] // ตัดข้อความก่อนเครื่องหมาย "-"
			}
			fmt.Fprintf(&b, "%s\n", orderStr)
		}
		if name, ok := r["CustomerName"]; ok {

			fmt.Fprintf(&b, "ชื่อลูกค้า : %v\n", first(name))
		}
		if point, ok := r["PickupPoint"]; ok {
			fmt.Fprintf(&b, "ที่อยู่ : %v\n", first(point))
		}
		if phone, ok := r["PhoneNumber"]; ok {
			fmt.Fprintf(&b, "เบอร์โทร : %v\n", first(phone))
		}

		if order, ok := r["OrderNumber"]; ok {
			fmt.Fprintf(&b, "เลขออเดอร์ : %v", order)
		}
		messages = append(messages, b.String())
	}

	return messages
}

func (s *NotificationService) sendBubblesToLine(messages []string, groupIDs []string) error {
	for _, msg := range messages {
		req := map[string]interface{}{
			"content":   msg,
			"group_ids": groupIDs,
			"type":      "text",
		}
		body, _ := json.Marshal(req)
		resp, err := http.Post(s.lineAPIURL, "application/json", bytes.NewBuffer(body))
		if err != nil || resp.StatusCode != http.StatusOK {
			log.Printf("❌ Failed to send message: %v", err)
		}
	}
	return nil
}

func thaiWeekday(w time.Weekday) string {
	switch w {
	case time.Sunday:
		return "อาทิตย์"
	case time.Monday:
		return "จันทร์"
	case time.Tuesday:
		return "อังคาร"
	case time.Wednesday:
		return "พุธ"
	case time.Thursday:
		return "พฤหัส"
	case time.Friday:
		return "ศุกร์"
	case time.Saturday:
		return "เสาร์"
	default:
		return ""
	}
}

func first(val interface{}) interface{} {
	if arr, ok := val.([]interface{}); ok && len(arr) > 0 {
		return arr[0]
	}
	return val
}

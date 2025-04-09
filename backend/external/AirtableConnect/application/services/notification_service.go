// เพิ่มเซอร์วิสใหม่เพื่อส่งข้อมูลจาก Airtable ไปยัง LINE
// backend/external/AirtableConnect/application/services/notification_service.go

package services

import (
	"backend/external/AirtableConnect/domain/interfaces"
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"
	"text/template"
	"time"
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
	records, err := s.airtableClient.GetRecords(s.baseID, tableID)
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
		filteredRecords = append(filteredRecords, filteredRecord)
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

// formatMessage ใช้ template เพื่อจัดรูปแบบข้อความ
func (s *NotificationService) formatMessage(messageTemplate string, records []map[string]interface{}) (string, error) {
	// เตรียมข้อมูลสำหรับ template
	data := map[string]interface{}{
		"Records": records,
		"Count":   len(records),
		"Date":    time.Now().Format("2006-01-02"),
		"Time":    time.Now().Format("15:04:05"),
	}

	// Parse และ execute template
	tmpl, err := template.New("message").Parse(messageTemplate)
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

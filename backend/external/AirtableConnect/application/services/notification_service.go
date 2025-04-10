// backend/external/AirtableConnect/application/services/notification_service.go

package services

import (
	"backend/external/AirtableConnect/domain/interfaces"
	"backend/external/AirtableConnect/domain/models"
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"strings"
	"text/template"
	"time"
	"unicode/utf8"

	"github.com/robfig/cron/v3"
)

// LineMessageRequest สำหรับ request ไปยัง LINE API
type LineMessageRequest struct {
	Content  string   `json:"content"`
	GroupIDs []string `json:"group_ids"`
	Type     string   `json:"type"`
}

// NotificationService สำหรับส่งข้อมูลจาก Airtable ไปยังช่องทางต่างๆ เช่น LINE
type NotificationService struct {
	airtableClient   interfaces.AirtableClient
	notificationRepo interfaces.NotificationRepository
	baseID           string
	lineAPIURL       string
}

// NewNotificationService สร้าง instance ใหม่ของ NotificationService
func NewNotificationService(
	airtableClient interfaces.AirtableClient,
	notificationRepo interfaces.NotificationRepository,
	baseID string,
	lineAPIURL string,
) *NotificationService {
	return &NotificationService{
		airtableClient:   airtableClient,
		notificationRepo: notificationRepo,
		baseID:           baseID,
		lineAPIURL:       lineAPIURL,
	}
}

// NotificationRepo returns the notification repository
func (s *NotificationService) NotificationRepo() interfaces.NotificationRepository {
	return s.notificationRepo
}

// SendAirtableViewToLine ส่งข้อมูลจาก Airtable view ไปยัง LINE group
func (s *NotificationService) SendAirtableViewToLine(
	tableID string,
	viewName string,
	fields []string,
	messageTemplate string,
	groupIDs []string,
) (int, error) {
	if len(fields) == 0 {
		return 0, fmt.Errorf("fields cannot be empty")
	}
	if len(groupIDs) == 0 {
		return 0, fmt.Errorf("groupIDs cannot be empty")
	}

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

		// Normalize field names (เช่น "ชื่อออเดอร์" → "OrderName")
		normalized := models.NormalizeFields(filteredRecord)

		filteredRecords = append(filteredRecords, normalized)
	}

	// If messageTemplate is empty, return without sending
	if messageTemplate == "" {
		log.Println("No message to send: messageTemplate is empty")
		return 0, nil
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

// SendRecordPerBubbleToLine ส่งข้อมูลแต่ละรายการเป็น bubble แยกกัน
// SendRecordPerBubbleToLine sends individual LINE bubble messages using Go-style {{ }} templates
func (s *NotificationService) SendRecordPerBubbleToLine(
	tableID string,
	viewName string,
	fields []string,
	groupIDs []string,
	headerTemplate string,
	bubbleTemplate string,
	footerTemplate string,
) (int, error) {
	// Fetch records from Airtable view

	records, err := s.airtableClient.GetRecordsFromView(s.baseID, tableID, viewName)
	if err != nil {
		return 0, fmt.Errorf("error fetching records from Airtable: %v", err)
	}

	// Prepare filtered records by selecting only the requested fields and normalizing them
	var filtered []map[string]interface{}
	for _, r := range records {
		rec := make(map[string]interface{})
		for _, f := range fields {
			if val, ok := r.Fields[f]; ok {
				rec[f] = val
			}
		}
		filtered = append(filtered, models.NormalizeFields(rec))
	}

	// Prepare common variables for header/footer templates
	today := time.Now()
	weekday := thaiWeekday(today.Weekday())
	todayStr := today.Format("02/01/2006")
	tomorrowStr := today.Add(24 * time.Hour).Format("02/01/2006")

	// Render header if provided
	header := ""
	if headerTemplate != "" {
		header, err = renderTemplate(headerTemplate, map[string]interface{}{
			"Today":    todayStr,
			"Tomorrow": tomorrowStr,
			"Weekday":  weekday,
			"Count":    len(filtered),
		})
		if err != nil {
			return 0, fmt.Errorf("error rendering header template: %v", err)
		}
	}

	// Collect LINE message strings
	var messages []string
	if header != "" {
		messages = append(messages, header)
	}

	// Render each record using the bubble template
	if bubbleTemplate != "" {
		for i, r := range filtered {
			r["Index"] = i + 1
			bubble, err := renderTemplate(bubbleTemplate, r)
			if err != nil {
				log.Printf("Error rendering bubble %d: %v", i, err)
				continue
			}
			messages = append(messages, bubble)
		}
	}

	// Render footer if provided
	if footerTemplate != "" {
		footer, err := renderTemplate(footerTemplate, map[string]interface{}{
			"Today":    todayStr,
			"Tomorrow": tomorrowStr,
			"Weekday":  weekday,
			"Count":    len(filtered),
		})
		if err == nil {
			messages = append(messages, footer)
		}
	}

	// If no messages to send, return without sending
	if len(messages) == 0 {
		log.Println("No messages to send: all templates are empty")
		return 0, nil
	}

	// Send all messages to LINE
	err = s.sendBubblesToLine(messages, groupIDs)
	if err != nil {
		return 0, fmt.Errorf("error sending bubbles to LINE: %v", err)
	}

	return len(records), nil
}

// renderTemplate parses and executes a Go-style {{ }} template with provided data
func renderTemplate(tmplStr string, data interface{}) (string, error) {
	tmpl := template.New("msg").Funcs(template.FuncMap{
		"beforeDash": func(s string) string {
			if i := strings.Index(s, "-"); i != -1 {
				return s[:i]
			}
			return s
		},
		"TimeNow": func() string {
			return time.Now().Format("15:04") // แสดงเวลาในรูปแบบ HH:mm
		},
	})

	// Parse the template string
	tmpl, err := tmpl.Parse(tmplStr)
	if err != nil {
		return "", err
	}

	// Execute the template with the provided data
	var buf strings.Builder
	err = tmpl.Execute(&buf, data)
	return buf.String(), err
}

// SendNotificationToLine sends a notification to LINE based on its ID
// RunNotificationNow runs a notification immediately based on its ID
func (s *NotificationService) RunNotificationNow(id int) (int, error) {
	log.Printf("Test Notification Triggered at: %s", time.Now().Format(time.RFC3339))

	// Get notification configuration
	notification, err := s.notificationRepo.GetNotificationByID(id)
	if err != nil {
		return 0, fmt.Errorf("error retrieving notification: %v", err)
	}

	var recordsSent int
	var sendErr error

	// Send notification based on type
	if notification.EnableBubbles {
		recordsSent, sendErr = s.SendRecordPerBubbleToLine(
			notification.TableID,
			notification.ViewName,
			notification.Fields,
			notification.GroupIDs,
			notification.HeaderTemplate,
			notification.FooterTemplate,
			notification.BubbleTemplate,
		)
	} else {
		recordsSent, sendErr = s.SendAirtableViewToLine(
			notification.TableID,
			notification.ViewName,
			notification.Fields,
			notification.MessageTemplate,
			notification.GroupIDs,
		)
	}

	// Log the execution
	status := "success"
	var errorMessage string
	if sendErr != nil {
		status = "failed"
		errorMessage = sendErr.Error()
	}

	// Create log entry
	logEntry := models.NotificationLog{
		NotificationID: id,
		Status:         status,
		RecordsSent:    recordsSent,
		ErrorMessage:   errorMessage,
		SentAt:         time.Now(),
	}

	// Save log to database
	_, logErr := s.notificationRepo.SaveNotificationLog(logEntry)
	if logErr != nil {
		log.Printf("Error saving notification log: %v", logErr)
	}

	// Update last run time
	updateErr := s.notificationRepo.UpdateLastRun(id, time.Now())
	if updateErr != nil {
		log.Printf("Error updating last run time: %v", updateErr)
	}

	return recordsSent, sendErr
}

// ensureUTF8 ensures that the input text is valid UTF-8
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
		body, _ := io.ReadAll(resp.Body)
		log.Printf("LINE API returned non-OK status: %s, response: %s", resp.Status, string(body))
		return fmt.Errorf("LINE API returned non-OK status: %s", resp.Status)
	}

	return nil
}

// sendBubblesToLine sends messages as separate bubbles
func (s *NotificationService) sendBubblesToLine(messages []string, groupIDs []string) error {

	for _, msg := range messages {
		req := LineMessageRequest{
			Content:  msg,
			GroupIDs: groupIDs,
			Type:     "text",
		}

		jsonData, err := json.Marshal(req)
		if err != nil {
			return err
		}

		resp, err := http.Post(s.lineAPIURL, "application/json", bytes.NewBuffer(jsonData))
		if err != nil {
			log.Printf("Failed to send message: %v", err)
			return err
		}

		if resp.StatusCode != http.StatusOK {
			log.Printf("Failed to send message: status code %d", resp.StatusCode)
			return fmt.Errorf("LINE API returned non-OK status: %s", resp.Status)
		}

		resp.Body.Close()

		// Small delay to prevent API rate limiting
		time.Sleep(100 * time.Millisecond)
	}

	return nil
}

// SendScheduledNotifications ส่งการแจ้งเตือนที่ถึงกำหนดเวลา
func (s *NotificationService) SendScheduledNotifications(schedules []models.ScheduledNotification) []error {
	var errors []error
	now := time.Now()

	for _, schedule := range schedules {
		// Log Schedule Configuration และเวลาปัจจุบัน
		log.Printf("📌 Schedule config: %s | Now: %s", schedule.Schedule, now.Format("15:04"))

		if !schedule.Active {
			log.Printf("Skipping inactive schedule %d", schedule.ID)
			continue
		}

		log.Printf("Checking schedule %d: %s (now: %s)", schedule.ID, schedule.Schedule, now.Format(time.RFC3339))

		if !shouldRunNow(schedule.Schedule) {
			log.Printf("Schedule %d is not due yet", schedule.ID)
			continue
		}

		log.Printf("Running schedule %d", schedule.ID)

		var recordsSent int
		var err error

		if schedule.EnableBubbles {
			recordsSent, err = s.SendRecordPerBubbleToLine(
				schedule.TableID,
				schedule.ViewName,
				schedule.Fields,
				schedule.GroupIDs,
				schedule.HeaderTemplate,
				schedule.BubbleTemplate,
				schedule.FooterTemplate,
			)
		} else {
			recordsSent, err = s.SendAirtableViewToLine(
				schedule.TableID,
				schedule.ViewName,
				schedule.Fields,
				schedule.MessageTemplate,
				schedule.GroupIDs,
			)
		}

		if err != nil {
			errors = append(errors, fmt.Errorf("failed to send notification for schedule %d: %v", schedule.ID, err))
		}

		log.Printf("Sent scheduled notification %d with %d records", schedule.ID, recordsSent)
	}

	return errors
}

// processScheduledNotification ช่วยในการส่งการแจ้งเตือนตามประเภท
func (s *NotificationService) processScheduledNotification(schedule models.ScheduledNotification) (int, error) {
	if schedule.EnableBubbles {
		return s.SendRecordPerBubbleToLine(
			schedule.TableID,
			schedule.ViewName,
			schedule.Fields,
			schedule.GroupIDs,
			schedule.HeaderTemplate,
			schedule.BubbleTemplate,
			schedule.FooterTemplate,
		)
	} else {
		return s.SendAirtableViewToLine(
			schedule.TableID,
			schedule.ViewName,
			schedule.Fields,
			schedule.MessageTemplate,
			schedule.GroupIDs,
		)
	}
}

// Helper functions
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
		return "ไม่ทราบวัน"
	}
}

func first(val interface{}) interface{} {
	if arr, ok := val.([]interface{}); ok && len(arr) > 0 {
		return arr[0]
	}
	return nil
}

func shouldRunNow(schedule string) bool {
	parser := cron.NewParser(cron.Minute | cron.Hour | cron.Dom | cron.Month | cron.Dow)
	sched, err := parser.Parse(schedule)
	if err != nil {
		log.Printf("Invalid schedule format: %s, error: %v", schedule, err)
		return false
	}

	now := time.Now().Truncate(time.Minute)
	previous := now.Add(-1 * time.Minute)
	return sched.Next(previous).Equal(now)
}

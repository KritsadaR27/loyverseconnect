// backend/external/AirtableConnect/infrastructure/scheduler/notification_scheduler.go

package scheduler

import (
	"backend/external/AirtableConnect/application/services"
	"backend/external/AirtableConnect/domain/models"
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/robfig/cron/v3"
)

// NotificationScheduler จัดการกับการทำงานตามกำหนดเวลา
type NotificationScheduler struct {
	db                  *sql.DB
	notificationService *services.NotificationService
	cron                *cron.Cron
	jobIDs              map[int]cron.EntryID
}

// NewNotificationScheduler สร้าง instance ใหม่ของ NotificationScheduler
func NewNotificationScheduler(db *sql.DB, notificationService *services.NotificationService) *NotificationScheduler {
	return &NotificationScheduler{
		db:                  db,
		notificationService: notificationService,
		cron:                cron.New(cron.WithSeconds()),
		jobIDs:              make(map[int]cron.EntryID),
	}
}

// Start เริ่มการทำงานของ scheduler
func (s *NotificationScheduler) Start() {
	// Log เวลาปัจจุบัน
	log.Printf("📆 Starting scheduler at %s", time.Now().Format("15:04:05"))

	// โหลดการแจ้งเตือนที่ตั้งไว้
	notifications, err := s.loadNotifications()
	if err != nil {
		log.Printf("Error loading notifications: %v", err)
	}

	// Log Schedule ที่โหลดมา
	for _, notification := range notifications {
		log.Printf("🔍 Found schedule: %s", notification.Schedule)
		s.scheduleNotification(notification)
	}

	// เริ่มต้น cron
	s.cron.Start()
	log.Println("Notification scheduler started")
}

// Stop หยุดการทำงานของ scheduler
func (s *NotificationScheduler) Stop() {
	s.cron.Stop()
	log.Println("Notification scheduler stopped")
}

// Reload โหลดการตั้งค่าการแจ้งเตือนใหม่
func (s *NotificationScheduler) Reload() {
	s.cron.Stop()
	s.jobIDs = make(map[int]cron.EntryID)

	// โหลดการแจ้งเตือนที่ตั้งไว้
	notifications, err := s.loadNotifications()
	if err != nil {
		log.Printf("Error reloading notifications: %v", err)
	}

	// ลงทะเบียนงานในระบบ cron
	for _, notification := range notifications {
		s.scheduleNotification(notification)
	}

	// เริ่มต้น cron
	s.cron.Start()
	log.Println("Notification scheduler reloaded")
}

// loadNotifications โหลดการตั้งค่าการแจ้งเตือนจากฐานข้อมูล
func (s *NotificationScheduler) loadNotifications() ([]models.Notification, error) {
	query := `
		SELECT 
			id, 
			table_id, 
			view_name, 
			fields, 
			message_template, 
			header_template, 
			bubble_template,
			footer_template,
			enable_bubbles, 
			group_ids, 
			schedule, 
			active
		FROM airtable_notifications
		WHERE active = true
	`

	rows, err := s.db.Query(query)
	if err != nil {
		return nil, fmt.Errorf("error querying notifications: %v", err)
	}
	defer rows.Close()

	var notifications []models.Notification
	for rows.Next() {
		var notification models.Notification
		var fieldsJSON, groupIDsJSON []byte

		// ใช้ sql.NullString สำหรับฟิลด์ที่อาจเป็น NULL
		var tableID sql.NullString
		var viewName sql.NullString
		var messageTemplate sql.NullString
		var headerTemplate sql.NullString
		var schedule sql.NullString

		err := rows.Scan(
			&notification.ID,
			&tableID,
			&viewName,
			&fieldsJSON,
			&messageTemplate,
			&headerTemplate,
			&notification.BubbleTemplate,
			&notification.FooterTemplate,
			&notification.EnableBubbles,
			&groupIDsJSON,
			&schedule,
			&notification.Active,
		)
		if err != nil {
			return nil, fmt.Errorf("error scanning notification row: %v", err)
		}

		// จัดการค่า NULL
		if tableID.Valid {
			notification.TableID = tableID.String
		} else {
			notification.TableID = ""
		}

		if viewName.Valid {
			notification.ViewName = viewName.String
		} else {
			notification.ViewName = ""
		}

		if messageTemplate.Valid {
			notification.MessageTemplate = messageTemplate.String
		} else {
			notification.MessageTemplate = ""
		}

		if headerTemplate.Valid {
			notification.HeaderTemplate = headerTemplate.String
		} else {
			notification.HeaderTemplate = ""
		}

		if schedule.Valid {
			notification.Schedule = schedule.String
		} else {
			notification.Schedule = ""
		}

		// แปลง JSON เป็นสลาย
		var fields []string
		if fieldsJSON != nil && len(fieldsJSON) > 0 {
			if err := json.Unmarshal(fieldsJSON, &fields); err != nil {
				return nil, fmt.Errorf("error unmarshaling fields: %v", err)
			}
		}
		notification.Fields = fields

		var groupIDs []string
		if groupIDsJSON != nil && len(groupIDsJSON) > 0 {
			if err := json.Unmarshal(groupIDsJSON, &groupIDs); err != nil {
				return nil, fmt.Errorf("error unmarshaling group IDs: %v", err)
			}
		}
		notification.GroupIDs = groupIDs

		notifications = append(notifications, notification)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating notification rows: %v", err)
	}

	return notifications, nil
}

// scheduleNotification ลงทะเบียนการแจ้งเตือนในระบบ cron
func (s *NotificationScheduler) scheduleNotification(notification models.Notification) {
	// ตรวจสอบว่ามี schedule และมีค่าไม่เป็นค่าว่าง
	if notification.Schedule == "" {
		log.Printf("Notification %d has empty schedule, skipping", notification.ID)
		return
	}

	// ฟังก์ชันสำหรับการส่งการแจ้งเตือน
	job := func() {
		log.Printf("Executing scheduled notification %d", notification.ID)

		var recordsSent int
		var err error

		// ส่งข้อมูลจาก Airtable ไปยัง LINE ตามประเภทการแจ้งเตือน
		if notification.EnableBubbles {
			recordsSent, err = s.notificationService.SendRecordPerBubbleToLine(
				notification.TableID,
				notification.ViewName,
				notification.Fields,
				notification.GroupIDs,
				notification.HeaderTemplate,
				notification.BubbleTemplate,
				notification.FooterTemplate,
			)
		} else {
			recordsSent, err = s.notificationService.SendAirtableViewToLine(
				notification.TableID,
				notification.ViewName,
				notification.Fields,
				notification.MessageTemplate,
				notification.GroupIDs,
			)
		}

		// บันทึกประวัติการทำงาน
		if err != nil {
			log.Printf("Error sending notification %d: %v", notification.ID, err)
			s.logExecution(notification.ID, "failed", 0, err.Error())
		} else {
			log.Printf("Successfully sent notification %d: %d records", notification.ID, recordsSent)
			s.logExecution(notification.ID, "success", recordsSent, "")
		}

		// อัพเดทเวลาล่าสุดที่รัน
		s.updateLastRun(notification.ID)
	}

	// ลงทะเบียน cron job
	entryID, err := s.cron.AddFunc(notification.Schedule, job)
	if err != nil {
		log.Printf("Error scheduling notification %d: %v", notification.ID, err)
		return
	}

	// บันทึก job ID เพื่อใช้ในการอ้างอิงหรือยกเลิกในอนาคต
	s.jobIDs[notification.ID] = entryID
	log.Printf("Scheduled notification %d with cron expression: %s", notification.ID, notification.Schedule)
}

// logExecution บันทึกประวัติการทำงานของการแจ้งเตือน
func (s *NotificationScheduler) logExecution(notificationID int, status string, recordsSent int, errorMessage string) {
	query := `
		INSERT INTO airtable_notification_logs (notification_id, status, records_sent, error_message, sent_at)
		VALUES ($1, $2, $3, $4, $5)
	`

	_, err := s.db.Exec(query, notificationID, status, recordsSent, errorMessage, time.Now())
	if err != nil {
		log.Printf("Error logging notification execution: %v", err)
	}
}

// updateLastRun อัพเดทเวลาล่าสุดที่รันการแจ้งเตือน
func (s *NotificationScheduler) updateLastRun(notificationID int) {
	query := `
		UPDATE airtable_notifications
		SET last_run = $1, updated_at = $1
		WHERE id = $2
	`

	_, err := s.db.Exec(query, time.Now(), notificationID)
	if err != nil {
		log.Printf("Error updating last run time: %v", err)
	}
}

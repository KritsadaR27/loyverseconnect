// backend/external/AirtableConnect/infrastructure/data/notification_data.go

package data

import (
	"backend/external/AirtableConnect/domain/interfaces"
	"backend/external/AirtableConnect/domain/models"
	"database/sql"
	"encoding/json"
	"fmt"
	"time"
)

// NotificationRepository implements the repository for notification data
type NotificationRepository struct {
	db *sql.DB
}

// NewNotificationRepository creates a new instance of NotificationRepository
func NewNotificationRepository(db *sql.DB) interfaces.NotificationRepository {
	return &NotificationRepository{db: db}
}

// SaveNotification saves a new notification configuration
func (r *NotificationRepository) SaveNotification(notification models.Notification) (int, error) {
	// แปลงฟิลด์เป็น JSON
	fieldsJSON, err := json.Marshal(notification.Fields)
	if err != nil {
		return 0, fmt.Errorf("error marshaling fields: %v", err)
	}

	// แปลง group IDs เป็น JSON
	groupIDsJSON, err := json.Marshal(notification.GroupIDs)
	if err != nil {
		return 0, fmt.Errorf("error marshaling group IDs: %v", err)
	}

	// แปลง notification times เป็น JSON ถ้ามีค่า
	var notificationTimesJSON []byte
	if notification.NotificationTimes != nil {
		notificationTimesJSON, err = json.Marshal(notification.NotificationTimes)
		if err != nil {
			return 0, fmt.Errorf("error marshaling notification times: %v", err)
		}
	}

	// บันทึกลงฐานข้อมูล
	query := `
		INSERT INTO airtable_notifications (
			name,
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
			notification_times,
			created_at,
			updated_at,
			active
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
		RETURNING id
	`

	now := time.Now()
	var id int
	err = r.db.QueryRow(
		query,
		notification.Name,
		notification.TableID,
		notification.ViewName,
		fieldsJSON,
		notification.MessageTemplate,
		notification.HeaderTemplate,
		notification.BubbleTemplate, // เพิ่มฟิลด์นี้
		notification.FooterTemplate, // เพิ่มฟิลด์นี้
		notification.EnableBubbles,
		groupIDsJSON,
		notification.Schedule,
		notificationTimesJSON,
		now,
		now,
		notification.Active,
	).Scan(&id)

	if err != nil {
		return 0, fmt.Errorf("error saving notification: %v", err)
	}

	return id, nil
}

// GetNotificationByID retrieves a notification by its ID
func (r *NotificationRepository) GetNotificationByID(id int) (models.Notification, error) {
	query := `
        SELECT
            id,
            name,
            table_id,
            view_name,
            fields,
            message_template,
            header_template,
            bubble_template, -- เพิ่มฟิลด์นี้
            footer_template, -- เพิ่มฟิลด์นี้
            enable_bubbles,
            group_ids,
            schedule,
            notification_times,
            last_run,
            created_at,
            updated_at,
            active
        FROM airtable_notifications
        WHERE id = $1
    `

	var notification models.Notification
	var fieldsJSON, groupIDsJSON, notificationTimesJSON []byte
	var lastRun sql.NullTime
	var headerTemplate, bubbleTemplate, footerTemplate sql.NullString

	err := r.db.QueryRow(query, id).Scan(
		&notification.ID,
		&notification.Name,
		&notification.TableID,
		&notification.ViewName,
		&fieldsJSON,
		&notification.MessageTemplate,
		&headerTemplate,
		&bubbleTemplate, // เพิ่มฟิลด์นี้
		&footerTemplate, // เพิ่มฟิลด์นี้
		&notification.EnableBubbles,
		&groupIDsJSON,
		&notification.Schedule,
		&notificationTimesJSON,
		&lastRun,
		&notification.CreatedAt,
		&notification.UpdatedAt,
		&notification.Active,
	)

	if err != nil {
		return models.Notification{}, fmt.Errorf("error retrieving notification: %v", err)
	}

	// จัดการกับค่า NULL
	if headerTemplate.Valid {
		notification.HeaderTemplate = headerTemplate.String
	}
	if bubbleTemplate.Valid {
		notification.BubbleTemplate = bubbleTemplate.String
	}
	if footerTemplate.Valid {
		notification.FooterTemplate = footerTemplate.String
	}

	// แปลง JSON เป็น slice
	var fields []string
	if err := json.Unmarshal(fieldsJSON, &fields); err != nil {
		return models.Notification{}, fmt.Errorf("error unmarshaling fields: %v", err)
	}
	notification.Fields = fields

	var groupIDs []string
	if err := json.Unmarshal(groupIDsJSON, &groupIDs); err != nil {
		return models.Notification{}, fmt.Errorf("error unmarshaling group IDs: %v", err)
	}
	notification.GroupIDs = groupIDs

	// แปลง notification times ถ้ามีค่า
	if notificationTimesJSON != nil {
		var notificationTimes []string
		if err := json.Unmarshal(notificationTimesJSON, &notificationTimes); err != nil {
			return models.Notification{}, fmt.Errorf("error unmarshaling notification times: %v", err)
		}
		notification.NotificationTimes = notificationTimes
	}

	if lastRun.Valid {
		notification.LastRun = lastRun.Time
	}

	return notification, nil
}

// UpdateNotification updates an existing notification
func (r *NotificationRepository) UpdateNotification(notification models.Notification) error {
	// แปลงฟิลด์เป็น JSON
	fieldsJSON, err := json.Marshal(notification.Fields)
	if err != nil {
		return fmt.Errorf("error marshaling fields: %v", err)
	}

	// แปลง group IDs เป็น JSON
	groupIDsJSON, err := json.Marshal(notification.GroupIDs)
	if err != nil {
		return fmt.Errorf("error marshaling group IDs: %v", err)
	}

	// แปลง notification times เป็น JSON ถ้ามีค่า
	var notificationTimesJSON []byte
	if notification.NotificationTimes != nil {
		notificationTimesJSON, err = json.Marshal(notification.NotificationTimes)
		if err != nil {
			return fmt.Errorf("error marshaling notification times: %v", err)
		}
	}

	// อัพเดทในฐานข้อมูล
	query := `
        UPDATE airtable_notifications
        SET
            name = $1,
            table_id = $2,
            view_name = $3,
            fields = $4,
            message_template = $5,
            header_template = $6,
            bubble_template = $7,
            footer_template = $8,
            enable_bubbles = $9,
            group_ids = $10,
            schedule = $11,
            notification_times = $12,
            updated_at = $13,
            active = $14
        WHERE id = $15
    `

	_, err = r.db.Exec(
		query,
		notification.Name,
		notification.TableID,
		notification.ViewName,
		fieldsJSON,
		notification.MessageTemplate,
		notification.HeaderTemplate,
		notification.BubbleTemplate, // เพิ่มฟิลด์นี้
		notification.FooterTemplate, // เพิ่มฟิลด์นี้
		notification.EnableBubbles,
		groupIDsJSON,
		notification.Schedule,
		notificationTimesJSON,
		time.Now(),
		notification.Active,
		notification.ID,
	)

	if err != nil {
		return fmt.Errorf("error updating notification: %v", err)
	}

	return nil
}

// DeleteNotification deletes a notification
func (r *NotificationRepository) DeleteNotification(id int) error {
	query := `DELETE FROM airtable_notifications WHERE id = $1`
	_, err := r.db.Exec(query, id)
	if err != nil {
		return fmt.Errorf("error deleting notification: %v", err)
	}
	return nil
}

// ListNotifications retrieves all notifications
func (r *NotificationRepository) ListNotifications(activeOnly bool) ([]models.Notification, error) {
	var query string
	var args []interface{}

	if activeOnly {
		query = `
			SELECT
				id,
				name,
				table_id,
				view_name,
				fields,
				message_template,
				header_template,
				enable_bubbles,
				group_ids,
				schedule,
				notification_times,
				last_run,
				created_at,
				updated_at,
				active
			FROM airtable_notifications
			WHERE active = true
			ORDER BY id
		`
	} else {
		query = `
			SELECT
				id,
				name,
				table_id,
				view_name,
				fields,
				message_template,
				header_template,
				enable_bubbles,
				group_ids,
				schedule,
				notification_times,
				last_run,
				created_at,
				updated_at,
				active
			FROM airtable_notifications
			ORDER BY id
		`
	}

	rows, err := r.db.Query(query, args...)
	if err != nil {
		return nil, fmt.Errorf("error querying notifications: %v", err)
	}
	defer rows.Close()

	var notifications []models.Notification
	for rows.Next() {
		var notification models.Notification
		var fieldsJSON, groupIDsJSON, notificationTimesJSON []byte
		var lastRun sql.NullTime

		// ใช้ sql.NullString สำหรับทุกฟิลด์ string ที่อาจเป็น NULL
		var name sql.NullString
		var tableID sql.NullString
		var viewName sql.NullString
		var messageTemplate sql.NullString
		var headerTemplate sql.NullString
		var schedule sql.NullString

		err := rows.Scan(
			&notification.ID,
			&name,
			&tableID,
			&viewName,
			&fieldsJSON,
			&messageTemplate,
			&headerTemplate,
			&notification.EnableBubbles,
			&groupIDsJSON,
			&schedule,
			&notificationTimesJSON,
			&lastRun,
			&notification.CreatedAt,
			&notification.UpdatedAt,
			&notification.Active,
		)

		if err != nil {
			return nil, fmt.Errorf("error scanning notification row: %v", err)
		}

		// จัดการค่า NULL ในฟิลด์ String
		if name.Valid {
			notification.Name = name.String
		} else {
			notification.Name = ""
		}

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

		// แปลง notification times ถ้ามีค่า
		if notificationTimesJSON != nil && len(notificationTimesJSON) > 0 {
			var notificationTimes []string
			if err := json.Unmarshal(notificationTimesJSON, &notificationTimes); err != nil {
				return nil, fmt.Errorf("error unmarshaling notification times: %v", err)
			}
			notification.NotificationTimes = notificationTimes
		}

		// จัดการกับค่า NULL
		if lastRun.Valid {
			notification.LastRun = lastRun.Time
		}

		notifications = append(notifications, notification)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating notification rows: %v", err)
	}

	return notifications, nil
}

// SaveNotificationLog saves a notification execution log
func (r *NotificationRepository) SaveNotificationLog(log models.NotificationLog) (int, error) {
	query := `
		INSERT INTO airtable_notification_logs (
			notification_id,
			status,
			records_sent,
			error_message,
			sent_at
		) VALUES ($1, $2, $3, $4, $5)
		RETURNING id
	`

	var id int
	err := r.db.QueryRow(
		query,
		log.NotificationID,
		log.Status,
		log.RecordsSent,
		log.ErrorMessage,
		log.SentAt,
	).Scan(&id)

	if err != nil {
		return 0, fmt.Errorf("error saving notification log: %v", err)
	}

	return id, nil
}

// GetNotificationLogs retrieves logs for a specific notification
func (r *NotificationRepository) GetNotificationLogs(notificationID int, limit, offset int) ([]models.NotificationLog, error) {
	query := `
		SELECT
			id,
			notification_id,
			status,
			records_sent,
			error_message,
			sent_at
		FROM airtable_notification_logs
		WHERE notification_id = $1
		ORDER BY sent_at DESC
		LIMIT $2 OFFSET $3
	`

	rows, err := r.db.Query(query, notificationID, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("error querying notification logs: %v", err)
	}
	defer rows.Close()

	var logs []models.NotificationLog
	for rows.Next() {
		var log models.NotificationLog
		var errorMessage sql.NullString

		err := rows.Scan(
			&log.ID,
			&log.NotificationID,
			&log.Status,
			&log.RecordsSent,
			&errorMessage,
			&log.SentAt,
		)

		if err != nil {
			return nil, fmt.Errorf("error scanning notification log row: %v", err)
		}

		// จัดการกับค่า NULL
		if errorMessage.Valid {
			log.ErrorMessage = errorMessage.String
		}

		logs = append(logs, log)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating notification log rows: %v", err)
	}

	return logs, nil
}

// UpdateLastRun updates the last run time for a notification
func (r *NotificationRepository) UpdateLastRun(id int, lastRun time.Time) error {
	query := `
		UPDATE airtable_notifications
		SET last_run = $1, updated_at = $1
		WHERE id = $2
	`

	_, err := r.db.Exec(query, lastRun, id)
	if err != nil {
		return fmt.Errorf("error updating last run time: %v", err)
	}

	return nil
}

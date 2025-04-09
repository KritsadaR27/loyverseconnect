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

// NotificationRepositoryImpl implements the repository for notification data
type NotificationRepositoryImpl struct {
	db *sql.DB
}

// NewNotificationRepository creates a new instance of NotificationRepository
func NewNotificationRepository(db *sql.DB) interfaces.NotificationRepository {
	return &NotificationRepositoryImpl{db: db}
}

// SaveNotification saves a new notification configuration
func (r *NotificationRepositoryImpl) SaveNotification(notification models.Notification) (int, error) {
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

	// บันทึกลงฐานข้อมูล
	query := `
		INSERT INTO airtable_notifications (
			table_id,
			view_name,
			fields,
			message_template,
			group_ids,
			schedule,
			created_at,
			updated_at,
			active
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		RETURNING id
	`

	now := time.Now()
	var id int
	err = r.db.QueryRow(
		query,
		notification.TableID,
		notification.ViewName,
		fieldsJSON,
		notification.MessageTemplate,
		groupIDsJSON,
		notification.Schedule,
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
func (r *NotificationRepositoryImpl) GetNotificationByID(id int) (models.Notification, error) {
	query := `
		SELECT
			id,
			table_id,
			view_name,
			fields,
			message_template,
			group_ids,
			schedule,
			last_run,
			created_at,
			updated_at,
			active
		FROM airtable_notifications
		WHERE id = $1
	`

	var notification models.Notification
	var fieldsJSON, groupIDsJSON []byte
	var lastRun sql.NullTime

	err := r.db.QueryRow(query, id).Scan(
		&notification.ID,
		&notification.TableID,
		&notification.ViewName,
		&fieldsJSON,
		&notification.MessageTemplate,
		&groupIDsJSON,
		&notification.Schedule,
		&lastRun,
		&notification.CreatedAt,
		&notification.UpdatedAt,
		&notification.Active,
	)

	if err != nil {
		return models.Notification{}, fmt.Errorf("error retrieving notification: %v", err)
	}

	// แปลง JSON เป็นสลาย
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

	// จัดการกับค่า NULL
	if lastRun.Valid {
		notification.LastRun = lastRun.Time
	}

	return notification, nil
}

// UpdateNotification updates an existing notification
func (r *NotificationRepositoryImpl) UpdateNotification(notification models.Notification) error {
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

	// อัพเดทในฐานข้อมูล
	query := `
		UPDATE airtable_notifications
		SET
			table_id = $1,
			view_name = $2,
			fields = $3,
			message_template = $4,
			group_ids = $5,
			schedule = $6,
			updated_at = $7,
			active = $8
		WHERE id = $9
	`

	_, err = r.db.Exec(
		query,
		notification.TableID,
		notification.ViewName,
		fieldsJSON,
		notification.MessageTemplate,
		groupIDsJSON,
		notification.Schedule,
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
func (r *NotificationRepositoryImpl) DeleteNotification(id int) error {
	query := `
		DELETE FROM airtable_notifications
		WHERE id = $1
	`

	_, err := r.db.Exec(query, id)
	if err != nil {
		return fmt.Errorf("error deleting notification: %v", err)
	}

	return nil
}

// ListNotifications retrieves all notifications
func (r *NotificationRepositoryImpl) ListNotifications(activeOnly bool) ([]models.Notification, error) {
	var query string
	var args []interface{}

	if activeOnly {
		query = `
			SELECT
				id,
				table_id,
				view_name,
				fields,
				message_template,
				group_ids,
				schedule,
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
				table_id,
				view_name,
				fields,
				message_template,
				group_ids,
				schedule,
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
		var fieldsJSON, groupIDsJSON []byte
		var lastRun sql.NullTime

		err := rows.Scan(
			&notification.ID,
			&notification.TableID,
			&notification.ViewName,
			&fieldsJSON,
			&notification.MessageTemplate,
			&groupIDsJSON,
			&notification.Schedule,
			&lastRun,
			&notification.CreatedAt,
			&notification.UpdatedAt,
			&notification.Active,
		)

		if err != nil {
			return nil, fmt.Errorf("error scanning notification row: %v", err)
		}

		// แปลง JSON เป็นสลาย
		var fields []string
		if err := json.Unmarshal(fieldsJSON, &fields); err != nil {
			return nil, fmt.Errorf("error unmarshaling fields: %v", err)
		}
		notification.Fields = fields

		var groupIDs []string
		if err := json.Unmarshal(groupIDsJSON, &groupIDs); err != nil {
			return nil, fmt.Errorf("error unmarshaling group IDs: %v", err)
		}
		notification.GroupIDs = groupIDs

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
func (r *NotificationRepositoryImpl) SaveNotificationLog(log models.NotificationLog) (int, error) {
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
func (r *NotificationRepositoryImpl) GetNotificationLogs(notificationID int, limit, offset int) ([]models.NotificationLog, error) {
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
func (r *NotificationRepositoryImpl) UpdateLastRun(id int, lastRun time.Time) error {
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

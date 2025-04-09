package interfaces

import (
	"backend/external/AirtableConnect/domain/models"
	"time"
)

// NotificationRepository defines the interface for interacting with notification data
type NotificationRepository interface {
	SaveNotification(notification models.Notification) (int, error)
	GetNotificationByID(id int) (models.Notification, error)
	UpdateNotification(notification models.Notification) error
	DeleteNotification(id int) error
	ListNotifications(activeOnly bool) ([]models.Notification, error)
	SaveNotificationLog(log models.NotificationLog) (int, error)
	GetNotificationLogs(notificationID int, limit, offset int) ([]models.NotificationLog, error)
	UpdateLastRun(id int, lastRun time.Time) error
}

// NotificationService defines the interface for notification-related operations
type NotificationService interface {
	SendAirtableViewToLine(tableID string, viewName string, fields []string, messageTemplate string, groupIDs []string) (int, error)
	SendScheduledNotifications(schedules []models.ScheduledNotification) []error
}

// backend/external/LineConnect/domain/interfaces/message_interface.go
package interfaces

import (
	"backend/external/LineConnect/domain/models"
	"time"
)

// MessageRepository defines the methods for accessing message data
type MessageRepository interface {
	// SaveMessage saves a new message to the database
	SaveMessage(message models.Message) (int, error)

	// GetMessageByID retrieves a message by its ID
	GetMessageByID(id int) (models.Message, error)

	// UpdateMessageStatus updates the status of a message
	UpdateMessageStatus(id int, status string, sentAt *time.Time) error

	// ListMessages retrieves all messages with optional filters
	ListMessages(limit, offset int, status string) ([]models.Message, error)
}

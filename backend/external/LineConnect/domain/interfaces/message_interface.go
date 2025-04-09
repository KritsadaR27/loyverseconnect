// backend/internal/LineConnect/domain/interfaces/message_interface.go
package interfaces

import "backend/internal/LineConnect/domain/models"

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

// backend/internal/LineConnect/domain/interfaces/group_interface.go
package interfaces

import "backend/internal/LineConnect/domain/models"

// GroupRepository defines the methods for accessing group data
type GroupRepository interface {
	// SaveGroup saves a new group to the database
	SaveGroup(group models.Group) error
	
	// GetGroupByID retrieves a group by its ID
	GetGroupByID(id string) (models.Group, error)
	
	// UpdateGroup updates an existing group
	UpdateGroup(group models.Group) error
	
	// DeleteGroup removes a group from the database
	DeleteGroup(id string) error
	
	// ListGroups retrieves all groups
	ListGroups() ([]models.Group, error)
}

// backend/internal/LineConnect/domain/interfaces/line_interface.go
package interfaces

import "github.com/line/line-bot-sdk-go/v7/linebot"

// LineClient defines the interface for interacting with the LINE API
type LineClient interface {
	// SendTextMessage sends a text message to a LINE group
	SendTextMessage(groupID, text string) error
	
	// SendImageMessage sends an image message to a LINE group
	SendImageMessage(groupID, imageURL, previewURL string) error
	
	// GetClient returns the underlying linebot.Client
	GetClient() *linebot.Client
}
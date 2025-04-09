// backend/internal/LineConnect/domain/models/message.go
package models

import "time"

// Message represents a message to be sent to LINE
type Message struct {
	ID        int       `json:"id"`
	Content   string    `json:"content"`
	GroupIDs  []string  `json:"group_ids"`
	Type      string    `json:"type"` // text, image, etc.
	Status    string    `json:"status"` // pending, sent, failed
	CreatedAt time.Time `json:"created_at"`
	SentAt    *time.Time `json:"sent_at"`
}

// MessageRequest is the model for message creation requests
type MessageRequest struct {
	Content  string   `json:"content"`
	GroupIDs []string `json:"group_ids"`
	Type     string   `json:"type"`
}

// MessageResponse is the model for message responses
type MessageResponse struct {
	ID        int       `json:"id"`
	Content   string    `json:"content"`
	Groups    []Group   `json:"groups"`
	Type      string    `json:"type"`
	Status    string    `json:"status"`
	CreatedAt time.Time `json:"created_at"`
	SentAt    *time.Time `json:"sent_at"`
}

// backend/internal/LineConnect/domain/models/group.go
package models

import "time"

// Group represents a LINE group
type Group struct {
	ID          string    `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
	Active      bool      `json:"active"`
}

// GroupRequest is the model for group creation requests
type GroupRequest struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
}
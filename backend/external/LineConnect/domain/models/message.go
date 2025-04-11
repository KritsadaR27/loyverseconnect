// backend/external/LineConnect/domain/models/message.go
package models

import (
	"database/sql"
	"time"
)

// Message represents a message to be sent to LINE
type Message struct {
	ID        int        `json:"id"`
	Content   string     `json:"content"`
	GroupIDs  []string   `json:"group_ids"`
	Type      string     `json:"type"`   // text, image, etc.
	Status    string     `json:"status"` // pending, sent, failed
	CreatedAt time.Time  `json:"created_at"`
	SentAt    *time.Time `json:"sent_at"`
	Sender    string     `json:"sender"` // sender ID or name
	Timestamp time.Time  `json:"timestamp"`
}

// MessageRequest is the model for message creation requests
type MessageRequest struct {
	Content  string   `json:"content"`
	GroupIDs []string `json:"group_ids"`
	Type     string   `json:"type"`
}

// MessageResponse is the model for message responses
type MessageResponse struct {
	ID        int        `json:"id"`
	Content   string     `json:"content"`
	Groups    []Group    `json:"groups"`
	Type      string     `json:"type"`
	Status    string     `json:"status"`
	CreatedAt time.Time  `json:"created_at"`
	SentAt    *time.Time `json:"sent_at"`
	Sender    string     `json:"sender"`
	Timestamp time.Time  `json:"timestamp"`
}

var sender sql.NullString

// backend/external/LineConnect/infrastructure/data/message_data.go
package data

import (
	"backend/external/LineConnect/domain/models"
	"database/sql"
	"encoding/json"
	"fmt"
	"time"
)

// MessageRepository implements the MessageRepository interface
type MessageRepository struct {
	db *sql.DB
}

// NewMessageRepository creates a new instance of MessageRepository
func NewMessageRepository(db *sql.DB) *MessageRepository {
	return &MessageRepository{
		db: db,
	}
}

// SaveMessage saves a new message to the database
func (r *MessageRepository) SaveMessage(message models.Message) (int, error) {
	// Marshal group IDs to JSON
	groupIDsJSON, err := json.Marshal(message.GroupIDs)
	if err != nil {
		return 0, fmt.Errorf("error marshaling group IDs: %v", err)
	}

	// Insert message into database
	query := `
		INSERT INTO line_messages (content, group_ids, type, status, created_at)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id
	`
	var id int
	err = r.db.QueryRow(
		query,
		message.Content,
		groupIDsJSON,
		message.Type,
		message.Status,
		message.CreatedAt,
	).Scan(&id)

	if err != nil {
		return 0, fmt.Errorf("error saving message: %v", err)
	}

	return id, nil
}

// GetMessageByID retrieves a message by its ID
func (r *MessageRepository) GetMessageByID(id int) (models.Message, error) {
	query := `
		SELECT id, content, group_ids, type, status, created_at, sent_at
		FROM line_messages
		WHERE id = $1
	`
	var message models.Message
	var groupIDsJSON []byte
	var sentAt sql.NullTime

	err := r.db.QueryRow(query, id).Scan(
		&message.ID,
		&message.Content,
		&groupIDsJSON,
		&message.Type,
		&message.Status,
		&message.CreatedAt,
		&sentAt,
	)

	if err != nil {
		return models.Message{}, fmt.Errorf("error retrieving message: %v", err)
	}

	// Unmarshal group IDs from JSON
	var groupIDs []string
	if err := json.Unmarshal(groupIDsJSON, &groupIDs); err != nil {
		return models.Message{}, fmt.Errorf("error unmarshaling group IDs: %v", err)
	}
	message.GroupIDs = groupIDs

	// Handle nullable sent_at
	if sentAt.Valid {
		message.SentAt = &sentAt.Time
	}

	return message, nil
}

// UpdateMessageStatus updates the status of a message
func (r *MessageRepository) UpdateMessageStatus(id int, status string, sentAt *time.Time) error {
	query := `
		UPDATE line_messages
		SET status = $1, sent_at = $2
		WHERE id = $3
	`
	_, err := r.db.Exec(query, status, sentAt, id)
	if err != nil {
		return fmt.Errorf("error updating message status: %v", err)
	}
	return nil
}

// ListMessages retrieves all messages with optional filters
func (r *MessageRepository) ListMessages(limit, offset int, status string) ([]models.Message, error) {
	var query string
	var args []interface{}

	if status != "" {
		query = `
			SELECT id, content, group_ids, type, status, created_at, sent_at
			FROM line_messages
			WHERE status = $1
			ORDER BY created_at DESC
			LIMIT $2 OFFSET $3
		`
		args = []interface{}{status, limit, offset}
	} else {
		query = `
			SELECT id, content, group_ids, type, status, created_at, sent_at
			FROM line_messages
			ORDER BY created_at DESC
			LIMIT $1 OFFSET $2
		`
		args = []interface{}{limit, offset}
	}

	rows, err := r.db.Query(query, args...)
	if err != nil {
		return nil, fmt.Errorf("error listing messages: %v", err)
	}
	defer rows.Close()

	var messages []models.Message
	for rows.Next() {
		var message models.Message
		var groupIDsJSON []byte
		var sentAt sql.NullTime

		err := rows.Scan(
			&message.ID,
			&message.Content,
			&groupIDsJSON,
			&message.Type,
			&message.Status,
			&message.CreatedAt,
			&sentAt,
		)

		if err != nil {
			return nil, fmt.Errorf("error scanning message row: %v", err)
		}

		// Unmarshal group IDs from JSON
		var groupIDs []string
		if err := json.Unmarshal(groupIDsJSON, &groupIDs); err != nil {
			return nil, fmt.Errorf("error unmarshaling group IDs: %v", err)
		}
		message.GroupIDs = groupIDs

		// Handle nullable sent_at
		if sentAt.Valid {
			message.SentAt = &sentAt.Time
		}

		messages = append(messages, message)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating message rows: %v", err)
	}

	return messages, nil
}

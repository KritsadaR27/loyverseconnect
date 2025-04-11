// backend/external/LineConnect/application/services/message_service.go
package services

import (
	"backend/external/LineConnect/domain/interfaces"
	"backend/external/LineConnect/domain/models"
	"fmt"
	"log"
	"strings"
	"time"
)

// MessageService provides methods for managing messages
type MessageService struct {
	messageRepo interfaces.MessageRepository
	groupRepo   interfaces.GroupRepository
	lineClient  interfaces.LineClient
}

// NewMessageService creates a new instance of MessageService
func NewMessageService(messageRepo interfaces.MessageRepository, groupRepo interfaces.GroupRepository, lineClient interfaces.LineClient) *MessageService {
	return &MessageService{
		messageRepo: messageRepo,
		groupRepo:   groupRepo,
		lineClient:  lineClient,
	}
}

// SendMessage sends a message to specified LINE groups
func (s *MessageService) SendMessage(req models.MessageRequest) (*models.MessageResponse, error) {
	// สร้าง message record ในฐานข้อมูล
	message := models.Message{
		Content:   req.Content,
		GroupIDs:  req.GroupIDs,
		Type:      req.Type,
		Status:    "pending",
		CreatedAt: time.Now(),
	}

	messageID, err := s.messageRepo.SaveMessage(message)
	if err != nil {
		return nil, err
	}
	message.ID = messageID

	successfulGroups := []models.Group{}

	// แบ่งข้อความถ้ายาวเกิน 5000
	chunks := splitLongMessage(req.Content)

	for _, groupID := range req.GroupIDs {
		group, err := s.groupRepo.GetGroupByID(groupID)
		if err != nil {
			log.Printf("Failed to get group %s: %v", groupID, err)
			continue
		}
		if !group.Active {
			log.Printf("Group %s is inactive, skipping", groupID)
			continue
		}

		var sendErr error
		if req.Type == "text" {
			for _, chunk := range chunks {
				if err := s.lineClient.SendTextMessage(groupID, chunk); err != nil {
					sendErr = err
					log.Printf("❌ Failed to send chunk to group %s: %v", groupID, err)
				}
			}
		} else if req.Type == "image" {
			sendErr = s.lineClient.SendImageMessage(groupID, req.Content, req.Content)
		}

		if sendErr != nil {
			log.Printf("Failed to send message to group %s: %v", groupID, sendErr)
		} else {
			successfulGroups = append(successfulGroups, group)
		}
	}

	// Update status
	sentTime := time.Now()
	sentTimePtr := &sentTime
	status := "sent"
	if len(successfulGroups) == 0 {
		status = "failed"
	} else if len(successfulGroups) < len(req.GroupIDs) {
		status = "partially_sent"
	}
	_ = s.messageRepo.UpdateMessageStatus(messageID, status, sentTimePtr)

	return &models.MessageResponse{
		ID:     messageID,
		Status: status,
	}, nil
}

func splitLongMessage(message string) []string {
	const chunkSize = 4800
	var chunks []string

	for len(message) > chunkSize {
		idx := strings.LastIndex(message[:chunkSize], "\n")
		if idx == -1 {
			idx = chunkSize
		}
		chunks = append(chunks, strings.TrimSpace(message[:idx]))
		message = strings.TrimSpace(message[idx:])
	}
	if len(message) > 0 {
		chunks = append(chunks, strings.TrimSpace(message))
	}
	return chunks
}

// GetMessageHistory returns the history of sent messages
func (s *MessageService) GetMessageHistory(limit, offset int) ([]models.MessageResponse, error) {
	messages, err := s.messageRepo.ListMessages(limit, offset, "")
	if err != nil {
		return nil, err
	}

	var responses []models.MessageResponse
	for _, msg := range messages {
		groups := []models.Group{}
		for _, groupID := range msg.GroupIDs {
			group, err := s.groupRepo.GetGroupByID(groupID)
			if err == nil {
				groups = append(groups, group)
			}
		}

		responses = append(responses, models.MessageResponse{
			ID:        msg.ID,
			Content:   msg.Content,
			Groups:    groups,
			Type:      msg.Type,
			Status:    msg.Status,
			CreatedAt: msg.CreatedAt,
			SentAt:    msg.SentAt,
		})
	}

	return responses, nil
}

// GetRecentMessages retrieves the most recent messages for a specific group

func (s *MessageService) GetRecentMessages(groupID string, limit int) ([]models.MessageResponse, error) {
	messages, err := s.messageRepo.GetRecentMessagesByGroupID(groupID, limit)
	if err != nil {
		return nil, fmt.Errorf("error retrieving recent messages: %v", err)
	}

	var responses []models.MessageResponse
	for _, msg := range messages {
		responses = append(responses, models.MessageResponse{
			ID:        msg.ID,
			Content:   msg.Content,
			Sender:    msg.Sender, // ตรวจสอบว่ามี Sender หรือไม่
			Timestamp: msg.CreatedAt,
		})
	}

	return responses, nil
}

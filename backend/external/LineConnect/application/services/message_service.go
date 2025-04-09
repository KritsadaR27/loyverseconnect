// backend/internal/LineConnect/application/services/message_service.go
package services

import (
	"backend/internal/LineConnect/domain/interfaces"
	"backend/internal/LineConnect/domain/models"
	"log"
	"time"
)

// MessageService handles the business logic for sending messages
type MessageService struct {
	messageRepo interfaces.MessageRepository
	groupRepo   interfaces.GroupRepository
	lineClient  interfaces.LineClient
}

// NewMessageService creates a new instance of MessageService
func NewMessageService(
	messageRepo interfaces.MessageRepository,
	groupRepo interfaces.GroupRepository,
	lineClient interfaces.LineClient,
) *MessageService {
	return &MessageService{
		messageRepo: messageRepo,
		groupRepo:   groupRepo,
		lineClient:  lineClient,
	}
}

// SendMessage sends a message to specified LINE groups
func (s *MessageService) SendMessage(req models.MessageRequest) (*models.MessageResponse, error) {
	// Create a new message record
	message := models.Message{
		Content:   req.Content,
		GroupIDs:  req.GroupIDs,
		Type:      req.Type,
		Status:    "pending",
		CreatedAt: time.Now(),
	}

	// Save the message to the database
	messageID, err := s.messageRepo.SaveMessage(message)
	if err != nil {
		return nil, err
	}

	message.ID = messageID

	// Send the message to each group
	successfulGroups := []models.Group{}
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
			sendErr = s.lineClient.SendTextMessage(groupID, req.Content)
		} else if req.Type == "image" {
			// For image messages, content should be the image URL
			sendErr = s.lineClient.SendImageMessage(groupID, req.Content, req.Content)
		}

		if sendErr != nil {
			log.Printf("Failed to send message to group %s: %v", groupID, sendErr)
		} else {
			successfulGroups = append(successfulGroups, group)
		}
	}

	// Update message status
	sentTime := time.Now()
	status := "sent"
	if len(successfulGroups) == 0 {
		status = "failed"
	} else if len(successfulGroups) < len(req.GroupIDs) {
		status = "partially_sent"
	}

	err = s.messageRepo.UpdateMessageStatus(messageID, status, &sentTime)
	if err != nil {
		log.Printf("Failed to update message status: %v", err)
	}

	// Return response
	return &models.MessageResponse{
		ID:        messageID,
		Content:   req.Content,
		Groups:    successfulGroups,
		Type:      req.Type,
		Status:    status,
		CreatedAt: message.CreatedAt,
		SentAt:    &sentTime,
	}, nil
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

// backend/internal/LineConnect/application/services/group_service.go
package services

import (
	"backend/internal/LineConnect/domain/interfaces"
	"backend/internal/LineConnect/domain/models"
	"time"
)

// GroupService handles the business logic for managing LINE groups
type GroupService struct {
	groupRepo interfaces.GroupRepository
}

// NewGroupService creates a new instance of GroupService
func NewGroupService(groupRepo interfaces.GroupRepository) *GroupService {
	return &GroupService{
		groupRepo: groupRepo,
	}
}

// GetGroups retrieves all registered LINE groups
func (s *GroupService) GetGroups() ([]models.Group, error) {
	return s.groupRepo.ListGroups()
}

// CreateGroup registers a new LINE group
func (s *GroupService) CreateGroup(req models.GroupRequest) (*models.Group, error) {
	now := time.Now()
	group := models.Group{
		ID:          req.ID,
		Name:        req.Name,
		Description: req.Description,
		CreatedAt:   now,
		UpdatedAt:   now,
		Active:      true,
	}

	err := s.groupRepo.SaveGroup(group)
	if err != nil {
		return nil, err
	}

	return &group, nil
}

// UpdateGroup updates an existing LINE group
func (s *GroupService) UpdateGroup(id string, req models.GroupRequest) (*models.Group, error) {
	group, err := s.groupRepo.GetGroupByID(id)
	if err != nil {
		return nil, err
	}

	group.Name = req.Name
	group.Description = req.Description
	group.UpdatedAt = time.Now()

	err = s.groupRepo.UpdateGroup(group)
	if err != nil {
		return nil, err
	}

	return &group, nil
}

// DeleteGroup removes a LINE group registration
func (s *GroupService) DeleteGroup(id string) error {
	return s.groupRepo.DeleteGroup(id)
}
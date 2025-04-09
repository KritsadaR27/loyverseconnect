// backend/internal/LineConnect/application/handlers/message_handler.go
package handlers

import (
	"backend/internal/LineConnect/application/services"
	"backend/internal/LineConnect/domain/models"
	"encoding/json"
	"net/http"
	"strconv"
)

// MessageHandler handles HTTP requests related to messages
type MessageHandler struct {
	messageService *services.MessageService
}

// NewMessageHandler creates a new instance of MessageHandler
func NewMessageHandler(messageService *services.MessageService) *MessageHandler {
	return &MessageHandler{
		messageService: messageService,
	}
}

// SendMessage handles the request to send a message to LINE groups
func (h *MessageHandler) SendMessage(w http.ResponseWriter, r *http.Request) {
	// Only accept POST method
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Parse request body
	var req models.MessageRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Validate request
	if req.Content == "" {
		http.Error(w, "Message content is required", http.StatusBadRequest)
		return
	}

	if len(req.GroupIDs) == 0 {
		http.Error(w, "At least one group ID is required", http.StatusBadRequest)
		return
	}

	if req.Type == "" {
		req.Type = "text" // Default to text message if not specified
	}

	// Send the message
	response, err := h.messageService.SendMessage(req)
	if err != nil {
		http.Error(w, "Failed to send message: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Return response
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// GetMessageHistory handles the request to retrieve message history
func (h *MessageHandler) GetMessageHistory(w http.ResponseWriter, r *http.Request) {
	// Only accept GET method
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Parse query parameters
	limitStr := r.URL.Query().Get("limit")
	offsetStr := r.URL.Query().Get("offset")

	limit := 10 // Default limit
	if limitStr != "" {
		parsedLimit, err := strconv.Atoi(limitStr)
		if err == nil && parsedLimit > 0 {
			limit = parsedLimit
		}
	}

	offset := 0 // Default offset
	if offsetStr != "" {
		parsedOffset, err := strconv.Atoi(offsetStr)
		if err == nil && parsedOffset >= 0 {
			offset = parsedOffset
		}
	}

	// Get message history
	messages, err := h.messageService.GetMessageHistory(limit, offset)
	if err != nil {
		http.Error(w, "Failed to retrieve message history: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Return response
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(messages)
}

// backend/internal/LineConnect/application/handlers/group_handler.go
package handlers

import (
	"backend/internal/LineConnect/application/services"
	"backend/internal/LineConnect/domain/models"
	"encoding/json"
	"net/http"
	"strings"
)

// GroupHandler handles HTTP requests related to LINE groups
type GroupHandler struct {
	groupService *services.GroupService
}

// NewGroupHandler creates a new instance of GroupHandler
func NewGroupHandler(groupService *services.GroupService) *GroupHandler {
	return &GroupHandler{
		groupService: groupService,
	}
}

// GetGroups handles the request to retrieve all registered LINE groups
func (h *GroupHandler) GetGroups(w http.ResponseWriter, r *http.Request) {
	// Only accept GET method
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Get all groups
	groups, err := h.groupService.GetGroups()
	if err != nil {
		http.Error(w, "Failed to retrieve groups: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Return response
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(groups)
}

// CreateGroup handles the request to register a new LINE group
func (h *GroupHandler) CreateGroup(w http.ResponseWriter, r *http.Request) {
	// Only accept POST method
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Parse request body
	var req models.GroupRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Validate request
	if req.ID == "" {
		http.Error(w, "Group ID is required", http.StatusBadRequest)
		return
	}

	if req.Name == "" {
		http.Error(w, "Group name is required", http.StatusBadRequest)
		return
	}

	// Create the group
	group, err := h.groupService.CreateGroup(req)
	if err != nil {
		http.Error(w, "Failed to create group: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Return response
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(group)
}

// UpdateGroup handles the request to update an existing LINE group
func (h *GroupHandler) UpdateGroup(w http.ResponseWriter, r *http.Request) {
	// Only accept PUT method
	if r.Method != http.MethodPut {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Get group ID from URL path
	path := strings.TrimPrefix(r.URL.Path, "/api/line/groups/")
	if path == r.URL.Path {
		http.Error(w, "Invalid URL path", http.StatusBadRequest)
		return
	}

	groupID := path

	// Parse request body
	var req models.GroupRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Update the group
	group, err := h.groupService.UpdateGroup(groupID, req)
	if err != nil {
		http.Error(w, "Failed to update group: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Return response
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(group)
}

// DeleteGroup handles the request to remove a LINE group registration
func (h *GroupHandler) DeleteGroup(w http.ResponseWriter, r *http.Request) {
	// Only accept DELETE method
	if r.Method != http.MethodDelete {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Get group ID from URL path
	path := strings.TrimPrefix(r.URL.Path, "/api/line/groups/")
	if path == r.URL.Path {
		http.Error(w, "Invalid URL path", http.StatusBadRequest)
		return
	}

	groupID := path

	// Delete the group
	err := h.groupService.DeleteGroup(groupID)
	if err != nil {
		http.Error(w, "Failed to delete group: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Return success response
	w.WriteHeader(http.StatusNoContent)
}
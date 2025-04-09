// backend/external/LineConnect/application/handlers/message_handler.go
package handlers

import (
	"backend/external/LineConnect/application/services"
	"backend/external/LineConnect/domain/models"
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

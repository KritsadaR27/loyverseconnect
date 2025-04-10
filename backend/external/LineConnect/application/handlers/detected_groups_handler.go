// backend/external/LineConnect/application/handlers/detected_groups_handler.go
package handlers

import (
	"backend/external/LineConnect/domain/interfaces"
	"backend/external/LineConnect/domain/models"
	"encoding/json"
	"net/http"
	"sync"
)

// DetectedGroupsHandler handles HTTP requests related to LINE groups detected by events
type DetectedGroupsHandler struct {
	detectedGroups map[string]bool
	groupRepo      interfaces.GroupRepository
	mu             sync.Mutex
}

// NewDetectedGroupsHandler creates a new instance of DetectedGroupsHandler
func NewDetectedGroupsHandler(groupRepo interfaces.GroupRepository) *DetectedGroupsHandler {
	return &DetectedGroupsHandler{
		detectedGroups: make(map[string]bool),
		groupRepo:      groupRepo,
		mu:             sync.Mutex{},
	}
}

// RecordDetectedGroup adds a group ID to the detected groups list
func (h *DetectedGroupsHandler) RecordDetectedGroup(groupID string) {
	if groupID == "" {
		return
	}

	h.mu.Lock()
	defer h.mu.Unlock()
	h.detectedGroups[groupID] = true
}

// GetDetectedGroups handles requests for fetching detected groups
func (h *DetectedGroupsHandler) GetDetectedGroups(w http.ResponseWriter, r *http.Request) {
	// Only accept GET method
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	h.mu.Lock()
	defer h.mu.Unlock()

	// Get all registered groups
	registeredGroups, err := h.groupRepo.ListGroups()
	if err != nil {
		http.Error(w, "Failed to retrieve registered groups: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Create a set of registered group IDs
	registeredGroupIDs := make(map[string]bool)
	for _, group := range registeredGroups {
		registeredGroupIDs[group.ID] = true
	}

	// Filter out registered groups from detected groups
	var unregisteredGroups []models.Group
	for groupID := range h.detectedGroups {
		if !registeredGroupIDs[groupID] {
			unregisteredGroups = append(unregisteredGroups, models.Group{
				ID: groupID,
			})
		}
	}

	// Return response
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(unregisteredGroups)
}

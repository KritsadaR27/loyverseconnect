// backend/internal/AirtableConnect/application/handlers/sync_handler.go
package handlers

import (
	"backend/internal/AirtableConnect/application/services"
	"backend/internal/AirtableConnect/domain/models"
	"encoding/json"
	"net/http"
	"strconv"
)

// SyncHandler handles HTTP requests related to Airtable synchronization
type SyncHandler struct {
	airtableService *services.AirtableService
}

// NewSyncHandler creates a new instance of SyncHandler
func NewSyncHandler(airtableService *services.AirtableService) *SyncHandler {
	return &SyncHandler{
		airtableService: airtableService,
	}
}

// GetTables handles requests to fetch all table configurations
func (h *SyncHandler) GetTables(w http.ResponseWriter, r *http.Request) {
	// Only accept GET method
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Get tables
	tables, err := h.airtableService.GetTables()
	if err != nil {
		http.Error(w, "Failed to retrieve tables: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Return response
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(tables)
}

// GetTable handles requests to fetch a specific table configuration
func (h *SyncHandler) GetTable(w http.ResponseWriter, r *http.Request) {
	// Only accept GET method
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Parse table ID from query parameters
	idStr := r.URL.Query().Get("id")
	if idStr == "" {
		http.Error(w, "Table ID is required", http.StatusBadRequest)
		return
	}

	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "Invalid table ID", http.StatusBadRequest)
		return
	}

	// Get table
	table, err := h.airtableService.GetTableByID(id)
	if err != nil {
		http.Error(w, "Failed to retrieve table: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Return response
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(table)
}

// CreateTable handles requests to create a new table configuration
func (h *SyncHandler) CreateTable(w http.ResponseWriter, r *http.Request) {
	// Only accept POST method
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Parse request body
	var req models.TableRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Validate request
	if req.Name == "" {
		http.Error(w, "Table name is required", http.StatusBadRequest)
		return
	}

	if req.AirtableID == "" {
		http.Error(w, "Airtable ID is required", http.StatusBadRequest)
		return
	}

	// Create table
	table, err := h.airtableService.CreateTable(req)
	if err != nil {
		http.Error(w, "Failed to create table: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Return response
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(table)
}

// UpdateTable handles requests to update an existing table configuration
func (h *SyncHandler) UpdateTable(w http.ResponseWriter, r *http.Request) {
	// Only accept PUT method
	if r.Method != http.MethodPut {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Parse table ID from query parameters
	idStr := r.URL.Query().Get("id")
	if idStr == "" {
		http.Error(w, "Table ID is required", http.StatusBadRequest)
		return
	}

	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "Invalid table ID", http.StatusBadRequest)
		return
	}

	// Parse request body
	var req models.TableRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Update table
	table, err := h.airtableService.UpdateTable(id, req)
	if err != nil {
		http.Error(w, "Failed to update table: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Return response
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(table)
}

// DeleteTable handles requests to delete a table configuration
func (h *SyncHandler) DeleteTable(w http.ResponseWriter, r *http.Request) {
	// Only accept DELETE method
	if r.Method != http.MethodDelete {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Parse table ID from query parameters
	idStr := r.URL.Query().Get("id")
	if idStr == "" {
		http.Error(w, "Table ID is required", http.StatusBadRequest)
		return
	}

	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "Invalid table ID", http.StatusBadRequest)
		return
	}

	// Delete table
	if err := h.airtableService.DeleteTable(id); err != nil {
		http.Error(w, "Failed to delete table: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Return success response
	w.WriteHeader(http.StatusNoContent)
}

// SyncTable handles requests to synchronize a specific table
func (h *SyncHandler) SyncTable(w http.ResponseWriter, r *http.Request) {
	// Only accept POST method
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Parse table ID from query parameters
	idStr := r.URL.Query().Get("id")
	if idStr == "" {
		http.Error(w, "Table ID is required", http.StatusBadRequest)
		return
	}

	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "Invalid table ID", http.StatusBadRequest)
		return
	}

	// Sync table
	result, err := h.airtableService.SyncTable(id)
	if err != nil {
		http.Error(w, "Failed to sync table: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Return response
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}

// SyncAllTables handles requests to synchronize all tables
func (h *SyncHandler) SyncAllTables(w http.ResponseWriter, r *http.Request) {
	// Only accept POST method
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Sync all tables
	results, err := h.airtableService.SyncAllTables()
	if err != nil {
		http.Error(w, "Failed to sync tables: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Return response
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(results)
}

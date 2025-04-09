// backend/external/LineConnect/application/services/group_service.go
package services

import (
	"backend/external/LineConnect/domain/interfaces"
	"backend/external/LineConnect/domain/models"
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

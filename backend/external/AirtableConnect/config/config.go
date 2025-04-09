// backend/external/AirtableConnect/config/config.go
package config

import (
	"fmt"
	"os"

	"github.com/mehanizm/airtable"
)

// NewAirtableClient creates a new Airtable client using environment variables
func NewAirtableClient() (*airtable.Client, error) {
	// Use personal access token instead of API key
	accessToken := os.Getenv("AIRTABLE_ACCESS_TOKEN")
	if accessToken == "" {
		return nil, fmt.Errorf("AIRTABLE_ACCESS_TOKEN environment variable is not set")
	}

	// Create new client
	client := airtable.NewClient(accessToken)
	return client, nil
}

// GetAirtableBaseID retrieves the Airtable base ID from environment variables
func GetAirtableBaseID() (string, error) {
	baseID := os.Getenv("AIRTABLE_BASE_ID")
	if baseID == "" {
		return "", fmt.Errorf("AIRTABLE_BASE_ID environment variable is not set")
	}
	return baseID, nil
}

// backend/external/LineConnect/domain/interfaces/line_interface.go
package interfaces

import "github.com/line/line-bot-sdk-go/v7/linebot"

// LineClient defines the interface for interacting with the LINE API
type LineClient interface {
	// SendTextMessage sends a text message to a LINE group
	SendTextMessage(groupID, text string) error

	// SendImageMessage sends an image message to a LINE group
	SendImageMessage(groupID, imageURL, previewURL string) error

	// GetClient returns the underlying linebot.Client
	GetClient() *linebot.Client
}

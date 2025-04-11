// backend/external/LineConnect/infrastructure/external/line_client.go
package external

import (
	"backend/external/LineConnect/domain/interfaces"
	"fmt"
	"log"

	"github.com/line/line-bot-sdk-go/v7/linebot"
)

// LineClientImpl implements the LineClient interface
type LineClientImpl struct {
	client *linebot.Client
}

// NewLineClient creates a new LINE client implementation
func NewLineClient(client *linebot.Client) interfaces.LineClient {
	return &LineClientImpl{
		client: client,
	}
}

// SendTextMessage sends a text message to a LINE group
func (c *LineClientImpl) SendTextMessage(groupID, text string) error {
	log.Printf("🚀 Sending LINE message | groupID: %s | text: %q", groupID, text)

	if c.client == nil {
		log.Println("❌ LINE client is nil")
		return fmt.Errorf("LINE client not initialized")
	}

	message := linebot.NewTextMessage(text)

	resp, err := c.client.PushMessage(groupID, message).Do()
	if err != nil {
		log.Printf("❌ LINE PushMessage error to group %s: %v", groupID, err)
		return err
	}

	log.Printf("✅ LINE response | Status: %d", resp.RequestID)
	return nil
}

// SendImageMessage sends an image message to a LINE group
func (c *LineClientImpl) SendImageMessage(groupID, imageURL, previewURL string) error {
	message := linebot.NewImageMessage(imageURL, previewURL)
	_, err := c.client.PushMessage(groupID, message).Do()
	if err != nil {
		log.Printf("Failed to send image message to %s: %v", groupID, err)
		return err
	}
	return nil
}

// GetClient returns the underlying linebot.Client
func (c *LineClientImpl) GetClient() *linebot.Client {
	return c.client
}

// backend/internal/LineConnect/config/config.go
package config

import (
	"fmt"
	"os"

	"github.com/line/line-bot-sdk-go/v7/linebot"
)

// NewLineClient creates a new LINE bot client using environment variables
func NewLineClient() (*linebot.Client, error) {
	channelSecret := os.Getenv("LINE_CHANNEL_SECRET")
	channelToken := os.Getenv("LINE_CHANNEL_TOKEN")

	if channelSecret == "" || channelToken == "" {
		return nil, fmt.Errorf("LINE_CHANNEL_SECRET and LINE_CHANNEL_TOKEN must be set")
	}

	return linebot.New(channelSecret, channelToken)
}

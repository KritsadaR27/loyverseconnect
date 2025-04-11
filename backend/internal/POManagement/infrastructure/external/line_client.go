// internal/POManagement/infrastructure/external/line_client.go
package external

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"time"

	"backend/internal/POManagement/domain/interfaces"
)

// LineClient เชื่อมต่อกับ LineConnect API
type LineClient struct {
	baseURL    string
	httpClient *http.Client
}

// NewLineClient สร้าง LineClient ใหม่
func NewLineClient() interfaces.LineService {
	baseURL := os.Getenv("LINE_CONNECT_SERVICE_URL")
	if baseURL == "" {
		baseURL = "http://line-connect:8085"
	}

	return &LineClient{
		baseURL: baseURL,
		httpClient: &http.Client{
			Timeout: 10 * time.Second,
		},
	}
}

// SendMessage ส่งข้อความผ่าน LINE
func (c *LineClient) SendMessage(ctx context.Context, groupIDs []string, message string) error {
	// เตรียมข้อมูลสำหรับส่ง
	payload := struct {
		Content  string   `json:"content"`
		GroupIDs []string `json:"group_ids"`
		Type     string   `json:"type"`
	}{
		Content:  message,
		GroupIDs: groupIDs,
		Type:     "text",
	}

	// แปลงเป็น JSON
	body, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("error marshaling payload: %w", err)
	}

	// สร้าง request
	req, err := http.NewRequestWithContext(
		ctx,
		http.MethodPost,
		fmt.Sprintf("%s/api/line/messages", c.baseURL),
		bytes.NewReader(body),
	)
	if err != nil {
		return fmt.Errorf("error creating request: %w", err)
	}

	// ตั้งค่า headers
	req.Header.Set("Content-Type", "application/json")

	// ส่ง request
	resp, err := c.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("error sending message: %w", err)
	}
	defer resp.Body.Close()

	// ตรวจสอบสถานะ
	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("unexpected status code: %d", resp.StatusCode)
	}

	return nil
}

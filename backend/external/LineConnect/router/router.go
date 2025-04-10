// backend/external/LineConnect/router/router.go
package router

import (
	"backend/external/LineConnect/application/handlers"
	"backend/external/LineConnect/application/services"
	"backend/external/LineConnect/infrastructure/data"
	"backend/external/LineConnect/infrastructure/external"
	"database/sql"
	"log"
	"net/http"
	"strings"

	"github.com/line/line-bot-sdk-go/v7/linebot"
)

// RegisterRoutes sets up all routes for the LINE Connect service
// Update to backend/external/LineConnect/router/router.go

// First, add the detectedGroupsHandler to the RegisterRoutes function
func RegisterRoutes(mux *http.ServeMux, db *sql.DB, lineBotClient *linebot.Client) {
	// Create repositories
	messageRepo := data.NewMessageRepository(db)
	groupRepo := data.NewGroupRepository(db)

	// Create LINE client
	lineClient := external.NewLineClient(lineBotClient)

	// Create services
	messageService := services.NewMessageService(messageRepo, groupRepo, lineClient)
	groupService := services.NewGroupService(groupRepo)

	// Create handlers
	messageHandler := handlers.NewMessageHandler(messageService)
	groupHandler := handlers.NewGroupHandler(groupService)
	detectedGroupsHandler := handlers.NewDetectedGroupsHandler(groupRepo) // Add this line

	// Register message routes
	mux.HandleFunc("/api/line/messages", messageHandler.SendMessage)
	mux.HandleFunc("/api/line/messages/history", messageHandler.GetMessageHistory)

	// Register group routes
	mux.HandleFunc("/api/line/groups", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			groupHandler.GetGroups(w, r)
		case http.MethodPost:
			groupHandler.CreateGroup(w, r)
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})

	// Register detected groups route
	mux.HandleFunc("/api/line/detected-groups", detectedGroupsHandler.GetDetectedGroups)

	// Handle group-specific operations (update, delete)
	mux.HandleFunc("/api/line/groups/", func(w http.ResponseWriter, r *http.Request) {
		// Check if the URL path starts with "/api/line/groups/"
		if !strings.HasPrefix(r.URL.Path, "/api/line/groups/") {
			http.NotFound(w, r)
			return
		}

		switch r.Method {
		case http.MethodPut:
			groupHandler.UpdateGroup(w, r)
		case http.MethodDelete:
			groupHandler.DeleteGroup(w, r)
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})

	// Add webhook handler for LINE events
	mux.HandleFunc("/webhook/line", func(w http.ResponseWriter, r *http.Request) {
		events, err := lineBotClient.ParseRequest(r)
		if err != nil {
			if err == linebot.ErrInvalidSignature {
				http.Error(w, "Invalid signature", http.StatusBadRequest)
			} else {
				http.Error(w, "Internal server error", http.StatusInternalServerError)
			}
			return
		}

		for _, event := range events {
			log.Printf("🔔 New LINE event: Type=%s, SourceType=%s", event.Type, event.Source.Type)
			log.Printf("Event Source: %v", event.Source)
			log.Printf("Event ReplyToken: %s", event.ReplyToken)
			log.Printf("Event Timestamp: %s", event.Timestamp)
			log.Printf("Event Message: %v", event.Message)
			log.Printf("Event Postback: %v", event.Postback)
			log.Printf("Event Beacon: %v", event.Beacon)

			// Record the group ID if the event is from a group
			if event.Source.Type == linebot.EventSourceTypeGroup && event.Source.GroupID != "" {
				detectedGroupsHandler.RecordDetectedGroup(event.Source.GroupID)
			}

			switch event.Type {
			case linebot.EventTypeJoin:
				// ตอบกลับเพื่อให้ LINE รู้ว่า bot ยัง active อยู่
				replyToken := event.ReplyToken
				if _, err = lineBotClient.ReplyMessage(replyToken, linebot.NewTextMessage("สวัสดี! Bot เข้าร่วมกลุ่มเรียบร้อยแล้วจ้า 🚀")).Do(); err != nil {
					log.Println("Error replying to join event:", err)
				}

			case linebot.EventTypeMessage:
				switch message := event.Message.(type) {
				case *linebot.TextMessage:
					replyToken := event.ReplyToken
					if _, err = lineBotClient.ReplyMessage(replyToken, linebot.NewTextMessage("Received: "+message.Text)).Do(); err != nil {
						log.Println("Error replying to text message:", err)
					}
				}
			}
		}

		// Return 200 OK to acknowledge receipt of the webhook
		w.WriteHeader(http.StatusOK)
	})
}

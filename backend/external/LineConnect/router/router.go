// backend/internal/LineConnect/router/router.go
package router

import (
	"backend/internal/LineConnect/application/handlers"
	"backend/internal/LineConnect/application/services"
	"backend/internal/LineConnect/infrastructure/data"
	"backend/internal/LineConnect/infrastructure/external"
	"database/sql"
	"net/http"
	"strings"

	"github.com/line/line-bot-sdk-go/v7/linebot"
)

// RegisterRoutes sets up all routes for the LINE Connect service
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
			// Process LINE webhook events here
			// This can be expanded based on requirements
			if event.Type == linebot.EventTypeMessage {
				switch message := event.Message.(type) {
				case *linebot.TextMessage:
					// Handle text message
					replyToken := event.ReplyToken
					if _, err = lineBotClient.ReplyMessage(replyToken, linebot.NewTextMessage("Received: "+message.Text)).Do(); err != nil {
						// Log the error but don't return a response to LINE
					}
				}
			}
		}

		// Return 200 OK to acknowledge receipt of the webhook
		w.WriteHeader(http.StatusOK)
	})
}

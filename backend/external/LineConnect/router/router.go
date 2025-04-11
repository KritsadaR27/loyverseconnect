// backend/external/LineConnect/router/router.go
package router

import (
	"backend/external/LineConnect/application/handlers"
	"backend/external/LineConnect/application/services"
	"backend/external/LineConnect/infrastructure/data"
	"backend/external/LineConnect/infrastructure/external"
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
	"github.com/line/line-bot-sdk-go/v7/linebot"
)

// RegisterRoutes sets up all routes for the LINE Connect service
func RegisterRoutes(r *mux.Router, db *sql.DB, lineBotClient *linebot.Client) {
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
	detectedGroupsHandler := handlers.NewDetectedGroupsHandler(groupRepo)

	// Register message routes
	r.HandleFunc("/api/line/messages", messageHandler.SendMessage).Methods("POST")
	r.HandleFunc("/api/line/messages/history", messageHandler.GetMessageHistory).Methods("GET")

	// Register group routes
	r.HandleFunc("/api/line/groups", groupHandler.GetGroups).Methods("GET")
	r.HandleFunc("/api/line/groups", groupHandler.CreateGroup).Methods("POST")
	r.HandleFunc("/api/line/detected-groups", detectedGroupsHandler.GetDetectedGroups).Methods("GET")

	// Handle group-specific operations (update, delete)
	r.HandleFunc("/api/line/groups/{id}", groupHandler.UpdateGroup).Methods("PUT")
	r.HandleFunc("/api/line/groups/{id}", groupHandler.DeleteGroup).Methods("DELETE")

	// Register routes for fetching recent messages
	r.HandleFunc("/api/line/groups/{id}/messages", func(w http.ResponseWriter, r *http.Request) {
		vars := mux.Vars(r)
		groupID := vars["id"]

		limitStr := r.URL.Query().Get("limit")
		limit := 5 // Default limit
		if limitStr != "" {
			if parsedLimit, err := strconv.Atoi(limitStr); err == nil && parsedLimit > 0 {
				limit = parsedLimit
			}
		}

		messages, err := messageService.GetRecentMessages(groupID, limit)
		if err != nil {
			log.Printf("Error fetching messages for group %s: %v", groupID, err)
			http.Error(w, fmt.Sprintf("Error fetching messages: %v", err), http.StatusInternalServerError)
			return
		}

		log.Printf("Fetched messages for group %s: %v", groupID, messages) // เพิ่ม log นี้

		w.Header().Set("Content-Type", "application/json")
		if err := json.NewEncoder(w).Encode(messages); err != nil {
			log.Printf("Error encoding response for group %s: %v", groupID, err)
			http.Error(w, fmt.Sprintf("Error encoding response: %v", err), http.StatusInternalServerError)
			return
		}
	}).Methods("GET")

	// Add webhook handler for LINE events
	r.HandleFunc("/webhook/line", func(w http.ResponseWriter, r *http.Request) {
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
				if _, err = lineBotClient.ReplyMessage(replyToken, linebot.NewTextMessage("สวัสดี! Bot เข้าร่วมกลุ่มแล้ว 🚀")).Do(); err != nil {
					log.Println("Error replying to join event:", err)
				}

			case linebot.EventTypeMessage:
				switch message := event.Message.(type) {
				case *linebot.TextMessage:
					replyToken := event.ReplyToken
					log.Printf("Received text message: %s (ReplyToken: %s)", message.Text, replyToken)
				}
			}
		}

		// Return 200 OK to acknowledge receipt of the webhook
		w.WriteHeader(http.StatusOK)
	}).Methods("POST")
}

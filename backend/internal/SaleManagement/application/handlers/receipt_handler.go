// SaleManagement/application/handlers/receipt_handler.go
package handlers

import (
	"backend/internal/SaleManagement/application/services"
	"encoding/json"
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/gorilla/websocket"
)

type ReceiptHandler struct {
	receiptService *services.ReceiptService
	clients        map[*websocket.Conn]bool
}

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func NewReceiptHandler(receiptService *services.ReceiptService) *ReceiptHandler {
	return &ReceiptHandler{
		receiptService: receiptService,
		clients:        make(map[*websocket.Conn]bool),
	}
}

func (h *ReceiptHandler) WebSocketEndpoint(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("Error upgrading to websocket:", err)
		return
	}
	defer conn.Close()

	h.clients[conn] = true

	// ตั้งค่าให้ดึงข้อมูลอัปเดตเป็นระยะ ๆ แล้วส่งให้ clients
	ticker := time.NewTicker(10 * time.Second) // ดึงข้อมูลทุก 10 วินาที
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			receipts, err := h.receiptService.GetReceiptsWithDetails(100, 0) // ดึงข้อมูลใบเสร็จล่าสุด
			if err != nil {
				log.Println("Error fetching receipts:", err)
				continue
			}

			data, err := json.Marshal(receipts)
			if err != nil {
				log.Println("Error marshalling receipts to JSON:", err)
				continue
			}

			for client := range h.clients {
				err := client.WriteMessage(websocket.TextMessage, data)
				if err != nil {
					log.Println("Error sending message to client:", err)
					client.Close()
					delete(h.clients, client)
				}
			}

			// ตรวจสอบว่า WebSocket client ยังเชื่อมต่ออยู่
			_, _, err = conn.ReadMessage() // ข้าม messageType และ p โดยใช้ _
			if err != nil {
				log.Println("Error reading message:", err)
				delete(h.clients, conn)
				break
			}
		}
	}

}

func (h *ReceiptHandler) ListReceipts(w http.ResponseWriter, r *http.Request) {
	// ดึงค่า offset และ pageSize จาก query parameters
	pageSizeParam := r.URL.Query().Get("pageSize")
	offsetParam := r.URL.Query().Get("offset")

	// กำหนดค่า default ถ้าไม่ได้ระบุค่า offset หรือ pageSize
	pageSize := 100
	offset := 0

	// แปลง pageSize และ offset จาก string เป็น int (ถ้ามีใน query)
	if pageSizeParam != "" {
		if ps, err := strconv.Atoi(pageSizeParam); err == nil {
			pageSize = ps
		}
	}
	if offsetParam != "" {
		if os, err := strconv.Atoi(offsetParam); err == nil {
			offset = os
		}
	}

	// เรียก service เพื่อดึงข้อมูล
	receipts, err := h.receiptService.GetReceiptsWithDetails(pageSize, offset)
	if err != nil {
		log.Println("Error fetching receipts:", err)
		http.Error(w, "Failed to fetch receipts", http.StatusInternalServerError)
		return
	}

	// ส่งข้อมูลกลับไปยัง client
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(receipts); err != nil {
		log.Println("Error encoding receipts to JSON:", err)
		return
	}
}

func (h *ReceiptHandler) ListSalesByItem(w http.ResponseWriter, r *http.Request) {
	// กำหนดค่า default ถ้าไม่มีการส่ง offset และ pageSize มาจาก query
	pageSize := 100
	offset := 0

	// ตรวจสอบ query parameters "pageSize" และ "offset"
	if ps := r.URL.Query().Get("pageSize"); ps != "" {
		if parsedPageSize, err := strconv.Atoi(ps); err == nil {
			pageSize = parsedPageSize
		}
	}

	if os := r.URL.Query().Get("offset"); os != "" {
		if parsedOffset, err := strconv.Atoi(os); err == nil {
			offset = parsedOffset
		}
	}

	// ดึงข้อมูล sales โดยใช้ pageSize และ offset
	sales, err := h.receiptService.GetSalesByItem(pageSize, offset)
	if err != nil {
		log.Println("Error fetching sales by item:", err)
		http.Error(w, "Failed to fetch sales by item", http.StatusInternalServerError)
		return
	}

	// ส่งข้อมูลกลับในรูปแบบ JSON
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(sales); err != nil {
		log.Println("Error encoding sales by item to JSON:", err)
		http.Error(w, "Failed to encode sales by item", http.StatusInternalServerError)
		return
	}
}

// func (h *ReceiptHandler) ListSalesByDay(w http.ResponseWriter, r *http.Request) {
// 	salesByDay, err := h.receiptService.GetSalesByDay()
// 	if err != nil {
// 		log.Println("Error fetching sales by day:", err)
// 		http.Error(w, "Failed to fetch sales by day", http.StatusInternalServerError)
// 		return
// 	}

// 	w.Header().Set("Content-Type", "application/json")
// 	if err := json.NewEncoder(w).Encode(salesByDay); err != nil {
// 		log.Println("Error encoding sales by day to JSON:", err)
// 		http.Error(w, "Failed to encode sales by day", http.StatusInternalServerError)
// 		return
// 	}
// }

// Assuming your backend handler can parse "startDate" and "endDate" from query params

func (h *ReceiptHandler) ListSalesByDay(w http.ResponseWriter, r *http.Request) {
	startDate := r.URL.Query().Get("startDate")
	endDate := r.URL.Query().Get("endDate")

	// Ensure both dates are provided
	if startDate == "" || endDate == "" {
		http.Error(w, "startDate and endDate are required", http.StatusBadRequest)
		return
	}

	// Parse the dates into time.Time using RFC3339 format
	start, err := time.Parse(time.RFC3339, startDate)
	if err != nil {
		log.Printf("Invalid startDate format: %v", err)
		http.Error(w, "Invalid startDate format", http.StatusBadRequest)
		return
	}
	end, err := time.Parse(time.RFC3339, endDate)
	if err != nil {
		log.Printf("Invalid endDate format: %v", err)
		http.Error(w, "Invalid endDate format", http.StatusBadRequest)
		return
	}

	salesByDay, err := h.receiptService.GetSalesByDay(start, end)
	if err != nil {
		log.Println("Error fetching sales by day:", err)
		http.Error(w, "Failed to fetch sales by day", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(salesByDay); err != nil {
		log.Println("Error encoding sales by day to JSON:", err)
		http.Error(w, "Failed to encode sales by day", http.StatusInternalServerError)
		return
	}
}

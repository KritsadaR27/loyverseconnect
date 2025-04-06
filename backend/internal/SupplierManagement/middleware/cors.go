// backend/internal/InventoryManagement/middleware/cors.go
package middleware

import (
	"net/http"
	"strings"
)

// CORS Middleware เพื่อจัดการ cross-origin resource sharing
func CORS(next http.Handler) http.Handler {
	// กำหนด whitelist ของ origin ที่อนุญาต
	allowedOrigins := []string{
		"http://localhost:3000",    // Local development
		"https://app.lungruay.com", // Production URL
	}

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")

		// ตรวจสอบว่า origin อยู่ใน whitelist หรือไม่
		if isAllowedOrigin(origin, allowedOrigins) {
			w.Header().Set("Access-Control-Allow-Origin", origin)
		}

		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		// ถ้าเป็นคำขอ OPTIONS ให้ตอบกลับโดยไม่เรียก handler ต่อไป
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

// ฟังก์ชันตรวจสอบว่า origin อยู่ใน whitelist หรือไม่
func isAllowedOrigin(origin string, allowedOrigins []string) bool {
	for _, o := range allowedOrigins {
		if strings.EqualFold(o, origin) {
			return true
		}
	}
	return false
}

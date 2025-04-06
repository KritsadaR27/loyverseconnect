// backend/internal/InventoryManagement/middleware/cors.go
package middleware

import "net/http"

// CORS Middleware เพื่อจัดการ cross-origin resource sharing
func CORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")

		// ตรวจสอบ origin ที่อนุญาต
		if origin == "http://localhost:3000" || origin == "https://app.lungruay.com" {
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

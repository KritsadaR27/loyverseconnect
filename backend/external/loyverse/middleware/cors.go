// backend/external/loyverse/middleware/cors.go
package middleware

import (
	"log"
	"net/http"
)

func CORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")
		allowed := origin == "http://localhost:3000" || origin == "https://app.lungruay.com"

		log.Printf("CORS Middleware: Origin=%s, Method=%s", origin, r.Method)

		if allowed {
			w.Header().Set("Access-Control-Allow-Origin", origin)
			w.Header().Set("Vary", "Origin") // ป้องกัน cache ผิด
			w.Header().Set("Access-Control-Allow-Credentials", "true")
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		} else if origin != "" {
			log.Printf("❌ Origin blocked by CORS: %s", origin)
		}

		// ถ้าเป็น preflight OPTIONS request
		if r.Method == http.MethodOptions {
			if allowed {
				w.WriteHeader(http.StatusNoContent)
			} else {
				w.WriteHeader(http.StatusForbidden)
			}
			return
		}

		next.ServeHTTP(w, r)
	})
}

// CORSMiddleware เป็น middleware สำหรับจัดการ CORS
// โดยจะอนุญาตให้เฉพาะ origin ที่กำหนดไว้เท่านั้น
// ในที่นี้คือ http://localhost:3000 และ https://app.lungruay.com
//
// วิธีการทำงาน:
// 1. ตรวจสอบ header "Origin" ของ request
// 2. ถ้า origin ตรงกับที่กำหนดไว้ จะอนุญาตให้เข้าถึง
// 3. ตั้งค่า header ที่จำเป็นสำหรับ CORS
// 4. ถ้าเป็น preflight request (OPTIONS method) จะตอบกลับด้วย status 204
// 5. ถ้าไม่ใช่ preflight request จะเรียก next handler ต่อไป
//
// การใช้งาน:
// - ใช้ middleware นี้กับทุก route ที่ต้องการให้รองรับ CORS
// - สามารถปรับ origin ที่อนุญาตได้ตามต้องการ
// - สามารถปรับ header ที่อนุญาตได้ตามต้องการ
// - สามารถปรับ methods ที่อนุญาตได้ตามต้องการ
// - สามารถปรับการตั้งค่า Access-Control-Allow-Credentials ได้ตามต้องการ
// - สามารถปรับการตั้งค่า Vary ได้ตามต้องการ
// - สามารถปรับการตั้งค่า Access-Control-Max-Age ได้ตามต้องการ
// - สามารถปรับการตั้งค่า Access-Control-Expose-Headers ได้ตามต้องการ
// - สามารถปรับการตั้งค่า Access-Control-Allow-Methods ได้ตามต้องการ
// - สามารถปรับการตั้งค่า Access-Control-Allow-Headers ได้ตามต้องการ
// - สามารถปรับการตั้งค่า Access-Control-Allow-Origin ได้ตามต้องการ

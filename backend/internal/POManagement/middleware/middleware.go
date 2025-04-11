// internal/POManagement/middleware/middleware.go
package middleware

import (
	"bytes"
	"fmt"
	"io"
	"log"
	"net/http"
	"runtime/debug"
	"strings"
	"time"
)

// Chain รวม middleware หลายตัวเข้าด้วยกัน
func Chain(handler http.Handler, middlewares ...func(http.Handler) http.Handler) http.Handler {
	for _, middleware := range middlewares {
		handler = middleware(handler)
	}
	return handler
}

// Logging middleware สำหรับบันทึกการเข้าถึง API
func Logging(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()

		// ส่งต่อไปยัง handler ถัดไป
		next.ServeHTTP(w, r)

		// บันทึกข้อมูลการเข้าถึง
		log.Printf(
			"%s %s %s %s",
			r.RemoteAddr,
			r.Method,
			r.URL.Path,
			time.Since(start),
		)
	})
}

// Recovery middleware สำหรับจัดการข้อผิดพลาดที่ไม่ได้คาดหวัง
func Recovery(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		defer func() {
			if err := recover(); err != nil {
				log.Printf("Panic: %v\n%s", err, debug.Stack())
				http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			}
		}()

		next.ServeHTTP(w, r)
	})
}

// CORS middleware สำหรับจัดการ Cross-Origin Resource Sharing
// แก้ไข CORS middleware ในไฟล์ middleware.go

// CORS middleware สำหรับจัดการ Cross-Origin Resource Sharing
func CORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// ตั้งค่า headers สำหรับ CORS
		w.Header().Set("Access-Control-Allow-Origin", "*") // ควรจำกัดเฉพาะโดเมนที่อนุญาตในโปรดักชัน
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, Accept")
		w.Header().Set("Access-Control-Max-Age", "3600") // Cache preflight request for 1 hour

		// ตรวจสอบว่าเป็น OPTIONS request (preflight) หรือไม่
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}

		// บันทึก log สำหรับคำขอ API
		if strings.Contains(r.URL.Path, "/api/po/buffers/batch") {
			body, _ := io.ReadAll(r.Body)
			// สำรองข้อมูลใน body เพื่อใช้ต่อ
			r.Body = io.NopCloser(bytes.NewBuffer(body))

			fmt.Printf("[CORS] Request to %s: Method=%s, Content-Type=%s, Body=%s\n",
				r.URL.Path,
				r.Method,
				r.Header.Get("Content-Type"),
				string(body))
		}

		next.ServeHTTP(w, r)
	})
}

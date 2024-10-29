package utils

import (
	"time"
)

// ConvertToBangkokTime แปลงเวลาจาก UTC เป็นเวลาที่โซนไทย
func ConvertToBangkokTime(utcTime time.Time) time.Time {
	loc, err := time.LoadLocation("Asia/Bangkok")
	if err != nil {
		// Handle error if location can't be loaded
		return utcTime // ถ้าเกิดข้อผิดพลาดให้คืนค่าเป็นเวลา UTC เดิม
	}
	return utcTime.In(loc) // คืนค่าเวลาในโซนไทย
}

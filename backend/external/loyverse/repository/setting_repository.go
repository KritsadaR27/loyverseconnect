// database/settings.go
package repository

import (
	"database/sql"
	"fmt"
)

// GetSetting รับค่าจากตาราง settings โดยใช้ key
func GetSetting(db *sql.DB, key string) (string, error) {
	var value string
	err := db.QueryRow("SELECT value FROM settings WHERE key = $1", key).Scan(&value)
	if err != nil {
		return "", fmt.Errorf("could not get setting: %v", err)
	}
	return value, nil
}

// UpdateSetting อัปเดตค่าจากตาราง settings โดยใช้ key
func UpdateSetting(db *sql.DB, key, value string) error {
	_, err := db.Exec("INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2", key, value)
	return err
}

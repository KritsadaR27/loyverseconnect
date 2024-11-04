package config

import (
	"log"
	"os"
)

func GetLoyverseToken() string {
	token := os.Getenv("LOYVERSE_API_TOKEN")
	if token == "" {
		log.Fatal("LOYVERSE_API_TOKEN is not set in .env")
	}
	return token
}

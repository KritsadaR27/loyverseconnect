// backend/internal/AirtableConnect/config/connectdb.go
package config

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	_ "github.com/lib/pq"
)

func ConnectDB() (*sql.DB, error) {
	// Read DATABASE_URL from environment variable
	psqlInfo := os.Getenv("DATABASE_URL")
	if psqlInfo == "" {
		log.Fatal("DATABASE_URL environment variable is not set")
		return nil, fmt.Errorf("DATABASE_URL is not set")
	}

	// Open database connection
	db, err := sql.Open("postgres", psqlInfo)
	if err != nil {
		log.Fatalf("Unable to connect: %v", err)
		return nil, err
	}

	// Configure connection pool
	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(25)
	db.SetConnMaxLifetime(0)

	// Test connection
	err = db.Ping()
	if err != nil {
		return nil, err
	}

	log.Println("Successfully connected to database!")
	return db, nil
}

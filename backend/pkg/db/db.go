package db

import (
	"log"

	"github.com/jasonoesin/linkhed-in/pkg/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func Init() *gorm.DB {
	dbURL := "postgres://postgres:admin@localHost:5432/postgres"
	db, err := gorm.Open(postgres.Open(dbURL), &gorm.Config{})

	if err != nil {
		log.Fatalln(err)
	}

	db.AutoMigrate(&models.User{}, &models.Post{}, &models.ConnectRequest{}, &models.Link{}, &models.Connection{}, &models.Forgot{}, &models.PostLike{}, &models.Conversation{})

	return db
}

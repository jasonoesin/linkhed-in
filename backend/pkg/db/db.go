package db

import (
	"fmt"
	"log"

	"example.com/linkhedin/pkg/models"
	"github.com/jinzhu/gorm"
)

func GetDatabase() *gorm.DB {
	databasename := "postgres"
	database := "postgres"
	databasepassword := "admin"
	databaseurl := "postgres://postgres:" + databasepassword + "@localhost/" + databasename + "?sslmode=disable"

	connection, err := gorm.Open(database, databaseurl)
	if err != nil {
		log.Fatalln("Invalid database url")
	}
	sqldb := connection.DB()

	err = sqldb.Ping()
	if err != nil {
		log.Fatal("Database connected")
	}
	fmt.Println("Database connection successful.")
	return connection
}

func InitialMigration() {
	connection := GetDatabase()
	defer CloseDatabase(connection)
	connection.AutoMigrate(models.User{})
}

func CloseDatabase(connection *gorm.DB) {
	sqldb := connection.DB()
	sqldb.Close()
}

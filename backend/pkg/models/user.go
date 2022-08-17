package models

import "github.com/jinzhu/gorm"

type User struct {
	gorm.Model
	Name         string `json:"name"`
	Email        string `gorm:"unique" json:"email"`
	Password     string `json:"password"`
	Activated    bool   `json:"activated"`
	ActivationId string `json:"activation_id"`
}

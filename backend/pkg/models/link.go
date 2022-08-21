package models

type Link struct {
	Link   string `json:"text"`
	UserID uint   `json:"user"`
	User   User   `gorm:"foreignKey:UserID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
}

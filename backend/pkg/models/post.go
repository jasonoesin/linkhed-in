package models

type Post struct {
	PostID int    `gorm:"primaryKey" json:"post_id"`
	Text   string `json:"text"`
	UserID uint   `json:"user"`
	User   User   `gorm:"foreignKey:UserID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
}

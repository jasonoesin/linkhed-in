package models

type Forgot struct {
	Link   string `json:"link"`
	UserID uint   `json:"user"`
	User   User   `gorm:"foreignKey:UserID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"-"`
}

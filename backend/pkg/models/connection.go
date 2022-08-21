package models

type Connection struct {
	ConnectionId uint `gorm:"primaryKey;"`
	First        uint `json:"first"`
	FirstUser    User `gorm:"foreignKey:First;references:ID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"-"`
	Second       uint `json:"second"`
	SecondUser   User `gorm:"foreignKey:Second;references:ID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"-"`
}

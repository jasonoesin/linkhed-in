package models

type View struct {
	ViewID      uint `gorm:"primaryKey;"`
	Target      uint `json:"target"`
	TargetUser  User `gorm:"foreignKey:target;references:ID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"-"`
	Current     uint `json:"current"`
	CurrentUser User `gorm:"foreignKey:current;references:ID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"-"`
}

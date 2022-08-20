package models

type ConnectRequest struct {
	ConnectRequestId uint   `gorm:"primaryKey;"`
	Message          string `json:"message"`
	From             uint   `json:"from"`
	FromUser         User   `gorm:"foreignKey:From;references:ID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"-"`
	Target           uint   `json:"target"`
	TargetUser       User   `gorm:"foreignKey:Target;references:ID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"-"`
}

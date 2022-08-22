package models

type Conversation struct {
	ConversationID  int  `gorm:"primaryKey" json:"conversation_id"`
	Source          uint `json:"source"`
	SourceUser      User `gorm:"foreignKey:Source;references:ID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"-"`
	Destination     uint `json:"destination"`
	DestinationUser User `gorm:"foreignKey:Destination;references:ID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"-"`
	Started         bool `json:"started"`
}

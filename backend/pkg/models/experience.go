package models

type Experience struct {
	ExperienceId int    `gorm:"primarykey" json:"experience_id"`
	Title        string `json:"title"`
	Type         string `json:"type"`
	Company      string `json:"company"`

	StartYear int `json:"start_year"`
	EndYear   int `json:"end_year"`

	UserID uint `json:"user"`
	User   User `gorm:"foreignKey:UserID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
}

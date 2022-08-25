package models

type Job struct {
	JobId     int    `gorm:"primarykey" json:"job_id"`
	Name      string `json:"name"`
	Company   string `json:"company"`
	StartYear int    `json:"start_year"`
	EndYear   int    `json:"end_year"`

	UserID uint `json:"user"`
	User   User `gorm:"foreignKey:UserID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
}

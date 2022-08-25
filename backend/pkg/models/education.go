package models

type Education struct {
	EducationId int    `gorm:"primarykey" json:"education_id"`
	School      string `json:"school"`
	Field       string `json:"field"`
	StartYear   int    `json:"start_year"`
	EndYear     int    `json:"end_year"`

	UserID uint `json:"user"`
	User   User `gorm:"foreignKey:UserID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
}

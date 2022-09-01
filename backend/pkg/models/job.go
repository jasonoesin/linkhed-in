package models

type Job struct {
	JobId    int    `gorm:"primarykey" json:"job_id"`
	Name     string `json:"name"`
	Company  string `json:"company"`
	Location string `json:"location"`

	UserID uint `json:"user"`
	User   User `gorm:"foreignKey:UserID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
}

package models

type User struct {
	ID         uint   `json:"id" gorm:"primaryKey;autoIncrement"`
	Name       string `json:"name"`
	Email      string `gorm:"unique" json:"email"`
	Password   string `json:"password"`
	Nick       string `json:"nick"`
	Occupation string `json:"occupation"`

	Activated bool `json:"activated"`

	ProfileUrl    string `json:"profile_url"`
	BackgroundUrl string `json:"background_url"`
}

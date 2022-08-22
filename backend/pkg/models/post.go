package models

type Post struct {
	PostID    int    `gorm:"primaryKey" json:"post_id"`
	Text      string `json:"text"`
	UserID    uint   `json:"user"`
	User      User   `gorm:"foreignKey:UserID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"-"`
	AssetUrl  string `json:"asset"`
	AssetType string `json:"asset_type"`
}

type PostLike struct {
	PostID int  `gorm:"primaryKey" json:"post_id"`
	Post   Post `gorm:"foreignKey:PostID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"-"`
	UserID uint `gorm:"primaryKey" json:"user"`
	User   User `gorm:"foreignKey:UserID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"-"`
}

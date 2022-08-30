package models

type Comment struct {
	CommentId uint   `gorm:"primaryKey;"`
	PostId    uint   `json:"post_id"`
	Post      Post   `gorm:"references:post_id;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"-"`
	UserId    uint   `json:"user_id"`
	User      User   `gorm:"foreignKey:user_id;references:ID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"-"`
	Content   string `json:"content"`
}

type Reply struct {
	ReplyId   uint    `gorm:"primaryKey;"`
	CommentId uint    `json:"comment_id"`
	Comment   Comment `gorm:"references:comment_id;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"-"`
	UserId    uint    `json:"user_id"`
	User      User    `gorm:"foreignKey:user_id;references:ID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"-"`
	Content   string  `json:"content"`
}

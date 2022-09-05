package models

import "github.com/lib/pq"

type Comment struct {
	CommentId uint           `gorm:"primaryKey;"`
	PostId    uint           `json:"post_id"`
	Post      Post           `gorm:"references:post_id;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"-"`
	UserId    uint           `json:"user_id"`
	User      User           `gorm:"foreignKey:user_id;references:ID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"-"`
	Content   string         `json:"content"`
	LikesRef  pq.Int64Array  `json:"likes_ref" gorm:"type:integer[]"`
	Tags      pq.StringArray `json:"tags" gorm:"type:text[]"`
}

type Reply struct {
	ReplyId   uint    `gorm:"primaryKey;"`
	CommentId uint    `json:"comment_id"`
	Comment   Comment `gorm:"references:comment_id;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"-"`
	UserId    uint    `json:"user_id"`
	User      User    `gorm:"foreignKey:user_id;references:ID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"-"`
	Content   string  `json:"content"`
}

type ReplyLike struct {
	ReplyId uint          `gorm:"primaryKey;" json:"reply_id"`
	Reply   Reply         `gorm:"references:ReplyId;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"-"`
	UserId  pq.Int64Array `json:"user_id" gorm:"type:integer[]"`
}

package models

import "github.com/lib/pq"

type Tags struct {
	Id     uint          `gorm:"primaryKey;"`
	Tag    string        `json:"text"`
	PostId pq.Int64Array `json:"post_id" gorm:"type:integer[]"`
}

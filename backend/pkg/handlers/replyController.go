package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

	"github.com/jasonoesin/linkhed-in/pkg/models"
)

func (h handler) AddReply(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var temp models.Reply

	err := json.NewDecoder(r.Body).Decode(&temp)
	if err != nil {
		json.NewEncoder(w).Encode("Error in reading payload.")
		return
	}
	h.DB.Create(&temp)
	json.NewEncoder(w).Encode(temp)
}

func (h handler) AddReplyLike(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	temp := struct {
		ReplyId uint `json:"reply_id"`
		UserId  uint `json:"user_id"`
	}{}

	err := json.NewDecoder(r.Body).Decode(&temp)
	if err != nil {
		json.NewEncoder(w).Encode("Error in reading payload.")
		return
	}

	var replyLike models.ReplyLike
	h.DB.Where("reply_id = ?", temp.ReplyId).Find(&replyLike)

	if replyLike.ReplyId == 0 {
		replyLike.ReplyId = temp.ReplyId
		replyLike.UserId = append(replyLike.UserId, int64(temp.UserId))

		h.DB.Create(&replyLike)
	} else {
		replyLike.UserId = append(replyLike.UserId, int64(temp.UserId))
		h.DB.Save(&replyLike)
	}

	json.NewEncoder(w).Encode(replyLike)
}

func (h handler) UnlikeReply(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	temp := struct {
		ReplyId uint `json:"reply_id"`
		UserId  uint `json:"user_id"`
	}{}

	err := json.NewDecoder(r.Body).Decode(&temp)
	if err != nil {
		json.NewEncoder(w).Encode("Error in reading payload.")
		return
	}

	var replyLike models.ReplyLike
	h.DB.Where("reply_id = ?", temp.ReplyId).Find(&replyLike)

	for i, u := range replyLike.UserId {
		if u == int64(temp.UserId) {
			fmt.Println("yes")
			replyLike.UserId[i] = replyLike.UserId[len(replyLike.UserId)-1]
			replyLike.UserId = replyLike.UserId[:len(replyLike.UserId)-1]
			break
		}
	}

	h.DB.Save(&replyLike)

	json.NewEncoder(w).Encode(replyLike)
}

func (h handler) GetReply(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	comment_id := r.URL.Query().Get("comment_id")
	offset := r.URL.Query().Get("offset")
	getId := r.URL.Query().Get("user_id")

	user_id, _ := strconv.Atoi(getId)

	if comment_id == "" {
		json.NewEncoder(w).Encode("Error in reading payload")
		return
	}

	type Temp struct {
		Reply      models.Reply
		User       models.User
		TotalLikes int  `json:"total_likes"`
		Liked      bool `json:"liked"`
	}

	var replies []models.Reply
	var users []models.User

	if offset == "" {
		h.DB.Where("comment_id = ? ", comment_id).Limit(1).Find(&replies)
		h.DB.Joins("join replies r on r.user_id = users.id").Where("r.comment_id = ? ", comment_id).Limit(1).Find(&users)
	} else {
		var total int64
		h.DB.Model(&models.Reply{}).Where("comment_id = ? ", comment_id).Count(&total)

		offset, _ := strconv.Atoi(offset)

		newLimit := 3

		if offset > int(total) {
			newLimit = (int(total) - (offset))
		}
		h.DB.Where("comment_id = ? ", comment_id).Limit(newLimit).Offset(offset).Find(&replies)
		h.DB.Joins("join replies r on r.user_id = users.id").Where("r.comment_id = ? ", comment_id).Limit(newLimit).Offset(offset).Find(&users)
	}

	var temp []Temp

	for i, r := range replies {
		var replyLike models.ReplyLike
		h.DB.Where("reply_id = ? ", r.ReplyId).Find(&replyLike)

		var liked bool

		for _, u := range replyLike.UserId {
			if u == int64(user_id) {
				liked = true
				break
			}
		}

		temp = append(temp, Temp{
			Reply:      replies[i],
			User:       users[i],
			TotalLikes: len(replyLike.UserId),
			Liked:      liked,
		})
	}

	json.NewEncoder(w).Encode(temp)
}

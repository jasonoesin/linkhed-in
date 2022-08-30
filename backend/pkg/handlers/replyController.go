package handlers

import (
	"encoding/json"
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

func (h handler) GetReply(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	comment_id := r.URL.Query().Get("comment_id")
	offset := r.URL.Query().Get("offset")

	if comment_id == "" {
		json.NewEncoder(w).Encode("Error in reading payload")
		return
	}

	type Temp struct {
		Reply models.Reply
		User  models.User
	}

	var replies []models.Reply
	var users []models.User

	if offset == "" {
		h.DB.Where("comment_id = ? ", comment_id).Order("comment_id desc").Limit(3).Find(&replies)
		h.DB.Joins("join replies r on r.user_id = users.id").Where("r.comment_id = ? ", comment_id).Order("comment_id desc").Limit(3).Find(&users)
	} else {
		var total int64
		h.DB.Model(&models.Reply{}).Where("comment_id = ? ", comment_id).Count(&total)

		offset, _ := strconv.Atoi(offset)

		newLimit := 3

		if offset > int(total) {
			newLimit = (int(total) - (offset))
		}
		h.DB.Where("comment_id = ? ", comment_id).Order("comment_id desc").Limit(newLimit).Offset(offset).Find(&replies)
		h.DB.Joins("join replies r on r.user_id = users.id").Where("r.comment_id = ? ", comment_id).Order("comment_id desc").Limit(newLimit).Offset(offset).Find(&users)
	}

	var temp []Temp

	for i, _ := range replies {
		temp = append(temp, Temp{
			Reply: replies[i],
			User:  users[i],
		})
	}

	json.NewEncoder(w).Encode(temp)
}

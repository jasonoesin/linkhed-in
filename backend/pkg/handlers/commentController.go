package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/jasonoesin/linkhed-in/pkg/models"
)

func (h handler) AddComment(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var temp models.Comment

	err := json.NewDecoder(r.Body).Decode(&temp)
	if err != nil {
		json.NewEncoder(w).Encode("Error in reading payload.")
		return
	}

	h.DB.Create(&temp)
	json.NewEncoder(w).Encode(temp)
}

func (h handler) GetComment(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	post_id := r.URL.Query().Get("post_id")
	offset := r.URL.Query().Get("offset")

	if post_id == "" {
		json.NewEncoder(w).Encode("Error in reading payload")
		return
	}

	type Temp struct {
		Comment models.Comment
		User    models.User
	}

	var comments []models.Comment
	var users []models.User

	if offset == "" {
		h.DB.Where("post_id = ? ", post_id).Order("comment_id desc").Limit(3).Find(&comments)
		h.DB.Joins("join comments c on c.user_id = users.id").Where("c.post_id = ? ", post_id).Order("comment_id desc").Limit(3).Find(&users)
	} else {
		var total int64
		h.DB.Model(&models.Comment{}).Where("post_id = ? ", post_id).Count(&total)

		offset, _ := strconv.Atoi(offset)

		newLimit := 3

		if offset > int(total) {
			newLimit = (int(total) - (offset))
		}
		h.DB.Where("post_id = ? ", post_id).Order("comment_id desc").Limit(newLimit).Offset(offset).Find(&comments)
		h.DB.Joins("join comments c on c.user_id = users.id").Where("c.post_id = ? ", post_id).Order("comment_id desc").Limit(newLimit).Offset(offset).Find(&users)
	}

	var temp []Temp

	for i, _ := range comments {
		temp = append(temp, Temp{
			Comment: comments[i],
			User:    users[i],
		})
	}

	json.NewEncoder(w).Encode(temp)
}

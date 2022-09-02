package handlers

import (
	"encoding/json"
	"fmt"
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
	getId := r.URL.Query().Get("user_id")

	if post_id == "" {
		json.NewEncoder(w).Encode("Error in reading payload")
		return
	}

	type Temp struct {
		Comment    models.Comment
		User       models.User
		TotalLikes int  `json:"total_likes"`
		Liked      bool `json:"liked"`
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

		liked := false

		for _, curr := range comments[i].LikesRef {

			fmt.Println(strconv.Itoa(int(curr)), getId)
			if strconv.Itoa(int(curr)) == getId {
				liked = true
				break
			}
		}

		temp = append(temp, Temp{
			Comment:    comments[i],
			User:       users[i],
			TotalLikes: len(comments[i].LikesRef),
			Liked:      liked,
		})
	}

	json.NewEncoder(w).Encode(temp)
}

func (h handler) LikeComment(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	type Temp struct {
		CommentId uint `gorm:"primaryKey;" json:"comment_id"`
		UserId    uint `gorm:"primaryKey;" json:"user_id"`
	}

	var temp Temp

	err := json.NewDecoder(r.Body).Decode(&temp)
	if err != nil {
		json.NewEncoder(w).Encode("Error in reading payload.")
		return
	}

	var comment models.Comment
	h.DB.Where("comment_id = ?", temp.CommentId).Find(&comment)

	fmt.Println(temp.UserId)
	comment.LikesRef = append(comment.LikesRef, int64(temp.UserId))

	h.DB.Save(&comment)
	json.NewEncoder(w).Encode(comment)
}

func (h handler) UnlikeComment(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	type Temp struct {
		CommentId uint `gorm:"primaryKey;" json:"comment_id"`
		UserId    uint `gorm:"primaryKey;" json:"user_id"`
	}

	var temp Temp

	err := json.NewDecoder(r.Body).Decode(&temp)
	if err != nil {
		json.NewEncoder(w).Encode("Error in reading payload.")
		return
	}

	var comment models.Comment
	h.DB.Where("comment_id = ?", temp.CommentId).Find(&comment)

	for i, id := range comment.LikesRef {
		if id == int64(temp.UserId) {
			comment.LikesRef[i] = comment.LikesRef[len(comment.LikesRef)-1]
			comment.LikesRef = comment.LikesRef[:len(comment.LikesRef)-1]
			break
		}
	}

	h.DB.Save(&comment)
	json.NewEncoder(w).Encode(comment)
}

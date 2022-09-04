package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"github.com/jasonoesin/linkhed-in/pkg/models"
	"github.com/lib/pq"
)

func unique(stringSlice []string) []string {
	keys := make(map[string]bool)
	list := []string{}
	for _, entry := range stringSlice {
		if _, value := keys[entry]; !value {
			keys[entry] = true
			list = append(list, entry)
		}
	}
	return list
}

func (h handler) AddPost(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	temp := struct {
		Text     string         `json:"text"`
		Email    string         `json:"email"`
		AssetUrl string         `json:"asset"`
		Tags     pq.StringArray `json:"tags"`
	}{}

	err := json.NewDecoder(r.Body).Decode(&temp)
	if err != nil {
		json.NewEncoder(w).Encode("Error in reading payload.")
		return
	}

	tempUser, _ := h.UserFromEmail(temp.Email)

	post := models.Post{
		Text:     temp.Text,
		UserID:   tempUser.ID,
		AssetUrl: temp.AssetUrl,
	}

	h.DB.Create(&post)

	for _, tag := range temp.Tags {
		var tagDb models.Tags
		h.DB.Where("tag = ?", tag).Find(&tagDb)

		if tagDb.Id == 0 {
			tagDb.Tag = tag
			tagDb.PostId = append(tagDb.PostId, int64(post.PostID))
			h.DB.Create(&tagDb)
			continue
		} else {
			tagDb.PostId = append(tagDb.PostId, int64(post.PostID))
			h.DB.Save(&tagDb)
		}

	}

	json.NewEncoder(w).Encode(post)
}

func (h handler) UpdatePost(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	temp := struct {
		PostId    int    `json:"post_id"`
		Text      string `json:"text"`
		Email     string `json:"email"`
		AssetUrl  string `json:"asset"`
		AssetType string `json:"asset_type"`
	}{}

	err := json.NewDecoder(r.Body).Decode(&temp)
	if err != nil {
		json.NewEncoder(w).Encode("Error in reading payload.")
		return
	}

	tempUser, _ := h.UserFromEmail(temp.Email)

	post := models.Post{
		PostID:    temp.PostId,
		Text:      temp.Text,
		UserID:    tempUser.ID,
		AssetUrl:  temp.AssetUrl,
		AssetType: temp.AssetType,
	}

	h.DB.Save(&post)
	json.NewEncoder(w).Encode(post)
}

func (h handler) GetAllPost(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	str := r.URL.Query().Get("email")
	limit := r.URL.Query().Get("limit")
	offset := r.URL.Query().Get("offset")

	if str == "" {
		json.NewEncoder(w).Encode("Error in reading payload")
		return
	}

	tempUser, _ := h.UserFromEmail(str)

	// Get All Connected Users Id

	tempArr := h.GetConnectedId(tempUser)
	tempArr = append(tempArr, int(tempUser.ID))
	//

	var postList []models.Post
	var userList []models.User

	if limit == "" || offset == "" {
		h.DB.Joins("JOIN users on users.id = posts.user_id").Where("user_id in (?)", tempArr).Order("post_id desc").Limit(3).Find(&postList)
		h.DB.Joins("JOIN posts on users.id = posts.user_id").Where("user_id in (?)", tempArr).Order("post_id desc").Limit(3).Find(&userList)
	} else {
		var total int64
		h.DB.Model(&models.Post{}).Joins("JOIN users on users.id = posts.user_id").Where("user_id in (?)", tempArr).Where("user_id in (?)", tempArr).Count(&total)

		offset, _ := strconv.Atoi(offset)

		newLimit := 3

		if offset > int(total) {
			newLimit = (int(total) - (offset))
		}

		h.DB.Joins("JOIN users on users.id = posts.user_id").Where("user_id in (?)", tempArr).Order("post_id desc").Limit(newLimit).Offset(offset).Find(&postList)
		h.DB.Joins("JOIN posts on users.id = posts.user_id").Where("user_id in (?)", tempArr).Order("post_id desc").Limit(newLimit).Offset(offset).Find(&userList)

	}

	type Temp struct {
		PostID       int  `json:"post_id"`
		UserID       uint `json:"user"`
		User         models.User
		TotalLikes   int    `json:"total_likes"`
		Liked        bool   `json:"liked"`
		AssetUrl     string `json:"asset"`
		AssetType    string `json:"asset_type"`
		Text         string `json:"text"`
		Total        int    `json:"total"`
		TotalComment int    `json:"total_comment"`
	}

	var obj = []Temp{}

	for i, post := range postList {
		res := h.DB.Where("post_id = ?", post.PostID).Find(&[]models.PostLike{})

		res2 := h.DB.Where("post_id = ? and user_id = ?", post.PostID, tempUser.ID).Find(&models.PostLike{})

		liked := false
		if res2.RowsAffected != 0 {
			liked = true
		}

		TotalComment := h.TotalComments(post.PostID)

		obj = append(obj, Temp{
			PostID:       post.PostID,
			UserID:       post.UserID,
			User:         userList[i],
			TotalLikes:   int(res.RowsAffected),
			Liked:        liked,
			AssetUrl:     post.AssetUrl,
			AssetType:    post.AssetType,
			Text:         post.Text,
			TotalComment: int(TotalComment),
		})
	}

	// h.DB.Save(&post)

	json.NewEncoder(w).Encode(obj)
}

func (h handler) TotalComments(post_id int) int {
	var TotalComment int64
	h.DB.Model(&models.Comment{}).Where("post_id = ?", post_id).Count(&TotalComment)

	var comments []models.Comment
	h.DB.Where("post_id = ?", post_id).Find(&comments)

	for _, comment := range comments {
		var Temp int64
		h.DB.Model(&models.Reply{}).Where("comment_id = ?", comment.CommentId).Count(&Temp)

		TotalComment += (Temp)
	}

	return int(TotalComment)
}

func (h handler) SearchPost(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	str := r.URL.Query().Get("query")
	id := r.URL.Query().Get("id")

	limit := r.URL.Query().Get("limit")
	offset := r.URL.Query().Get("offset")

	if str == "" {
		json.NewEncoder(w).Encode("Error in reading payload")
		return
	}

	var tempPosts []models.Post
	var userList []models.User

	if limit == "" || offset == "" {
		h.DB.Where("lower(text) like (?)", "%"+strings.ToLower(str)+"%").Order("post_id desc").Limit(3).Find(&tempPosts)
		h.DB.Joins("JOIN posts on users.id = posts.user_id").Where("lower(text) like (?)", "%"+strings.ToLower(str)+"%").Order("post_id desc").Limit(3).Find(&userList)
	} else {
		var total int64
		h.DB.Model(&models.Post{}).Where("lower(text) like (?)", "%"+strings.ToLower(str)+"%").Order("post_id desc").Count(&total)

		offset, _ := strconv.Atoi(offset)

		newLimit := 3

		if offset > int(total) {
			newLimit = (int(total) - (offset))
		}
		fmt.Println(newLimit)

		h.DB.Where("lower(text) like (?)", "%"+strings.ToLower(str)+"%").Order("post_id desc").Limit(newLimit).Offset(offset).Find(&tempPosts)
		h.DB.Joins("JOIN posts on users.id = posts.user_id").Where("lower(text) like (?)", "%"+strings.ToLower(str)+"%").Order("post_id desc").Limit(newLimit).Offset(offset).Find(&userList)
	}

	type Temp struct {
		PostID       int  `json:"post_id"`
		UserID       uint `json:"user"`
		User         models.User
		TotalLikes   int    `json:"total_likes"`
		Liked        bool   `json:"liked"`
		AssetUrl     string `json:"asset"`
		AssetType    string `json:"asset_type"`
		Text         string `json:"text"`
		TotalComment int    `json:"total_comment"`
	}

	var obj = []Temp{}

	for i, post := range tempPosts {
		res := h.DB.Where("post_id = ?", post.PostID).Find(&[]models.PostLike{})

		res2 := h.DB.Where("post_id = ? and user_id = ?", post.PostID, id).Find(&models.PostLike{})

		liked := false
		if res2.RowsAffected != 0 {
			liked = true
		}

		TotalComment := h.TotalComments(post.PostID)

		obj = append(obj, Temp{
			PostID:       post.PostID,
			UserID:       post.UserID,
			User:         userList[i],
			TotalLikes:   int(res.RowsAffected),
			Liked:        liked,
			AssetUrl:     post.AssetUrl,
			AssetType:    post.AssetType,
			Text:         post.Text,
			TotalComment: TotalComment,
		})
	}

	json.NewEncoder(w).Encode(obj)
}

func (h handler) SearchPostTags(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	str := r.URL.Query().Get("tag")
	id := r.URL.Query().Get("id")

	limit := r.URL.Query().Get("limit")
	offset := r.URL.Query().Get("offset")

	if str == "" {
		json.NewEncoder(w).Encode("Error in reading payload")
		return
	}

	var tempTag models.Tags
	h.DB.Where("tag = ?", str).Find(&tempTag)

	var tempPosts []models.Post
	var userList []models.User

	var tempPostId []int

	for _, id := range tempTag.PostId {
		tempPostId = append(tempPostId, int(id))
	}

	if limit == "" || offset == "" {
		h.DB.Where("post_id in (?)", tempPostId).Limit(3).Order("post_id desc").Find(&tempPosts)
		h.DB.Joins("JOIN posts on users.id = posts.user_id").Where("post_id in (?)", tempPostId).Order("post_id desc").Limit(3).Find(&userList)
	} else {
		var total int64
		h.DB.Model(&models.Post{}).Where("post_id in (?)").Count(&total)

		offset, _ := strconv.Atoi(offset)

		newLimit := 3

		if offset > int(total) {
			newLimit = (int(total) - (offset))
		}
		fmt.Println(newLimit)

		h.DB.Where("post_id in (?)", tempPostId).Order("post_id desc").Limit(newLimit).Offset(offset).Find(&tempPosts)
		h.DB.Joins("JOIN posts on users.id = posts.user_id").Where("post_id in (?)", tempPostId).Order("post_id desc").Limit(newLimit).Offset(offset).Find(&userList)
	}

	type Temp struct {
		PostID       int  `json:"post_id"`
		UserID       uint `json:"user"`
		User         models.User
		TotalLikes   int    `json:"total_likes"`
		Liked        bool   `json:"liked"`
		AssetUrl     string `json:"asset"`
		AssetType    string `json:"asset_type"`
		Text         string `json:"text"`
		TotalComment int    `json:"total_comment"`
	}

	var obj = []Temp{}

	for i, post := range tempPosts {
		res := h.DB.Where("post_id = ?", post.PostID).Find(&[]models.PostLike{})

		res2 := h.DB.Where("post_id = ? and user_id = ?", post.PostID, id).Find(&models.PostLike{})

		liked := false
		if res2.RowsAffected != 0 {
			liked = true
		}

		TotalComment := h.TotalComments(post.PostID)

		obj = append(obj, Temp{
			PostID:       post.PostID,
			UserID:       post.UserID,
			User:         userList[i],
			TotalLikes:   int(res.RowsAffected),
			Liked:        liked,
			AssetUrl:     post.AssetUrl,
			AssetType:    post.AssetType,
			Text:         post.Text,
			TotalComment: TotalComment,
		})
	}

	json.NewEncoder(w).Encode(obj)
}

func (h handler) LikePost(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	temp := struct {
		Email  string `json:"email"`
		PostID int    `json:"post_id"`
	}{}

	err := json.NewDecoder(r.Body).Decode(&temp)

	if err != nil {
		json.NewEncoder(w).Encode("Error in reading payload.")
		return
	}

	tempUser, _ := h.UserFromEmail(temp.Email)

	postLike := models.PostLike{
		UserID: tempUser.ID,
		PostID: temp.PostID,
	}

	h.DB.Create(&postLike)
	json.NewEncoder(w).Encode(postLike)
}

func (h handler) UnlikePost(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	temp := struct {
		Email  string `json:"email"`
		PostID int    `json:"post_id"`
	}{}

	err := json.NewDecoder(r.Body).Decode(&temp)

	if err != nil {
		json.NewEncoder(w).Encode("Error in reading payload.")
		return
	}

	tempUser, _ := h.UserFromEmail(temp.Email)

	res := h.DB.Where("post_id = ? and user_id = ? ", temp.PostID, tempUser.ID).Delete(&models.PostLike{})
	json.NewEncoder(w).Encode(res.Error)
}

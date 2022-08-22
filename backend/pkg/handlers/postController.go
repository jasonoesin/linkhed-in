package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/jasonoesin/linkhed-in/pkg/models"
)

func (h handler) AddPost(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	temp := struct {
		Text     string `json:"text"`
		Email    string `json:"email"`
		AssetUrl string `json:"asset"`
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
	h.DB.Where("user_id in (?)", tempArr).Order("post_id desc").Find(&postList)

	type Temp struct {
		PostID     int    `json:"post_id"`
		UserID     uint   `json:"user"`
		TotalLikes int    `json:"total_likes"`
		Liked      bool   `json:"liked"`
		AssetUrl   string `json:"asset"`
		AssetType  string `json:"asset_type"`
		Text       string `json:"text"`
	}

	var obj = []Temp{}

	for _, post := range postList {
		res := h.DB.Where("post_id = ?", post.PostID).Find(&[]models.PostLike{})

		res2 := h.DB.Where("post_id = ? and user_id = ?", post.PostID, tempUser.ID).Find(&models.PostLike{})

		liked := false
		if res2.RowsAffected != 0 {
			liked = true
		}

		obj = append(obj, Temp{
			PostID:     post.PostID,
			UserID:     post.UserID,
			TotalLikes: int(res.RowsAffected),
			Liked:      liked,
			AssetUrl:   post.AssetUrl,
			AssetType:  post.AssetType,
			Text:       post.Text,
		})
	}

	// h.DB.Save(&post)
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

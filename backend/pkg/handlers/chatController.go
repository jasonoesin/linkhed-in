package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/jasonoesin/linkhed-in/pkg/models"
)

func (h handler) StartConversation(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	type Temp struct {
		Email       string `json:"email"`
		Destination uint   `json:"destination"`
	}

	var req Temp

	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		json.NewEncoder(w).Encode("Error in reading payload.")
		return
	}

	tempUser, _ := h.UserFromEmail(req.Email)

	conv := models.Conversation{
		SourceUser:  tempUser,
		Destination: req.Destination,
	}

	h.DB.Create(&conv)
	json.NewEncoder(w).Encode(conv)
}

func (h handler) GetConversation(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	str := r.URL.Query().Get("email")
	if str == "" {
		json.NewEncoder(w).Encode("Error in reading payload")
		return
	}

	tempUser, _ := h.UserFromEmail(str)

	var convList []models.Conversation
	h.DB.Where("source = ?", tempUser.ID).Find(&convList)

	//---

	var convDest []models.Conversation
	h.DB.Where("destination = ?", tempUser.ID).Find(&convDest)

	var sourceUser []models.User
	h.DB.Joins("JOIN conversations on users.id = conversations.source").Where("conversations.destination = ?", tempUser.ID).Find(&sourceUser)

	//---

	var destUser []models.User
	h.DB.Joins("JOIN conversations on users.id = conversations.destination").Where("conversations.source = ?", tempUser.ID).Find(&destUser)

	temp := []struct {
		Current uint
		models.Conversation
		models.User
	}{}

	for i := range convList {
		temp = append(temp, struct {
			Current uint
			models.Conversation
			models.User
		}{
			tempUser.ID, convList[i], destUser[i],
		})
	}

	for i := range convDest {
		temp = append(temp, struct {
			Current uint
			models.Conversation
			models.User
		}{
			tempUser.ID, convDest[i], sourceUser[i],
		})
	}

	json.NewEncoder(w).Encode(temp)
}

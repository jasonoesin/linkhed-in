package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/jasonoesin/linkhed-in/pkg/models"
)

func (h handler) GetProfile(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	str := r.URL.Query().Get("nick")
	if str == "" {
		json.NewEncoder(w).Encode("Error in reading payload")
		return
	}

	tempUser, _ := h.UserFromNick(str)

	if tempUser.ID == 0 {
		json.NewEncoder(w).Encode("ERROR")
		return

	}

	json.NewEncoder(w).Encode(tempUser)
}

func (h handler) AddView(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	req := struct {
		Target  uint `json:"target_id"`
		Current uint `json:"current_id"`
	}{}

	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		json.NewEncoder(w).Encode("Error in reading payload")
		return
	}

	var temp models.View
	res := h.DB.Where("target = ? and current = ?", req.Target, req.Current).Find(&temp)

	if res.RowsAffected == 0 {
		temp = models.View{
			Target:  req.Target,
			Current: req.Current,
		}
		h.DB.Create(&temp)
	}

	json.NewEncoder(w).Encode(temp)
}

func (h handler) GetView(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	str := r.URL.Query().Get("target_id")
	if str == "" {
		json.NewEncoder(w).Encode("Error in reading payload")
		return
	}

	var temp models.View
	res := h.DB.Where("target = ?", str).Find(&temp)

	json.NewEncoder(w).Encode(res.RowsAffected)
}

package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/jasonoesin/linkhed-in/pkg/models"
)

func (h handler) AddConnectRequest(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var req models.ConnectRequest

	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		json.NewEncoder(w).Encode("Error in reading payload.")
		return
	}

	h.DB.Create(&req)
	json.NewEncoder(w).Encode(req)
}

func (h handler) GetAllConnectRequest(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var user models.User
	err := json.NewDecoder(r.Body).Decode(&user)

	if err != nil {
		json.NewEncoder(w).Encode("Error in reading payload.")
		return
	}

	fmt.Println(user.ID)

	var conReq []models.ConnectRequest
	res := h.DB.Where("\"from\" = ?", user.ID).Find(&conReq)

	if res.Error != nil {
		json.NewEncoder(w).Encode("Invalid user.")
		return
	}

	// fmt.Println(conReq)
	json.NewEncoder(w).Encode(conReq)
}

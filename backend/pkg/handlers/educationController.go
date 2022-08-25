package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/jasonoesin/linkhed-in/pkg/models"
)

func (h handler) AddEducation(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	temp := struct {
		Email     string `json:"email"`
		Education models.Education
	}{}

	err := json.NewDecoder(r.Body).Decode(&temp)
	if err != nil || temp.Email == "" {
		json.NewEncoder(w).Encode("Error in reading payload")
		return
	}

	tempUser, _ := h.UserFromEmail(temp.Email)

	temp.Education.User = tempUser

	h.DB.Create(&temp.Education)
	json.NewEncoder(w).Encode(temp.Education)
}

func (h handler) GetEducation(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	str := r.URL.Query().Get("id")
	if str == "" {
		json.NewEncoder(w).Encode("Error in reading payload")
		return
	}

	var education []models.Education
	h.DB.Where("user_id = ?", str).Order("education_id asc").Find(&education)

	json.NewEncoder(w).Encode(education)
}

func (h handler) DeleteEducation(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var temp models.Education

	err := json.NewDecoder(r.Body).Decode(&temp)
	if err != nil {
		json.NewEncoder(w).Encode("Error in reading payload")
		return
	}

	h.DB.Delete(&temp)
	json.NewEncoder(w).Encode(temp)
}

func (h handler) UpdateEducation(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var temp models.Education

	err := json.NewDecoder(r.Body).Decode(&temp)
	if err != nil {
		json.NewEncoder(w).Encode("Error in reading payload")
		return
	}

	h.DB.Save(&temp)
	json.NewEncoder(w).Encode(temp)
}

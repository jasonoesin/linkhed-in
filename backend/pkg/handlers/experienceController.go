package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/jasonoesin/linkhed-in/pkg/models"
)

func (h handler) AddExperience(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	temp := struct {
		Email      string `json:"email"`
		Experience models.Experience
	}{}

	err := json.NewDecoder(r.Body).Decode(&temp)
	if err != nil || temp.Email == "" {
		json.NewEncoder(w).Encode("Error in reading payload")
		return
	}

	tempUser, _ := h.UserFromEmail(temp.Email)

	temp.Experience.User = tempUser

	h.DB.Create(&temp.Experience)
	json.NewEncoder(w).Encode(temp.Experience)
}

func (h handler) GetExperience(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	str := r.URL.Query().Get("id")
	if str == "" {
		json.NewEncoder(w).Encode("Error in reading payload")
		return
	}

	var experience []models.Experience
	h.DB.Where("user_id = ?", str).Order("experience_id asc").Find(&experience)

	json.NewEncoder(w).Encode(experience)
}

func (h handler) DeleteExperience(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var temp models.Experience

	err := json.NewDecoder(r.Body).Decode(&temp)
	if err != nil {
		json.NewEncoder(w).Encode("Error in reading payload")
		return
	}

	var newTemp models.Experience

	h.DB.Where("experience_id = ?", temp.ExperienceId).Find(&newTemp)

	h.DB.Delete(&newTemp)
	json.NewEncoder(w).Encode(newTemp)
}

func (h handler) UpdateExperience(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var temp models.Experience

	err := json.NewDecoder(r.Body).Decode(&temp)
	if err != nil {
		json.NewEncoder(w).Encode("Error in reading payload")
		return
	}

	h.DB.Save(&temp)
	json.NewEncoder(w).Encode(temp)
}

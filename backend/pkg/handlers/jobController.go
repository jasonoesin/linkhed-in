package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/jasonoesin/linkhed-in/pkg/models"
)

func (h handler) AddJob(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	temp := struct {
		Email string `json:"email"`
		Job   models.Job
	}{}

	err := json.NewDecoder(r.Body).Decode(&temp)
	if err != nil || temp.Email == "" {
		json.NewEncoder(w).Encode("Error in reading payload")
		return
	}

	tempUser, _ := h.UserFromEmail(temp.Email)

	temp.Job.User = tempUser

	h.DB.Create(temp.Job)
	json.NewEncoder(w).Encode(temp.Job)
}

func (h handler) GetJob(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	str := r.URL.Query().Get("id")
	if str == "" {
		json.NewEncoder(w).Encode("Error in reading payload")
		return
	}

	var job []models.Job
	h.DB.Where("user_id = ?", str).Find(&job)

	json.NewEncoder(w).Encode(job)
}

func (h handler) DeleteJob(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var temp models.Job

	err := json.NewDecoder(r.Body).Decode(&temp)
	if err != nil {
		json.NewEncoder(w).Encode("Error in reading payload")
		return
	}

	h.DB.Delete(&temp)
	json.NewEncoder(w).Encode(temp)
}

func (h handler) UpdateJob(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var temp models.Job

	err := json.NewDecoder(r.Body).Decode(&temp)
	if err != nil {
		json.NewEncoder(w).Encode("Error in reading payload")
		return
	}

	h.DB.Save(&temp)
	json.NewEncoder(w).Encode(temp)
}

package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/jasonoesin/linkhed-in/pkg/models"
)

func (h handler) AddJob(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var temp models.Job

	err := json.NewDecoder(r.Body).Decode(&temp)
	if err != nil {
		json.NewEncoder(w).Encode("Error in reading payload.")
		return
	}

	h.DB.Create(&temp)
	json.NewEncoder(w).Encode(temp)
}

func (h handler) GetJob(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var jobs []models.Job

	h.DB.Find(&jobs)
	json.NewEncoder(w).Encode(jobs)
}

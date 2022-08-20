package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/jasonoesin/linkhed-in/pkg/models"
)

func (h handler) AddPost(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var post models.Post

	err := json.NewDecoder(r.Body).Decode(&post)
	if err != nil {
		json.NewEncoder(w).Encode("Error in reading payload.")
		return
	}

	h.DB.Create(&post)
	json.NewEncoder(w).Encode(post)
}

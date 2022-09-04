package handlers

import (
	"encoding/json"
	"net/http"
)

func (h handler) GetAllTags(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var string []string
	h.DB.Select("tag").Table("tags").Scan(&string)

	json.NewEncoder(w).Encode(string)
}

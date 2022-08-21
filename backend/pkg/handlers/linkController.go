package handlers

import (
	"encoding/json"
	"math/rand"
	"net/http"
)

func GenLink() string {
	var chars = []rune("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0987654321")
	str := make([]rune, 6)
	for i := range str {
		str[i] = chars[rand.Intn(len(chars))]
	}
	return string(str)
}

func (h handler) CheckLink(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// Using Query Params
	str := r.URL.Query().Get("link")
	if str == "" {
		json.NewEncoder(w).Encode("Error in reading payload")
		return
	}

	var email string
	h.DB.Table("links").Select("users.email").Joins("inner join users on links.user_id = users.id").Where("link like ?", str).Scan(&email)
	if email == "" {
		json.NewEncoder(w).Encode("Error in reading payload")
		return
	}

	json.NewEncoder(w).Encode(email)
}

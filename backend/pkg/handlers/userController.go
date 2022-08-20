package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"strings"

	"github.com/jasonoesin/linkhed-in/pkg/models"
)

func (h handler) SignUp(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var user models.User
	err := json.NewDecoder(r.Body).Decode(&user)
	if err != nil || user.Email == "" || user.Password == "" {
		json.NewEncoder(w).Encode("Error Reading Payload")
		return
	}

	var tempUser models.User
	h.DB.Where("email = ?", user.Email).First(&tempUser)

	if tempUser.Email != "" {
		json.NewEncoder(w).Encode("Email already in use")
		return
	}

	user.Password, err = GeneratehashPassword(user.Password)
	if err != nil {
		log.Fatalln("Error in password hashing.")
		return
	}

	h.DB.Create(&user)
	json.NewEncoder(w).Encode(user)

}

type Token struct {
	Email       string `json:"email"`
	TokenString string `json:"token"`
}

func (h handler) Login(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var user models.User
	err := json.NewDecoder(r.Body).Decode(&user)
	if err != nil || user.Email == "" || user.Password == "" {
		json.NewEncoder(w).Encode("Error in reading payload")
		return
	}

	var tempUser models.User
	h.DB.Where("email = ?", user.Email).First(&tempUser)

	if tempUser.Email == "" {
		json.NewEncoder(w).Encode("Email is not correct")
		return
	}

	check := CheckPasswordHash(user.Password, tempUser.Password)

	if !check {
		json.NewEncoder(w).Encode("Username or Password is incorrect")
		return
	}

	validToken, err := GenerateJWT(tempUser.Email)
	if err != nil {
		json.NewEncoder(w).Encode("Failed to generate token")
		return
	}

	var token Token
	token.Email = tempUser.Email
	token.TokenString = validToken
	json.NewEncoder(w).Encode(token)

}

func (h handler) SearchUser(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// Using Query Params
	str := r.URL.Query().Get("value")
	if str == "" {
		json.NewEncoder(w).Encode("Error in reading payload")
		return
	}

	var userList []models.User
	h.DB.Where("lower(email) like ?", "%"+strings.ToLower(str)+"%").Find(&userList)
	json.NewEncoder(w).Encode(userList)

}

func (h handler) ValidateActivated(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// Using Query Params
	str := r.URL.Query().Get("email")
	if str == "" {
		json.NewEncoder(w).Encode("Error in reading payload")
		return
	}

	var tempUser models.User
	h.DB.Where("email = ?", str).First(&tempUser)

	if tempUser.Email == "" {
		json.NewEncoder(w).Encode("Email is not correct")
		return
	}

	json.NewEncoder(w).Encode(tempUser.Activated)

}

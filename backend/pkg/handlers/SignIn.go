package handlers

import (
	"encoding/json"
	"net/http"

	"example.com/linkhedin/pkg/db"
	"example.com/linkhedin/pkg/models"
)

func SignIn(w http.ResponseWriter, r *http.Request) {
	connection := db.GetDatabase()
	defer db.CloseDatabase(connection)

	w.Header().Set("Content-Type", "application/json")

	var authDetails models.Authentication

	err := json.NewDecoder(r.Body).Decode(&authDetails)
	if err != nil {
		var err models.Error
		err = models.SetError(err, "Error in reading payload.")
		json.NewEncoder(w).Encode(err)
		return
	}

	var authUser models.User
	connection.Where("email = 	?", authDetails.Email).First(&authUser)

	if authUser.Email == "" {
		var err models.Error
		err = models.SetError(err, "Username or Password is incorrect")
		json.NewEncoder(w).Encode(err)
		return
	}

	check := CheckPasswordHash(authDetails.Password, authUser.Password)

	if !check {
		var err models.Error
		err = models.SetError(err, "Username or Password is incorrect")
		json.NewEncoder(w).Encode(err)
		return
	}

	validToken, err := GenerateJWT(authUser.Email)
	if err != nil {
		var err models.Error
		err = models.SetError(err, "Failed to generate token")
		json.NewEncoder(w).Encode(err)
		return
	}

	var token models.Token
	token.Email = authUser.Email
	token.TokenString = validToken
	json.NewEncoder(w).Encode(token)
}

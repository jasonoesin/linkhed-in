package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"example.com/linkhedin/pkg/db"
	"example.com/linkhedin/pkg/models"
)

func genCode() string {
	return fmt.Sprint(time.Now().Nanosecond())[:6]
}

type ActivateType struct {
	Email string `json:"email"`
	Code  string `json:"code"`
}

func ActivateWithCode(w http.ResponseWriter, r *http.Request) {
	connection := db.GetDatabase()
	defer db.CloseDatabase(connection)
	w.Header().Set("Content-Type", "application/json")

	var at ActivateType

	err := json.NewDecoder(r.Body).Decode(&at)
	if err != nil {
		var err models.Error
		err = models.SetError(err, "Error in reading payload.")
		json.NewEncoder(w).Encode(err)
		return
	}

	var authUser models.User
	connection.Where("email = 	?", at.Email).First(&authUser)

	if authUser.Email == "" {
		var err models.Error
		err = models.SetError(err, "Email is incorrect")
		json.NewEncoder(w).Encode(err)
		return
	}

	if at.Code != authUser.ActivationId {
		var err models.Error
		err = models.SetError(err, "Code is incorrect")
		json.NewEncoder(w).Encode(err)
		return
	}
	connection.Model(&models.User{}).Where("email = ?", at.Email).Update("activated", true)
	connection.Model(&models.User{}).Where("email = ?", at.Email).Update("activation_id", "-")
	json.NewEncoder(w).Encode("Account activated")
}

func Activate(w http.ResponseWriter, r *http.Request) {
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
		err = models.SetError(err, "Email is incorrect")
		json.NewEncoder(w).Encode(err)
		return
	}

	connection.Model(&models.User{}).Where("email = ? and activated = false", authDetails.Email).Update("activation_id", genCode())

}

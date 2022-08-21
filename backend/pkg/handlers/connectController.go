package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/jasonoesin/linkhed-in/pkg/models"
	"gorm.io/gorm"
)

func (h handler) UserFromEmail(email string) (models.User, *gorm.DB) {
	var tempUser models.User
	res := h.DB.Where("email = ?", email).Find(&tempUser)

	return tempUser, res
}

func (h handler) AddConnectRequest(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	type Temp struct {
		Message string `json:"message"`
		From    string `json:"from"`
		Target  uint   `json:"target"`
	}

	var req Temp

	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		json.NewEncoder(w).Encode("Error in reading payload.")
		return
	}

	fromUser, res := h.UserFromEmail(req.From)

	if res.Error != nil {
		json.NewEncoder(w).Encode("Invalid user.")
		return
	}

	conReq := models.ConnectRequest{
		Message: req.Message,
		From:    fromUser.ID,
		Target:  req.Target,
	}

	h.DB.Create(&conReq)
	json.NewEncoder(w).Encode(conReq)
}

func (h handler) GetAllConnectRequest(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// var user models.User
	// err := json.NewDecoder(r.Body).Decode(&user)

	str := r.URL.Query().Get("email")
	if str == "" {
		json.NewEncoder(w).Encode("Error in reading payload")
		return
	}

	tempUser, _ := h.UserFromEmail(str)

	var conReq []models.ConnectRequest
	res := h.DB.Where("\"target\" = ?", tempUser.ID).Find(&conReq)

	// h.DB.Table("links").Select("users.email").Joins("inner join users on links.user_id = users.id").Where("link like ?", str).Scan(&email)

	// ---
	var users []models.User
	h.DB.Joins("JOIN connect_requests cr on cr.from = users.id").
		Where("cr.target = ?", tempUser.ID).
		Find(&users)

	// fmt.Println(users)

	if res.Error != nil {
		json.NewEncoder(w).Encode("Invalid user.")
		return
	}

	// fmt.Println(conReq)
	json.NewEncoder(w).Encode(users)
}

func (h handler) GetAllConnected(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	str := r.URL.Query().Get("email")
	if str == "" {
		json.NewEncoder(w).Encode("Error in reading payload")
		return
	}

	tempUser, _ := h.UserFromEmail(str)
	// var tempUser models.User
	// h.DB.Where("email = ?", str).First(&tempUser)

	var conList []models.Connection
	h.DB.Where("second = ? or first = ?", tempUser.ID, tempUser.ID).Find(&conList)

	var tempArr []int

	for _, e := range conList {
		if tempUser.ID == e.First {
			tempArr = append(tempArr, int(e.Second))
		} else {
			tempArr = append(tempArr, int(e.First))
		}
	}

	// fmt.Println(tempArr)

	json.NewEncoder(w).Encode(tempArr)
}

func (h handler) DeclineConnection(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	type Temp struct {
		Current string `json:"current"`
		From    uint   `json:"from"`
	}

	var req Temp

	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		json.NewEncoder(w).Encode("Error in reading payload.")
		return
	}

	tempUser, _ := h.UserFromEmail(req.Current)

	res := h.DB.Where("\"from\" = ? and target = ?", req.From, tempUser.ID).Delete(&models.ConnectRequest{})

	if res.Error != nil {
		fmt.Println(res.Error)
	}
	json.NewEncoder(w).Encode("OK")
}

func (h handler) AcceptConnection(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	type Temp struct {
		Current string `json:"current"`
		From    uint   `json:"from"`
	}

	var req Temp

	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		json.NewEncoder(w).Encode("Error in reading payload.")
		return
	}

	tempUser, _ := h.UserFromEmail(req.Current)

	h.DB.Create(&models.Connection{
		First:  req.From,
		Second: tempUser.ID,
	})

	res := h.DB.Where("\"from\" = ? and target = ?", req.From, tempUser.ID).Delete(&models.ConnectRequest{})

	if res.Error != nil {
		fmt.Println(res.Error)
	}
	json.NewEncoder(w).Encode("OK")
}

// func (h handler) AcceptConnection(w http.ResponseWriter, r *http.Request) {
// 	w.Header().Set("Content-Type", "application/json")

// 	var con models.Connection
// 	err := json.NewDecoder(r.Body).Decode(&con)
// 	if err != nil {
// 		json.NewEncoder(w).Encode("Error in reading payload.")
// 		return
// 	}

// 	h.DB.Create(&con)
// 	json.NewEncoder(w).Encode(con)
// }

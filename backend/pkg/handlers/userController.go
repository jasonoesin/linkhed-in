package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"

	gomail "github.com/go-gomail/gomail"
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
	link := models.Link{
		Link:   GenLink(),
		UserID: user.ID,
	}
	h.DB.Create(&link)
	sendEmail(user.Email, "http://127.0.0.1:5173/link/"+link.Link, "Enter your credentials in this link to activate your account. ")
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
	h.DB.Where("lower(name) like ? and activated = true", "%"+strings.ToLower(str)+"%").Find(&userList)
	json.NewEncoder(w).Encode(userList)
}

func (h handler) UsersRecommendation(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	str := r.URL.Query().Get("email")
	if str == "" {
		json.NewEncoder(w).Encode("")
		return
	}

	var tempUser models.User
	h.DB.Where("email = ?", str).First(&tempUser)

	if tempUser.Email == "" {
		json.NewEncoder(w).Encode("")
		return
	}

	var newTemp []uint

	h.DB.Raw("select sub4.id from(select second as id from connections,(select second as id from connections where first = ? union select first from connections where second = ?) as sub where first in (sub.id) and second not in (sub.id) union select first from connections, (select second as id from connections where first = ? union select first from connections where second = ?) as sub where second in (sub.id) and first not in (sub.id)) sub4 where sub4.id != ?", tempUser.ID, tempUser.ID, tempUser.ID, tempUser.ID, tempUser.ID).Scan(&newTemp)

	var users []models.User
	h.DB.Where("id in (?)", newTemp).Find(&users)

	json.NewEncoder(w).Encode(users)
}

type TempAct struct {
	Link       string `json:"link"`
	Name       string `json:"name"`
	Nick       string `json:"nick"`
	Occupation string `json:"occupation"`
}

func (h handler) ActivateAccount(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var temp TempAct
	err := json.NewDecoder(r.Body).Decode(&temp)
	if err != nil || temp.Link == "" {
		json.NewEncoder(w).Encode("Error in reading payload")
		return
	}

	var link models.Link
	res := h.DB.Where("link = ?", temp.Link).Find(&link)

	if res.Error != nil {
		json.NewEncoder(w).Encode("Invalid Link.")
		return
	}

	if err := h.DB.Exec("UPDATE users SET activated=true, name = ?, nick = ? , occupation = ? from links WHERE links.user_id = users.id and links.link like ?", temp.Name, temp.Nick, temp.Occupation, temp.Link); err != nil {
		fmt.Println(err.Error)
	}
	json.NewEncoder(w).Encode("OK")
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

func (h handler) GetCurrentUser(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

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

	json.NewEncoder(w).Encode(tempUser)
}

func (h handler) ForgotPassword(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	type Temp struct {
		Email string `json:"email"`
	}

	var temp Temp

	err := json.NewDecoder(r.Body).Decode(&temp)
	if err != nil || temp.Email == "" {
		json.NewEncoder(w).Encode("Error in reading payload")
		return
	}

	tempUser, _ := h.UserFromEmail(temp.Email)

	var currLink models.Forgot
	res := h.DB.Where("user_id = ?", tempUser.ID).First(&currLink)

	if res.Error != nil {
		forgot := models.Forgot{
			Link:   GenLink(),
			UserID: tempUser.ID,
		}
		h.DB.Create(&forgot)
		json.NewEncoder(w).Encode(forgot)
		sendEmail(tempUser.Email, "http://127.0.0.1:5173/forgot-password/"+forgot.Link, "Reset your LinkhedIn account password in this link. ")
		return
	}

	sendEmail(tempUser.Email, "http://127.0.0.1:5173/forgot-password/"+currLink.Link, "Reset your LinkhedIn account password in this link. ")

	json.NewEncoder(w).Encode(currLink)

}

func sendEmail(target string, link string, msg string) {
	from := "linkhedinjs@gmail.com"
	password := "jqdhgzwnqieipxgo"

	m := gomail.NewMessage()
	m.SetHeader("From", from)
	m.SetHeader("To", target)
	m.SetHeader("Subject", "Linkhed-In Activation Link")
	m.SetBody("text/plain", msg+link)
	d := gomail.NewDialer("smtp.gmail.com", 587, from, password)

	if err := d.DialAndSend(m); err != nil {
		fmt.Println(err)
		panic(err)
	}

	fmt.Println("Email Sent Successfully!")
}

func (h handler) UpdateUser(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var temp models.User

	err := json.NewDecoder(r.Body).Decode(&temp)
	if err != nil {
		json.NewEncoder(w).Encode("Error in reading payload")
		return
	}
	var find models.User
	h.DB.Where("id = ?", temp.ID).Find(&find)

	if temp.ProfileUrl != "" {
		find.ProfileUrl = temp.ProfileUrl
	}
	if temp.BackgroundUrl != "" {
		find.BackgroundUrl = temp.BackgroundUrl
	}

	h.DB.Save(&find)
	json.NewEncoder(w).Encode(find)
}

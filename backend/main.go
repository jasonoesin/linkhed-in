package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"example.com/linkhedin/pkg/db"
	"example.com/linkhedin/pkg/handlers"
	"example.com/linkhedin/pkg/models"
	h "github.com/gorilla/handlers"
	"github.com/gorilla/mux"
	_ "github.com/jinzhu/gorm/dialects/postgres"
)

//--------GLOBAL VARIABLES---------------

var (
	router *mux.Router
)

//------------STRUCTS---------------------

//-------------DATABASE FUNCTIONS---------------------

//--------------HELPER FUNCTIONS---------------------

//---------------------MIDDLEWARE FUNCTION-----------------------

//check whether user is authorized or not

//----------------------ROUTES-------------------------------
func CreateRouter() {
	router = mux.NewRouter()
}

func InitializeRoute() {
	router.HandleFunc("/signup", SignUp).Methods("POST")
	router.HandleFunc("/signin", handlers.SignIn).Methods("POST")
	router.HandleFunc("/activate", handlers.Activate).Methods("POST")
	router.HandleFunc("/activateCode", handlers.ActivateWithCode).Methods("POST")
	router.HandleFunc("/admin", handlers.IsAuthorized(AdminIndex)).Methods("GET")
	router.HandleFunc("/user", handlers.IsAuthorized(UserIndex)).Methods("GET")
	router.HandleFunc("/", Index).Methods("GET")
	router.Methods("OPTIONS").HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "")
		w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
		w.Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, Access-Control-Request-Headers, Access-Control-Request-Method, Connection, Host, Origin, User-Agent, Referer, Cache-Control, X-header")
	})
}

func ServerStart() {
	fmt.Println("Server started at http://localhost:8080")
	err := http.ListenAndServe(":8080", h.CORS(h.AllowedHeaders([]string{"X-Requested-With", "Access-Control-Allow-Origin", "Content-Type", "Authorization"}), h.AllowedMethods([]string{"GET", "POST", "PUT", "DELETE", "HEAD", "OPTIONS"}), h.AllowedOrigins([]string{"*"}))(router))
	if err != nil {
		log.Fatal(err)
	}
}

//----------------------ROUTES HANDLER-----------------------
func SignUp(w http.ResponseWriter, r *http.Request) {
	connection := db.GetDatabase()
	defer db.CloseDatabase(connection)

	var user models.User
	err := json.NewDecoder(r.Body).Decode(&user)

	// if err != nil || user.Name == "" || user.Email == "" || user.Password == "" || user.Role == ""

	if err != nil || user.Email == "" || user.Password == "" {
		var err models.Error
		err = models.SetError(err, "Error in reading payload.")
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(err)
		return
	}

	var dbuser models.User
	connection.Where("email = ?", user.Email).First(&dbuser)

	//check email is alredy registered or not
	if dbuser.Email != "" {
		var err models.Error
		err = models.SetError(err, "Email already in use")
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(err)
		return
	}

	user.Password, err = handlers.GeneratehashPassword(user.Password)
	if err != nil {
		log.Fatalln("Error in password hashing.")
	}

	//insert user details in database
	connection.Create(&user)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(user)
}

func Index(w http.ResponseWriter, r *http.Request) {
	w.Write([]byte("HOME PUBLIC INDEX PAGE"))
}

func AdminIndex(w http.ResponseWriter, r *http.Request) {
	if r.Header.Get("Role") != "admin" {
		w.Write([]byte("Not authorized."))
		return
	}
	w.Write([]byte("Welcome, Admin."))
}

func UserIndex(w http.ResponseWriter, r *http.Request) {
	if r.Header.Get("Role") != "user" {
		w.Write([]byte("Not Authorized."))
		return
	}
	w.Write([]byte("Welcome, User."))
}

func main() {
	db.InitialMigration()
	CreateRouter()
	InitializeRoute()
	ServerStart()
}

package main

import (
	"log"
	"math/rand"
	"net/http"
	"time"

	GORILLA_HANDLERS "github.com/gorilla/handlers"
	"github.com/gorilla/mux"
	"github.com/jasonoesin/linkhed-in/pkg/db"
	"github.com/jasonoesin/linkhed-in/pkg/handlers"
)

func main() {
	rand.Seed(time.Now().UnixNano())

	DB := db.Init()
	h := handlers.New(DB)
	router := mux.NewRouter()

	// Register Login
	router.HandleFunc("/register", h.SignUp).Methods(http.MethodPost)
	router.HandleFunc("/login", h.Login).Methods(http.MethodPost)

	// Posts
	router.HandleFunc("/post", h.AddPost).Methods(http.MethodPost)

	// Connect-Request
	router.HandleFunc("/request-connect", h.AddConnectRequest).Methods(http.MethodPost)
	router.HandleFunc("/request-connect", h.GetAllConnectRequest).Methods(http.MethodGet)

	// Search
	router.HandleFunc("/search-user", h.SearchUser).Methods(http.MethodGet)

	// Validator
	router.HandleFunc("/validate", h.ValidateActivated).Methods(http.MethodGet)

	// Links
	router.HandleFunc("/link", h.CheckLink).Methods(http.MethodGet)
	router.HandleFunc("/activate", h.ActivateAccount).Methods(http.MethodPost)

	// Connection
	router.HandleFunc("/connection", h.GetAllConnected).Methods(http.MethodGet)
	router.HandleFunc("/accept-connection", h.AcceptConnection).Methods(http.MethodPost)
	router.HandleFunc("/decline-connection", h.DeclineConnection).Methods(http.MethodPost)

	// Forgot-Password
	router.HandleFunc("/forgot-password", h.ForgotPassword).Methods(http.MethodPost)

	log.Println("API is running!")
	http.ListenAndServe(":8080", GORILLA_HANDLERS.CORS(GORILLA_HANDLERS.AllowedHeaders([]string{"X-Requested-With", "Access-Control-Allow-Origin", "Content-Type", "Authorization"}), GORILLA_HANDLERS.AllowedMethods([]string{"GET", "POST", "PUT", "DELETE", "HEAD", "OPTIONS"}), GORILLA_HANDLERS.AllowedOrigins([]string{"*"}))(router))
}

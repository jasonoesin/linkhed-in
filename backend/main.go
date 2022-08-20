package main

import (
	"log"
	"net/http"

	GORILLA_HANDLERS "github.com/gorilla/handlers"
	"github.com/gorilla/mux"
	"github.com/jasonoesin/linkhed-in/pkg/db"
	"github.com/jasonoesin/linkhed-in/pkg/handlers"
)

func main() {
	DB := db.Init()
	h := handlers.New(DB)
	router := mux.NewRouter()

	router.HandleFunc("/register", h.SignUp).Methods(http.MethodPost)
	router.HandleFunc("/login", h.Login).Methods(http.MethodPost)
	router.HandleFunc("/post", h.AddPost).Methods(http.MethodPost)
	router.HandleFunc("/request-connect", h.AddConnectRequest).Methods(http.MethodPost)
	router.HandleFunc("/request-connect", h.GetAllConnectRequest).Methods(http.MethodGet)
	router.HandleFunc("/search-user", h.SearchUser).Methods(http.MethodGet)
	router.HandleFunc("/validate", h.ValidateActivated).Methods(http.MethodGet)

	log.Println("API is running!")
	http.ListenAndServe(":8080", GORILLA_HANDLERS.CORS(GORILLA_HANDLERS.AllowedHeaders([]string{"X-Requested-With", "Access-Control-Allow-Origin", "Content-Type", "Authorization"}), GORILLA_HANDLERS.AllowedMethods([]string{"GET", "POST", "PUT", "DELETE", "HEAD", "OPTIONS"}), GORILLA_HANDLERS.AllowedOrigins([]string{"*"}))(router))
}

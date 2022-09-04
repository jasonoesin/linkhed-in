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

	// User
	router.HandleFunc("/user", h.UpdateUser).Methods(http.MethodPatch)

	// Posts
	router.HandleFunc("/post", h.AddPost).Methods(http.MethodPost)
	router.HandleFunc("/post", h.UpdatePost).Methods(http.MethodPatch)
	router.HandleFunc("/post", h.GetAllPost).Methods(http.MethodGet)
	router.HandleFunc("/post/like", h.LikePost).Methods(http.MethodPost)
	router.HandleFunc("/post/unlike", h.UnlikePost).Methods(http.MethodPost)

	router.HandleFunc("/post/search", h.SearchPost).Methods(http.MethodGet)
	router.HandleFunc("/post/search/tag", h.SearchPostTags).Methods(http.MethodGet)

	// Connect-Request
	router.HandleFunc("/request-connect", h.AddConnectRequest).Methods(http.MethodPost)
	router.HandleFunc("/request-connect", h.GetAllConnectRequest).Methods(http.MethodGet)

	// Search
	router.HandleFunc("/search-user", h.SearchUser).Methods(http.MethodGet)
	router.HandleFunc("/user", h.GetCurrentUser).Methods(http.MethodGet)

	router.HandleFunc("/user/recommend", h.UsersRecommendation).Methods(http.MethodGet)

	// Validator
	router.HandleFunc("/validate", h.ValidateActivated).Methods(http.MethodGet)

	// Links
	router.HandleFunc("/link", h.CheckLink).Methods(http.MethodGet)
	router.HandleFunc("/activate", h.ActivateAccount).Methods(http.MethodPost)

	// Connection
	router.HandleFunc("/connection", h.GetAllConnected).Methods(http.MethodGet)
	router.HandleFunc("/connection/rich", h.GetAllConnectedRichTect).Methods(http.MethodGet)

	router.HandleFunc("/accept-connection", h.AcceptConnection).Methods(http.MethodPost)
	router.HandleFunc("/decline-connection", h.DeclineConnection).Methods(http.MethodPost)

	// Forgot-Password
	router.HandleFunc("/forgot-password", h.ForgotPassword).Methods(http.MethodPost)

	// Chat
	router.HandleFunc("/chat", h.StartConversation).Methods(http.MethodPost)
	router.HandleFunc("/chat", h.GetConversation).Methods(http.MethodGet)
	router.HandleFunc("/chat/connect", h.GetAllConnectedChat).Methods(http.MethodGet)
	router.HandleFunc("/chat/find", h.FindConversation).Methods(http.MethodGet)

	// Education
	router.HandleFunc("/education", h.AddEducation).Methods(http.MethodPost)
	router.HandleFunc("/education", h.GetEducation).Methods(http.MethodGet)
	router.HandleFunc("/education", h.UpdateEducation).Methods(http.MethodPatch)
	router.HandleFunc("/education", h.DeleteEducation).Methods(http.MethodDelete)

	// Experience
	router.HandleFunc("/experience", h.AddExperience).Methods(http.MethodPost)
	router.HandleFunc("/experience", h.GetExperience).Methods(http.MethodGet)
	router.HandleFunc("/experience", h.UpdateExperience).Methods(http.MethodPatch)
	router.HandleFunc("/experience", h.DeleteExperience).Methods(http.MethodDelete)

	// Job
	router.HandleFunc("/job", h.AddJob).Methods(http.MethodPost)
	router.HandleFunc("/job", h.GetJob).Methods(http.MethodGet)

	// Profile
	router.HandleFunc("/profile", h.GetProfile).Methods(http.MethodGet)

	// Views
	router.HandleFunc("/view", h.AddView).Methods(http.MethodPost)
	router.HandleFunc("/view", h.GetView).Methods(http.MethodGet)

	// Comment
	router.HandleFunc("/comment", h.AddComment).Methods(http.MethodPost)
	router.HandleFunc("/comment", h.GetComment).Methods(http.MethodGet)
	router.HandleFunc("/comment/like", h.LikeComment).Methods(http.MethodPost)
	router.HandleFunc("/comment/unlike", h.UnlikeComment).Methods(http.MethodPost)

	// Reply
	router.HandleFunc("/reply", h.AddReply).Methods(http.MethodPost)
	router.HandleFunc("/reply", h.GetReply).Methods(http.MethodGet)
	router.HandleFunc("/reply/like", h.AddReplyLike).Methods(http.MethodPost)
	router.HandleFunc("/reply/unlike", h.UnlikeReply).Methods(http.MethodPost)
	// router.HandleFunc("/reply/like", h.GetReply).Methods(http.MethodGet)

	// Tags

	router.HandleFunc("/tags", h.GetAllTags).Methods(http.MethodGet)

	log.Println("API is running!")
	http.ListenAndServe(":8080", GORILLA_HANDLERS.CORS(GORILLA_HANDLERS.AllowedHeaders([]string{"X-Requested-With", "Access-Control-Allow-Origin", "Content-Type", "Authorization"}), GORILLA_HANDLERS.AllowedMethods([]string{"GET", "POST", "PATCH", "DELETE", "HEAD", "OPTIONS"}), GORILLA_HANDLERS.AllowedOrigins([]string{"*"}))(router))
}

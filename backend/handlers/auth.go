package handlers

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"strings"
	"time"

	"twoGuysBurgers/db"
	"twoGuysBurgers/models"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

func AuthHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodGet {
		isAdmin(w, r)
	} else {
		http.Error(w, "método no permitido", http.StatusMethodNotAllowed)
	}
}

func AdminHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		getAdmins(w, r)
	case http.MethodPost:
		addAdmin(w, r)
	case http.MethodDelete:
		removeAdmin(w, r)
	default:
		http.Error(w, "método no permitido", http.StatusMethodNotAllowed)
	}
}

func getAdmins(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	collection := db.GetCollection("admins")
	cursor, err := collection.Find(ctx, bson.M{})
	if err != nil {
		http.Error(w, "error al obtener admins", http.StatusInternalServerError)
		return
	}
	defer cursor.Close(ctx)

	var admins []models.Admin
	if err := cursor.All(ctx, &admins); err != nil {
		http.Error(w, "error al leer admins", http.StatusInternalServerError)
		return
	}

	if admins == nil {
		admins = []models.Admin{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(admins)
}

func addAdmin(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	email := r.PathValue("email")

	if email == "" {
		http.Error(w, "el email del usuario no puede estar vacío", http.StatusBadRequest)
		log.Println("el email del usuario no puede estar vacío")
		return
	}

	collection := db.GetCollection("admins")

	var existing models.Admin
	if err := collection.FindOne(ctx, bson.M{"email": email}).Decode(&existing); err == nil {
		http.Error(w, "el admin ya existe", http.StatusConflict)
		log.Printf("admin con email %s ya existe", email)
		return
	}

	newAdmin := models.Admin{
		ID:    primitive.NewObjectID(),
		Email: email,
	}

	if _, err := collection.InsertOne(ctx, newAdmin); err != nil {
		http.Error(w, "error al añadir admin", http.StatusInternalServerError)
		log.Println("error al añadir admin", err)
		return
	}

	log.Printf("admin registrado con id %s", newAdmin.ID.Hex())

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(newAdmin)
}

func removeAdmin(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	email := r.PathValue("email")

	if email == "" {
		http.Error(w, "el email del usuario no puede estar vacío", http.StatusBadRequest)
		log.Println("el email del usuario no puede estar vacío")
		return
	}

	collection := db.GetCollection("admins")

	result, err := collection.DeleteOne(ctx, bson.M{"email": email})
	if err != nil {
		http.Error(w, "error al remover admin", http.StatusInternalServerError)
		log.Printf("error al remover admin con id %s: %v", email, err)
		return
	}

	if result.DeletedCount == 0 {
		http.Error(w, "admin inexistente", http.StatusNotFound)
		log.Printf("admin inexistente con email %s: %v", email, err)
		return
	}

	log.Printf("admin con email %s borrado", email)
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(result.Acknowledged)
}

func isAdmin(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	authHeader := r.Header.Get("Authorization")

	if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
		http.Error(w, "autorización requerida", http.StatusUnauthorized)
		return
	}

	token := strings.TrimPrefix(authHeader, "Bearer ")

	response, err := db.Supabase.Auth.WithToken(token).GetUser()
	if err != nil {
		http.Error(w, "error al obtener usuario", http.StatusInternalServerError)
		log.Println("error al obtener usuario", err)
		return
	}

	collection := db.GetCollection("admins")
	result := collection.FindOne(ctx, bson.M{"email": response.Email})

	var user models.Admin
	if err := result.Decode(&user); err != nil {
		if err == mongo.ErrNoDocuments {
			w.WriteHeader(http.StatusOK)
			json.NewEncoder(w).Encode(map[string]bool{"is_admin": false})
			return
		} else {
			http.Error(w, "error interno", http.StatusInternalServerError)
			log.Println("error interno", err)
			return
		}
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]bool{"is_admin": true})
}

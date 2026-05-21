package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"strings"

	"twoGuysBurgers/db"

	"github.com/google/uuid"
	"github.com/supabase-community/gotrue-go/types"
)

func AuthHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodGet {
		isAdmin(w, r)
	} else {
		http.Error(w, "método no permitido", http.StatusMethodNotAllowed)
	}
}

func AuthRoleHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodPut {
		setRole(w, r)
	} else {
		http.Error(w, "método no permitido", http.StatusMethodNotAllowed)
	}
}

func setRole(w http.ResponseWriter, r *http.Request) {
	authHeader := r.Header.Get("Authorization")

	if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
		http.Error(w, "autorización requerida", http.StatusUnauthorized)
		return
	}

	token := strings.TrimPrefix(authHeader, "Bearer ")
	user_id, err := uuid.Parse(r.PathValue("user_id"))

	if err != nil {
		http.Error(w, "user_id no es un uuid válido", http.StatusNotFound)
		log.Println("user_id no es un uuid válido", err)
		return
	}

	var body map[string]string
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		http.Error(w, "request malformada", http.StatusBadRequest)
		log.Println("request malformada", err)
		return
	}

	role, ok := body["role"]
	if !ok {
		http.Error(w, "la request debe contener un campo role", http.StatusBadRequest)
		log.Println("la request debe contener un campo role", err)
		return
	}

	response, err := db.Supabase.Auth.WithToken(token).AdminUpdateUser(types.AdminUpdateUserRequest{
		UserID:      user_id,
		AppMetadata: map[string]any{"role": role},
	})

	if err != nil {
		http.Error(w, "error al actualizar rol", http.StatusInternalServerError)
		log.Println("error al actualizar rol", err)
		return
	}

	log.Printf("rol del usuario con uuid %s actualizado a %s", user_id, role)
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

func isAdmin(w http.ResponseWriter, r *http.Request) {
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

	if response.AppMetadata["role"] == "admin" {
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]bool{"is_admin": true})
	} else {
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]bool{"is_admin": false})
	}
}

package middleware

import (
	"log"
	"net/http"
	"strings"
	"twoGuysBurgers/db"
)

func AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")

		if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
			http.Error(w, "autorización requerida", http.StatusUnauthorized)
			return
		}

		token := strings.TrimPrefix(authHeader, "Bearer ")

		_, err := db.Supabase.Auth.WithToken(token).GetUser()

		if err != nil {
			http.Error(w, "token de admin no válido", http.StatusUnauthorized)
			log.Println("[ERROR] token de admin no válido", err)
			return
		}

		next.ServeHTTP(w, r)
	})
}


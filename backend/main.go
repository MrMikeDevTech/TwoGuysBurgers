package main

import (
	"log"
	"net/http"
	"os"

	"twoGuysBurgers/db"
	"twoGuysBurgers/handlers"
	"twoGuysBurgers/middleware"

	"github.com/joho/godotenv"
)

func protected(h http.HandlerFunc) http.Handler {
	return middleware.AuthMiddleware(http.HandlerFunc(h))
}

func publicGet(h http.HandlerFunc) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodGet {
			h.ServeHTTP(w, r)
			return
		}
		middleware.AuthMiddleware(http.HandlerFunc(h)).ServeHTTP(w, r)
	})
}

func publicOrder(h http.HandlerFunc) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodPost {
			h.ServeHTTP(w, r)
			return
		}
		middleware.AuthMiddleware(http.HandlerFunc(h)).ServeHTTP(w, r)
	})
}

func main() {
	if err := godotenv.Load(); err != nil {
		log.Fatal("error cargando .env")
	}

	uri := os.Getenv("MONGODB_URI")
	dbName := os.Getenv("DB_NAME")

	if uri == "" || dbName == "" {
		log.Fatal("MONGO_URI y DB_NAME son requeridas")
	}

	db.Connect(uri, dbName)
	db.ConnectSupabase()
	mux := http.NewServeMux()

	mux.Handle("/ingredients", publicGet(handlers.IngredientsHandler))
	mux.Handle("/ingredients/{id}", publicGet(handlers.IngredientHandler))
	mux.Handle("/recipes", publicGet(handlers.RecipesHandler))
	mux.Handle("/recipes/{id}", publicGet(handlers.RecipeHandler))
	mux.Handle("/combos", publicGet(handlers.CombosHandler))
	mux.Handle("/combos/{id}", publicGet(handlers.ComboHandler))
	mux.Handle("/orders", publicOrder(handlers.OrdersHandler))
	mux.Handle("/orders/{id}", protected(handlers.OrderHandler))
	mux.HandleFunc("/auth/is-admin", handlers.AuthHandler)
	mux.Handle("/auth/admins", protected(handlers.AdminHandler))
	mux.Handle("/auth/admins/{email}", protected(handlers.AdminHandler))

	port := os.Getenv("BACK_PORT")
	if port == "" {
		port = "18000"
	}

	log.Printf("Servidor corriendo en el puerto %s\n", port)
	log.Fatal(http.ListenAndServe(":"+port, middleware.CORSMiddleware(mux)))
}

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

	mux.Handle("/ingredients", protected(handlers.IngredientsHandler))
	mux.Handle("/ingredients/{id}", protected(handlers.IngredientHandler))
	mux.Handle("/recipes", protected(handlers.RecipesHandler))
	mux.Handle("/recipes/{id}", protected(handlers.RecipeHandler))
	mux.Handle("/orders", protected(handlers.OrdersHandler))
	mux.Handle("/orders/{id}", protected(handlers.OrderHandler))
	mux.HandleFunc("/auth/is-admin", handlers.AuthHandler)
	mux.Handle("/auth/role/{user_id}", protected(handlers.AuthRoleHandler))

	log.Println("servidor corriendo en :8080")
	log.Fatal(http.ListenAndServe(":8080", mux))
}

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
	mux.Handle("/combos", protected(handlers.CombosHandler))
	mux.Handle("/combos/{id}", protected(handlers.ComboHandler))
	mux.Handle("/orders", protected(handlers.OrdersHandler))
	mux.Handle("/orders/{id}", protected(handlers.OrderHandler))
	mux.HandleFunc("/auth/is-admin", handlers.AuthHandler)
	mux.Handle("/auth/admins/{email}", protected(handlers.AdminHandler))

	port := os.Getenv("BACK_PORT")
	if port == "" {
		port = "18000"
	}

	log.Printf("Servidor corriendo en el puerto %s\n", port)
	log.Fatal(http.ListenAndServe(":"+port, middleware.CORSMiddleware(mux)))
}

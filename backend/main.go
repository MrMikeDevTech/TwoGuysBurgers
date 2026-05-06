package main

import (
	"log"
	"net/http"
	"os"

	"twoGuysBurgers/db"
	"twoGuysBurgers/handlers"

	"github.com/joho/godotenv"
)

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
	mux := http.NewServeMux()

	mux.HandleFunc("/ingredients", handlers.IngredientsHandler)
	mux.HandleFunc("/ingredients/{id}", handlers.IngredientHandler)

	log.Println("servidor corriendo en :8080")
	log.Fatal(http.ListenAndServe(":8080", mux))
}

package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"twoGuysBurgers/db"
	"twoGuysBurgers/models"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

func IngredientsHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		getIngredients(w, r)
	case http.MethodPost:
		createIngredient(w, r)
	default:
		http.Error(w, "método no permitido", http.StatusMethodNotAllowed)
	}
}

func IngredientHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		getIngredient(w, r)
	case http.MethodPut:
		updateIngredient(w, r)
	case http.MethodDelete:
		deleteIngredient(w, r)
	default:
		http.Error(w, "método no permitido", http.StatusMethodNotAllowed)
	}
}

func getIngredients(w http.ResponseWriter, _ *http.Request) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	collection := db.GetCollection("ingredients")
	cursor, err := collection.Find(ctx, bson.M{})
	if err != nil {
		http.Error(w, "error al obtener ingredientes", http.StatusInternalServerError)
		return
	}
	defer cursor.Close(ctx)

	var ingredients []models.Ingredient
	if err := cursor.All(ctx, &ingredients); err != nil {
		http.Error(w, "error al leer ingredientes", http.StatusInternalServerError)
		log.Println("error al leer ingredientes", err)
		return
	}

	log.Println("Regresando lista de productos...")

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(ingredients)
}

func getIngredient(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	path_id := r.PathValue("id")
	id, err := primitive.ObjectIDFromHex(path_id)

	if err != nil {
		http.Error(w, "ingrediente con id inválido", http.StatusBadRequest)
		log.Println("ingrediente con id inválido", err)
		return
	}

	var ingredient models.Ingredient
	collection := db.GetCollection("ingredients")
	result := collection.FindOne(ctx, bson.M{"_id": id})
	if err := result.Decode(&ingredient); err != nil {
		if err == mongo.ErrNoDocuments {
			http.Error(w, fmt.Sprintf("ingrediente con id %s no encontrado", path_id), http.StatusNotFound)
			log.Println(fmt.Sprintf("ingrediente con id %s no encontrado:", path_id), err)
			return
		}
		http.Error(w, "error interno", http.StatusInternalServerError)
		log.Println("error interno", err)
		return
	}

	log.Printf("ingrediente con id %s encontrado", path_id)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(ingredient)
}

func createIngredient(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var newIngredient models.Ingredient
	if err := json.NewDecoder(r.Body).Decode(&newIngredient); err != nil {
		http.Error(w, "request malformada", http.StatusBadRequest)
		log.Println("error al decodificar ingrediente:", err)
		return
	}

	if newIngredient.Name == "" {
		http.Error(w, "el nombre del ingrediente no puede estar vacío", http.StatusBadRequest)
		log.Println("el nombre del ingrediente no puede estar vacío")
		return
	}
	if newIngredient.Unit == "" {
		http.Error(w, "la unidad del ingrediente no puede estar vacía", http.StatusBadRequest)
		log.Println("la unidad del ingrediente no puede estar vacía")
		return
	}
	if newIngredient.UnitPrice < 0 {
		http.Error(w, "el precio unitario no puede ser negativo", http.StatusBadRequest)
		log.Println("el precio unitario no puede ser negativo")
		return
	}
	if newIngredient.Stock < 0 {
		http.Error(w, "el stock no puede ser negativo", http.StatusBadRequest)
		log.Println("el stock no puede ser negativo")
		return
	}

	newIngredient.ID = primitive.NewObjectID()

	collection := db.GetCollection("ingredients")
	if _, err := collection.InsertOne(ctx, newIngredient); err != nil {
		http.Error(w, "error al crear ingrediente", http.StatusInternalServerError)
		log.Println("error al insertar ingrediente:", err)
		return
	}

	log.Printf("ingrediente creado con id %s", newIngredient.ID.Hex())

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(newIngredient)
}

func updateIngredient(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	path_id := r.PathValue("id")
	id, err := primitive.ObjectIDFromHex(path_id)

	if err != nil {
		http.Error(w, "ingrediente con id inválido", http.StatusBadRequest)
		log.Println("ingrediente con id inválido", err)
		return
	}

	var updateIngredient models.UpdateIngredientDTO
	if err := json.NewDecoder(r.Body).Decode(&updateIngredient); err != nil {
		http.Error(w, "request malformada", http.StatusBadRequest)
		log.Println("error al decodificar actualización de ingrediente:", err)
		return
	}

	if updateIngredient.Name != nil && *updateIngredient.Name == "" {
		http.Error(w, "el nombre del ingrediente no puede estar vacío", http.StatusBadRequest)
		log.Println("el nombre del ingrediente no puede estar vacío")
		return
	}
	if updateIngredient.Unit != nil && *updateIngredient.Unit == "" {
		http.Error(w, "la unidad del ingrediente no puede estar vacía", http.StatusBadRequest)
		log.Println("la unidad del ingrediente no puede estar vacía")
		return
	}
	if updateIngredient.UnitPrice != nil && *updateIngredient.UnitPrice < 0 {
		http.Error(w, "el precio unitario no puede ser negativo", http.StatusBadRequest)
		log.Println("el precio unitario no puede ser negativo")
		return
	}
	if updateIngredient.Stock != nil && *updateIngredient.Stock < 0 {
		http.Error(w, "el stock no puede ser negativo", http.StatusBadRequest)
		log.Println("el stock no puede ser negativo")
		return
	}

	collection := db.GetCollection("ingredients")

	preUpdate := bson.D{}

	if updateIngredient.Name != nil {
		preUpdate = append(preUpdate, bson.E{Key: "name", Value: *updateIngredient.Name})
	}
	if updateIngredient.Stock != nil {
		preUpdate = append(preUpdate, bson.E{Key: "stock", Value: *updateIngredient.Stock})
	}
	if updateIngredient.Unit != nil {
		preUpdate = append(preUpdate, bson.E{Key: "unit", Value: *updateIngredient.Unit})
	}
	if updateIngredient.UnitPrice != nil {
		preUpdate = append(preUpdate, bson.E{Key: "unit_price", Value: *updateIngredient.UnitPrice})
	}
	if updateIngredient.ImageUrl != nil {
		preUpdate = append(preUpdate, bson.E{Key: "image_url", Value: *updateIngredient.ImageUrl})
	}

	if len(preUpdate) == 0 {
		http.Error(w, "no hay campos para actualizar", http.StatusBadRequest)
		return
	}

	update := bson.D{{Key: "$set", Value: preUpdate}}

	result, err := collection.UpdateOne(ctx, bson.M{"_id": id}, update)
	if err != nil {
		http.Error(w, "error de actualización", http.StatusInternalServerError)
		log.Printf("error al actualizar ingrediente con id %s: %v", path_id, err)
		return
	}

	if result.MatchedCount == 0 {
		http.Error(w, "ingrediente no encontrado", http.StatusNotFound)
		log.Printf("ingrediente con id %s no encontrado para actualizar", path_id)
		return
	}

	log.Printf("ingrediente con id %s actualizado", path_id)
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(result.Acknowledged)
}

func deleteIngredient(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	path_id := r.PathValue("id")
	id, err := primitive.ObjectIDFromHex(path_id)

	if err != nil {
		http.Error(w, "ingrediente con id inválido", http.StatusBadRequest)
		log.Println("ingrediente con id inválido", err)
		return
	}

	collection := db.GetCollection("ingredients")
	result, err := collection.DeleteOne(ctx, bson.M{"_id": id})
	if err != nil {
		http.Error(w, "error al borrar ingrediente", http.StatusInternalServerError)
		log.Printf("error al borrar ingrediente con id %s: %v", path_id, err)
		return
	}

	if result.DeletedCount == 0 {
		http.Error(w, "ingrediente inexistente", http.StatusNotFound)
		log.Printf("ingrediente inexistente con id %s: %v", path_id, err)
		return
	}

	log.Printf("ingrediente con id %s borrado", path_id)
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(result.Acknowledged)
}

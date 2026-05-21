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

func RecipesHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		getRecipes(w, r)
	case http.MethodPost:
		createRecipe(w, r)
	}
}

func RecipeHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		getRecipe(w, r)
	case http.MethodPut:
		updateRecipe(w, r)
	case http.MethodDelete:
		deleteRecipe(w, r)
	default:
		http.Error(w, "método no permitido", http.StatusMethodNotAllowed)
	}
}

func deleteRecipe(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	path_id := r.PathValue("id")
	id, err := primitive.ObjectIDFromHex(path_id)

	if err != nil {
		http.Error(w, "receta con id inválido", http.StatusBadRequest)
		log.Println("receta con id inválido", err)
		return
	}

	collection := db.GetCollection("recipes")
	result, err := collection.DeleteOne(ctx, bson.M{"_id": id})
	if err != nil {
		http.Error(w, "error al borrar receta", http.StatusInternalServerError)
		log.Printf("error al borrar receta con id %s: %v", path_id, err)
		return
	}

	if result.DeletedCount == 0 {
		http.Error(w, "receta inexistente", http.StatusNotFound)
		log.Printf("receta inexistente con id %s: %v", path_id, err)
		return
	}

	log.Printf("receta con id %s borrado", path_id)
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(result.Acknowledged)
}

func getRecipe(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	path_id := r.PathValue("id")
	id, err := primitive.ObjectIDFromHex(path_id)

	if err != nil {
		http.Error(w, "receta con id inválido", http.StatusBadRequest)
		log.Println("receta con id inválido", err)
		return
	}

	var recipe models.Recipe
	collection := db.GetCollection("recipes")
	result := collection.FindOne(ctx, bson.M{"_id": id})
	if err := result.Decode(&recipe); err != nil {
		if err == mongo.ErrNoDocuments {
			http.Error(w, fmt.Sprintf("receta con id %s no encontrado", path_id), http.StatusNotFound)
			log.Println(fmt.Sprintf("receta con id %s no encontrado:", path_id), err)
			return
		}
		http.Error(w, "error interno", http.StatusInternalServerError)
		log.Println("error interno", err)
		return
	}

	log.Printf("receta con id %s encontrada", path_id)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(recipe)
}

func createRecipe(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var newRecipe models.Recipe
	if err := json.NewDecoder(r.Body).Decode(&newRecipe); err != nil {
		http.Error(w, "request malformada", http.StatusBadRequest)
		log.Println("error al decodificar receta:", err)
		return
	}

	if newRecipe.Name == "" {
		http.Error(w, "el nombre de la receta no puede estar vacío", http.StatusBadRequest)
		log.Println("el nombre de la receta no puede estar vacío")
		return
	}
	if newRecipe.Price <= 0 {
		http.Error(w, "el precio de la receta debe ser mayor a 0", http.StatusBadRequest)
		log.Println("el precio de la receta debe ser mayor a 0")
		return
	}
	if len(newRecipe.Ingredients) == 0 {
		http.Error(w, "la receta debe tener al menos un ingrediente", http.StatusBadRequest)
		log.Println("la receta debe tener al menos un ingrediente")
		return
	}

	newRecipe.ID = primitive.NewObjectID()

	collection := db.GetCollection("recipes")
	if _, err := collection.InsertOne(ctx, newRecipe); err != nil {
		http.Error(w, "error al crear receta", http.StatusInternalServerError)
		log.Println("error al insertar receta:", err)
		return
	}

	log.Printf("receta creada con id %s", newRecipe.ID.Hex())

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(newRecipe)
}

func updateRecipe(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	path_id := r.PathValue("id")
	id, err := primitive.ObjectIDFromHex(path_id)

	if err != nil {
		http.Error(w, "receta con id inválido", http.StatusBadRequest)
		log.Println("receta con id inválido", err)
		return
	}

	var updateData models.UpdateRecipeDTO
	if err := json.NewDecoder(r.Body).Decode(&updateData); err != nil {
		http.Error(w, "request malformada", http.StatusBadRequest)
		log.Println("error al decodificar actualización de receta:", err)
		return
	}

	if updateData.Name != nil && *updateData.Name == "" {
		http.Error(w, "el nombre de la receta no puede estar vacío", http.StatusBadRequest)
		log.Println("el nombre de la receta no puede estar vacío")
		return
	}
	if updateData.Price != nil && *updateData.Price <= 0 {
		http.Error(w, "el precio de la receta debe ser mayor a 0", http.StatusBadRequest)
		log.Println("el precio de la receta debe ser mayor a 0")
		return
	}
	if updateData.Ingredients != nil && len(*updateData.Ingredients) == 0 {
		http.Error(w, "la receta debe tener al menos un ingrediente", http.StatusBadRequest)
		log.Println("la receta debe tener al menos un ingrediente")
		return
	}

	collection := db.GetCollection("recipes")

	preUpdate := bson.D{}

	if updateData.Name != nil {
		preUpdate = append(preUpdate, bson.E{Key: "name", Value: *updateData.Name})
	}
	if updateData.Description != nil {
		preUpdate = append(preUpdate, bson.E{Key: "description", Value: *updateData.Description})
	}
	if updateData.Price != nil {
		preUpdate = append(preUpdate, bson.E{Key: "price", Value: *updateData.Price})
	}
	if updateData.Ingredients != nil {
		preUpdate = append(preUpdate, bson.E{Key: "ingredients", Value: *updateData.Ingredients})
	}

	if len(preUpdate) == 0 {
		http.Error(w, "no hay campos para actualizar", http.StatusBadRequest)
		return
	}

	update := bson.D{{Key: "$set", Value: preUpdate}}

	result, err := collection.UpdateOne(ctx, bson.M{"_id": id}, update)
	if err != nil {
		http.Error(w, "error de actualización", http.StatusInternalServerError)
		log.Printf("error al actualizar receta con id %s: %v", path_id, err)
		return
	}

	if result.MatchedCount == 0 {
		http.Error(w, "receta no encontrada", http.StatusNotFound)
		log.Printf("receta con id %s no encontrada para actualizar", path_id)
		return
	}

	log.Printf("receta con id %s actualizada", path_id)
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(result.Acknowledged)
}

func getRecipes(w http.ResponseWriter, _ *http.Request) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	collection := db.GetCollection("recipes")
	cursor, err := collection.Find(ctx, bson.M{})
	if err != nil {
		http.Error(w, "error al obtener recetas", http.StatusInternalServerError)
		return
	}
	defer cursor.Close(ctx)

	var recipes []models.Recipe
	if err := cursor.All(ctx, &recipes); err != nil {
		http.Error(w, "error al leer recetas", http.StatusInternalServerError)
		log.Println("error al leer recetas", err)
		return
	}

	log.Println("Regresando lista de recetas...")

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(recipes)
}

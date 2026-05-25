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

func CombosHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		getCombos(w, r)
	case http.MethodPost:
		createCombo(w, r)
	}
}

func ComboHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		getCombo(w, r)
	case http.MethodPut:
		updateCombo(w, r)
	case http.MethodDelete:
		deleteCombo(w, r)
	default:
		http.Error(w, "método no permitido", http.StatusMethodNotAllowed)
	}
}

func deleteCombo(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	path_id := r.PathValue("id")
	id, err := primitive.ObjectIDFromHex(path_id)

	if err != nil {
		http.Error(w, "combo con id inválido", http.StatusBadRequest)
		log.Println("combo con id inválido", err)
		return
	}

	collection := db.GetCollection("combos")
	result, err := collection.DeleteOne(ctx, bson.M{"_id": id})
	if err != nil {
		http.Error(w, "error al borrar combo", http.StatusInternalServerError)
		log.Printf("error al borrar combo con id %s: %v", path_id, err)
		return
	}

	if result.DeletedCount == 0 {
		http.Error(w, "combo inexistente", http.StatusNotFound)
		log.Printf("combo inexistente con id %s: %v", path_id, err)
		return
	}

	log.Printf("combo con id %s borrado", path_id)
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(result.Acknowledged)
}

func getCombo(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	path_id := r.PathValue("id")
	id, err := primitive.ObjectIDFromHex(path_id)

	if err != nil {
		http.Error(w, "combo con id inválido", http.StatusBadRequest)
		log.Println("combo con id inválido", err)
		return
	}

	var combo models.Combo
	collection := db.GetCollection("combos")
	result := collection.FindOne(ctx, bson.M{"_id": id})
	if err := result.Decode(&combo); err != nil {
		if err == mongo.ErrNoDocuments {
			http.Error(w, fmt.Sprintf("combo con id %s no encontrado", path_id), http.StatusNotFound)
			log.Println(fmt.Sprintf("combo con id %s no encontrado:", path_id), err)
			return
		}
		http.Error(w, "error interno", http.StatusInternalServerError)
		log.Println("error interno", err)
		return
	}

	log.Printf("combo con id %s encontrada", path_id)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(combo)
}

func createCombo(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var newCombo models.Combo
	if err := json.NewDecoder(r.Body).Decode(&newCombo); err != nil {
		http.Error(w, "request malformada", http.StatusBadRequest)
		log.Println("error al decodificar combo:", err)
		return
	}

	if newCombo.Name == "" {
		http.Error(w, "el nombre del combo no puede estar vacío", http.StatusBadRequest)
		log.Println("el nombre del combo no puede estar vacío")
		return
	}
	if newCombo.Price <= 0 {
		http.Error(w, "el precio del combo debe ser mayor a 0", http.StatusBadRequest)
		log.Println("el precio del combo debe ser mayor a 0")
		return
	}
	if len(newCombo.Recipes) == 0 {
		http.Error(w, "el combo debe tener al menos una receta", http.StatusBadRequest)
		log.Println("el combo debe tener al menos una receta")
		return
	}
	if newCombo.ImageUrl == "" {
		http.Error(w, "la imagen del combo no puede estar vacía", http.StatusBadRequest)
		log.Println("la imagen del combo no puede estar vacía")
		return
	}

	newCombo.ID = primitive.NewObjectID()

	collection := db.GetCollection("combos")
	if _, err := collection.InsertOne(ctx, newCombo); err != nil {
		http.Error(w, "error al crear combo", http.StatusInternalServerError)
		log.Println("error al insertar combo:", err)
		return
	}

	log.Printf("combo creado con id %s", newCombo.ID.Hex())

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(newCombo)
}

func updateCombo(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	path_id := r.PathValue("id")
	id, err := primitive.ObjectIDFromHex(path_id)

	if err != nil {
		http.Error(w, "combo con id inválido", http.StatusBadRequest)
		log.Println("combo con id inválido", err)
		return
	}

	var updateData models.UpdateComboDTO
	if err := json.NewDecoder(r.Body).Decode(&updateData); err != nil {
		http.Error(w, "request malformada", http.StatusBadRequest)
		log.Println("error al decodificar actualización de combo:", err)
		return
	}

	if updateData.Name != nil && *updateData.Name == "" {
		http.Error(w, "el nombre del combo no puede estar vacío", http.StatusBadRequest)
		log.Println("el nombre del combo no puede estar vacío")
		return
	}
	if updateData.Price != nil && *updateData.Price <= 0 {
		http.Error(w, "el precio del combo debe ser mayor a 0", http.StatusBadRequest)
		log.Println("el precio del combo debe ser mayor a 0")
		return
	}
	if updateData.Recipes != nil && len(*updateData.Recipes) == 0 {
		http.Error(w, "el combo debe tener al menos una receta", http.StatusBadRequest)
		log.Println("el combo debe tener al menos una receta")
		return
	}

	collection := db.GetCollection("combos")

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
	if updateData.Recipes != nil {
		preUpdate = append(preUpdate, bson.E{Key: "recipes", Value: *updateData.Recipes})
	}
	if updateData.ImageUrl != nil {
		preUpdate = append(preUpdate, bson.E{Key: "image_url", Value: *updateData.ImageUrl})
	}

	if len(preUpdate) == 0 {
		http.Error(w, "no hay campos para actualizar", http.StatusBadRequest)
		return
	}

	update := bson.D{{Key: "$set", Value: preUpdate}}

	result, err := collection.UpdateOne(ctx, bson.M{"_id": id}, update)
	if err != nil {
		http.Error(w, "error de actualización", http.StatusInternalServerError)
		log.Printf("error al actualizar combo con id %s: %v", path_id, err)
		return
	}

	if result.MatchedCount == 0 {
		http.Error(w, "combo no encontrado", http.StatusNotFound)
		log.Printf("combo con id %s no encontrado para actualizar", path_id)
		return
	}

	log.Printf("combo con id %s actualizado", path_id)
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(result.Acknowledged)
}

func getCombos(w http.ResponseWriter, _ *http.Request) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	collection := db.GetCollection("combos")
	cursor, err := collection.Find(ctx, bson.M{})
	if err != nil {
		http.Error(w, "error al obtener combos", http.StatusInternalServerError)
		return
	}
	defer cursor.Close(ctx)

	var combos []models.Combo
	if err := cursor.All(ctx, &combos); err != nil {
		http.Error(w, "error al leer combos", http.StatusInternalServerError)
		log.Println("error al leer combos", err)
		return
	}

	if combos == nil {
		combos = []models.Combo{}
	}

	log.Println("Regresando lista de combos...")

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(combos)
}

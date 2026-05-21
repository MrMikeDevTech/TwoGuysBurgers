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

func OrdersHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		getOrders(w, r)
	case http.MethodPost:
		createOrder(w, r)
	default:
		http.Error(w, "método no permitido", http.StatusMethodNotAllowed)
	}
}

func OrderHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		getOrder(w, r)
	case http.MethodPut:
		updateOrder(w, r)
	case http.MethodDelete:
		deleteOrder(w, r)
	default:
		http.Error(w, "método no permitido", http.StatusMethodNotAllowed)
	}
}

func createOrder(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var orderRequest models.CreateOrderDTO
	if err := json.NewDecoder(r.Body).Decode(&orderRequest); err != nil {
		http.Error(w, "request malformada", http.StatusBadRequest)
		log.Println("error al decodificar orden:", err)
		return
	}

	if len(orderRequest.Recipes) < 1 {
		http.Error(w, "la lista de recetas no puede estar vacia", http.StatusBadRequest)
		log.Println("la lista de recetas no puede estar vacia")
		return
	}

	if orderRequest.CustomerName == "" {
		http.Error(w, "el nombre del cliente no puede estar vacio", http.StatusBadRequest)
		log.Println("el nombre del cliente no puede estar vacio")
		return
	}

	orderCollection := db.GetCollection("orders")
	recipeCollection := db.GetCollection("recipes")

	var totalPrice float64
	var recipeOrders []models.RecipeOrder

	for _, recipeAmount := range orderRequest.Recipes {
		id, err := primitive.ObjectIDFromHex(recipeAmount.RecipeID)
		if err != nil {
			http.Error(w, "id para receta inválido", http.StatusBadRequest)
			log.Println("id para receta inválido", err)
			return
		}

		var recipe models.Recipe
		result := recipeCollection.FindOne(ctx, bson.M{"_id": id})
		if err := result.Decode(&recipe); err != nil {
			if err == mongo.ErrNoDocuments {
				http.Error(
					w, fmt.Sprintf("receta con id %s no encontrado", id), http.StatusNotFound,
				)
				log.Println(fmt.Sprintf("receta con id %s no encontrado:", id), err)
				return
			}
			http.Error(w, "error interno", http.StatusInternalServerError)
			log.Println("error interno", err)
			return
		}

		totalPrice += recipe.Price * float64(recipeAmount.Amount)
		recipeOrders = append(
			recipeOrders, models.RecipeOrder{RecipeID: id, Amount: recipeAmount.Amount},
		)
	}

	newOrder := models.Order{
		ID:           primitive.NewObjectID(),
		Status:       models.Pending,
		CustomerName: orderRequest.CustomerName,
		Date:         time.Now(),
		RecipeOrders: recipeOrders,
		TotalPrice:   totalPrice,
	}

	if _, err := orderCollection.InsertOne(ctx, newOrder); err != nil {
		http.Error(w, "error al crear orden", http.StatusInternalServerError)
		log.Println("error al insertar orden:", err)
		return
	}

	log.Printf("receta creada con id %s", newOrder.ID.Hex())

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(newOrder)
}

func getOrders(w http.ResponseWriter, _ *http.Request) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	collection := db.GetCollection("orders")
	cursor, err := collection.Find(ctx, bson.M{})
	if err != nil {
		http.Error(w, "error al obtener ordenes", http.StatusInternalServerError)
		return
	}
	defer cursor.Close(ctx)

	var orders []models.Order
	if err := cursor.All(ctx, &orders); err != nil {
		http.Error(w, "error al leer ordenes", http.StatusInternalServerError)
		log.Println("error al leer ordenes", err)
		return
	}

	log.Println("Regresando lista de ordenes...")

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(orders)
}

func getOrder(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	path_id := r.PathValue("id")
	id, err := primitive.ObjectIDFromHex(path_id)

	if err != nil {
		http.Error(w, "orden con id inválido", http.StatusBadRequest)
		log.Println("orden con id inválido", err)
		return
	}

	var order models.Order
	collection := db.GetCollection("orders")
	result := collection.FindOne(ctx, bson.M{"_id": id})
	if err := result.Decode(&order); err != nil {
		if err == mongo.ErrNoDocuments {
			http.Error(w, fmt.Sprintf("orden con id %s no encontrado", path_id), http.StatusNotFound)
			log.Println(fmt.Sprintf("orden con id %s no encontrado:", path_id), err)
			return
		}
		http.Error(w, "error interno", http.StatusInternalServerError)
		log.Println("error interno", err)
		return
	}

	log.Printf("orden con id %s encontrado", path_id)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(order)
}

func deleteOrder(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	path_id := r.PathValue("id")
	id, err := primitive.ObjectIDFromHex(path_id)

	if err != nil {
		http.Error(w, "orden con id inválido", http.StatusBadRequest)
		log.Println("orden con id inválido", err)
		return
	}

	collection := db.GetCollection("orders")
	result, err := collection.DeleteOne(ctx, bson.M{"_id": id})
	if err != nil {
		http.Error(w, "error al borrar orden", http.StatusInternalServerError)
		log.Printf("error al borrar orden con id %s: %v", path_id, err)
		return
	}

	if result.DeletedCount == 0 {
		http.Error(w, "orden inexistente", http.StatusNotFound)
		log.Printf("orden inexistente con id %s: %v", path_id, err)
		return
	}

	log.Printf("orden con id %s borrado", path_id)
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(result.Acknowledged)
}

func updateOrder(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	path_id := r.PathValue("id")
	id, err := primitive.ObjectIDFromHex(path_id)

	if err != nil {
		http.Error(w, "orden con id inválido", http.StatusBadRequest)
		log.Println("orden con id inválido", err)
		return
	}

	var updateData models.UpdateOrderDTO
	if err := json.NewDecoder(r.Body).Decode(&updateData); err != nil {
		http.Error(w, "request malformada", http.StatusBadRequest)
		log.Println("error al decodificar actualización de orden:", err)
		return
	}

	collection := db.GetCollection("orders")

	preUpdate := bson.D{}

	if updateData.CustomerName != nil {
		preUpdate = append(preUpdate, bson.E{Key: "customer_name", Value: *updateData.CustomerName})
	}
	if updateData.RecipeOrders != nil {
		preUpdate = append(preUpdate, bson.E{Key: "recipe_orders", Value: *updateData.RecipeOrders})
	}
	if updateData.TotalPrice != nil {
		preUpdate = append(preUpdate, bson.E{Key: "total_price", Value: *updateData.TotalPrice})
	}
	if updateData.Status != nil {
		switch *updateData.Status {
		case models.Pending, models.InProgress, models.Done:
			preUpdate = append(preUpdate, bson.E{Key: "status", Value: *updateData.Status})
		default:
			http.Error(w, "status inválido", http.StatusBadRequest)
			return
		}
	}

	preUpdate = append(preUpdate, bson.E{Key: "date", Value: time.Now()})

	if len(preUpdate) == 0 {
		http.Error(w, "no hay campos para actualizar", http.StatusBadRequest)
		return
	}

	update := bson.D{{Key: "$set", Value: preUpdate}}

	result, err := collection.UpdateOne(ctx, bson.M{"_id": id}, update)
	if err != nil {
		http.Error(w, "error de actualización", http.StatusInternalServerError)
		log.Printf("error al actualizar orden con id %s: %v", path_id, err)
		return
	}

	if result.MatchedCount == 0 {
		http.Error(w, "orden no encontrada", http.StatusNotFound)
		log.Printf("orden con id %s no encontrada para actualizar", path_id)
		return
	}

	log.Printf("orden con id %s actualizada", path_id)
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(result.Acknowledged)
}

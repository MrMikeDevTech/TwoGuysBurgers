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
	comboCollection := db.GetCollection("combos")
	ingredientCollection := db.GetCollection("ingredients")

	totalNeeded := make(map[primitive.ObjectID]int)
	var totalPrice float64
	var recipeOrders []models.RecipeOrder

	for _, itemAmount := range orderRequest.Recipes {
		id, err := primitive.ObjectIDFromHex(itemAmount.RecipeID)
		if err != nil {
			http.Error(w, "id inválido", http.StatusBadRequest)
			return
		}

		var recipe models.Recipe
		err = recipeCollection.FindOne(ctx, bson.M{"_id": id}).Decode(&recipe)
		if err == nil {
			for _, ingAm := range recipe.Ingredients {
				totalNeeded[ingAm.IngredientID] += ingAm.Amount * itemAmount.Amount
			}
			totalPrice += recipe.Price * float64(itemAmount.Amount)
			recipeOrders = append(recipeOrders, models.RecipeOrder{RecipeID: id, Amount: itemAmount.Amount})
			continue
		}

		var combo models.Combo
		err = comboCollection.FindOne(ctx, bson.M{"_id": id}).Decode(&combo)
		if err == nil {
			for _, comboRecipe := range combo.Recipes {
				var subRecipe models.Recipe
				if err := recipeCollection.FindOne(ctx, bson.M{"_id": comboRecipe.RecipeID}).Decode(&subRecipe); err == nil {
					for _, ingAm := range subRecipe.Ingredients {
						totalNeeded[ingAm.IngredientID] += ingAm.Amount * comboRecipe.Amount * itemAmount.Amount
					}
				}
				recipeOrders = append(recipeOrders, models.RecipeOrder{RecipeID: comboRecipe.RecipeID, Amount: comboRecipe.Amount * itemAmount.Amount})
			}
			totalPrice += combo.Price * float64(itemAmount.Amount)
			continue
		}

		http.Error(w, fmt.Sprintf("producto con id %s no encontrado", id.Hex()), http.StatusNotFound)
		return
	}

	for ingID, needed := range totalNeeded {
		var ingredient models.Ingredient
		if err := ingredientCollection.FindOne(ctx, bson.M{"_id": ingID}).Decode(&ingredient); err != nil {
			http.Error(w, "error interno", http.StatusInternalServerError)
			return
		}
		if ingredient.Stock < needed {
			http.Error(w, fmt.Sprintf("no hay suficiente %s (necesitado: %d, disponible: %d)", ingredient.Name, needed, ingredient.Stock), http.StatusBadRequest)
			return
		}
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
		return
	}

	for ingID, needed := range totalNeeded {
		ingredientCollection.UpdateOne(ctx, bson.M{"_id": ingID}, bson.D{{Key: "$inc", Value: bson.E{Key: "stock", Value: -needed}}})
	}

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
		return
	}

	if orders == nil {
		orders = []models.Order{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(orders)
}

func getOrder(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	path_id := r.PathValue("id")
	id, err := primitive.ObjectIDFromHex(path_id)
	if err != nil {
		http.Error(w, "id inválido", http.StatusBadRequest)
		return
	}

	var order models.Order
	collection := db.GetCollection("orders")
	if err := collection.FindOne(ctx, bson.M{"_id": id}).Decode(&order); err != nil {
		http.Error(w, "orden no encontrada", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(order)
}

func deleteOrder(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	path_id := r.PathValue("id")
	id, err := primitive.ObjectIDFromHex(path_id)
	if err != nil {
		http.Error(w, "id inválido", http.StatusBadRequest)
		return
	}

	collection := db.GetCollection("orders")
	result, err := collection.DeleteOne(ctx, bson.M{"_id": id})
	if err != nil || result.DeletedCount == 0 {
		http.Error(w, "error al borrar", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func updateOrder(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	path_id := r.PathValue("id")
	id, err := primitive.ObjectIDFromHex(path_id)
	if err != nil {
		http.Error(w, "id inválido", http.StatusBadRequest)
		return
	}

	var updateData models.UpdateOrderDTO
	if err := json.NewDecoder(r.Body).Decode(&updateData); err != nil {
		http.Error(w, "request malformada", http.StatusBadRequest)
		return
	}

	collection := db.GetCollection("orders")
	preUpdate := bson.D{}

	if updateData.Status != nil {
		preUpdate = append(preUpdate, bson.E{Key: "status", Value: *updateData.Status})
	}
	if updateData.CustomerName != nil {
		preUpdate = append(preUpdate, bson.E{Key: "customer_name", Value: *updateData.CustomerName})
	}

	if len(preUpdate) == 0 {
		http.Error(w, "nada que actualizar", http.StatusBadRequest)
		return
	}

	update := bson.D{{Key: "$set", Value: preUpdate}}
	_, err = collection.UpdateOne(ctx, bson.M{"_id": id}, update)
	if err != nil {
		http.Error(w, "error al actualizar", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

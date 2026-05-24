package models

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
	"time"
)

type OrderStatus string

const (
	Pending    OrderStatus = "pending"
	InProgress OrderStatus = "in_progress"
	Done       OrderStatus = "done"
)

type RecipeOrder struct {
	RecipeID primitive.ObjectID `bson:"recipe_id" json:"recipe_id"`
	Amount   int                `bson:"amount" json:"amount"`
}

type Order struct {
	ID           primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	CustomerName string             `bson:"customer_name" json:"customer_name"`
	Status       OrderStatus        `bson:"status" json:"status"`
	TotalPrice   float64            `bson:"total_price" json:"total_price"`
	RecipeOrders []RecipeOrder      `bson:"recipe_orders" json:"recipe_orders"`
	Date         time.Time          `bson:"date" json:"date"`
}

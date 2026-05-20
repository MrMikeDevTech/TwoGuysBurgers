package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type IngredientAmount struct {
	IngredientID primitive.ObjectID `bson:"ingredient_id" json:"ingredient_id"`
	Amount       int                `bson:"amount" json:"amount"`
}

type Recipe struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Name        string             `bson:"name" json:"name"`
	Description string             `bson:"description" json:"description"`
	Price       float64            `bson:"price" json:"price"`
	Ingredients []IngredientAmount `bson:"ingredients,omitempty" json:"ingredients"`
}

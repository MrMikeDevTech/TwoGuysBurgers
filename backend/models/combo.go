package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type ComboRecipeAmount struct {
	RecipeID primitive.ObjectID `bson:"recipe_id" json:"recipe_id"`
	Amount   int                `bson:"amount" json:"amount"`
}

type Combo struct {
	ID          primitive.ObjectID  `bson:"_id,omitempty" json:"id"`
	Name        string              `bson:"name" json:"name"`
	Description string              `bson:"description" json:"description"`
	Price       float64             `bson:"price" json:"price"`
	Recipes     []ComboRecipeAmount `bson:"recipes,omitempty" json:"recipes"`
	ImageUrl    string              `bson:"image_url" json:"image_url"`
}

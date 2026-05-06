package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type Ingredient struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Name      string             `bson:"name" json:"name"`
	Stock     int                `bson:"stock" json:"stock"`
	Unit      string             `bson:"unit" json:"unit"`
	UnitPrice float64            `bson:"unit_price" json:"unit_price"`
}

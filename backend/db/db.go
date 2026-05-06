package db

import (
	"context"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

var Client *mongo.Client
var Database *mongo.Database

func Connect(uri string, dbName string) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	client, err := mongo.Connect(options.Client().ApplyURI(uri))

	if err != nil {
		log.Fatal("error al crear cliente:", err)
	}

	if err := client.Ping(ctx, nil); err != nil {
		log.Fatal("no se pudo conectar a mongodb:", err)
	}

	Client = client
	Database = client.Database(dbName)
	log.Println("contectado a mongodb")
}

func GetCollection(name string) *mongo.Collection {
	return Database.Collection(name)
}

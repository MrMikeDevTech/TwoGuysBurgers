package db

import (
	"log"
	"os"

	supa "github.com/supabase-community/supabase-go"
)

var Supabase *supa.Client

func ConnectSupabase() {
	url := os.Getenv("SUPABASE_URL")
	key := os.Getenv("SUPABASE_SERVICE_ROLE")

	if url == "" || key == "" {
		log.Fatal("SUPABASE_URL y SUPABASE_SERVICE_ROLE son requeridas")
	}

	client, err := supa.NewClient(url, key, nil)
	if err != nil {
		log.Fatal("error al crear cliente de supabase:", err)
	}

	Supabase = client
	log.Println("conectado a supabase")
}

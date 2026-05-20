package models

type UpdateIngredientDTO struct {
	Name      *string  `json:"name"`
	Stock     *int     `json:"stock"`
	Unit      *string  `json:"unit"`
	UnitPrice *float64 `json:"unit_price"`
}

type UpdateRecipeDTO struct {
	Name        *string            `json:"name"`
	Description *string            `json:"description"`
	Price       *float64           `json:"price"`
	Ingredients *[]IngredientAmount `json:"ingredients"`
}

package models

type UpdateIngredientDTO struct {
	Name      *string  `json:"name"`
	Stock     *int     `json:"stock"`
	Unit      *string  `json:"unit"`
	UnitPrice *float64 `json:"unit_price"`
}

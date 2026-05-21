package models

type UpdateIngredientDTO struct {
	Name      *string  `json:"name"`
	Stock     *int     `json:"stock"`
	Unit      *string  `json:"unit"`
	UnitPrice *float64 `json:"unit_price"`
}

type UpdateRecipeDTO struct {
	Name        *string             `json:"name"`
	Description *string             `json:"description"`
	Price       *float64            `json:"price"`
	Ingredients *[]IngredientAmount `json:"ingredients"`
}

type RecipeAmount struct {
	RecipeID string `json:"recipe_id"`
	Amount   int    `json:"amount"`
}

type CreateOrderDTO struct {
	CustomerName string         `json:"customer_name"`
	Recipes      []RecipeAmount `json:"recipes"`
}

type UpdateOrderDTO struct {
	CustomerName *string         `json:"customer_name"`
	Status       *OrderStatus    `json:"status"`
	TotalPrice   *float64        `json:"total_price"`
	RecipeOrders *[]RecipeAmount `json:"recipe_orders"`
}

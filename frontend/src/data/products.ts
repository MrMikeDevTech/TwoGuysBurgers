export interface Recipe {
    id: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    img: string;
    ingredients: {
        id: string;
        quantity: number;
    }[];
}

export interface Ingredient {
    id: string;
    name: string;
    stock: number;
    img: string;
    unit: string;
    unitPrice: number;
}

export interface Order {
    id: string;
    customerName: string;
    status: OrderStatus;
    totalPrice: number;
    recipeOrders: RecipeOrder[];
    date: Date;
}

export interface RecipeOrder {
    recipeId: string;
    amount: number;
}

export type OrderStatus = "pending" | "in_progress" | "done";

export interface Combo {
    id: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    img: string;
    products: { recipeId: string; amount: number }[];
}

export const ingredients: Ingredient[] = [
    {
        id: "1",
        name: "Pan Brioche",
        stock: 100,
        img: "https://res.cloudinary.com/djwkfcjkr/image/upload/v1779641518/brioche_bun_q56jre.webp",
        unit: "pz",
        unitPrice: 11
    },
    {
        id: "2",
        name: "Pan Sésamo",
        stock: 100,
        img: "https://res.cloudinary.com/djwkfcjkr/image/upload/v1779641488/sesame_bun_lhtfgr.webp",
        unit: "pz",
        unitPrice: 7
    },
    {
        id: "3",
        name: "Carne",
        stock: 100,
        img: "https://res.cloudinary.com/djwkfcjkr/image/upload/v1779641496/meat_o5g5rk.webp",
        unit: "pz",
        unitPrice: 37
    },
    {
        id: "4",
        name: "Pollo",
        stock: 100,
        img: "https://res.cloudinary.com/djwkfcjkr/image/upload/v1779642765/chicken_meat_egghko.webp",
        unit: "pz",
        unitPrice: 28
    },
    {
        id: "5",
        name: "Jitomate",
        stock: 100,
        img: "https://res.cloudinary.com/djwkfcjkr/image/upload/v1779641487/tomato_he29ix.webp",
        unit: "pz",
        unitPrice: 5
    },
    {
        id: "6",
        name: "Lechuga",
        stock: 100,
        img: "https://res.cloudinary.com/djwkfcjkr/image/upload/v1779641501/lettuce_tvyhoe.webp",
        unit: "pz",
        unitPrice: 4
    },
    {
        id: "7",
        name: "Cebolla Blanca",
        stock: 100,
        img: "https://res.cloudinary.com/djwkfcjkr/image/upload/v1779641494/onion_mjitlf.webp",
        unit: "pz",
        unitPrice: 3
    },
    {
        id: "8",
        name: "Cebolla Morada",
        stock: 100,
        img: "https://res.cloudinary.com/djwkfcjkr/image/upload/v1779641489/purple_onion_mersus.webp",
        unit: "pz",
        unitPrice: 4
    },
    {
        id: "9",
        name: "Jalapeño",
        stock: 100,
        img: "https://res.cloudinary.com/djwkfcjkr/image/upload/v1779641515/jalape%C3%B1os_cfeu7j.webp",
        unit: "pz",
        unitPrice: 3
    },
    {
        id: "10",
        name: "Piña",
        stock: 100,
        img: "https://res.cloudinary.com/djwkfcjkr/image/upload/v1779641491/pineapple_lyxjc0.webp",
        unit: "pz",
        unitPrice: 9
    },
    {
        id: "11",
        name: "Pepinillos",
        stock: 100,
        img: "https://res.cloudinary.com/djwkfcjkr/image/upload/v1779641515/jalape%C3%B1os_cfeu7j.webp",
        unit: "pz",
        unitPrice: 4
    },
    {
        id: "12",
        name: "Tocino",
        stock: 100,
        img: "https://res.cloudinary.com/djwkfcjkr/image/upload/v1779641519/bacon_x295ms.webp",
        unit: "pz",
        unitPrice: 17
    },
    {
        id: "13",
        name: "Queso Americano",
        stock: 100,
        img: "https://res.cloudinary.com/djwkfcjkr/image/upload/v1779641517/cheddar_vunnji.webp",
        unit: "pz",
        unitPrice: 8
    },
    {
        id: "14",
        name: "Queso Manchego",
        stock: 100,
        img: "https://res.cloudinary.com/djwkfcjkr/image/upload/v1779641498/manchego_enrfpr.webp",
        unit: "pz",
        unitPrice: 9
    },
    {
        id: "15",
        name: "Papas",
        stock: 100,
        img: "https://res.cloudinary.com/djwkfcjkr/image/upload/v1779641516/fries_ethw9m.webp",
        unit: "pz",
        unitPrice: 1
    },
    {
        id: "16",
        name: "Papas Gajo",
        stock: 100,
        img: "https://res.cloudinary.com/djwkfcjkr/image/upload/v1779641486/wedges_hbvgae.webp",
        unit: "pz",
        unitPrice: 1
    },
    {
        id: "17",
        name: "Aros de Cebolla",
        stock: 100,
        img: "https://res.cloudinary.com/djwkfcjkr/image/upload/v1779641493/onion-rings_z85xja.webp",
        unit: "pz",
        unitPrice: 1
    },
    {
        id: "18",
        name: "Catsup",
        stock: 100,
        img: "https://res.cloudinary.com/djwkfcjkr/image/upload/v1779641514/ketchup_rshhey.webp",
        unit: "ml",
        unitPrice: 60
    },
    {
        id: "19",
        name: "Mostaza",
        stock: 100,
        img: "https://res.cloudinary.com/djwkfcjkr/image/upload/v1779641495/mustard_rt8we0.webp",
        unit: "ml",
        unitPrice: 50
    },
    {
        id: "20",
        name: "Mayonesa",
        stock: 100,
        img: "https://res.cloudinary.com/djwkfcjkr/image/upload/v1779641498/mayonnaise_qchuhd.webp",
        unit: "ml",
        unitPrice: 55
    },
    {
        id: "21",
        name: "Kewpie Mayonesa",
        stock: 100,
        img: "https://res.cloudinary.com/djwkfcjkr/image/upload/v1779641497/mayonnaise_kewpie_jwz5br.webp",
        unit: "ml",
        unitPrice: 70
    },
    {
        id: "22",
        name: "BBQ",
        stock: 100,
        img: "https://res.cloudinary.com/djwkfcjkr/image/upload/v1779641519/bbq_cehamg.webp",
        unit: "ml",
        unitPrice: 55
    },
    {
        id: "23",
        name: "Refresco",
        stock: 100,
        img: "https://res.cloudinary.com/djwkfcjkr/image/upload/v1779640192/soda_ukkuu7.webp",
        unit: "ml",
        unitPrice: 1
    },
    {
        id: "24",
        name: "Agua Natural",
        stock: 100,
        img: "https://res.cloudinary.com/djwkfcjkr/image/upload/v1779643023/water_ifgf55.webp",
        unit: "ml",
        unitPrice: 1
    },
    {
        id: "25",
        name: "Cerveza",
        stock: 100,
        img: "https://res.cloudinary.com/djwkfcjkr/image/upload/v1779640192/beer_a0g4ns.webp",
        unit: "ml",
        unitPrice: 1
    },
    {
        id: "26",
        name: "Salsa Picante",
        stock: 100,
        img: "https://res.cloudinary.com/djwkfcjkr/image/upload/v1779641488/spicy_sauce_zbnsxx.webp",
        unit: "ml",
        unitPrice: 60
    },
    {
        id: "27",
        name: "Hielo",
        stock: 100,
        img: "https://res.cloudinary.com/djwkfcjkr/image/upload/v1779642578/ice_f9tinc.webp",
        unit: "kg",
        unitPrice: 12
    },
    {
        id: "28",
        name: "Crema Batida",
        stock: 100,
        img: "https://res.cloudinary.com/djwkfcjkr/image/upload/v1779642578/whipped_cream_ihggss.webp",
        unit: "ml",
        unitPrice: 34
    },
    {
        id: "29",
        name: "Jarabe de chocolate",
        stock: 100,
        img: "https://res.cloudinary.com/djwkfcjkr/image/upload/v1779642580/chocolate_syrup_bz5sif.webp",
        unit: "ml",
        unitPrice: 40
    },
    {
        id: "30",
        name: "Leche",
        stock: 100,
        img: "https://res.cloudinary.com/djwkfcjkr/image/upload/v1779642581/milk_ixxsxf.webp",
        unit: "ml",
        unitPrice: 34
    }
];

export const burgers: Recipe[] = [
    {
        id: "1",
        name: "La Clásica",
        slug: "la-clasica",
        description:
            "Hamburguesa de res, en un pan sésamo, queso americano, cebolla amarilla, lechuga, jitomate, pepinillos, ketchup, mayonesa. La base de two guys burgers.",
        price: 100,
        img: "https://res.cloudinary.com/djwkfcjkr/image/upload/v1779599664/la_clasica_v7ak8l.webp",
        ingredients: [
            { id: "2", quantity: 1 }, // Pan Sésamo
            { id: "3", quantity: 1 }, // Carne
            { id: "13", quantity: 1 }, // Queso Americano
            { id: "7", quantity: 1 }, // Cebolla Blanca
            { id: "6", quantity: 1 }, // Lechuga
            { id: "5", quantity: 1 }, // Jitomate
            { id: "11", quantity: 1 }, // Pepinillos
            { id: "18", quantity: 1 }, // Catsup
            { id: "20", quantity: 1 } // Mayonesa
        ]
    },
    {
        id: "2",
        name: "La Wagyu",
        slug: "la-wagyu",
        description:
            "Hamburguesa de res wagyu, en un pan brioche, queso manchego, cebolla morada, lechuga, jitomate, pepinillos, ketchup, mayonesa kewpie. Prueba la hamburguesa con la mejor carne del mercado.",
        price: 158,
        img: "https://res.cloudinary.com/djwkfcjkr/image/upload/v1779599666/la_wagyu_o2unbv.webp",
        ingredients: [
            { id: "1", quantity: 1 }, // Pan Brioche
            { id: "3", quantity: 1 }, // Carne
            { id: "14", quantity: 1 }, // Queso Manchego
            { id: "8", quantity: 1 }, // Cebolla Morada
            { id: "6", quantity: 1 }, // Lechuga
            { id: "5", quantity: 1 }, // Jitomate
            { id: "11", quantity: 1 }, // Pepinillos
            { id: "18", quantity: 1 }, // Catsup
            { id: "21", quantity: 1 } // Kewpie Mayonesa
        ]
    },
    {
        id: "3",
        name: "El Extranjero",
        slug: "el-extranjero",
        description:
            "Hamburguesa de res, en un pan sésamo, queso americano, cebolla amarilla, lechuga, jitomate, pepinillos, ketchup, mayonesa. La base de two guys burgers.",
        price: 135,
        img: "https://res.cloudinary.com/djwkfcjkr/image/upload/v1779599662/el_extranjero_f3xrzu.webp",
        ingredients: [
            { id: "2", quantity: 1 }, // Pan Sésamo
            { id: "3", quantity: 1 }, // Carne
            { id: "13", quantity: 1 }, // Queso Americano
            { id: "17", quantity: 3 }, // Aros de cebolla
            { id: "12", quantity: 2 }, // Tocino
            { id: "22", quantity: 1 }, // BBQ
            { id: "21", quantity: 1 } // Kewpie Mayonesa
        ]
    },
    {
        id: "4",
        name: "La Hula-Hawaiana",
        slug: "la-hula-hawaiana",
        description:
            "Hamburguesa de res, en un pan brioche, un aro de piña, tocino, cebolla morada, lechuga. Para ese sabor tropical exótico.",
        price: 120,
        img: "https://res.cloudinary.com/djwkfcjkr/image/upload/v1779599665/la_hula_hawaiana_raeajk.webp",
        ingredients: [
            { id: "1", quantity: 1 }, // Pan Brioche
            { id: "3", quantity: 1 }, // Carne
            { id: "10", quantity: 1 }, // Piña
            { id: "12", quantity: 1 }, // Tocino
            { id: "8", quantity: 1 }, // Cebolla Morada
            { id: "6", quantity: 1 } // Lechuga
        ]
    },
    {
        id: "5",
        name: "La Burgen't",
        slug: "la-burgent",
        description:
            "Hamburguesa con carne 100% hecho de plantas, en un pan brioche, queso americano, cebolla amarilla, lechuga, jitomate, pepinillos, ketchup, mayonesa. Para nuestros amigos vegetarianos.",
        price: 146,
        img: "https://res.cloudinary.com/djwkfcjkr/image/upload/v1779599664/la_burgent_sfnzji.webp",
        ingredients: [
            { id: "1", quantity: 1 }, // Pan Brioche
            { id: "3", quantity: 1 }, // Carne
            { id: "13", quantity: 1 }, // Queso Americano
            { id: "7", quantity: 1 }, // Cebolla Blanca
            { id: "6", quantity: 1 }, // Lechuga
            { id: "5", quantity: 1 }, // Jitomate
            { id: "11", quantity: 1 }, // Pepinillos
            { id: "18", quantity: 1 }, // Catsup
            { id: "20", quantity: 1 } // Mayonesa
        ]
    },
    {
        id: "6",
        name: "El Volcán",
        slug: "el-volcan",
        description:
            "Hamburguesa de res cargado de nuestra mezcla de especies picosas bañado en salsa picante, en un pan sesamo negro, queso cheddar, jalapeños, cebolla morada, lechuga, jitomate. Para los que buscan una hamburguesa más extremo.",
        price: 155,
        img: "https://res.cloudinary.com/djwkfcjkr/image/upload/v1779599663/el_volcan_jcw7he.webp",
        ingredients: [
            { id: "2", quantity: 1 }, // Pan Sésamo
            { id: "3", quantity: 1 }, // Carne
            { id: "13", quantity: 2 }, // Queso Americano (Cheddar)
            { id: "9", quantity: 5 }, // Jalapeño
            { id: "8", quantity: 1 }, // Cebolla Morada
            { id: "6", quantity: 1 }, // Lechuga
            { id: "5", quantity: 2 }, // Jitomate
            { id: "26", quantity: 2 } // Salsa Picante
        ]
    },
    {
        id: "7",
        name: "La Idea Loca",
        slug: "la-idea-loca",
        description:
            "La Idea Loca: Hamburguesa de res encima de carne de pollo frito, en un pan brioche, con queso manchego y americano, pepinillos, lechuga, jalapeños, chipotle.",
        price: 150,
        img: "https://res.cloudinary.com/djwkfcjkr/image/upload/v1779599665/la_idea_loca_xiz7mh.webp",
        ingredients: [
            { id: "1", quantity: 1 }, // Pan Brioche
            { id: "3", quantity: 1 }, // Carne
            { id: "4", quantity: 1 }, // Pollo
            { id: "13", quantity: 1 }, // Queso Americano
            { id: "14", quantity: 1 }, // Queso Manchego
            { id: "8", quantity: 1 }, // Cebolla Morada
            { id: "6", quantity: 1 }, // Lechuga
            { id: "5", quantity: 1 }, // Jitomate
            { id: "11", quantity: 3 }, // Pepinillos
            { id: "18", quantity: 1 }, // Catsup
            { id: "21", quantity: 1 } // Kewpie Mayonesa
        ]
    },
    {
        id: "8",
        name: "El Calor Nashville",
        slug: "el-calor-nashville",
        description:
            "El Calor Nashville: Hamburguesa de pollo frito hecho con nuestra mezcla de especies picosas, en un pan brioche, con pepinillos, nuestro aderezo especial. Para los que buscan algo diferente y picoso.",
        price: 137,
        img: "https://res.cloudinary.com/djwkfcjkr/image/upload/v1779599662/el_calor_nashvill_s5oe4h.webp",
        ingredients: [
            { id: "1", quantity: 1 }, // Pan Brioche
            { id: "4", quantity: 1 }, // Pollo
            { id: "11", quantity: 3 }, // Pepinillos
            { id: "21", quantity: 1 }, // Mayonesa Kewpie
            { id: "26", quantity: 2 } // Salsa Picante
        ]
    },
    {
        id: "9",
        name: "El Gallo",
        slug: "el-gallo",
        description:
            "Hamburguesa de pollo frito, en un pan brioche, con pepinillos, nuestro aderezo especial. Para los que buscan algo diferente.",
        price: 110,
        img: "https://res.cloudinary.com/djwkfcjkr/image/upload/v1779599663/el_gallo_mcddrt.webp",
        ingredients: [
            { id: "1", quantity: 1 }, // Pan Brioche
            { id: "4", quantity: 1 }, // Pollo
            { id: "11", quantity: 3 }, // Pepinillos
            { id: "20", quantity: 1 } // Mayonesa (Aderezo especial)
        ]
    },
    {
        id: "10",
        name: "La Magnifi-Carne",
        slug: "la-magnifi-carne",
        description:
            "Hamburguesa de queso que tiene otra hamburguesa de queso en su interior, y para el 'pan' se utilizan otras dos hamburguesas de queso, con salsa catsup traída directamente desde el Himalaya. Para los que buscan el sabor del siglo.",
        price: 165,
        img: "https://res.cloudinary.com/djwkfcjkr/image/upload/v1779599667/la_magnifi_carne_1_gb1gow.webp",
        ingredients: [
            { id: "2", quantity: 3 }, // Pan Sésamo
            { id: "3", quantity: 4 }, // Carne
            { id: "13", quantity: 3 }, // Queso Americano
            { id: "18", quantity: 1 } // Catsup
        ]
    }
];

export const compartibles: Recipe[] = [
    {
        id: "11",
        name: "LAS Papas",
        slug: "las-papas",
        description: "Papas a la francesa con sal, pimenta y poquito ajo. Para los que tengan extra hambre.",
        price: 50,
        img: "https://res.cloudinary.com/djwkfcjkr/image/upload/v1779639887/las_papas_kuxqll.webp",
        ingredients: [
            { id: "15", quantity: 1 } // Papas
        ]
    },
    {
        id: "12",
        name: "Las Animales",
        slug: "las-animales",
        description:
            "Papas a la francesa, con queso nacho, carne molida, frijoles, jitomate picada y cebolla guisada. Para los que tengan extra hambre.",
        price: 137,
        img: "https://res.cloudinary.com/djwkfcjkr/image/upload/v1779639887/las_animales_i61vf0.webp",
        ingredients: [
            { id: "15", quantity: 1 }, // Papas
            { id: "13", quantity: 1 }, // Queso Americano
            { id: "3", quantity: 1 }, // Carne
            { id: "5", quantity: 1 }, // Jitomate
            { id: "7", quantity: 1 } // Cebolla Blanca
        ]
    },
    {
        id: "13",
        name: "Las Papotas",
        slug: "las-papotas",
        description: "Papas gajo con, sal, pimenta y queso parmesano. Cuando quieres algo mas abundante.",
        price: 70,
        img: "https://res.cloudinary.com/djwkfcjkr/image/upload/v1779640414/las_papotas_fjob4f.webp",
        ingredients: [
            { id: "16", quantity: 1 } // Papas gajo
        ]
    },
    {
        id: "14",
        name: "Aros de angel",
        slug: "aros-de-angel",
        description:
            "Aros de cebolla con nuestra mezcla especial, acompañado de salsa bbq y aderezo Kewpie. Cuando quieres un poco del cielo en la tierra.",
        price: 70,
        img: "https://res.cloudinary.com/djwkfcjkr/image/upload/v1779639887/aros_de_angel_pzk3oy.webp",
        ingredients: [
            { id: "17", quantity: 1 }, // Aros de cebolla
            { id: "22", quantity: 1 }, // Salsa BBQ
            { id: "21", quantity: 1 } // Aderezo Kewpie
        ]
    },
    {
        id: "15",
        name: "Un Poco de Todo",
        slug: "un-poco-de-todo",
        description: "Una combinación de todo en un solo plato. Para cuando no sabes que pedir.",
        price: 200,
        img: "https://res.cloudinary.com/djwkfcjkr/image/upload/v1779639887/un_poco_de_todo_bvvxv5.webp",
        ingredients: [
            { id: "15", quantity: 1 }, // Papas
            { id: "16", quantity: 1 }, // Papas gajo
            { id: "17", quantity: 1 }, // Aros de cebolla
            { id: "22", quantity: 1 }, // Salsa BBQ
            { id: "21", quantity: 1 }, // Aderezo Kewpie
            { id: "9", quantity: 1 }, // Jalapeños
            { id: "5", quantity: 1 }, // Jitomate
            { id: "7", quantity: 1 } // Cebolla Blanca
        ]
    },
    {
        id: "16",
        name: "Malteada de chocolate",
        slug: "malteada-de-chocolate",
        description:
            "Malteada de chocolate con crema batida y chispas de chocolate. Para los que tienen antojo de algo dulce.",
        price: 70,
        img: "https://res.cloudinary.com/djwkfcjkr/image/upload/v1779640192/choco_milkshake_skbpnu.webp",
        ingredients: [
            { id: "30", quantity: 1 }, // Leche
            { id: "27", quantity: 1 }, // Hielo
            { id: "28", quantity: 1 }, // Crema batida
            { id: "29", quantity: 1 } // Jarabe de chocolate
        ]
    },
    {
        id: "17",
        name: "Soda (CocaCola)",
        slug: "soda-cocacola",
        description: "CocaCola con hielo. Para los que tienen sed.",
        price: 30,
        img: "https://res.cloudinary.com/djwkfcjkr/image/upload/v1779640192/soda_ukkuu7.webp",
        ingredients: [
            { id: "23", quantity: 1 }, // Refresco
            { id: "27", quantity: 1 } // Hielo
        ]
    },
    {
        id: "18",
        name: "Cerveza",
        slug: "cerveza",
        description: "Cerveza de barril con hielo. Increiblemente refrescante.",
        price: 50,
        img: "https://res.cloudinary.com/djwkfcjkr/image/upload/v1779640192/beer_a0g4ns.webp",
        ingredients: [
            { id: "25", quantity: 1 }, // Cerveza
            { id: "27", quantity: 1 } // Hielo
        ]
    },
    {
        id: "19",
        name: "Agua Natural",
        slug: "agua-natural",
        description: "Agua natural con hielo. Para los que tienen sed.",
        price: 25,
        img: "https://res.cloudinary.com/djwkfcjkr/image/upload/v1779643023/water_ifgf55.webp",
        ingredients: [
            { id: "24", quantity: 1 }, // Agua Natural
            { id: "27", quantity: 1 } // Hielo
        ]
    }
];

export const combos: Combo[] = [
    {
        id: "1",
        name: "Los Dos Chicos",
        slug: "los-dos-chicos",
        description:
            "Dos hamburguesas clásicas con tres carnes y 3 quesos, dos ordenes de papotas y dos bebidas. Para los que son two guys con hambre.",
        price: 119,
        img: "https://res.cloudinary.com/djwkfcjkr/image/upload/v1779647291/los_dos_chicos_phdfb1.webp",
        products: [
            { recipeId: "1", amount: 2 }, // La Clásica
            { recipeId: "13", amount: 2 }, // Las Papotas
            { recipeId: "17", amount: 2 } // Soda (cocacola)
        ]
    },
    {
        id: "2",
        name: "Sofisticado",
        slug: "sofisticado",
        description: "La Wagyu, con LAS papas y una bebida o malteada. Para cuando te sientes fino.",
        price: 149,
        img: "https://res.cloudinary.com/djwkfcjkr/image/upload/v1779647288/sofisticado_vloomf.webp",
        products: [
            { recipeId: "2", amount: 1 }, // La Wagyu
            { recipeId: "11", amount: 1 }, // LAS Papas
            { recipeId: "16", amount: 1 } // Malteada
        ]
    },
    {
        id: "3",
        name: "Del Oeste",
        slug: "del-oeste",
        description:
            "El Extranjero con Aros de angel y una cerveza de barril. Para el que viene a cobrar su recompensa.",
        price: 129,
        img: "https://res.cloudinary.com/djwkfcjkr/image/upload/v1779647293/del_oeste_ruzh4d.webp",
        products: [
            { recipeId: "3", amount: 1 }, // El Extranjero
            { recipeId: "14", amount: 1 }, // Aros de angel
            { recipeId: "18", amount: 1 } // Cerveza
        ]
    },
    {
        id: "4",
        name: "Un Poco Loco",
        slug: "un-poco-loco",
        description:
            "La Loca Idea, acompañado de un poco de todo y un refresco de su elección con helado de vainilla. Cuando andas un poco loco.",
        price: 159,
        img: "https://res.cloudinary.com/djwkfcjkr/image/upload/v1779647288/un_poco_loco_ekk4gd.webp",
        products: [
            { recipeId: "7", amount: 1 }, // La Idea Loca
            { recipeId: "15", amount: 1 }, // Un Poco de Todo
            { recipeId: "17", amount: 1 } // Soda (cocacola)
        ]
    },
    {
        id: "5",
        name: "Magnificombo",
        slug: "magnificombo",
        description:
            "Una Magnifi-Carne acompañado de unas papas animales y un refresco de su elección. Para cuando quieres un reto.",
        price: 169,
        img: "https://res.cloudinary.com/djwkfcjkr/image/upload/v1779647289/magnificombo_labtlj.webp",
        products: [
            { recipeId: "10", amount: 1 }, // La Magnifi-Carne
            { recipeId: "12", amount: 1 }, // Las Animales
            { recipeId: "17", amount: 1 } // Soda (cocacola)
        ]
    }
];

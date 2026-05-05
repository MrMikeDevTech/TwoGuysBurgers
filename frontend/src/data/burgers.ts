// src/data/burgers.ts

export interface Burger {
  name: string;
  desc: string;
  price: string;
  emoji: string;
  bg: string; // clase Tailwind para el fondo de la imagen
  badge?: string;
}

export const burgers: Burger[] = [
  {
    name: "The OG Double",
    desc: "Doble carne, cheddar derretido, cebolla caramelizada, salsa especial de la casa",
    price: "$12.900",
    emoji: "🍔",
    bg: "bg-brand-yellow",
    badge: "⭐ #1",
  },
  {
    name: "Spicy Inferno",
    desc: "Jalapeños frescos, sriracha mayo, ghost pepper sauce. No para cobardes.",
    price: "$13.500",
    emoji: "🌶️",
    bg: "bg-brand-teal",
  },
  {
    name: "Green Machine",
    desc: "Medallón de legumbres, aguacate, tomate deshidratado, aioli de hierbas",
    price: "$11.900",
    emoji: "🥬",
    bg: "bg-green-200",
    badge: "VEGGIE",
  },
  {
    name: "Cheesy Maniac",
    desc: "Triple queso: cheddar, gouda ahumado y blue cheese. Para los que lo aman.",
    price: "$14.200",
    emoji: "🧀",
    bg: "bg-purple-100",
  },
  {
    name: "Bacon Overdrive",
    desc: "Crispy bacon x4, BBQ ahumada, cebolla crujiente, pan brioche tostado",
    price: "$15.000",
    emoji: "🥓",
    bg: "bg-brand-orange",
    badge: "NUEVO",
  },
  {
    name: "Mushroom Kingdom",
    desc: "Portobello a la parrilla, queso suizo, rúcula, mostaza dijon, mayonesa trufa",
    price: "$13.200",
    emoji: "🍄",
    bg: "bg-indigo-100",
  },
];

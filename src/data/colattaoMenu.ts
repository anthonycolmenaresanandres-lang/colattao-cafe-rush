// Colattao Coffee House - Digital Menu Data
// Prices and items are best-effort drafts.
// Items marked with `needsConfirmation: true` should be verified with staff.

export interface MenuItem {
  name: string;
  /** null = "ask staff" / market price */
  price: string | null;
  description?: string;
  needsConfirmation?: boolean;
}

export interface MenuCategory {
  id: string;
  title: string;
  /** Shown under the category title */
  note?: string;
  items: MenuItem[];
}

export const menuCategories: MenuCategory[] = [
  {
    id: "espresso",
    title: "Espresso & Coffee",
    items: [
      { name: "House Brew", price: null },
      { name: "Double Shot", price: "$3.95" },
      { name: "Cortado", price: "$5" },
      { name: "Americano", price: "$4.50" },
      { name: "Cappuccino", price: "$5.25" },
      { name: "Latte", price: "$5.50 / $6.50" },
      { name: "Flat White", price: "$5.25" },
      { name: "Mocha", price: "$7" },
    ],
  },
  {
    id: "favorites",
    title: "Favorites",
    items: [
      { name: "Panela Coffee with Milk", price: "$6" },
      { name: "Churro Latte", price: "$8" },
      { name: "Dulce de Coco", price: "$7.50" },
      { name: "Dark Chocolate Habanero", price: "$7.50" },
      { name: "Flan Latte", price: "$8" },
      { name: "Pistachio Macaron", price: "$8" },
      { name: "Coconut Hazelnut", price: "$7.50" },
    ],
  },
  {
    id: "matcha",
    title: "Matcha",
    items: [
      { name: "Pure", price: "$6.75" },
      { name: "Blue", price: "$7.50" },
      { name: "Coconut", price: "$8" },
      { name: "Matchai", price: "$9" },
      { name: "Strawberry Vanilla", price: "$8" },
      { name: "White Mint", price: "$8" },
    ],
  },
  {
    id: "seasonal-drinks",
    title: "Seasonal Drinks",
    items: [
      {
        name: "Coco Beach",
        price: "Ask",
        description: "Toasted coconut, tropical nuts, cold foam",
      },
      {
        name: "Dolce Banana",
        price: "Ask",
        description: "Dulce de leche, banana, cold foam",
      },
      {
        name: "Matcha Lemonade",
        price: "Ask",
        description: "Available flavors: original, strawberry, mango",
      },
      {
        name: "Cinnamon Horchata",
        price: "Ask",
        description: "House made horchata. Add a double shot +$1.50",
      },
    ],
  },
  {
    id: "tea",
    title: "Tea & More",
    items: [
      { name: "Hot Tea", price: "$4.95 / $7" },
      { name: "Chai", price: "$6.75" },
      { name: "Hot Chocolate", price: "$4.50 / $5.50" },
      { name: "Affogato", price: "$8" },
    ],
  },
  {
    id: "cocina",
    title: "Kitchen",
    items: [
      { name: "Bacon Egg & Cheese", price: "$8.60" },
      { name: "California Sandwich", price: "$9.72" },
      { name: "Cubano", price: "$12" },
      { name: "Chicken Apricot", price: "$10" },
      { name: "Montecristo", price: "$8.72" },
      { name: "Pesto Mozzarella", price: "$7.22" },
      { name: "Ham & Cheesy", price: "$7.62" },
      { name: "Turkey Egg & Swiss", price: "$8.60" },
    ],
  },
  {
    id: "pastries",
    title: "Pastries & Sweets",
    note: "Ask staff for today's selection",
    items: [
      { name: "Babka", price: "$3.75", needsConfirmation: true },
      { name: "Danish, Cherry / Lemon", price: "$3.95", needsConfirmation: true },
      { name: "Chocolate Croissant", price: "$3.95", needsConfirmation: true },
      { name: "Pan de Bono", price: "$2.25", needsConfirmation: true },
      { name: "Cookies", price: "$3.50", needsConfirmation: true },
      { name: "Empanadas, Chicken / Beef", price: "$4.50", needsConfirmation: true },
      { name: "Cruffin", price: "$6.50", needsConfirmation: true },
      { name: "Lemon Blueberry Mascarpone", price: "$8.50", needsConfirmation: true },
      { name: "Royal Cheesecake", price: "$4", needsConfirmation: true },
      { name: "Almond Croissant", price: null, needsConfirmation: true },
    ],
  },
];

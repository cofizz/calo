// Built-in food database — no external API, no keys, works offline & instantly.
//
// Each food has per-100g macros and (for countable foods) the weight of "one".
// That lets us understand natural quantities:
//   "4 eggs"            -> 4 x 50g  = 200g egg
//   "2 slices bread"    -> 2 x 28g  = 56g bread
//   "200g chicken"      -> 200g chicken breast
//   "banana"            -> 1 x 118g = 118g banana
//
// To add a food, just append an entry below.

export type LocalFood = {
  display: string; // nice name shown to the user
  keywords: string[]; // lowercase singular match terms (most specific first)
  per100: { cal: number; p: number; c: number; f: number }; // per 100 g
  portionGrams?: number; // weight of "one" for countable foods
};

export const FOODS: LocalFood[] = [
  // --- Eggs & proteins ---
  { display: "Egg", keywords: ["egg", "eggs", "jaje", "jaja"], per100: { cal: 143, p: 12.6, c: 0.7, f: 9.5 }, portionGrams: 50 },
  { display: "Egg white", keywords: ["egg white", "egg whites"], per100: { cal: 52, p: 11, c: 0.7, f: 0.2 }, portionGrams: 33 },
  { display: "Chicken breast", keywords: ["chicken breast", "chicken", "piletina", "pile", "pileća prsa", "pilece prsa", "piletinu"], per100: { cal: 165, p: 31, c: 0, f: 3.6 } },
  { display: "Chicken thigh", keywords: ["chicken thigh", "pileći batak", "pileci batak", "batak"], per100: { cal: 209, p: 26, c: 0, f: 10.9 } },
  { display: "Ground beef", keywords: ["ground beef", "minced beef", "beef mince", "mince", "mleveno meso", "mleveno"], per100: { cal: 250, p: 26, c: 0, f: 15 } },
  { display: "Steak", keywords: ["steak", "beef", "biftek", "govedina", "šnicla", "snicla"], per100: { cal: 271, p: 25, c: 0, f: 19 } },
  { display: "Pork chop", keywords: ["pork chop", "pork", "svinjetina", "svinjski", "svinjsko"], per100: { cal: 231, p: 26, c: 0, f: 14 } },
  { display: "Bacon", keywords: ["bacon", "slanina"], per100: { cal: 541, p: 37, c: 1.4, f: 42 }, portionGrams: 8 },
  { display: "Salmon", keywords: ["salmon", "losos"], per100: { cal: 208, p: 20, c: 0, f: 13 } },
  { display: "Tuna (canned)", keywords: ["tuna", "tunjevina", "tuna"], per100: { cal: 116, p: 26, c: 0, f: 1 } },
  { display: "Shrimp", keywords: ["shrimp", "prawns", "prawn", "škampi", "skampi", "gambori"], per100: { cal: 99, p: 24, c: 0.2, f: 0.3 } },
  { display: "Turkey breast", keywords: ["turkey breast", "turkey", "ćuretina", "curetina", "ćureća prsa"], per100: { cal: 135, p: 30, c: 0, f: 1 } },
  { display: "Ham", keywords: ["ham", "šunka", "sunka"], per100: { cal: 145, p: 18, c: 1.5, f: 7 }, portionGrams: 28 },
  { display: "Tofu", keywords: ["tofu", "tofu"], per100: { cal: 76, p: 8, c: 1.9, f: 4.8 } },

  // --- Grains & carbs ---
  { display: "White rice (cooked)", keywords: ["white rice", "rice", "pirinač", "pirinac", "riža", "riza"], per100: { cal: 130, p: 2.7, c: 28, f: 0.3 } },
  { display: "Brown rice (cooked)", keywords: ["brown rice", "integralni pirinač", "braon pirinač"], per100: { cal: 123, p: 2.7, c: 26, f: 1 } },
  { display: "Pasta (cooked)", keywords: ["pasta", "spaghetti", "noodles", "testenina", "makarone", "špagete", "spagete", "pasta"], per100: { cal: 158, p: 6, c: 31, f: 0.9 } },
  { display: "White bread", keywords: ["white bread", "bread", "hleb", "beli hleb", "hleba", "vekna"], per100: { cal: 265, p: 9, c: 49, f: 3.2 }, portionGrams: 28 },
  { display: "Whole wheat bread", keywords: ["whole wheat bread", "wholewheat bread", "brown bread", "wheat bread", "integralni hleb", "crni hleb", "ražani hleb"], per100: { cal: 247, p: 13, c: 41, f: 3.4 }, portionGrams: 28 },
  { display: "Oats (dry)", keywords: ["oats", "oatmeal", "porridge", "ovsene pahuljice", "ovas", "zobene pahuljice", "ovsena kaša"], per100: { cal: 389, p: 17, c: 66, f: 7 }, portionGrams: 40 },
  { display: "Potato", keywords: ["potato", "potatoes", "krompir", "krompira"], per100: { cal: 87, p: 1.9, c: 20, f: 0.1 }, portionGrams: 150 },
  { display: "Sweet potato", keywords: ["sweet potato", "batat", "slatki krompir"], per100: { cal: 90, p: 2, c: 21, f: 0.1 }, portionGrams: 130 },
  { display: "Bagel", keywords: ["bagel"], per100: { cal: 250, p: 10, c: 49, f: 1.5 }, portionGrams: 100 },
  { display: "Tortilla", keywords: ["tortilla", "wrap"], per100: { cal: 310, p: 8, c: 50, f: 8 }, portionGrams: 45 },
  { display: "Corn flakes", keywords: ["corn flakes", "cornflakes", "cereal"], per100: { cal: 357, p: 7, c: 84, f: 0.4 }, portionGrams: 30 },

  // --- Fruits ---
  { display: "Banana", keywords: ["banana", "bananas", "banana", "banane", "bananu"], per100: { cal: 89, p: 1.1, c: 23, f: 0.3 }, portionGrams: 118 },
  { display: "Apple", keywords: ["apple", "apples", "jabuka", "jabuke", "jabuku"], per100: { cal: 52, p: 0.3, c: 14, f: 0.2 }, portionGrams: 182 },
  { display: "Orange", keywords: ["orange", "oranges", "pomorandža", "pomorandza", "narandža", "narandza"], per100: { cal: 47, p: 0.9, c: 12, f: 0.1 }, portionGrams: 131 },
  { display: "Strawberries", keywords: ["strawberries", "strawberry", "jagoda", "jagode"], per100: { cal: 32, p: 0.7, c: 7.7, f: 0.3 } },
  { display: "Blueberries", keywords: ["blueberries", "blueberry", "borovnica", "borovnice"], per100: { cal: 57, p: 0.7, c: 14, f: 0.3 } },
  { display: "Grapes", keywords: ["grapes", "grape", "grožđe", "grozdje"], per100: { cal: 69, p: 0.7, c: 18, f: 0.2 } },
  { display: "Avocado", keywords: ["avocado", "avocados", "avokado"], per100: { cal: 160, p: 2, c: 9, f: 15 }, portionGrams: 150 },
  { display: "Mango", keywords: ["mango", "mangoes"], per100: { cal: 60, p: 0.8, c: 15, f: 0.4 }, portionGrams: 200 },

  // --- Dairy ---
  { display: "Whole milk", keywords: ["whole milk", "milk", "mleko", "punomasno mleko", "mleka"], per100: { cal: 61, p: 3.2, c: 4.8, f: 3.3 }, portionGrams: 244 },
  { display: "Skim milk", keywords: ["skim milk", "skimmed milk", "obrano mleko"], per100: { cal: 34, p: 3.4, c: 5, f: 0.1 }, portionGrams: 244 },
  { display: "Greek yogurt", keywords: ["greek yogurt", "greek yoghurt", "grčki jogurt", "grcki jogurt"], per100: { cal: 59, p: 10, c: 3.6, f: 0.4 }, portionGrams: 170 },
  { display: "Yogurt", keywords: ["yogurt", "yoghurt", "jogurt", "kiselo mleko"], per100: { cal: 61, p: 3.5, c: 4.7, f: 3.3 }, portionGrams: 170 },
  { display: "Cheddar cheese", keywords: ["cheddar", "cheese", "sir", "kačkavalj", "kackavalj"], per100: { cal: 403, p: 25, c: 1.3, f: 33 }, portionGrams: 28 },
  { display: "Mozzarella", keywords: ["mozzarella", "mocarela"], per100: { cal: 280, p: 28, c: 3.1, f: 17 }, portionGrams: 28 },
  { display: "Cottage cheese", keywords: ["cottage cheese", "mladi sir", "svježi sir", "urda"], per100: { cal: 98, p: 11, c: 3.4, f: 4.3 } },
  { display: "Butter", keywords: ["butter", "puter", "maslac"], per100: { cal: 717, p: 0.9, c: 0.1, f: 81 }, portionGrams: 14 },

  // --- Nuts & fats ---
  { display: "Almonds", keywords: ["almonds", "almond", "badem", "bademi", "bademe"], per100: { cal: 579, p: 21, c: 22, f: 50 }, portionGrams: 28 },
  { display: "Peanuts", keywords: ["peanuts", "peanut", "kikiriki"], per100: { cal: 567, p: 26, c: 16, f: 49 }, portionGrams: 28 },
  { display: "Peanut butter", keywords: ["peanut butter", "puter od kikirikija", "kikiriki puter"], per100: { cal: 588, p: 25, c: 20, f: 50 }, portionGrams: 16 },
  { display: "Walnuts", keywords: ["walnuts", "walnut", "orah", "orasi", "orahe"], per100: { cal: 654, p: 15, c: 14, f: 65 }, portionGrams: 28 },
  { display: "Cashews", keywords: ["cashews", "cashew"], per100: { cal: 553, p: 18, c: 30, f: 44 }, portionGrams: 28 },
  { display: "Olive oil", keywords: ["olive oil", "oil", "maslinovo ulje", "ulje", "zejtin"], per100: { cal: 884, p: 0, c: 0, f: 100 }, portionGrams: 14 },

  // --- Vegetables ---
  { display: "Broccoli", keywords: ["broccoli", "brokoli"], per100: { cal: 35, p: 2.4, c: 7, f: 0.4 } },
  { display: "Spinach", keywords: ["spinach", "spanać", "spanac"], per100: { cal: 23, p: 2.9, c: 3.6, f: 0.4 } },
  { display: "Carrot", keywords: ["carrot", "carrots", "šargarepa", "sargarepa", "mrkva"], per100: { cal: 41, p: 0.9, c: 10, f: 0.2 }, portionGrams: 61 },
  { display: "Tomato", keywords: ["tomato", "tomatoes", "paradajz", "paradajza"], per100: { cal: 18, p: 0.9, c: 3.9, f: 0.2 }, portionGrams: 123 },
  { display: "Cucumber", keywords: ["cucumber", "krastavac", "krastavci"], per100: { cal: 15, p: 0.7, c: 3.6, f: 0.1 } },
  { display: "Onion", keywords: ["onion", "onions", "crni luk", "luk", "glavica luka"], per100: { cal: 40, p: 1.1, c: 9, f: 0.1 } },
  { display: "Bell pepper", keywords: ["bell pepper", "pepper", "capsicum", "paprika", "babura"], per100: { cal: 31, p: 1, c: 6, f: 0.3 }, portionGrams: 119 },
  { display: "Corn", keywords: ["corn", "sweetcorn", "kukuruz", "šećerac"], per100: { cal: 96, p: 3.4, c: 21, f: 1.5 } },

  // --- Meals, snacks & drinks ---
  { display: "Pizza", keywords: ["pizza", "pica"], per100: { cal: 266, p: 11, c: 33, f: 10 }, portionGrams: 107 },
  { display: "Hamburger", keywords: ["hamburger", "burger", "cheeseburger", "hamburger", "pljeskavica u lepinji"], per100: { cal: 295, p: 17, c: 24, f: 14 }, portionGrams: 150 },
  { display: "French fries", keywords: ["french fries", "fries", "chips", "pomfrit", "pržen krompir"], per100: { cal: 312, p: 3.4, c: 41, f: 15 }, portionGrams: 117 },
  { display: "Milk chocolate", keywords: ["chocolate", "milk chocolate", "čokolada", "cokolada", "mlečna čokolada"], per100: { cal: 535, p: 7.6, c: 59, f: 30 }, portionGrams: 45 },
  { display: "Ice cream", keywords: ["ice cream", "icecream", "sladoled"], per100: { cal: 207, p: 3.5, c: 24, f: 11 }, portionGrams: 66 },
  { display: "Whey protein", keywords: ["whey", "protein powder", "protein shake", "whey protein", "protein", "vej protein", "proteinski šejk"], per100: { cal: 400, p: 80, c: 8, f: 7 }, portionGrams: 30 },
  { display: "Orange juice", keywords: ["orange juice", "oj", "sok od pomorandže", "ceđena pomorandža"], per100: { cal: 45, p: 0.7, c: 10, f: 0.2 }, portionGrams: 248 },
  { display: "Coca-Cola", keywords: ["coke", "cola", "coca-cola", "soda", "kola", "koka kola", "gazirani sok"], per100: { cal: 42, p: 0, c: 11, f: 0 }, portionGrams: 330 },
  { display: "Beer", keywords: ["beer", "pivo"], per100: { cal: 43, p: 0.5, c: 3.6, f: 0 }, portionGrams: 355 },
  { display: "Coffee (black)", keywords: ["coffee", "espresso", "kafa", "espreso", "kafu"], per100: { cal: 1, p: 0.1, c: 0, f: 0 }, portionGrams: 240 },

  // === Big expansion ===

  // --- More meats, poultry & fish ---
  { display: "Cod", keywords: ["cod"], per100: { cal: 82, p: 18, c: 0, f: 0.7 } },
  { display: "Tilapia", keywords: ["tilapia"], per100: { cal: 128, p: 26, c: 0, f: 2.7 } },
  { display: "Sardines", keywords: ["sardines", "sardine"], per100: { cal: 208, p: 25, c: 0, f: 11 } },
  { display: "Mackerel", keywords: ["mackerel"], per100: { cal: 205, p: 19, c: 0, f: 14 } },
  { display: "Crab", keywords: ["crab"], per100: { cal: 97, p: 19, c: 0, f: 1.5 } },
  { display: "Lobster", keywords: ["lobster"], per100: { cal: 89, p: 19, c: 0, f: 0.9 } },
  { display: "Lamb", keywords: ["lamb"], per100: { cal: 294, p: 25, c: 0, f: 21 } },
  { display: "Duck", keywords: ["duck"], per100: { cal: 337, p: 19, c: 0, f: 28 } },
  { display: "Chicken wing", keywords: ["chicken wing", "wings", "wing"], per100: { cal: 203, p: 30, c: 0, f: 8.1 }, portionGrams: 34 },
  { display: "Chicken nugget", keywords: ["chicken nugget", "nuggets", "nugget"], per100: { cal: 296, p: 15, c: 16, f: 19 }, portionGrams: 16 },
  { display: "Sausage", keywords: ["sausage", "sausages", "kobasica", "viršla", "virsla"], per100: { cal: 301, p: 12, c: 1.5, f: 27 }, portionGrams: 75 },
  { display: "Hot dog", keywords: ["hot dog", "hotdog", "frankfurter", "hot dog", "viršla u lepinji"], per100: { cal: 290, p: 10, c: 4, f: 26 }, portionGrams: 50 },
  { display: "Meatball", keywords: ["meatball", "meatballs"], per100: { cal: 197, p: 14, c: 6, f: 13 }, portionGrams: 30 },
  { display: "Beef jerky", keywords: ["beef jerky", "jerky"], per100: { cal: 410, p: 33, c: 11, f: 26 }, portionGrams: 28 },
  { display: "Prosciutto", keywords: ["prosciutto"], per100: { cal: 220, p: 23, c: 0.3, f: 14 }, portionGrams: 20 },
  { display: "Salami", keywords: ["salami"], per100: { cal: 336, p: 22, c: 2.4, f: 26 }, portionGrams: 10 },
  { display: "Pepperoni", keywords: ["pepperoni"], per100: { cal: 504, p: 20, c: 1.2, f: 46 }, portionGrams: 5 },

  // --- Legumes & plant protein ---
  { display: "Lentils (cooked)", keywords: ["lentils", "lentil", "sočivo", "socivo"], per100: { cal: 116, p: 9, c: 20, f: 0.4 } },
  { display: "Chickpeas (cooked)", keywords: ["chickpeas", "chickpea", "garbanzo", "leblebija", "naut"], per100: { cal: 164, p: 9, c: 27, f: 2.6 } },
  { display: "Black beans (cooked)", keywords: ["black beans", "black bean"], per100: { cal: 132, p: 9, c: 24, f: 0.5 } },
  { display: "Kidney beans (cooked)", keywords: ["kidney beans", "kidney bean", "beans", "pasulj", "grah", "boranija"], per100: { cal: 127, p: 9, c: 23, f: 0.5 } },
  { display: "Baked beans", keywords: ["baked beans"], per100: { cal: 94, p: 5, c: 16, f: 0.6 } },
  { display: "Edamame", keywords: ["edamame"], per100: { cal: 122, p: 11, c: 10, f: 5 } },
  { display: "Peas", keywords: ["peas", "green peas"], per100: { cal: 81, p: 5, c: 14, f: 0.4 } },
  { display: "Hummus", keywords: ["hummus"], per100: { cal: 166, p: 8, c: 14, f: 10 }, portionGrams: 30 },
  { display: "Tempeh", keywords: ["tempeh"], per100: { cal: 192, p: 20, c: 8, f: 11 } },

  // --- More grains & starches ---
  { display: "Quinoa (cooked)", keywords: ["quinoa"], per100: { cal: 120, p: 4.4, c: 21, f: 1.9 } },
  { display: "Couscous (cooked)", keywords: ["couscous"], per100: { cal: 112, p: 3.8, c: 23, f: 0.2 } },
  { display: "Ramen (cooked)", keywords: ["ramen", "instant noodles"], per100: { cal: 188, p: 5, c: 27, f: 7 } },
  { display: "Rice cake", keywords: ["rice cake", "rice cakes"], per100: { cal: 387, p: 8, c: 82, f: 2.8 }, portionGrams: 9 },
  { display: "Cracker", keywords: ["cracker", "crackers"], per100: { cal: 502, p: 9, c: 61, f: 25 }, portionGrams: 3 },
  { display: "Pancake", keywords: ["pancake", "pancakes", "palačinka", "palacinka", "palačinke"], per100: { cal: 227, p: 6, c: 28, f: 9 }, portionGrams: 38 },
  { display: "Waffle", keywords: ["waffle", "waffles"], per100: { cal: 291, p: 8, c: 33, f: 14 }, portionGrams: 75 },
  { display: "Croissant", keywords: ["croissant"], per100: { cal: 406, p: 8, c: 46, f: 21 }, portionGrams: 57 },
  { display: "Muffin", keywords: ["muffin"], per100: { cal: 377, p: 5, c: 55, f: 15 }, portionGrams: 113 },
  { display: "Donut", keywords: ["donut", "doughnut"], per100: { cal: 452, p: 5, c: 51, f: 25 }, portionGrams: 60 },
  { display: "Granola", keywords: ["granola"], per100: { cal: 471, p: 10, c: 64, f: 20 }, portionGrams: 60 },
  { display: "Pita bread", keywords: ["pita", "pita bread"], per100: { cal: 275, p: 9, c: 56, f: 1.2 }, portionGrams: 60 },
  { display: "Naan", keywords: ["naan"], per100: { cal: 310, p: 9, c: 50, f: 8 }, portionGrams: 90 },
  { display: "Pretzel", keywords: ["pretzel", "pretzels"], per100: { cal: 380, p: 10, c: 80, f: 3 }, portionGrams: 30 },
  { display: "Popcorn", keywords: ["popcorn"], per100: { cal: 387, p: 13, c: 78, f: 4.5 }, portionGrams: 8 },
  { display: "Mashed potato", keywords: ["mashed potato", "mashed potatoes", "mash"], per100: { cal: 113, p: 1.9, c: 17, f: 4.2 } },
  { display: "Hash browns", keywords: ["hash browns", "hash brown"], per100: { cal: 265, p: 3, c: 28, f: 16 }, portionGrams: 60 },

  // --- More dairy & alternatives ---
  { display: "Cream cheese", keywords: ["cream cheese"], per100: { cal: 342, p: 6, c: 4, f: 34 }, portionGrams: 15 },
  { display: "Feta", keywords: ["feta"], per100: { cal: 264, p: 14, c: 4, f: 21 }, portionGrams: 28 },
  { display: "Parmesan", keywords: ["parmesan", "parmigiano"], per100: { cal: 431, p: 38, c: 4, f: 29 }, portionGrams: 5 },
  { display: "Sour cream", keywords: ["sour cream"], per100: { cal: 198, p: 2.4, c: 4.6, f: 19 }, portionGrams: 12 },
  { display: "Heavy cream", keywords: ["heavy cream", "double cream"], per100: { cal: 340, p: 2.8, c: 2.8, f: 36 }, portionGrams: 15 },
  { display: "Almond milk", keywords: ["almond milk"], per100: { cal: 17, p: 0.6, c: 0.6, f: 1.2 }, portionGrams: 240 },
  { display: "Soy milk", keywords: ["soy milk", "soya milk"], per100: { cal: 54, p: 3.3, c: 6, f: 1.8 }, portionGrams: 240 },
  { display: "Oat milk", keywords: ["oat milk"], per100: { cal: 47, p: 1, c: 7, f: 1.5 }, portionGrams: 240 },

  // --- More fruits ---
  { display: "Pineapple", keywords: ["pineapple"], per100: { cal: 50, p: 0.5, c: 13, f: 0.1 } },
  { display: "Watermelon", keywords: ["watermelon"], per100: { cal: 30, p: 0.6, c: 8, f: 0.2 } },
  { display: "Peach", keywords: ["peach", "peaches"], per100: { cal: 39, p: 0.9, c: 10, f: 0.3 }, portionGrams: 150 },
  { display: "Pear", keywords: ["pear", "pears"], per100: { cal: 57, p: 0.4, c: 15, f: 0.1 }, portionGrams: 178 },
  { display: "Grapefruit", keywords: ["grapefruit"], per100: { cal: 42, p: 0.8, c: 11, f: 0.1 }, portionGrams: 123 },
  { display: "Kiwi", keywords: ["kiwi"], per100: { cal: 61, p: 1.1, c: 15, f: 0.5 }, portionGrams: 69 },
  { display: "Cherries", keywords: ["cherries", "cherry"], per100: { cal: 63, p: 1.1, c: 16, f: 0.2 } },
  { display: "Raspberries", keywords: ["raspberries", "raspberry"], per100: { cal: 52, p: 1.2, c: 12, f: 0.7 } },
  { display: "Plum", keywords: ["plum", "plums"], per100: { cal: 46, p: 0.7, c: 11, f: 0.3 }, portionGrams: 66 },
  { display: "Dates", keywords: ["dates", "date"], per100: { cal: 282, p: 2.5, c: 75, f: 0.4 }, portionGrams: 24 },
  { display: "Raisins", keywords: ["raisins"], per100: { cal: 299, p: 3.1, c: 79, f: 0.5 }, portionGrams: 43 },
  { display: "Lemon", keywords: ["lemon"], per100: { cal: 29, p: 1.1, c: 9, f: 0.3 }, portionGrams: 58 },
  { display: "Coconut", keywords: ["coconut"], per100: { cal: 354, p: 3.3, c: 15, f: 33 } },

  // --- More vegetables ---
  { display: "Lettuce", keywords: ["lettuce", "zelena salata", "salata"], per100: { cal: 15, p: 1.4, c: 2.9, f: 0.2 } },
  { display: "Cauliflower", keywords: ["cauliflower"], per100: { cal: 25, p: 1.9, c: 5, f: 0.3 } },
  { display: "Mushroom", keywords: ["mushroom", "mushrooms", "pečurka", "pecurka", "gljive", "šampinjoni"], per100: { cal: 22, p: 3.1, c: 3.3, f: 0.3 } },
  { display: "Zucchini", keywords: ["zucchini", "courgette"], per100: { cal: 17, p: 1.2, c: 3.1, f: 0.3 } },
  { display: "Eggplant", keywords: ["eggplant", "aubergine"], per100: { cal: 25, p: 1, c: 6, f: 0.2 } },
  { display: "Green beans", keywords: ["green beans"], per100: { cal: 31, p: 1.8, c: 7, f: 0.2 } },
  { display: "Asparagus", keywords: ["asparagus"], per100: { cal: 20, p: 2.2, c: 3.9, f: 0.1 } },
  { display: "Cabbage", keywords: ["cabbage", "kupus"], per100: { cal: 25, p: 1.3, c: 6, f: 0.1 } },
  { display: "Kale", keywords: ["kale"], per100: { cal: 49, p: 4.3, c: 9, f: 0.9 } },
  { display: "Celery", keywords: ["celery"], per100: { cal: 16, p: 0.7, c: 3, f: 0.2 }, portionGrams: 40 },
  { display: "Garlic", keywords: ["garlic", "beli luk", "češanj"], per100: { cal: 149, p: 6.4, c: 33, f: 0.5 }, portionGrams: 3 },
  { display: "Beetroot", keywords: ["beetroot", "beet"], per100: { cal: 43, p: 1.6, c: 10, f: 0.2 } },
  { display: "Olives", keywords: ["olives", "olive"], per100: { cal: 115, p: 0.8, c: 6, f: 11 }, portionGrams: 4 },
  { display: "Pumpkin", keywords: ["pumpkin"], per100: { cal: 26, p: 1, c: 6.5, f: 0.1 } },

  // --- More nuts, seeds & spreads ---
  { display: "Pistachios", keywords: ["pistachios", "pistachio"], per100: { cal: 562, p: 20, c: 28, f: 45 }, portionGrams: 28 },
  { display: "Pecans", keywords: ["pecans", "pecan"], per100: { cal: 691, p: 9, c: 14, f: 72 }, portionGrams: 28 },
  { display: "Sunflower seeds", keywords: ["sunflower seeds"], per100: { cal: 584, p: 21, c: 20, f: 51 }, portionGrams: 28 },
  { display: "Pumpkin seeds", keywords: ["pumpkin seeds"], per100: { cal: 559, p: 30, c: 11, f: 49 }, portionGrams: 28 },
  { display: "Chia seeds", keywords: ["chia seeds", "chia"], per100: { cal: 486, p: 17, c: 42, f: 31 }, portionGrams: 12 },
  { display: "Flax seeds", keywords: ["flax seeds", "flaxseed", "flax"], per100: { cal: 534, p: 18, c: 29, f: 42 }, portionGrams: 10 },
  { display: "Almond butter", keywords: ["almond butter"], per100: { cal: 614, p: 21, c: 19, f: 56 }, portionGrams: 16 },
  { display: "Nutella", keywords: ["nutella"], per100: { cal: 539, p: 6, c: 58, f: 31 }, portionGrams: 19 },

  // --- Snacks & sweets ---
  { display: "Potato chips", keywords: ["potato chips", "crisps"], per100: { cal: 536, p: 7, c: 53, f: 35 }, portionGrams: 28 },
  { display: "Cookie", keywords: ["cookie", "cookies", "keks", "kolačić"], per100: { cal: 488, p: 5, c: 64, f: 24 }, portionGrams: 16 },
  { display: "Brownie", keywords: ["brownie", "brownies"], per100: { cal: 466, p: 6, c: 50, f: 28 }, portionGrams: 56 },
  { display: "Cake", keywords: ["cake", "torta", "kolač", "kolac"], per100: { cal: 371, p: 5, c: 50, f: 17 }, portionGrams: 80 },
  { display: "Cheesecake", keywords: ["cheesecake"], per100: { cal: 321, p: 6, c: 26, f: 22 }, portionGrams: 80 },
  { display: "Candy bar", keywords: ["candy bar", "snickers", "chocolate bar"], per100: { cal: 491, p: 8, c: 60, f: 24 }, portionGrams: 52 },
  { display: "Gummy candy", keywords: ["gummy", "gummies", "candy"], per100: { cal: 396, p: 0, c: 98, f: 0 }, portionGrams: 40 },
  { display: "Granola bar", keywords: ["granola bar"], per100: { cal: 471, p: 8, c: 64, f: 20 }, portionGrams: 40 },
  { display: "Protein bar", keywords: ["protein bar"], per100: { cal: 360, p: 30, c: 35, f: 12 }, portionGrams: 60 },
  { display: "Trail mix", keywords: ["trail mix"], per100: { cal: 462, p: 14, c: 45, f: 29 }, portionGrams: 28 },
  { display: "Honey", keywords: ["honey", "med"], per100: { cal: 304, p: 0.3, c: 82, f: 0 }, portionGrams: 21 },
  { display: "Jam", keywords: ["jam", "jelly"], per100: { cal: 250, p: 0.4, c: 65, f: 0.1 }, portionGrams: 20 },
  { display: "Maple syrup", keywords: ["maple syrup", "syrup"], per100: { cal: 260, p: 0, c: 67, f: 0.1 }, portionGrams: 20 },
  { display: "Sugar", keywords: ["sugar", "šećer", "secer"], per100: { cal: 387, p: 0, c: 100, f: 0 }, portionGrams: 4 },

  // --- Condiments, sauces & oils ---
  { display: "Ketchup", keywords: ["ketchup"], per100: { cal: 101, p: 1.7, c: 27, f: 0.1 }, portionGrams: 17 },
  { display: "Mayonnaise", keywords: ["mayonnaise", "mayo"], per100: { cal: 680, p: 1, c: 0.6, f: 75 }, portionGrams: 14 },
  { display: "Mustard", keywords: ["mustard"], per100: { cal: 66, p: 4, c: 6, f: 3.3 }, portionGrams: 5 },
  { display: "Soy sauce", keywords: ["soy sauce"], per100: { cal: 53, p: 8, c: 5, f: 0.6 }, portionGrams: 16 },
  { display: "BBQ sauce", keywords: ["bbq sauce", "barbecue sauce"], per100: { cal: 172, p: 0.8, c: 41, f: 0.6 }, portionGrams: 17 },
  { display: "Ranch dressing", keywords: ["ranch", "ranch dressing"], per100: { cal: 430, p: 1, c: 6, f: 45 }, portionGrams: 30 },
  { display: "Salsa", keywords: ["salsa"], per100: { cal: 36, p: 1.5, c: 7, f: 0.2 }, portionGrams: 30 },
  { display: "Pesto", keywords: ["pesto"], per100: { cal: 418, p: 5, c: 6, f: 42 }, portionGrams: 16 },
  { display: "Marinara sauce", keywords: ["marinara", "tomato sauce", "pasta sauce"], per100: { cal: 64, p: 1.6, c: 10, f: 1.8 } },
  { display: "Coconut oil", keywords: ["coconut oil"], per100: { cal: 892, p: 0, c: 0, f: 100 }, portionGrams: 14 },

  // --- Meals, fast food & dishes ---
  { display: "Sandwich", keywords: ["sandwich"], per100: { cal: 250, p: 11, c: 30, f: 9 }, portionGrams: 150 },
  { display: "Burrito", keywords: ["burrito"], per100: { cal: 206, p: 8, c: 28, f: 7 }, portionGrams: 250 },
  { display: "Taco", keywords: ["taco", "tacos"], per100: { cal: 226, p: 9, c: 20, f: 12 }, portionGrams: 100 },
  { display: "Quesadilla", keywords: ["quesadilla"], per100: { cal: 270, p: 12, c: 24, f: 14 }, portionGrams: 150 },
  { display: "Sushi", keywords: ["sushi", "sushi roll", "maki"], per100: { cal: 145, p: 5, c: 30, f: 0.5 }, portionGrams: 30 },
  { display: "Fried rice", keywords: ["fried rice"], per100: { cal: 163, p: 4, c: 25, f: 5 } },
  { display: "Lasagna", keywords: ["lasagna", "lasagne"], per100: { cal: 132, p: 8, c: 11, f: 6 } },
  { display: "Mac and cheese", keywords: ["mac and cheese", "macaroni cheese"], per100: { cal: 164, p: 6, c: 20, f: 6.6 } },
  { display: "Chicken curry", keywords: ["chicken curry", "curry"], per100: { cal: 130, p: 9, c: 6, f: 8 } },
  { display: "Pad thai", keywords: ["pad thai"], per100: { cal: 137, p: 6, c: 20, f: 4 } },
  { display: "Soup", keywords: ["soup", "chicken noodle soup"], per100: { cal: 36, p: 2, c: 4, f: 1 }, portionGrams: 245 },
  { display: "Caesar salad", keywords: ["caesar salad"], per100: { cal: 190, p: 5, c: 8, f: 16 } },
  { display: "Greek salad", keywords: ["greek salad"], per100: { cal: 110, p: 3, c: 6, f: 9 } },
  { display: "Omelette", keywords: ["omelette", "omelet"], per100: { cal: 154, p: 11, c: 1, f: 12 }, portionGrams: 120 },
  { display: "Scrambled eggs", keywords: ["scrambled eggs"], per100: { cal: 149, p: 10, c: 1.6, f: 11 } },
  { display: "Spring roll", keywords: ["spring roll", "spring rolls"], per100: { cal: 154, p: 4, c: 20, f: 6 }, portionGrams: 60 },
  { display: "Dumpling", keywords: ["dumpling", "dumplings", "gyoza"], per100: { cal: 155, p: 6, c: 22, f: 5 }, portionGrams: 30 },
  { display: "Falafel", keywords: ["falafel"], per100: { cal: 333, p: 13, c: 32, f: 18 }, portionGrams: 17 },
  { display: "Shawarma", keywords: ["shawarma", "doner", "kebab"], per100: { cal: 200, p: 15, c: 12, f: 10 }, portionGrams: 250 },

  // --- More drinks ---
  { display: "Water", keywords: ["water", "voda", "vode", "vodu"], per100: { cal: 0, p: 0, c: 0, f: 0 }, portionGrams: 240 },
  { display: "Tea", keywords: ["tea", "čaj", "caj"], per100: { cal: 1, p: 0, c: 0.3, f: 0 }, portionGrams: 240 },
  { display: "Latte", keywords: ["latte"], per100: { cal: 63, p: 3.4, c: 5, f: 3.3 }, portionGrams: 240 },
  { display: "Cappuccino", keywords: ["cappuccino"], per100: { cal: 36, p: 2, c: 3, f: 1.8 }, portionGrams: 180 },
  { display: "Hot chocolate", keywords: ["hot chocolate"], per100: { cal: 77, p: 3.5, c: 11, f: 2.3 }, portionGrams: 240 },
  { display: "Milkshake", keywords: ["milkshake", "shake"], per100: { cal: 112, p: 3, c: 18, f: 3 }, portionGrams: 300 },
  { display: "Smoothie", keywords: ["smoothie"], per100: { cal: 60, p: 1, c: 14, f: 0.5 }, portionGrams: 300 },
  { display: "Apple juice", keywords: ["apple juice"], per100: { cal: 46, p: 0.1, c: 11, f: 0.1 }, portionGrams: 248 },
  { display: "Lemonade", keywords: ["lemonade"], per100: { cal: 40, p: 0.1, c: 10, f: 0 }, portionGrams: 248 },
  { display: "Energy drink", keywords: ["energy drink", "red bull"], per100: { cal: 45, p: 0, c: 11, f: 0 }, portionGrams: 250 },
  { display: "Sports drink", keywords: ["sports drink", "gatorade"], per100: { cal: 24, p: 0, c: 6, f: 0 }, portionGrams: 360 },
  { display: "Sprite", keywords: ["sprite", "lemon soda"], per100: { cal: 37, p: 0, c: 9, f: 0 }, portionGrams: 330 },
  { display: "Wine", keywords: ["wine", "vino"], per100: { cal: 83, p: 0.1, c: 2.6, f: 0 }, portionGrams: 150 },
  { display: "Spirits (vodka/whiskey)", keywords: ["vodka", "whiskey", "whisky", "rum", "gin", "tequila"], per100: { cal: 231, p: 0, c: 0, f: 0 }, portionGrams: 42 },

  // --- Balkan / Serbian foods ---
  { display: "Ćevapi", keywords: ["cevapi", "ćevapi", "cevapcici", "ćevapčići"], per100: { cal: 215, p: 18, c: 2, f: 15 }, portionGrams: 25 },
  { display: "Pljeskavica", keywords: ["pljeskavica"], per100: { cal: 215, p: 18, c: 3, f: 15 }, portionGrams: 200 },
  { display: "Burek (meat)", keywords: ["burek", "burek sa mesom", "borek"], per100: { cal: 270, p: 9, c: 24, f: 16 }, portionGrams: 150 },
  { display: "Burek (cheese)", keywords: ["burek sa sirom", "sirnica", "cheese burek"], per100: { cal: 255, p: 9, c: 22, f: 15 }, portionGrams: 150 },
  { display: "Ajvar", keywords: ["ajvar"], per100: { cal: 100, p: 1.5, c: 9, f: 7 }, portionGrams: 15 },
  { display: "Kajmak", keywords: ["kajmak"], per100: { cal: 400, p: 5, c: 3, f: 40 }, portionGrams: 15 },
  { display: "Sarma", keywords: ["sarma"], per100: { cal: 130, p: 7, c: 8, f: 8 }, portionGrams: 100 },
  { display: "Gibanica", keywords: ["gibanica"], per100: { cal: 250, p: 9, c: 18, f: 16 }, portionGrams: 150 },
  { display: "Pasulj (bean stew)", keywords: ["pasulj", "prebranac", "grah", "bean stew"], per100: { cal: 110, p: 6, c: 15, f: 3 }, portionGrams: 300 },
  { display: "Ražnjići", keywords: ["raznjici", "ražnjići", "pork skewers"], per100: { cal: 210, p: 25, c: 0, f: 12 }, portionGrams: 100 },
  { display: "Karađorđeva šnicla", keywords: ["karadjordjeva", "karađorđeva", "karadjordjeva snicla"], per100: { cal: 290, p: 16, c: 12, f: 20 }, portionGrams: 250 },
  { display: "Proja (cornbread)", keywords: ["proja"], per100: { cal: 230, p: 6, c: 30, f: 9 }, portionGrams: 80 },
  { display: "Musaka", keywords: ["musaka", "moussaka"], per100: { cal: 130, p: 7, c: 8, f: 8 }, portionGrams: 200 },
  { display: "Punjene paprike", keywords: ["punjene paprike", "stuffed peppers"], per100: { cal: 120, p: 6, c: 9, f: 7 }, portionGrams: 150 },
  { display: "Đuveč", keywords: ["djuvec", "đuveč"], per100: { cal: 140, p: 6, c: 16, f: 6 }, portionGrams: 300 },
  { display: "Gulaš (goulash)", keywords: ["gulas", "gulaš", "goulash"], per100: { cal: 130, p: 11, c: 6, f: 7 }, portionGrams: 300 },
  { display: "Palačinke", keywords: ["palacinke", "palačinke", "crepes", "crepe"], per100: { cal: 220, p: 6, c: 30, f: 8 }, portionGrams: 60 },
  { display: "Baklava", keywords: ["baklava"], per100: { cal: 430, p: 6, c: 50, f: 24 }, portionGrams: 60 },
  { display: "Tulumba", keywords: ["tulumba"], per100: { cal: 350, p: 3, c: 50, f: 16 }, portionGrams: 30 },
  { display: "Urnebes salad", keywords: ["urnebes"], per100: { cal: 250, p: 9, c: 5, f: 22 }, portionGrams: 20 },
  { display: "Šopska salata", keywords: ["sopska", "šopska", "sopska salata", "shopska"], per100: { cal: 90, p: 4, c: 5, f: 6 }, portionGrams: 200 },
  { display: "Kačamak (polenta)", keywords: ["kacamak", "kačamak", "polenta"], per100: { cal: 110, p: 2.5, c: 20, f: 2.5 } },
  { display: "Lepinja / Somun", keywords: ["lepinja", "somun", "flatbread"], per100: { cal: 270, p: 9, c: 53, f: 2 }, portionGrams: 100 },
  { display: "Kifla", keywords: ["kifla", "kifle"], per100: { cal: 300, p: 8, c: 50, f: 8 }, portionGrams: 60 },
  { display: "Čvarci", keywords: ["cvarci", "čvarci", "cracklings"], per100: { cal: 600, p: 30, c: 0, f: 53 }, portionGrams: 28 },
  { display: "Kobasica", keywords: ["kobasica"], per100: { cal: 320, p: 14, c: 1, f: 28 }, portionGrams: 80 },
  { display: "Ćufte", keywords: ["cufte", "ćufte"], per100: { cal: 180, p: 12, c: 8, f: 11 }, portionGrams: 35 },
  { display: "Smoki", keywords: ["smoki"], per100: { cal: 520, p: 14, c: 50, f: 30 }, portionGrams: 50 },
  { display: "Plazma", keywords: ["plazma"], per100: { cal: 430, p: 8, c: 75, f: 11 }, portionGrams: 30 },
];

// Mass units -> grams. (Count/portion words like "slice", "cup" are handled
// separately by treating the number as a count of portions.)
const MASS_UNITS: Record<string, number> = {
  g: 1, gram: 1, grams: 1,
  // Serbian mass units
  gr: 1, grama: 1, grami: 1, dag: 10, deka: 10, dkg: 10,
  kg: 1000, kilo: 1000, kilos: 1000, kilogram: 1000, kilograms: 1000, kilograma: 1000,
  oz: 28.3495, ounce: 28.3495, ounces: 28.3495,
  lb: 453.592, lbs: 453.592, pound: 453.592, pounds: 453.592,
  ml: 1, l: 1000, liter: 1000, litre: 1000, liters: 1000, litres: 1000, litar: 1000, litara: 1000,
};

// Portion/descriptor words we skip when finding the food name (the number in
// front is treated as a count of portions instead).
const PORTION_WORDS = new Set([
  "slice", "slices", "cup", "cups", "tbsp", "tablespoon", "tablespoons",
  "tsp", "teaspoon", "teaspoons", "piece", "pieces", "can", "cans",
  "bottle", "bottles", "scoop", "scoops", "bar", "bars", "handful",
  "medium", "large", "small", "whole", "clove", "cloves", "of",
  // Serbian portion/descriptor words
  "komad", "komada", "komadi", "kom", "kriška", "kriske", "kriška", "kriške", "kriski",
  "kašika", "kasika", "kašike", "kasike", "kašiku", "kasiku", "kašičica", "kasicica",
  "šolja", "solja", "šolje", "solje", "šolju", "solju", "čaša", "casa", "čaše", "case",
  "parče", "parce", "parčeta", "parceta", "flaša", "flasa", "flaše", "flase",
  "merica", "merice", "veliki", "veliko", "velika", "mali", "malo", "mala",
  "ceo", "cela", "celo", "čen", "cen", "od",
]);

export type LocalMatch = {
  display: string;
  grams: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  label: string; // e.g. "4 Egg" or "200g Chicken breast"
};

const round1 = (n: number) => Math.round(n * 10) / 10;

function findFood(phrase: string): LocalFood | null {
  const p = phrase.trim().toLowerCase();
  if (!p) return null;
  // Try the phrase and a naive singular (drop trailing "s").
  const variants = [p, p.endsWith("s") ? p.slice(0, -1) : p];

  let best: { food: LocalFood; score: number } | null = null;
  for (const food of FOODS) {
    for (const kw of food.keywords) {
      for (const v of variants) {
        // Match when the user's phrase IS the keyword, or CONTAINS it as text.
        // (We deliberately don't match when the keyword contains the phrase —
        // that let short words like "oat" wrongly hit "oat milk".)
        let score = 0;
        if (v === kw) score = kw.length + 100;
        else if (v.includes(kw)) score = kw.length;
        if (score > 0 && (!best || score > best.score)) best = { food, score };
      }
    }
  }
  return best?.food ?? null;
}

// Parse a query like "4 eggs" / "200g chicken" / "2 slices bread" into a result,
// or return null if no built-in food matches.
export function lookupLocalFood(query: string): LocalMatch | null {
  const q = query.trim().toLowerCase();
  if (!q) return null;

  // Leading number (count or amount).
  const m = q.match(/^(\d+(?:[.,]\d+)?)?\s*(.*)$/);
  const qty = m?.[1] ? parseFloat(m[1].replace(",", ".")) : null;
  let rest = (m?.[2] ?? q).trim();

  // Mass unit right after the number? e.g. "200 g chicken" / "200g chicken".
  let grams: number | null = null;
  const unitMatch = rest.match(/^([a-z]+)\.?\s+(.*)$/) ?? rest.match(/^([a-z]+)$/);
  if (qty != null && unitMatch) {
    const unit = unitMatch[1];
    if (MASS_UNITS[unit]) {
      grams = qty * MASS_UNITS[unit];
      rest = (unitMatch[2] ?? "").trim();
    }
  }

  // Strip leading portion/descriptor words ("slices", "cup", "of"…) to isolate
  // the food name; the number stays a count of portions.
  let words = rest.split(/\s+/).filter(Boolean);
  while (words.length > 1 && PORTION_WORDS.has(words[0])) words = words.slice(1);
  const foodPhrase = words.join(" ");

  const food = findFood(foodPhrase);
  if (!food) return null;

  // Decide the gram weight.
  if (grams == null) {
    if (qty != null) {
      // Counted portions, e.g. "4 eggs".
      grams = qty * (food.portionGrams ?? 100);
    } else {
      // No number — assume one portion (or 100 g if not countable).
      grams = food.portionGrams ?? 100;
    }
  }

  const factor = grams / 100;
  const label =
    grams != null && (unitMatch && qty != null && MASS_UNITS[unitMatch[1]])
      ? `${round1(grams)}g ${food.display}`
      : qty != null
        ? `${round1(qty)} ${food.display}`
        : food.display;

  return {
    display: food.display,
    grams: round1(grams),
    calories: Math.round(food.per100.cal * factor),
    protein: round1(food.per100.p * factor),
    carbs: round1(food.per100.c * factor),
    fat: round1(food.per100.f * factor),
    label,
  };
}

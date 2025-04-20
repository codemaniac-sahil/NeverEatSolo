// Food preferences, dietary restrictions, and compatibility constants

export const DIETARY_RESTRICTIONS = [
  "Vegetarian",
  "Vegan",
  "Pescatarian",
  "Gluten-Free",
  "Dairy-Free",
  "Nut-Free",
  "Kosher",
  "Halal",
  "Low-Carb",
  "Keto",
  "Low-Sugar",
  "Paleo",
  "No Shellfish",
  "No Pork",
  "No Beef",
  "No Alcohol",
] as const;

export const CUISINE_PREFERENCES = [
  "Italian",
  "American",
  "Mexican",
  "Chinese",
  "Japanese",
  "Thai",
  "Indian",
  "Mediterranean",
  "French",
  "Spanish",
  "Korean",
  "Vietnamese",
  "Greek",
  "Middle Eastern",
  "Caribbean",
  "Brazilian",
  "Ethiopian",
  "Southern/Soul",
  "Fusion",
  "Seafood",
  "BBQ/Grilled",
  "Vegetarian/Vegan",
  "Street Food",
  "Farm-to-Table",
] as const;

export const DINING_STYLES = [
  "Fine Dining",
  "Casual",
  "Fast-Casual",
  "Buffet",
  "Food Trucks",
  "Cafes",
  "Brunch Spots",
  "Pub/Bar Food",
  "Family-Style",
  "Tasting Menu",
  "Outdoor Dining",
  "Food Halls",
  "Pop-up Restaurants",
  "Chef's Table",
  "Social Tables",
] as const;

export const FOOD_PREFERENCES = [
  "Foodie/Culinary Explorer",
  "Health-Conscious",
  "Comfort Food Lover",
  "Fast Eater",
  "Slow Eater",
  "Adventurous Eater",
  "Picky Eater",
  "Late-Night Eater",
  "Early Dinner",
  "Lunch Only",
  "Breakfast Enthusiast",
  "Dessert Lover",
  "Spicy Food Fan",
  "Meal Sharer",
  "No Food Sharing",
  "Food Photographer",
  "Conversation-Focused",
  "Quiet Eater",
  "Social Eater",
] as const;

// Helper type for TypeScript to create union types from our constants
export type DietaryRestriction = typeof DIETARY_RESTRICTIONS[number];
export type CuisinePreference = typeof CUISINE_PREFERENCES[number];
export type DiningStyle = typeof DINING_STYLES[number];
export type FoodPreference = typeof FOOD_PREFERENCES[number];

// Compatibility algorithm weights
export const COMPATIBILITY_WEIGHTS = {
  dietaryRestrictions: 0.35, // Higher weight as these are crucial for meal compatibility
  cuisinePreferences: 0.3,   // Important for restaurant selection
  diningStyles: 0.2,         // Affects the dining experience
  foodPreferences: 0.15      // General habits and preferences
};

/**
 * Calculate compatibility score between two users based on their food preferences
 * Returns a score between 0-100
 */
export function calculateCompatibilityScore(
  user1: {
    dietaryRestrictions?: string[];
    cuisinePreferences?: string[];
    diningStyles?: string[];
    foodPreferences?: string[];
  },
  user2: {
    dietaryRestrictions?: string[];
    cuisinePreferences?: string[];
    diningStyles?: string[];
    foodPreferences?: string[];
  }
): number {
  // Default empty arrays for undefined properties
  const user1DietaryRestrictions = user1.dietaryRestrictions || [];
  const user1CuisinePreferences = user1.cuisinePreferences || [];
  const user1DiningStyles = user1.diningStyles || [];
  const user1FoodPreferences = user1.foodPreferences || [];

  const user2DietaryRestrictions = user2.dietaryRestrictions || [];
  const user2CuisinePreferences = user2.cuisinePreferences || [];
  const user2DiningStyles = user2.diningStyles || [];
  const user2FoodPreferences = user2.foodPreferences || [];

  // Calculate overlap percentage for each category
  const dietaryScore = calculateOverlap(user1DietaryRestrictions, user2DietaryRestrictions);
  const cuisineScore = calculateOverlap(user1CuisinePreferences, user2CuisinePreferences);
  const styleScore = calculateOverlap(user1DiningStyles, user2DiningStyles);
  const preferencesScore = calculateOverlap(user1FoodPreferences, user2FoodPreferences);

  // Apply weights to each category
  const weightedScore = 
    dietaryScore * COMPATIBILITY_WEIGHTS.dietaryRestrictions +
    cuisineScore * COMPATIBILITY_WEIGHTS.cuisinePreferences +
    styleScore * COMPATIBILITY_WEIGHTS.diningStyles +
    preferencesScore * COMPATIBILITY_WEIGHTS.foodPreferences;

  // Convert to 0-100 scale and round to nearest integer
  return Math.round(weightedScore * 100);
}

/**
 * Calculate the overlap between two arrays as a percentage
 */
function calculateOverlap(arr1: string[], arr2: string[]): number {
  if (arr1.length === 0 && arr2.length === 0) return 1; // Both empty means perfect match
  if (arr1.length === 0 || arr2.length === 0) return 0; // One empty means no match

  // Count matching items
  const matchingItems = arr1.filter(item => arr2.includes(item)).length;
  
  // Calculate overlap as percentage of the total unique items
  const uniqueItems = new Set([...arr1, ...arr2]);
  return matchingItems / uniqueItems.size;
}
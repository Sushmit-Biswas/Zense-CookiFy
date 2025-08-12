
export interface Recipe {
  recipeName: string;
  ingredients: string[];
  cookingTime: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  instructions: string[];
  calories?: string;
  servingSize?: string;
  nutrition?: {
    protein: string;
    carbs: string;
    fat: string;
    fiber: string;
    sodium: string;
  };
  prepTime?: string;
  cookTime?: string;
  chefPersonality?: ChefPersonality;
  personalityTips?: string[];
  servingAdjustment?: number; // For tracking serving size adjustments in cooking schedules
}

export interface RecipeWithImage extends Recipe {
  imageUrl: string;
}

export enum DietaryPreference {
    NONE = "None",
    VEGETARIAN = "Vegetarian",
    VEGAN = "Vegan",
    GLUTEN_FREE = "Gluten-Free",
}

export enum FlavorProfile {
    NONE = "No Preference",
    SPICY = "Spicy",
    SWEET = "Sweet", 
    SAVORY = "Savory",
    TANGY = "Tangy",
    UMAMI = "Umami/Rich",
    MILD = "Mild & Comforting"
}

export enum RecipeStyle {
    NONE = "No Preference",
    INDIAN = "Indian",
    CHINESE = "Chinese",
    ITALIAN = "Italian",
    MEXICAN = "Mexican",
    THAI = "Thai",
    MEDITERRANEAN = "Mediterranean",
    AMERICAN = "American",
    JAPANESE = "Japanese",
    FRENCH = "French",
    MIDDLE_EASTERN = "Middle Eastern"
}

export enum ChefPersonality {
    NORMAL = "Normal",
    MICHELIN = "Michelin Chef",
    BUDGET_MOM = "Budget Mom",
    QUICK_CHEF = "Quick Chef"
}

export interface RecipeReinventionRequest {
    dishName: string;
    chefPersonality: ChefPersonality;
    dietaryPreference?: string;
    flavorProfile?: FlavorProfile;
    recipeStyle?: RecipeStyle;
    excludeIngredients?: string;
}

export interface CookingStep {
  id: string;
  recipeId: string;
  recipeName: string;
  step: string;
  startTime: number; // minutes from cooking start
  duration: number; // minutes
  type: 'prep' | 'active' | 'passive'; // passive = waiting/marinating/baking
  priority: 'high' | 'medium' | 'low';
  equipment?: string[];
  tips?: string;
}

export interface CookingSchedule {
  totalTime: number; // total minutes
  servingTime: string; // when everything will be ready
  steps: CookingStep[];
  recipes: Recipe[];
  efficiencyTips: string[];
  timelineSummary: string;
}

export interface CookingPathRequest {
  recipes: Recipe[];
  preferredServingTime?: string;
  kitchenEquipment?: string[];
  skillLevel: 'Beginner' | 'Intermediate' | 'Advanced';
}

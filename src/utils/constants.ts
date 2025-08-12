
import { DietaryPreference, ChefPersonality, FlavorProfile, RecipeStyle } from '../types';

export const DIETARY_PREFERENCES: DietaryPreference[] = [
  DietaryPreference.NONE,
  DietaryPreference.VEGETARIAN,
  DietaryPreference.VEGAN,
  DietaryPreference.GLUTEN_FREE,
];

export const CHEF_PERSONALITIES: ChefPersonality[] = [
  ChefPersonality.NORMAL,
  ChefPersonality.MICHELIN,
  ChefPersonality.BUDGET_MOM,
  ChefPersonality.QUICK_CHEF,
];

export const FLAVOR_PROFILES: FlavorProfile[] = [
  FlavorProfile.NONE,
  FlavorProfile.SPICY,
  FlavorProfile.SWEET,
  FlavorProfile.SAVORY,
  FlavorProfile.TANGY,
  FlavorProfile.UMAMI,
  FlavorProfile.MILD,
];

export const RECIPE_STYLES: RecipeStyle[] = [
  RecipeStyle.NONE,
  RecipeStyle.INDIAN,
  RecipeStyle.CHINESE,
  RecipeStyle.ITALIAN,
  RecipeStyle.MEXICAN,
  RecipeStyle.THAI,
  RecipeStyle.MEDITERRANEAN,
  RecipeStyle.AMERICAN,
  RecipeStyle.JAPANESE,
  RecipeStyle.FRENCH,
  RecipeStyle.MIDDLE_EASTERN,
];

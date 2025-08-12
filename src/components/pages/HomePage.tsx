import React, { useState, useCallback } from 'react';
import { DIETARY_PREFERENCES, CHEF_PERSONALITIES, FLAVOR_PROFILES, RECIPE_STYLES } from '../../utils';
import { DietaryPreference, ChefPersonality, FlavorProfile, RecipeStyle, type RecipeWithImage } from '../../types';
import { identifyIngredients, generateRecipes, generateRecipeImage } from '../../services/geminiService';
import Spinner from '../ui/Spinner';
import RecipeCard from '../ui/RecipeCard';
import CookingPath from './CookingPath';
import VoiceControl from '../ui/VoiceControl';
import { useNotification } from '../../contexts/NotificationContext';
import { Upload, Sparkles, Clock, Salad, Flame, Globe, Plus, X, ChefHat } from '../ui/Icons';

interface HomePageProps {
  onSaveRecipe: (recipe: RecipeWithImage) => void;
  isRecipeSaved: (recipeName: string) => boolean;
}

const HomePage: React.FC<HomePageProps> = ({ onSaveRecipe, isRecipeSaved }) => {
  const [images, setImages] = useState<Array<{data: string, name: string}>>([]);
  const [dietaryPreference, setDietaryPreference] = useState<DietaryPreference>(DietaryPreference.NONE);
  const [chefPersonality, setChefPersonality] = useState<ChefPersonality>(ChefPersonality.NORMAL);
  const [flavorProfile, setFlavorProfile] = useState<FlavorProfile>(FlavorProfile.NONE);
  const [recipeStyle, setRecipeStyle] = useState<RecipeStyle>(RecipeStyle.NONE);
  const [additionalIngredients, setAdditionalIngredients] = useState<string>('');
  const [excludeIngredients, setExcludeIngredients] = useState<string>('');
  const [recipes, setRecipes] = useState<RecipeWithImage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRecipes, setSelectedRecipes] = useState<RecipeWithImage[]>([]);
  const [showCookingPath, setShowCookingPath] = useState<boolean>(false);
  const { showNotification } = useNotification();

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newImages: Array<{data: string, name: string}> = [];
      const maxFiles = Math.min(files.length, 3 - images.length);
      
      for (let i = 0; i < maxFiles; i++) {
        const file = files[i];
        const reader = new FileReader();
        reader.onloadend = () => {
          newImages.push({
            data: reader.result as string,
            name: file.name
          });
          
          if (newImages.length === maxFiles) {
            setImages(prev => [...prev, ...newImages]);
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = error => reject(error);
    });
  };

  const handleGenerateRecipes = useCallback(async () => {
    if (images.length === 0) {
      setError("Please upload at least one image first.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setRecipes([]);

    try {
      // Process all images and combine ingredients
      let allIdentifiedIngredients: string[] = [];
      
      for (const imageData of images) {
        const base64Image = imageData.data.split(',')[1];
        const ingredients = await identifyIngredients(base64Image);
        allIdentifiedIngredients = [...allIdentifiedIngredients, ...ingredients];
      }

      // Remove duplicates
      allIdentifiedIngredients = [...new Set(allIdentifiedIngredients)];

      if (allIdentifiedIngredients.length === 0) {
        setError("Could not identify any ingredients in the uploaded images. Please try clearer photos.");
        setIsLoading(false);
        return;
      }
      
      // Combine identified ingredients with additional ingredients
      let allIngredients = [...allIdentifiedIngredients];
      if (additionalIngredients.trim()) {
        const additional = additionalIngredients.split(',').map(ing => ing.trim()).filter(ing => ing);
        allIngredients = [...allIngredients, ...additional];
      }
      
      const generatedRecipes = await generateRecipes(
        allIngredients, 
        dietaryPreference, 
        excludeIngredients, 
        chefPersonality, 
        flavorProfile === FlavorProfile.NONE ? undefined : flavorProfile,
        recipeStyle === RecipeStyle.NONE ? undefined : recipeStyle
      );

      const recipesWithImages = await Promise.all(
        generatedRecipes.map(async (recipe) => {
          const imageUrl = await generateRecipeImage({
            recipeName: recipe.recipeName,
            ingredients: recipe.ingredients,
            instructions: recipe.instructions
          });
          return { ...recipe, imageUrl };
        })
      );
      
      setRecipes(recipesWithImages);

    } catch (e) {
      console.error(e);
      const message = e instanceof Error ? e.message : 'An unexpected error occurred.';
      setError(`Failed to generate recipes. The AI might be busy, or there was an issue with the request. Please try again. (Details: ${message})`);
    } finally {
      setIsLoading(false);
    }
  }, [images, dietaryPreference, chefPersonality, flavorProfile, additionalIngredients, excludeIngredients]);

  const toggleRecipeSelection = (recipe: RecipeWithImage) => {
    setSelectedRecipes(prev => {
      const isSelected = prev.some(r => r.recipeName === recipe.recipeName);
      if (isSelected) {
        showNotification('success', `${recipe.recipeName} removed from cooking path`);
        return prev.filter(r => r.recipeName !== recipe.recipeName);
      } else {
        showNotification('success', `${recipe.recipeName} added to cooking path`);
        return [...prev, recipe];
      }
    });
  };

  const handleStartCookingPath = () => {
    if (selectedRecipes.length === 0) {
      setError("Please select at least one recipe for the cooking path.");
      return;
    }
    setShowCookingPath(true);
  };

  const getChefPersonalityDescription = (personality: ChefPersonality): string => {
    switch (personality) {
      case ChefPersonality.MICHELIN:
        return "Chef Aria - Sophisticated techniques with elegant enthusiasm";
      case ChefPersonality.BUDGET_MOM:
        return "Chef Rosa - Practical wisdom for family-friendly budget cooking";
      case ChefPersonality.QUICK_CHEF:
        return "Chef Luna - High-energy efficiency and clever time-saving tricks";
      default:
        return "Chef Priya - Warm, approachable guidance for all skill levels";
    }
  };

  if (showCookingPath) {
    return (
      <CookingPath 
        selectedRecipes={selectedRecipes} 
        onBack={() => setShowCookingPath(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-600/10 to-amber-600/10"></div>
        <div className="relative container mx-auto max-w-7xl px-3 sm:px-4 lg:px-8 pt-8 sm:pt-16 pb-12 sm:pb-20">
          <div className="text-center mb-8 sm:mb-16">
            <div className="inline-flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 px-3 sm:px-6 py-2 sm:py-3 bg-white/80 backdrop-blur-sm rounded-full shadow-lg border border-orange-200">
              <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600" />
              <span className="text-orange-700 font-semibold text-sm sm:text-lg">AI-Powered Recipe Generation</span>
            </div>
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 bg-clip-text text-transparent mb-4 sm:mb-6 leading-tight">
              Smart Recipe Discovery
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-slate-700 max-w-4xl mx-auto leading-relaxed mb-6 sm:mb-8 px-2">
              Transform everyday ingredients into <span className="font-semibold text-orange-600">extraordinary meals</span>. 
              Simply snap a photo of your fridge and let our AI create personalized recipes tailored to your taste.
            </p>
            <div className="flex flex-wrap justify-center gap-3 sm:gap-6">
              <div className="flex items-center gap-2 px-3 py-2 bg-white/70 rounded-full shadow-sm">
                <Upload className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
                <span className="text-xs sm:text-sm font-medium text-slate-600">Smart Image Recognition</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-white/70 rounded-full shadow-sm">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
                <span className="text-xs sm:text-sm font-medium text-slate-600">Personalized Recipes</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-white/70 rounded-full shadow-sm">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                <span className="text-xs sm:text-sm font-medium text-slate-600">Zero Food Waste</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto max-w-7xl px-3 sm:px-4 lg:px-8 pb-8 sm:pb-16">
        {/* Configuration Panel */}
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-white/50 p-4 sm:p-8 md:p-12 mb-8 sm:mb-16">
          <div className="grid lg:grid-cols-2 gap-6 sm:gap-12 items-start">
            {/* Image Upload Section */}
            <div className="order-2 lg:order-1">
              <div className="text-center lg:text-left mb-6 sm:mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2 sm:mb-3">Start Your Culinary Adventure</h2>
                <p className="text-slate-600 text-base sm:text-lg">Upload a photo of your fridge and discover amazing recipes you can make right now.</p>
              </div>
              
              <div className="relative">
                {images.length === 0 ? (
                  <div className="group border-3 border-dashed border-orange-300 rounded-xl sm:rounded-2xl p-6 sm:p-12 text-center bg-gradient-to-br from-orange-50 to-amber-50 hover:from-orange-100 hover:to-amber-100 transition-all duration-300 cursor-pointer">
                    <div className="flex flex-col items-center justify-center space-y-4 sm:space-y-6">
                      <div className="relative">
                        <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br from-orange-400 to-amber-400 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <Upload className="w-8 h-8 sm:w-12 sm:h-12 text-white" />
                        </div>
                        <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-6 h-6 sm:w-8 sm:h-8 bg-yellow-400 rounded-full flex items-center justify-center animate-pulse">
                          <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-800" />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="file-upload" className="inline-block bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold px-4 sm:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer text-sm sm:text-base">
                          Upload Fridge Photos (Max 3)
                        </label>
                        <input id="file-upload" type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
                      </div>
                      <p className="text-slate-600 font-medium text-sm sm:text-base">PNG, JPG, WEBP up to 10MB each</p>
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500">
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                        <span>AI will identify ingredients from all photos</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    <div className="grid gap-3 sm:gap-4">
                      {images.map((imageData, index) => (
                        <div key={index} className="bg-white rounded-xl sm:rounded-2xl shadow-xl overflow-hidden border-2 border-orange-200">
                          <div className="relative">
                            <img src={imageData.data} alt={`Fridge contents ${index + 1}`} className="w-full h-32 sm:h-48 object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                            <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 right-2 sm:right-4">
                              <div className="bg-white/90 backdrop-blur-sm rounded-lg sm:rounded-xl p-2 sm:p-3">
                                <p className="text-slate-800 font-semibold truncate text-xs sm:text-sm">{imageData.name}</p>
                                <p className="text-slate-600 text-xs">Photo {index + 1} of {images.length}</p>
                              </div>
                            </div>
                            <button 
                              onClick={() => removeImage(index)} 
                              className="absolute top-2 right-2 w-7 h-7 sm:w-8 sm:h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors duration-200 text-sm font-bold"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {images.length < 3 && (
                      <div className="border-2 border-dashed border-orange-300 rounded-lg sm:rounded-xl p-4 sm:p-6 text-center bg-orange-50">
                        <label htmlFor="file-upload-additional" className="inline-block bg-gradient-to-r from-orange-400 to-amber-400 text-white font-semibold px-4 sm:px-6 py-2 sm:py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer text-sm sm:text-base">
                          + Add More Photos ({images.length}/3)
                        </label>
                        <input id="file-upload-additional" type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Configuration Section */}
            <div className="order-1 lg:order-2 space-y-4 sm:space-y-8">
              <div className="text-center lg:text-left">
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2 sm:mb-3">Customize Your Experience</h2>
                <p className="text-slate-600 text-base sm:text-lg">Personalize your recipes with AI chef personalities and dietary preferences.</p>
              </div>

              {/* Chef Personality */}
              <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-orange-200/50">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <label htmlFor="chef-personality" className="flex items-center gap-2 text-base sm:text-lg font-semibold text-slate-700">
                    <ChefHat className="w-4 h-4 sm:w-5 sm:h-5" />
                    AI Chef Personality 
                    <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-bold">NEW</span>
                  </label>
                  <VoiceControl chefPersonality={chefPersonality} />
                </div>
                <select 
                  id="chef-personality"
                  value={chefPersonality}
                  onChange={e => setChefPersonality(e.target.value as ChefPersonality)}
                  className="w-full p-3 sm:p-4 border-2 border-orange-200 rounded-lg sm:rounded-xl focus:ring-4 focus:ring-orange-400/20 focus:border-orange-400 transition-all duration-300 bg-white/90 text-base sm:text-lg font-medium"
                >
                  {CHEF_PERSONALITIES.map(personality => <option key={personality} value={personality}>{personality}</option>)}
                </select>
                <div className="mt-2 sm:mt-3 p-2 sm:p-3 bg-white/70 rounded-lg">
                  <p className="text-xs sm:text-sm text-orange-700 font-medium">{getChefPersonalityDescription(chefPersonality)}</p>
                </div>
              </div>

              {/* Preferences Grid */}
              <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg sm:rounded-xl p-4 sm:p-5 border border-blue-200/50">
                  <label htmlFor="dietary-preference" className="flex items-center gap-2 text-base sm:text-lg font-semibold text-slate-700 mb-2 sm:mb-3">
                    <Salad className="w-4 h-4 sm:w-5 sm:h-5" />
                    Dietary
                  </label>
                  <select 
                    id="dietary-preference"
                    value={dietaryPreference}
                    onChange={e => setDietaryPreference(e.target.value as DietaryPreference)}
                    className="w-full p-2 sm:p-3 border-2 border-blue-200 rounded-lg focus:ring-4 focus:ring-blue-400/20 focus:border-blue-400 transition-all duration-300 bg-white/90 text-sm sm:text-base"
                  >
                    {DIETARY_PREFERENCES.map(pref => <option key={pref} value={pref}>{pref}</option>)}
                  </select>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg sm:rounded-xl p-4 sm:p-5 border border-purple-200/50">
                  <label htmlFor="flavor-profile" className="flex items-center gap-2 text-base sm:text-lg font-semibold text-slate-700 mb-2 sm:mb-3">
                    <Flame className="w-4 h-4 sm:w-5 sm:h-5" />
                    Flavor
                  </label>
                  <select 
                    id="flavor-profile"
                    value={flavorProfile}
                    onChange={e => setFlavorProfile(e.target.value as FlavorProfile)}
                    className="w-full p-2 sm:p-3 border-2 border-purple-200 rounded-lg focus:ring-4 focus:ring-purple-400/20 focus:border-purple-400 transition-all duration-300 bg-white/90 text-sm sm:text-base"
                  >
                    {FLAVOR_PROFILES.map(flavor => <option key={flavor} value={flavor}>{flavor}</option>)}
                  </select>
                </div>
              </div>

              {/* Recipe Style */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-emerald-200/50">
                <label htmlFor="recipe-style" className="flex items-center gap-2 text-base sm:text-lg font-semibold text-slate-700 mb-2 sm:mb-3">
                  <Globe className="w-4 h-4 sm:w-5 sm:h-5" />
                  Recipe Style
                </label>
                <select 
                  id="recipe-style"
                  value={recipeStyle}
                  onChange={e => setRecipeStyle(e.target.value as RecipeStyle)}
                  className="w-full p-3 sm:p-4 border-2 border-emerald-200 rounded-lg sm:rounded-xl focus:ring-4 focus:ring-emerald-400/20 focus:border-emerald-400 transition-all duration-300 bg-white/90 text-sm sm:text-base"
                >
                  {RECIPE_STYLES.map(style => <option key={style} value={style}>{style}</option>)}
                </select>
                <p className="text-xs sm:text-sm text-emerald-700 mt-2">Choose your preferred cuisine style</p>
              </div>

              {/* Additional Controls */}
              <div className="space-y-4 sm:space-y-6">
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg sm:rounded-xl p-4 sm:p-5 border border-yellow-200/50">
                  <label htmlFor="additional-ingredients" className="flex items-center gap-2 text-base sm:text-lg font-semibold text-slate-700 mb-2 sm:mb-3">
                    <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                    Additional Ingredients
                  </label>
                  <input
                    id="additional-ingredients"
                    type="text"
                    placeholder="e.g., garlic, onions, spices (comma-separated)"
                    value={additionalIngredients}
                    onChange={e => setAdditionalIngredients(e.target.value)}
                    className="w-full p-2 sm:p-3 border-2 border-yellow-200 rounded-lg focus:ring-4 focus:ring-yellow-400/20 focus:border-yellow-400 transition-all duration-300 bg-white/90 text-sm sm:text-base"
                  />
                  <p className="text-xs sm:text-sm text-yellow-700 mt-2">Add ingredients not detected in your photo</p>
                </div>
                
                <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-lg sm:rounded-xl p-4 sm:p-5 border border-red-200/50">
                  <label htmlFor="exclude-ingredients" className="flex items-center gap-2 text-base sm:text-lg font-semibold text-slate-700 mb-2 sm:mb-3">
                    <X className="w-4 h-4 sm:w-5 sm:h-5" />
                    Avoid These
                  </label>
                  <input
                    id="exclude-ingredients"
                    type="text"
                    placeholder="e.g., nuts, shellfish, dairy (comma-separated)"
                    value={excludeIngredients}
                    onChange={e => setExcludeIngredients(e.target.value)}
                    className="w-full p-2 sm:p-3 border-2 border-red-200 rounded-lg focus:ring-4 focus:ring-red-400/20 focus:border-red-400 transition-all duration-300 bg-white/90 text-sm sm:text-base"
                  />
                  <p className="text-xs sm:text-sm text-red-700 mt-2">Allergens and ingredients to exclude</p>
                </div>
              </div>

              {/* Generate Button */}
              <div className="pt-2 sm:pt-4">
                <button
                  onClick={handleGenerateRecipes}
                  disabled={images.length === 0 || isLoading}
                  className="group relative w-full flex items-center justify-center gap-3 sm:gap-4 bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 text-white font-bold py-4 sm:py-6 px-6 sm:px-8 rounded-xl sm:rounded-2xl shadow-2xl hover:shadow-orange-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 disabled:scale-100 text-base sm:text-lg"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-700 via-amber-700 to-yellow-700 rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative z-10 flex items-center gap-3 sm:gap-4">
                    {isLoading ? (
                      <>
                        <Spinner />
                        <span className="text-sm sm:text-base">AI Chef Analyzing Your Fridge...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 sm:w-7 sm:h-7" />
                        <span>Generate My Recipes</span>
                        <Sparkles className="w-5 h-5 sm:w-7 sm:h-7" />
                      </>
                    )}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* Error Message */}
        {error && (
          <div className="max-w-4xl mx-auto mb-8 sm:mb-12 px-3 sm:px-0">
            <div className="bg-red-50 border-l-4 border-red-400 p-4 sm:p-6 rounded-lg sm:rounded-xl shadow-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 bg-red-400 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs sm:text-sm font-bold">!</span>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-red-700 font-medium text-sm sm:text-base">{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="max-w-4xl mx-auto mb-8 sm:mb-12 px-3 sm:px-0">
            <div className="bg-white/90 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-xl p-6 sm:p-12 text-center border border-orange-200/50">
              <div className="animate-pulse">
                <div className="flex justify-center mb-4 sm:mb-6">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-orange-400 to-amber-400 rounded-full flex items-center justify-center">
                    <Spinner />
                  </div>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-700 mb-3 sm:mb-4">AI Chef Analyzing Your Fridge</h3>
                <p className="text-base sm:text-lg text-slate-600 mb-4 sm:mb-6">Identifying ingredients and crafting personalized recipes just for you...</p>
                <div className="flex justify-center space-x-2">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-orange-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-amber-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results Section */}
        {recipes.length > 0 && (
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
            {/* Results Header */}
            <div className="text-center mb-8 sm:mb-16">
              <div className="inline-flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 px-4 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full shadow-lg border border-green-200">
                <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
                <span className="text-green-700 font-bold text-base sm:text-xl">Recipes Ready!</span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-800 mb-4 sm:mb-6">
                Here's What You Can Make!
              </h2>
              <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto mb-6 sm:mb-8 px-2">
                Our AI chef has analyzed your ingredients and created these personalized recipes. 
                Each one is tailored to your preferences and dietary requirements.
              </p>
              
              {/* Pro Tip */}
              <div className="max-w-4xl mx-auto mb-6 sm:mb-8">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-base sm:text-lg">💡</span>
                    </div>
                    <div className="text-left">
                      <h3 className="text-base sm:text-lg font-bold text-blue-800 mb-2">Pro Chef Tip</h3>
                      <p className="text-blue-700 text-sm sm:text-base">
                        Click the <span className="inline-flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 bg-white border-2 border-blue-300 rounded-full text-xs mx-1 font-bold">+</span> 
                        button on recipe cards to add them to your <strong>Cooking Path</strong> for optimized meal scheduling and kitchen time management!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recipe Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-16">
              {recipes.map((recipe, index) => {
                const isSelected = selectedRecipes.some(r => r.recipeName === recipe.recipeName);
                return (
                  <div key={recipe.recipeName} className="group relative">
                    <div className="absolute -inset-0.5 sm:-inset-1 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl sm:rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-300"></div>
                    <div className="relative bg-white rounded-xl sm:rounded-2xl overflow-hidden">
                      <RecipeCard 
                        recipe={recipe} 
                        onSave={onSaveRecipe} 
                        isSaved={isRecipeSaved(recipe.recipeName)} 
                        onAddToCookingPath={toggleRecipeSelection}
                        isInCookingPath={isSelected}
                      />
                    </div>
                    {/* Recipe Number Badge */}
                    <div className="absolute -top-2 -left-2 sm:-top-3 sm:-left-3 w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-full flex items-center justify-center font-bold text-xs sm:text-sm shadow-lg z-10">
                      {index + 1}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Cooking Path Section */}
            {selectedRecipes.length > 0 && (
              <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-yellow-50 rounded-2xl sm:rounded-3xl shadow-2xl border border-orange-200/50 p-6 sm:p-12 mb-8 sm:mb-16">
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 px-4 sm:px-6 py-2 sm:py-3 bg-white/80 backdrop-blur-sm rounded-full shadow-lg border border-orange-200">
                    <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600" />
                    <span className="text-orange-700 font-semibold text-sm sm:text-lg">Cooking Path Mode</span>
                    <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-bold">NEW</span>
                  </div>
                  
                  <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-800 mb-3 sm:mb-4">
                    Smart Kitchen Management
                  </h3>
                  <p className="text-base sm:text-lg text-slate-600 mb-6 sm:mb-8 max-w-3xl mx-auto px-2">
                    Get an optimized cooking schedule for your {selectedRecipes.length} selected recipe{selectedRecipes.length > 1 ? 's' : ''}. 
                    Our AI will coordinate preparation times, cooking steps, and kitchen resources to minimize downtime and maximize efficiency.
                  </p>
                  
                  {/* Selected Recipes Display */}
                  <div className="bg-white/70 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 border border-orange-200/50">
                    <h4 className="text-base sm:text-lg font-semibold text-slate-700 mb-3 sm:mb-4">Selected for Cooking Path:</h4>
                    <div className="mobile-scroll-x sm:flex sm:flex-wrap sm:justify-center gap-2 sm:gap-3">
                      {selectedRecipes.map((recipe, index) => (
                        <div key={index} className="mobile-scroll-item group flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 bg-gradient-to-r from-orange-100 to-amber-100 text-orange-800 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium border border-orange-200 shadow-sm hover:shadow-md transition-all duration-200 whitespace-nowrap">
                          <span className="flex-1">{recipe.recipeName}</span>
                          <button
                            onClick={() => toggleRecipeSelection(recipe)}
                            className="w-5 h-5 sm:w-6 sm:h-6 bg-orange-200 hover:bg-orange-300 rounded-full flex items-center justify-center text-orange-600 hover:text-orange-800 transition-colors text-xs font-bold group-hover:scale-110 flex-shrink-0"
                            title="Remove from cooking path"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <button
                    onClick={handleStartCookingPath}
                    className="group relative bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 text-white font-bold py-4 sm:py-6 px-8 sm:px-12 rounded-xl sm:rounded-2xl shadow-2xl hover:shadow-orange-500/25 transition-all duration-300 hover:scale-105 flex items-center gap-3 sm:gap-4 mx-auto text-base sm:text-lg"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-700 via-amber-700 to-yellow-700 rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <span className="relative z-10 flex items-center gap-3 sm:gap-4">
                      <Sparkles className="w-5 h-5 sm:w-7 sm:h-7" />
                      <span>Create Smart Cooking Schedule</span>
                      <Clock className="w-5 h-5 sm:w-7 sm:h-7" />
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* Call to Action */}
            <div className="text-center">
              <div className="bg-gradient-to-r from-orange-100 via-amber-100 to-yellow-100 rounded-2xl sm:rounded-3xl p-6 sm:p-12 border border-orange-200/50">
                <h3 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-3 sm:mb-4">Discovered Something Amazing?</h3>
                <p className="text-base sm:text-lg text-slate-600 mb-6 sm:mb-8 max-w-2xl mx-auto px-2">
                  Save your favorite recipes, try different chef personalities, or upload another fridge photo to discover even more culinary possibilities.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
                  <button
                    onClick={() => {
                      setImages([]);
                      setRecipes([]);
                      setError(null);
                      setSelectedRecipes([]);
                    }}
                    className="bg-gradient-to-r from-orange-600 to-amber-600 text-white font-semibold py-3 px-6 sm:px-8 rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-sm sm:text-base"
                  >
                    Upload New Photos
                  </button>
                  <button
                    onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}
                    className="bg-white text-orange-600 border-2 border-orange-200 font-semibold py-3 px-6 sm:px-8 rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:border-orange-400 text-sm sm:text-base"
                  >
                    Back to Top
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
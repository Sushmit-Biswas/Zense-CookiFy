
import React, { useState, useEffect } from 'react';
import { type RecipeWithImage } from '../../types';
import RecipeCard from '../ui/RecipeCard';
import CookingPath from './CookingPath';
import { useNotification } from '../../contexts/NotificationContext';
import { generateRecipeImage } from '../../services/geminiService';
import { Bookmark, Clock, RefreshCw } from '../ui/Icons';
import Spinner from '../ui/Spinner';

interface FavoritesPageProps {
  savedRecipes: RecipeWithImage[];
  onSaveRecipe: (recipe: RecipeWithImage) => void;
  isRecipeSaved: (recipeName: string) => boolean;
  onUpdateRecipe?: (updatedRecipe: RecipeWithImage) => void;
}

const FavoritesPage: React.FC<FavoritesPageProps> = ({ 
  savedRecipes, 
  onSaveRecipe, 
  isRecipeSaved, 
  onUpdateRecipe 
}) => {
  const [selectedRecipes, setSelectedRecipes] = useState<RecipeWithImage[]>([]);
  const [showCookingPath, setShowCookingPath] = useState<boolean>(false);
  const [recipesWithImages, setRecipesWithImages] = useState<RecipeWithImage[]>(savedRecipes);
  const [isRegeneratingImages, setIsRegeneratingImages] = useState<boolean>(false);
  const [regenerationProgress, setRegenerationProgress] = useState<{ current: number; total: number }>({ current: 0, total: 0 });
  const { showNotification } = useNotification();

  // Function to check if an image URL is valid/accessible
  const isValidImageUrl = (url: string): Promise<boolean> => {
    return new Promise((resolve) => {
      if (!url || url.startsWith('data:') || url.includes('placeholder')) {
        resolve(false);
        return;
      }
      
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
      
      // Timeout after 3 seconds
      setTimeout(() => resolve(false), 3000);
    });
  };

  // Function to regenerate images for recipes that don't have valid images
  const regenerateImagesForRecipes = async () => {
    if (savedRecipes.length === 0) return;
    
    setIsRegeneratingImages(true);
    setRegenerationProgress({ current: 0, total: savedRecipes.length });
    
    try {
      const updatedRecipes: RecipeWithImage[] = [];
      
      for (let i = 0; i < savedRecipes.length; i++) {
        const recipe = savedRecipes[i];
        setRegenerationProgress({ current: i + 1, total: savedRecipes.length });
        
        // Check if the current image is valid
        const hasValidImage = await isValidImageUrl(recipe.imageUrl);
        
        if (!hasValidImage) {
          try {
            showNotification('info', `Regenerating image for ${recipe.recipeName}...`);
            
            // Generate new image for this recipe
            const newImageUrl = await generateRecipeImage({
              recipeName: recipe.recipeName,
              ingredients: recipe.ingredients,
              instructions: recipe.instructions
            });
            
            const updatedRecipe = { ...recipe, imageUrl: newImageUrl };
            updatedRecipes.push(updatedRecipe);
            
            // Update the recipe in parent component if callback is provided
            if (onUpdateRecipe) {
              onUpdateRecipe(updatedRecipe);
            }
            
            showNotification('success', `Image regenerated for ${recipe.recipeName}`);
          } catch (error) {
            console.error(`Failed to regenerate image for ${recipe.recipeName}:`, error);
            // Keep the original recipe if image generation fails
            updatedRecipes.push(recipe);
            showNotification('error', `Failed to regenerate image for ${recipe.recipeName}`);
          }
        } else {
          // Keep the original recipe if image is valid
          updatedRecipes.push(recipe);
        }
      }
      
      setRecipesWithImages(updatedRecipes);
      showNotification('success', 'Image regeneration completed!');
    } catch (error) {
      console.error('Error during image regeneration:', error);
      showNotification('error', 'Failed to regenerate some images');
    } finally {
      setIsRegeneratingImages(false);
      setRegenerationProgress({ current: 0, total: 0 });
    }
  };

  // Effect to regenerate images when component mounts or savedRecipes change
  useEffect(() => {
    if (savedRecipes.length > 0) {
      // Check if any recipes need image regeneration
      const checkAndRegenerate = async () => {
        const needsRegeneration = await Promise.all(
          savedRecipes.map(recipe => 
            isValidImageUrl(recipe.imageUrl).then(isValid => !isValid)
          )
        );
        
        if (needsRegeneration.some(needs => needs)) {
          regenerateImagesForRecipes();
        } else {
          setRecipesWithImages(savedRecipes);
        }
      };
      
      checkAndRegenerate();
    } else {
      setRecipesWithImages(savedRecipes);
    }
  }, [savedRecipes]);

  // Update local state when savedRecipes prop changes
  useEffect(() => {
    setRecipesWithImages(savedRecipes);
  }, [savedRecipes]);

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

  const clearCookingPath = () => {
    setSelectedRecipes([]);
    setShowCookingPath(false);
    showNotification('success', 'Cooking path cleared');
  };

  return (
    <div className="container mx-auto max-w-5xl px-3 sm:px-4 lg:px-8">
      {/* Image regeneration progress indicator */}
      {isRegeneratingImages && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-white rounded-lg shadow-lg p-4 border border-orange-200">
          <div className="flex items-center gap-3">
            <Spinner />
            <div>
              <p className="text-sm font-medium text-stone-700">Regenerating recipe images...</p>
              <p className="text-xs text-stone-500">
                {regenerationProgress.current} of {regenerationProgress.total} completed
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="text-center mb-8 sm:mb-12">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-stone-800">Your Favorite Recipes</h1>
        <p className="mt-3 sm:mt-4 text-base sm:text-lg text-stone-600 px-2">
          The culinary creations you've saved for later.
        </p>
        
        {/* Manual regenerate button */}
        {recipesWithImages.length > 0 && !isRegeneratingImages && (
          <button
            onClick={regenerateImagesForRecipes}
            className="mt-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold px-4 py-2 rounded-lg hover:from-orange-600 hover:to-amber-600 transition-all duration-300 text-sm flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Regenerate All Images
          </button>
        )}
      </div>

      {savedRecipes.length === 0 ? (
        <div className="text-center bg-white rounded-xl sm:rounded-2xl shadow-lg p-8 sm:p-12">
          <Bookmark className="w-16 h-16 sm:w-20 sm:h-20 text-stone-300 mx-auto mb-4 sm:mb-6" />
          <h2 className="text-xl sm:text-2xl font-semibold text-stone-700">No Saved Recipes Yet</h2>
          <p className="text-stone-500 mt-2 text-sm sm:text-base px-2">Go back home to generate some recipes and save your favorites!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {recipesWithImages.map((recipe) => {
            const isSelected = selectedRecipes.some(r => r.recipeName === recipe.recipeName);
            return (
              <RecipeCard 
                key={recipe.recipeName} 
                recipe={recipe} 
                onSave={onSaveRecipe} 
                isSaved={isRecipeSaved(recipe.recipeName)}
                onAddToCookingPath={toggleRecipeSelection}
                isInCookingPath={isSelected}
              />
            );
          })}
        </div>
      )}

      {/* Cooking Path Section */}
      {selectedRecipes.length > 0 && (
        <div className="mt-8 sm:mt-12 p-4 sm:p-8 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl sm:rounded-2xl border border-orange-200">
          <div className="text-center">
            <h3 className="text-xl sm:text-2xl font-bold text-stone-800 mb-3 sm:mb-4 flex items-center justify-center gap-2 sm:gap-3">
              <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600" />
              <span>Your Cooking Path ({selectedRecipes.length} recipe{selectedRecipes.length > 1 ? 's' : ''})</span>
            </h3>
            <p className="text-stone-600 mb-4 sm:mb-6 text-sm sm:text-base px-2">Ready to start cooking? Here's your optimized cooking sequence!</p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mb-4 sm:mb-6">
              <button
                onClick={() => setShowCookingPath(true)}
                className="bg-orange-500 text-white font-semibold px-6 sm:px-8 py-3 rounded-lg hover:bg-orange-600 transition-transform hover:scale-105 text-sm sm:text-base"
              >
                Generate Cooking Path ✨
              </button>
              <button
                onClick={clearCookingPath}
                className="bg-gray-500 text-white font-semibold px-4 sm:px-6 py-3 rounded-lg hover:bg-gray-600 transition-transform hover:scale-105 text-sm sm:text-base"
              >
                Clear Selection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cooking Path Modal */}
      {showCookingPath && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50">
          <div className="bg-white rounded-xl sm:rounded-2xl max-w-6xl w-full max-h-[95vh] overflow-y-auto">
            <CookingPath 
              selectedRecipes={selectedRecipes} 
              onBack={() => setShowCookingPath(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;


import React, { useState } from 'react';
import { type RecipeWithImage } from '../../types';
import { Bookmark, Clock, BarChart, Plus, Share } from './Icons';
import VoiceButton from './VoiceButton';
import { useRecipeShare } from '../../hooks/useRecipeShare';

interface RecipeCardProps {
  recipe: RecipeWithImage;
  onSave: (recipe: RecipeWithImage) => void;
  isSaved: boolean;
  onAddToCookingPath?: (recipe: RecipeWithImage) => void;
  isInCookingPath?: boolean;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ 
  recipe, 
  onSave, 
  isSaved, 
  onAddToCookingPath,
  isInCookingPath 
}) => {
  const { copyToClipboard } = useRecipeShare({ recipeName: recipe.recipeName });
  const [showTips, setShowTips] = useState(false);
  
  const recipeCardId = `recipe-card-${recipe.recipeName.replace(/[^a-z0-9]/gi, '-').toLowerCase()}`;

  const handleShareToWhatsApp = async () => {
    try {
      await copyToClipboard(recipeCardId);
    } catch (error) {
      console.error('Error copying recipe:', error);
    }
  };

  return (
    <div id={recipeCardId} className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden flex flex-col group transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 w-full mx-auto relative">
      {/* Action buttons positioned absolutely */}
      <div className="absolute top-3 sm:top-4 left-3 sm:left-4 z-10 flex flex-col gap-2">
        {/* Add to Cooking Path button */}
        {onAddToCookingPath && (
          <button
            onClick={() => onAddToCookingPath(recipe)}
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 transition-all flex items-center justify-center text-xs sm:text-sm font-bold shadow-lg ${
              isInCookingPath 
                ? 'bg-orange-500 border-orange-500 text-white hover:bg-orange-600' 
                : 'bg-white border-gray-300 text-gray-600 hover:border-orange-300 hover:text-orange-600'
            }`}
            title={isInCookingPath ? 'Remove from cooking path' : 'Add to cooking path'}
          >
            {isInCookingPath ? '✓' : <Plus className="w-3 h-3 sm:w-4 sm:h-4" />}
          </button>
        )}
      </div>

      <div className="absolute top-3 sm:top-4 right-3 sm:right-4 z-10 flex flex-col gap-2">
        {/* Share button */}
        <button
          onClick={handleShareToWhatsApp}
          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-green-500 text-white hover:bg-green-600 transition-colors shadow-md border border-gray-200 flex items-center justify-center"
          title="Copy recipe image to clipboard"
        >
          <Share className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Voice button */}
        <div className="scale-90 sm:scale-100">
          <VoiceButton 
            chefPersonality={recipe.chefPersonality}
            recipe={recipe}
            type="recipe-instructions"
          />
        </div>
        
        {/* Save button */}
        <button
          onClick={() => onSave(recipe)}
          className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full transition-colors shadow-md border border-gray-200 flex items-center justify-center ${
            isSaved 
              ? 'bg-orange-500 text-white' 
              : 'bg-white text-gray-600 hover:bg-orange-50 hover:text-orange-600'
          }`}
          title={isSaved ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Bookmark className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>

      <div className="relative">
        <img src={recipe.imageUrl} alt={recipe.recipeName} className="w-full h-40 sm:h-56 object-cover" />
      </div>
      
      <div className="p-3 sm:p-5 flex flex-col flex-grow">
        <h3 className="text-lg sm:text-xl font-bold text-stone-800 mb-2 text-center leading-tight">{recipe.recipeName}</h3>
        <div className="flex items-center justify-between text-xs sm:text-sm text-stone-500 mb-3 sm:mb-4">
          <span className="flex items-center gap-1.5"><Clock className="w-3 h-3 sm:w-4 sm:h-4" /> {recipe.cookingTime}</span>
          <span className="flex items-center gap-1.5"><BarChart className="w-3 h-3 sm:w-4 sm:h-4" /> {recipe.difficulty}</span>
        </div>

        {/* Nutritional Information */}
        {recipe.calories && recipe.servingSize && (
          <div className="bg-orange-50 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4 border border-orange-100">
            <div className="flex justify-between items-center mb-2 sm:mb-3">
              <span className="text-base sm:text-lg font-bold text-orange-700">{recipe.calories}</span>
              <span className="text-xs sm:text-sm font-medium text-orange-600">{recipe.servingSize}</span>
            </div>
            {recipe.nutrition && (
              <div className="grid grid-cols-3 gap-2 sm:gap-3 text-xs sm:text-sm text-orange-600">
                <div className="text-center bg-white rounded-md py-1.5 sm:py-2">
                  <div className="font-bold text-orange-700">{recipe.nutrition.protein}</div>
                  <div className="text-orange-500 text-xs">Protein</div>
                </div>
                <div className="text-center bg-white rounded-md py-1.5 sm:py-2">
                  <div className="font-bold text-orange-700">{recipe.nutrition.carbs}</div>
                  <div className="text-orange-500 text-xs">Carbs</div>
                </div>
                <div className="text-center bg-white rounded-md py-1.5 sm:py-2">
                  <div className="font-bold text-orange-700">{recipe.nutrition.fat}</div>
                  <div className="text-orange-500 text-xs">Fat</div>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Chef Personality Tips */}
        {recipe.personalityTips && recipe.personalityTips.length > 0 && (
          <div className="bg-blue-50 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4 border border-blue-100">
            <button
              onClick={() => setShowTips(!showTips)}
              className="flex items-center gap-2 text-left w-full"
            >
              <BarChart className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
              <span className="text-xs sm:text-sm font-bold text-blue-700">
                {recipe.chefPersonality} Tips ({recipe.personalityTips.length})
              </span>
              <span className={`text-blue-600 transition-transform ml-auto text-xs ${showTips ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </button>
            
            {showTips && (
              <div className="mt-2 sm:mt-3 space-y-2">
                {recipe.personalityTips.map((tip, index) => (
                  <div key={index} className="flex items-start gap-2 text-xs sm:text-sm text-blue-700">
                    <span className="text-blue-400 mt-1 flex-shrink-0">💡</span>
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        <div className="flex-grow">
            <h4 className="font-semibold text-stone-700 mb-2 text-sm sm:text-base">Ingredients</h4>
            <ul className="list-disc list-inside text-xs sm:text-sm text-stone-600 mb-3 sm:mb-4 space-y-1">
                {recipe.ingredients.map((ing, i) => <li key={i}>{ing}</li>)}
            </ul>

            <h4 className="font-semibold text-stone-700 mb-2 text-sm sm:text-base">Instructions</h4>
            <ol className="text-xs sm:text-sm text-stone-600 space-y-2">
                {recipe.instructions.map((step, i) => (
                  <li key={i} className="flex">
                    <span className="font-medium text-stone-500 mr-2 flex-shrink-0">{i + 1}.</span>
                    <span className="leading-relaxed">{step}</span>
                  </li>
                ))}
            </ol>
        </div>
      </div>
    </div>
  );
};

export default RecipeCard;

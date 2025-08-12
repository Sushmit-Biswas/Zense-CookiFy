import React, { useState } from 'react';
import { Volume2, VolumeX } from './Icons';
import { voiceService } from '../../services/voiceService';
import { ChefPersonality } from '../../types';

interface VoiceButtonProps {
  chefPersonality: ChefPersonality;
  recipe?: any;
  instructions?: string[];
  className?: string;
  type: 'chef-description' | 'recipe-instructions';
}

const VoiceButton: React.FC<VoiceButtonProps> = ({ 
  chefPersonality, 
  recipe,
  instructions, 
  className = '', 
  type 
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const handleVoiceToggle = () => {
    if (isPlaying) {
      voiceService.stop();
      setIsPlaying(false);
    } else {
      if (type === 'chef-description') {
        voiceService.speakChefDescription(
          chefPersonality,
          () => setIsPlaying(true),
          () => setIsPlaying(false)
        );
      } else if (type === 'recipe-instructions' && recipe) {
        voiceService.speakCompleteRecipe(
          recipe,
          chefPersonality,
          () => setIsPlaying(true),
          () => setIsPlaying(false)
        );
      }
    }
  };

  return (
    <button
      onClick={handleVoiceToggle}
      className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${
        isPlaying 
          ? 'bg-orange-500 text-white' 
          : 'bg-white text-gray-600 hover:bg-orange-50 hover:text-orange-600'
      } shadow-md border border-gray-200 ${className}`}
      title={type === 'chef-description' ? 'Listen to chef introduction' : 'Listen to complete recipe'}
    >
      {isPlaying ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
    </button>
  );
};

export default VoiceButton;

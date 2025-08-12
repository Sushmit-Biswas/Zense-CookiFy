import React, { useState } from 'react';
import { voiceService } from '../../services/voiceService';
import { ChefPersonality } from '../../types';
import { Volume2, VolumeX } from './Icons';

interface VoiceControlProps {
  chefPersonality: ChefPersonality;
  className?: string;
}

const VoiceControl: React.FC<VoiceControlProps> = ({ chefPersonality, className = '' }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleToggleVoice = () => {
    if (isSpeaking) {
      voiceService.stop();
      setIsSpeaking(false);
    } else {
      voiceService.speakChefDescription(
        chefPersonality,
        () => setIsSpeaking(true),
        () => setIsSpeaking(false)
      );
    }
  };

  if (!voiceService.isAvailable()) {
    return null;
  }

  return (
    <button
      onClick={handleToggleVoice}
      className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${
        isSpeaking 
          ? 'bg-orange-500 text-white' 
          : 'bg-purple-100 text-purple-600 hover:bg-purple-200'
      } shadow-md border border-gray-200 ${className}`}
      title={isSpeaking ? 'Stop chef introduction' : 'Listen to chef introduction'}
    >
      {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
    </button>
  );
};

export default VoiceControl;

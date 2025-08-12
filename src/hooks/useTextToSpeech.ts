import { useState, useEffect, useCallback } from 'react';

interface UseTextToSpeechProps {
  rate?: number;
  pitch?: number;
  volume?: number;
  voice?: SpeechSynthesisVoice | null;
}

interface UseTextToSpeechReturn {
  speak: (text: string) => void;
  speaking: boolean;
  supported: boolean;
  cancel: () => void;
  pause: () => void;
  resume: () => void;
  voices: SpeechSynthesisVoice[];
}

export const useTextToSpeech = ({
  rate = 0.8,
  pitch = 1,
  volume = 1,
  voice = null,
}: UseTextToSpeechProps = {}): UseTextToSpeechReturn => {
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setSupported(true);
      
      const updateVoices = () => {
        setVoices(window.speechSynthesis.getVoices());
      };
      
      updateVoices();
      window.speechSynthesis.addEventListener('voiceschanged', updateVoices);
      
      return () => {
        window.speechSynthesis.removeEventListener('voiceschanged', updateVoices);
      };
    }
  }, []);

  const speak = useCallback((text: string) => {
    if (!supported) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;
    
    if (voice) {
      utterance.voice = voice;
    } else if (voices.length > 0) {
      // Try to find a good English voice
      const englishVoice = voices.find(v => v.lang.startsWith('en')) || voices[0];
      utterance.voice = englishVoice;
    }

    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, [supported, rate, pitch, volume, voice, voices]);

  const cancel = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, [supported]);

  const pause = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.pause();
  }, [supported]);

  const resume = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.resume();
  }, [supported]);

  return {
    speak,
    speaking,
    supported,
    cancel,
    pause,
    resume,
    voices,
  };
};

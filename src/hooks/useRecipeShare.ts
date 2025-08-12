import { useCallback } from 'react';
import html2canvas from 'html2canvas';

interface UseRecipeShareProps {
  recipeName: string;
}

interface UseRecipeShareReturn {
  copyToClipboard: (elementId: string) => Promise<void>;
  captureRecipeCard: (elementId: string) => Promise<string>;
}

export const useRecipeShare = ({ recipeName }: UseRecipeShareProps): UseRecipeShareReturn => {
  
  const captureRecipeCard = useCallback(async (elementId: string): Promise<string> => {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error('Recipe card element not found');
    }

    try {
      // Ensure the element is fully rendered and all images are loaded
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Create a temporary wrapper for better capture
      const wrapper = document.createElement('div');
      wrapper.style.position = 'fixed';
      wrapper.style.top = '-9999px';
      wrapper.style.left = '-9999px';
      wrapper.style.padding = '40px';
      wrapper.style.backgroundColor = '#f5f5f0';
      wrapper.style.width = 'auto';
      wrapper.style.height = 'auto';
      wrapper.style.display = 'flex';
      wrapper.style.justifyContent = 'center';
      wrapper.style.alignItems = 'flex-start';
      
      // Clone the element
      const clonedElement = element.cloneNode(true) as HTMLElement;
      clonedElement.style.position = 'relative';
      clonedElement.style.transform = 'none';
      clonedElement.style.transition = 'none';
      clonedElement.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.15)';
      clonedElement.style.margin = '0';
      clonedElement.style.maxWidth = '400px';
      clonedElement.style.width = '100%';
      
      wrapper.appendChild(clonedElement);
      document.body.appendChild(wrapper);
      
      // Wait a bit for the DOM to update
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const canvas = await html2canvas(wrapper, {
        backgroundColor: '#f5f5f0',
        scale: 2,
        useCORS: true,
        allowTaint: false,
        scrollX: 0,
        scrollY: 0,
        logging: false,
        imageTimeout: 15000,
        removeContainer: false,
        width: wrapper.offsetWidth,
        height: wrapper.offsetHeight,
      });
      
      // Clean up
      document.body.removeChild(wrapper);
      
      return canvas.toDataURL('image/png', 0.95);
      
    } catch (error) {
      console.error('Error capturing recipe card:', error);
      
      // Fallback to original method
      try {
        const canvas = await html2canvas(element, {
          backgroundColor: '#f5f5f0',
          scale: 2,
          useCORS: true,
          allowTaint: false,
          scrollX: 0,
          scrollY: 0,
          logging: false,
          width: element.offsetWidth + 80,
          height: element.offsetHeight + 80,
          x: Math.max(0, element.getBoundingClientRect().left - 40),
          y: Math.max(0, element.getBoundingClientRect().top - 40),
        });
        
        return canvas.toDataURL('image/png', 0.9);
      } catch (fallbackError) {
        console.error('Fallback capture also failed:', fallbackError);
        throw new Error('Failed to capture recipe card');
      }
    }
  }, []);

  const shareToWhatsApp = useCallback(async (elementId: string) => {
    try {
      // Capture the recipe card as image
      const imageDataUrl = await captureRecipeCard(elementId);
      
      // Convert image to blob for clipboard
      const response = await fetch(imageDataUrl);
      const blob = await response.blob();
      
      // Copy image to clipboard (for modern browsers)
      if (navigator.clipboard && window.ClipboardItem) {
        try {
          const item = new ClipboardItem({ 'image/png': blob });
          await navigator.clipboard.write([item]);
          alert('✅ Recipe image copied to clipboard! You can now paste it anywhere (Ctrl+V or Cmd+V).');
          return;
        } catch (clipboardError) {
          console.log('Clipboard write failed:', clipboardError);
        }
      }
      
      // Fallback: Download the image if clipboard doesn't work
      const link = document.createElement('a');
      link.download = `${recipeName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_recipe.png`;
      link.href = imageDataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      alert('📥 Recipe image downloaded! You can share it from your downloads folder.');
      
    } catch (error) {
      console.error('Error copying recipe image:', error);
      alert('Sorry, there was an error copying the recipe image. Please try again.');
    }
  }, [recipeName, captureRecipeCard]);

  return {
    copyToClipboard: shareToWhatsApp,
    captureRecipeCard,
  };
};

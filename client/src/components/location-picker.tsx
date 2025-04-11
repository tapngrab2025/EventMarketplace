import { useEffect, useRef, useState } from 'react';
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

interface LocationPickerProps {
  onLocationSelect: (location: { address: string; lat: number; lng: number }) => void;
  defaultValue?: string;
}

export function LocationPicker({ onLocationSelect, defaultValue }: LocationPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  const initializePlacesWidget = () => {
    if (!inputRef.current) return;

    const placeAutocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
      types: ['establishment', 'geocode'],
    });

    placeAutocomplete.addListener('place_changed', () => {
      const place = placeAutocomplete.getPlace();
      
      if (place.geometry?.location) {
        const address = place.formatted_address || place.name || '';
        
        // Update input value
        if (inputRef.current) {
          inputRef.current.value = address;
        }

        // Notify parent component
        onLocationSelect({
          address,
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        });
      }
    });

    setIsLoading(false);

    //   const pacContainer = document.querySelector('.pac-container');
    //   const pacItem = (e.target as Element)?.closest('.pac-item');
      
    //   if (pacContainer && (pacItem || pacContainer.contains(e.target as Node))) {
    //     e.preventDefault();
    //     e.stopPropagation();
    //     return false;
    //   }
    // };

    // // Add both click and mousedown handlers
    // document.addEventListener('click', handleDocumentClick, true);
    // document.addEventListener('mousedown', handleDocumentClick, true);

    // // Clean up event listeners when component unmounts
    // return () => {
    //   document.removeEventListener('click', handleDocumentClick, true);
    //   document.removeEventListener('mousedown', handleDocumentClick, true);
    // };
  };

  useEffect(() => {
      // Add global styles for Google Places dropdown
      // const style = document.createElement('style');
      // style.textContent = `
      //   .pac-container {
      //     z-index: 99999 !important;
      //     pointer-events: auto !important;
      //   }
      //   .pac-item {
      //     cursor: pointer !important;
      //     padding: 8px !important;
      //   }
      // `;
      // document.head.appendChild(style);

    if (window.google?.maps) {
      initializePlacesWidget();
    } else {
      const handler = () => initializePlacesWidget();
      window.addEventListener('google-maps-ready', handler);
      return () => window.removeEventListener('google-maps-ready', handler);
    }
  }, []);

  return (
    <div 
      className="relative z-[100]"
    >
      <Input
        ref={inputRef}
        type="text"
        placeholder="Search for a location"
        defaultValue={defaultValue}
        className="w-full"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
          }
        }}
      />
      {isLoading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      )}
    </div>
  );
}
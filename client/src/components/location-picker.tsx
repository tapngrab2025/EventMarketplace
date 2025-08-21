import { useEffect, useRef, useState } from 'react';
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

interface LocationPickerProps {
  onLocationSelect: (location: { address: string; lat: number; lng: number, city: string }) => void;
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
          city: place.address_components?.find((component) => component.types.includes('locality'))?.short_name || '',
        });
      }
    });
    setIsLoading(false);
  };

  useEffect(() => {
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
      className="relative z-[9999]"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
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
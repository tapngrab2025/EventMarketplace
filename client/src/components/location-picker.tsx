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

  useEffect(() => {
    if (window.google?.maps) {
      initializeAutocomplete();
    } else {
      const handler = () => initializeAutocomplete();
      window.addEventListener('google-maps-ready', handler);
      return () => window.removeEventListener('google-maps-ready', handler);
    }
  }, []);

  const initializeAutocomplete = () => {
    if (!inputRef.current) return;
    
    const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
      types: ['establishment', 'geocode'],
    });

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      
      if (place.geometry?.location) {
        onLocationSelect({
          address: place.formatted_address || '',
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        });
      }
    });

    setIsLoading(false);
  };

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        type="text"
        placeholder="Search for a location"
        defaultValue={defaultValue}
        className="w-full"
      />
      {isLoading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      )}
    </div>
  );
}
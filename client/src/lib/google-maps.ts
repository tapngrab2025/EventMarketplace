declare global {
  interface Window {
    initGoogleMaps?: () => void;
  }
}

export function loadGoogleMaps(apiKey: string) {
  if (!apiKey) {
    throw new Error('Google Maps API key is required');
  }

  if (window.google?.maps) {
    return Promise.resolve();
  }

  return new Promise<void>((resolve, reject) => {
    window.initGoogleMaps = () => {
      if (window.google?.maps) {
        resolve();
        const event = new Event('google-maps-ready');
        window.dispatchEvent(event);
      } else {
        reject(new Error('Failed to load Google Maps'));
      }
    };

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMaps&loading=async`;
    script.async = true;
    script.defer = true;
    script.onerror = () => reject(new Error('Failed to load Google Maps script'));
    document.head.appendChild(script);
  });
}
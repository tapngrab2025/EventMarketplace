import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { loadGoogleMaps } from './lib/google-maps';

// Add this before your app renders
const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
if (!apiKey) {
  console.error('Google Maps API key is missing');
} else {
  loadGoogleMaps(apiKey)
    .then(() => {
      createRoot(document.getElementById("root")!).render(<App />);
    })
    .catch(error => {
      console.error('Failed to load Google Maps:', error);
      createRoot(document.getElementById("root")!).render(<App />);
    });
}

// createRoot(document.getElementById("root")!).render(<App />);

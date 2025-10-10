import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GoogleMapsLoaderService {
  private loading = false;
  private loaded = false;
  private loadPromise: Promise<void> | null = null;

  constructor() {}

  load(): Promise<void> {
    // If already loaded, return immediately
    if (this.loaded) {
      return Promise.resolve();
    }

    // If currently loading, return the existing promise
    if (this.loading && this.loadPromise) {
      return this.loadPromise;
    }

    // Start loading
    this.loading = true;
    this.loadPromise = new Promise((resolve, reject) => {
      // Check if Google Maps is already loaded
      if (typeof google !== 'undefined' && google.maps) {
        this.loaded = true;
        this.loading = false;
        resolve();
        return;
      }

      // Create script element
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${environment.googleMapsApiKey}`;
      script.async = true;
      script.defer = true;

      script.onload = () => {
        this.loaded = true;
        this.loading = false;
        resolve();
      };

      script.onerror = (error) => {
        this.loading = false;
        reject(new Error('Failed to load Google Maps API'));
      };

      // Append script to document
      document.head.appendChild(script);
    });

    return this.loadPromise;
  }

  isLoaded(): boolean {
    return this.loaded;
  }
}

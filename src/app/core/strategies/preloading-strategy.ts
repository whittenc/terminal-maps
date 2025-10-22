import { Injectable } from '@angular/core';
import { PreloadingStrategy, Route } from '@angular/router';
import { Observable, of, timer } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

/**
 * Custom preloading strategy that preloads routes after a delay
 * This improves initial load time while ensuring subsequent navigation is fast
 */
@Injectable({
  providedIn: 'root'
})
export class CustomPreloadingStrategy implements PreloadingStrategy {
  preload(route: Route, load: () => Observable<any>): Observable<any> {
    // Check if route has preload data flag
    const preloadRoute = route.data?.['preload'];
    const delay = route.data?.['preloadDelay'] || 2000;

    if (preloadRoute) {
      console.log('Preloading route:', route.path);
      // Preload after a delay to allow initial page to load first
      return timer(delay).pipe(
        mergeMap(() => load())
      );
    }

    // Don't preload by default
    return of(null);
  }
}

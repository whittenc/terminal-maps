import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, withPreloading } from '@angular/router';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { TerminalService } from './app/services/terminal.service';
import { KmlParserService } from './app/services/kml-parser.service';
import { MapStateService } from './app/services/map-state.service';
import { GoogleMapsLoaderService } from './app/services/google-maps-loader.service';
import { CustomPreloadingStrategy } from './app/core/strategies/preloading-strategy';

bootstrapApplication(AppComponent, {
  providers: [
    provideAnimations(),
    provideHttpClient(),
    provideRouter(routes, withPreloading(CustomPreloadingStrategy)),
    TerminalService,
    KmlParserService,
    MapStateService,
    GoogleMapsLoaderService,
    CustomPreloadingStrategy
  ]
}).catch((err) => console.error(err));

console.log('Application initialized with lazy loading and code splitting');

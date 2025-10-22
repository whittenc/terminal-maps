import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { AppComponent } from './app/app.component';
import { TerminalService } from './app/services/terminal.service';
import { KmlParserService } from './app/services/kml-parser.service';
import { MapStateService } from './app/services/map-state.service';
import { GoogleMapsLoaderService } from './app/services/google-maps-loader.service';

bootstrapApplication(AppComponent, {
  providers: [
    provideAnimations(),
    provideHttpClient(),
    TerminalService,
    KmlParserService,
    MapStateService,
    GoogleMapsLoaderService
  ]
}).catch((err) => console.error(err));

console.log('setting up');

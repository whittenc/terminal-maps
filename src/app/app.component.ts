import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { HttpClient } from '@angular/common/http';
import { TerminalService } from './services/terminal.service';
import { KmlParserService } from './services/kml-parser.service';
import { GoogleMapsLoaderService } from './services/google-maps-loader.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressBarModule
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Open Inventory Tracker';
  isLoading = true;

  constructor(
    private router: Router,
    private snackBar: MatSnackBar,
    private http: HttpClient,
    private terminalService: TerminalService,
    private kmlParser: KmlParserService,
    private googleMapsLoader: GoogleMapsLoaderService
  ) {}

  async ngOnInit() {
    try {
      // Load Google Maps API dynamically
      await this.googleMapsLoader.load();
    } catch (error) {
      this.snackBar.open(
        'Failed to load Google Maps API. Please check your API key.',
        'Close',
        { duration: 5000 }
      );
      this.isLoading = false;
      return;
    }

    // Load initial data
    await this.loadSampleData();
    this.isLoading = false;
  }

  async loadSampleData() {
    try {
      const [terminalsResponse, shippingResponse] = await Promise.all([
        this.http.get('/assets/terminals.kml', { responseType: 'text' }).toPromise(),
        this.http.get('/assets/shipping_20251010131328.kml', { responseType: 'text' }).toPromise()
      ]);

      if (terminalsResponse) {
        const result = this.kmlParser.parseKML(terminalsResponse, 'terminal');
        if (result.terminals.length > 0) {
          this.terminalService.setTerminals(result.terminals);
        }
      }

      if (shippingResponse) {
        const result = this.kmlParser.parseKML(shippingResponse, 'shipping');
        if (result.shippingLocations.length > 0) {
          this.terminalService.setShippingLocations(result.shippingLocations);
        }
      }
    } catch (error) {
      console.error('Error loading KML files:', error);
      this.snackBar.open(
        'Unable to load map data. Using fallback data.',
        'Dismiss',
        { duration: 5000 }
      );
      this.terminalService.loadFallbackData();
    }
  }

  navigateToDashboard() {
    this.router.navigate(['/dashboard']);
  }

  navigateToMap() {
    this.router.navigate(['/map']);
  }

  isRouteActive(route: string): boolean {
    return this.router.url.includes(route);
  }
}

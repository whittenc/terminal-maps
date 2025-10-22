import { Component, OnInit, ViewChild, Inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { HttpClient } from '@angular/common/http';
import { Terminal, ShippingLocation, TerminalService } from './services/terminal.service';
import { MapStateService, MapLayer } from './services/map-state.service';
import { KmlParserService } from './services/kml-parser.service';
import { GoogleMapsLoaderService } from './services/google-maps-loader.service';
import { MapComponent } from './components/map/map.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { LayerControlComponent } from './components/layer-control/layer-control.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatDialogModule,
    MatSnackBarModule,
    MapComponent,
    SidebarComponent,
    LayerControlComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit {
  @ViewChild(MapComponent) mapComponent!: MapComponent;

  title = 'Open Inventory Tracker';
  isLoading = true;
  sidenavOpened = true;
  layerControlsVisible = false;

  // Map configuration
  center: google.maps.LatLngLiteral = { lat: 39.8283, lng: -98.5795 };
  zoom = 5;

  // Data from services
  terminals: Terminal[] = [];
  shippingLocations: ShippingLocation[] = [];
  layers: MapLayer[] = [];
  selectedTerminal: string | null = null;

  // Track which terminals have expanded shipping details
  expandedShippingTerminals: Set<string> = new Set();

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private http: HttpClient,
    private terminalService: TerminalService,
    private mapStateService: MapStateService,
    private kmlParser: KmlParserService,
    private googleMapsLoader: GoogleMapsLoaderService,
    private cdr: ChangeDetectorRef
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

    // Subscribe to services
    this.terminalService.terminals$.subscribe(terminals => {
      this.terminals = terminals;
      this.cdr.markForCheck();
    });

    this.terminalService.shippingLocations$.subscribe(locations => {
      this.shippingLocations = locations;
      this.cdr.markForCheck();
    });

    this.mapStateService.layers$.subscribe(layers => {
      this.layers = layers;
      this.cdr.markForCheck();
    });

    this.mapStateService.selectedTerminal$.subscribe(selected => {
      this.selectedTerminal = selected;
      if (this.mapComponent) {
        this.mapComponent.clearMarkerCache();
      }
      this.cdr.markForCheck();
    });

    await this.loadSampleData();
    this.isLoading = false;
    this.cdr.markForCheck();
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

      setTimeout(() => {
        if (this.terminals.length > 0 && this.mapComponent) {
          this.mapComponent.fitBoundsToTerminals();
        }
      }, 100);

    } catch (error) {
      console.error('Error loading KML files:', error);
      this.terminalService.loadFallbackData();
    }
  }

  toggleLayerControls() {
    this.layerControlsVisible = !this.layerControlsVisible;
  }

  onLayerToggled(layer: MapLayer) {
    this.mapStateService.toggleLayer(layer);
  }

  getVisibleTerminals(): Terminal[] {
    return this.mapStateService.isTerminalsLayerVisible() ? this.terminals : [];
  }

  getVisibleShippingLocations(): ShippingLocation[] {
    if (!this.mapStateService.isShippingLayerVisible()) return [];
    if (this.selectedTerminal) {
      return this.shippingLocations.filter((loc) =>
        loc.terminalSource === this.selectedTerminal
      );
    }
    return this.shippingLocations;
  }

  onTerminalFilterChange(terminalNumber: string | null) {
    this.mapStateService.setSelectedTerminal(terminalNumber);
  }

  onTerminalClick(terminal: Terminal) {
    const currentSelection = this.mapStateService.getSelectedTerminal();
    this.mapStateService.setSelectedTerminal(
      currentSelection === terminal.terminalNumber ? null : terminal.terminalNumber
    );
    this.showTerminalInfo(terminal);
  }

  onShippingLocationClick(location: ShippingLocation) {
    this.showShippingInfo(location);
  }

  showTerminalInfo(terminal: Terminal) {
    const message = `Terminal ${terminal.terminalNumber} - ${terminal.name}
    Manager: ${terminal.manager}
    Total Staff: ${terminal.total} (${terminal.drivers} drivers, ${terminal.shop} shop, ${terminal.other} other)
    Primary Shippers: ${terminal.primaryShippers}`;

    this.snackBar.open(message, 'Close', {
      duration: 8000,
      panelClass: 'terminal-snackbar',
    });
  }

  showShippingInfo(location: ShippingLocation) {
    const message = `${location.city}, ${location.state}
    From: ${location.terminalSource}
    Units: ${location.count}`;

    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: 'shipping-snackbar',
    });
  }

  centerOnTerminals() {
    if (this.mapComponent) {
      this.mapComponent.fitBoundsToTerminals();
    }
  }

  centerOnShipping() {
    if (this.mapComponent) {
      this.mapComponent.fitBoundsToShipping();
    }
  }

  getShippingCountByTerminal(terminalNumber: string): number {
    return this.terminalService.getShippingCountByTerminal(terminalNumber);
  }

  getShippingCitiesByTerminal(terminalNumber: string): {city: string, state: string, count: number}[] {
    return this.terminalService.getShippingCitiesByTerminal(terminalNumber);
  }

  getTotalUnits(): number {
    return this.terminalService.getTotalUnits();
  }

  toggleShippingDestinations(terminal: Terminal, event: Event) {
    event.stopPropagation();
    if (this.expandedShippingTerminals.has(terminal.terminalNumber)) {
      this.expandedShippingTerminals.delete(terminal.terminalNumber);
    } else {
      this.expandedShippingTerminals.add(terminal.terminalNumber);
    }
  }

  isShippingExpanded(terminalNumber: string): boolean {
    return this.expandedShippingTerminals.has(terminalNumber);
  }

  showTerminalDetails(terminal: Terminal, event: Event) {
    event.stopPropagation();
    const cityData = this.getShippingCitiesByTerminal(terminal.terminalNumber);

    const dialogRef = this.dialog.open(TerminalDetailsDialogComponent, {
      width: '500px',
      data: { terminal: terminal, cityData: cityData }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result === 'center' && this.mapComponent) {
        this.mapComponent.panTo(terminal.position);
        this.zoom = 12;
      }
    });
  }

  isShippingLayerVisible(): boolean {
    return this.mapStateService.isShippingLayerVisible();
  }
}

@Component({
  selector: 'terminal-details-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>business</mat-icon>
      Terminal {{ data.terminal.terminalNumber }} - {{ data.terminal.name }}
    </h2>

    <mat-dialog-content class="terminal-details-content">
      <div class="terminal-info-section">
        <h3>Terminal Information</h3>
        <div class="info-grid">
          <div class="info-item">
            <mat-icon>location_on</mat-icon>
            <div>
              <strong>Address:</strong><br>
              {{ data.terminal.address }}<br>
              {{ data.terminal.city }}, {{ data.terminal.state }} {{ data.terminal.zip }}
            </div>
          </div>

          <div class="info-item">
            <mat-icon>phone</mat-icon>
            <div>
              <strong>Phone:</strong><br>
              {{ data.terminal.phone }}
            </div>
          </div>

          <div class="info-item">
            <mat-icon>person</mat-icon>
            <div>
              <strong>Manager:</strong><br>
              {{ data.terminal.manager }}
            </div>
          </div>

          <div class="info-item">
            <mat-icon>build</mat-icon>
            <div>
              <strong>Shop Bays:</strong><br>
              {{ data.terminal.shopBays }}
            </div>
          </div>
        </div>
      </div>

      <div class="staff-section">
        <h3>
          <mat-icon>group</mat-icon>
          Staff Overview
        </h3>
        <div class="staff-grid">
          <div class="staff-item">
            <mat-icon>drive_eta</mat-icon>
            <div>
              <strong>Drivers</strong><br>
              {{ data.terminal.drivers }}
            </div>
          </div>
          <div class="staff-item">
            <mat-icon>build</mat-icon>
            <div>
              <strong>Shop Staff</strong><br>
              {{ data.terminal.shop }}
            </div>
          </div>
          <div class="staff-item">
            <mat-icon>people</mat-icon>
            <div>
              <strong>Other Staff</strong><br>
              {{ data.terminal.other }}
            </div>
          </div>
          <div class="staff-item total-staff">
            <mat-icon>group</mat-icon>
            <div>
              <strong>Total Staff</strong><br>
              {{ data.terminal.total }}
            </div>
          </div>
        </div>
      </div>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Close</button>
      <button mat-raised-button color="primary" (click)="centerOnTerminal()">
        <mat-icon>my_location</mat-icon>
        Center on Map
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .terminal-details-content {
      max-height: 70vh;
      overflow-y: auto;
    }

    .terminal-info-section, .staff-section {
      margin: 16px 0;
    }

    h3 {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 16px;
      color: #3f51b5;
    }

    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .info-item {
      display: flex;
      gap: 12px;
      align-items: flex-start;

      mat-icon {
        color: #666;
        margin-top: 2px;
      }
    }

    .staff-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }

    .staff-item {
      display: flex;
      gap: 12px;
      align-items: center;
      padding: 12px;
      border: 1px solid rgba(0,0,0,0.12);
      border-radius: 8px;

      &.total-staff {
        background-color: #e8f5e8;
        border-color: #4caf50;

        mat-icon {
          color: #4caf50;
        }
      }

      mat-icon {
        color: #666;
      }
    }
  `]
})
export class TerminalDetailsDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<TerminalDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  centerOnTerminal() {
    this.dialogRef.close('center');
  }
}

import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { GoogleMap } from '@angular/google-maps';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';
import { trigger, state, style, transition, animate } from '@angular/animations';

export interface Terminal {
  id: string;
  name: string;
  terminalNumber: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  manager: string;
  drivers: number;
  shop: number;
  other: number;
  total: number;
  opened: string;
  shopBays: string;
  facilityType: string;
  primaryShippers: string;
  position: google.maps.LatLngLiteral;
}

export interface ShippingLocation {
  id: string;
  name: string;
  terminalSource: string;
  city: string;
  state: string;
  count: number;
  position: google.maps.LatLngLiteral;
}

export interface MapLayer {
  id: string;
  name: string;
  visible: boolean;
  color: string;
  icon: string;
  type: 'terminals' | 'shipping';
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({ height: '0px', overflow: 'hidden' }),
        animate('300ms ease-in-out', style({ height: '*' }))
      ]),
      transition(':leave', [
        animate('300ms ease-in-out', style({ height: '0px', overflow: 'hidden' }))
      ])
    ])
  ]
})
export class AppComponent implements OnInit {
  @ViewChild(GoogleMap) map!: GoogleMap;

  title = 'Open Inventory Tracker';
  isLoading = true;
  sidenavOpened = true;
  layerControlsVisible = false;

  // Map configuration
  center: google.maps.LatLngLiteral = { lat: 39.8283, lng: -98.5795 }; // US Center
  zoom = 5;
  mapOptions: google.maps.MapOptions = {
    mapTypeId: 'roadmap',
    zoomControl: true,
    scrollwheel: true,
    disableDoubleClickZoom: false,
    maxZoom: 20,
    minZoom: 3,
    styles: [],
  };

  // Data
  terminals: Terminal[] = [];
  shippingLocations: ShippingLocation[] = [];

  // Layers configuration
  layers: MapLayer[] = [
    {
      id: 'terminals',
      name: 'Terminal Locations',
      visible: true,
      color: '#C2185B',
      icon: 'business',
      type: 'terminals',
    },
    {
      id: 'shipping',
      name: 'Daily Shipping Destinations',
      visible: true,
      color: '#1A237E',
      icon: 'local_shipping',
      type: 'shipping',
    },
  ];

  // Selected terminal for filtering shipping locations
  selectedTerminal: string | null = null;

  // Track which terminals have expanded shipping details
  expandedShippingTerminals: Set<string> = new Set();

  // Map style options
  mapStyles = [
    { name: 'Default', value: [] },
    {
      name: 'Dark',
      value: [
        { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
        { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
        { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
      ],
    },
    { name: 'Satellite', value: [] },
  ];
  selectedMapStyle = this.mapStyles[0];

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private http: HttpClient
  ) {}

  async ngOnInit() {
    this.terminals = this.terminals || [];
    this.shippingLocations = this.shippingLocations || [];
    this.layers = this.layers || [];
    // Check if Google Maps is loaded
    if (typeof google === 'undefined') {
      this.snackBar.open(
        'Google Maps API not loaded. Please check your API key.',
        'Close',
        {
          duration: 5000,
        }
      );
    }
    await this.loadSampleData();
    this.isLoading = false;
  }

  async loadSampleData() {
    try {
      // Load both terminals and shipping data from static KML files
      const [terminalsResponse, shippingResponse] = await Promise.all([
        this.http.get('/assets/terminals.kml', { responseType: 'text' }).toPromise(),
        this.http.get('/assets/shipping.kml', { responseType: 'text' }).toPromise()
      ]);

      // Parse terminals KML
      if (terminalsResponse) {
        this.parseKML(terminalsResponse, "terminal");
      }
      console.log(shippingResponse);
      // Parse shipping KML
      if (shippingResponse) {
        this.parseKML(shippingResponse, "shipping");
      }

    } catch (error) {
      console.error('Error loading KML files:', error);
      // Fallback to hardcoded data if KML files fail
      this.loadFallbackData();
    }
  }

  private loadFallbackData() {
    // Fallback terminal data
    this.terminals = [
      {
        id: '1',
        name: 'Smyrna',
        terminalNumber: '95',
        address: '631 Enon Springs Road East',
        city: 'Smyrna',
        state: 'TN',
        zip: '37167',
        phone: '615-459-7393',
        manager: 'Wendy Ryan',
        drivers: 8,
        shop: 4,
        other: 2,
        total: 14,
        opened: '06/08/05',
        shopBays: '6 Bay Full Service Repair Facility',
        facilityType: 'Assembly Plant',
        primaryShippers: 'Nissan',
        position: { lat: 36.0086, lng: -86.5186 },
      },
      {
        id: '2',
        name: 'Cambridge',
        terminalNumber: '22',
        address: '123 Industrial Way',
        city: 'Cambridge',
        state: 'ON',
        zip: 'N1R 3G2',
        phone: '519-555-0123',
        manager: 'John Smith',
        drivers: 12,
        shop: 6,
        other: 3,
        total: 21,
        opened: '03/15/03',
        shopBays: '8 Bay Full Service Repair Facility',
        facilityType: 'Distribution Center',
        primaryShippers: 'Toyota, Honda',
        position: { lat: 43.3616, lng: -80.3144 },
      },
      {
        id: '3',
        name: 'Woodstock',
        terminalNumber: '23',
        address: '456 Transport Blvd',
        city: 'Woodstock',
        state: 'ON',
        zip: 'N4S 7V8',
        phone: '519-555-0456',
        manager: 'Sarah Johnson',
        drivers: 10,
        shop: 5,
        other: 2,
        total: 17,
        opened: '08/22/04',
        shopBays: '7 Bay Full Service Repair Facility',
        facilityType: 'Regional Hub',
        primaryShippers: 'Ford, GM',
        position: { lat: 43.1315, lng: -80.7464 },
      },
    ];

    // Fallback shipping data
    this.shippingLocations = [
      {
        id: '1',
        name: 'Niagara, NY (82)',
        terminalSource: '22 - CAMBRIDGE',
        city: 'Niagara',
        state: 'NY',
        count: 82,
        position: { lat: 43.0962, lng: -79.0377 },
      },
      {
        id: '2',
        name: 'Woodstock, ON (3)',
        terminalSource: '22 - CAMBRIDGE',
        city: 'Woodstock',
        state: 'ON',
        count: 3,
        position: { lat: 43.1315, lng: -80.7464 },
      },
      {
        id: '3',
        name: 'Niagara, NY (26)',
        terminalSource: '23 - WOODSTOCK',
        city: 'Niagara',
        state: 'NY',
        count: 26,
        position: { lat: 43.0962, lng: -79.0377 },
      },
      {
        id: '4',
        name: 'Buffalo, NY (45)',
        terminalSource: '22 - CAMBRIDGE',
        city: 'Buffalo',
        state: 'NY',
        count: 45,
        position: { lat: 42.8864, lng: -78.8784 },
      },
      {
        id: '5',
        name: 'Detroit, MI (67)',
        terminalSource: '23 - WOODSTOCK',
        city: 'Detroit',
        state: 'MI',
        count: 67,
        position: { lat: 42.3314, lng: -83.0458 },
      },
    ];
  }

  toggleLayer(layer: MapLayer) {
    layer.visible = !layer.visible;
  }

  toggleLayerControls() {
    this.layerControlsVisible = !this.layerControlsVisible;
  }

  getVisibleTerminals(): Terminal[] {
    if (!this.terminals) return [];
    const terminalLayer = this.layers.find((l) => l.type === 'terminals');
    return terminalLayer?.visible ? this.terminals : [];
  }

  getVisibleShippingLocations(): ShippingLocation[] {
    if (!this.shippingLocations) return [];
    const shippingLayer = this.layers.find((l) => l.type === 'shipping');
    if (!shippingLayer?.visible) return [];

    if (this.selectedTerminal) {
      return this.shippingLocations.filter((loc) =>
        loc.terminalSource === this.selectedTerminal!
      );
    }
    return this.shippingLocations;
  }

  onTerminalClick(terminal: Terminal) {
    this.selectedTerminal =
      this.selectedTerminal === terminal.terminalNumber
        ? null
        : terminal.terminalNumber;
    this.showTerminalInfo(terminal);
    // Clear caches when selection changes
    this.shippingMarkerCache.clear();
    this.terminalMarkerCache.clear();
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
    Shipments: ${location.count}`;

    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: 'shipping-snackbar',
    });
  }

  centerOnTerminals() {
    if (this.terminals.length === 0 || !this.map) return;

    if (
      typeof google !== 'undefined' &&
      google.maps &&
      google.maps.LatLngBounds
    ) {
      const bounds = new google.maps.LatLngBounds();
      this.terminals.forEach((terminal) => bounds.extend(terminal.position));
      this.map.fitBounds(bounds);
    }
  }

  centerOnShipping() {
    const visibleLocations = this.getVisibleShippingLocations();
    if (visibleLocations.length === 0 || !this.map) return;

    if (
      typeof google !== 'undefined' &&
      google.maps &&
      google.maps.LatLngBounds
    ) {
      const bounds = new google.maps.LatLngBounds();
      visibleLocations.forEach((location) => bounds.extend(location.position));
      this.map.fitBounds(bounds);
    }
  }

  exportData() {
    const data = {
      terminals: this.terminals,
      shippingLocations: this.shippingLocations,
      exportDate: new Date().toISOString(),
    };

    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'terminal-shipping-data.json';
    link.click();
    URL.revokeObjectURL(url);
  }

  parseKML(kmlText: string, kmlType: string) {
    // Basic KML parsing - you can enhance this based on your needs
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(kmlText, 'text/xml');
    const placemarks = xmlDoc.getElementsByTagName('Placemark');
    console.log(placemarks);
    const newTerminals: Terminal[] = [];
    const newShippingLocations: ShippingLocation[] = [];

    Array.from(placemarks).forEach((placemark, index) => {
      const name = placemark.getElementsByTagName('name')[0]?.textContent || '';
      const coordinates =
        placemark.getElementsByTagName('coordinates')[0]?.textContent;
      if (coordinates) {
        const [lng, lat] = coordinates.trim().split(',').map(Number);
        const position = { lat, lng };

        // Check if this is a terminal or shipping location based on ExtendedData
        const extendedData = placemark.getElementsByTagName('Data');

        if (kmlType == "terminal") {
          console.log('this is a terminal');
          // This is a terminal
          const terminal: Terminal = {
            id: (index + 1).toString(),
            name,
            terminalNumber:
              this.getExtendedDataValue(extendedData, 'Term') || '',
            address: this.getExtendedDataValue(extendedData, 'Address') || '',
            city: this.getExtendedDataValue(extendedData, 'City') || '',
            state: this.getExtendedDataValue(extendedData, 'ST') || '',
            zip: this.getExtendedDataValue(extendedData, 'ZIP') || '',
            phone: this.getExtendedDataValue(extendedData, 'Phone') || '',
            manager: this.getExtendedDataValue(extendedData, 'Manager') || '',
            drivers: parseInt(
              this.getExtendedDataValue(extendedData, 'Drivers') || '0'
            ),
            shop: parseInt(
              this.getExtendedDataValue(extendedData, 'Shop') || '0'
            ),
            other: parseInt(
              this.getExtendedDataValue(extendedData, 'Other') || '0'
            ),
            total: parseInt(
              this.getExtendedDataValue(extendedData, 'Total') || '0'
            ),
            opened: this.getExtendedDataValue(extendedData, 'Opened') || '',
            shopBays:
              this.getExtendedDataValue(extendedData, 'Shop Bays') || '',
            facilityType:
              this.getExtendedDataValue(extendedData, 'Facility Type') || '',
            primaryShippers:
              this.getExtendedDataValue(extendedData, 'Primary Shippers') || '',
            position,
          };
          newTerminals.push(terminal);
        } else {
          // This is a shipping location
          console.log('this is a shipping location');

          const terminalSourceValue = this.getExtendedDataValue(extendedData, 'Trm');
          const shippingLocation: ShippingLocation = {
            id: (index + 1).toString(),
            name,
            terminalSource: terminalSourceValue.split(' - ')[0] || '',
            city: this.getExtendedDataValue(extendedData, 'City') || '',
            state: this.getExtendedDataValue(extendedData, 'State') || '',
            count: parseInt(
              this.getExtendedDataValue(extendedData, 'Count') || '0'
            ),
            position,
          };
          newShippingLocations.push(shippingLocation);
        }
      }
    });

    if (newTerminals.length > 0) {
      this.terminals = newTerminals;
    }
    if (newShippingLocations.length > 0) {
      this.shippingLocations = newShippingLocations;
    }

    // Trigger change detection and refresh the map view
    setTimeout(() => {
      if (this.terminals.length > 0 || this.shippingLocations.length > 0) {
        this.centerOnTerminals();
      }
    }, 100);
  }

  private getExtendedDataValue(
    extendedData: HTMLCollectionOf<Element>,
    name: string
  ): string {
    const dataElement = Array.from(extendedData).find(
      (data) => data.getAttribute('name') === name
    );
    return dataElement?.getElementsByTagName('value')[0]?.textContent || '';
  }

  getTerminalsCount(): number {
    return this.terminals ? this.terminals.length : 0;
  }

  getVisibleShippingCount(): number {
    return this.getVisibleShippingLocations().length;
  }

  getTerminalByNumber(terminalNumber: string): Terminal | undefined {
    return this.terminals.find((t) => t.terminalNumber === terminalNumber);
  }

  getShippingCountByTerminal(terminalNumber: string): number {
    return this.shippingLocations
      .filter((loc) => loc.terminalSource === terminalNumber)
      .reduce((sum, loc) => sum + loc.count, 0);
  }

  getTerminalTitle(terminal: Terminal): string {
    return `Terminal ${terminal.terminalNumber} - ${terminal.name}`;
  }

  getTerminalMarkerOptions(terminal: Terminal): google.maps.MarkerOptions {
    const isSelected = this.selectedTerminal === terminal.terminalNumber;

    // Create cache key based on all visual properties
    const cacheKey = `${terminal.id}-${isSelected}`;

    // Return cached result if available
    if (this.terminalMarkerCache.has(cacheKey)) {
      return this.terminalMarkerCache.get(cacheKey)!;
    }

    const size = isSelected ? 32 : 24;
    const circleRadius = size / 2 - 2;

    const markerOptions = {
      icon: {
        url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
          <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
            ${isSelected ? `<circle cx="${size/2}" cy="${size/2}" r="${size/2 - 1}" fill="none" stroke="white" stroke-width="4" opacity="0.8"/>` : ''}
            <circle cx="${size/2}" cy="${size/2}" r="${circleRadius}" fill="#1976D2" stroke="white" stroke-width="2"/>
            <g transform="translate(${(size-16)/2}, ${(size-16)/2})">
              <path d="M8 1L3 6v9a1 1 0 0 0 1 1h3v-6h2v6h3a1 1 0 0 0 1-1V6L8 1z" fill="white"/>
            </g>
          </svg>
        `)}`,
        scaledSize: new google.maps.Size(size, size),
        anchor: new google.maps.Point(size / 2, size / 2),
      },
      zIndex: isSelected ? 1000 : 100,
    };

    // Cache the result
    this.terminalMarkerCache.set(cacheKey, markerOptions);
    return markerOptions;
  }

  private shippingMarkerCache = new Map<string, google.maps.MarkerOptions>();
  private terminalMarkerCache = new Map<string, google.maps.MarkerOptions>();

  getShippingMarkerOptions(
    location: ShippingLocation
  ): google.maps.MarkerOptions {
    // Check if this location's terminal is selected
    const isSelected = this.selectedTerminal === location.terminalSource;

    // Create cache key based on all visual properties
    const cacheKey = `${location.id}-${location.count}-${isSelected}`;

    // Return cached result if available
    if (this.shippingMarkerCache.has(cacheKey)) {
      return this.shippingMarkerCache.get(cacheKey)!;
    }

    // Auto-choose color based on terminal source or shipment count
    const color = this.getAutoShippingColor(location);

    // Scale marker size based on shipment count for scatter plot effect
    const baseSize = 8;
    const maxSize = 25;
    const size = Math.max(baseSize, Math.min(baseSize + (location.count / 5), maxSize));

    // Highlight selected terminal's markers
    const strokeWidth = isSelected ? 3 : 1.5;
    const strokeColor = isSelected ? '#FFEB3B' : 'rgba(255,255,255,0.8)';
    const opacity = isSelected ? 1.0 : 0.8;

    // Create scatter plot style circular marker
    const markerOptions = {
      icon: {
        url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
          <svg xmlns="http://www.w3.org/2000/svg" width="${size * 2}" height="${size * 2}" viewBox="0 0 ${size * 2} ${size * 2}">
            <circle cx="${size}" cy="${size}" r="${size - 1}" fill="${color}" stroke="${strokeColor}" stroke-width="${strokeWidth}" opacity="${opacity}"/>
          </svg>
        `)}`,
        scaledSize: new google.maps.Size(size * 2, size * 2),
        anchor: new google.maps.Point(size, size),
      },
      zIndex: isSelected ? 500 : 50,
    };

    // Cache the result
    this.shippingMarkerCache.set(cacheKey, markerOptions);
    return markerOptions;
  }
  getAutoShippingColor(location: ShippingLocation): string {
    const count = location.count;
    if (count > 45) return '#F44336';
    if (count > 40) return '#FF5722';
    if (count > 35) return '#FF9800';
    if (count > 30) return '#FFC107';
    if (count > 25) return '#FFEB3B';
    if (count > 20) return '#CDDC39';
    if (count > 15) return '#8BC34A';
    if (count > 10) return '#4CAF50';
    if (count > 5) return '#00BCD4';
    return '#2196F3';
  }

  onTerminalFilterChange(terminalNumber: string | null) {
    this.selectedTerminal = terminalNumber;
    // Clear caches when selection changes
    this.shippingMarkerCache.clear();
    this.terminalMarkerCache.clear();
  }

  clearSelection() {
    this.selectedTerminal = null;
    // Clear caches when selection changes
    this.shippingMarkerCache.clear();
    this.terminalMarkerCache.clear();
  }

  isTerminalsLayerVisible(): boolean {
    const layer = this.layers.find((l) => l.type === 'terminals');
    return layer ? layer.visible : false;
  }

  isShippingLayerVisible(): boolean {
    const layer = this.layers.find((l) => l.type === 'shipping');
    return layer ? layer.visible : false;
  }

  getShippingLayerColor(): string {
    const layer = this.layers.find((l) => l.type === 'shipping');
    return layer ? layer.color : '';
  }

  getTerminalLayerColor(): string {
    const layer = this.layers.find((l) => l.type === 'terminals');
    return layer ? layer.color : '';
  }

  getTotalTerminals(): number {
    if (!this.terminals || this.terminals.length === 0) {
      return 0;
    }
    return this.terminals.reduce((sum, t) => sum + t.total, 0);
  }
  getTotalShipments(): number {
    if (!this.shippingLocations || this.shippingLocations.length === 0) {
      return 0;
    }
    return this.shippingLocations.reduce((sum, loc) => sum + loc.count, 0);
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
      data: {
        terminal: terminal,
        cityData: cityData
      }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result === 'center' && this.map) {
        this.map.panTo(terminal.position);
        this.zoom = 12;
      }
    });
  }

  getShippingCitiesByTerminal(terminalNumber: string): {city: string, state: string, count: number}[] {
    return this.shippingLocations
      .filter(loc => loc.terminalSource === terminalNumber)
      .map(loc => ({
        city: loc.city,
        state: loc.state,
        count: loc.count
      }))
      .sort((a, b) => b.count - a.count);
  }
}

@Component({
  selector: 'terminal-details-dialog',
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

  getTotalShipments(): number {
    return this.data.cityData.reduce((sum: number, city: any) => sum + city.count, 0);
  }
}

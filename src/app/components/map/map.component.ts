import { Component, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { GoogleMap } from '@angular/google-maps';
import { Terminal, ShippingLocation } from '../../services/terminal.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent {
  @ViewChild(GoogleMap) map!: GoogleMap;

  @Input() center: google.maps.LatLngLiteral = { lat: 39.8283, lng: -98.5795 };
  @Input() zoom: number = 5;
  @Input() terminals: Terminal[] = [];
  @Input() shippingLocations: ShippingLocation[] = [];
  @Input() selectedTerminal: string | null = null;
  @Input() isLoading: boolean = false;
  @Input() isShippingLayerVisible: boolean = true;

  @Output() terminalClicked = new EventEmitter<Terminal>();
  @Output() shippingClicked = new EventEmitter<ShippingLocation>();

  mapOptions: google.maps.MapOptions = {
    mapTypeId: 'roadmap',
    zoomControl: true,
    scrollwheel: true,
    disableDoubleClickZoom: false,
    maxZoom: 20,
    minZoom: 3,
    styles: [],
  };

  private shippingMarkerCache = new Map<string, google.maps.MarkerOptions>();
  private terminalMarkerCache = new Map<string, google.maps.MarkerOptions>();

  onTerminalClick(terminal: Terminal): void {
    this.terminalClicked.emit(terminal);
  }

  onShippingClick(location: ShippingLocation): void {
    this.shippingClicked.emit(location);
  }

  getTerminalTitle(terminal: Terminal): string {
    return `Terminal ${terminal.terminalNumber} - ${terminal.name}`;
  }

  getTerminalMarkerOptions(terminal: Terminal): google.maps.MarkerOptions {
    const isSelected = this.selectedTerminal === terminal.terminalNumber;
    const cacheKey = `${terminal.id}-${isSelected}`;

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

    this.terminalMarkerCache.set(cacheKey, markerOptions);
    return markerOptions;
  }

  getShippingMarkerOptions(location: ShippingLocation): google.maps.MarkerOptions {
    const isSelected = this.selectedTerminal === location.terminalSource;
    const cacheKey = `${location.id}-${location.count}-${isSelected}`;

    if (this.shippingMarkerCache.has(cacheKey)) {
      return this.shippingMarkerCache.get(cacheKey)!;
    }

    const color = this.getAutoShippingColor(location);
    const baseSize = 8;
    const maxSize = 25;
    const size = Math.max(baseSize, Math.min(baseSize + (location.count / 5), maxSize));

    const strokeWidth = isSelected ? 3 : 1.5;
    const strokeColor = isSelected ? '#FFEB3B' : 'rgba(255,255,255,0.8)';
    const opacity = isSelected ? 1.0 : 0.8;

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

  clearMarkerCache(): void {
    this.shippingMarkerCache.clear();
    this.terminalMarkerCache.clear();
  }

  fitBoundsToTerminals(): void {
    if (this.terminals.length === 0 || !this.map) return;

    if (typeof google !== 'undefined' && google.maps && google.maps.LatLngBounds) {
      const bounds = new google.maps.LatLngBounds();
      this.terminals.forEach((terminal) => bounds.extend(terminal.position));
      this.map.fitBounds(bounds);
    }
  }

  fitBoundsToShipping(): void {
    if (this.shippingLocations.length === 0 || !this.map) return;

    if (typeof google !== 'undefined' && google.maps && google.maps.LatLngBounds) {
      const bounds = new google.maps.LatLngBounds();
      this.shippingLocations.forEach((location) => bounds.extend(location.position));
      this.map.fitBounds(bounds);
    }
  }

  panTo(position: google.maps.LatLngLiteral): void {
    if (this.map) {
      this.map.panTo(position);
    }
  }
}

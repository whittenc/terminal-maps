import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

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

@Injectable({
  providedIn: 'root'
})
export class TerminalService {
  private terminalsSubject = new BehaviorSubject<Terminal[]>([]);
  private shippingLocationsSubject = new BehaviorSubject<ShippingLocation[]>([]);

  terminals$ = this.terminalsSubject.asObservable();
  shippingLocations$ = this.shippingLocationsSubject.asObservable();

  constructor() {}

  getTerminals(): Terminal[] {
    return this.terminalsSubject.value;
  }

  getShippingLocations(): ShippingLocation[] {
    return this.shippingLocationsSubject.value;
  }

  setTerminals(terminals: Terminal[]): void {
    this.terminalsSubject.next(terminals);
  }

  setShippingLocations(locations: ShippingLocation[]): void {
    this.shippingLocationsSubject.next(locations);
  }

  getTerminalByNumber(terminalNumber: string): Terminal | undefined {
    return this.terminalsSubject.value.find((t) => t.terminalNumber === terminalNumber);
  }

  getShippingCountByTerminal(terminalNumber: string): number {
    return this.shippingLocationsSubject.value
      .filter((loc) => loc.terminalSource === terminalNumber)
      .reduce((sum, loc) => sum + loc.count, 0);
  }

  getShippingCitiesByTerminal(terminalNumber: string): {city: string, state: string, count: number}[] {
    return this.shippingLocationsSubject.value
      .filter(loc => loc.terminalSource === terminalNumber)
      .map(loc => ({
        city: loc.city,
        state: loc.state,
        count: loc.count
      }))
      .sort((a, b) => b.count - a.count);
  }

  getTotalUnits(): number {
    const locations = this.shippingLocationsSubject.value;
    if (!locations || locations.length === 0) {
      return 0;
    }
    return locations.reduce((sum, loc) => sum + loc.count, 0);
  }

  getTotalTerminalStaff(): number {
    const terminals = this.terminalsSubject.value;
    if (!terminals || terminals.length === 0) {
      return 0;
    }
    return terminals.reduce((sum, t) => sum + t.total, 0);
  }

  loadFallbackData(): void {
    const terminals: Terminal[] = [
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

    const shippingLocations: ShippingLocation[] = [
      {
        id: '1',
        name: 'Niagara, NY (82)',
        terminalSource: '22',
        city: 'Niagara',
        state: 'NY',
        count: 82,
        position: { lat: 43.0962, lng: -79.0377 },
      },
      {
        id: '2',
        name: 'Woodstock, ON (3)',
        terminalSource: '22',
        city: 'Woodstock',
        state: 'ON',
        count: 3,
        position: { lat: 43.1315, lng: -80.7464 },
      },
      {
        id: '3',
        name: 'Niagara, NY (26)',
        terminalSource: '23',
        city: 'Niagara',
        state: 'NY',
        count: 26,
        position: { lat: 43.0962, lng: -79.0377 },
      },
      {
        id: '4',
        name: 'Buffalo, NY (45)',
        terminalSource: '22',
        city: 'Buffalo',
        state: 'NY',
        count: 45,
        position: { lat: 42.8864, lng: -78.8784 },
      },
      {
        id: '5',
        name: 'Detroit, MI (67)',
        terminalSource: '23',
        city: 'Detroit',
        state: 'MI',
        count: 67,
        position: { lat: 42.3314, lng: -83.0458 },
      },
    ];

    this.setTerminals(terminals);
    this.setShippingLocations(shippingLocations);
  }
}

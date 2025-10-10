import { Injectable } from '@angular/core';
import { Terminal, ShippingLocation } from './terminal.service';

@Injectable({
  providedIn: 'root'
})
export class KmlParserService {

  constructor() {}

  parseKML(kmlText: string, kmlType: 'terminal' | 'shipping'): { terminals: Terminal[], shippingLocations: ShippingLocation[] } {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(kmlText, 'text/xml');
    const placemarks = xmlDoc.getElementsByTagName('Placemark');
    const newTerminals: Terminal[] = [];
    const newShippingLocations: ShippingLocation[] = [];

    Array.from(placemarks).forEach((placemark, index) => {
      const name = placemark.getElementsByTagName('name')[0]?.textContent || '';
      const coordinates = placemark.getElementsByTagName('coordinates')[0]?.textContent;

      if (coordinates) {
        const [lng, lat] = coordinates.trim().split(',').map(Number);
        const position = { lat, lng };

        const extendedData = placemark.getElementsByTagName('Data');

        if (kmlType === 'terminal') {
          const terminal: Terminal = {
            id: (index + 1).toString(),
            name,
            terminalNumber: this.getExtendedDataValue(extendedData, 'Term') || '',
            address: this.getExtendedDataValue(extendedData, 'Address') || '',
            city: this.getExtendedDataValue(extendedData, 'City') || '',
            state: this.getExtendedDataValue(extendedData, 'ST') || '',
            zip: this.getExtendedDataValue(extendedData, 'ZIP') || '',
            phone: this.getExtendedDataValue(extendedData, 'Phone') || '',
            manager: this.getExtendedDataValue(extendedData, 'Manager') || '',
            drivers: parseInt(this.getExtendedDataValue(extendedData, 'Drivers') || '0'),
            shop: parseInt(this.getExtendedDataValue(extendedData, 'Shop') || '0'),
            other: parseInt(this.getExtendedDataValue(extendedData, 'Other') || '0'),
            total: parseInt(this.getExtendedDataValue(extendedData, 'Total') || '0'),
            opened: this.getExtendedDataValue(extendedData, 'Opened') || '',
            shopBays: this.getExtendedDataValue(extendedData, 'Shop Bays') || '',
            facilityType: this.getExtendedDataValue(extendedData, 'Facility Type') || '',
            primaryShippers: this.getExtendedDataValue(extendedData, 'Primary Shippers') || '',
            position,
          };
          newTerminals.push(terminal);
        } else {
          const terminalSourceValue = this.getExtendedDataValue(extendedData, 'Trm');
          const shippingLocation: ShippingLocation = {
            id: (index + 1).toString(),
            name,
            terminalSource: terminalSourceValue.split(' - ')[0] || '',
            city: this.getExtendedDataValue(extendedData, 'City') || '',
            state: this.getExtendedDataValue(extendedData, 'State') || '',
            count: parseInt(this.getExtendedDataValue(extendedData, 'Count') || '0'),
            position,
          };
          newShippingLocations.push(shippingLocation);
        }
      }
    });

    return { terminals: newTerminals, shippingLocations: newShippingLocations };
  }

  private getExtendedDataValue(extendedData: HTMLCollectionOf<Element>, name: string): string {
    const dataElement = Array.from(extendedData).find(
      (data) => data.getAttribute('name') === name
    );
    return dataElement?.getElementsByTagName('value')[0]?.textContent || '';
  }
}

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface MapLayer {
  id: string;
  name: string;
  visible: boolean;
  color: string;
  icon: string;
  type: 'terminals' | 'shipping';
}

@Injectable({
  providedIn: 'root'
})
export class MapStateService {
  private selectedTerminalSubject = new BehaviorSubject<string | null>(null);
  private layersSubject = new BehaviorSubject<MapLayer[]>([
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
  ]);

  selectedTerminal$ = this.selectedTerminalSubject.asObservable();
  layers$ = this.layersSubject.asObservable();

  constructor() {}

  getSelectedTerminal(): string | null {
    return this.selectedTerminalSubject.value;
  }

  setSelectedTerminal(terminalNumber: string | null): void {
    this.selectedTerminalSubject.next(terminalNumber);
  }

  getLayers(): MapLayer[] {
    return this.layersSubject.value;
  }

  toggleLayer(layer: MapLayer): void {
    layer.visible = !layer.visible;
    this.layersSubject.next([...this.layersSubject.value]);
  }

  isTerminalsLayerVisible(): boolean {
    const layer = this.layersSubject.value.find((l) => l.type === 'terminals');
    return layer ? layer.visible : false;
  }

  isShippingLayerVisible(): boolean {
    const layer = this.layersSubject.value.find((l) => l.type === 'shipping');
    return layer ? layer.visible : false;
  }
}

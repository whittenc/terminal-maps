import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MapLayer } from '../../services/map-state.service';

@Component({
  selector: 'app-layer-control',
  templateUrl: './layer-control.component.html',
  styleUrls: ['./layer-control.component.scss']
})
export class LayerControlComponent {
  @Input() visible: boolean = false;
  @Input() layers: MapLayer[] = [];
  @Output() layerToggled = new EventEmitter<MapLayer>();

  onToggleLayer(layer: MapLayer): void {
    this.layerToggled.emit(layer);
  }
}

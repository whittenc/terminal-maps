import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MapLayer } from '../../services/map-state.service';

@Component({
  selector: 'app-layer-control',
  standalone: true,
  imports: [
    CommonModule,
    MatCheckboxModule,
    MatIconModule
  ],
  templateUrl: './layer-control.component.html',
  styleUrls: ['./layer-control.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LayerControlComponent {
  @Input() visible: boolean = false;
  @Input() layers: MapLayer[] = [];
  @Output() layerToggled = new EventEmitter<MapLayer>();

  onToggleLayer(layer: MapLayer): void {
    this.layerToggled.emit(layer);
  }
}

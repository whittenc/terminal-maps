import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { Terminal, ShippingLocation, TerminalService } from '../../services/terminal.service';
import { MapStateService, MapLayer } from '../../services/map-state.service';
import { MapComponent } from '../../components/map/map.component';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { LayerControlComponent } from '../../components/layer-control/layer-control.component';
import { TerminalDetailsDialogComponent } from '../../shared/dialogs/terminal-details-dialog.component';

@Component({
  selector: 'app-map-view',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatDialogModule,
    MatSnackBarModule,
    MapComponent,
    SidebarComponent,
    LayerControlComponent
  ],
  templateUrl: './map-view.component.html',
  styleUrls: ['./map-view.component.scss']
})
export class MapViewComponent implements OnInit {
  @ViewChild(MapComponent) mapComponent!: MapComponent;

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
    private terminalService: TerminalService,
    private mapStateService: MapStateService
  ) {}

  ngOnInit() {
    // Subscribe to services
    this.terminalService.terminals$.subscribe(terminals => {
      this.terminals = terminals;
    });

    this.terminalService.shippingLocations$.subscribe(locations => {
      this.shippingLocations = locations;
    });

    this.mapStateService.layers$.subscribe(layers => {
      this.layers = layers;
    });

    this.mapStateService.selectedTerminal$.subscribe(selected => {
      this.selectedTerminal = selected;
      if (this.mapComponent) {
        this.mapComponent.clearMarkerCache();
      }
    });

    // Fit bounds after a short delay to ensure map is initialized
    setTimeout(() => {
      if (this.terminals.length > 0 && this.mapComponent) {
        this.mapComponent.fitBoundsToTerminals();
      }
    }, 100);
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

    dialogRef.afterClosed().subscribe((result: string | null) => {
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

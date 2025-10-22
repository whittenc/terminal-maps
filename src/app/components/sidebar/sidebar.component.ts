import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Terminal } from '../../services/terminal.service';
import { TerminalFilterComponent } from '../terminal-filter/terminal-filter.component';
import { trigger, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatDividerModule,
    MatIconModule,
    MatButtonModule,
    TerminalFilterComponent
  ],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
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
export class SidebarComponent {
  @Input() terminals: Terminal[] = [];
  @Input() selectedTerminal: string | null = null;
  @Input() expandedShippingTerminals: Set<string> = new Set();

  @Output() terminalFilterChanged = new EventEmitter<string | null>();
  @Output() terminalClicked = new EventEmitter<Terminal>();
  @Output() terminalDetailsRequested = new EventEmitter<{ terminal: Terminal, event: Event }>();
  @Output() shippingToggled = new EventEmitter<{ terminal: Terminal, event: Event }>();

  onFilterChange(terminalNumber: string | null): void {
    this.terminalFilterChanged.emit(terminalNumber);
  }

  onTerminalClick(terminal: Terminal): void {
    this.terminalClicked.emit(terminal);
  }

  onShowDetails(terminal: Terminal, event: Event): void {
    this.terminalDetailsRequested.emit({ terminal, event });
  }

  onToggleShipping(terminal: Terminal, event: Event): void {
    this.shippingToggled.emit({ terminal, event });
  }

  isShippingExpanded(terminalNumber: string): boolean {
    return this.expandedShippingTerminals.has(terminalNumber);
  }

  clearSelection(): void {
    this.terminalFilterChanged.emit(null);
  }

  // These methods will be called from the template and need access to parent data
  // We'll use @Input for the service methods results
  @Input() getShippingCountByTerminal!: (terminalNumber: string) => number;
  @Input() getShippingCitiesByTerminal!: (terminalNumber: string) => {city: string, state: string, count: number}[];
}

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Terminal } from '../../services/terminal.service';

@Component({
  selector: 'app-terminal-filter',
  templateUrl: './terminal-filter.component.html',
  styleUrls: ['./terminal-filter.component.scss']
})
export class TerminalFilterComponent {
  @Input() terminals: Terminal[] = [];
  @Input() selectedTerminal: string | null = null;
  @Output() selectionChanged = new EventEmitter<string | null>();

  onSelectionChange(value: string | null): void {
    this.selectionChanged.emit(value);
  }

  clearSelection(): void {
    this.selectionChanged.emit(null);
  }
}

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { Terminal } from '../../services/terminal.service';

@Component({
  selector: 'app-terminal-filter',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule
  ],
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

import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Terminal } from '../../services/terminal.service';

export interface TerminalDetailsDialogData {
  terminal: Terminal;
  cityData: { city: string; state: string; count: number }[];
}

@Component({
  selector: 'app-terminal-details-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>business</mat-icon>
      Terminal {{ data.terminal.terminalNumber }} - {{ data.terminal.name }}
    </h2>

    <mat-dialog-content class="terminal-details-content">
      <div class="terminal-info-section">
        <h3>Terminal Information</h3>
        <div class="info-grid">
          <div class="info-item">
            <mat-icon>location_on</mat-icon>
            <div>
              <strong>Address:</strong><br>
              {{ data.terminal.address }}<br>
              {{ data.terminal.city }}, {{ data.terminal.state }} {{ data.terminal.zip }}
            </div>
          </div>

          <div class="info-item">
            <mat-icon>phone</mat-icon>
            <div>
              <strong>Phone:</strong><br>
              {{ data.terminal.phone }}
            </div>
          </div>

          <div class="info-item">
            <mat-icon>person</mat-icon>
            <div>
              <strong>Manager:</strong><br>
              {{ data.terminal.manager }}
            </div>
          </div>

          <div class="info-item">
            <mat-icon>build</mat-icon>
            <div>
              <strong>Shop Bays:</strong><br>
              {{ data.terminal.shopBays }}
            </div>
          </div>
        </div>
      </div>

      <div class="staff-section">
        <h3>
          <mat-icon>group</mat-icon>
          Staff Overview
        </h3>
        <div class="staff-grid">
          <div class="staff-item">
            <mat-icon>drive_eta</mat-icon>
            <div>
              <strong>Drivers</strong><br>
              {{ data.terminal.drivers }}
            </div>
          </div>
          <div class="staff-item">
            <mat-icon>build</mat-icon>
            <div>
              <strong>Shop Staff</strong><br>
              {{ data.terminal.shop }}
            </div>
          </div>
          <div class="staff-item">
            <mat-icon>people</mat-icon>
            <div>
              <strong>Other Staff</strong><br>
              {{ data.terminal.other }}
            </div>
          </div>
          <div class="staff-item total-staff">
            <mat-icon>group</mat-icon>
            <div>
              <strong>Total Staff</strong><br>
              {{ data.terminal.total }}
            </div>
          </div>
        </div>
      </div>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Close</button>
      <button mat-raised-button color="primary" (click)="centerOnTerminal()">
        <mat-icon>my_location</mat-icon>
        Center on Map
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .terminal-details-content {
      max-height: 70vh;
      overflow-y: auto;
    }

    .terminal-info-section, .staff-section {
      margin: 16px 0;
    }

    h3 {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 16px;
      color: #3f51b5;
    }

    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .info-item {
      display: flex;
      gap: 12px;
      align-items: flex-start;

      mat-icon {
        color: #666;
        margin-top: 2px;
      }
    }

    .staff-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }

    .staff-item {
      display: flex;
      gap: 12px;
      align-items: center;
      padding: 12px;
      border: 1px solid rgba(0,0,0,0.12);
      border-radius: 8px;

      &.total-staff {
        background-color: #e8f5e8;
        border-color: #4caf50;

        mat-icon {
          color: #4caf50;
        }
      }

      mat-icon {
        color: #666;
      }
    }
  `]
})
export class TerminalDetailsDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<TerminalDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: TerminalDetailsDialogData
  ) {}

  centerOnTerminal() {
    this.dialogRef.close('center');
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { TerminalService, Terminal, ShippingLocation } from '../../services/terminal.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  terminals: Terminal[] = [];
  shippingLocations: ShippingLocation[] = [];
  totalTerminals = 0;
  totalShippingLocations = 0;
  totalUnits = 0;

  constructor(
    private terminalService: TerminalService,
    private router: Router
  ) {}

  ngOnInit() {
    this.terminalService.terminals$.subscribe(terminals => {
      this.terminals = terminals;
      this.totalTerminals = terminals.length;
    });

    this.terminalService.shippingLocations$.subscribe(locations => {
      this.shippingLocations = locations;
      this.totalShippingLocations = locations.length;
      this.totalUnits = this.terminalService.getTotalUnits();
    });
  }

  viewMap() {
    this.router.navigate(['/map']);
  }

  getTopTerminalsByShipping(): { terminal: Terminal; count: number }[] {
    return this.terminals
      .map(terminal => ({
        terminal,
        count: this.terminalService.getShippingCountByTerminal(terminal.terminalNumber)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }
}

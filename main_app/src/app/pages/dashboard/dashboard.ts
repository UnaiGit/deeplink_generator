import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Topcards } from './components/topcards/topcards';
import { Chart } from './components/chart/chart';
import { Mapcard } from './components/mapcard/mapcard';
import { Reportcard } from './components/reportcard/reportcard';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [TranslateModule, Topcards, Chart, Mapcard, Reportcard],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss'],
})
export class Dashboard {}

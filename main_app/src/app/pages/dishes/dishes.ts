import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Topcards } from './components/topcards/topcards';
import { Hotkitchen } from './components/hotkitchen/hotkitchen';
import { Bar } from './components/bar/bar';
import { Pastry } from './components/pastry/pastry';
import { Department } from './components/department/department';

@Component({
  selector: 'app-dishes',
  imports: [TranslateModule, Topcards, Hotkitchen, Bar, Pastry, Department],
  templateUrl: './dishes.html',
  styleUrl: './dishes.scss',
})
export class Dishes {
  activeTab: 'monitor' | 'departments' = 'monitor';
}

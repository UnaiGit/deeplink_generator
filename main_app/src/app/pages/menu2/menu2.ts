import { Component } from '@angular/core';
import { CatTable } from './components/cat-table/cat-table';
import { ExtrasTable } from './components/extras-table/extras-table';
import { DishesTable } from './components/dishes-table/dishes-table';
import { DepartTable } from './components/depart-table/depart-table';
import { MenusTable } from './components/menus-table/menus-table';

@Component({
  selector: 'app-menu2',
  imports: [CatTable, ExtrasTable, DishesTable, DepartTable, MenusTable],
  templateUrl: './menu2.html',
  styleUrl: './menu2.scss',
})
export class Menu2 {
}

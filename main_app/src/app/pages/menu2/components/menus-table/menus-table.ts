import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, of, delay } from 'rxjs';

export interface Menu {
  id: number;
  category: string;
  visibility: boolean;
}

@Component({
  selector: 'app-menus-table',
  imports: [CommonModule],
  templateUrl: './menus-table.html',
  styleUrl: './menus-table.scss',
})
export class MenusTable implements OnInit {
  @Output() addClick = new EventEmitter<void>();
  @Output() editClick = new EventEmitter<Menu>();
  @Output() deleteClick = new EventEmitter<Menu>();

  menus: Menu[] = [];

  constructor() {}

  ngOnInit(): void {
    this.loadMenus();
  }

  loadMenus(): void {
    this.getMenus().subscribe((data) => {
      this.menus = data;
    });
  }

  getMenus(): Observable<Menu[]> {
    const mockMenus: Menu[] = [
      {
        id: 1,
        category: 'Stations',
        visibility: true,
      },
      {
        id: 2,
        category: 'Flavors of Asia',
        visibility: false,
      },
      {
        id: 3,
        category: 'Atlantic',
        visibility: true,
      },
    ];

    return of(mockMenus).pipe(delay(300));
  }

  toggleVisibility(menu: Menu): void {
    menu.visibility = !menu.visibility;
  }

  editMenu(menu: Menu): void {
    this.editClick.emit(menu);
  }

  onAddClick(): void {
    this.addClick.emit();
  }

  deleteMenu(menu: Menu): void {
    this.deleteClick.emit(menu);
  }
}

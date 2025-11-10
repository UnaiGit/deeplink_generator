import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Observable, of, delay } from 'rxjs';
import { MenuModal } from './menu-modal/menu-modal';
import { Menu } from '@/types/interfaces/menu2/menu.interface';
import { MenuModalMode } from '@/types/menu2/modes.type';

export { }

@Component({
  selector: 'app-menus-table',
  imports: [CommonModule, TranslateModule, MenuModal],
  templateUrl: './menus-table.html',
  styleUrl: './menus-table.scss',
})
export class MenusTable implements OnInit {
  @Output() addClick = new EventEmitter<void>();
  @Output() editClick = new EventEmitter<Menu>();
  @Output() deleteClick = new EventEmitter<Menu>();

  menus: Menu[] = [];
  
  // Modal state
  isModalOpen: boolean = false;
  modalMode: MenuModalMode = 'add';
  selectedMenu: any = null;

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
    this.selectedMenu = { ...menu };
    this.modalMode = 'edit';
    this.isModalOpen = true;
    this.editClick.emit(menu);
  }

  onAddClick(): void {
    this.selectedMenu = null;
    this.modalMode = 'add';
    this.isModalOpen = true;
    this.addClick.emit();
  }

  deleteMenu(menu: Menu): void {
    this.selectedMenu = { ...menu };
    this.modalMode = 'delete';
    this.isModalOpen = true;
    this.deleteClick.emit(menu);
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.selectedMenu = null;
  }

  saveMenu(menuData: any): void {
    console.log('Saving menu:', menuData);
    this.closeModal();
    this.loadMenus();
  }

  confirmDeleteMenu(menuData: any): void {
    console.log('Deleting menu:', menuData);
    this.closeModal();
    this.loadMenus();
  }
}

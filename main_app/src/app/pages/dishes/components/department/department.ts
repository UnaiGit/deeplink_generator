import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { DepartmentItem } from '@/types/interfaces/dishes/department-item.interface';

export { }

@Component({
  selector: 'app-department',
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './department.html',
  styleUrl: './department.scss',
})
export class Department {
  showAddPanel = signal(false);
  
  departments: DepartmentItem[] = [
    {
      id: '1',
      name: 'Hot Kitchen',
      icon: '🔪',
      badge: 'Mains',
      staff: 'Chris, Lily',
      capacity: 3
    },
    {
      id: '2',
      name: 'Bar',
      icon: '🍷',
      badge: 'Mains',
      staff: 'Chris, Lily',
      capacity: 3
    },
    {
      id: '3',
      name: 'Pastry',
      icon: '🍰',
      badge: 'Mains',
      staff: 'Chris, Lily',
      capacity: 3
    }
  ];

  // New department form
  newDepartment = {
    name: '',
    icon: '🔪',
    capacity: '',
    categories: ''
  };

  showIconDropdown = false;

  icons = ['🔪', '🍷', '🍰', '🍕', '🍔', '☕', '🥗', '🍜'];

  openAddPanel(): void {
    this.showAddPanel.set(true);
  }

  closeAddPanel(): void {
    this.showAddPanel.set(false);
    this.resetForm();
  }

  resetForm(): void {
    this.newDepartment = {
      name: '',
      icon: '🔪',
      capacity: '',
      categories: ''
    };
  }

  selectIcon(icon: string): void {
    this.newDepartment.icon = icon;
    this.showIconDropdown = false;
  }

  onFileSelected(event: any): void {
    // Handle file upload
    console.log('File selected:', event);
  }

  saveDepartment(): void {
    if (this.newDepartment.name && this.newDepartment.capacity) {
      const newDept: DepartmentItem = {
        id: Date.now().toString(),
        name: this.newDepartment.name,
        icon: this.newDepartment.icon,
        badge: 'Mains',
        staff: 'Chris, Lily',
        capacity: parseInt(this.newDepartment.capacity)
      };
      this.departments.push(newDept);
      this.closeAddPanel();
    }
  }

  deleteDepartment(id: string): void {
    this.departments = this.departments.filter(d => d.id !== id);
  }

  clearTickets(id: string): void {
    console.log('Clear tickets for department:', id);
  }
}

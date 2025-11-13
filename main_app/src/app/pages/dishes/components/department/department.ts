import { Component, signal, OnDestroy, ElementRef, Renderer2, Inject } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
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
export class Department implements OnDestroy {
  showAddPanel = signal(false);
  
  private modalElement: HTMLElement | null = null;
  private bodyElement: HTMLElement | null = null;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.bodyElement = this.document.body;
  }
  
  departments: DepartmentItem[] = [
    {
      id: '1',
      name: 'Hot Kitchen',
      icon: '/icons/chefhat.svg',
      badge: 'Mains',
      staff: 'Chris, Lily',
      capacity: 3
    },
    {
      id: '2',
      name: 'Bar',
      icon: '/icons/bar.svg',
      badge: 'Mains',
      staff: 'Chris, Lily',
      capacity: 3
    },
    {
      id: '3',
      name: 'Pastry',
      icon: '/icons/donut.svg',
      badge: 'Mains',
      staff: 'Chris, Lily',
      capacity: 3
    }
  ];

  // New department form
  newDepartment = {
    name: '',
    icon: '/icons/chefhat.svg',
    capacity: '',
    categories: ''
  };

  showIconDropdown = false;

  icons = ['/icons/chefhat.svg', '/icons/bar.svg', '/icons/donut.svg', '/icons/cooking.svg', '/icons/dish.svg', '/icons/tea.svg', '/icons/categorey.svg', '/icons/menu.svg'];

  openAddPanel(): void {
    this.showAddPanel.set(true);
    setTimeout(() => this.moveModalToBody(), 0);
  }

  closeAddPanel(): void {
    this.showAddPanel.set(false);
    this.resetForm();
    this.removeModalFromBody();
  }

  private moveModalToBody(): void {
    if (!this.bodyElement || !this.el.nativeElement) return;
    
    const modalOverlay = this.el.nativeElement.querySelector('.side-panel-overlay');
    const sidePanel = this.el.nativeElement.querySelector('.side-panel');
    
    if (modalOverlay && sidePanel && !this.modalElement) {
      // Create a wrapper to hold both overlay and panel
      const wrapper = this.renderer.createElement('div');
      this.renderer.addClass(wrapper, 'modal-wrapper');
      
      this.renderer.appendChild(wrapper, modalOverlay);
      this.renderer.appendChild(wrapper, sidePanel);
      this.renderer.appendChild(this.bodyElement, wrapper);
      
      this.modalElement = wrapper;
    }
  }

  private removeModalFromBody(): void {
    if (this.modalElement && this.bodyElement) {
      this.renderer.removeChild(this.bodyElement, this.modalElement);
      this.modalElement = null;
    }
  }

  ngOnDestroy(): void {
    this.removeModalFromBody();
  }

  resetForm(): void {
    this.newDepartment = {
      name: '',
      icon: '/icons/chefhat.svg',
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

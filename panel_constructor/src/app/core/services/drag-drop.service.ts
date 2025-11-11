import { Injectable, signal } from '@angular/core';
import { Department } from '../../components/departments/departments';

@Injectable({
  providedIn: 'root'
})
export class DragDropService {
  draggedDepartment = signal<Department | null>(null);
  isDragging = signal<boolean>(false);

  startDrag(department: Department): void {
    this.draggedDepartment.set(department);
    this.isDragging.set(true);
  }

  endDrag(): void {
    this.draggedDepartment.set(null);
    this.isDragging.set(false);
  }

  getDraggedDepartment(): Department | null {
    return this.draggedDepartment();
  }
}


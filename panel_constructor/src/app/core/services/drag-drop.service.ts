import { Injectable, signal } from '@angular/core';
import { Department } from '../models/department.model';

@Injectable({
  providedIn: 'root'
})
export class DragDropService {
  draggedDepartment = signal<Department | null>(null);
  isDragging = signal<boolean>(false);
  private dragStartTime: number | null = null;

  startDrag(department: Department): void {
    this.dragStartTime = performance.now();
    this.draggedDepartment.set(department);
    this.isDragging.set(true);
    console.log(`🚀 DRAG START: Department "${department.name}"`, {
      startTime: this.dragStartTime,
      timestamp: new Date().toISOString()
    });
  }

  endDrag(): void {
    const endTime = performance.now();
    const duration = this.dragStartTime ? endTime - this.dragStartTime : 0;
    const department = this.draggedDepartment();
    
    if (this.dragStartTime) {
      console.log(`🏁 DRAG END: Department "${department?.name || 'Unknown'}"`, {
        startTime: this.dragStartTime,
        endTime: endTime,
        duration: `${duration.toFixed(2)}ms`,
        timestamp: new Date().toISOString()
      });
    }
    
    this.draggedDepartment.set(null);
    this.isDragging.set(false);
    this.dragStartTime = null;
  }

  getDraggedDepartment(): Department | null {
    return this.draggedDepartment();
  }

  getDragStartTime(): number | null {
    return this.dragStartTime;
  }
}


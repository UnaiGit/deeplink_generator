import { Injectable, signal } from '@angular/core';
import { Employee } from '../models/employee.model';

@Injectable({
  providedIn: 'root',
})
export class EmployeeDragService {
  private readonly draggedEmployeeSignal = signal<Employee | null>(null);
  private readonly isDraggingSignal = signal<boolean>(false);
  private dragStartTime: number | null = null;

  startDrag(employee: Employee): void {
    this.dragStartTime = performance.now();
    this.draggedEmployeeSignal.set(employee);
    this.isDraggingSignal.set(true);
    console.log(`🚀 DRAG START: Employee "${employee.name}"`, {
      startTime: this.dragStartTime,
      timestamp: new Date().toISOString()
    });
  }

  endDrag(): void {
    const endTime = performance.now();
    const duration = this.dragStartTime ? endTime - this.dragStartTime : 0;
    const employee = this.draggedEmployeeSignal();
    
    if (this.dragStartTime) {
      console.log(`🏁 DRAG END: Employee "${employee?.name || 'Unknown'}"`, {
        startTime: this.dragStartTime,
        endTime: endTime,
        duration: `${duration.toFixed(2)}ms`,
        timestamp: new Date().toISOString()
      });
    }
    
    this.draggedEmployeeSignal.set(null);
    this.isDraggingSignal.set(false);
    this.dragStartTime = null;
  }

  getDraggedEmployee(): Employee | null {
    return this.draggedEmployeeSignal();
  }

  isDragging(): boolean {
    return this.isDraggingSignal();
  }

  getDragStartTime(): number | null {
    return this.dragStartTime;
  }

  dragging = this.isDraggingSignal.asReadonly();
}


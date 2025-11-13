import { Component, Signal, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Employee } from '../../core/models/employee.model';
import { EmployeeService } from '../../core/services/employee.service';
import { EmployeeDragService } from '../../core/services/employee-drag.service';

export interface EmployeePanelAnchor {
  x: number;
  y: number;
  width: number;
  height: number;
}

@Component({
  selector: 'app-employees',
  imports: [CommonModule],
  templateUrl: './employees.html',
  styleUrl: './employees.scss',
})
export class Employees {
  isOpen = input<boolean>(false);
  close = output<void>();
  anchor = input<EmployeePanelAnchor | null>(null);

  private readonly employeeService = inject(EmployeeService);
  private readonly employeeDragService = inject(EmployeeDragService);
  employees: Signal<Employee[]> = this.employeeService.getEmployees();
  dragging = this.employeeDragService.dragging;

  onOverlayClick(): void {
    this.close.emit();
  }

  onModalClick(event: MouseEvent): void {
    event.stopPropagation();
  }

  onEmployeeDragStart(event: DragEvent, employee: Employee): void {
    this.employeeDragService.startDrag(employee);
    if (event.dataTransfer) {
      event.dataTransfer.setData('application/x-employee-id', employee.id);
      event.dataTransfer.effectAllowed = 'copy';
    }
  }

  onEmployeeDragEnd(event: DragEvent): void {
    event.stopPropagation();
    this.employeeDragService.endDrag();
  }
}


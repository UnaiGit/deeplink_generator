import { Component, input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KitchenLayoutItem } from '../../core/interfaces/kitchen.interface';
import { EmployeeService } from '../../core/services/employee.service';

@Component({
  selector: 'app-micro-tooltip',
  imports: [CommonModule],
  templateUrl: './micro-tooltip.html',
  styleUrl: './micro-tooltip.scss',
})
export class MicroTooltip {
  kitchenItem = input<KitchenLayoutItem | null>(null);
  x = input<number>(0);
  y = input<number>(0);
  visible = input<boolean>(false);

  private employeeService = inject(EmployeeService);

  getEmployees(): string[] {
    const item = this.kitchenItem();
    if (!item?.assignedEmployees || item.assignedEmployees.length === 0) {
      return [];
    }
    
    return item.assignedEmployees.map(empId => {
      const emp = this.employeeService.getEmployeeById(empId);
      return emp?.name || empId;
    });
  }

  getLoadColor(): string {
    const load = this.kitchenItem()?.currentLoad || 0;
    if (load < 50) return '#22c55e'; // green
    if (load < 80) return '#eab308'; // yellow
    return '#ef4444'; // red
  }
}


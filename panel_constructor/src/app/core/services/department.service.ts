import { Injectable, Signal, signal } from '@angular/core';
import { Department } from '../models/department.model';
import { ICON_PATHS } from '../constants/icon.constants';

@Injectable({
  providedIn: 'root',
})
export class DepartmentService {
  private readonly departmentsSignal = signal<Department[]>([
    {
      id: 'reception',
      name: 'Reception',
      description: 'Grill +3 orders',
      icon: ICON_PATHS.calendar,
      orders: 'Grill +3 orders',
    },
    {
      id: 'table',
      name: 'Table',
      description: 'Food service to clients',
      icon: ICON_PATHS.departmentsTable,
    },
    {
      id: 'manager',
      name: 'Manager',
      description: 'Restaurant management',
      icon: ICON_PATHS.departmentsManager,
    },
    {
      id: 'stockroom',
      name: 'Stockroom',
      description: 'Inventory management',
      icon: ICON_PATHS.departmentsStockroom,
    },
    {
      id: 'marketing',
      name: 'Marketing',
      description: 'Customer feedback',
      icon: ICON_PATHS.departmentsMarketing,
    },
    {
      id: 'hr',
      name: 'HR',
      description: 'Employee management',
      icon: ICON_PATHS.employees,
    },
  ]);

  getDepartments(): Signal<Department[]> {
    return this.departmentsSignal.asReadonly();
  }
}


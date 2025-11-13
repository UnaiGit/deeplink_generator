import { Injectable, Signal, signal } from '@angular/core';
import { Employee } from '../models/employee.model';

@Injectable({
  providedIn: 'root',
})
export class EmployeeService {
  private readonly employeesSignal = signal<Employee[]>([
    {
      id: 'alex',
      name: 'Alex',
      role: 'Waiter',
      initials: 'AL',
      avatarGradient: 'linear-gradient(135deg, #fcd5ce, #f8a5c2)',
      badgeLabel: 'Reservations',
    },
    {
      id: 'yola',
      name: 'Yola',
      role: 'Bar',
      initials: 'YO',
      avatarGradient: 'linear-gradient(135deg, #f6d365, #fda085)',
      badgeLabel: 'Reservations',
    },
    {
      id: 'andrew',
      name: 'Andrew',
      role: 'Waiter',
      initials: 'AN',
      avatarGradient: 'linear-gradient(135deg, #a1c4fd, #c2e9fb)',
    },
    {
      id: 'christ',
      name: 'Christ',
      role: 'Waiter',
      initials: 'CH',
      avatarGradient: 'linear-gradient(135deg, #fbc2eb, #a6c1ee)',
    },
  ]);

  getEmployees(): Signal<Employee[]> {
    return this.employeesSignal.asReadonly();
  }

  getEmployeeById(id: string): Employee | undefined {
    return this.employeesSignal().find(employee => employee.id === id);
  }
}


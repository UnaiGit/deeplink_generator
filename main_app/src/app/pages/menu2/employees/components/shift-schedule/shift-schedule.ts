import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { addDays, startOfWeek, format } from 'date-fns';
import { ShiftEntry } from '@/types/interfaces/employees/shift-entry.interface';
import { store, selectEmployeeState } from '../../../../../store/store';
import { StaffMember } from '@/types/interfaces/employees/staff-member.interface';

interface ShiftDisplay {
  timeRange: string;
  role: string;
  employeeName: string;
  dayIndex: number;
}

@Component({
  selector: 'app-shift-schedule',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './shift-schedule.html',
  styleUrl: './shift-schedule.scss',
})
export class ShiftSchedule implements OnInit, OnDestroy {
  viewDate: Date = new Date();
  weekDays: Date[] = [];
  
  employees: string[] = [];
  shiftData: ShiftEntry[] = [];
  private unsubscribe?: () => void;
  
  // Role color mapping
  roleColors: { [key: string]: string } = {
    'Waiter': '#2d71f7',      // Blue
    'Cooking': '#ef4444',     // Red
    'Delivery': '#40c4aa',    // Teal
    'Cashier': '#ffbe4c',     // Orange
    'Manager': '#9333ea',     // Purple
  };

  ngOnInit(): void {
    this.weekDays = this.getWeekDays();
    this.loadEmployeesFromStore();
    
    // Subscribe to state changes
    this.unsubscribe = store.subscribe(() => {
      this.loadEmployeesFromStore();
    });
  }

  ngOnDestroy(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  loadEmployeesFromStore(): void {
    const state = selectEmployeeState();
    this.employees = state.employees.map((emp: StaffMember) => emp.name);
    this.generateShiftData(state.employees);
  }

  generateShiftData(employees: StaffMember[]): void {
    // Generate shift data based on employees and their roles
    // For now, we'll create sample shifts. In a real app, this would come from a shifts store/API
    this.shiftData = [];
    
    employees.forEach((employee: StaffMember) => {
      if (employee.tags && employee.tags.length > 0) {
        // Create shifts for each employee based on their roles
        // Example: assign shifts to different days based on employee rank
        const primaryRole = employee.tags[0];
        
        // Assign shifts based on employee rank (simple logic)
        if (employee.rank <= 2) {
          // Top employees get more shifts
          this.shiftData.push(
            { employeeName: employee.name, dayIndex: 0, range: { start: '09:00', end: '17:00' }, role: primaryRole },
            { employeeName: employee.name, dayIndex: 2, range: { start: '09:00', end: '17:00' }, role: primaryRole },
          );
        } else if (employee.rank <= 3) {
          this.shiftData.push(
            { employeeName: employee.name, dayIndex: 1, range: { start: '09:00', end: '17:00' }, role: primaryRole },
          );
        }
        
        // If employee has multiple roles, add shifts with different roles
        if (employee.tags.length > 1 && employee.rank <= 2) {
          const secondaryRole = employee.tags[1];
          this.shiftData.push(
            { employeeName: employee.name, dayIndex: 4, range: { start: '09:00', end: '17:00' }, role: secondaryRole },
          );
        }
      }
    });
  }

  getWeekDays(): Date[] {
    const weekStart = startOfWeek(this.viewDate, { weekStartsOn: 0 });
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  }

  getDayName(date: Date): string {
    return format(date, 'EEE');
  }

  formatTimeRange(range: { start: string; end: string }): string {
    const [startHour24, startMinute] = range.start.split(':').map(Number);
    const [endHour24, endMinute] = range.end.split(':').map(Number);
    
    const startPeriod = startHour24 >= 12 ? 'pm' : 'am';
    const startHour12 = startHour24 % 12 || 12;
    const startTimeFormatted = `${String(startHour12).padStart(2, '0')}.${String(startMinute).padStart(2, '0')}${startPeriod}`;
    
    const endPeriod = endHour24 >= 12 ? 'pm' : 'am';
    const endHour12 = endHour24 % 12 || 12;
    const endTimeFormatted = `${String(endHour12).padStart(2, '0')}.${String(endMinute).padStart(2, '0')}${endPeriod}`;
    
    return `${startTimeFormatted} - ${endTimeFormatted}`;
  }

  getShiftsForEmployeeAndDay(employeeName: string, dayIndex: number): ShiftDisplay[] {
    return this.shiftData
      .filter(shift => shift.employeeName === employeeName && shift.dayIndex === dayIndex)
      .map(shift => ({
        timeRange: this.formatTimeRange(shift.range),
        role: shift.role,
        employeeName: shift.employeeName,
        dayIndex: shift.dayIndex,
      }));
  }

  getRoleColor(role: string): string {
    return this.roleColors[role] || '#2d71f7';
  }

  onShiftClick(shift: ShiftDisplay): void {
    console.log('Shift clicked:', shift);
  }

  onOptimizeWithAI(): void {
    console.log('Optimize with AI clicked');
  }

  onAddShift(): void {
    console.log('Add shift clicked');
  }
}
 
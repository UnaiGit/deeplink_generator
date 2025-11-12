import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { EmployeeDetails as IEmployeeDetails } from '@/types/interfaces/employees/employee-details.interface';
import { store, selectEmployeeState } from '../../../../../store/store';
import { StaffMember } from '@/types/interfaces/employees/staff-member.interface';

@Component({
  selector: 'app-employee-details',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './employee-details.html',
  styleUrl: './employee-details.scss',
})
export class EmployeeDetails implements OnInit, OnDestroy {
  activeTab: 'info' | 'kpis' | 'shift' = 'info';
  employee: IEmployeeDetails | null = null;
  private unsubscribe?: () => void;

  ngOnInit(): void {
    // Initial load
    this.loadSelectedEmployee();
    
    // Subscribe to state changes
    this.unsubscribe = store.subscribe(() => {
      this.loadSelectedEmployee();
    });
  }

  ngOnDestroy(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  loadSelectedEmployee(): void {
    const state = selectEmployeeState();
    const selectedEmployee = state.employees.find((emp: StaffMember) => emp.selected);
    
    if (selectedEmployee) {
      this.employee = this.convertToEmployeeDetails(selectedEmployee);
    } else {
      this.employee = null;
    }
  }

  convertToEmployeeDetails(staffMember: StaffMember): IEmployeeDetails {
    return {
      id: staffMember.rank,
      name: staffMember.name,
      roles: staffMember.tags || [],
      avatarUrl: staffMember.avatarUrl,
      phone: staffMember.phone || 'N/A',
      email: staffMember.email || 'N/A',
      rating: 5, // Default rating
      workingHours: {
        start: staffMember.hoursPerDay ? `${staffMember.hoursPerDay}:00am` : '8:00am',
        end: staffMember.hoursPerDay ? `${parseInt(staffMember.hoursPerDay) + 8}:00pm` : '5:00pm'
      },
      status: staffMember.active ? 'active' : 'inactive',
      rank: staffMember.rank,
      productivity: {
        avgTime: '08:25',
        completedOrders: 92,
        goalAttainment: 72
      },
      aiInsight: {
        message: 'Clara improved precision by',
        highlightValue: '12%'
      },
      kpis: {
        orderDeliverySpeed: { value: '1.2s', change: '+12%', isPositive: true },
        orderAccuracy: { value: '90%', change: '+12%', isPositive: true, percentage: 90 },
        tablesManaged: { value: '1.2s', change: '+12%', isPositive: true },
        tableNPS: { value: 3 },
        dishesPerHour: { value: 33, change: '+12%', isPositive: true },
        avgPrepTime: { value: '1.2s', change: '-7%', isPositive: false },
        delayedTasks: { value: '12%', change: '+12%', isPositive: true },
        daysAttended: { value: 17 },
        taskReassignments: { value: 2 },
        engagement: { emoji: '🤩' }
      },
      shiftSchedule: {
        days: [
          {
            dayName: 'Mon',
            shifts: [
              { timeRange: '09:00 am - 06:00 pm', role: staffMember.tags?.[0] || 'Waiter' }
            ]
          },
          {
            dayName: 'Tue',
            shifts: [
              { timeRange: '09:00 am - 06:00 pm', role: staffMember.tags?.[0] || 'Waiter' }
            ]
          },
          {
            dayName: 'Wed',
            shifts: [
              { timeRange: '09:00 am - 06:00 pm', role: staffMember.tags?.[0] || 'Waiter' }
            ]
          },
          {
            dayName: 'Thurs',
            shifts: []
          },
          {
            dayName: 'Fri',
            shifts: [
              { timeRange: '09:00 am - 06:00 pm', role: staffMember.tags?.[0] || 'Waiter' }
            ]
          }
        ]
      }
    };
  }


  get stars(): string {
    if (!this.employee) return '';
    return '★'.repeat(this.employee.rating);
  }

  get statusText(): string {
    if (!this.employee) return '';
    return this.employee.status === 'active' ? 'Active Working' : 
           this.employee.status === 'inactive' ? 'Inactive' : 'Suspended';
  }

  switchTab(tab: 'info' | 'kpis' | 'shift'): void {
    this.activeTab = tab;
  }
}



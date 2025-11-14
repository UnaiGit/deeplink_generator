import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { addDays, startOfWeek, format, startOfDay, endOfDay, addHours, addMinutes } from 'date-fns';
import { CalendarModule, DateAdapter, MOMENT } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { SchedulerModule, CalendarSchedulerEvent } from 'angular-calendar-scheduler';
import moment from 'moment';
import { ShiftEntry } from '@/types/interfaces/employees/shift-entry.interface';
import { store, selectEmployeeState } from '../../../../../store/store';
import { StaffMember } from '@/types/interfaces/employees/staff-member.interface';

// Extended staff member for calendar display
interface SchedulerEmployee extends StaffMember {
  id: string;
}

@Component({
  selector: 'app-shift-schedule',
  standalone: true,
  imports: [
    CommonModule, 
    TranslateModule, 
    CalendarModule,
    SchedulerModule
  ],
  providers: [
    {
      provide: DateAdapter,
      useFactory: adapterFactory
    },
    {
      provide: MOMENT,
      useValue: moment
    }
  ],
  templateUrl: './shift-schedule.html',
  styleUrl: './shift-schedule.scss',
})
export class ShiftSchedule implements OnInit, OnDestroy {
  viewDate: Date = new Date();
  viewDays: number = 7;
  dayStartHour: number = 12;
  dayEndHour: number = 18;
  hourSegments: 1 | 2 | 4 | 6 = 2;
  
  employees: SchedulerEmployee[] = [];
  shiftData: ShiftEntry[] = [];
  events: CalendarSchedulerEvent[] = [];
  timeSlots: string[] = [];
  private unsubscribe?: () => void;

  constructor(private translate: TranslateService) {}
  
  // Role color mapping matching the design
  get roleColors(): { [key: string]: string } {
    return {
      'Kitchen': this.getCssVariable('--primary-blue'),
      'Clients': this.getCssVariable('--success-teal'),
      'Management': this.getCssVariable('--yellow-chart'),
      'Not working': this.getCssVariable('--gray-500'),
      // Fallback for existing roles
      'Waiter': this.getCssVariable('--success-teal'),
      'Cooking': this.getCssVariable('--primary-blue'),
      'Delivery': this.getCssVariable('--success-teal'),
      'Cashier': this.getCssVariable('--yellow-chart'),
      'Manager': this.getCssVariable('--yellow-chart'),
    };
  }

  // Role labels for legend
  get roleLabels() {
    return [
      { name: 'Kitchen', color: this.getCssVariable('--primary-blue') },
      { name: 'Clients', color: this.getCssVariable('--success-teal') },
      { name: 'Management', color: this.getCssVariable('--yellow-chart') },
      { name: 'Not working', color: this.getCssVariable('--gray-500') }
    ];
  }

  // Generate performance metrics for shifts
  getPerformanceMetrics(role: string): { primary: string; secondary: string } {
    const metrics: { [key: string]: { primary: string; secondary: string } } = {
      'Kitchen': { primary: '0.18 OPM', secondary: '75 WR' },
      'Clients': { primary: '1.4 APM', secondary: '7 LI' },
      'Management': { primary: '102 AAPM', secondary: '7 IIR' },
      'Not working': { primary: '80% TWL', secondary: '92% RO' },
      'Cooking': { primary: '0.18 OPM', secondary: '75 WR' },
      'Waiter': { primary: '1.4 APM', secondary: '7 LI' },
      'Delivery': { primary: '1.4 APM', secondary: '7 LI' },
      'Manager': { primary: '102 AAPM', secondary: '7 IIR' },
    };
    return metrics[role] || { primary: 'N/A', secondary: 'N/A' };
  }

  ngOnInit(): void {
    this.generateTimeSlots();
    this.loadEmployeesFromStore();
    
    // Subscribe to state changes
    this.unsubscribe = store.subscribe(() => {
      this.loadEmployeesFromStore();
    });
  }

  generateTimeSlots(): void {
    this.timeSlots = [];
    for (let hour = this.dayStartHour; hour <= this.dayEndHour; hour++) {
      this.timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
    }
  }

  ngOnDestroy(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  loadEmployeesFromStore(): void {
    const state = selectEmployeeState();
    // Convert StaffMember to SchedulerEmployee by adding id
    this.employees = state.employees.map((emp: StaffMember) => ({
      ...emp,
      id: emp.name // Using name as id for now
    }));
    this.generateShiftData(state.employees);
    this.convertShiftsToEvents();
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
            { employeeName: employee.name, dayIndex: 1, range: { start: '09:00', end: '17:00' }, role: primaryRole },
            { employeeName: employee.name, dayIndex: 3, range: { start: '09:00', end: '17:00' }, role: primaryRole },
          );
        } else if (employee.rank <= 3) {
          this.shiftData.push(
            { employeeName: employee.name, dayIndex: 2, range: { start: '09:00', end: '17:00' }, role: primaryRole },
          );
        }
        
        // If employee has multiple roles, add shifts with different roles
        if (employee.tags.length > 1 && employee.rank <= 2) {
          const secondaryRole = employee.tags[1];
          this.shiftData.push(
            { employeeName: employee.name, dayIndex: 5, range: { start: '09:00', end: '17:00' }, role: secondaryRole },
          );
        }
      }
    });
  }

  convertShiftsToEvents(): void {
    const weekStart = startOfWeek(this.viewDate, { weekStartsOn: 0 });
    
    this.events = this.shiftData.map((shift, index) => {
      const shiftDate = addDays(weekStart, shift.dayIndex);
      const [startHour, startMinute] = shift.range.start.split(':').map(Number);
      const [endHour, endMinute] = shift.range.end.split(':').map(Number);
    
      const start = addMinutes(addHours(startOfDay(shiftDate), startHour), startMinute);
      const end = addMinutes(addHours(startOfDay(shiftDate), endHour), endMinute);
      
      // Find employee to use as resource
      const employee = this.employees.find(emp => emp.name === shift.employeeName);
      
      const metrics = this.getPerformanceMetrics(shift.role);
      const roleColor = this.getRoleColor(shift.role);
      
      return {
        id: `event-${index}`,
        start: start,
        end: end,
        title: `${shift.employeeName} - ${shift.role}`,
        content: `${shift.employeeName}: ${metrics.primary} | ${metrics.secondary}`,
        color: {
          primary: roleColor,
          secondary: roleColor + '20'
        },
        resizable: {
          beforeStart: true,
          afterEnd: true
        },
        draggable: true,
        isClickable: true,
        isDisabled: false,
        userId: employee?.id || shift.employeeName,
        meta: {
          employeeName: shift.employeeName,
          role: shift.role,
          metrics: metrics
        }
      } as CalendarSchedulerEvent;
    });
  }

  getRoleColor(role: string): string {
    return this.roleColors[role] || this.getCssVariable('--primary-blue');
  }

  private getCssVariable(variable: string, fallback: string = ''): string {
    if (typeof document === 'undefined') return fallback;
    const value = getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
    return value || fallback;
  }

  getShiftsForEmployeeAndTime(employeeName: string, timeSlot: string): CalendarSchedulerEvent[] {
    return this.events.filter(event => {
      const eventHour = new Date(event.start).getHours();
      const slotHour = parseInt(timeSlot.split(':')[0]);
      // Find the shift data that matches this event
      const eventIndex = parseInt(event.id.toString().replace('event-', ''));
      const shift = this.shiftData[eventIndex];
      return shift?.employeeName === employeeName && eventHour === slotHour;
    });
  }

  formatTime(time: string): string {
    const [hour] = time.split(':');
    const hourNum = parseInt(hour);
    return `${hourNum}:00`;
  }

  getEmployeeNameFromEvent(event: CalendarSchedulerEvent): string {
    // Try to get from meta first
    if ((event as any).meta?.employeeName) {
      return (event as any).meta.employeeName;
    }
    // Fallback to finding from shift data
    const eventIndex = parseInt(event.id.toString().replace('event-', ''));
    const shift = this.shiftData[eventIndex];
    return shift?.employeeName || 'Unknown';
  }

  onEventClicked(event: { event: CalendarSchedulerEvent; action?: string }): void {
    console.log('Event clicked:', event);
  }

  onSegmentClicked(event: any): void {
    console.log('Segment clicked:', event);
    // You can add a new shift here based on the clicked segment
    // event contains: date, segment, sourceEvent, etc.
  }

  onDayHeaderClicked(event: any): void {
    console.log('Day clicked:', event);
  }

  onEventTimesChanged(event: { event: CalendarSchedulerEvent; newStart: Date; newEnd?: Date }): void {
    console.log('Event times changed:', event);
    // Update the event with new times
    const eventToUpdate = this.events.find(e => e.id === event.event.id);
    if (eventToUpdate && event.newStart && event.newEnd) {
      eventToUpdate.start = event.newStart;
      eventToUpdate.end = event.newEnd;
    }
  }

  changeView(view: 'week' | 'day'): void {
    this.viewDays = view === 'week' ? 7 : 1;
  }

  onOptimizeWithAI(): void {
    console.log('Optimize with AI clicked');
  }

  onAddShift(): void {
    console.log('Add shift clicked');
  }

  onFilterPeriod(): void {
    console.log('Filter period clicked');
  }
}
 
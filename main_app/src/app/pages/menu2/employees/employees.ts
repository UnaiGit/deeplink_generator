import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Staff } from './components/staff/staff';
import { EmployeeDetails } from './components/employee-details/employee-details';
import { ShiftSchedule } from './components/shift-schedule/shift-schedule';
import { FeedbackAlerts } from './components/feedback-alerts/feedback-alerts';

@Component({
  selector: 'app-employees',
  imports: [
    CommonModule,
    Staff,
    EmployeeDetails,
    ShiftSchedule,
    FeedbackAlerts,
  ],
  templateUrl: './employees.html',
  styleUrl: './employees.scss',
})
export class Employees {

}

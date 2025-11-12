import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { StaffMember } from '@/types/interfaces/employees/staff-member.interface';
import { AddEmployee } from '../add-employee/add-employee';
import { Toast } from '../../../../../shared/components/toast/toast';
import { store, selectEmployeeState } from '../../../../../store/store';
import { addEmployee, selectEmployee, updateEmployee } from '../../../../../store/employee/employeeSlice';

@Component({
  selector: 'app-staff',
  standalone: true,
  imports: [CommonModule, TranslateModule, AddEmployee, Toast],
  templateUrl: './staff.html',
  styleUrl: './staff.scss',
})
export class Staff implements OnInit, OnDestroy {
  showAddEmployeeModal: boolean = false;
  isEditMode: boolean = false;
  editingEmployee: StaffMember | null = null;
  staff: StaffMember[] = [];
  showToast: boolean = false;
  toastMessage: string = '';
  toastType: 'success' | 'error' | 'info' = 'success';
  private unsubscribe?: () => void;

  ngOnInit(): void {
    // Initial load
    this.loadStaffFromStore();
    
    // Subscribe to state changes
    this.unsubscribe = store.subscribe(() => {
      this.loadStaffFromStore();
    });
  }

  ngOnDestroy(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  loadStaffFromStore(): void {
    const state = selectEmployeeState();
    this.staff = state.employees;
  }

  selectStaff(selectedStaff: StaffMember): void {
    store.dispatch(selectEmployee({ name: selectedStaff.name }));
    this.loadStaffFromStore();
  }

  openAddEmployee(): void {
    this.isEditMode = false;
    this.editingEmployee = null;
    this.showAddEmployeeModal = true;
  }

  openEditEmployee(employee: StaffMember): void {
    this.isEditMode = true;
    // Get the full employee data from Redux store to ensure all fields are available
    const state = selectEmployeeState();
    const fullEmployee = state.employees.find(e => e.name === employee.name);
    this.editingEmployee = fullEmployee || employee;
    this.showAddEmployeeModal = true;
  }

  closeAddEmployee(): void {
    this.showAddEmployeeModal = false;
    this.isEditMode = false;
    this.editingEmployee = null;
  }

  onSaveEmployee(employeeData: any): void {
    try {
      if (this.isEditMode && this.editingEmployee) {
        // Update existing employee
        store.dispatch(updateEmployee({
          name: this.editingEmployee.name,
          employee: {
            name: employeeData.name,
            phone: employeeData.phone,
            email: employeeData.email,
            hoursPerDay: employeeData.hoursPerDay,
            currency: employeeData.currency,
            salaryPerHour: employeeData.salaryPerHour,
            tags: employeeData.tags || [],
          }
        }));
        this.showSuccessToast('Employee updated successfully');
        console.log('Employee updated via Redux:', employeeData);
      } else {
        // Add new employee
        store.dispatch(addEmployee({
          name: employeeData.name,
          phone: employeeData.phone,
          email: employeeData.email,
          hoursPerDay: employeeData.hoursPerDay,
          currency: employeeData.currency,
          salaryPerHour: employeeData.salaryPerHour,
          tags: employeeData.tags || [],
        }));
        this.showSuccessToast('Employee saved successfully');
        console.log('New employee added via Redux:', employeeData);
      }
      
      // Reload staff from store
      this.loadStaffFromStore();
    } catch (error) {
      this.showErrorToast('Could not save employee');
      console.error('Error saving employee:', error);
    }
  }

  showSuccessToast(message: string): void {
    this.toastMessage = message;
    this.toastType = 'success';
    this.showToast = true;
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
      this.showToast = false;
    }, 3000);
  }

  showErrorToast(message: string): void {
    this.toastMessage = message;
    this.toastType = 'error';
    this.showToast = true;
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
      this.showToast = false;
    }, 3000);
  }
}

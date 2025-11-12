import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { StaffMember } from '@/types/interfaces/employees/staff-member.interface';

export type EmployeeState = {
  employees: StaffMember[];
  selectedEmployeeId: string | null;
};

// Load employees from localStorage
const loadEmployeesFromStorage = (): EmployeeState => {
  try {
    const serializedState = localStorage.getItem('employeeState');
    if (serializedState === null) {
      return {
        employees: [],
        selectedEmployeeId: null,
      };
    }
    const parsed = JSON.parse(serializedState);
    return {
      employees: parsed.employees || [],
      selectedEmployeeId: parsed.selectedEmployeeId || null,
    };
  } catch (err) {
    console.error('Error loading employees from localStorage:', err);
    return {
      employees: [],
      selectedEmployeeId: null,
    };
  }
};

// Save employees to localStorage
const saveEmployeesToStorage = (state: EmployeeState) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem('employeeState', serializedState);
  } catch (err) {
    console.error('Error saving employees to localStorage:', err);
  }
};

const initialState: EmployeeState = loadEmployeesFromStorage();

const employeeSlice = createSlice({
  name: 'employee',
  initialState,
  reducers: {
    addEmployee: (
      state,
      action: PayloadAction<{
        name: string;
        phone: string;
        email: string;
        hoursPerDay: string;
        currency: string;
        salaryPerHour: string;
        tags?: string[];
      }>
    ) => {
      const { name, phone, email, hoursPerDay, currency, salaryPerHour, tags } = action.payload;
      const newEmployee: StaffMember = {
        name,
        phone,
        email,
        hoursPerDay,
        currency,
        salaryPerHour,
        tags: tags || [],
        active: true,
        rank: state.employees.length + 1,
        selected: false,
        avatarUrl: undefined,
      };
      state.employees.push(newEmployee);
      saveEmployeesToStorage(state);
    },

    updateEmployee: (
      state,
      action: PayloadAction<{
        name: string;
        employee: Partial<StaffMember>;
      }>
    ) => {
      const { name, employee } = action.payload;
      const index = state.employees.findIndex((e) => e.name === name);
      if (index !== -1) {
        state.employees[index] = { ...state.employees[index], ...employee };
        saveEmployeesToStorage(state);
      }
    },

    deleteEmployee: (state, action: PayloadAction<{ name: string }>) => {
      state.employees = state.employees.filter((e) => e.name !== action.payload.name);
      // Recalculate ranks
      state.employees.forEach((emp, index) => {
        emp.rank = index + 1;
      });
      saveEmployeesToStorage(state);
    },

    selectEmployee: (state, action: PayloadAction<{ name: string }>) => {
      // Deselect all employees
      state.employees.forEach((emp) => {
        emp.selected = false;
      });
      // Select the specified employee
      const employee = state.employees.find((e) => e.name === action.payload.name);
      if (employee) {
        employee.selected = true;
        state.selectedEmployeeId = action.payload.name;
      }
      saveEmployeesToStorage(state);
    },

    toggleEmployeeActive: (state, action: PayloadAction<{ name: string }>) => {
      const employee = state.employees.find((e) => e.name === action.payload.name);
      if (employee) {
        employee.active = !employee.active;
        saveEmployeesToStorage(state);
      }
    },

    clearEmployees: (state) => {
      state.employees = [];
      state.selectedEmployeeId = null;
      saveEmployeesToStorage(state);
    },
  },
});

export const {
  addEmployee,
  updateEmployee,
  deleteEmployee,
  selectEmployee,
  toggleEmployeeActive,
  clearEmployees,
} = employeeSlice.actions;

export default employeeSlice.reducer;
export type EmployeeReducer = ReturnType<typeof employeeSlice.reducer>;


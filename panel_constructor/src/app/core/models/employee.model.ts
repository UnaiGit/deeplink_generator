export interface Employee {
  id: string;
  name: string;
  role: string;
  initials: string;
  avatarGradient: string;
  badgeLabel?: string;
  // Kitchen/Department assignments
  assignedKitchenId?: string; // ID of kitchen station/department assigned to
  assignedTableId?: string; // ID of table assigned to (for floor service)
}


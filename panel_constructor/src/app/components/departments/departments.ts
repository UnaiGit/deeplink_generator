import { Component, Signal, input, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { DragDropService } from '../../core/services/drag-drop.service';
import { Department } from '../../core/models/department.model';
import { DepartmentService } from '../../core/services/department.service';

@Component({
  selector: 'app-departments',
  imports: [CommonModule, TranslateModule],
  templateUrl: './departments.html',
  styleUrl: './departments.scss',
})
export class Departments {
  private dragDropService = inject(DragDropService);
  private readonly departmentService = inject(DepartmentService);
  
  isOpen = input<boolean>(false);
  close = output<void>();
  selectedDepartment = this.dragDropService.draggedDepartment;

  departments: Signal<Department[]> = this.departmentService.getDepartments();

  onDragStart(event: DragEvent, department: Department): void {
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'copyMove';
      event.dataTransfer.setData('text/plain', department.id);
      // Set a custom drag image
      const dragImage = this.createDragImage(department);
      event.dataTransfer.setDragImage(dragImage, 0, 0);
    }
    this.dragDropService.startDrag(department);
    console.log('Dragging department:', department.name);
    // Allow canvas to receive drop by letting overlay clicks pass through during drag
    try {
      document.body.classList.add('dragging-department');
    } catch {}
  }

  onDragEnd(event: DragEvent): void {
    this.dragDropService.endDrag();
    try {
      document.body.classList.remove('dragging-department');
    } catch {}
  }

  private createDragImage(department: Department): HTMLElement {
    const dragImage = document.createElement('div');
    dragImage.style.position = 'absolute';
    dragImage.style.top = '-1000px';
    dragImage.style.left = '-1000px';
    dragImage.style.width = '200px';
    dragImage.style.padding = '12px 16px';
    dragImage.style.background = 'rgba(255, 255, 255, 0.95)';
    dragImage.style.borderRadius = '12px';
    dragImage.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
    dragImage.style.display = 'flex';
    dragImage.style.alignItems = 'center';
    dragImage.style.gap = '12px';
    dragImage.style.opacity = '0.9';
    dragImage.style.pointerEvents = 'none';
    dragImage.style.zIndex = '10000';
    
    dragImage.innerHTML = `
      <img src="${department.icon}" style="width: 24px; height: 24px;" />
      <div>
        <div style="font-weight: 600; color: #111827;">${department.name}</div>
        <div style="font-size: 12px; color: #6b7280;">${department.description}</div>
      </div>
    `;
    
    document.body.appendChild(dragImage);
    // Clean up after a short delay
    setTimeout(() => {
      if (document.body.contains(dragImage)) {
        document.body.removeChild(dragImage);
      }
    }, 100);
    return dragImage;
  }

  onClose(): void {
    this.close.emit();
  }

  onSave(): void {
    console.log('Departments saved');
    this.onClose();
  }
}


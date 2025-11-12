import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, effect, input, inject, signal } from '@angular/core';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { TitleCasePipe } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FloorType } from '../Models/interface-legends';
import { TableRenderer } from '../../utils/table-renderer.util';
import { getFloorTables } from '../../utils/floor-data.util';
import { Table, TableStatus } from '../../utils/table.model';
import { ThemeService } from '../../core/services/theme.service';
import { TABLE_CONSTANTS } from '../../core/constants/table.constants';
import { TableInfo } from '../table-info/table-info';
import { DragDropService } from '../../core/services/drag-drop.service';
import { TableConfigPanel, TableConfigFormData, NfcState } from '../table-config-panel/table-config-panel';


@Component({
  selector: 'app-floor-canvas',
  imports: [CommonModule, TranslateModule, TableInfo, TableConfigPanel],
  templateUrl: './floor-canvas.html',
  styleUrl: './floor-canvas.scss',
})
export class FloorCanvas implements AfterViewInit, OnDestroy {
  private translateService = inject(TranslateService);
  private themeService = inject(ThemeService);
  private dragDropService = inject(DragDropService);

  // Expose Math for template
  Math = Math;

  @ViewChild('floorCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;
  private resizeHandler!: () => void;
  private tableRenderer!: TableRenderer;
  floorName = input<FloorType>('main');
  private globalDragOverHandler?: (e: DragEvent) => void;
  private globalDropHandler?: (e: DragEvent) => void;

  // Tables state for drag and drop
  private tables: Table[] = [];
  private draggedTable: Table | null = null;
  private dragOffset = { x: 0, y: 0 };
  private isDragging = false;
  private dragOverTable: Table | null = null;
  private dragEnabled = false; // Only true after double click
  private hasDragMovement = false;
  private isPanning = false; // Track if we're panning the canvas
  private panStart = { x: 0, y: 0 }; // Starting position for pan
  private pendingDepartmentId: string | null = null; // latched during drag enter/over

  // Zoom state
  zoomLevel = signal<number>(1);
  private readonly MIN_ZOOM = 0.5;
  private readonly MAX_ZOOM = 3;
  private readonly ZOOM_STEP = 0.1;
  private panOffset = { x: 0, y: 0 };
  private readonly PAN_STEP = 20; // Pixels to pan per arrow key press
  private tablePositions: Partial<Record<FloorType, Record<string, { x: number; y: number }>>> = {};

  // Table configuration state (for modal flow)
  tableConfigTable: Table | null = null;
  tableConfigStep: 'details' | 'nfc' = 'details';
  tableConfigData: TableConfigFormData = {
    width: 4,
    height: 4,
    capacity: 6,
    maxStay: ''
  };
  nfcState: NfcState = {
    read: false,
    write: false,
    test: false
  };
  readonly gridSizeOptions = [2, 3, 4, 5, 6];
  readonly capacityRange = { min: 2, max: 16 };

  // Table info hover state
  isTableHovered = signal<boolean>(false);
  hoveredTable = signal<Table | null>(null);
  tooltipX = signal<number>(0);
  tooltipY = signal<number>(0);

  // Selected table state
  selectedTableId = signal<string | null>(null);

  // Effect to redraw canvas when floor changes
  private floorEffect = effect(() => {
    const floor = this.floorName();
    if (this.ctx) {
      this.loadTables();
      this.drawFloorCanvas(floor);
    }
  });

  // Effect to redraw canvas when selected table changes
  private selectedTableEffect = effect(() => {
    const selectedId = this.selectedTableId();
    if (this.ctx) {
      this.drawFloorCanvas(this.floorName());
    }
  });

  // Effect to redraw canvas when zoom changes
  private zoomEffect = effect(() => {
    const zoom = this.zoomLevel();
    if (this.ctx) {
      this.drawFloorCanvas(this.floorName());
    }
  });

  // Track current language for reactivity
  private currentLang = signal(this.translateService.currentLang || 'de-DE');
  private langSubscription?: Subscription;
  private themeSubscription?: Subscription;

  constructor() {
    // Subscribe to language changes
    this.langSubscription = this.translateService.onLangChange.subscribe(() => {
      this.currentLang.set(this.translateService.currentLang);
    });

    // Subscribe to theme changes with immediate redraw
    // Since we're using getThemeColor() which reads directly from service (not CSS),
    // we can redraw immediately without waiting for CSS variable updates
    this.themeSubscription = this.themeService.theme$.subscribe(() => {
      if (this.ctx) {
        // Redraw immediately - no delay needed since we read colors directly from service
        this.drawFloorCanvas(this.floorName());
      }
    });
  }

  /**
   * Get CSS variable value with fallback
   */
  private getCssVariable(variable: string, fallback: string = '#f9fafb'): string {
    if (typeof document === 'undefined') return fallback;
    const value = getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
    return value || fallback;
  }

  /**
   * Get canvas background color based on current theme
   * Uses theme service directly for immediate access (no CSS variable delay)
   */
  private getCanvasBackgroundColor(): string {
    // Get the color directly from theme service for immediate access
    const color = this.themeService.getThemeColor('--canvas-bg');
    
    // Fallback to CSS variable if theme service doesn't have it
    return color || this.getCssVariable('--canvas-bg', this.themeService.isDarkMode ? '#1f2937' : '#f9fafb');
  }

  ngAfterViewInit() {
    if (!this.canvasRef || !this.canvasRef.nativeElement) {
      console.error('Canvas element not found');
      return;
    }

    const canvas = this.canvasRef.nativeElement;
    const context = canvas.getContext('2d');
    if (!context) {
      console.error('Could not get 2D context from canvas');
      return;
    }

    this.ctx = context;
    this.tableRenderer = new TableRenderer(this.ctx, this.themeService);

    // Adjust canvas size to fill container - use device pixel ratio for crisp rendering
    this.updateCanvasSize();

    // Handle window resize
    this.resizeHandler = () => {
      this.updateCanvasSize();
      this.drawFloorCanvas(this.floorName());
    };
    window.addEventListener('resize', this.resizeHandler);

    // Add mouse event listeners for drag and drop
    canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
    canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
    canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
    canvas.addEventListener('mouseleave', this.onMouseLeave.bind(this));
    canvas.addEventListener('dblclick', this.onDoubleClick.bind(this));
    
    // Add keyboard event listeners for panning with arrow keys
    window.addEventListener('keydown', this.onKeyDown.bind(this));
    
    // Add drag and drop event listeners for department assignment
    canvas.addEventListener('dragover', this.onDragOver.bind(this));
    canvas.addEventListener('drop', this.onDrop.bind(this));
    canvas.addEventListener('dragenter', this.onDragEnter.bind(this));
    canvas.addEventListener('dragleave', this.onDragLeave.bind(this));
    
    // Add wheel event listener for zoom
    canvas.addEventListener('wheel', this.onWheel.bind(this), { passive: false });
    
    // Listen for table images loaded event to redraw
    window.addEventListener('tableImagesLoaded', this.onImagesLoaded.bind(this));
    // Allow drops anywhere (in case overlays intercept events)
    this.globalDragOverHandler = (e: DragEvent) => {
      // Always allow dropping so we can route it if over canvas
      e.preventDefault();
      // Forward to canvas dragOver logic so we continuously track the hovered table,
      // even if the event was fired on window.
      try {
        this.onDragOver(e);
      } catch {}
    };
    window.addEventListener('dragover', this.globalDragOverHandler);
    this.globalDropHandler = (e: DragEvent) => {
      // If drop happens over the canvas bounds, route to canvas drop logic
      const rect = canvas.getBoundingClientRect();
      if (e.clientX >= rect.left && e.clientX <= rect.right &&
          e.clientY >= rect.top && e.clientY <= rect.bottom) {
        // Synthesize a canvas-local drop
        this.onDrop(new DragEvent('drop', {
          clientX: e.clientX,
          clientY: e.clientY,
          dataTransfer: e.dataTransfer || null,
          bubbles: false,
          cancelable: true
        }) as DragEvent);
        e.preventDefault();
        e.stopPropagation();
      }
    };
    window.addEventListener('drop', this.globalDropHandler);
    
    canvas.style.cursor = 'default';

    // Initial draw
    this.loadTables();
    this.drawFloorCanvas(this.floorName());
  }

  private onImagesLoaded(): void {
    // Redraw canvas when images are loaded
    if (this.ctx) {
      this.drawFloorCanvas(this.floorName());
    }
  }

  private updateCanvasSize(): void {
    const canvas = this.canvasRef.nativeElement;
    const container = canvas.parentElement;
    if (container && this.ctx) {
      const dpr = window.devicePixelRatio || 1;
      
      // Set canvas size to fit container exactly - no scrolling
      const canvasWidth = container.clientWidth;
      const canvasHeight = container.clientHeight;
      
      canvas.width = canvasWidth * dpr;
      canvas.height = canvasHeight * dpr;
      canvas.style.width = canvasWidth + 'px';
      canvas.style.height = canvasHeight + 'px';
      
      // Reset transform and scale
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
      this.ctx.scale(dpr, dpr);
    }
  }

  private loadTables(): void {
    const floor = this.floorName();
    const savedPositions = this.tablePositions[floor];
    this.tables = getFloorTables(floor).map(table => {
      const saved = savedPositions?.[table.id];
      return saved
        ? { ...table, x: saved.x, y: saved.y }
        : { ...table };
    });
    this.persistTablePositions();
  }

  private persistTablePositions(): void {
    const floor = this.floorName();
    this.tablePositions[floor] = this.tables.reduce<Record<string, { x: number; y: number }>>((acc, table) => {
      acc[table.id] = { x: table.x, y: table.y };
      return acc;
    }, {});
  }

  private getTableAt(x: number, y: number): Table | null {
    // Convert screen coordinates to canvas coordinates accounting for zoom
    const zoom = this.zoomLevel();
    const canvasX = (x - this.panOffset.x) / zoom;
    const canvasY = (y - this.panOffset.y) / zoom;
    
    // Check tables in reverse order (top to bottom)
    for (let i = this.tables.length - 1; i >= 0; i--) {
      const table = this.tables[i];
      if (canvasX >= table.x && canvasX <= table.x + table.width &&
          canvasY >= table.y && canvasY <= table.y + table.height) {
        return table;
      }
    }
    return null;
  }

  /**
   * Get chair at coordinates (if any)
   */
  private getChairAt(x: number, y: number): { table: Table; chairNumber: number } | null {
    // Convert screen coordinates to canvas coordinates accounting for zoom
    const zoom = this.zoomLevel();
    const canvasX = (x - this.panOffset.x) / zoom;
    const canvasY = (y - this.panOffset.y) / zoom;

    const chairWidth = 20; // Chair width (horizontal)
    const chairHeight = 14; // Chair height (vertical) - length > width
    const spacing = 0; // No gap between chairs
    const offset = 0; // No gap between table and chairs

    // Check all tables for chairs
    for (const table of this.tables) {
      if (!table.seats || table.seats === 0) continue;

      const seats = table.seats;
      const shape = table.shape || 'rectangular';

      if (shape === 'round') {
        // Check round table chairs
        const centerX = table.x + table.width / 2;
        const centerY = table.y + table.height / 2;
        const radius = Math.min(table.width, table.height) / 2 + offset + chairHeight / 2;
        const angleStep = (Math.PI * 2) / seats;

        for (let i = 0; i < seats; i++) {
          const angle = i * angleStep;
          const chairX = centerX + Math.cos(angle) * radius - chairWidth / 2;
          const chairY = centerY + Math.sin(angle) * radius - chairHeight / 2;

          if (canvasX >= chairX && canvasX <= chairX + chairWidth &&
              canvasY >= chairY && canvasY <= chairY + chairHeight) {
            return { table, chairNumber: i + 1 };
          }
        }
      } else {
        // Check rectangular table chairs
        // Chairs are placed on the longer side of the table
        const isWidthLonger = table.width > table.height;
        const isHeightLonger = table.height > table.width;
        
        // If width is longer, chairs on top and bottom (x-axis)
        if (isWidthLonger) {
          const chairsPerSide = Math.ceil(seats / 2);
          let chairNum = 0;
          
          const availableWidth = table.width;
          const widerChairWidth = availableWidth / chairsPerSide;
          
          // Top side (horizontal chairs)
          const topY = table.y - chairHeight;
          const topStartX = table.x;
          for (let i = 0; i < chairsPerSide && chairNum < seats; i++) {
            const chairX = topStartX + i * widerChairWidth;
            if (canvasX >= chairX && canvasX <= chairX + widerChairWidth &&
                canvasY >= topY && canvasY <= topY + chairHeight) {
              return { table, chairNumber: chairNum + 1 };
            }
            chairNum++;
          }

          // Bottom side (horizontal chairs)
          const bottomY = table.y + table.height;
          const bottomStartX = table.x;
          for (let i = 0; i < chairsPerSide && chairNum < seats; i++) {
            const chairX = bottomStartX + i * widerChairWidth;
            if (canvasX >= chairX && canvasX <= chairX + widerChairWidth &&
                canvasY >= bottomY && canvasY <= bottomY + chairHeight) {
              return { table, chairNumber: chairNum + 1 };
            }
            chairNum++;
          }
        } 
        // If height is longer, chairs on left and right (y-axis)
        else if (isHeightLonger) {
          const chairsPerSide = Math.ceil(seats / 2);
          let chairNum = 0;
          
          const verticalChairWidth = 16;
          const verticalChairHeight = 24;
          
          const availableHeight = table.height;
          const totalChairsHeight = chairsPerSide * verticalChairHeight;
          const chairSpacing = totalChairsHeight < availableHeight ? (availableHeight - totalChairsHeight) / (chairsPerSide + 1) : 0;
          
          // Left side (vertical chairs)
          const leftX = table.x - verticalChairWidth;
          const leftStartY = table.y + (availableHeight - (chairsPerSide * verticalChairHeight + (chairsPerSide - 1) * chairSpacing)) / 2;
          for (let i = 0; i < chairsPerSide && chairNum < seats; i++) {
            const chairY = leftStartY + i * (verticalChairHeight + chairSpacing);
            if (canvasX >= leftX && canvasX <= leftX + verticalChairWidth &&
                canvasY >= chairY && canvasY <= chairY + verticalChairHeight) {
              return { table, chairNumber: chairNum + 1 };
            }
            chairNum++;
          }

          // Right side (vertical chairs)
          const rightX = table.x + table.width;
          const rightStartY = table.y + (availableHeight - (chairsPerSide * verticalChairHeight + (chairsPerSide - 1) * chairSpacing)) / 2;
          for (let i = 0; i < chairsPerSide && chairNum < seats; i++) {
            const chairY = rightStartY + i * (verticalChairHeight + chairSpacing);
            if (canvasX >= rightX && canvasX <= rightX + verticalChairWidth &&
                canvasY >= chairY && canvasY <= chairY + verticalChairHeight) {
              return { table, chairNumber: chairNum + 1 };
            }
            chairNum++;
          }
        }
        // If square (width === height), use default logic for 2-seater and 4-seater
        else if (seats === 2 || seats === 4) {
          const chairsPerSide = seats / 2;
          let chairNum = 0;
          
          const verticalChairWidth = 16;
          const verticalChairHeight = 24;
          
          const availableHeight = table.height;
          const totalChairsHeight = chairsPerSide * verticalChairHeight;
          const chairSpacing = totalChairsHeight < availableHeight ? (availableHeight - totalChairsHeight) / (chairsPerSide + 1) : 0;
          
          const leftX = table.x - verticalChairWidth;
          const leftStartY = table.y + (availableHeight - (chairsPerSide * verticalChairHeight + (chairsPerSide - 1) * chairSpacing)) / 2;
          for (let i = 0; i < chairsPerSide && chairNum < seats; i++) {
            const chairY = leftStartY + i * (verticalChairHeight + chairSpacing);
            if (canvasX >= leftX && canvasX <= leftX + verticalChairWidth &&
                canvasY >= chairY && canvasY <= chairY + verticalChairHeight) {
              return { table, chairNumber: chairNum + 1 };
            }
            chairNum++;
          }

          const rightX = table.x + table.width;
          const rightStartY = table.y + (availableHeight - (chairsPerSide * verticalChairHeight + (chairsPerSide - 1) * chairSpacing)) / 2;
          for (let i = 0; i < chairsPerSide && chairNum < seats; i++) {
            const chairY = rightStartY + i * (verticalChairHeight + chairSpacing);
            if (canvasX >= rightX && canvasX <= rightX + verticalChairWidth &&
                canvasY >= chairY && canvasY <= chairY + verticalChairHeight) {
              return { table, chairNumber: chairNum + 1 };
            }
            chairNum++;
          }
        } 
        // For 12-seater and other tables: use longer side logic consistently
        else {
          const isWidthLongerForLarge = table.width > table.height;
          
          if (isWidthLongerForLarge) {
            // If width is longer, chairs on top and bottom
            const chairsPerSide = Math.ceil(seats / 2);
            let chairNum = 0;
            
            const availableWidth = table.width;
            const widerChairWidth = availableWidth / chairsPerSide;
            
            // Top side
            const topY = table.y - chairHeight;
            const topStartX = table.x;
            for (let i = 0; i < chairsPerSide && chairNum < seats; i++) {
              const chairX = topStartX + i * widerChairWidth;
              if (canvasX >= chairX && canvasX <= chairX + widerChairWidth &&
                  canvasY >= topY && canvasY <= topY + chairHeight) {
                return { table, chairNumber: chairNum + 1 };
              }
              chairNum++;
            }

            // Bottom side
            const bottomY = table.y + table.height;
            const bottomStartX = table.x;
            for (let i = 0; i < chairsPerSide && chairNum < seats; i++) {
              const chairX = bottomStartX + i * widerChairWidth;
              if (canvasX >= chairX && canvasX <= chairX + widerChairWidth &&
                  canvasY >= bottomY && canvasY <= bottomY + chairHeight) {
                return { table, chairNumber: chairNum + 1 };
              }
              chairNum++;
            }
          } else {
            // If height is longer, chairs on left and right
            const chairsPerSide = Math.ceil(seats / 2);
            let chairNum = 0;
            
            const verticalChairWidth = 16;
            const verticalChairHeight = 24;
            
            const availableHeight = table.height;
            const totalChairsHeight = chairsPerSide * verticalChairHeight;
            const chairSpacing = totalChairsHeight < availableHeight ? (availableHeight - totalChairsHeight) / (chairsPerSide + 1) : 0;
            
            // Left side
            const leftX = table.x - verticalChairWidth;
            const leftStartY = table.y + (availableHeight - (chairsPerSide * verticalChairHeight + (chairsPerSide - 1) * chairSpacing)) / 2;
            for (let i = 0; i < chairsPerSide && chairNum < seats; i++) {
              const chairY = leftStartY + i * (verticalChairHeight + chairSpacing);
              if (canvasX >= leftX && canvasX <= leftX + verticalChairWidth &&
                  canvasY >= chairY && canvasY <= chairY + verticalChairHeight) {
                return { table, chairNumber: chairNum + 1 };
              }
              chairNum++;
            }

            // Right side
            const rightX = table.x + table.width;
            const rightStartY = table.y + (availableHeight - (chairsPerSide * verticalChairHeight + (chairsPerSide - 1) * chairSpacing)) / 2;
            for (let i = 0; i < chairsPerSide && chairNum < seats; i++) {
              const chairY = rightStartY + i * (verticalChairHeight + chairSpacing);
              if (canvasX >= rightX && canvasX <= rightX + verticalChairWidth &&
                  canvasY >= chairY && canvasY <= chairY + verticalChairHeight) {
                return { table, chairNumber: chairNum + 1 };
              }
              chairNum++;
            }
          }
        }
      }
    }

    return null;
  }

  // Zoom methods
  zoomIn(): void {
    const canvas = this.canvasRef.nativeElement;
    if (!canvas) return;
    
    const canvasWidth = canvas.width / (window.devicePixelRatio || 1);
    const canvasHeight = canvas.height / (window.devicePixelRatio || 1);
    
    // Determine zoom center: selected table center or viewport center
    let zoomCenterX: number;
    let zoomCenterY: number;
    
    const selectedId = this.selectedTableId();
    if (selectedId) {
      // Zoom towards selected table center
      const selectedTable = this.tables.find(t => t.id === selectedId);
      if (selectedTable) {
        zoomCenterX = selectedTable.x + selectedTable.width / 2;
        zoomCenterY = selectedTable.y + selectedTable.height / 2;
      } else {
        // Fallback to viewport center
        zoomCenterX = canvasWidth / 2;
        zoomCenterY = canvasHeight / 2;
      }
    } else {
      // Zoom towards viewport center
      zoomCenterX = canvasWidth / 2;
      zoomCenterY = canvasHeight / 2;
    }
    
    const oldZoom = this.zoomLevel();
    const newZoom = Math.min(oldZoom + this.ZOOM_STEP, this.MAX_ZOOM);
    
    if (newZoom !== oldZoom) {
      // Adjust pan offset to zoom towards the center point
      const zoomFactor = newZoom / oldZoom;
      this.panOffset.x = zoomCenterX - (zoomCenterX - this.panOffset.x) * zoomFactor;
      this.panOffset.y = zoomCenterY - (zoomCenterY - this.panOffset.y) * zoomFactor;
      
      this.zoomLevel.set(newZoom);
    }
  }

  zoomOut(): void {
    const canvas = this.canvasRef.nativeElement;
    if (!canvas) return;
    
    const canvasWidth = canvas.width / (window.devicePixelRatio || 1);
    const canvasHeight = canvas.height / (window.devicePixelRatio || 1);
    
    // Determine zoom center: selected table center or viewport center
    let zoomCenterX: number;
    let zoomCenterY: number;
    
    const selectedId = this.selectedTableId();
    if (selectedId) {
      // Zoom towards selected table center
      const selectedTable = this.tables.find(t => t.id === selectedId);
      if (selectedTable) {
        zoomCenterX = selectedTable.x + selectedTable.width / 2;
        zoomCenterY = selectedTable.y + selectedTable.height / 2;
      } else {
        // Fallback to viewport center
        zoomCenterX = canvasWidth / 2;
        zoomCenterY = canvasHeight / 2;
      }
    } else {
      // Zoom towards viewport center
      zoomCenterX = canvasWidth / 2;
      zoomCenterY = canvasHeight / 2;
    }
    
    const oldZoom = this.zoomLevel();
    const newZoom = Math.max(oldZoom - this.ZOOM_STEP, this.MIN_ZOOM);
    
    if (newZoom !== oldZoom) {
      // Adjust pan offset to zoom towards the center point
      const zoomFactor = newZoom / oldZoom;
      this.panOffset.x = zoomCenterX - (zoomCenterX - this.panOffset.x) * zoomFactor;
      this.panOffset.y = zoomCenterY - (zoomCenterY - this.panOffset.y) * zoomFactor;
      
      this.zoomLevel.set(newZoom);
    }
  }

  resetZoom(): void {
    this.zoomLevel.set(1);
    this.panOffset = { x: 0, y: 0 };
  }

  /**
   * Fit all tables in view
   */
  fitToView(): void {
    if (this.tables.length === 0) {
      this.resetZoom();
      return;
    }

    const canvas = this.canvasRef.nativeElement;
    if (!canvas) return;

    const canvasWidth = canvas.width / (window.devicePixelRatio || 1);
    const canvasHeight = canvas.height / (window.devicePixelRatio || 1);

    // Calculate bounding box of all tables
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const table of this.tables) {
      minX = Math.min(minX, table.x);
      minY = Math.min(minY, table.y);
      maxX = Math.max(maxX, table.x + table.width);
      maxY = Math.max(maxY, table.y + table.height);
    }

    // Add padding around tables
    const padding = 50;
    const contentWidth = maxX - minX + padding * 2;
    const contentHeight = maxY - minY + padding * 2;

    // Calculate zoom to fit content
    const zoomX = canvasWidth / contentWidth;
    const zoomY = canvasHeight / contentHeight;
    const newZoom = Math.min(zoomX, zoomY, this.MAX_ZOOM);

    // Center the content
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    this.zoomLevel.set(newZoom);
    this.panOffset.x = canvasWidth / 2 - centerX * newZoom;
    this.panOffset.y = canvasHeight / 2 - centerY * newZoom;
  }

  private onWheel(event: WheelEvent): void {
    event.preventDefault();
    const delta = event.deltaY > 0 ? -this.ZOOM_STEP : this.ZOOM_STEP;
    const newZoom = Math.max(this.MIN_ZOOM, Math.min(this.MAX_ZOOM, this.zoomLevel() + delta));
    
    if (newZoom !== this.zoomLevel()) {
      // Zoom towards mouse position
      const canvas = this.canvasRef.nativeElement;
      const rect = canvas.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;
      
      const zoomFactor = newZoom / this.zoomLevel();
      this.panOffset.x = mouseX - (mouseX - this.panOffset.x) * zoomFactor;
      this.panOffset.y = mouseY - (mouseY - this.panOffset.y) * zoomFactor;
      
      this.zoomLevel.set(newZoom);
    }
  }

  private onMouseDown(event: MouseEvent): void {
    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Check for middle mouse button (button 1) or spacebar + left click for panning
    if (event.button === 1 || (event.button === 0 && event.ctrlKey)) {
      event.preventDefault();
      this.isPanning = true;
      this.panStart.x = x - this.panOffset.x;
      this.panStart.y = y - this.panOffset.y;
      canvas.style.cursor = 'grabbing';
      return;
    }

    // Convert screen coordinates to canvas coordinates accounting for zoom
    const zoom = this.zoomLevel();
    const canvasX = (x - this.panOffset.x) / zoom;
    const canvasY = (y - this.panOffset.y) / zoom;

    // Check if click is on action icons of selected table
    const selectedId = this.selectedTableId();
    if (selectedId) {
      const selectedTable = this.tables.find(t => t.id === selectedId);
      if (selectedTable) {
        const iconBounds = this.tableRenderer.getActionIconBounds(selectedTable);
        if (iconBounds) {
          // Check if click is on edit icon
          if (canvasX >= iconBounds.edit.x && canvasX <= iconBounds.edit.x + iconBounds.edit.width &&
              canvasY >= iconBounds.edit.y && canvasY <= iconBounds.edit.y + iconBounds.edit.height) {
            console.log('Edit clicked for table:', selectedTable.label);
            this.handleEditTable(selectedTable);
            return;
          }
          
          // Check if click is on delete icon
          if (canvasX >= iconBounds.delete.x && canvasX <= iconBounds.delete.x + iconBounds.delete.width &&
              canvasY >= iconBounds.delete.y && canvasY <= iconBounds.delete.y + iconBounds.delete.height) {
            console.log('Delete clicked for table:', selectedTable.label);
            this.handleDeleteTable(selectedTable);
            return;
          }
        }
      }
    }

    // Check if click is on a chair first
    const chairClick = this.getChairAt(x, y);
    if (chairClick) {
      console.log(`You have clicked on chair no ${chairClick.chairNumber} of table ${chairClick.table.label}`);
      // Deselect table if clicking on chair
      this.selectedTableId.set(null);
      return; // Don't drag if clicking on chair
    }

    // Check if click is on a table
    const table = this.getTableAt(x, y);
    if (table) {
      console.log(`You have clicked on table no ${table.label}`);
      // Select the table (single click - just show icons)
      this.selectedTableId.set(table.id);
      // Hide hover tooltip when table is selected
      this.isTableHovered.set(false);
      // Don't prepare for drag on single click
      this.isDragging = false;
      this.dragEnabled = false;
      this.draggedTable = null;
      canvas.style.cursor = 'default';
    } else {
      // Click outside any table - deselect
      this.selectedTableId.set(null);
      this.dragEnabled = false;
      this.draggedTable = null;
      // Hide hover tooltip when clicking outside
      this.isTableHovered.set(false);
    }
  }

  /**
   * Handle double click on table to enable dragging
   */
  private onDoubleClick(event: MouseEvent): void {
    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Convert screen coordinates to canvas coordinates accounting for zoom
    const zoom = this.zoomLevel();
    const canvasX = (x - this.panOffset.x) / zoom;
    const canvasY = (y - this.panOffset.y) / zoom;

    // Check if double click is on a table
    const table = this.getTableAt(x, y);
    if (table) {
      console.log(`Double clicked on table no ${table.label} - dragging enabled`);
      // Enable dragging mode
      this.dragEnabled = true;
      this.draggedTable = table;
      this.hasDragMovement = false;
      // Calculate drag offset accounting for zoom
      this.dragOffset.x = canvasX - table.x;
      this.dragOffset.y = canvasY - table.y;
      canvas.style.cursor = 'grabbing';
      // Start dragging immediately on double click
      this.isDragging = true;
    }
  }

  /**
   * Handle edit table action
   */
  private handleEditTable(table: Table): void {
    console.log('Edit table:', table);
    // Add your edit logic here
  }

  /**
   * Handle delete table action
   */
  private handleDeleteTable(table: Table): void {
    console.log('Delete table:', table);
    // Add your delete logic here
    // After deletion, deselect
    this.selectedTableId.set(null);
  }

  private onMouseMove(event: MouseEvent): void {
    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Handle panning (middle mouse button or ctrl + left mouse)
    if (this.isPanning) {
      this.panOffset.x = x - this.panStart.x;
      this.panOffset.y = y - this.panStart.y;
      this.drawFloorCanvas(this.floorName());
      return;
    }

    // Only allow dragging if drag is enabled (after double click)
    if (this.isDragging && this.draggedTable && this.dragEnabled) {
      // Update table position during drag, accounting for zoom
      const zoom = this.zoomLevel();
      const canvasX = (x - this.panOffset.x) / zoom;
      const canvasY = (y - this.panOffset.y) / zoom;
      this.draggedTable.x = canvasX - this.dragOffset.x;
      this.draggedTable.y = canvasY - this.dragOffset.y;
      this.hasDragMovement = true;

      // Keep table within canvas bounds
      const canvasWidth = canvas.width / (window.devicePixelRatio || 1);
      const canvasHeight = canvas.height / (window.devicePixelRatio || 1);
      this.draggedTable.x = Math.max(0, Math.min(this.draggedTable.x, canvasWidth - this.draggedTable.width));
      this.draggedTable.y = Math.max(0, Math.min(this.draggedTable.y, canvasHeight - this.draggedTable.height));

      // Hide tooltip during drag
      this.isTableHovered.set(false);

      // Redraw canvas
      this.drawFloorCanvas(this.floorName());
    } else {
      // Update cursor and tooltip on hover
      const table = this.getTableAt(x, y);
      const selectedId = this.selectedTableId();
      // Only show grab cursor if drag is enabled, otherwise default
      canvas.style.cursor = (table && this.dragEnabled) ? 'grab' : 'default';
      
      if (table) {
        // Only show tooltip if table is not selected (when selected, edit/delete icons are shown instead)
        if (!selectedId || table.id !== selectedId) {
          // Show tooltip when hovering over a table that is not selected
          this.isTableHovered.set(true);
          this.hoveredTable.set(table);
        
        // Position tooltip near mouse cursor with smart boundary detection
        const tooltipOffset = 15; // Gap from cursor
        const tooltipWidth = 350; // Approximate tooltip width
        const tooltipHeight = 500; // Approximate tooltip height
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        let tooltipX = event.clientX + tooltipOffset;
        let tooltipY = event.clientY + tooltipOffset;
        
        // Adjust if tooltip would go off right edge
        if (tooltipX + tooltipWidth > viewportWidth) {
          tooltipX = event.clientX - tooltipWidth - tooltipOffset;
        }
        
        // Adjust if tooltip would go off bottom edge - show above cursor
        if (tooltipY + tooltipHeight > viewportHeight) {
          tooltipY = event.clientY - tooltipHeight - tooltipOffset;
        }
        
        // Ensure tooltip doesn't go off left edge
        if (tooltipX < 0) {
          tooltipX = tooltipOffset;
        }
        
        // Ensure tooltip doesn't go off top edge
        if (tooltipY < 0) {
          tooltipY = tooltipOffset;
        }
        
        this.tooltipX.set(tooltipX);
        this.tooltipY.set(tooltipY);
        } else {
          // Hide tooltip if hovering over selected table
          this.isTableHovered.set(false);
        }
      } else {
        // Hide tooltip when not hovering over a table
        this.isTableHovered.set(false);
      }
    }
  }

  private onMouseUp(event: MouseEvent): void {
    const canvas = this.canvasRef.nativeElement;
    const wasDragging = this.isDragging;
    
    // Stop panning
    if (this.isPanning) {
      this.isPanning = false;
      canvas.style.cursor = 'default';
      return;
    }
    
    if (this.isDragging) {
      this.isDragging = false;
      // Keep dragEnabled true so table can be moved again without double clicking
      // Only reset if clicking outside
      canvas.style.cursor = this.dragEnabled ? 'grab' : 'default';
    }

    if (wasDragging && this.draggedTable && this.hasDragMovement) {
      this.persistTablePositions();
      this.hasDragMovement = false;
    }
  }

  private onMouseLeave(): void {
    // Hide tooltip when mouse leaves canvas
    this.isTableHovered.set(false);
    // Stop panning if mouse leaves canvas
    if (this.isPanning) {
      this.isPanning = false;
      const canvas = this.canvasRef.nativeElement;
      canvas.style.cursor = 'default';
    }
  }

  /**
   * Handle keyboard events for panning with arrow keys
   */
  private onKeyDown(event: KeyboardEvent): void {
    // Only handle arrow keys when canvas is focused or when not typing in an input
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
      return;
    }

    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        this.panUp();
        break;
      case 'ArrowDown':
        event.preventDefault();
        this.panDown();
        break;
      case 'ArrowLeft':
        event.preventDefault();
        this.panLeft();
        break;
      case 'ArrowRight':
        event.preventDefault();
        this.panRight();
        break;
    }
  }

  /**
   * Pan methods for programmatic control
   */
  panUp(): void {
    this.panOffset.y += this.PAN_STEP;
    this.drawFloorCanvas(this.floorName());
  }

  panDown(): void {
    this.panOffset.y -= this.PAN_STEP;
    this.drawFloorCanvas(this.floorName());
  }

  panLeft(): void {
    this.panOffset.x += this.PAN_STEP;
    this.drawFloorCanvas(this.floorName());
  }

  panRight(): void {
    this.panOffset.x -= this.PAN_STEP;
    this.drawFloorCanvas(this.floorName());
  }

  private onDragEnter(event: DragEvent): void {
    event.preventDefault();
    if (this.dragDropService.isDragging()) {
      const canvas = this.canvasRef.nativeElement;
      canvas.style.cursor = 'copy';
      // Latch the current department id in case source fires dragend early
      const dept = this.dragDropService.getDraggedDepartment();
      this.pendingDepartmentId = dept?.id ?? this.pendingDepartmentId;
    }
  }

  private onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    
    if (!this.dragDropService.isDragging()) {
      // Still allow drop if we have a latched department
      if (!this.pendingDepartmentId) {
        return;
      }
    }

    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const table = this.getTableAt(x, y);
    if (table) {
      event.dataTransfer!.dropEffect = 'copy';
      this.dragOverTable = table;
      canvas.style.cursor = 'copy';
      // Redraw to show visual feedback
      this.drawFloorCanvas(this.floorName());
    } else {
      this.dragOverTable = null;
      canvas.style.cursor = 'not-allowed';
    }
    // Continuously latch department while dragging
    const dept = this.dragDropService.getDraggedDepartment();
    this.pendingDepartmentId = dept?.id ?? this.pendingDepartmentId;
  }

  private onDragLeave(event: DragEvent): void {
    this.dragOverTable = null;
    const canvas = this.canvasRef.nativeElement;
    canvas.style.cursor = 'default';
    // Redraw to remove visual feedback
    this.drawFloorCanvas(this.floorName());
  }

  private onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    console.log('Canvas drop received');

    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const table = this.getTableAt(x, y);
    let department = this.dragDropService.getDraggedDepartment();
    // Fallback: if service is null (e.g., some browsers fire dragend before drop),
    // read the id from dataTransfer
    if (!department && event.dataTransfer) {
      const id = event.dataTransfer.getData('text/plain');
      if (id) {
        department = { id, name: id.charAt(0).toUpperCase() + id.slice(1), description: '', icon: '' } as any;
        console.log('Fallback department from dataTransfer:', id);
      }
    }
    // Final fallback: use latched id
    if (!department && this.pendingDepartmentId) {
      const id = this.pendingDepartmentId;
      department = { id, name: id.charAt(0).toUpperCase() + id.slice(1), description: '', icon: '' } as any;
      console.log('Fallback department from latched id:', id);
    }

    // If not exactly over a table, pick the nearest one within a small radius
    let targetTable = this.dragOverTable ?? table;
    if (!targetTable) {
      targetTable = this.getNearestTable(x, y, 120); // widen tolerance while dragging
      if (targetTable) {
        console.log(`No exact table under drop; using nearest "${targetTable.label}" within tolerance`);
      }
    }
    if (!targetTable) {
      console.warn('Drop detected but no table found nearby', {
        screenX: event.clientX,
        screenY: event.clientY,
        relativeX: x,
        relativeY: y,
        panOffset: { ...this.panOffset },
        zoom: this.zoomLevel()
      });
    }

    if (targetTable && department) {
      console.log(`Dropped department "${department.name}" on table "${targetTable.label}"`);
      // Assign department to table
      targetTable.department = department.id;
      console.log(`Assigned department "${department.name}" to ${targetTable.label}`);
      
      // Redraw canvas to show the change
      this.drawFloorCanvas(this.floorName());
      
      // Show success feedback
      this.showDropFeedback(targetTable, department);

      // If the dropped department is "Table", open the configuration panel
      if (department.id?.toLowerCase() === 'table') {
        // Seed suggested grid/capacity from current table dimensions
        const suggestedWidthGrid = Math.max(2, Math.round(targetTable.width / 40));
        const suggestedHeightGrid = Math.max(2, Math.round(targetTable.height / 40));
        targetTable.widthGrid = suggestedWidthGrid;
        targetTable.heightGrid = suggestedHeightGrid;
        targetTable.capacity = this.clampCapacity(targetTable.seats ?? 6);
        this.openTableConfig(targetTable);
      }
    }

    this.dragOverTable = null;
    canvas.style.cursor = 'default';
    this.dragDropService.endDrag();
    this.pendingDepartmentId = null;
  }

  /**
   * Find the nearest table to a point within a given pixel radius (screen coords)
   */
  private getNearestTable(screenX: number, screenY: number, radius: number): Table | null {
    const zoom = this.zoomLevel();
    const canvasX = (screenX - this.panOffset.x) / zoom;
    const canvasY = (screenY - this.panOffset.y) / zoom;
    let best: { table: Table; dist2: number } | null = null;
    const r2 = (radius / zoom) * (radius / zoom);
    for (const t of this.tables) {
      const cx = t.x + t.width / 2;
      const cy = t.y + t.height / 2;
      const dx = canvasX - cx;
      const dy = canvasY - cy;
      const d2 = dx * dx + dy * dy;
      if (d2 <= r2 && (!best || d2 < best.dist2)) {
        best = { table: t, dist2: d2 };
      }
    }
    return best ? best.table : null;
  }

  private showDropFeedback(table: Table, department: any): void {
    // You can add visual feedback here, like a toast notification
    console.log(`✓ ${department.name} assigned to ${table.label}`);
  }

  get isTableConfigOpen(): boolean {
    return this.tableConfigTable !== null;
  }

  get isNfcStep(): boolean {
    return this.tableConfigStep === 'nfc';
  }

  get isNfcComplete(): boolean {
    return this.nfcState.read && this.nfcState.write && this.nfcState.test;
  }

  private openTableConfig(table: Table): void {
    this.tableConfigTable = table;
    this.tableConfigStep = 'details';
    this.tableConfigData = {
      width: table.widthGrid ?? 4,
      height: table.heightGrid ?? 4,
      capacity: this.clampCapacity(table.capacity ?? table.seats ?? 6),
      maxStay: table.maxStayMinutes ? String(table.maxStayMinutes) : ''
    };
    this.nfcState = {
      read: false,
      write: false,
      test: false
    };
    this.drawFloorCanvas(this.floorName());
  }

  cancelTableConfig(): void {
    this.tableConfigTable = null;
    this.tableConfigStep = 'details';
  }

  continueToNfcStep(): void {
    if (!this.tableConfigTable) {
      return;
    }
    this.tableConfigTable.widthGrid = this.tableConfigData.width;
    this.tableConfigTable.heightGrid = this.tableConfigData.height;
    this.tableConfigTable.capacity = this.clampCapacity(this.tableConfigData.capacity);
    this.tableConfigTable.maxStayMinutes = this.tableConfigData.maxStay
      ? Number(this.tableConfigData.maxStay)
      : undefined;
    if (this.tableConfigTable.status !== 'unsynced') {
      this.tableConfigTable.status = 'unsynced';
    }
    this.tableConfigTable.syncedAt = undefined;
    this.tableConfigStep = 'nfc';
    this.drawFloorCanvas(this.floorName());
  }

  backToDetails(): void {
    this.tableConfigStep = 'details';
  }

  onTableConfigChange(): void {
    // Triggered on input changes to redraw if necessary
    this.drawFloorCanvas(this.floorName());
  }

  startReadUid(): void {
    this.nfcState = { ...this.nfcState, read: true };
  }

  writePayload(): void {
    if (!this.nfcState.read) {
      return;
    }
    this.nfcState = { ...this.nfcState, write: true };
  }

  testNfcTap(): void {
    if (!this.nfcState.read || !this.nfcState.write) {
      return;
    }
    this.nfcState = { ...this.nfcState, test: true };
  }

  completeNfcSetup(): void {
    if (!this.tableConfigTable) {
      return;
    }

    if (!this.isNfcComplete) {
      return;
    }

    // Mark table as ready (available) after completing NFC setup
    this.tableConfigTable.status = 'available';
    this.tableConfigTable.syncedAt = new Date().toISOString();
    this.drawFloorCanvas(this.floorName());
    this.cancelTableConfig();
  }

  private clampCapacity(value: number): number {
    return Math.max(this.capacityRange.min, Math.min(this.capacityRange.max, value));
  }

  ngOnDestroy(): void {
    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
    }
    const canvas = this.canvasRef?.nativeElement;
    if (canvas) {
      canvas.removeEventListener('mousedown', this.onMouseDown.bind(this));
      canvas.removeEventListener('mousemove', this.onMouseMove.bind(this));
      canvas.removeEventListener('mouseup', this.onMouseUp.bind(this));
      canvas.removeEventListener('mouseleave', this.onMouseLeave.bind(this));
      canvas.removeEventListener('dblclick', this.onDoubleClick.bind(this));
      canvas.removeEventListener('dragover', this.onDragOver.bind(this));
      canvas.removeEventListener('drop', this.onDrop.bind(this));
      canvas.removeEventListener('dragenter', this.onDragEnter.bind(this));
      canvas.removeEventListener('dragleave', this.onDragLeave.bind(this));
      canvas.removeEventListener('wheel', this.onWheel.bind(this));
      window.removeEventListener('tableImagesLoaded', this.onImagesLoaded.bind(this));
      window.removeEventListener('keydown', this.onKeyDown.bind(this));
    }
    if (this.globalDragOverHandler) {
      window.removeEventListener('dragover', this.globalDragOverHandler);
    }
    if (this.globalDropHandler) {
      window.removeEventListener('drop', this.globalDropHandler);
    }
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
    if (this.themeSubscription) {
      this.themeSubscription.unsubscribe();
    }
    this.floorEffect.destroy();
    this.zoomEffect.destroy();
    this.selectedTableEffect.destroy();
  }

  private drawFloorCanvas(floor: FloorType): void {
    const canvas = this.canvasRef.nativeElement;
    if (!canvas || !this.ctx) return;

    const canvasWidth = canvas.width / (window.devicePixelRatio || 1);
    const canvasHeight = canvas.height / (window.devicePixelRatio || 1);

    // Clear canvas
    this.ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Draw background first (without zoom/pan)
    this.ctx.fillStyle = this.getCanvasBackgroundColor();
    this.ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Save context state
    this.ctx.save();

    // Apply zoom and pan transformations
    const zoom = this.zoomLevel();
    this.ctx.translate(this.panOffset.x, this.panOffset.y);
    this.ctx.scale(zoom, zoom);

    // Draw different content based on selected floor
    switch (floor) {
      case 'main':
        this.drawMainFloor();
        break;
      case 'terrace':
        this.drawTerraceFloor();
        break;
      case 'kitchen':
        this.drawKitchenFloor();
        break;
      case 'major':
        this.drawMajorFloor();
        break;
      default:
        this.drawMainFloor();
    }

    // Restore context state
    this.ctx.restore();
  }

  private drawMainFloor(): void {
    // Draw tables from state (background already drawn, zoom/pan already applied)
    this.tableRenderer.drawTables(this.tables, this.selectedTableId());
  }

  private drawTerraceFloor(): void {
    // Draw tables from state (background already drawn, zoom/pan already applied)
    this.tableRenderer.drawTables(this.tables, this.selectedTableId());
  }

  private drawKitchenFloor(): void {
    // Draw tables from state (background already drawn, zoom/pan already applied)
    this.tableRenderer.drawTables(this.tables, this.selectedTableId());
  }

  private drawMajorFloor(): void {
    // Draw tables from state (background already drawn, zoom/pan already applied)
    this.tableRenderer.drawTables(this.tables, this.selectedTableId());
  }
  get floorData() {
    const floor = this.floorName();
    const translationKey = `floorInfo.${floor}`;
    // Use instant for synchronous access - will update on language change via effect
    return {
      tables: this.getTableCount(floor),
      messageKey: `${translationKey}.message`,
      tablesLabelKey: `${translationKey}.tables`
    };
  }

  get currentlyViewingLabelKey(): string {
    return 'floorInfo.currentlyViewing';
  }

  private getTableCount(floor: FloorType): number {
    return TABLE_CONSTANTS.FLOOR_TABLE_COUNTS[floor] || 0;
  }
}

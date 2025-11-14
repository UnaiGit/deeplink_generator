import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, effect, input, inject, signal } from '@angular/core';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { TitleCasePipe } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FloorType } from '../Models/interface-legends';
import { TableRenderer } from '../../utils/table-renderer.util';
import { Table, TableStatus } from '../../utils/table.model';
import { ThemeService } from '../../core/services/theme.service';
import { TABLE_CONSTANTS } from '../../core/constants/table.constants';
import { TableInfo } from '../table-info/table-info';
import { DragDropService } from '../../core/services/drag-drop.service';
import { TableConfigPanel, TableConfigFormData, NfcState } from '../table-config-panel/table-config-panel';
import { MicroTooltip } from '../micro-tooltip/micro-tooltip';
import { TableLayoutService } from '../../core/services/table-layout.service';
import { EmployeeDragService } from '../../core/services/employee-drag.service';
import { EmployeeService } from '../../core/services/employee.service';
import { ToastService } from '../../core/services/toast.service';
import { Department } from '../../core/models/department.model';
import { getKitchenFloorItems } from '../../utils/floor-data.util';
import { 
  KitchenItem, 
  KitchenLayoutItem,
  Point2D,
  DragState,
  PanState,
  CanvasOffset,
  TablePosition,
  TablePositionsMap,
  FloorOffsets,
  DragDropState,
  TableCapacityPreset,
  TableCapacityPresets,
  TableConfigOriginal,
  TableIdentity,
  ChairPosition,
  CanvasCoordinates
} from '../../core/interfaces';

const TABLE_CAPACITY_PRESETS: TableCapacityPresets = {
  2: { width: 120, height: 140, shape: 'rectangular' },
  4: { width: 140, height: 200, shape: 'rectangular' },
  6: { width: 160, height: 264, shape: 'rectangular' },
  8: { width: 180, height: 332, shape: 'rectangular' },
  10: { width: 180, height: 396, shape: 'rectangular' },
  12: { width: 200, height: 460, shape: 'rectangular' },
  14: { width: 220, height: 524, shape: 'rectangular' },
  16: { width: 220, height: 592, shape: 'rectangular' },
};

const TABLE_CANVAS_MARGIN = 40;
const CHAIR_BASE_DEPTH = 27;
const CHAIR_SIDE_OFFSET = 2;
const CHAIR_BUFFER = 29; // accounts for chair depth + offset so chairs stay within canvas bounds
const LAYOUT_H_PADDING = 56; // min space between tables horizontally
const LAYOUT_V_GAP = 88;     // min space between table rows vertically

@Component({
  selector: 'app-floor-canvas',
  imports: [CommonModule, TranslateModule, TableInfo, TableConfigPanel, MicroTooltip],
  templateUrl: './floor-canvas.html',
  styleUrl: './floor-canvas.scss',
})
export class FloorCanvas implements AfterViewInit, OnDestroy {
  private translateService = inject(TranslateService);
  private themeService = inject(ThemeService);
  private dragDropService = inject(DragDropService);
  private employeeDragService = inject(EmployeeDragService);
  employeeService = inject(EmployeeService); // Exposed for template
  private readonly tableLayoutService = inject(TableLayoutService);
  private toastService = inject(ToastService);

  // Expose Math for template
  Math = Math;

  @ViewChild('floorCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('canvasContainer', { static: true }) containerRef!: ElementRef<HTMLDivElement>;
  private ctx!: CanvasRenderingContext2D;
  private resizeHandler!: () => void;
  private tableRenderer!: TableRenderer;
  private viewportWidth = 0;
  private viewportHeight = 0;
  floorName = input<FloorType | string>('main');
  showEmployees = input<boolean>(false);
  showKitchenBuilder = input<boolean>(false);
  private previousFloor: FloorType | string | null = null;
  private globalDragOverHandler?: (e: DragEvent) => void;
  private globalDropHandler?: (e: DragEvent) => void;

  // Tables state for drag and drop
  private tables: Table[] = [];
  private dragState: DragState = {
    isDragging: false,
    draggedTable: null,
    dragOffset: { x: 0, y: 0 },
    hasDragMovement: false,
    dragEnabled: false
  };
  private dragOverTable: Table | null = null;
  private lastHoveredTableId: string | null = null; // Track last hovered table to avoid unnecessary redraws
  private pendingRedraw: number | null = null; // RAF id for throttled redraws
  private panState: PanState = {
    isPanning: false,
    panStart: { x: 0, y: 0 },
    panOffset: { x: 0, y: 0 },
    isPanModeActive: false,
    pendingPanActivation: false,
    spacePressed: false
  };
  private pendingDepartmentId: string | null = null; // latched during drag enter/over

  // Kitchen items state
  private kitchenCatalog: KitchenItem[] = [];
  kitchenItems = signal<KitchenLayoutItem[]>([]);
  kitchenImages = new Map<string, HTMLImageElement>(); // Exposed for template
  selectedKitchenItemId = signal<string | null>(null); // Exposed for template
  private readonly KITCHEN_DISPLAY_COUNT = 2; // Display 2 images at a time
  private kitchenStartIndex = 0;
  private kitchenAnimationState: {
    isAnimating: boolean;
    progress: number; // 0 to 1
    direction: 'next' | 'prev' | null;
    targetIndex: number;
    animationFrameId: number | null;
  } = {
    isAnimating: false,
    progress: 0,
    direction: null,
    targetIndex: 0,
    animationFrameId: null
  };

  // Zoom state
  zoomLevel = signal<number>(0.75);
  private readonly MIN_ZOOM = 0.5;
  private readonly MAX_ZOOM = 3;
  private readonly ZOOM_STEP = 0.1;
  private panOffset = { x: 0, y: 0 };
  private readonly PAN_STEP = 20; // Pixels to pan per arrow key press
  canvasOffsetX = signal<number>(0);
  canvasOffsetY = signal<number>(0);
  private floorOffsets: FloorOffsets = {};
  private tablePositions: TablePositionsMap = {};
  // Pan state properties moved to panState object above
  // Keeping these for backward compatibility but they should use panState

  // Table configuration state (for modal flow)
  tableConfigTable: Table | null = null;
  tableConfigStep: 'details' | 'nfc' = 'details';
  tableConfigData: TableConfigFormData = {
    width: 4,
    height: 4,
    capacity: 6,
    maxStay: ''
  };
  private tableConfigOriginal: TableConfigOriginal | null = null;
  nfcState: NfcState = {
    read: false,
    write: false,
    test: false
  };
  private lastPreviewCapacity: number | null = null;
  readonly gridSizeOptions = [2, 3, 4, 5, 6];
  readonly capacityRange = { min: 2, max: 16 };

  // Table info hover state
  isTableHovered = signal<boolean>(false);
  hoveredTable = signal<Table | null>(null);
  tooltipX = signal<number>(0);
  tooltipY = signal<number>(0);
  
  // Kitchen item tooltip state
  isKitchenItemHovered = signal<boolean>(false);
  hoveredKitchenItem = signal<KitchenLayoutItem | null>(null);
  kitchenTooltipX = signal<number>(0);
  kitchenTooltipY = signal<number>(0);
  
  // Kitchen build mode (when ON, hide tables; when OFF, show tables)
  kitchenBuildMode = signal<boolean>(false);

  // Selected table state
  selectedTableId = signal<string | null>(null);

  // Effect to redraw canvas when floor changes
  private floorEffect = effect(() => {
    const floor = this.floorName();
    if (this.ctx) {
      // Only reset table configuration state when actually switching floors (not on initial load)
      // This ensures lastPreviewCapacity and table config state don't persist across floors
      if (this.previousFloor !== null && this.previousFloor !== floor) {
        this.resetTableConfigState();
      }
      this.previousFloor = floor;
      
      // Set fixed zoom for kitchen floor
      if (floor === 'kitchen') {
        this.zoomLevel.set(0.6);
        this.panOffset = { x: 0, y: 0 }; // Reset pan for kitchen
        this.updateCanvasOffset(0, 0);
      }
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

  // Effect to redraw canvas when selected kitchen item changes
  private selectedKitchenItemEffect = effect(() => {
    const selectedId = this.selectedKitchenItemId();
    if (this.ctx && this.floorName() === 'kitchen') {
      this.drawFloorCanvas(this.floorName());
    }
  });

  // Effect to sync footer buttons with kitchen build mode
  private footerButtonsEffect = effect(() => {
    if (this.floorName() === 'kitchen') {
      const showBuilder = this.showKitchenBuilder();
      const showEmployees = this.showEmployees();
      
      // When build button is clicked (showKitchenBuilder = true), hide tables (build mode ON)
      if (showBuilder) {
        this.kitchenBuildMode.set(true);
      }
      // When employees button is clicked (showEmployees = true), show tables (build mode OFF)
      else if (showEmployees) {
        this.kitchenBuildMode.set(false);
      }
    }
  });

  // Effect to redraw canvas when build mode changes
  private kitchenBuildModeEffect = effect(() => {
    const buildMode = this.kitchenBuildMode();
    if (this.ctx && this.floorName() === 'kitchen') {
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

    // Redraw when icons are loaded
    this.tableRenderer.onIconsLoaded(() => {
      this.drawFloorCanvas(this.floorName());
    });

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
    window.addEventListener('keyup', this.onKeyUp.bind(this));
    
    // Add drag and drop event listeners for department assignment
    canvas.addEventListener('dragover', this.onDragOver.bind(this));
    canvas.addEventListener('drop', this.onDrop.bind(this));
    canvas.addEventListener('dragenter', this.onDragEnter.bind(this));
    canvas.addEventListener('dragleave', this.onDragLeave.bind(this));
    
    // Add wheel event listener for zoom
    canvas.addEventListener('wheel', this.onWheel.bind(this), { passive: false });
    
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

      this.viewportWidth = canvasWidth;
      this.viewportHeight = canvasHeight;
    }
  }

  private loadTables(): void {
    const floor = this.floorName();
    this.restoreCanvasOffsetForFloor(floor);
    
    // Load kitchen items if kitchen floor
    if (floor === 'kitchen') {
      this.kitchenCatalog = getKitchenFloorItems();
      // Load persisted employee assignments
      this.loadKitchenAssignments();
      this.kitchenStartIndex = 0;
      this.kitchenCatalog.forEach((item, idx) => {
        if (item.id === this.selectedKitchenItemId()) {
          this.kitchenStartIndex = idx;
        }
      });
      this.kitchenStartIndex = this.kitchenCatalog.length
        ? this.kitchenStartIndex % this.kitchenCatalog.length
        : 0;
      this.loadKitchenImages();
      
      // Also load tables for kitchen floor (they'll be shown/hidden based on build mode)
      const defaultTables = this.tableLayoutService.getTablesForFloor(floor);
      const savedPositions = this.tablePositions[floor] || {};
      const currentTablePositions: Record<string, { x: number; y: number }> = {};
      if (this.tables.length > 0) {
        this.tables.forEach(table => {
          currentTablePositions[table.id] = { x: table.x, y: table.y };
        });
      }
      
      this.tables = defaultTables.map(table => {
        if (currentTablePositions[table.id]) {
          return { ...table, x: currentTablePositions[table.id].x, y: currentTablePositions[table.id].y };
        }
        const savedPos = savedPositions[table.id];
        if (savedPos) {
          return { ...table, x: savedPos.x, y: savedPos.y };
        }
        return { ...table };
      });
      
      this.persistTablePositions();
      return;
    }
    
    // Clear kitchen-specific state when leaving kitchen floor
    this.kitchenCatalog = [];
    this.kitchenItems.set([]);
    this.selectedKitchenItemId.set(null);
    
    // Get tables from service (these should have updated positions if we've saved them)
    const defaultTables = this.tableLayoutService.getTablesForFloor(floor);
    
    // Check if we have saved positions for this floor
    const savedPositions = this.tablePositions[floor] || {};
    
    // IMPORTANT: Preserve current table positions if tables are already loaded
    // This prevents losing positions when loadTables() is called after a drag operation
    const currentTablePositions: Record<string, { x: number; y: number }> = {};
    if (this.tables.length > 0) {
      // We have tables already loaded - preserve their current positions
      this.tables.forEach(table => {
        currentTablePositions[table.id] = { x: table.x, y: table.y };
      });
    }
    
    this.tables = defaultTables.map(table => {
      // Priority order:
      // 1. Current table positions (if tables are already loaded - most recent)
      // 2. Saved positions from this.tablePositions (from current session)
      // 3. Position from service (which should have saved positions from previous sessions)
      // 4. Default position from layout
      
      if (currentTablePositions[table.id]) {
        // Use current position if tables are already loaded (preserves drag operations)
        return { ...table, x: currentTablePositions[table.id].x, y: currentTablePositions[table.id].y };
      }
      
      const savedPos = savedPositions[table.id];
      if (savedPos) {
        // Use saved position from current session
        return { ...table, x: savedPos.x, y: savedPos.y };
      }
      
      // Use position from service (which may have been updated by saveTableLayout)
      return { ...table };
    });
    
    // Update saved positions from loaded tables to keep them in sync
    // But preserve any positions we just kept from current tables
    this.persistTablePositions();
    
    // Only apply layout adjustments if no saved positions exist (first time loading)
    if (Object.keys(savedPositions).length === 0 && this.tables.length > 0) {
      this.adjustTablesToCanvas();
      this.persistTablePositions();
    }
  }

  private loadKitchenImages(): void {
    // Load all kitchen images
    this.kitchenCatalog.forEach(item => {
      if (!this.kitchenImages.has(item.id)) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          // Redraw when image loads
          this.drawFloorCanvas(this.floorName());
        };
        img.onerror = () => {
          console.error(`Failed to load kitchen image: ${item.image}`);
        };
        img.src = item.image;
        this.kitchenImages.set(item.id, img);
      }
    });
  }

  showNextKitchenItem(): void {
    if (!this.kitchenCatalog.length || this.floorName() !== 'kitchen' || this.kitchenAnimationState.isAnimating) {
      return;
    }
    const targetIndex = (this.kitchenStartIndex + 1) % this.kitchenCatalog.length;
    this.startKitchenAnimation('next', targetIndex);
  }

  showPreviousKitchenItem(): void {
    if (!this.kitchenCatalog.length || this.floorName() !== 'kitchen' || this.kitchenAnimationState.isAnimating) {
      return;
    }
    const targetIndex = (this.kitchenStartIndex - 1 + this.kitchenCatalog.length) % this.kitchenCatalog.length;
    this.startKitchenAnimation('prev', targetIndex);
  }

  private startKitchenAnimation(direction: 'next' | 'prev', targetIndex: number): void {
    this.kitchenAnimationState = {
      isAnimating: true,
      progress: 0,
      direction,
      targetIndex,
      animationFrameId: null
    };
    this.selectedKitchenItemId.set(null);
    this.animateKitchenTransition();
  }

  private animateKitchenTransition(): void {
    const duration = 400; // Animation duration in milliseconds
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation (ease-in-out)
      const easedProgress = progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;

      this.kitchenAnimationState.progress = easedProgress;

      // Redraw with animation progress
      this.drawFloorCanvas('kitchen');

      if (progress < 1) {
        this.kitchenAnimationState.animationFrameId = requestAnimationFrame(animate);
      } else {
        // Animation complete - update index
        this.kitchenStartIndex = this.kitchenAnimationState.targetIndex;
        this.kitchenAnimationState = {
          isAnimating: false,
          progress: 0,
          direction: null,
          targetIndex: 0,
          animationFrameId: null
        };
        // Final redraw without animation
    this.drawFloorCanvas('kitchen');
      }
    };

    this.kitchenAnimationState.animationFrameId = requestAnimationFrame(animate);
  }

  private restoreCanvasOffsetForFloor(floor: FloorType | string): void {
    const saved = this.floorOffsets[floor];
    const x = saved?.x ?? 0;
    const y = saved?.y ?? 0;
    this.canvasOffsetX.set(x);
    this.canvasOffsetY.set(y);
    if (!saved) {
      this.floorOffsets[floor] = { x, y };
    }
  }

  private updateCanvasOffset(x: number, y: number): void {
    const clampedX = Number.isFinite(x) ? x : 0;
    const clampedY = Number.isFinite(y) ? y : 0;
    if (clampedX === this.canvasOffsetX() && clampedY === this.canvasOffsetY()) {
      return;
    }
    this.canvasOffsetX.set(clampedX);
    this.canvasOffsetY.set(clampedY);
    const floor = this.floorName();
    this.floorOffsets[floor] = { x: clampedX, y: clampedY };
  }

  private getCombinedOffset(): { x: number; y: number } {
    return {
      x: this.panOffset.x + this.canvasOffsetX(),
      y: this.panOffset.y + this.canvasOffsetY(),
    };
  }

  private toCanvasCoordinates(screenX: number, screenY: number): CanvasCoordinates {
    const zoom = this.zoomLevel();
    const offsetX = this.canvasOffsetX();
    const offsetY = this.canvasOffsetY();
    return {
      canvasX: (screenX - this.panOffset.x - offsetX) / zoom,
      canvasY: (screenY - this.panOffset.y - offsetY) / zoom,
    };
  }

  private loadKitchenAssignments(): void {
    try {
      const stored = localStorage.getItem('kitchen_assignments');
      if (stored) {
        const assignments: Record<string, string[]> = JSON.parse(stored);
        // Apply assignments to kitchen catalog
        this.kitchenCatalog.forEach(item => {
          if (assignments[item.id]) {
            item.assignedEmployees = assignments[item.id];
          }
        });
      }
    } catch (error) {
      console.error('Failed to load kitchen assignments:', error);
    }
  }

  private saveKitchenAssignments(): void {
    try {
      const assignments: Record<string, string[]> = {};
      this.kitchenCatalog.forEach(item => {
        if (item.assignedEmployees && item.assignedEmployees.length > 0) {
          assignments[item.id] = item.assignedEmployees;
        }
      });
      localStorage.setItem('kitchen_assignments', JSON.stringify(assignments));
    } catch (error) {
      console.error('Failed to save kitchen assignments:', error);
    }
  }

  private persistTablePositions(): void {
    const floor = this.floorName();
    this.tablePositions[floor] = this.tables.reduce<Record<string, { x: number; y: number }>>((acc, table) => {
      acc[table.id] = { x: table.x, y: table.y };
      return acc;
    }, {});
  }

  private getTableAt(x: number, y: number): Table | null {
    const { canvasX, canvasY } = this.toCanvasCoordinates(x, y);
    
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

  private getKitchenItemAt(x: number, y: number): KitchenLayoutItem | null {
    const { canvasX, canvasY } = this.toCanvasCoordinates(x, y);
    
    // Check kitchen items in reverse order (top to bottom)
    const items = this.kitchenItems();
    for (let i = items.length - 1; i >= 0; i--) {
      const item = items[i];
      if (canvasX >= item.x && canvasX <= item.x + item.width &&
          canvasY >= item.y && canvasY <= item.y + item.height) {
        return item;
      }
    }
    return null;
  }

  /**
   * Get chair at coordinates (if any)
   */
  private getChairAt(x: number, y: number): ChairPosition | null {
    const { canvasX, canvasY } = this.toCanvasCoordinates(x, y);

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
    // Disable zoom for kitchen floor
    if (this.floorName() === 'kitchen') {
      return;
    }
    const canvas = this.canvasRef.nativeElement;
    if (!canvas) return;
    
    const canvasWidth = canvas.width / (window.devicePixelRatio || 1);
    const canvasHeight = canvas.height / (window.devicePixelRatio || 1);

    // Ensure the viewport can scroll to reveal dragged tables
    const wrapper = this.containerRef?.nativeElement;
    if (wrapper) {
      wrapper.style.overflowX = 'auto';
      wrapper.style.overflowY = 'auto';
    }
    
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
      const zoomFactor = newZoom / oldZoom;
      const combined = this.getCombinedOffset();
      const newCombinedX = zoomCenterX - (zoomCenterX - combined.x) * zoomFactor;
      const newCombinedY = zoomCenterY - (zoomCenterY - combined.y) * zoomFactor;
      this.panOffset.x = newCombinedX - this.canvasOffsetX();
      this.panOffset.y = newCombinedY - this.canvasOffsetY();
      this.zoomLevel.set(newZoom);
    }
  }

  zoomOut(): void {
    // Disable zoom for kitchen floor
    if (this.floorName() === 'kitchen') {
      return;
    }
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
      const zoomFactor = newZoom / oldZoom;
      const combined = this.getCombinedOffset();
      const newCombinedX = zoomCenterX - (zoomCenterX - combined.x) * zoomFactor;
      const newCombinedY = zoomCenterY - (zoomCenterY - combined.y) * zoomFactor;
      this.panOffset.x = newCombinedX - this.canvasOffsetX();
      this.panOffset.y = newCombinedY - this.canvasOffsetY();
      this.zoomLevel.set(newZoom);
    }
  }

  resetZoom(): void {
    // Disable reset zoom for kitchen floor
    if (this.floorName() === 'kitchen') {
      return;
    }
    this.zoomLevel.set(1);
    this.panOffset = { x: 0, y: 0 };
    this.updateCanvasOffset(0, 0);
    this.drawFloorCanvas(this.floorName());
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

    this.updateCanvasOffset(0, 0);
    this.zoomLevel.set(newZoom);
    this.panOffset.x = canvasWidth / 2 - centerX * newZoom;
    this.panOffset.y = canvasHeight / 2 - centerY * newZoom;
    this.drawFloorCanvas(this.floorName());
  }

  private onWheel(event: WheelEvent): void {
    // Disable wheel zoom for kitchen floor
    if (this.floorName() === 'kitchen') {
      return;
    }
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
      const combined = this.getCombinedOffset();
      const newCombinedX = mouseX - (mouseX - combined.x) * zoomFactor;
      const newCombinedY = mouseY - (mouseY - combined.y) * zoomFactor;
      this.panOffset.x = newCombinedX - this.canvasOffsetX();
      this.panOffset.y = newCombinedY - this.canvasOffsetY();
      
      this.zoomLevel.set(newZoom);
    }
  }

  private onMouseDown(event: MouseEvent): void {
    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const shouldPan =
      event.button === 1 ||
      (event.button === 0 && (event.ctrlKey || this.panState.spacePressed || this.panState.isPanModeActive || this.panState.pendingPanActivation));
    const baseCursor = this.panState.isPanModeActive || this.panState.spacePressed ? 'grab' : 'default';

    if (shouldPan) {
      event.preventDefault();
      this.panState.isPanning = true;
      const combined = this.getCombinedOffset();
      this.panState.panStart.x = x - combined.x;
      this.panState.panStart.y = y - combined.y;
      this.panState.pendingPanActivation = false;
      canvas.style.cursor = 'grabbing';
      return;
    }

    this.panState.pendingPanActivation = false;

    const { canvasX, canvasY } = this.toCanvasCoordinates(x, y);

    // Handle kitchen floor differently
    if (this.floorName() === 'kitchen') {
      const isBuildMode = this.kitchenBuildMode();
      
      // If build mode is OFF, allow table selection and dragging
      if (!isBuildMode) {
        const table = this.getTableAt(x, y);
        if (table) {
          // Select the table (single click - just show icons)
          this.selectedTableId.set(table.id);
          this.selectedKitchenItemId.set(null);
          // Hide hover tooltip when table is selected
          this.isTableHovered.set(false);
          // Don't prepare for drag on single click
          this.dragState.isDragging = false;
          this.dragState.dragEnabled = false;
          this.dragState.draggedTable = null;
          canvas.style.cursor = baseCursor;
          this.drawFloorCanvas(this.floorName());
          return;
        }
      }
      
      // Check for kitchen items
      const item = this.getKitchenItemAt(x, y);
      if (item) {
        this.selectedKitchenItemId.set(item.id);
        this.selectedTableId.set(null); // Clear table selection
      } else {
        this.selectedKitchenItemId.set(null);
      }
      this.drawFloorCanvas(this.floorName());
      return;
    }

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
          
          // Check if click is on rotate icon
          if (canvasX >= iconBounds.rotate.x && canvasX <= iconBounds.rotate.x + iconBounds.rotate.width &&
              canvasY >= iconBounds.rotate.y && canvasY <= iconBounds.rotate.y + iconBounds.rotate.height) {
            console.log('Rotate clicked for table:', selectedTable.label);
            this.handleRotateTable(selectedTable);
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
      const chairTable = chairClick.table;
      const totalSeats = chairTable.seats ?? chairTable.capacity ?? 0;
      const occupiedSeats = chairTable.occupiedChairs?.length ?? chairTable.guestCount ?? 0;
      const freeSeats = Math.max(0, totalSeats - occupiedSeats);
      const occupiedList = chairTable.occupiedChairs?.join(', ') ?? '—';

      console.log(
        `[Chair Click] Table ${chairTable.label} | Total seats: ${totalSeats} | Occupied: ${occupiedSeats} | Free: ${freeSeats} | Occupied chairs: ${occupiedList} | Clicked chair: ${chairClick.chairNumber}`
      );
      // Deselect table if clicking on chair
      this.selectedTableId.set(null);
      return; // Don't drag if clicking on chair
    }

    // Check if click is on a table
    const table = this.getTableAt(x, y);
    if (table) {
      const totalSeats = table.seats ?? table.capacity ?? 0;
      const occupiedSeats = table.occupiedChairs?.length ?? table.guestCount ?? 0;
      const freeSeats = Math.max(0, totalSeats - occupiedSeats);
      const occupiedList = table.occupiedChairs?.join(', ') ?? '—';

      console.log(
        `[Table Click] Table ${table.label} | Total seats: ${totalSeats} | Occupied: ${occupiedSeats} | Free: ${freeSeats} | Occupied chairs: ${occupiedList}`
      );
      // Select the table (single click - just show icons)
      this.selectedTableId.set(table.id);
      // Hide hover tooltip when table is selected
      this.isTableHovered.set(false);
      // Don't prepare for drag on single click
      this.dragState.isDragging = false;
      this.dragState.dragEnabled = false;
      this.dragState.draggedTable = null;
      canvas.style.cursor = baseCursor;
    } else {
      // Click outside any table - deselect
      this.selectedTableId.set(null);
      this.dragState.dragEnabled = false;
      this.dragState.draggedTable = null;
      // Hide hover tooltip when clicking outside
      this.isTableHovered.set(false);
      canvas.style.cursor = baseCursor;
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

    const { canvasX, canvasY } = this.toCanvasCoordinates(x, y);

    // Check if double click is on a table
    const table = this.getTableAt(x, y);
    if (table) {
      // Allow table dragging on kitchen floor when build mode is OFF
      if (this.floorName() === 'kitchen') {
        const isBuildMode = this.kitchenBuildMode();
        if (isBuildMode) {
          // Don't allow dragging in build mode
          return;
        }
      }
      
      console.log(`Double clicked on table no ${table.label} - dragging enabled`);
      this.panState.isPanModeActive = false;
      this.panState.pendingPanActivation = false;
      // Enable dragging mode
      this.dragState.dragEnabled = true;
      this.dragState.draggedTable = table;
      this.dragState.hasDragMovement = false;
      // Calculate drag offset accounting for zoom
      this.dragState.dragOffset.x = canvasX - table.x;
      this.dragState.dragOffset.y = canvasY - table.y;
      canvas.style.cursor = 'grabbing';
      // Start dragging immediately on double click
      this.dragState.isDragging = true;
      return;
    }

    this.panState.isPanModeActive = !this.panState.isPanModeActive;
    this.panState.pendingPanActivation = this.panState.isPanModeActive;
    const baseCursor = this.panState.isPanModeActive || this.panState.spacePressed ? 'grab' : 'default';
    canvas.style.cursor = baseCursor;
  }

  /**
   * Handle edit table action
   */
  private handleEditTable(table: Table): void {
    console.log('Edit table:', table);
    // Add your edit logic here
  }

  /**
   * Handle rotate table action
   */
  private handleRotateTable(table: Table): void {
    // Rotate table by 90 degrees (0, 90, 180, 270)
    const currentRotation = table.rotation ?? 0;
    const newRotation = (currentRotation + 90) % 360;
    table.rotation = newRotation;
    
    // Redraw canvas
    this.drawFloorCanvas(this.floorName());
    
    // Save table layout
    this.saveTableLayout();
  }

  /**
   * Save current table layout to service
   */
  private saveTableLayout(): void {
    const floor = this.floorName();
    // Save current tables with their positions to the service
    this.tableLayoutService.addFloor(floor, this.tables);
    // Update saved positions from current tables (don't reload from service)
    this.persistTablePositions();
    this.drawFloorCanvas(floor);
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
    const baseCursor = this.panState.isPanModeActive || this.panState.spacePressed ? 'grab' : 'default';

    if (this.panState.isPanning) {
      const combinedX = x - this.panState.panStart.x;
      const combinedY = y - this.panState.panStart.y;
      const newOffsetX = combinedX - this.panOffset.x;
      const newOffsetY = combinedY - this.panOffset.y;
      this.updateCanvasOffset(newOffsetX, newOffsetY);
      canvas.style.cursor = 'grabbing';
      this.drawFloorCanvas(this.floorName());
      return;
    }

    if (this.floorName() === 'kitchen') {
      const isBuildMode = this.kitchenBuildMode();
      
      // Allow table dragging on kitchen floor when build mode is OFF
      if (!isBuildMode && this.dragState.isDragging && this.dragState.draggedTable && this.dragState.dragEnabled) {
        const { canvasX, canvasY } = this.toCanvasCoordinates(x, y);
        this.dragState.draggedTable.x = canvasX - this.dragState.dragOffset.x;
        this.dragState.draggedTable.y = canvasY - this.dragState.dragOffset.y;
        this.dragState.hasDragMovement = true;

        // Hide tooltip during drag
        this.isTableHovered.set(false);
        this.isKitchenItemHovered.set(false);

        // Redraw canvas
        this.drawFloorCanvas(this.floorName());
        return;
      }
      
      // Continue with normal hover logic for kitchen floor
      canvas.style.cursor = baseCursor;
    }

    // Only allow dragging if drag is enabled (after double click)
    if (this.dragState.isDragging && this.dragState.draggedTable && this.dragState.dragEnabled) {
      const { canvasX, canvasY } = this.toCanvasCoordinates(x, y);
      this.dragState.draggedTable.x = canvasX - this.dragState.dragOffset.x;
      this.dragState.draggedTable.y = canvasY - this.dragState.dragOffset.y;
      this.dragState.hasDragMovement = true;

      // Hide tooltip during drag
      this.isTableHovered.set(false);
      this.isKitchenItemHovered.set(false);

      // Redraw canvas
      this.drawFloorCanvas(this.floorName());
    } else {
      // Handle kitchen floor tooltips
      if (this.floorName() === 'kitchen') {
        const isBuildMode = this.kitchenBuildMode();
        
        // Check for tables first if build mode is OFF
        if (!isBuildMode) {
          const table = this.getTableAt(x, y);
          if (table) {
            this.isTableHovered.set(true);
            this.hoveredTable.set(table);
            this.isKitchenItemHovered.set(false);
            
            // Position tooltip for table
            const tooltipOffset = 15;
            const tooltipWidth = 350;
            const tooltipHeight = 500;
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            
            let tooltipX = event.clientX + tooltipOffset;
            let tooltipY = event.clientY + tooltipOffset;
            
            if (tooltipX + tooltipWidth > viewportWidth) {
              tooltipX = event.clientX - tooltipWidth - tooltipOffset;
            }
            if (tooltipY + tooltipHeight > viewportHeight) {
              tooltipY = event.clientY - tooltipHeight - tooltipOffset;
            }
            if (tooltipX < 0) {
              tooltipX = tooltipOffset;
            }
            if (tooltipY < 0) {
              tooltipY = tooltipOffset;
            }
            
            this.tooltipX.set(tooltipX);
            this.tooltipY.set(tooltipY);
            return;
          } else {
            this.isTableHovered.set(false);
          }
        }
        
        // Check for kitchen items
        const kitchenItem = this.getKitchenItemAt(x, y);
        if (kitchenItem) {
          this.isKitchenItemHovered.set(true);
          this.hoveredKitchenItem.set(kitchenItem);
          
          // Position tooltip near mouse cursor with smart boundary detection
          const tooltipOffset = 15;
          const tooltipWidth = 280; // Approximate tooltip width
          const tooltipHeight = 200; // Approximate tooltip height
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
          
          this.kitchenTooltipX.set(tooltipX);
          this.kitchenTooltipY.set(tooltipY);
        } else {
          this.isKitchenItemHovered.set(false);
        }
        return;
      }
      
      // Update cursor and tooltip on hover for tables
      const table = this.getTableAt(x, y);
      const selectedId = this.selectedTableId();
      // Only show grab cursor if drag is enabled, otherwise default
      canvas.style.cursor = (table && this.dragState.dragEnabled) ? 'grab' : baseCursor;
      
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
    const wasDragging = this.dragState.isDragging;
    const baseCursor = this.panState.isPanModeActive || this.panState.spacePressed ? 'grab' : 'default';
    
    // Stop panning
    if (this.panState.isPanning) {
      this.panState.isPanning = false;
      canvas.style.cursor = baseCursor;
      return;
    }
    
    if (this.dragState.isDragging) {
      this.dragState.isDragging = false;
      // Keep dragEnabled true so table can be moved again without double clicking
      // Only reset if clicking outside
      canvas.style.cursor = this.dragState.dragEnabled ? 'grab' : baseCursor;
    }

    if (wasDragging && this.dragState.draggedTable && this.dragState.hasDragMovement) {
      this.persistTablePositions();
      this.saveTableLayout(); // Save to service so drag/drop works on all floors
      this.dragState.hasDragMovement = false;
    }
  }

  private onMouseLeave(): void {
    // Hide tooltip when mouse leaves canvas
    this.isTableHovered.set(false);
    this.isKitchenItemHovered.set(false);
    // Stop panning if mouse leaves canvas
    if (this.panState.isPanning) {
      this.panState.isPanning = false;
      const canvas = this.canvasRef.nativeElement;
      const baseCursor = this.panState.isPanModeActive || this.panState.spacePressed ? 'grab' : 'default';
      canvas.style.cursor = baseCursor;
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

    if (event.code === 'Space') {
      event.preventDefault();
      if (!this.panState.spacePressed) {
        this.panState.spacePressed = true;
        if (!this.panState.isPanning) {
          const canvas = this.canvasRef.nativeElement;
          canvas.style.cursor = 'grab';
        }
      }
      return;
    }

    // Handle kitchen floor carousel with arrow keys
    if (this.floorName() === 'kitchen') {
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          this.showNextKitchenItem();
          return;
        case 'ArrowUp':
          event.preventDefault();
          this.showPreviousKitchenItem();
          return;
      }
    }

    // Handle panning for other floors
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

  private onKeyUp(event: KeyboardEvent): void {
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
      return;
    }

    if (event.code === 'Space') {
      this.panState.spacePressed = false;
      if (!this.panState.isPanning) {
        const canvas = this.canvasRef.nativeElement;
        const baseCursor = this.panState.isPanModeActive ? 'grab' : 'default';
        canvas.style.cursor = baseCursor;
      }
    }
  }

  /**
   * Pan methods for programmatic control
   */
  panUp(): void {
    const currentX = this.canvasOffsetX();
    const currentY = this.canvasOffsetY();
    this.updateCanvasOffset(currentX, currentY + this.PAN_STEP);
    this.drawFloorCanvas(this.floorName());
  }

  panDown(): void {
    const currentX = this.canvasOffsetX();
    const currentY = this.canvasOffsetY();
    this.updateCanvasOffset(currentX, currentY - this.PAN_STEP);
    this.drawFloorCanvas(this.floorName());
  }

  panLeft(): void {
    const currentX = this.canvasOffsetX();
    const currentY = this.canvasOffsetY();
    this.updateCanvasOffset(currentX + this.PAN_STEP, currentY);
    this.drawFloorCanvas(this.floorName());
  }

  panRight(): void {
    const currentX = this.canvasOffsetX();
    const currentY = this.canvasOffsetY();
    this.updateCanvasOffset(currentX - this.PAN_STEP, currentY);
    this.drawFloorCanvas(this.floorName());
  }

  private onDragEnter(event: DragEvent): void {
    event.preventDefault();
    const departmentDragging = this.dragDropService.isDragging();
    const employeeDragging = this.employeeDragService.isDragging();

    if (departmentDragging || employeeDragging) {
      const canvas = this.canvasRef.nativeElement;
      canvas.style.cursor = 'copy';
    }

    if (departmentDragging) {
      // Latch the current department id in case source fires dragend early
      const dept = this.dragDropService.getDraggedDepartment();
      this.pendingDepartmentId = dept?.id ?? this.pendingDepartmentId;
    }
  }

  private onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    
    const departmentDragging = this.dragDropService.isDragging();
    const employeeDragging = this.employeeDragService.isDragging();

    if (!departmentDragging && !employeeDragging && !this.pendingDepartmentId) {
      return;
    }

    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const table = this.getTableAt(x, y) ?? this.getNearestTable(x, y, 200);
    const currentTableId = table?.id ?? null;
    
    // Only update cursor immediately (cheap operation)
    if (table) {
      if (event.dataTransfer) {
        event.dataTransfer.dropEffect = 'copy';
      }
      canvas.style.cursor = 'copy';
    } else {
      canvas.style.cursor = 'not-allowed';
    }
    
    // Only redraw if the hovered table changed (optimization)
    if (currentTableId !== this.lastHoveredTableId) {
      this.dragOverTable = table;
      this.lastHoveredTableId = currentTableId;
      
      // Throttle redraws using requestAnimationFrame
      if (this.pendingRedraw !== null) {
        cancelAnimationFrame(this.pendingRedraw);
      }
      this.pendingRedraw = requestAnimationFrame(() => {
        this.drawFloorCanvas(this.floorName());
        this.pendingRedraw = null;
      });
    }
    
    if (departmentDragging) {
      // Continuously latch department while dragging
      const dept = this.dragDropService.getDraggedDepartment();
      this.pendingDepartmentId = dept?.id ?? this.pendingDepartmentId;
    }
  }

  private onDragLeave(event: DragEvent): void {
    this.dragOverTable = null;
    this.lastHoveredTableId = null;
    const canvas = this.canvasRef.nativeElement;
    canvas.style.cursor = 'default';
    
    // Cancel any pending redraw
    if (this.pendingRedraw !== null) {
      cancelAnimationFrame(this.pendingRedraw);
      this.pendingRedraw = null;
    }
    
    // Redraw to remove visual feedback
    this.drawFloorCanvas(this.floorName());
  }

  private onDrop(event: DragEvent): void {
    // Log IMMEDIATELY at the very first line - before any processing
    const dropTime = performance.now();
    const dragStartTimeDept = this.dragDropService.getDragStartTime();
    const dragStartTimeEmp = this.employeeDragService.getDragStartTime();
    const dragStartTime = dragStartTimeDept ?? dragStartTimeEmp;
    const totalDuration = dragStartTime ? dropTime - dragStartTime : 0;
    
    console.log('🎯 DROP EVENT FIRED', {
      dropTime: dropTime,
      dragStartTime: dragStartTime,
      totalDuration: `${totalDuration.toFixed(2)}ms`,
      timestamp: new Date().toISOString()
    });
    
    event.preventDefault();
    event.stopPropagation();

    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const table = this.getTableAt(x, y);
    let department = this.dragDropService.getDraggedDepartment();
    let employee = this.employeeDragService.getDraggedEmployee();
    
    // Log immediately what we detected
    if (department) {
      console.log(`📦 Department: ${department.name}`, {
        detectedAt: performance.now() - dropTime,
        fromDragStart: dragStartTimeDept ? performance.now() - dragStartTimeDept : null
      });
    }
    if (employee) {
      console.log(`👤 Employee: ${employee.name}`, {
        detectedAt: performance.now() - dropTime,
        fromDragStart: dragStartTimeEmp ? performance.now() - dragStartTimeEmp : null
      });
    }
    
    // Fallback: if service is null (e.g., some browsers fire dragend before drop),
    // read the id from dataTransfer
    if (!department && event.dataTransfer) {
      const id = event.dataTransfer.getData('text/plain');
      if (id) {
        department = { id, name: id.charAt(0).toUpperCase() + id.slice(1), description: '', icon: '' } as Department;
        console.log('📦 Fallback department from dataTransfer:', id, performance.now() - dropTime, 'ms');
      }
    }
    // Final fallback: use latched id
    if (!department && this.pendingDepartmentId) {
      const id = this.pendingDepartmentId;
      department = { id, name: id.charAt(0).toUpperCase() + id.slice(1), description: '', icon: '' } as any;
      console.log('📦 Fallback department from latched id:', id, performance.now() - dropTime, 'ms');
    }

    if (!employee && event.dataTransfer) {
      const employeeId = event.dataTransfer.getData('application/x-employee-id');
      if (employeeId) {
        const matched = this.employeeService.getEmployeeById(employeeId);
        if (matched) {
          employee = matched;
          console.log('👤 Fallback employee from dataTransfer:', matched.name, performance.now() - dropTime, 'ms');
        }
      }
    }

    // If not exactly over a table, pick the nearest one within a small radius
    let targetTable = this.dragOverTable ?? table;
    let isExistingTable = !!targetTable; // Track if table existed before drop
    if (!targetTable) {
      targetTable = this.getNearestTable(x, y, 200); // widen tolerance while dragging
      if (targetTable) {
        console.log(`📍 Using nearest table: "${targetTable.label}"`, performance.now() - dropTime, 'ms');
        isExistingTable = true; // Found an existing table
      }
    }
    if (!targetTable) {
      console.warn('⚠️ No table found nearby', performance.now() - dropTime, 'ms');
    }

    // Check if dropping on kitchen items (kitchen floor)
    const isKitchenFloor = this.floorName() === 'kitchen';
    const kitchenItem = isKitchenFloor ? this.getKitchenItemAt(x, y) : null;
    
    // If no table was targeted and the user dropped a new table department, create one on the fly
    // But don't create on kitchen floor or on kitchen items
    if (!targetTable && department?.id?.toLowerCase() === 'table' && !isKitchenFloor && !kitchenItem) {
      const newTable = this.createTableFromDrop(x, y);
      if (newTable) {
        this.tables.push(newTable);
        // Track this table for subsequent operations
        targetTable = newTable;
        isExistingTable = false; // This is a newly created table
      }
    }

    if (targetTable && department) {
      // Log immediately before any processing with full timeline
      console.log(`✅ DROPPED: "${department.name}" → "${targetTable.label}"`, {
        dragStartTime: dragStartTimeDept,
        dropTime: dropTime,
        totalDuration: `${totalDuration.toFixed(2)}ms`,
        timestamp: new Date().toISOString()
      });
      
      // Assign department to table
      targetTable.department = department.id;
      
      // Redraw canvas to show the change (this might take time, but log already happened)
      this.drawFloorCanvas(this.floorName());
      
      // Show success feedback
      this.showDropFeedback(targetTable, department);

      // If the dropped department is "Table", ONLY open the configuration panel if:
      // 1. It's an existing table (not newly created)
      // 2. We're not on the kitchen floor
      // 3. We're not dropping on a kitchen item
      if (department.id?.toLowerCase() === 'table' && isExistingTable && !isKitchenFloor && !kitchenItem) {
        // Seed suggested grid/capacity from current table dimensions
        const suggestedWidthGrid = Math.max(2, Math.round(targetTable.width / 40));
        const suggestedHeightGrid = Math.max(2, Math.round(targetTable.height / 40));
        targetTable.widthGrid = suggestedWidthGrid;
        targetTable.heightGrid = suggestedHeightGrid;
        targetTable.capacity = this.clampCapacity(targetTable.seats ?? 6);
        this.openTableConfig(targetTable);
      } else if (department.id?.toLowerCase() === 'table' && !isExistingTable) {
        // Show success toast when table is created (but don't open config)
        this.toastService.success('Table created.');
      }

      // Persist table updates (department assignment or newly created table)
      this.persistTablePositions();
      this.tableLayoutService.addFloor(this.floorName(), this.tables);
    }

    // Handle employee drop on kitchen items (kitchen floor only)
    if (isKitchenFloor && kitchenItem && employee) {
      // Check if employee is already assigned to this kitchen item
      const currentAssigned = kitchenItem.assignedEmployees || [];
      const isAlreadyAssigned = currentAssigned.includes(employee.id);
      
      if (!isAlreadyAssigned) {
        // Add employee to kitchen item
        if (!kitchenItem.assignedEmployees) {
          kitchenItem.assignedEmployees = [];
        }
        kitchenItem.assignedEmployees.push(employee.id);
        
        // Update employee assignment
        this.employeeService.updateEmployee(employee.id, {
          assignedKitchenId: kitchenItem.id
        });
        
        // Update the kitchen catalog to persist the change
        const catalogIndex = this.kitchenCatalog.findIndex(item => item.id === kitchenItem.id);
        if (catalogIndex !== -1) {
          this.kitchenCatalog[catalogIndex] = { ...kitchenItem };
        }
        
        // Persist assignments to localStorage
        this.saveKitchenAssignments();
        
        // Show toast notification
        const departmentName = kitchenItem.departmentName || kitchenItem.label;
        const emoji = kitchenItem.emoji || '';
        this.toastService.success(`Added to ${departmentName} ${emoji}`);
        
        // Redraw canvas
        this.drawFloorCanvas(this.floorName());
        
        console.log(`✅ DROPPED: "${employee.name}" → "${departmentName}" (${kitchenItem.id})`, {
          dragStartTime: dragStartTimeEmp,
          dropTime: dropTime,
          totalDuration: `${totalDuration.toFixed(2)}ms`,
          timestamp: new Date().toISOString()
        });
      } else {
        // Employee already assigned, show info message
        this.toastService.info(`${employee.name} is already assigned to this station`);
      }
    }
    
    // Handle employee drop on tables (for floor service)
    if (targetTable && employee && !isKitchenFloor) {
      const floor = this.floorName();
      const floorLabel = floor.charAt(0).toUpperCase() + floor.slice(1);
      
      // Update employee assignment
      this.employeeService.updateEmployee(employee.id, {
        assignedTableId: targetTable.id
      });
      
      // Show toast notification
      this.toastService.success(`Assigned to ${targetTable.label}`);
      
      // Log immediately with full timeline
      console.log(`✅ DROPPED: "${employee.name}" → "${targetTable.label}" (${floorLabel})`, {
        dragStartTime: dragStartTimeEmp,
        dropTime: dropTime,
        totalDuration: `${totalDuration.toFixed(2)}ms`,
        timestamp: new Date().toISOString()
      });
    }

    this.dragOverTable = null;
    this.lastHoveredTableId = null;
    canvas.style.cursor = 'default';
    
    // Cancel any pending redraw
    if (this.pendingRedraw !== null) {
      cancelAnimationFrame(this.pendingRedraw);
      this.pendingRedraw = null;
    }
    
    this.dragDropService.endDrag();
    this.employeeDragService.endDrag();
    this.pendingDepartmentId = null;
  }

  /**
   * Find the nearest table to a point within a given pixel radius (screen coords)
   */
  private getNearestTable(screenX: number, screenY: number, radius: number): Table | null {
    const { canvasX, canvasY } = this.toCanvasCoordinates(screenX, screenY);
    const zoom = this.zoomLevel();
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

  private showDropFeedback(table: Table, department: Department): void {
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
    // Ensure we're using the table from the current floor's tables array
    // This prevents issues with stale references after floor changes
    const currentFloorTable = this.tables.find(t => t.id === table.id) || table;
    
    this.tableConfigTable = currentFloorTable;
    this.tableConfigStep = 'details';
    this.tableConfigOriginal = {
      seats: currentFloorTable.seats,
      capacity: currentFloorTable.capacity,
      widthGrid: currentFloorTable.widthGrid,
      heightGrid: currentFloorTable.heightGrid,
      maxStayMinutes: currentFloorTable.maxStayMinutes,
      width: currentFloorTable.width,
      height: currentFloorTable.height,
      shape: currentFloorTable.shape,
      x: currentFloorTable.x,
      y: currentFloorTable.y,
      occupiedChairs: currentFloorTable.occupiedChairs ? [...currentFloorTable.occupiedChairs] : undefined,
    };
    const initialCapacity = this.clampCapacity(currentFloorTable.capacity ?? currentFloorTable.seats ?? 6);
    this.tableConfigData = {
      width: currentFloorTable.widthGrid ?? 4,
      height: currentFloorTable.heightGrid ?? 4,
      capacity: initialCapacity,
      maxStay: currentFloorTable.maxStayMinutes ? String(currentFloorTable.maxStayMinutes) : ''
    };
    // Initialize lastPreviewCapacity to null first, then let previewTableConfiguration set it
    // This ensures proper initialization and change detection
    this.lastPreviewCapacity = null;
    this.nfcState = {
      read: false,
      write: false,
      test: false
    };
    // Call previewTableConfiguration to initialize the table state
    // This will set lastPreviewCapacity to the initial capacity
    this.previewTableConfiguration();
    this.drawFloorCanvas(this.floorName());
  }

  /**
   * Reset table configuration state when switching floors
   * This ensures state doesn't persist across different floors
   */
  private resetTableConfigState(): void {
    // Reset capacity tracking to ensure proper change detection on new floor
    // This is the key fix - reset lastPreviewCapacity so capacity changes are detected correctly
    this.lastPreviewCapacity = null;
    
    // Close any open table config panel and restore original values
    if (this.tableConfigTable && this.tableConfigOriginal) {
      // Restore original values before closing
      this.tableConfigTable.capacity = this.tableConfigOriginal.capacity;
      this.tableConfigTable.seats = this.tableConfigOriginal.seats;
      this.tableConfigTable.widthGrid = this.tableConfigOriginal.widthGrid;
      this.tableConfigTable.heightGrid = this.tableConfigOriginal.heightGrid;
      this.tableConfigTable.maxStayMinutes = this.tableConfigOriginal.maxStayMinutes;
      if (typeof this.tableConfigOriginal.width === 'number') {
        this.tableConfigTable.width = this.tableConfigOriginal.width;
      }
      if (typeof this.tableConfigOriginal.height === 'number') {
        this.tableConfigTable.height = this.tableConfigOriginal.height;
      }
      if (this.tableConfigOriginal.shape) {
        this.tableConfigTable.shape = this.tableConfigOriginal.shape;
      }
      if (typeof this.tableConfigOriginal.x === 'number') {
        this.tableConfigTable.x = this.tableConfigOriginal.x;
      }
      if (typeof this.tableConfigOriginal.y === 'number') {
        this.tableConfigTable.y = this.tableConfigOriginal.y;
      }
      this.tableConfigTable.occupiedChairs = this.tableConfigOriginal.occupiedChairs ? [...this.tableConfigOriginal.occupiedChairs] : undefined;
      
      // Clear all table config state
      this.tableConfigTable = null;
      this.tableConfigOriginal = null;
      this.tableConfigStep = 'details';
      this.tableConfigData = {
        width: 4,
        height: 4,
        capacity: 6,
        maxStay: ''
      };
      this.nfcState = {
        read: false,
        write: false,
        test: false
      };
    } else {
      // If no panel is open, just reset the capacity tracking
      // Don't reset other state as it might interfere with operations
      // Only reset lastPreviewCapacity which is the key to detecting capacity changes
    }
  }

  cancelTableConfig(): void {
    if (this.tableConfigTable && this.tableConfigOriginal) {
      this.tableConfigTable.capacity = this.tableConfigOriginal.capacity;
      this.tableConfigTable.seats = this.tableConfigOriginal.seats;
      this.tableConfigTable.widthGrid = this.tableConfigOriginal.widthGrid;
      this.tableConfigTable.heightGrid = this.tableConfigOriginal.heightGrid;
      this.tableConfigTable.maxStayMinutes = this.tableConfigOriginal.maxStayMinutes;
      if (typeof this.tableConfigOriginal.width === 'number') {
        this.tableConfigTable.width = this.tableConfigOriginal.width;
      }
      if (typeof this.tableConfigOriginal.height === 'number') {
        this.tableConfigTable.height = this.tableConfigOriginal.height;
      }
      if (this.tableConfigOriginal.shape) {
        this.tableConfigTable.shape = this.tableConfigOriginal.shape;
      }
      if (typeof this.tableConfigOriginal.x === 'number') {
        this.tableConfigTable.x = this.tableConfigOriginal.x;
      }
      if (typeof this.tableConfigOriginal.y === 'number') {
        this.tableConfigTable.y = this.tableConfigOriginal.y;
      }
      this.tableConfigTable.occupiedChairs = this.tableConfigOriginal.occupiedChairs ? [...this.tableConfigOriginal.occupiedChairs] : undefined;
      this.drawFloorCanvas(this.floorName());
    }
    this.tableConfigTable = null;
    this.tableConfigOriginal = null;
    this.tableConfigStep = 'details';
  }

  continueToNfcStep(): void {
    if (!this.tableConfigTable) {
      return;
    }
    const nextCapacity = this.clampCapacity(this.tableConfigData.capacity);
    this.tableConfigTable.widthGrid = this.tableConfigData.width;
    this.tableConfigTable.heightGrid = this.tableConfigData.height;
    this.tableConfigTable.capacity = nextCapacity;
    this.tableConfigTable.seats = nextCapacity;
    this.trimOccupiedChairs(this.tableConfigTable, nextCapacity);
    this.applyCapacityPreset(this.tableConfigTable, nextCapacity, false);
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
    this.previewTableConfiguration();
    this.drawFloorCanvas(this.floorName());
  }

  private previewTableConfiguration(): void {
    if (!this.tableConfigTable) {
      return;
    }
    
    // Ensure we're using the table from the current floor's tables array
    // This prevents issues with stale references
    const currentTable = this.tables.find(t => t.id === this.tableConfigTable!.id) || this.tableConfigTable;
    if (currentTable !== this.tableConfigTable) {
      this.tableConfigTable = currentTable;
    }
    
    // Ensure capacity is a number (range inputs can sometimes return strings)
    const capacityValue = typeof this.tableConfigData.capacity === 'string' 
      ? parseInt(this.tableConfigData.capacity, 10) 
      : this.tableConfigData.capacity;
    const previewCapacity = this.clampCapacity(capacityValue);
    
    // If lastPreviewCapacity is null or undefined, initialize it without applying changes
    // This handles the case where previewTableConfiguration is called before lastPreviewCapacity is set
    if (this.lastPreviewCapacity === null || this.lastPreviewCapacity === undefined) {
      this.lastPreviewCapacity = previewCapacity;
      this.tableConfigTable.capacity = previewCapacity;
      this.tableConfigTable.seats = previewCapacity;
      this.trimOccupiedChairs(this.tableConfigTable, previewCapacity);
      return;
    }
    
    // Use strict comparison to detect capacity changes
    // Convert both to numbers to ensure proper comparison (handle any type issues)
    const lastCapacityNum = Number(this.lastPreviewCapacity);
    const newCapacityNum = Number(previewCapacity);
    const capacityChanged = !isNaN(lastCapacityNum) && !isNaN(newCapacityNum) && lastCapacityNum !== newCapacityNum;

    // Always update the table capacity and seats
    this.tableConfigTable.capacity = previewCapacity;
    this.tableConfigTable.seats = previewCapacity;
    this.trimOccupiedChairs(this.tableConfigTable, previewCapacity);

    // Always apply a preset when capacity changes (both increase and decrease) to automatically resize table
    // This works for both directions: increasing finds larger preset, decreasing finds smaller preset
    if (capacityChanged) {
      this.applyCapacityPreset(this.tableConfigTable, previewCapacity, true);
      // Save changes to the service immediately so they persist
      // This prevents the table from reverting to its original state
      this.persistTablePositions();
      this.tableLayoutService.addFloor(this.floorName(), this.tables);
    }

    // Update lastPreviewCapacity after processing
    this.lastPreviewCapacity = previewCapacity;
  }

  /**
   * Find the appropriate preset capacity for a given capacity.
   * Returns the smallest preset that can accommodate the capacity.
   */
  private findPresetCapacity(capacity: number): number {
    const presetCapacities = Object.keys(TABLE_CAPACITY_PRESETS)
      .map(Number)
      .sort((a, b) => a - b);
    
    // Find the smallest preset that can accommodate the capacity
    for (const presetCapacity of presetCapacities) {
      if (capacity <= presetCapacity) {
        return presetCapacity;
      }
    }
    
    // If capacity exceeds all presets, use the largest one
    return presetCapacities[presetCapacities.length - 1];
  }

  private applyCapacityPreset(table: Table, capacity: number, updateForm: boolean): void {
    // Find the appropriate preset capacity (e.g., capacity 7 -> preset 8, capacity 3 -> preset 4)
    const presetCapacity = this.findPresetCapacity(capacity);
    const preset = TABLE_CAPACITY_PRESETS[presetCapacity];
    
    if (!preset) {
      this.recenterTable(table);
      this.ensureTableWithinBounds(table);
      return;
    }

    const centerX = table.x + table.width / 2;
    const centerY = table.y + table.height / 2;

    table.width = preset.width;
    table.height = preset.height;
    table.shape = preset.shape;

    const suggestedWidthGrid = Math.max(2, Math.round(preset.width / 40));
    const suggestedHeightGrid = Math.max(2, Math.round(preset.height / 40));

    table.widthGrid = suggestedWidthGrid;
    table.heightGrid = suggestedHeightGrid;

    table.x = centerX - table.width / 2;
    table.y = centerY - table.height / 2;

    this.ensureTableWithinBounds(table);

    if (updateForm) {
      this.tableConfigData.width = suggestedWidthGrid;
      this.tableConfigData.height = suggestedHeightGrid;
    }
  }

  private recenterTable(table: Table): void {
    const centerX = table.x + table.width / 2;
    const centerY = table.y + table.height / 2;
    table.x = centerX - table.width / 2;
    table.y = centerY - table.height / 2;
  }

  private ensureTableWithinBounds(table: Table): void {
    // No boundary restrictions - tables can be positioned anywhere
    // This allows the layout to use all available space including empty white spaces
    // Users can pan/zoom to navigate to tables outside the initial viewport
    return;
  }

  private trimOccupiedChairs(table: Table, capacity: number): void {
    if (!table.occupiedChairs || table.occupiedChairs.length === 0) {
      return;
    }
    table.occupiedChairs = table.occupiedChairs.filter(chair => chair >= 1 && chair <= capacity);
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

    // Mark table as ready (free) after completing NFC setup
    this.tableConfigTable.status = 'free';
    this.tableConfigTable.syncedAt = new Date().toISOString();
    this.drawFloorCanvas(this.floorName());
    this.tableConfigOriginal = null;
    this.cancelTableConfig();
  }

  private clampCapacity(value: number): number {
    return Math.max(this.capacityRange.min, Math.min(this.capacityRange.max, value));
  }

  onKitchenItemMouseEnter(item: KitchenLayoutItem, event: MouseEvent): void {
    this.isKitchenItemHovered.set(true);
    this.hoveredKitchenItem.set(item);
    
    // Position tooltip near mouse cursor
    const tooltipOffset = 15;
    const tooltipWidth = 280;
    const tooltipHeight = 200;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    let tooltipX = event.clientX + tooltipOffset;
    let tooltipY = event.clientY + tooltipOffset;
    
    if (tooltipX + tooltipWidth > viewportWidth) {
      tooltipX = event.clientX - tooltipWidth - tooltipOffset;
    }
    if (tooltipY + tooltipHeight > viewportHeight) {
      tooltipY = event.clientY - tooltipHeight - tooltipOffset;
    }
    if (tooltipX < 0) {
      tooltipX = tooltipOffset;
    }
    if (tooltipY < 0) {
      tooltipY = tooltipOffset;
    }
    
    this.kitchenTooltipX.set(tooltipX);
    this.kitchenTooltipY.set(tooltipY);
  }

  onKitchenItemMouseLeave(): void {
    this.isKitchenItemHovered.set(false);
  }

  onKitchenItemClick(item: KitchenLayoutItem): void {
    this.selectedKitchenItemId.set(item.id);
    this.selectedTableId.set(null);
  }

  getKitchenImageSrc(itemId: string): string | null {
    const img = this.kitchenImages.get(itemId);
    return img?.complete ? img.src : null;
  }

  isKitchenImageLoaded(itemId: string): boolean {
    const img = this.kitchenImages.get(itemId);
    return img?.complete ?? false;
  }

  // Convert canvas coordinates to screen coordinates for HTML positioning
  canvasToScreenX(canvasX: number): number {
    const zoom = this.zoomLevel();
    const combined = this.getCombinedOffset();
    return canvasX * zoom + combined.x;
  }

  canvasToScreenY(canvasY: number): number {
    const zoom = this.zoomLevel();
    const combined = this.getCombinedOffset();
    return canvasY * zoom + combined.y;
  }

  ngOnDestroy(): void {
    // Cancel any pending animation
    if (this.kitchenAnimationState.animationFrameId !== null) {
      cancelAnimationFrame(this.kitchenAnimationState.animationFrameId);
      this.kitchenAnimationState.animationFrameId = null;
    }
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
      window.removeEventListener('keydown', this.onKeyDown.bind(this));
      window.removeEventListener('keyup', this.onKeyUp.bind(this));
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
    this.selectedKitchenItemEffect.destroy();
    this.kitchenBuildModeEffect.destroy();
  }

  toggleKitchenBuildMode(): void {
    this.kitchenBuildMode.set(!this.kitchenBuildMode());
  }

  private drawFloorCanvas(floor: FloorType | string): void {
    const canvas = this.canvasRef.nativeElement;
    if (!canvas || !this.ctx) return;

    const canvasWidth = canvas.width / (window.devicePixelRatio || 1);
    const canvasHeight = canvas.height / (window.devicePixelRatio || 1);
    const baseCursor =
      floor === 'kitchen'
        ? 'default'
        : (this.panState.isPanModeActive || this.panState.spacePressed ? 'grab' : 'default');
    canvas.style.cursor = baseCursor;

    // Clear canvas
    this.ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Draw background first (without zoom/pan)
    this.ctx.fillStyle = this.getCanvasBackgroundColor();
    this.ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Save context state
    this.ctx.save();

    // Apply zoom and pan transformations
    const zoom = this.zoomLevel();
    const offsetX = this.canvasOffsetX();
    const offsetY = this.canvasOffsetY();
    this.ctx.translate(offsetX, offsetY);
    this.ctx.translate(this.panOffset.x, this.panOffset.y);
    this.ctx.scale(zoom, zoom);

    // Draw different content based on selected floor
    if (floor === 'main' || floor === 'terrace' || floor === 'kitchen' || floor === 'major') {
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
      }
    } else {
      // Custom floor - draw tables from table layout service
      this.drawCustomFloor(floor);
    }

    // Restore context state
    this.ctx.restore();
  }

  private drawCustomFloor(floor: string): void {
    // Draw tables for custom floor (tables are already loaded in this.tables)
    this.tableRenderer.drawTables(this.tables, {
      selectedId: this.selectedTableId(),
      hoveredId: this.hoveredTable()?.id ?? null,
      dragTargetId: this.dragOverTable?.id ?? null,
    });
  }

  private drawMainFloor(): void {
    this.tableRenderer.drawTables(this.tables, {
      selectedId: this.selectedTableId(),
      hoveredId: this.hoveredTable()?.id ?? null,
      dragTargetId: this.dragOverTable?.id ?? null,
    });
  }

  private drawTerraceFloor(): void {
    this.tableRenderer.drawTables(this.tables, {
      selectedId: this.selectedTableId(),
      hoveredId: this.hoveredTable()?.id ?? null,
      dragTargetId: this.dragOverTable?.id ?? null,
    });
  }

  private drawKitchenFloor(): void {
    const canvas = this.canvasRef.nativeElement;
    const dpr = window.devicePixelRatio || 1;
    const canvasWidth = canvas.width / dpr;
    const canvasHeight = canvas.height / dpr;
    
    // Draw tables on the left side if build mode is OFF
    const isBuildMode = this.kitchenBuildMode();
    if (!isBuildMode) {
      this.tableRenderer.drawTables(this.tables, {
        selectedId: this.selectedTableId(),
        hoveredId: this.hoveredTable()?.id ?? null,
        dragTargetId: this.dragOverTable?.id ?? null,
      });
    }

    const totalItems = this.kitchenCatalog.length;
    if (!totalItems) {
      this.kitchenItems.set([]);
      return;
    }

    const displayCount = Math.min(this.KITCHEN_DISPLAY_COUNT, totalItems);
    const spacing = 40; // Consistent gap between kitchen images (applied to all images)
    const cardWidth = 360; // Card width (increased for bigger images)
    const cardHeight = 480; // Card height (includes info pill + image + employee avatars + padding)
    const imageHeight = 360; // Image area height (increased for bigger images)
    const horizontalPadding = 60; // Right alignment with padding when build mode ON
    const controlsRight = -388; // Controls right position - moved 400px more to the right (12 - 400 = -388)
    const controlsTop = 24; // Controls top position
    const buildButtonHeight = 44; // Build button height
    const carouselButtonHeight = 44; // Each carousel button height
    const carouselButtonGap = 8; // Gap between carousel buttons
    const controlsGap = 12; // Gap between build button and carousel buttons (in row layout, but we need vertical space)
    const gapBelowCarousel = 16; // Gap between carousel buttons and images
    const totalHeight = displayCount * cardHeight + (displayCount - 1) * spacing;
    
    // When tables are visible (build mode OFF), position images directly under carousel buttons
    // Build button: top 24px, height 44px = ends at 68px
    // Carousel buttons: 2 buttons (44px each) + gap (8px) = 96px total height
    // Since controls are in a row, carousel buttons are at same top level (24px)
    // But we want images below the carousel buttons, so calculate from the bottom of carousel area
    // Carousel buttons bottom: top (24px) + max height (44px for single button, but they're stacked vertically in the row)
    // Actually, carousel buttons are in a column (flex-direction: column), so they stack vertically
    // Total carousel height: 44px + 8px + 44px = 96px
    // Carousel buttons end at: 24px + 96px = 120px
    const carouselButtonsBottom = controlsTop + carouselButtonHeight + carouselButtonGap + carouselButtonHeight;
    const baseStartY = isBuildMode 
      ? Math.max(60, (canvasHeight - totalHeight) / 2) // Center vertically when build mode ON
      : carouselButtonsBottom + gapBelowCarousel; // Directly under carousel buttons when tables are visible
    
    // Position images right-aligned with controls when tables are visible
    const padding = isBuildMode ? horizontalPadding : controlsRight;
    const startX = canvasWidth - padding - cardWidth; // Right-aligned with controls when tables are visible

    const isAnimating = this.kitchenAnimationState.isAnimating;
    const progress = this.kitchenAnimationState.progress;
    const direction = this.kitchenAnimationState.direction;
    const slideDistance = cardHeight + spacing;

    const layoutItems: KitchenLayoutItem[] = [];

    if (isAnimating && direction) {
      // During animation, show both old and new items with interpolation
      if (direction === 'next') {
        // Next animation: first slides out up, second->first, new slides in from bottom
        // Draw the old first item sliding out (up)
        const oldFirstIndex = this.kitchenStartIndex % totalItems;
        const oldFirstItem = this.kitchenCatalog[oldFirstIndex];
        const oldFirstFromY = baseStartY;
        const oldFirstToY = baseStartY - slideDistance;
        const oldFirstY = oldFirstFromY + (oldFirstToY - oldFirstFromY) * progress;
        layoutItems.push({
          ...oldFirstItem,
          x: startX,
          y: oldFirstY,
          width: cardWidth,
          height: cardHeight,
        });

        // Draw the two visible items moving up
        for (let i = 0; i < displayCount; i++) {
          const newIndex = (this.kitchenAnimationState.targetIndex + i) % totalItems;
          const catalogItem = this.kitchenCatalog[newIndex];
          
          let y: number;
          if (i === 0) {
            // First position: second item moving up (from position 1 to 0)
            const fromY = baseStartY + slideDistance;
            const toY = baseStartY;
            y = fromY + (toY - fromY) * progress;
          } else {
            // Second position: new item sliding in from bottom
            const fromY = baseStartY + 2 * slideDistance;
            const toY = baseStartY + slideDistance;
            y = fromY + (toY - fromY) * progress;
          }

          layoutItems.push({
            ...catalogItem,
            x: startX,
            y,
            width: cardWidth,
            height: cardHeight, // Full card height including label
          });
        }
      } else {
        // Previous animation: second slides out down, first->second, new slides in from top
        // Draw the old second item sliding out (down)
        const oldSecondIndex = (this.kitchenStartIndex + 1) % totalItems;
        const oldSecondItem = this.kitchenCatalog[oldSecondIndex];
        const oldSecondFromY = baseStartY + slideDistance;
        const oldSecondToY = baseStartY + 2 * slideDistance;
        const oldSecondY = oldSecondFromY + (oldSecondToY - oldSecondFromY) * progress;
        layoutItems.push({
          ...oldSecondItem,
          x: startX,
          y: oldSecondY,
          width: cardWidth,
          height: cardHeight,
        });

        // Draw the two visible items moving down
        for (let i = 0; i < displayCount; i++) {
          const newIndex = (this.kitchenAnimationState.targetIndex + i) % totalItems;
          const catalogItem = this.kitchenCatalog[newIndex];
          
          let y: number;
          if (i === 0) {
            // First position: new item sliding in from top
            const fromY = baseStartY - slideDistance;
            const toY = baseStartY;
            y = fromY + (toY - fromY) * progress;
          } else {
            // Second position: first item moving down (from position 0 to 1)
            const fromY = baseStartY;
            const toY = baseStartY + slideDistance;
            y = fromY + (toY - fromY) * progress;
          }

          layoutItems.push({
            ...catalogItem,
            x: startX,
            y,
            width: cardWidth,
            height: cardHeight, // Full card height including label
          });
        }
      }
    } else {
      // No animation - normal display
    for (let i = 0; i < displayCount; i++) {
      const index = (this.kitchenStartIndex + i) % totalItems;
      const catalogItem = this.kitchenCatalog[index];
        const y = baseStartY + i * slideDistance;
      layoutItems.push({
        ...catalogItem,
        x: startX,
        y,
        width: cardWidth,
        height: cardHeight,
      });
      }
    }

    this.kitchenItems.set(layoutItems);
    canvas.style.cursor = 'default';

    // Kitchen items are now rendered as HTML elements above canvas, not drawn on canvas
  }

  private drawMajorFloor(): void {
    this.tableRenderer.drawTables(this.tables, {
      selectedId: this.selectedTableId(),
      hoveredId: this.hoveredTable()?.id ?? null,
      dragTargetId: this.dragOverTable?.id ?? null,
    });
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

  private getTableCount(floor: FloorType | string): number {
    // For default floors, use the constant
    if (floor === 'main' || floor === 'terrace' || floor === 'kitchen' || floor === 'major') {
      return TABLE_CONSTANTS.FLOOR_TABLE_COUNTS[floor as FloorType] || 0;
    }
    // For custom floors, get actual table count from service
    const tables = this.tableLayoutService.getTablesForFloor(floor);
    return tables.length;
  }

  private adjustTablesToCanvas(): void {
    if (!this.viewportWidth || !this.viewportHeight || this.tables.length === 0) {
      return;
    }

    // Apply column-based layout - no boundary restrictions
    // Tables can extend beyond viewport, allowing use of all available space
    this.resolveOverlaps();

    // Optionally center the layout in viewport (but don't constrain it)
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    const chairDepth = CHAIR_BASE_DEPTH + CHAIR_SIDE_OFFSET;

    for (const table of this.tables) {
      const orientation = table.height >= table.width ? 'vertical' : 'horizontal';
      const extraLeft = orientation === 'vertical' ? chairDepth : 0;
      const extraRight = orientation === 'vertical' ? chairDepth : 0;
      const extraTop = orientation === 'horizontal' ? chairDepth : 0;
      const extraBottom = orientation === 'horizontal' ? chairDepth : 0;

      minX = Math.min(minX, table.x - extraLeft);
      minY = Math.min(minY, table.y - extraTop);
      maxX = Math.max(maxX, table.x + table.width + extraRight);
      maxY = Math.max(maxY, table.y + table.height + extraBottom);
    }

    // Only center if content is smaller than viewport
    // Otherwise, start from margin and let tables extend beyond
    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;

    if (contentWidth < this.viewportWidth && contentHeight < this.viewportHeight) {
      // Center small layouts
      const offsetX = (this.viewportWidth - contentWidth) / 2 - minX;
      const offsetY = (this.viewportHeight - contentHeight) / 2 - minY;
      
      for (const table of this.tables) {
        table.x += offsetX;
        table.y += offsetY;
      }
    } else {
      // For larger layouts, just ensure minimum margin from top-left
      const offsetX = TABLE_CANVAS_MARGIN - minX;
      const offsetY = TABLE_CANVAS_MARGIN - minY;
      
      for (const table of this.tables) {
        table.x += offsetX;
        table.y += offsetY;
      }
    }
  }

  private resolveOverlaps(): void {
    // Account for chairs around tables when laying out
    const chairDepth = CHAIR_BASE_DEPTH + CHAIR_SIDE_OFFSET;

    type Item = {
      table: Table;
      w: number; // effective width including chairs on sides
      h: number; // effective height including chairs on sides
      leftExtra: number;
      topExtra: number;
      rightExtra: number;
      bottomExtra: number;
      capacity: number;
    };

    const items: Item[] = this.tables.map((t) => {
      const vertical = t.height >= t.width;
      const leftExtra = vertical ? chairDepth : 0;
      const rightExtra = vertical ? chairDepth : 0;
      const topExtra = vertical ? 0 : chairDepth;
      const bottomExtra = vertical ? 0 : chairDepth;
      return {
        table: t,
        w: t.width + leftExtra + rightExtra,
        h: t.height + topExtra + bottomExtra,
        leftExtra,
        topExtra,
        rightExtra,
        bottomExtra,
        capacity: t.capacity ?? t.seats ?? 4,
      };
    });

    // Reset all table positions to start fresh
    for (const item of items) {
      item.table.x = 0;
      item.table.y = 0;
    }

    // Group tables by capacity for column-based layout
    const tables2Seater = items.filter(it => it.capacity === 2);
    const tables4Seater = items.filter(it => it.capacity === 4);
    const tables6Seater = items.filter(it => it.capacity === 6);
    const tables8Seater = items.filter(it => it.capacity === 8);
    const tables10Seater = items.filter(it => it.capacity === 10);
    const otherTables = items.filter(it => ![2, 4, 6, 8, 10].includes(it.capacity));

    // Column 1: 2-seater and 4-seater stacked vertically
    // Column 2: 6-seater (horizontal) and 4-seater
    // Column 3: 8-seater (vertical)
    // Other tables go to additional columns

    // Split 4-seaters between column 1 and column 2
    const half4Seater = Math.ceil(tables4Seater.length / 2);
    const column1_4Seater = tables4Seater.slice(0, half4Seater);
    const column2_4Seater = tables4Seater.slice(half4Seater);

    let startX = TABLE_CANVAS_MARGIN;
    let columnX = startX;

    // Column 1: 2-seater and 4-seater
    let column1Y = TABLE_CANVAS_MARGIN;
    let column1MaxWidth = 0;

    // Place 2-seaters first
    for (const it of tables2Seater) {
      it.table.x = columnX + it.leftExtra;
      it.table.y = column1Y + it.topExtra;
      column1Y += it.h + LAYOUT_V_GAP;
      column1MaxWidth = Math.max(column1MaxWidth, it.w);
    }

    // Place first half of 4-seaters after 2-seaters in column 1
    for (const it of column1_4Seater) {
      it.table.x = columnX + it.leftExtra;
      it.table.y = column1Y + it.topExtra;
      column1Y += it.h + LAYOUT_V_GAP;
      column1MaxWidth = Math.max(column1MaxWidth, it.w);
    }

    // Move to next column
    columnX += column1MaxWidth + LAYOUT_H_PADDING;

    // Column 2: 6-seater (horizontal) and 4-seater
    let column2Y = TABLE_CANVAS_MARGIN;
    let column2MaxWidth = 0;

    // Place 6-seaters first (horizontal)
    for (const it of tables6Seater) {
      it.table.x = columnX + it.leftExtra;
      it.table.y = column2Y + it.topExtra;
      column2Y += it.h + LAYOUT_V_GAP;
      column2MaxWidth = Math.max(column2MaxWidth, it.w);
    }

    // Place second half of 4-seaters in column 2 after 6-seaters
    for (const it of column2_4Seater) {
      it.table.x = columnX + it.leftExtra;
      it.table.y = column2Y + it.topExtra;
      column2Y += it.h + LAYOUT_V_GAP;
      column2MaxWidth = Math.max(column2MaxWidth, it.w);
    }

    // Move to next column
    columnX += column2MaxWidth + LAYOUT_H_PADDING;

    // Column 3: 8-seater (vertical)
    let column3Y = TABLE_CANVAS_MARGIN;
    let column3MaxWidth = 0;

    for (const it of tables8Seater) {
      it.table.x = columnX + it.leftExtra;
      it.table.y = column3Y + it.topExtra;
      column3Y += it.h + LAYOUT_V_GAP;
      column3MaxWidth = Math.max(column3MaxWidth, it.w);
    }

    // Move to next column
    columnX += column3MaxWidth + LAYOUT_H_PADDING;

    // Column 4: 10-seater (vertical)
    let column4Y = TABLE_CANVAS_MARGIN;
    let column4MaxWidth = 0;

    for (const it of tables10Seater) {
      it.table.x = columnX + it.leftExtra;
      it.table.y = column4Y + it.topExtra;
      column4Y += it.h + LAYOUT_V_GAP;
      column4MaxWidth = Math.max(column4MaxWidth, it.w);
    }

    // Move to next column for other tables
    if (tables10Seater.length > 0) {
      columnX += column4MaxWidth + LAYOUT_H_PADDING;
    }

    // Place other capacity tables in additional columns
    let otherY = TABLE_CANVAS_MARGIN;
    let otherMaxWidth = 0;
    const maxColumnHeight = Math.max(column1Y, column2Y, column3Y, column4Y);

    for (const it of otherTables) {
      // No viewport width check - allow tables to extend beyond visible area
      // Just wrap to new row if we want to keep columns organized
      // For now, continue in same column (can extend beyond viewport)
      
      it.table.x = columnX + it.leftExtra;
      it.table.y = otherY + it.topExtra;
      otherY += it.h + LAYOUT_V_GAP;
      otherMaxWidth = Math.max(otherMaxWidth, it.w);
    }
  }

  private createTableFromDrop(screenX: number, screenY: number): Table | null {
    const { canvasX, canvasY } = this.toCanvasCoordinates(screenX, screenY);
    const floor = this.floorName();
    const identity = this.generateTableIdentity(floor);

    if (!identity) {
      console.warn('Unable to generate id for new table');
      return null;
    }

    const defaultCapacity = this.findPresetCapacity(4);
    const preset = TABLE_CAPACITY_PRESETS[defaultCapacity] ?? TABLE_CAPACITY_PRESETS[4];
    const width = preset?.width ?? 140;
    const height = preset?.height ?? 200;
    const shape = preset?.shape ?? 'rectangular';

    const table: Table = {
      id: identity.id,
      label: identity.label,
      status: 'free',
      x: canvasX - width / 2,
      y: canvasY - height / 2,
      width,
      height,
      seats: defaultCapacity,
      capacity: defaultCapacity,
      shape,
      department: 'table',
      widthGrid: Math.max(2, Math.round(width / 40)),
      heightGrid: Math.max(2, Math.round(height / 40)),
      occupiedChairs: [],
    };

    this.ensureTableWithinBounds(table);
    return table;
  }

  private generateTableIdentity(floor: FloorType | string): TableIdentity | null {
    const prefix = `${floor}-`;
    const existingNumbers = this.tables
      .filter(table => table.id.startsWith(prefix))
      .map(table => parseInt(table.id.substring(prefix.length), 10))
      .filter(num => !Number.isNaN(num));

    const nextNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;
    if (!Number.isFinite(nextNumber)) {
      return null;
    }

    const padded = nextNumber.toString().padStart(2, '0');
    return {
      id: `${prefix}${padded}`,
      label: `T${padded}`,
    };
  }
}

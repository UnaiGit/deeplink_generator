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


@Component({
  selector: 'app-floor-canvas',
  imports: [CommonModule, TranslateModule, TableInfo],
  templateUrl: './floor-canvas.html',
  styleUrl: './floor-canvas.scss',
})
export class FloorCanvas implements AfterViewInit, OnDestroy {
  private translateService = inject(TranslateService);
  private themeService = inject(ThemeService);

  @ViewChild('floorCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;
  private resizeHandler!: () => void;
  private tableRenderer!: TableRenderer;
  floorName = input<FloorType>('main');

  // Tables state for drag and drop
  private tables: Table[] = [];
  private draggedTable: Table | null = null;
  private dragOffset = { x: 0, y: 0 };
  private isDragging = false;

  // Table info hover state (placeholder - no logic implemented)
  isTableHovered = signal<boolean>(false);
  hoveredTableLabel = signal<string>('Table 01');
  hoveredTableStatus = signal<TableStatus>('occupied');
  tooltipX = signal<number>(0);
  tooltipY = signal<number>(0);

  // Effect to redraw canvas when floor changes
  private floorEffect = effect(() => {
    const floor = this.floorName();
    if (this.ctx) {
      this.loadTables();
      this.drawFloorCanvas(floor);
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
    this.tableRenderer = new TableRenderer(this.ctx);

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
    }
  }

  private loadTables(): void {
    this.tables = getFloorTables(this.floorName()).map(table => ({ ...table }));
  }

  private getTableAt(x: number, y: number): Table | null {
    // Check tables in reverse order (top to bottom)
    for (let i = this.tables.length - 1; i >= 0; i--) {
      const table = this.tables[i];
      if (x >= table.x && x <= table.x + table.width &&
          y >= table.y && y <= table.y + table.height) {
        return table;
      }
    }
    return null;
  }

  private onMouseDown(event: MouseEvent): void {
    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const table = this.getTableAt(x, y);
    if (table) {
      this.isDragging = true;
      this.draggedTable = table;
      this.dragOffset.x = x - table.x;
      this.dragOffset.y = y - table.y;
      canvas.style.cursor = 'grabbing';
    }
  }

  private onMouseMove(event: MouseEvent): void {
    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (this.isDragging && this.draggedTable) {
      // Update table position during drag
      this.draggedTable.x = x - this.dragOffset.x;
      this.draggedTable.y = y - this.dragOffset.y;

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
      canvas.style.cursor = table ? 'grab' : 'default';
      
      if (table) {
        // Show tooltip when hovering over a table
        this.isTableHovered.set(true);
        this.hoveredTableLabel.set(table.label);
        this.hoveredTableStatus.set(table.status);
        
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
        // Hide tooltip when not hovering over a table
        this.isTableHovered.set(false);
      }
    }
  }

  private onMouseUp(event: MouseEvent): void {
    if (this.isDragging) {
      this.isDragging = false;
      this.draggedTable = null;
      const canvas = this.canvasRef.nativeElement;
      canvas.style.cursor = 'default';
    }
  }

  private onMouseLeave(): void {
    // Hide tooltip when mouse leaves canvas
    this.isTableHovered.set(false);
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
    }
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
    if (this.themeSubscription) {
      this.themeSubscription.unsubscribe();
    }
    this.floorEffect.destroy();
  }

  private drawFloorCanvas(floor: FloorType): void {
    const canvas = this.canvasRef.nativeElement;
    if (!canvas || !this.ctx) return;

    const canvasWidth = canvas.width / (window.devicePixelRatio || 1);
    const canvasHeight = canvas.height / (window.devicePixelRatio || 1);

    // Clear canvas
    this.ctx.clearRect(0, 0, canvasWidth, canvasHeight);

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
  }

  private drawMainFloor(): void {
    const canvas = this.canvasRef.nativeElement;
    const canvasWidth = canvas.width / (window.devicePixelRatio || 1);
    const canvasHeight = canvas.height / (window.devicePixelRatio || 1);
    
    // Background - use theme-aware color (direct from service for immediate access)
    this.ctx.fillStyle = this.getCanvasBackgroundColor();
    this.ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Draw tables from state
    this.tableRenderer.drawTables(this.tables);
    }

  private drawTerraceFloor(): void {
    const canvas = this.canvasRef.nativeElement;
    const canvasWidth = canvas.width / (window.devicePixelRatio || 1);
    const canvasHeight = canvas.height / (window.devicePixelRatio || 1);
    
    // Background - use theme-aware color (direct from service for immediate access)
    this.ctx.fillStyle = this.getCanvasBackgroundColor();
    this.ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Draw tables from state
    this.tableRenderer.drawTables(this.tables);
  }

  private drawKitchenFloor(): void {
    const canvas = this.canvasRef.nativeElement;
    const canvasWidth = canvas.width / (window.devicePixelRatio || 1);
    const canvasHeight = canvas.height / (window.devicePixelRatio || 1);

    // Background - use theme-aware color (direct from service for immediate access)
    this.ctx.fillStyle = this.getCanvasBackgroundColor();
    this.ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Draw tables from state
    this.tableRenderer.drawTables(this.tables);
  }

  private drawMajorFloor(): void {
    const canvas = this.canvasRef.nativeElement;
    const canvasWidth = canvas.width / (window.devicePixelRatio || 1);
    const canvasHeight = canvas.height / (window.devicePixelRatio || 1);
    
    // Background - use theme-aware color (direct from service for immediate access)
    this.ctx.fillStyle = this.getCanvasBackgroundColor();
    this.ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Draw tables from state
    this.tableRenderer.drawTables(this.tables);
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

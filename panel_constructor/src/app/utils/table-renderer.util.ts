import { Table, TableStatus, TABLE_STATUS_CONFIG } from './table.model';
import { APP_CONSTANTS, TABLE_CONSTANTS } from '../core/constants';
import { ThemeService } from '../core/services/theme.service';
import { ICON_PATHS } from '../core/constants/icon.constants';


interface TableDrawContext {
  selectedId?: string | null;
  hoveredId?: string | null;
  dragTargetId?: string | null;
}

export class TableRenderer {
  private readonly BASE_CHAIR_LENGTH = 61;
  private readonly BASE_CHAIR_DEPTH = 18;
  private readonly CHAIR_VERTICAL_GAP = 4;
  private readonly CHAIR_SIDE_OFFSET = 2;
  private readonly LEFT_CHAIR_VERTICAL_ADJUST = 4;

  // Icon image cache
  private iconCache: Map<string, HTMLImageElement> = new Map();
  private iconLoadPromises: Map<string, Promise<HTMLImageElement>> = new Map();

  constructor(
    private ctx: CanvasRenderingContext2D,
    private themeService?: ThemeService
  ) {
    // Preload icons
    this.preloadIcons();
  }

  /**
   * Preload all table icons
   */
  private preloadIcons(): void {
    const iconPaths = [
      ICON_PATHS.calendar,
      ICON_PATHS.bell,
      ICON_PATHS.clock,
      ICON_PATHS.lock,
      ICON_PATHS.card,
      ICON_PATHS.refresh,
    ];

    iconPaths.forEach(path => {
      this.loadIcon(path);
    });
  }

  /**
   * Load an icon image and cache it
   */
  private loadIcon(path: string): Promise<HTMLImageElement> {
    // Return cached promise if already loading
    if (this.iconLoadPromises.has(path)) {
      return this.iconLoadPromises.get(path)!;
    }

    // Return cached image if already loaded
    if (this.iconCache.has(path)) {
      return Promise.resolve(this.iconCache.get(path)!);
    }

    // Convert absolute URL to relative path if needed
    let iconPath = path;
    console.log("this is the path", path);

    // Create new promise to load image
    const promise = new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        this.iconCache.set(path, img);
        this.iconLoadPromises.delete(path);
        resolve(img);
      };
      img.onerror = () => {
        this.iconLoadPromises.delete(path);
        // Try with relative path if absolute failed
        if (path !== iconPath) {
          const img2 = new Image();
          img2.crossOrigin = 'anonymous';
          img2.onload = () => {
            this.iconCache.set(path, img2);
            this.iconLoadPromises.delete(path);
            resolve(img2);
          };
          img2.onerror = () => {
            this.iconLoadPromises.delete(path);
            reject(new Error(`Failed to load icon: ${path}`));
          };
          img2.src = iconPath;
        } else {
          reject(new Error(`Failed to load icon: ${path}`));
        }
      };
      img.src = iconPath;
    });

    this.iconLoadPromises.set(path, promise);
    return promise;
  }

  /**
   * Get callback for when icons are loaded (to trigger redraw)
   */
  onIconsLoaded(callback: () => void): void {
    // Wait for all pending icon loads to complete
    Promise.all(Array.from(this.iconLoadPromises.values())).then(() => {
      callback();
    }).catch(() => {
      // Even if some fail, trigger callback
      callback();
    });
  }

  private getChairCornerRadii(side: 'left' | 'right' | 'top' | 'bottom'): { tl: number; tr: number; br: number; bl: number } {
    switch (side) {
      case 'left':
        return { tl: 14, tr: 0, br: 0, bl: 16 };
      case 'right':
        return { tl: 0, tr: 14, br: 16, bl: 0 };
      case 'top':
        return { tl: 16, tr: 16, br: 0, bl: 0 };
      case 'bottom':
      default:
        return { tl: 0, tr: 0, br: 16, bl: 16 };
    }
  }

  private getSeatDistribution(totalSeats: number): [number, number] {
    const safeSeats = Math.max(0, Math.floor(totalSeats));
    if (safeSeats <= 0) {
      return [0, 0];
    }
    if (safeSeats === 1) {
      return [1, 0];
    }

    const firstSide = Math.ceil(safeSeats / 2);
    const secondSide = Math.floor(safeSeats / 2);
    return [firstSide, secondSide];
  }

  /**
   * Get CSS variable value
   */
  private getCssVariable(variable: string, fallback: string = TABLE_CONSTANTS.CANVAS_DEFAULTS.TABLE_FILL_COLOR_LIGHT): string {
    if (typeof document === 'undefined') return fallback;
    return getComputedStyle(document.documentElement).getPropertyValue(variable).trim() || fallback;
  }

  /**
   * Get theme-aware chair color - matching Figma design
   */
  private getChairColor(type: 'available-fill' | 'available-border' | 'occupied-fill' | 'occupied-border'): string {
    // Match Figma design: light gray chairs with black borders
    switch (type) {
      case 'available-fill':
        return '#dcdde1';
      case 'available-border':
        return 'transparent';
      case 'occupied-fill':
        return '#ea4335';
      case 'occupied-border':
        return 'transparent';
      default:
        return '#dcdde1';
    }
  }

  private hexToRgb(color?: string): { r: number; g: number; b: number } {
    if (!color) {
      return { r: 255, g: 255, b: 255 };
    }
    const normalized = color.trim();
    if (normalized.startsWith('#')) {
      let hex = normalized.slice(1);
      if (hex.length === 3) {
        hex = hex.split('').map(char => char + char).join('');
      }
      const int = parseInt(hex, 16);
      return {
        r: (int >> 16) & 255,
        g: (int >> 8) & 255,
        b: int & 255,
      };
    }

    const rgbMatch = normalized.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
    if (rgbMatch) {
      return {
        r: parseInt(rgbMatch[1], 10),
        g: parseInt(rgbMatch[2], 10),
        b: parseInt(rgbMatch[3], 10),
      };
    }

    return { r: 255, g: 255, b: 255 };
  }

  private shadeColor(color: string, percent: number): string {
    const { r, g, b } = this.hexToRgb(color);
    const t = percent < 0 ? 0 : 255;
    const p = Math.abs(percent);
    const R = Math.round((t - r) * p + r);
    const G = Math.round((t - g) * p + g);
    const B = Math.round((t - b) * p + b);
    return `rgb(${R}, ${G}, ${B})`;
  }

  private applyAlpha(color: string, alpha: number): string {
    const { r, g, b } = this.hexToRgb(color);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  private createStatusGradient(table: Table, baseColor: string, emphasize: boolean): CanvasGradient {
    const gradient = this.ctx.createLinearGradient(table.x, table.y, table.x, table.y + table.height);
    const topTint = this.shadeColor(baseColor, emphasize ? 0.18 : 0.1);
    const bottomTint = this.shadeColor(baseColor, emphasize ? -0.16 : -0.06);
    gradient.addColorStop(0, topTint);
    gradient.addColorStop(1, bottomTint);
    return gradient;
  }

  /**
   * Draw a table on the canvas
   */
  drawTable(table: Table, context: TableDrawContext = {}): void {
    const config = TABLE_STATUS_CONFIG[table.status] ?? TABLE_STATUS_CONFIG.free;
    const isHovered = context.hoveredId === table.id;
    const isDragTarget = context.dragTargetId === table.id;
    const isSelected = context.selectedId === table.id;

    // Get rotation angle (default to 0)
    const rotation = table.rotation ?? 0;
    const centerX = table.x + table.width / 2;
    const centerY = table.y + table.height / 2;

    // Save context and apply rotation
    this.ctx.save();
    if (rotation !== 0) {
      this.ctx.translate(centerX, centerY);
      this.ctx.rotate((rotation * Math.PI) / 180);
      this.ctx.translate(-centerX, -centerY);
    }

    // Draw table body (neutral gray/white)
    this.drawTableShape(table, config, { isHovered, isDragTarget, isSelected });

    // Draw chairs around table for all tables
    if (table.seats && table.seats > 0) {
      this.drawChairs(table);
    }

    // Restore context (removes rotation) - label should be drawn outside rotation to stay upright
    this.ctx.restore();

    // Draw table label with colored background and icon in center (outside rotation, so it stays upright)
    this.drawTableLabelWithIcon(table, config);

    // Draw edit, delete, and rotate icons only if this table is selected (outside rotation)
    if (isSelected) {
      this.drawActionIcons(table);
    }
  }

  private drawTableShape(
    table: Table,
    config: { backgroundColor: string; borderColor: string },
    options: { isHovered: boolean; isDragTarget: boolean; isSelected: boolean }
  ): void {
    const shape = table.shape || 'rectangular';

    // Match provided CSS: solid neutral table body
    const borderColor = options.isSelected ? '#4285f4' : '#bfc2c7';
    const fillColor = '#dcdde1';

    this.ctx.save();
    this.ctx.lineWidth = options.isSelected ? 3 : 1.5;
    this.ctx.strokeStyle = borderColor;
    // Use neutral color for table body
    this.ctx.fillStyle = fillColor;

    const shadowStrength = options.isDragTarget ? 18 : options.isHovered ? 12 : 8;
    const shadowOpacity = options.isDragTarget ? 0.22 : options.isHovered ? 0.16 : 0.1;
    this.ctx.shadowColor = this.applyAlpha('#000000', shadowOpacity);
    this.ctx.shadowBlur = shadowStrength;
    this.ctx.shadowOffsetY = 3;
    this.ctx.shadowOffsetX = 0;

    // Draw table body (full table, no header)
    if (shape === 'square') {
      this.drawSquareTable(table);
    } else if (shape === 'round') {
      this.drawRoundTable(table);
    } else {
      this.drawRectangularTable(table);
    }

    this.ctx.restore();
  }

  /**
   * Draw chairs around the table
   */
  private drawChairs(table: Table): void {
    const seats = Math.max(0, Math.floor(table.seats ?? 0));
    if (seats <= 0) {
      return;
    }

    const guestCount = Math.max(0, Math.min(seats, table.guestCount ?? 0));
    const occupiedChairs = table.occupiedChairs
      ? [...table.occupiedChairs]
      : guestCount > 0
        ? Array.from({ length: guestCount }, (_, index) => index + 1)
        : [];
    let [leftSideCount, rightSideCount] = this.getSeatDistribution(seats);
    const radius = APP_CONSTANTS.CANVAS.TABLE_BORDER_RADIUS;
    const chairHeight = this.BASE_CHAIR_LENGTH;
    const chairWidth = this.BASE_CHAIR_DEPTH;
    const verticalGap = this.CHAIR_VERTICAL_GAP;
    const usableHeight = Math.max(0, table.height - radius * 2);
    const maxPerSide = Math.max(leftSideCount, rightSideCount);
    const totalChairsHeight = maxPerSide * chairHeight;
    const totalGapsHeight = Math.max(0, (maxPerSide - 1) * verticalGap);
    const remainingSpace = Math.max(0, usableHeight - totalChairsHeight - totalGapsHeight);
    let baseStartY = table.y + radius + remainingSpace / 2;
    const leftAdjust = seats === 2 ? 0 : this.LEFT_CHAIR_VERTICAL_ADJUST;

    // For 4-seater tables, nudge chairs upward slightly and maintain two per side
    if (seats === 4) {
      leftSideCount = 2;
      rightSideCount = 2;
    }

    if (maxPerSide <= 0) {
      return;
    }

    let chairNumber = 1;

    const horizontalAdjust = seats === 4 ? 1 : 0;

    const leftX = table.x - this.CHAIR_SIDE_OFFSET - chairWidth + horizontalAdjust;
    for (let index = 0; index < leftSideCount; index++) {
      const baseY = baseStartY + index * (chairHeight + verticalGap);
      const isOccupied = occupiedChairs.includes(chairNumber);
      this.drawChair(leftX, baseY + leftAdjust, chairWidth, chairHeight, isOccupied, 'left');
      chairNumber++;
    }

    const rightX = table.x + table.width + this.CHAIR_SIDE_OFFSET - horizontalAdjust;
    for (let index = 0; index < rightSideCount; index++) {
      const baseY = baseStartY + index * (chairHeight + verticalGap);
      const isOccupied = occupiedChairs.includes(chairNumber);
      this.drawChair(rightX, baseY, chairWidth, chairHeight, isOccupied, 'right');
      chairNumber++;
    }
  }

  /**
   * Draw a single chair using images - dynamically switches between available and occupied
   * Chairs are rectangular (length > width)
   * The flat side (back) of the chair should always face toward the table
   */
  private drawChair(
    x: number,
    y: number,
    width: number,
    height: number,
    isOccupied: boolean,
    side: 'top' | 'bottom' | 'left' | 'right'
  ): void {
    this.ctx.save();

    // Set fill color based on occupied status and theme
    if (isOccupied) {
      this.ctx.fillStyle = this.getChairColor('occupied-fill');
    } else {
      this.ctx.fillStyle = this.getChairColor('available-fill');
    }

    const radii = this.getChairCornerRadii(side);
    this.drawRoundedRectWithRadii(x, y, width, height, radii);
    this.ctx.fill();

    const strokeColor = isOccupied
      ? this.getChairColor('occupied-border')
      : this.getChairColor('available-border');

    if (strokeColor && strokeColor !== 'transparent') {
      this.ctx.strokeStyle = strokeColor;
      this.ctx.lineWidth = 1;
      this.ctx.stroke();
    }

    this.ctx.restore();
  }

  /**
   * Draw rectangular table
   */
  private drawRectangularTable(table: Table): void {
    const radius = APP_CONSTANTS.CANVAS.TABLE_BORDER_RADIUS;
    const x = table.x;
    const y = table.y;
    const width = table.width;
    const height = table.height;

    // Draw rounded rectangle
    this.ctx.beginPath();
    this.ctx.moveTo(x + radius, y);
    this.ctx.lineTo(x + width - radius, y);
    this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    this.ctx.lineTo(x + width, y + height - radius);
    this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    this.ctx.lineTo(x + radius, y + height);
    this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    this.ctx.lineTo(x, y + radius);
    this.ctx.quadraticCurveTo(x, y, x + radius, y);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.stroke();
  }

  /**
   * Draw round table
   */
  private drawRoundTable(table: Table): void {
    const centerX = table.x + table.width / 2;
    const centerY = table.y + table.height / 2;
    const radius = Math.min(table.width, table.height) / 2;

    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.stroke();
  }

  /**
   * Draw square table
   */
  private drawSquareTable(table: Table): void {
    const size = Math.min(table.width, table.height);
    const radius = APP_CONSTANTS.CANVAS.TABLE_SQUARE_BORDER_RADIUS;
    const x = table.x;
    const y = table.y;

    this.ctx.beginPath();
    this.ctx.moveTo(x + radius, y);
    this.ctx.lineTo(x + size - radius, y);
    this.ctx.quadraticCurveTo(x + size, y, x + size, y + radius);
    this.ctx.lineTo(x + size, y + size - radius);
    this.ctx.quadraticCurveTo(x + size, y + size, x + size - radius, y + size);
    this.ctx.lineTo(x + radius, y + size);
    this.ctx.quadraticCurveTo(x, y + size, x, y + size - radius);
    this.ctx.lineTo(x, y + radius);
    this.ctx.quadraticCurveTo(x, y, x + radius, y);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.stroke();
  }

  /**
   * Draw table label with colored background in center, and icon below it
   */
  private drawTableLabelWithIcon(table: Table, config: any): void {
    const centerX = table.x + table.width / 2;
    const centerY = table.y + table.height / 2;
    const iconSize = 24; // Size of the icon
    const labelPadding = 8; // Padding around label text
    const spacing = 6; // Space between label and icon

    this.ctx.save();

    const tableLabel = table.label || 'T01';
    this.ctx.font = '600 13px system-ui, -apple-system, sans-serif';
    const labelWidth = this.ctx.measureText(tableLabel).width;
    const pillWidth = Math.max(40, labelWidth + labelPadding * 2);
    const pillHeight = 22;
    const radius = 11;

    // Calculate positions
    const pillY = centerY - (pillHeight + spacing + iconSize) / 2;
    const pillX = centerX - pillWidth / 2;
    const iconY = pillY + pillHeight + spacing;

    // Draw colored pill background for label
    this.ctx.fillStyle = config.backgroundColor;
    this.ctx.beginPath();
    this.ctx.moveTo(pillX + radius, pillY);
    this.ctx.lineTo(pillX + pillWidth - radius, pillY);
    this.ctx.quadraticCurveTo(pillX + pillWidth, pillY, pillX + pillWidth, pillY + radius);
    this.ctx.lineTo(pillX + pillWidth, pillY + pillHeight - radius);
    this.ctx.quadraticCurveTo(pillX + pillWidth, pillY + pillHeight, pillX + pillWidth - radius, pillY + pillHeight);
    this.ctx.lineTo(pillX + radius, pillY + pillHeight);
    this.ctx.quadraticCurveTo(pillX, pillY + pillHeight, pillX, pillY + pillHeight - radius);
    this.ctx.lineTo(pillX, pillY + radius);
    this.ctx.quadraticCurveTo(pillX, pillY, pillX + radius, pillY);
    this.ctx.closePath();
    this.ctx.fill();

    // Draw table label text in pill - white text
    this.ctx.fillStyle = '#ffffff';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(tableLabel, centerX, pillY + pillHeight / 2);

    // Determine which icon to show based on status
    let iconPath: string | null = null;

    // Priority: indicators first, then status
    if (table.indicators?.dishReady) {
      iconPath = ICON_PATHS.bell; // Bell icon for dish ready
    } else if (table.indicators?.paymentRequested) {
      iconPath = ICON_PATHS.card; // Card icon for payment requested
    } else if (table.indicators?.overCapacity) {
      iconPath = ICON_PATHS.refresh; // Warning icon for over capacity
    } else {
      // Use status-based icons
      switch (table.status) {
        case 'free':
          // Available - bell icon
          iconPath = ICON_PATHS.bell;
          break;
        case 'booked':
          // Reserved - calendar icon
          iconPath = ICON_PATHS.calendar;
          break;
        case 'noShow':
          // No order - bell icon
          iconPath = ICON_PATHS.bell;
          break;
        case 'occupied':
          // Occupied - bell icon
          iconPath = ICON_PATHS.bell;
          break;
        case 'pendingPayment':
          // Payment - card icon
          iconPath = ICON_PATHS.card;
          break;
        case 'overstay':
          // Overstay - warning icon
          iconPath = ICON_PATHS.refresh; // Using refresh as warning icon
          break;
        default:
          iconPath = ICON_PATHS.bell;
      }
    }

    // Draw icon below the label
    if (iconPath) {
      // Try to get cached icon
      const cachedIcon = this.iconCache.get(iconPath);
      if (cachedIcon) {
        // Draw the icon image centered below the label
        const iconX = centerX - iconSize / 2;

        // Draw icon (SVG icons should already have proper colors)
        this.ctx.drawImage(cachedIcon, iconX, iconY, iconSize, iconSize);
      } else {
        // Icon not loaded yet, load it asynchronously
        this.loadIcon(iconPath).then(img => {
          // Redraw will be triggered by the component when icon loads
        }).catch(() => {
          // Icon failed to load, skip drawing
        });
      }
    }

    this.ctx.restore();
  }


  /**
   * Draw edit, delete, and rotate icons on the top-right corner of the table
   */
  private drawActionIcons(table: Table): void {
    const iconSize = 16; // Size of each icon
    const iconSpacing = 4; // Spacing between icons
    const padding = 8; // Padding from table edge

    // Position icons in top-right corner (3 icons: edit, rotate, delete)
    const iconsX = table.x + table.width - padding - iconSize * 3 - iconSpacing * 2;
    const iconsY = table.y + padding;

    this.ctx.save();

    // Draw simple square placeholders for edit/rotate/delete until replaced with icon font
    this.ctx.fillStyle = 'rgba(255,255,255,0.9)';
    this.ctx.strokeStyle = 'rgba(15, 23, 42, 0.35)';
    this.ctx.lineWidth = 1;

    // Edit icon
    this.drawRoundedRect(iconsX, iconsY, iconSize, iconSize, 3);
    this.ctx.fill();
    this.ctx.stroke();

    // Rotate icon
    this.drawRoundedRect(iconsX + iconSize + iconSpacing, iconsY, iconSize, iconSize, 3);
    this.ctx.fill();
    this.ctx.stroke();

    // Delete icon
    this.drawRoundedRect(iconsX + (iconSize + iconSpacing) * 2, iconsY, iconSize, iconSize, 3);
    this.ctx.fill();
    this.ctx.stroke();

    // Draw minimalist glyphs
    this.ctx.fillStyle = '#111827';
    this.ctx.font = '10px system-ui, -apple-system, sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText('✎', iconsX + iconSize / 2, iconsY + iconSize / 2); // Edit
    this.ctx.fillText('↻', iconsX + iconSize + iconSpacing + iconSize / 2, iconsY + iconSize / 2); // Rotate
    this.ctx.fillText('✕', iconsX + (iconSize + iconSpacing) * 2 + iconSize / 2, iconsY + iconSize / 2); // Delete
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'alphabetic';

    this.ctx.restore();
  }

  /**
   * Get the bounds of action icons for a table (for click detection)
   */
  getActionIconBounds(table: Table): { edit: { x: number; y: number; width: number; height: number }; rotate: { x: number; y: number; width: number; height: number }; delete: { x: number; y: number; width: number; height: number } } | null {
    const iconSize = 16;
    const iconSpacing = 4;
    const padding = 8;

    const iconsX = table.x + table.width - padding - iconSize * 3 - iconSpacing * 2;
    const iconsY = table.y + padding;

    return {
      edit: {
        x: iconsX,
        y: iconsY,
        width: iconSize,
        height: iconSize
      },
      rotate: {
        x: iconsX + iconSize + iconSpacing,
        y: iconsY,
        width: iconSize,
        height: iconSize
      },
      delete: {
        x: iconsX + (iconSize + iconSpacing) * 2,
        y: iconsY,
        width: iconSize,
        height: iconSize
      }
    };
  }

  private drawRoundedRect(
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ): void {
    const r = Math.min(radius, width / 2, height / 2);
    this.ctx.beginPath();
    this.ctx.moveTo(x + r, y);
    this.ctx.lineTo(x + width - r, y);
    this.ctx.quadraticCurveTo(x + width, y, x + width, y + r);
    this.ctx.lineTo(x + width, y + height - r);
    this.ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    this.ctx.lineTo(x + r, y + height);
    this.ctx.quadraticCurveTo(x, y + height, x, y + height - r);
    this.ctx.lineTo(x, y + r);
    this.ctx.quadraticCurveTo(x, y, x + r, y);
    this.ctx.closePath();
  }

  private drawRoundedRectWithRadii(
    x: number,
    y: number,
    width: number,
    height: number,
    radii: { tl: number; tr: number; br: number; bl: number }
  ): void {
    const rTL = Math.min(radii.tl, width / 2, height / 2);
    const rTR = Math.min(radii.tr, width / 2, height / 2);
    const rBR = Math.min(radii.br, width / 2, height / 2);
    const rBL = Math.min(radii.bl, width / 2, height / 2);
    this.ctx.beginPath();
    this.ctx.moveTo(x + rTL, y);
    this.ctx.lineTo(x + width - rTR, y);
    this.ctx.quadraticCurveTo(x + width, y, x + width, y + rTR);
    this.ctx.lineTo(x + width, y + height - rBR);
    this.ctx.quadraticCurveTo(x + width, y + height, x + width - rBR, y + height);
    this.ctx.lineTo(x + rBL, y + height);
    this.ctx.quadraticCurveTo(x, y + height, x, y + height - rBL);
    this.ctx.lineTo(x, y + rTL);
    this.ctx.quadraticCurveTo(x, y, x + rTL, y);
    this.ctx.closePath();
  }

  /**
   * Draw multiple tables
   */
  drawTables(tables: Table[], context: TableDrawContext = {}): void {
    tables.forEach(table => this.drawTable(table, context));
  }

}


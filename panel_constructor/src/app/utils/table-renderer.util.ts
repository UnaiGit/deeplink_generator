import { Table, TABLE_STATUS_CONFIG } from './table.model';
import { APP_CONSTANTS, TABLE_CONSTANTS } from '../core/constants';

export class TableRenderer {
  constructor(private ctx: CanvasRenderingContext2D) {}

  /**
   * Get CSS variable value
   */
  private getCssVariable(variable: string, fallback: string = TABLE_CONSTANTS.CANVAS_DEFAULTS.TABLE_FILL_COLOR_LIGHT): string {
    if (typeof document === 'undefined') return fallback;
    return getComputedStyle(document.documentElement).getPropertyValue(variable).trim() || fallback;
  }

  /**
   * Draw a table on the canvas
   */
  drawTable(table: Table): void {
    const config = TABLE_STATUS_CONFIG[table.status];
    const shape = table.shape || 'rectangular';

    // Draw table shape - light grey like Figma (not colored) - use theme-aware color
    this.ctx.fillStyle = this.getCssVariable('--gray-300', '#e5e7eb'); // Light grey for all tables
    this.ctx.strokeStyle = this.getCssVariable('--gray-400', '#d1d5db');
    this.ctx.lineWidth = 0; // No border for cleaner look

    if (shape === 'round') {
      this.drawRoundTable(table, config);
    } else if (shape === 'square') {
      this.drawSquareTable(table, config);
    } else {
      this.drawRectangularTable(table, config);
    }

    // Draw status pill
    this.drawStatusPill(table, config);

    // Draw table label
    this.drawTableLabel(table, config);
  }

  /**
   * Draw rectangular table
   */
  private drawRectangularTable(table: Table, config: any): void {
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
  }

  /**
   * Draw round table
   */
  private drawRoundTable(table: Table, config: any): void {
    const centerX = table.x + table.width / 2;
    const centerY = table.y + table.height / 2;
    const radius = Math.min(table.width, table.height) / 2;

    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    this.ctx.fill();
  }

  /**
   * Draw square table
   */
  private drawSquareTable(table: Table, config: any): void {
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
  }

  /**
   * Draw status pill at top-left of table
   */
  private drawStatusPill(table: Table, config: any): void {
    const pillX = table.x + APP_CONSTANTS.CANVAS.STATUS_PILL_OFFSET_X;
    const pillY = table.y + APP_CONSTANTS.CANVAS.STATUS_PILL_OFFSET_Y;
    const pillWidth = APP_CONSTANTS.CANVAS.STATUS_PILL_MIN_WIDTH;
    const pillHeight = APP_CONSTANTS.CANVAS.STATUS_PILL_HEIGHT;
    const radius = APP_CONSTANTS.CANVAS.STATUS_PILL_RADIUS;

    // Draw pill background with status color - match Figma style
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

    // Draw label text - white text on colored pill
    this.ctx.fillStyle = TABLE_CONSTANTS.CANVAS_DEFAULTS.STATUS_PILL_TEXT_COLOR;
    this.ctx.font = '600 11px system-ui, -apple-system, sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(table.label, pillX + pillWidth / 2, pillY + 15);
    this.ctx.textAlign = 'left'; // Reset alignment
  }

  /**
   * Draw table label/icon in center
   * Uses simple Unicode icons as fallback since SVG loading on canvas is complex
   */
  private drawTableLabel(table: Table, config: any): void {
    const centerX = table.x + table.width / 2;
    const centerY = table.y + table.height / 2;

    // Use simple Unicode/emoji icons as fallback
    const iconMap: Record<string, string> = {
      '/icons/bell.svg': '🔔',
      '/icons/time.svg': '⏱️',
      '/icons/lock.svg': '🔒',
      '/icons/card.svg': '💳',
      '/icons/antenna.svg': '📡',
    };

    // Get icon from config or use default
    const iconPath = config.icon || '';
    const icon = iconMap[iconPath] || '●'; // Default to simple dot if icon not found

    // Draw icon in center of table - use a darker color for visibility on light grey tables
    // Use the status color but darker for better contrast
    this.ctx.fillStyle = config.color || '#6b7280'; // Use status text color or grey fallback
    this.ctx.font = '20px system-ui, -apple-system, sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(icon, centerX, centerY);
    this.ctx.textAlign = 'left'; // Reset alignment
    this.ctx.textBaseline = 'alphabetic'; // Reset baseline
  }

  /**
   * Draw multiple tables
   */
  drawTables(tables: Table[]): void {
    tables.forEach(table => this.drawTable(table));
  }
}


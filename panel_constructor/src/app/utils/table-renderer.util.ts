import { Table, TABLE_STATUS_CONFIG } from './table.model';
import { APP_CONSTANTS, TABLE_CONSTANTS } from '../core/constants';
import { ThemeService } from '../core/services/theme.service';

export class TableRenderer {
  private tableImages: Map<string, HTMLImageElement> = new Map();
  private chairImage: HTMLImageElement | null = null;
  private chairOccupiedImage: HTMLImageElement | null = null;
  private editIcon: HTMLImageElement | null = null;
  private deleteIcon: HTMLImageElement | null = null;
  private imagesLoaded = false;
  private imagesLoading = false;

  constructor(
    private ctx: CanvasRenderingContext2D,
    private themeService?: ThemeService
  ) {
    this.loadImages();
  }

  /**
   * Load table and chair images
   */
  private loadImages(): void {
    if (this.imagesLoading) return;
    this.imagesLoading = true;

    // Load available chair image
    const chairImg = new Image();
    chairImg.src = '/tabels.icons/chair.svg';
    chairImg.onload = () => {
      this.chairImage = chairImg;
      this.checkAllImagesLoaded();
    };
    chairImg.onerror = () => {
      console.warn('Failed to load chair image');
      this.checkAllImagesLoaded();
    };

    // Load occupied chair image
    const chairOccupiedImg = new Image();
    chairOccupiedImg.src = '/tabels.icons/chair_occopaied.svg';
    chairOccupiedImg.onload = () => {
      this.chairOccupiedImage = chairOccupiedImg;
      this.checkAllImagesLoaded();
    };
    chairOccupiedImg.onerror = () => {
      console.warn('Failed to load occupied chair image');
      this.checkAllImagesLoaded();
    };

    // Load table images
    const table2SeaterImg = new Image();
    table2SeaterImg.src = '/tabels.icons/tabel-2seater.png';
    table2SeaterImg.onload = () => {
      this.tableImages.set('2seater', table2SeaterImg);
      this.checkAllImagesLoaded();
    };
    table2SeaterImg.onerror = () => {
      console.warn('Failed to load 2-seater table image');
      this.checkAllImagesLoaded();
    };

    const table8ChairImg = new Image();
    table8ChairImg.src = '/tabels.icons/body-y-axis-8chair-eachside.png';
    table8ChairImg.onload = () => {
      this.tableImages.set('8chair', table8ChairImg);
      this.checkAllImagesLoaded();
    };
    table8ChairImg.onerror = () => {
      console.warn('Failed to load 8-chair table image');
      this.checkAllImagesLoaded();
    };

    // Load edit icon
    const editIconImg = new Image();
    editIconImg.src = '/icons/pen.svg';
    editIconImg.onload = () => {
      this.editIcon = editIconImg;
      this.checkAllImagesLoaded();
    };
    editIconImg.onerror = () => {
      console.warn('Failed to load edit icon');
      this.checkAllImagesLoaded();
    };

    // Load delete icon
    const deleteIconImg = new Image();
    deleteIconImg.src = '/icons/delete.svg';
    deleteIconImg.onload = () => {
      this.deleteIcon = deleteIconImg;
      this.checkAllImagesLoaded();
    };
    deleteIconImg.onerror = () => {
      console.warn('Failed to load delete icon');
      this.checkAllImagesLoaded();
    };
  }

  private checkAllImagesLoaded(): void {
    // Check if we have at least one table image and chair image
    const hasTableImage = this.tableImages.size > 0;
    const hasChairImage = this.chairImage !== null || this.chairOccupiedImage !== null;
    
    // We can draw if we have at least chair image (tables can fallback to shapes)
    if (hasChairImage || hasTableImage) {
      if (!this.imagesLoaded) {
        this.imagesLoaded = true;
        // Trigger a redraw by dispatching a custom event
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('tableImagesLoaded'));
        }
      }
    }
  }

  /**
   * Get CSS variable value
   */
  private getCssVariable(variable: string, fallback: string = TABLE_CONSTANTS.CANVAS_DEFAULTS.TABLE_FILL_COLOR_LIGHT): string {
    if (typeof document === 'undefined') return fallback;
    return getComputedStyle(document.documentElement).getPropertyValue(variable).trim() || fallback;
  }

  /**
   * Get theme-aware chair color
   */
  private getChairColor(type: 'available-fill' | 'available-border' | 'occupied-fill' | 'occupied-border'): string {
    const variable = `--chair-${type}`;
    
    // Try to get from theme service first (immediate access)
    if (this.themeService) {
      const themeColor = this.themeService.getThemeColor(variable);
      if (themeColor) {
        return themeColor;
      }
    }
    
    // Fallback to CSS variable
    const cssColor = this.getCssVariable(variable);
    if (cssColor) {
      return cssColor;
    }
    
    // Final fallback based on type
    const isDark = this.themeService?.isDarkMode ?? false;
    switch (type) {
      case 'available-fill':
        return isDark ? '#9ca3af' : '#e5e7eb';
      case 'available-border':
        return isDark ? '#d1d5db' : '#d1d5db';
      case 'occupied-fill':
        return '#ef4444'; // Red for occupied (same in both themes)
      case 'occupied-border':
        return '#dc2626'; // Darker red for border (same in both themes)
      default:
        return '#e5e7eb';
    }
  }

  /**
   * Draw a table on the canvas
   */
  drawTable(table: Table, selectedTableId?: string | null): void {
    const config = TABLE_STATUS_CONFIG[table.status];

    // Always try to draw table image (will use fallback if not loaded)
    this.drawTableImage(table, config);

    // Draw chairs around table for all tables
    if (table.seats && table.seats > 0) {
      this.drawChairs(table);
    }

    // Draw status pill
    this.drawStatusPill(table, config);

    // Draw table label
    this.drawTableLabel(table, config);

    // Draw edit and delete icons only if this table is selected
    if (selectedTableId && table.id === selectedTableId) {
      this.drawActionIcons(table);
    }
  }

  /**
   * Draw table using image
   */
  private drawTableImage(table: Table, config: any): void {
    const seats = table.seats || 4;
    const shape = table.shape || 'rectangular';
    let tableImg: HTMLImageElement | null = null;

    // Choose table image based on seats
    if (seats >= 12) {
      // Use 12-seater table image (body-y-axis-8chair-eachside.png)
      tableImg = this.tableImages.get('8chair') || null;
    } else {
      // Use 2-seater table image (tabel-2seater.png) for smaller tables
      tableImg = this.tableImages.get('2seater') || null;
    }

    if (tableImg) {
      // Draw table image with rounded corners
      const radius = shape === 'square' ? APP_CONSTANTS.CANVAS.TABLE_SQUARE_BORDER_RADIUS : APP_CONSTANTS.CANVAS.TABLE_BORDER_RADIUS;
      const x = table.x;
      const y = table.y;
      const width = table.width;
      const height = table.height;
      
      // Create clipping path for rounded corners
      this.ctx.save();
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
      this.ctx.clip();
      
      // Draw the image
      this.ctx.drawImage(
        tableImg,
        x,
        y,
        width,
        height
      );
      
      this.ctx.restore();
    } else {
      // Fallback to shape drawing only if images not loaded yet
      this.ctx.fillStyle = this.getCssVariable('--gray-300', '#e5e7eb');
      if (shape === 'square') {
        // Square tables (2-seater, 4-seater)
        this.drawSquareTable(table, config);
      } else if (shape === 'round') {
        // Round tables - convert to square
        this.drawSquareTable(table, config);
      } else {
        // Rectangular tables (6-seater, 12-seater)
        this.drawRectangularTable(table, config);
      }
    }
  }

  /**
   * Draw chairs around the table
   */
  private drawChairs(table: Table): void {
    const seats = table.seats || 4;
    // Standard chair dimensions - consistent across all tables
    const STANDARD_CHAIR_WIDTH = 18; // Standard chair width
    const STANDARD_CHAIR_HEIGHT = 14; // Standard chair height
    const spacing = 0; // No gap between chairs
    const offset = 0; // No gap between table and chairs

    // Calculate chair positions based on table shape
    const shape = table.shape || 'rectangular';
    
    // For round tables, treat them as square for chair placement
    if (shape === 'round' || shape === 'square') {
      // For square/round tables, use rectangular chair placement
      this.drawChairsAroundRectangularTable(table, seats, STANDARD_CHAIR_WIDTH, STANDARD_CHAIR_HEIGHT, spacing, offset);
    } else {
      this.drawChairsAroundRectangularTable(table, seats, STANDARD_CHAIR_WIDTH, STANDARD_CHAIR_HEIGHT, spacing, offset);
    }
  }

  /**
   * Draw chairs around a round table
   */
  private drawChairsAroundRoundTable(table: Table, seats: number, chairWidth: number, chairHeight: number, offset: number): void {
    const occupiedChairs = table.occupiedChairs || [];
    const centerX = table.x + table.width / 2;
    const centerY = table.y + table.height / 2;
    const radius = Math.min(table.width, table.height) / 2 + offset + chairHeight / 2;
    const angleStep = (Math.PI * 2) / seats;

    for (let i = 0; i < seats; i++) {
      const angle = i * angleStep;
      const chairX = centerX + Math.cos(angle) * radius - chairWidth / 2;
      const chairY = centerY + Math.sin(angle) * radius - chairHeight / 2;
      const isOccupied = occupiedChairs.includes(i + 1);
      this.drawChair(chairX, chairY, chairWidth, chairHeight, isOccupied);
    }
  }

  /**
   * Draw chairs around a rectangular/square table
   * Chairs are placed on the longer side of the table:
   * - If width > height: chairs on top and bottom (x-axis)
   * - If height > width: chairs on left and right (y-axis)
   * - If width === height: use default logic based on seats
   */
  private drawChairsAroundRectangularTable(table: Table, seats: number, chairWidth: number, chairHeight: number, spacing: number, offset: number): void {
    const occupiedChairs = table.occupiedChairs || [];
    
    // Determine which side is longer
    const isWidthLonger = table.width > table.height;
    const isHeightLonger = table.height > table.width;
    
    // If width is longer, place chairs on top and bottom (x-axis)
    if (isWidthLonger) {
      const chairsPerSide = Math.ceil(seats / 2);
      let chairIndex = 0;
      
      // Use standard chair dimensions - distribute evenly with spacing
      const availableWidth = table.width;
      const totalChairsWidth = chairsPerSide * chairWidth;
      const chairSpacing = totalChairsWidth < availableWidth ? (availableWidth - totalChairsWidth) / (chairsPerSide + 1) : 0;
      const startX = table.x + chairSpacing;
      
      // Top side - chairs positioned directly above table (horizontal orientation)
      const topY = table.y - chairHeight;
      for (let i = 0; i < chairsPerSide && chairIndex < seats; i++) {
        const chairX = startX + i * (chairWidth + chairSpacing);
        const isOccupied = occupiedChairs.includes(chairIndex + 1);
        this.drawChair(chairX, topY, chairWidth, chairHeight, isOccupied, 'horizontal', 'top');
        chairIndex++;
      }

      // Bottom side - chairs positioned directly below table (horizontal orientation)
      const bottomY = table.y + table.height;
      for (let i = 0; i < chairsPerSide && chairIndex < seats; i++) {
        const chairX = startX + i * (chairWidth + chairSpacing);
        const isOccupied = occupiedChairs.includes(chairIndex + 1);
        this.drawChair(chairX, bottomY, chairWidth, chairHeight, isOccupied, 'horizontal', 'bottom');
        chairIndex++;
      }
      return;
    }
    
    // If height is longer, place chairs on left and right (y-axis)
    if (isHeightLonger) {
      const chairsPerSide = Math.ceil(seats / 2);
      let chairIndex = 0;
      
      // Use standard chair dimensions - swap width/height for vertical orientation
      // When vertical, we swap dimensions to maintain consistent visual size
      const verticalChairWidth = chairHeight; // Use height as width when vertical
      const verticalChairHeight = chairWidth; // Use width as height when vertical
      
      // Calculate spacing to distribute chairs evenly along table height
      const availableHeight = table.height;
      const totalChairsHeight = chairsPerSide * verticalChairHeight;
      const chairSpacing = totalChairsHeight < availableHeight ? (availableHeight - totalChairsHeight) / (chairsPerSide + 1) : 0;
      const startY = table.y + chairSpacing;
      
      // Left side - chairs positioned directly to the left of table (vertical orientation)
      const leftX = table.x - verticalChairWidth;
      for (let i = 0; i < chairsPerSide && chairIndex < seats; i++) {
        const chairY = startY + i * (verticalChairHeight + chairSpacing);
        const isOccupied = occupiedChairs.includes(chairIndex + 1);
        this.drawChair(leftX, chairY, verticalChairWidth, verticalChairHeight, isOccupied, 'vertical', 'left');
        chairIndex++;
      }

      // Right side - chairs positioned directly to the right of table (vertical orientation)
      const rightX = table.x + table.width;
      for (let i = 0; i < chairsPerSide && chairIndex < seats; i++) {
        const chairY = startY + i * (verticalChairHeight + chairSpacing);
        const isOccupied = occupiedChairs.includes(chairIndex + 1);
        this.drawChair(rightX, chairY, verticalChairWidth, verticalChairHeight, isOccupied, 'vertical', 'right');
        chairIndex++;
      }
      return;
    }
    
    // If width === height (square), use default logic based on seat count
    // For 2-seater and 4-seater: y-axis (left and right)
    if (seats === 2 || seats === 4) {
      const chairsPerSide = seats / 2;
      let chairIndex = 0;
      
      // Use standard chair dimensions - swap width/height for vertical orientation
      const verticalChairWidth = chairHeight; // Use height as width when vertical
      const verticalChairHeight = chairWidth; // Use width as height when vertical
      
      const availableHeight = table.height;
      const totalChairsHeight = chairsPerSide * verticalChairHeight;
      const chairSpacing = totalChairsHeight < availableHeight ? (availableHeight - totalChairsHeight) / (chairsPerSide + 1) : 0;
      const startY = table.y + chairSpacing;
      
      const leftX = table.x - verticalChairWidth;
      for (let i = 0; i < chairsPerSide && chairIndex < seats; i++) {
        const chairY = startY + i * (verticalChairHeight + chairSpacing);
        const isOccupied = occupiedChairs.includes(chairIndex + 1);
        this.drawChair(leftX, chairY, verticalChairWidth, verticalChairHeight, isOccupied, 'vertical', 'left');
        chairIndex++;
      }

      const rightX = table.x + table.width;
      for (let i = 0; i < chairsPerSide && chairIndex < seats; i++) {
        const chairY = startY + i * (verticalChairHeight + chairSpacing);
        const isOccupied = occupiedChairs.includes(chairIndex + 1);
        this.drawChair(rightX, chairY, verticalChairWidth, verticalChairHeight, isOccupied, 'vertical', 'right');
        chairIndex++;
      }
      return;
    }
    
    // For 12-seater and other tables: use longer side logic consistently
    // Determine which side is longer
    const isWidthLongerForLarge = table.width > table.height;
    
    if (isWidthLongerForLarge) {
      // If width is longer, place all chairs on top and bottom
      const chairsPerSide = Math.ceil(seats / 2);
      let chairIndex = 0;
      
      // Use standard chair dimensions - distribute evenly with spacing
      const availableWidth = table.width;
      const totalChairsWidth = chairsPerSide * chairWidth;
      const chairSpacing = totalChairsWidth < availableWidth ? (availableWidth - totalChairsWidth) / (chairsPerSide + 1) : 0;
      const startX = table.x + chairSpacing;
      
      // Top side
      const topY = table.y - chairHeight;
      for (let i = 0; i < chairsPerSide && chairIndex < seats; i++) {
        const chairX = startX + i * (chairWidth + chairSpacing);
        const isOccupied = occupiedChairs.includes(chairIndex + 1);
        this.drawChair(chairX, topY, chairWidth, chairHeight, isOccupied, 'horizontal', 'top');
        chairIndex++;
      }

      // Bottom side
      const bottomY = table.y + table.height;
      for (let i = 0; i < chairsPerSide && chairIndex < seats; i++) {
        const chairX = startX + i * (chairWidth + chairSpacing);
        const isOccupied = occupiedChairs.includes(chairIndex + 1);
        this.drawChair(chairX, bottomY, chairWidth, chairHeight, isOccupied, 'horizontal', 'bottom');
        chairIndex++;
      }
    } else {
      // If height is longer, place all chairs on left and right
      const chairsPerSide = Math.ceil(seats / 2);
      let chairIndex = 0;
      
      // Use standard chair dimensions - swap width/height for vertical orientation
      const verticalChairWidth = chairHeight; // Use height as width when vertical
      const verticalChairHeight = chairWidth; // Use width as height when vertical
      
      const availableHeight = table.height;
      const totalChairsHeight = chairsPerSide * verticalChairHeight;
      const chairSpacing = totalChairsHeight < availableHeight ? (availableHeight - totalChairsHeight) / (chairsPerSide + 1) : 0;
      const startY = table.y + chairSpacing;
      
      // Left side
      const leftX = table.x - verticalChairWidth;
      for (let i = 0; i < chairsPerSide && chairIndex < seats; i++) {
        const chairY = startY + i * (verticalChairHeight + chairSpacing);
        const isOccupied = occupiedChairs.includes(chairIndex + 1);
        this.drawChair(leftX, chairY, verticalChairWidth, verticalChairHeight, isOccupied, 'vertical', 'left');
        chairIndex++;
      }

      // Right side
      const rightX = table.x + table.width;
      for (let i = 0; i < chairsPerSide && chairIndex < seats; i++) {
        const chairY = startY + i * (verticalChairHeight + chairSpacing);
        const isOccupied = occupiedChairs.includes(chairIndex + 1);
        this.drawChair(rightX, chairY, verticalChairWidth, verticalChairHeight, isOccupied, 'vertical', 'right');
        chairIndex++;
      }
    }
  }

  /**
   * Draw a single chair using images - dynamically switches between available and occupied
   * Chairs are rectangular (length > width)
   * The flat side (back) of the chair should always face toward the table
   */
  private drawChair(x: number, y: number, width: number, height: number, isOccupied: boolean, orientation: 'horizontal' | 'vertical' = 'horizontal', side: 'top' | 'bottom' | 'left' | 'right' = 'bottom'): void {
    this.ctx.save();
    
    // Select the appropriate chair image based on occupancy
    const chairImg = isOccupied ? this.chairOccupiedImage : this.chairImage;
    
    // If we have the chair image, draw it
    if (chairImg) {
      const centerX = x + width / 2;
      const centerY = y + height / 2;
      
      // First, apply image-specific base rotation:
      // White chair (available): rotate 90 degrees clockwise (1 time) + 180 degrees to flip (back faces table)
      // Red chair (occupied): rotate 180 degrees (2 times)
      let baseRotation = 0;
      if (isOccupied) {
        baseRotation = Math.PI; // 180 degrees = 2 times rotation
      } else {
        // White chair: 90 degrees clockwise + 180 degrees flip = 90 degrees total (270 degrees or -90 degrees)
        baseRotation = -Math.PI / 2 + Math.PI; // 90 degrees clockwise + 180 degrees flip = 90 degrees counter-clockwise
      }
      
      // Then, rotate the chair so the flat side (back) faces toward the table
      // Top side: rotate 180 degrees (face down toward table)
      // Bottom side: rotate 0 degrees (face up toward table) 
      // Left side: rotate 90 degrees (face right toward table)
      // Right side: rotate -90 degrees (face left toward table)
      let sideRotation = 0;
      if (side === 'top') {
        sideRotation = Math.PI; // 180 degrees - face down
      } else if (side === 'bottom') {
        sideRotation = 0; // 0 degrees - face up
      } else if (side === 'left') {
        sideRotation = Math.PI / 2; // 90 degrees - face right
      } else if (side === 'right') {
        sideRotation = -Math.PI / 2; // -90 degrees - face left
      }
      
      // Combine both rotations
      const totalRotation = baseRotation + sideRotation;
      
      // Apply rotation
      this.ctx.translate(centerX, centerY);
      this.ctx.rotate(totalRotation);
      
      // Draw the image centered at the rotation point
      // Always use the provided width and height
      this.ctx.drawImage(
        chairImg,
        -width / 2,
        -height / 2,
        width,
        height
      );
    } else {
      // Fallback to drawing rounded rectangle if images not loaded
      const radius = 3;
      
      // Set fill color based on occupied status and theme
      if (isOccupied) {
        this.ctx.fillStyle = this.getChairColor('occupied-fill');
      } else {
        this.ctx.fillStyle = this.getChairColor('available-fill');
      }
      
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
      
      // Add subtle border with theme-aware color
      if (isOccupied) {
        this.ctx.strokeStyle = this.getChairColor('occupied-border');
      } else {
        this.ctx.strokeStyle = this.getChairColor('available-border');
      }
      this.ctx.lineWidth = 1;
      this.ctx.stroke();
    }
    
    this.ctx.restore();
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
   * Draw edit and delete icons on the top-right corner of the table
   */
  private drawActionIcons(table: Table): void {
    const iconSize = 16; // Size of each icon
    const iconSpacing = 4; // Spacing between icons
    const padding = 8; // Padding from table edge
    
    // Position icons in top-right corner
    const iconsX = table.x + table.width - padding - iconSize * 2 - iconSpacing;
    const iconsY = table.y + padding;
    
    this.ctx.save();
    
    // Draw edit icon
    if (this.editIcon) {
      this.ctx.drawImage(
        this.editIcon,
        iconsX,
        iconsY,
        iconSize,
        iconSize
      );
    }
    
    // Draw delete icon (to the right of edit icon)
    if (this.deleteIcon) {
      this.ctx.drawImage(
        this.deleteIcon,
        iconsX + iconSize + iconSpacing,
        iconsY,
        iconSize,
        iconSize
      );
    }
    
    this.ctx.restore();
  }

  /**
   * Draw multiple tables
   */
  drawTables(tables: Table[], selectedTableId?: string | null): void {
    tables.forEach(table => this.drawTable(table, selectedTableId));
  }

  /**
   * Get the bounds of action icons for a table (for click detection)
   */
  getActionIconBounds(table: Table): { edit: { x: number; y: number; width: number; height: number }; delete: { x: number; y: number; width: number; height: number } } | null {
    const iconSize = 16;
    const iconSpacing = 4;
    const padding = 8;
    
    const iconsX = table.x + table.width - padding - iconSize * 2 - iconSpacing;
    const iconsY = table.y + padding;
    
    return {
      edit: {
        x: iconsX,
        y: iconsY,
        width: iconSize,
        height: iconSize
      },
      delete: {
        x: iconsX + iconSize + iconSpacing,
        y: iconsY,
        width: iconSize,
        height: iconSize
      }
    };
  }
}


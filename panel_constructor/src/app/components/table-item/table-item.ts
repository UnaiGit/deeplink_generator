import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';

type ChairSide = 'left' | 'right' | 'top' | 'bottom';
type Orientation = 'vertical' | 'horizontal';

interface ChairDescriptor {
  id: number;
  side: ChairSide;
  position: number;
  label: string;
}

interface ChairGroups {
  left: ChairDescriptor[];
  right: ChairDescriptor[];
  top: ChairDescriptor[];
  bottom: ChairDescriptor[];
}

@Component({
  selector: 'app-table-item',
  imports: [CommonModule],
  templateUrl: './table-item.html',
  styleUrl: './table-item.scss',
})
export class TableItem implements OnInit, OnChanges, OnDestroy {
  /**
   * Total number of seats around the table.
   * Must be an even number so chairs can be split across opposing sides.
   */
  @Input({ required: true }) totalSeats = 8;

  /**
   * Table orientation determines where the chairs are rendered:
   * - vertical: chairs on left/right sides (tall table)
   * - horizontal: chairs on top/bottom sides (wide table)
   */
  @Input() orientation: Orientation = 'vertical';

  /**
   * Optional table label rendered at the center.
   */
  @Input() tableLabel = 'Table';

  /**
   * Specify an explicit two-sided distribution (e.g. [3, 3]) when seats
   * should be split unevenly across opposing sides. The pair maps to
   * [left, right] for vertical orientation or [top, bottom] for horizontal.
   * When omitted, seats are divided evenly.
   */
  @Input() seatsPerSide: [number, number] | null = null;

  /**
   * Emit chair selection events to parent components.
   */
  @Output() chairSelected = new EventEmitter<ChairDescriptor>();

  chairGroups: ChairGroups = {
    left: [],
    right: [],
    top: [],
    bottom: [],
  };

  /**
   * Dynamic dimensions for the table body.
   * Length scales with seat count so spacing stays consistent.
   */
  tableLength = 320;
  tableThickness = 120;

  infoText: string | null = null;
  private hideInfoTimer: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void {
    this.recalculateLayout();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['totalSeats'] || changes['orientation'] || changes['seatsPerSide']) {
      this.recalculateLayout();
    }
  }

  ngOnDestroy(): void {
    this.clearInfoTimer();
  }

  handleChairClick(chair: ChairDescriptor): void {
    this.chairSelected.emit(chair);
    this.showInfo(`${chair.label}`);
  }

  trackByChairId(_: number, chair: ChairDescriptor): number {
    return chair.id;
  }

  private recalculateLayout(): void {
    const safeSeatCount = Math.max(0, Math.floor(this.totalSeats));

    if (safeSeatCount === 0) {
      this.chairGroups = {
        left: [],
        right: [],
        top: [],
        bottom: [],
      };
      this.tableLength = 200;
      return;
    }

    if (safeSeatCount % 2 !== 0) {
      console.warn(
        '[TableItem] totalSeats should be an even number. The last seat will be ignored.'
      );
    }

    const usableSeats = safeSeatCount - (safeSeatCount % 2);

    const groups: ChairGroups = {
      left: [],
      right: [],
      top: [],
      bottom: [],
    };

    let chairCounter = 1;
    let maxChairsOnSide = 0;

    if (this.orientation === 'vertical') {
      const [leftCount, rightCount] = this.getSideDistribution(usableSeats);
      maxChairsOnSide = Math.max(leftCount, rightCount);

      for (let i = 0; i < leftCount; i++) {
        groups.left.push(this.createChairDescriptor(chairCounter++, 'left', i + 1));
      }
      for (let i = 0; i < rightCount; i++) {
        groups.right.push(this.createChairDescriptor(chairCounter++, 'right', i + 1));
      }
    } else {
      const [topCount, bottomCount] = this.getSideDistribution(usableSeats);
      maxChairsOnSide = Math.max(topCount, bottomCount);

      for (let i = 0; i < topCount; i++) {
        groups.top.push(this.createChairDescriptor(chairCounter++, 'top', i + 1));
      }
      for (let i = 0; i < bottomCount; i++) {
        groups.bottom.push(this.createChairDescriptor(chairCounter++, 'bottom', i + 1));
      }
    }

    this.chairGroups = groups;
    this.tableLength = this.calculateTableLength(maxChairsOnSide || usableSeats / 2);
  }

  private calculateTableLength(perSide: number): number {
    const CHAIR_HEIGHT = 60;
    const GAP = 18;
    const MIN_LENGTH = 160;

    if (perSide <= 0) {
      return MIN_LENGTH;
    }

    const total = perSide * CHAIR_HEIGHT + (perSide + 1) * GAP;
    return Math.max(total, MIN_LENGTH);
  }

  private getSideDistribution(totalSeats: number): [number, number] {
    if (this.seatsPerSide && this.seatsPerSide.length === 2) {
      const normalized: [number, number] = [
        Math.max(0, Math.floor(this.seatsPerSide[0])),
        Math.max(0, Math.floor(this.seatsPerSide[1])),
      ];

      if (normalized[0] + normalized[1] === totalSeats) {
        return normalized;
      }

      console.warn(
        '[TableItem] seatsPerSide does not sum to totalSeats. Falling back to even split.'
      );
    }

    const half = Math.max(0, totalSeats / 2);
    return [half, half];
  }

  private createChairDescriptor(
    id: number,
    side: ChairSide,
    position: number
  ): ChairDescriptor {
    const sideLabel = side.charAt(0).toUpperCase() + side.slice(1);
    return {
      id,
      side,
      position,
      label: `${sideLabel} Chair ${position}`,
    };
  }

  private showInfo(text: string): void {
    this.infoText = text;
    this.clearInfoTimer();
    this.hideInfoTimer = setTimeout(() => {
      this.infoText = null;
      this.hideInfoTimer = null;
    }, 2000);
  }

  private clearInfoTimer(): void {
    if (this.hideInfoTimer) {
      clearTimeout(this.hideInfoTimer);
      this.hideInfoTimer = null;
    }
  }
}

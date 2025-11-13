import { 
  Component, 
  Input, 
  Output, 
  EventEmitter, 
  OnInit, 
  OnChanges, 
  OnDestroy, 
  ElementRef, 
  Renderer2, 
  Inject 
} from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { ModalConfig } from './modal-config.type';

@Component({
  selector: 'app-base-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './base-modal.html',
  styleUrl: './base-modal.scss'
})
export class BaseModalComponent implements OnInit, OnChanges, OnDestroy {
  @Input() isOpen: boolean = false;
  @Input() config: ModalConfig = {};
  @Output() close = new EventEmitter<void>();
  @Output() opened = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  private modalElement: HTMLElement | null = null;
  private bodyElement: HTMLElement | null = null;
  private keyboardListener?: () => void;

  defaultConfig: ModalConfig = {
    position: 'right',
    animation: 'slide',
    closeOnOverlayClick: true,
    closeOnEscape: true,
  };

  mergedConfig: ModalConfig = {};

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.bodyElement = this.document.body;
  }

  ngOnInit(): void {
    this.mergeConfig();
    this.setupKeyboardListener();
  }

  ngOnChanges(): void {
    this.mergeConfig();
    
    if (this.isOpen && this.bodyElement) {
      setTimeout(() => {
        this.moveModalToBody();
        this.renderer.setStyle(this.bodyElement, 'overflow', 'hidden');
        this.opened.emit();
      }, 0);
    } else if (!this.isOpen && this.modalElement) {
      this.removeModalFromBody();
      this.renderer.removeStyle(this.bodyElement, 'overflow');
      this.closed.emit();
    }
  }

  ngOnDestroy(): void {
    this.removeModalFromBody();
    this.removeKeyboardListener();
    if (this.bodyElement) {
      this.renderer.removeStyle(this.bodyElement, 'overflow');
    }
  }

  private mergeConfig(): void {
    this.mergedConfig = { ...this.defaultConfig, ...this.config };
  }

  private moveModalToBody(): void {
    if (!this.bodyElement || !this.el.nativeElement) return;
    
    const modalOverlay = this.el.nativeElement.querySelector('.modal-overlay');
    if (modalOverlay && !this.modalElement) {
      this.modalElement = modalOverlay;
      this.renderer.appendChild(this.bodyElement, modalOverlay);
    }
  }

  private removeModalFromBody(): void {
    if (this.modalElement && this.bodyElement) {
      this.renderer.removeChild(this.bodyElement, this.modalElement);
      this.modalElement = null;
    }
  }

  private setupKeyboardListener(): void {
    this.keyboardListener = this.renderer.listen('document', 'keydown', (event: KeyboardEvent) => {
      if (event.key === 'Escape' && this.isOpen && this.mergedConfig.closeOnEscape !== false) {
        this.onClose();
      }
    });
  }

  private removeKeyboardListener(): void {
    if (this.keyboardListener) {
      this.keyboardListener();
      this.keyboardListener = undefined;
    }
  }

  onClose(): void {
    if (this.isOpen) {
      this.close.emit();
    }
  }

  onOverlayClick(): void {
    if (this.mergedConfig.closeOnOverlayClick !== false) {
      this.onClose();
    }
  }

  getModalClasses(): string[] {
    const classes: string[] = [];
    
    if (this.isOpen) {
      classes.push('open');
    }
    
    if (this.mergedConfig.position) {
      classes.push(`modal-${this.mergedConfig.position}`);
    }
    
    if (this.mergedConfig.animation) {
      classes.push(`animation-${this.mergedConfig.animation}`);
    }
    
    if (this.mergedConfig.customClass) {
      classes.push(this.mergedConfig.customClass);
    }
    
    return classes;
  }

  getModalStyles(): { [key: string]: string } {
    const styles: { [key: string]: string } = {};
    
    if (this.mergedConfig.width) {
      styles['width'] = this.mergedConfig.width;
    }
    
    if (this.mergedConfig.height) {
      styles['height'] = this.mergedConfig.height;
    }
    
    if (this.mergedConfig.maxWidth) {
      styles['max-width'] = this.mergedConfig.maxWidth;
    }
    
    if (this.mergedConfig.maxHeight) {
      styles['max-height'] = this.mergedConfig.maxHeight;
    }
    
    if (this.mergedConfig.backgroundColor) {
      styles['background-color'] = this.mergedConfig.backgroundColor;
    }
    
    if (this.mergedConfig.borderRadius) {
      styles['border-radius'] = this.mergedConfig.borderRadius;
    }
    
    return styles;
  }

  getOverlayStyles(): { [key: string]: string } {
    const styles: { [key: string]: string } = {};
    
    if (this.mergedConfig.overlayColor) {
      styles['background-color'] = this.mergedConfig.overlayColor;
    }
    
    return styles;
  }
}


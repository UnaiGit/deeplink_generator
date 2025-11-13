export interface ModalConfig {
  position?: 'center' | 'right' | 'left' | 'top' | 'bottom';
  width?: string;
  height?: string;
  maxWidth?: string;
  maxHeight?: string;
  animation?: 'slide' | 'fade' | 'scale' | 'none';
  overlayColor?: string;
  backgroundColor?: string;
  borderRadius?: string;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  customClass?: string;
}


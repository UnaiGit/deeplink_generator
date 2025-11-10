export interface Card {
    titleKey: string;
    value: string;
    unitKey: string;
    iconSrc: string;
    iconBg: string;
    leftNotePrefix: string;
    leftNoteSuffixKey: string;
    rightDelta: string;
    rightTone: 'positive' | 'negative';
  }
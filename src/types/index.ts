export interface Alarm {
  id: string;
  time: Date;
  label: string;
  enabled: boolean;
  barcodeId: string;
  notificationId?: string;
  repeatDays?: number[];
}

export interface SavedBarcode {
  id: string;
  data: string;
  type: string;
  label: string;
  timestamp: Date;
}
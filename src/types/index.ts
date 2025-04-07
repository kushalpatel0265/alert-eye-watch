
export interface User {
  id: string;
  email?: string;
  phone?: string;
}

export interface Camera {
  deviceId: string;
  label: string;
}

export interface Detection {
  timestamp: Date;
  confidence: number;
  imageData?: string;
  boundingBoxes?: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
    class: string;
    confidence: number;
  }>;
}

export interface AlertSettings {
  email?: string;
  phone?: string;
  threshold: number;
  enableEmailAlerts: boolean;
  enableSmsAlerts: boolean;
}

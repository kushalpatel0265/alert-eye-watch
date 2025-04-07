
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
}

export interface AlertSettings {
  email?: string;
  phone?: string;
  threshold: number;
  enableEmailAlerts: boolean;
  enableSmsAlerts: boolean;
}

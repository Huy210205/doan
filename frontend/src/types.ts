export interface Vulnerability {
  id: string;
  type: string;
  url: string;
  level: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  confidence: string;
  parameter: string;
  payload: string;
  recommendation: string;
  evidence: string;
  code_block: string;
}

export interface ScanHistoryItem {
  id: string;
  target: string;
  time: string;
  errors_found: number;
  status: 'Completed' | 'Failed' | 'Scanning';
  severities: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  vulnerabilities: string[]; // references of Vulnerability IDs
}

export interface CrawlerConfig {
  max_depth: number;
  delay_ms: number;
}

export interface AIModel {
  id: string;
  name: string;
  description: string;
}

export interface SystemConfig {
  crawler: CrawlerConfig;
  selected_model_id: string;
  retrain_on_new_data: boolean;
  pdf_report_email: string;
  auth_header?: string;
}

export type ActiveTab = 'dashboard' | 'history' | 'config' | 'users' | 'overview';

export interface UserSession {
  email: string;
  username?: string;
  logo?: string;
  isAuthenticated: boolean;
  token?: string;
  role?: 'user' | 'admin';
}

export interface UserProfile {
  id: string;
  email: string;
  role: 'user' | 'admin';
  status: 'active' | 'blocked';
  createdAt: string;
  lastLogin?: string;
}

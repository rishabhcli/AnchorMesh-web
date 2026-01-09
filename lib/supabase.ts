import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export type EmergencyType = 'medical' | 'fire' | 'security' | 'natural_disaster' | 'accident' | 'other';
export type AlertPriority = 'low' | 'medium' | 'high' | 'critical';
export type AlertStatus = 'active' | 'acknowledged' | 'responding' | 'resolved' | 'cancelled' | 'expired';

export interface Device {
  id: string;
  device_id: string;
  platform: 'ios' | 'android' | 'web';
  app_version?: string;
  os_version?: string;
  device_model?: string;
  last_known_location?: string;
  location_accuracy?: number;
  has_internet_capability: boolean;
  ble_supports_mesh: boolean;
  is_active: boolean;
  last_seen: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface SOSAlert {
  id: string;
  message_id: string;
  originator_device_id: string;
  emergency_type: EmergencyType;
  priority: AlertPriority;
  status: AlertStatus;
  location: string; // PostGIS geography as WKT
  location_accuracy?: number;
  message?: string;
  hop_count: number;
  relay_chain: Array<{
    device_id: string;
    timestamp: string;
    had_internet: boolean;
  }>;
  delivered_by?: string;
  delivered_via: 'direct' | 'mesh_relay';
  originated_at: string;
  received_at: string;
  acknowledged_at?: string;
  resolved_at?: string;
  expires_at: string;
  responders: Array<{
    responderId: string;
    type: string;
    acknowledgedAt?: string;
  }>;
  is_verified: boolean;
  verification_notes?: string;
  raw_packet_data?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface AlertStats {
  active_count: number;
  acknowledged_count: number;
  resolved_today: number;
  total_devices: number;
  active_devices: number;
  alerts_by_type: Record<string, number>;
  alerts_by_priority: Record<string, number>;
}

// Helper to parse PostGIS geography to lat/lng
export function parseLocation(locationWKT: string): { latitude: number; longitude: number } | null {
  // Format: "POINT(longitude latitude)" or could be raw geography
  const match = locationWKT?.match(/POINT\s*\(\s*([-\d.]+)\s+([-\d.]+)\s*\)/i);
  if (match) {
    return {
      longitude: parseFloat(match[1]),
      latitude: parseFloat(match[2]),
    };
  }
  return null;
}

// Map emergency type to display label
export function getEmergencyLabel(type: EmergencyType): string {
  const labels: Record<EmergencyType, string> = {
    medical: 'Medical',
    fire: 'Fire',
    security: 'Security',
    natural_disaster: 'Natural Disaster',
    accident: 'Accident',
    other: 'SOS',
  };
  return labels[type] || 'SOS';
}

// Map priority to status for UI
export function getPriorityStatus(priority: AlertPriority): 'critical' | 'injured' | 'warning' {
  switch (priority) {
    case 'critical':
      return 'critical';
    case 'high':
      return 'injured';
    default:
      return 'warning';
  }
}

// Format time ago
export function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return `${seconds} sec ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hr ago`;
  return `${Math.floor(seconds / 86400)} days ago`;
}

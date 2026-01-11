'use client';

import { useMemo } from 'react';
import { useDemo, useDemoMode } from '@/lib/DemoContext';
import { useActiveAlerts, useAlertStats, useActiveDevices, acknowledgeAlert as realAcknowledgeAlert, resolveAlert as realResolveAlert } from './useAlerts';
import { SOSAlert, AlertStats, Device } from '@/lib/supabase';

// Unified hook that returns alerts from demo or real data
export function useUnifiedAlerts() {
  const isDemoMode = useDemoMode();
  const demo = useDemo();
  const realAlerts = useActiveAlerts();

  const alerts = useMemo(() => {
    if (isDemoMode) {
      return demo.activeAlerts;
    }
    return realAlerts.alerts;
  }, [isDemoMode, demo.activeAlerts, realAlerts.alerts]);

  const loading = isDemoMode ? false : realAlerts.loading;
  const error = isDemoMode ? null : realAlerts.error;

  const refresh = isDemoMode ? demo.resetDemo : realAlerts.refresh;

  return { alerts, loading, error, refresh };
}

// Unified hook that returns stats from demo or real data
export function useUnifiedStats() {
  const isDemoMode = useDemoMode();
  const demo = useDemo();
  const realStats = useAlertStats();

  const stats = useMemo(() => {
    if (isDemoMode) {
      return demo.demoStats;
    }
    return realStats.stats;
  }, [isDemoMode, demo.demoStats, realStats.stats]);

  const loading = isDemoMode ? false : realStats.loading;
  const error = isDemoMode ? null : realStats.error;

  const refresh = isDemoMode ? demo.resetDemo : realStats.refresh;

  return { stats, loading, error, refresh };
}

// Unified hook that returns devices from demo or real data
export function useUnifiedDevices() {
  const isDemoMode = useDemoMode();
  const demo = useDemo();
  const realDevices = useActiveDevices();

  const devices = useMemo(() => {
    if (isDemoMode) {
      return demo.demoDevices;
    }
    return realDevices.devices;
  }, [isDemoMode, demo.demoDevices, realDevices.devices]);

  const loading = isDemoMode ? false : realDevices.loading;
  const error = isDemoMode ? null : realDevices.error;

  const refresh = isDemoMode ? demo.resetDemo : realDevices.refresh;

  return { devices, loading, error, refresh };
}

// Unified alert actions
export function useAlertActions() {
  const isDemoMode = useDemoMode();
  const demo = useDemo();

  const acknowledgeAlert = async (alertId: string, responderId?: string) => {
    if (isDemoMode) {
      demo.acknowledgeAlert(alertId);
    } else {
      await realAcknowledgeAlert(alertId, responderId);
    }
  };

  const resolveAlert = async (alertId: string, notes?: string) => {
    if (isDemoMode) {
      demo.resolveAlert(alertId, notes);
    } else {
      await realResolveAlert(alertId, notes);
    }
  };

  return { acknowledgeAlert, resolveAlert };
}

// Hook to get all demo alerts (including resolved) for analytics
export function useAllAlerts() {
  const isDemoMode = useDemoMode();
  const demo = useDemo();

  // For real data, we'd need a separate query to get resolved alerts
  // For now, demo mode returns all alerts
  const allAlerts = useMemo(() => {
    if (isDemoMode) {
      return demo.demoAlerts;
    }
    // In real mode, this would need additional fetching
    return [];
  }, [isDemoMode, demo.demoAlerts]);

  return { allAlerts };
}

// Calculate additional metrics from alerts
export function useAlertMetrics(alerts: SOSAlert[]) {
  return useMemo(() => {
    if (!alerts.length) {
      return {
        avgHopCount: 0,
        meshRelayPercentage: 0,
        avgResponseTimeMinutes: 0,
        criticalCount: 0,
        highCount: 0,
        mediumCount: 0,
        lowCount: 0,
      };
    }

    // Average hop count
    const avgHopCount = alerts.reduce((sum, a) => sum + a.hop_count, 0) / alerts.length;

    // Mesh relay percentage
    const meshRelayed = alerts.filter(a => a.delivered_via === 'mesh_relay').length;
    const meshRelayPercentage = (meshRelayed / alerts.length) * 100;

    // Average response time (for acknowledged/resolved alerts)
    const respondedAlerts = alerts.filter(a => a.acknowledged_at);
    let avgResponseTimeMinutes = 0;
    if (respondedAlerts.length > 0) {
      const totalResponseTime = respondedAlerts.reduce((sum, a) => {
        const received = new Date(a.received_at).getTime();
        const acknowledged = new Date(a.acknowledged_at!).getTime();
        return sum + (acknowledged - received);
      }, 0);
      avgResponseTimeMinutes = totalResponseTime / respondedAlerts.length / 60000;
    }

    // Count by priority
    const criticalCount = alerts.filter(a => a.priority === 'critical').length;
    const highCount = alerts.filter(a => a.priority === 'high').length;
    const mediumCount = alerts.filter(a => a.priority === 'medium').length;
    const lowCount = alerts.filter(a => a.priority === 'low').length;

    return {
      avgHopCount: Math.round(avgHopCount * 10) / 10,
      meshRelayPercentage: Math.round(meshRelayPercentage),
      avgResponseTimeMinutes: Math.round(avgResponseTimeMinutes * 10) / 10,
      criticalCount,
      highCount,
      mediumCount,
      lowCount,
    };
  }, [alerts]);
}

// Filter alerts by time range
export function filterAlertsByTimeRange(alerts: SOSAlert[], timeRange: '24h' | '7d' | '30d'): SOSAlert[] {
  const now = new Date();
  const cutoffMs = {
    '24h': 24 * 60 * 60 * 1000,
    '7d': 7 * 24 * 60 * 60 * 1000,
    '30d': 30 * 24 * 60 * 60 * 1000,
  }[timeRange];

  const cutoffDate = new Date(now.getTime() - cutoffMs);

  return alerts.filter(alert => new Date(alert.created_at) >= cutoffDate);
}

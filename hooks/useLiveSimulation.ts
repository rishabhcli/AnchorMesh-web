'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useDemo, useDemoMode } from '@/lib/DemoContext';

interface SimulationConfig {
  enabled: boolean;
  newAlertIntervalMs: { min: number; max: number };
  activityIntervalMs: { min: number; max: number };
}

const DEFAULT_CONFIG: SimulationConfig = {
  enabled: true,
  newAlertIntervalMs: { min: 45000, max: 90000 }, // 45-90 seconds
  activityIntervalMs: { min: 30000, max: 60000 }, // 30-60 seconds
};

// Hook to run live simulation in demo mode
export function useLiveSimulation(config: Partial<SimulationConfig> = {}) {
  const isDemoMode = useDemoMode();
  const demo = useDemo();
  const [isRunning, setIsRunning] = useState(false);
  const newAlertTimerRef = useRef<NodeJS.Timeout | null>(null);
  const activityTimerRef = useRef<NodeJS.Timeout | null>(null);

  const mergedConfig = { ...DEFAULT_CONFIG, ...config };

  // Get random interval
  const getRandomInterval = useCallback((range: { min: number; max: number }) => {
    return Math.floor(Math.random() * (range.max - range.min)) + range.min;
  }, []);

  // Schedule next new alert
  const scheduleNewAlert = useCallback(() => {
    if (!mergedConfig.enabled || !isDemoMode) return;

    const interval = getRandomInterval(mergedConfig.newAlertIntervalMs);
    newAlertTimerRef.current = setTimeout(() => {
      demo.addNewAlert();
      scheduleNewAlert(); // Schedule next
    }, interval);
  }, [demo, getRandomInterval, isDemoMode, mergedConfig]);

  // Schedule next activity (acknowledge/resolve)
  const scheduleActivity = useCallback(() => {
    if (!mergedConfig.enabled || !isDemoMode) return;

    const interval = getRandomInterval(mergedConfig.activityIntervalMs);
    activityTimerRef.current = setTimeout(() => {
      demo.simulateActivity();
      scheduleActivity(); // Schedule next
    }, interval);
  }, [demo, getRandomInterval, isDemoMode, mergedConfig]);

  // Start simulation
  const start = useCallback(() => {
    if (isRunning || !isDemoMode) return;
    setIsRunning(true);
    scheduleNewAlert();
    scheduleActivity();
  }, [isRunning, isDemoMode, scheduleNewAlert, scheduleActivity]);

  // Stop simulation
  const stop = useCallback(() => {
    if (newAlertTimerRef.current) {
      clearTimeout(newAlertTimerRef.current);
      newAlertTimerRef.current = null;
    }
    if (activityTimerRef.current) {
      clearTimeout(activityTimerRef.current);
      activityTimerRef.current = null;
    }
    setIsRunning(false);
  }, []);

  // Toggle simulation
  const toggle = useCallback(() => {
    if (isRunning) {
      stop();
    } else {
      start();
    }
  }, [isRunning, start, stop]);

  // Auto-start when demo mode is enabled
  useEffect(() => {
    if (isDemoMode && mergedConfig.enabled && !isRunning) {
      // Delay start to avoid immediate activity on page load
      const startTimer = setTimeout(() => {
        start();
      }, 5000); // 5 second delay before starting simulation

      return () => clearTimeout(startTimer);
    }

    // Stop when demo mode is disabled
    if (!isDemoMode && isRunning) {
      stop();
    }
  }, [isDemoMode, mergedConfig.enabled, isRunning, start, stop]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return {
    isRunning,
    start,
    stop,
    toggle,
  };
}

// Hook for activity feed updates with timestamps
export function useActivityLog(maxItems: number = 20) {
  const isDemoMode = useDemoMode();
  const demo = useDemo();
  const [activityLog, setActivityLog] = useState<ActivityLogItem[]>([]);

  interface ActivityLogItem {
    id: string;
    type: 'new_alert' | 'acknowledged' | 'resolved' | 'mesh_relay';
    alertId: string;
    message: string;
    timestamp: Date;
    priority?: string;
    emergencyType?: string;
  }

  // Track changes in alerts to generate activity log
  const prevAlertsRef = useRef<typeof demo.demoAlerts>([]);

  useEffect(() => {
    if (!isDemoMode) return;

    const prevAlerts = prevAlertsRef.current;
    const currentAlerts = demo.demoAlerts;

    const newActivities: ActivityLogItem[] = [];

    // Find new alerts
    currentAlerts.forEach(alert => {
      const prevAlert = prevAlerts.find(p => p.id === alert.id);

      if (!prevAlert) {
        // New alert
        newActivities.push({
          id: `${alert.id}-new`,
          type: 'new_alert',
          alertId: alert.id,
          message: `New ${alert.priority} ${alert.emergency_type} alert via ${alert.hop_count > 0 ? `${alert.hop_count}-hop mesh relay` : 'direct'}`,
          timestamp: new Date(),
          priority: alert.priority,
          emergencyType: alert.emergency_type,
        });
      } else if (prevAlert.status !== alert.status) {
        // Status change
        if (alert.status === 'acknowledged') {
          newActivities.push({
            id: `${alert.id}-ack`,
            type: 'acknowledged',
            alertId: alert.id,
            message: `${alert.emergency_type} alert acknowledged by responder`,
            timestamp: new Date(),
            priority: alert.priority,
            emergencyType: alert.emergency_type,
          });
        } else if (alert.status === 'resolved') {
          newActivities.push({
            id: `${alert.id}-res`,
            type: 'resolved',
            alertId: alert.id,
            message: `${alert.emergency_type} alert resolved`,
            timestamp: new Date(),
            priority: alert.priority,
            emergencyType: alert.emergency_type,
          });
        }
      }
    });

    if (newActivities.length > 0) {
      setActivityLog(prev => [...newActivities, ...prev].slice(0, maxItems));
    }

    prevAlertsRef.current = currentAlerts;
  }, [isDemoMode, demo.demoAlerts, maxItems]);

  return activityLog;
}

// Hook for network statistics animation
export function useNetworkPulse() {
  const [pulseCount, setPulseCount] = useState(0);

  useEffect(() => {
    // Simulate network activity with random pulses
    const interval = setInterval(() => {
      setPulseCount(prev => prev + 1);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Return animation trigger
  return {
    pulseCount,
    shouldPulse: pulseCount % 3 === 0, // Pulse every third interval
  };
}

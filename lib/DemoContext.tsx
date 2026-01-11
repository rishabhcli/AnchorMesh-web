'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import {
  DisasterScenario,
  DISASTER_SCENARIOS,
  generateDemoDevices,
  generateDemoAlerts,
  calculateDemoStats,
  getActiveAlerts,
  generateNewAlert,
} from './demoData';
import { SOSAlert, Device, AlertStats } from './supabase';

interface DemoContextType {
  // Demo mode state
  isDemoMode: boolean;
  scenario: DisasterScenario;
  scenarioInfo: typeof DISASTER_SCENARIOS[DisasterScenario];

  // Demo data
  demoAlerts: SOSAlert[];
  demoDevices: Device[];
  demoStats: AlertStats;
  activeAlerts: SOSAlert[];

  // Actions
  toggleDemoMode: () => void;
  setScenario: (scenario: DisasterScenario) => void;
  resetDemo: () => void;
  acknowledgeAlert: (alertId: string) => void;
  resolveAlert: (alertId: string, notes?: string) => void;
  addNewAlert: () => void;
  simulateActivity: () => void;
}

const DemoContext = createContext<DemoContextType | null>(null);

// Check if demo mode is enabled via localStorage or URL param
function getInitialDemoMode(): boolean {
  if (typeof window === 'undefined') return true; // Default to demo mode on SSR
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('demo') === 'true') return true;
  if (urlParams.get('demo') === 'false') return false;
  const stored = localStorage.getItem('anchormesh_demo_mode');
  return stored !== 'false'; // Default to demo mode
}

function getInitialScenario(): DisasterScenario {
  if (typeof window === 'undefined') return 'wildfire';
  const urlParams = new URLSearchParams(window.location.search);
  const urlScenario = urlParams.get('scenario') as DisasterScenario;
  if (urlScenario && DISASTER_SCENARIOS[urlScenario]) return urlScenario;
  const stored = localStorage.getItem('anchormesh_demo_scenario') as DisasterScenario;
  return stored && DISASTER_SCENARIOS[stored] ? stored : 'wildfire';
}

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const [isDemoMode, setIsDemoMode] = useState(true);
  const [scenario, setScenarioState] = useState<DisasterScenario>('wildfire');
  const [seed, setSeed] = useState(42);
  const [demoDevices, setDemoDevices] = useState<Device[]>([]);
  const [demoAlerts, setDemoAlerts] = useState<SOSAlert[]>([]);
  const [initialized, setInitialized] = useState(false);

  // Initialize on client side
  useEffect(() => {
    setIsDemoMode(getInitialDemoMode());
    setScenarioState(getInitialScenario());
    setInitialized(true);
  }, []);

  // Generate demo data when scenario changes
  useEffect(() => {
    if (!initialized) return;

    const devices = generateDemoDevices(scenario, seed);
    const alerts = generateDemoAlerts(scenario, devices, seed);

    setDemoDevices(devices);
    setDemoAlerts(alerts);
  }, [scenario, seed, initialized]);

  // Persist settings
  useEffect(() => {
    if (!initialized) return;
    localStorage.setItem('anchormesh_demo_mode', String(isDemoMode));
    localStorage.setItem('anchormesh_demo_scenario', scenario);
  }, [isDemoMode, scenario, initialized]);

  // Calculate derived values
  const activeAlerts = useMemo(() => getActiveAlerts(demoAlerts), [demoAlerts]);
  const demoStats = useMemo(() => calculateDemoStats(demoAlerts, demoDevices), [demoAlerts, demoDevices]);
  const scenarioInfo = DISASTER_SCENARIOS[scenario];

  // Actions
  const toggleDemoMode = useCallback(() => {
    setIsDemoMode(prev => !prev);
  }, []);

  const setScenario = useCallback((newScenario: DisasterScenario) => {
    setScenarioState(newScenario);
    setSeed(Math.floor(Math.random() * 10000)); // New seed for fresh data
  }, []);

  const resetDemo = useCallback(() => {
    setSeed(Math.floor(Math.random() * 10000));
  }, []);

  const acknowledgeAlert = useCallback((alertId: string) => {
    setDemoAlerts(prev => prev.map(alert => {
      if (alert.id === alertId && alert.status === 'active') {
        return {
          ...alert,
          status: 'acknowledged' as const,
          acknowledged_at: new Date().toISOString(),
          responders: [{
            responderId: `RESP-${Math.floor(Math.random() * 900) + 100}`,
            type: 'official',
            acknowledgedAt: new Date().toISOString(),
          }],
          updated_at: new Date().toISOString(),
        };
      }
      return alert;
    }));
  }, []);

  const resolveAlert = useCallback((alertId: string, notes?: string) => {
    setDemoAlerts(prev => prev.map(alert => {
      if (alert.id === alertId && (alert.status === 'acknowledged' || alert.status === 'responding')) {
        return {
          ...alert,
          status: 'resolved' as const,
          resolved_at: new Date().toISOString(),
          verification_notes: notes || 'Situation resolved',
          is_verified: true,
          updated_at: new Date().toISOString(),
        };
      }
      return alert;
    }));
  }, []);

  const addNewAlert = useCallback(() => {
    const deviceIds = demoDevices.map(d => d.device_id);
    const newAlert = generateNewAlert(scenario, deviceIds, Date.now());
    setDemoAlerts(prev => [newAlert, ...prev]);
  }, [scenario, demoDevices]);

  const simulateActivity = useCallback(() => {
    // Randomly acknowledge an active alert
    const activeList = demoAlerts.filter(a => a.status === 'active');
    if (activeList.length > 0 && Math.random() < 0.5) {
      const randomAlert = activeList[Math.floor(Math.random() * activeList.length)];
      acknowledgeAlert(randomAlert.id);
    }

    // Randomly resolve an acknowledged alert
    const acknowledgedList = demoAlerts.filter(a => a.status === 'acknowledged');
    if (acknowledgedList.length > 0 && Math.random() < 0.3) {
      const randomAlert = acknowledgedList[Math.floor(Math.random() * acknowledgedList.length)];
      resolveAlert(randomAlert.id, 'Resolved via rescue operation');
    }
  }, [demoAlerts, acknowledgeAlert, resolveAlert]);

  const value: DemoContextType = {
    isDemoMode,
    scenario,
    scenarioInfo,
    demoAlerts,
    demoDevices,
    demoStats,
    activeAlerts,
    toggleDemoMode,
    setScenario,
    resetDemo,
    acknowledgeAlert,
    resolveAlert,
    addNewAlert,
    simulateActivity,
  };

  return (
    <DemoContext.Provider value={value}>
      {children}
    </DemoContext.Provider>
  );
}

export function useDemo(): DemoContextType {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error('useDemo must be used within a DemoProvider');
  }
  return context;
}

export function useDemoMode(): boolean {
  const context = useContext(DemoContext);
  return context?.isDemoMode ?? true;
}

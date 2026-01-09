'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase, SOSAlert, AlertStats, Device } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

// Hook to fetch active SOS alerts with realtime updates
export function useActiveAlerts() {
  const [alerts, setAlerts] = useState<SOSAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAlerts = useCallback(async () => {
    try {
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('sos_alerts')
        .select('*')
        .in('status', ['active', 'acknowledged', 'responding'])
        .gt('expires_at', new Date().toISOString())
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(100);

      if (fetchError) throw fetchError;
      setAlerts((data as SOSAlert[]) || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch alerts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();

    // Subscribe to realtime updates
    const channel: RealtimeChannel = supabase
      .channel('alerts-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'sos_alerts' },
        (payload) => {
          const newAlert = payload.new as SOSAlert;
          if (['active', 'acknowledged', 'responding'].includes(newAlert.status)) {
            setAlerts((prev) => [newAlert, ...prev]);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'sos_alerts' },
        (payload) => {
          const updated = payload.new as SOSAlert;
          setAlerts((prev) =>
            prev
              .map((a) => (a.id === updated.id ? updated : a))
              .filter((a) => ['active', 'acknowledged', 'responding'].includes(a.status))
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchAlerts]);

  return { alerts, loading, error, refresh: fetchAlerts };
}

// Hook to fetch alert statistics
export function useAlertStats() {
  const [stats, setStats] = useState<AlertStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setError(null);
      const { data, error: fetchError } = await supabase.rpc('get_alert_stats');

      if (fetchError) throw fetchError;

      if (data && Array.isArray(data) && data.length > 0) {
        setStats(data[0] as AlertStats);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch stats');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();

    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);

    return () => clearInterval(interval);
  }, [fetchStats]);

  return { stats, loading, error, refresh: fetchStats };
}

// Hook to fetch active devices
export function useActiveDevices() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDevices = useCallback(async () => {
    try {
      setError(null);
      const cutoff = new Date();
      cutoff.setHours(cutoff.getHours() - 24);

      const { data, error: fetchError } = await supabase
        .from('devices')
        .select('*')
        .eq('is_active', true)
        .gte('last_seen', cutoff.toISOString())
        .order('last_seen', { ascending: false })
        .limit(1000);

      if (fetchError) throw fetchError;
      setDevices((data as Device[]) || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch devices');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDevices();

    // Refresh every 60 seconds
    const interval = setInterval(fetchDevices, 60000);

    return () => clearInterval(interval);
  }, [fetchDevices]);

  return { devices, loading, error, refresh: fetchDevices };
}

// Alert actions
export async function acknowledgeAlert(alertId: string, responderId?: string): Promise<void> {
  const updateData: Record<string, unknown> = {
    status: 'acknowledged',
    acknowledged_at: new Date().toISOString(),
  };

  if (responderId) {
    updateData.responders = [
      {
        responderId,
        type: 'official',
        acknowledgedAt: new Date().toISOString(),
      },
    ];
  }

  const { error } = await supabase
    .from('sos_alerts')
    .update(updateData)
    .eq('id', alertId);

  if (error) throw error;
}

export async function resolveAlert(alertId: string, notes?: string): Promise<void> {
  const { error } = await supabase
    .from('sos_alerts')
    .update({
      status: 'resolved',
      resolved_at: new Date().toISOString(),
      verification_notes: notes,
    })
    .eq('id', alertId);

  if (error) throw error;
}

export async function cancelAlert(alertId: string): Promise<void> {
  const { error } = await supabase
    .from('sos_alerts')
    .update({ status: 'cancelled' })
    .eq('id', alertId);

  if (error) throw error;
}

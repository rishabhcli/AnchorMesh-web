'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  Activity,
  AlertTriangle,
  Clock,
  Users,
} from 'lucide-react';
import { SOSAlert, AlertStats, EmergencyType, AlertPriority } from '@/lib/supabase';

interface AnalyticsDashboardProps {
  alerts: SOSAlert[];
  stats: AlertStats | null;
  className?: string;
}

// Simple bar chart component - Matrix style
function BarChart({ data, maxValue, colorMap }: {
  data: Array<{ label: string; value: number; key: string }>;
  maxValue: number;
  colorMap: Record<string, string>;
}) {
  return (
    <div className="space-y-3">
      {data.map((item, index) => (
        <motion.div
          key={item.key}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-mono uppercase text-foreground">{item.label.replace(' ', '_')}</span>
            <span className="text-sm text-foreground font-mono">[{item.value}]</span>
          </div>
          <div className="h-3 bg-black border border-card-border rounded overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(item.value / maxValue) * 100}%` }}
              transition={{ delay: index * 0.05 + 0.2, duration: 0.5 }}
              className="h-full rounded"
              style={{
                backgroundColor: colorMap[item.key] || '#ffffff',
                boxShadow: `0 0 10px ${colorMap[item.key] || '#ffffff'}40`
              }}
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// Donut chart component - Matrix style
function DonutChart({ data, size = 120 }: {
  data: Array<{ label: string; value: number; color: string }>;
  size?: number;
}) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const radius = size / 2 - 10;
  const circumference = 2 * Math.PI * radius;

  let accumulatedOffset = 0;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="#003300"
          strokeWidth="12"
        />
        {data.map((item, index) => {
          const percentage = total > 0 ? item.value / total : 0;
          const strokeDasharray = `${percentage * circumference} ${circumference}`;
          const strokeDashoffset = -accumulatedOffset * circumference;
          accumulatedOffset += percentage;

          return (
            <motion.circle
              key={item.label}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke={item.color}
              strokeWidth="12"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="butt"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              style={{ filter: `drop-shadow(0 0 5px ${item.color})` }}
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-mono text-foreground glow-text">{total}</span>
        <span className="text-xs text-muted font-mono">TOTAL</span>
      </div>
    </div>
  );
}

// Timeline component - Matrix style
function AlertTimeline({ alerts }: { alerts: SOSAlert[] }) {
  // Group alerts by hour
  const hourlyData = useMemo(() => {
    const hours: Record<number, number> = {};
    const now = new Date();

    // Initialize last 12 hours
    for (let i = 11; i >= 0; i--) {
      const hour = (now.getHours() - i + 24) % 24;
      hours[hour] = 0;
    }

    // Count alerts per hour
    alerts.forEach(alert => {
      const alertTime = new Date(alert.created_at);
      const hoursSince = Math.floor((now.getTime() - alertTime.getTime()) / (1000 * 60 * 60));
      if (hoursSince < 12) {
        const hour = alertTime.getHours();
        hours[hour] = (hours[hour] || 0) + 1;
      }
    });

    return Object.entries(hours).map(([hour, count]) => ({
      hour: parseInt(hour),
      count,
    }));
  }, [alerts]);

  const maxCount = Math.max(...hourlyData.map(d => d.count), 1);

  return (
    <div className="flex items-end gap-1 h-20">
      {hourlyData.map((item, index) => (
        <motion.div
          key={item.hour}
          initial={{ height: 0 }}
          animate={{ height: `${Math.max((item.count / maxCount) * 100, 4)}%` }}
          transition={{ delay: index * 0.03, duration: 0.3 }}
          className="flex-1 bg-foreground rounded-t border border-foreground"
          style={{ boxShadow: '0 0 10px rgba(255, 255, 255, 0.3)' }}
          title={`${item.hour}:00 - ${item.count} alerts`}
        />
      ))}
    </div>
  );
}

export default function AnalyticsDashboard({ alerts, stats, className = '' }: AnalyticsDashboardProps) {
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');

  // Calculate analytics data
  const analyticsData = useMemo(() => {
    // Alerts by type
    const byType = stats?.alerts_by_type || {};
    const typeData = Object.entries(byType).map(([key, value]) => ({
      label: key.replace('_', ' '),
      value: value as number,
      key,
    }));

    // Alerts by priority
    const byPriority = stats?.alerts_by_priority || {};
    const priorityData = Object.entries(byPriority).map(([key, value]) => ({
      label: key,
      value: value as number,
      key,
    }));

    // Calculate response metrics
    const acknowledgedAlerts = alerts.filter(a => a.acknowledged_at);
    const avgResponseTime = acknowledgedAlerts.length > 0
      ? acknowledgedAlerts.reduce((sum, alert) => {
          const received = new Date(alert.received_at).getTime();
          const acked = new Date(alert.acknowledged_at!).getTime();
          return sum + (acked - received);
        }, 0) / acknowledgedAlerts.length / 1000 / 60 // in minutes
      : 0;

    // Mesh relay stats
    const relayedAlerts = alerts.filter(a => a.delivered_via === 'mesh_relay');
    const avgHops = relayedAlerts.length > 0
      ? relayedAlerts.reduce((sum, a) => sum + a.hop_count, 0) / relayedAlerts.length
      : 0;

    return {
      typeData,
      priorityData,
      avgResponseTime: Math.round(avgResponseTime * 10) / 10,
      relayedCount: relayedAlerts.length,
      avgHops: Math.round(avgHops * 10) / 10,
      totalAlerts: alerts.length,
    };
  }, [alerts, stats]);

  // Color maps - Matrix style (white)
  const typeColorMap: Record<string, string> = {
    medical: '#ff0000',
    fire: '#ff6600',
    security: '#ffffff',
    natural_disaster: '#ffffff',
    accident: '#ffffff',
    other: '#888888',
  };

  const priorityColorMap: Record<string, string> = {
    critical: '#ff0000',
    high: '#ffffff',
    medium: '#aaaaaa',
    low: '#666666',
  };

  // Donut chart data
  const donutData = analyticsData.priorityData.map(item => ({
    label: item.label,
    value: item.value,
    color: priorityColorMap[item.key] || '#008f11',
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className={`bg-black border border-card-border rounded overflow-hidden ${className}`}
    >
      {/* Header - Matrix style */}
      <div className="p-6 border-b border-card-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded border border-foreground flex items-center justify-center glow-effect">
              <BarChart3 className="w-5 h-5 text-foreground" />
            </div>
            <div>
              <h3 className="font-mono text-lg text-foreground glow-text uppercase tracking-wider">&gt; ANALYTICS</h3>
              <p className="text-sm text-muted font-mono">// Alert statistics and trends</p>
            </div>
          </div>
          <div className="flex items-center gap-1 border border-card-border rounded p-1">
            {(['24h', '7d', '30d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 rounded text-xs font-mono transition-colors ${
                  timeRange === range
                    ? 'border border-foreground text-foreground'
                    : 'text-muted hover:text-foreground'
                }`}
              >
                [{range.toUpperCase()}]
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Key Metrics - Matrix style */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-black rounded border border-card-border p-4 text-center hover:border-foreground transition-colors">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-foreground" />
              <span className="text-xs text-muted font-mono">AVG_RESPONSE</span>
            </div>
            <p className="text-2xl font-mono text-foreground glow-text">{analyticsData.avgResponseTime}m</p>
          </div>
          <div className="bg-black rounded border border-card-border p-4 text-center hover:border-foreground transition-colors">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-foreground" />
              <span className="text-xs text-muted font-mono">MESH_RELAYS</span>
            </div>
            <p className="text-2xl font-mono text-foreground glow-text">{analyticsData.relayedCount}</p>
          </div>
          <div className="bg-black rounded border border-card-border p-4 text-center hover:border-foreground transition-colors">
            <div className="flex items-center justify-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-foreground" />
              <span className="text-xs text-muted font-mono">AVG_HOPS</span>
            </div>
            <p className="text-2xl font-mono text-foreground glow-text">{analyticsData.avgHops}</p>
          </div>
        </div>

        {/* Charts Row - Matrix style */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* By Priority (Donut) */}
          <div className="bg-black rounded border border-card-border p-4">
            <h4 className="font-mono mb-4 flex items-center gap-2 text-foreground uppercase">
              <AlertTriangle className="w-4 h-4" />
              &gt; BY_PRIORITY
            </h4>
            <div className="flex items-center justify-center">
              <DonutChart data={donutData} size={140} />
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {donutData.map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded border"
                    style={{ borderColor: item.color, boxShadow: `0 0 5px ${item.color}` }}
                  />
                  <span className="text-xs text-muted font-mono uppercase">{item.label}</span>
                  <span className="text-xs font-mono ml-auto text-foreground">[{item.value}]</span>
                </div>
              ))}
            </div>
          </div>

          {/* By Type (Bar) */}
          <div className="bg-black rounded border border-card-border p-4">
            <h4 className="font-mono mb-4 flex items-center gap-2 text-foreground uppercase">
              <Users className="w-4 h-4" />
              &gt; BY_EMERGENCY_TYPE
            </h4>
            <BarChart
              data={analyticsData.typeData}
              maxValue={Math.max(...analyticsData.typeData.map(d => d.value), 1)}
              colorMap={typeColorMap}
            />
          </div>
        </div>

        {/* Timeline - Matrix style */}
        <div className="bg-black rounded border border-card-border p-4">
          <h4 className="font-mono mb-4 flex items-center gap-2 text-foreground uppercase">
            <Clock className="w-4 h-4" />
            &gt; TIMELINE_12H
          </h4>
          <AlertTimeline alerts={alerts} />
          <div className="flex justify-between text-xs text-muted mt-2 font-mono">
            <span>[-12H]</span>
            <span>[NOW]</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

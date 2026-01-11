"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Radio,
  Users,
  AlertTriangle,
  Activity,
  MapPin,
  Signal,
  Battery,
  Clock,
  TrendingUp,
  TrendingDown,
  Bell,
  Settings,
  LogOut,
  Menu,
  RefreshCw,
  Shield,
  Smartphone,
  Globe,
  Zap,
  CheckCircle,
  AlertCircle,
  Map,
  BarChart3,
  Loader2,
  Volume2,
  VolumeX,
  CloudLightning,
  Play,
  Pause,
  RotateCcw,
  ChevronDown,
  Eye,
  X,
  Download,
  Filter,
  Search,
} from "lucide-react";
import { useRequireAuth } from "@/hooks/useAuth";
import { useAlertSoundNotifications } from "@/hooks/useAlertSound";
import { useUnifiedAlerts, useUnifiedStats, useUnifiedDevices, useAlertActions, useAllAlerts } from "@/hooks/useDemoData";
import { useLiveSimulation } from "@/hooks/useLiveSimulation";
import { useDemo } from "@/lib/DemoContext";
import { DISASTER_SCENARIOS, DisasterScenario } from "@/lib/demoData";
import { SOSAlert, AlertStats, parseLocation, getPriorityStatus, timeAgo, getEmergencyLabel } from "@/lib/supabase";
import dynamic from 'next/dynamic';
import { LayoutGrid, MapIcon, Split } from 'lucide-react';

// Dynamic imports for heavy components
const DisasterFeed = dynamic(() => import('@/components/DisasterFeed'), {
  ssr: false,
  loading: () => (
    <div className="bg-card border border-card-border rounded-2xl p-6 flex items-center justify-center h-[400px]">
      <Loader2 className="w-6 h-6 animate-spin text-accent" />
    </div>
  ),
});

const AnalyticsDashboard = dynamic(() => import('@/components/AnalyticsDashboard'), {
  ssr: false,
  loading: () => (
    <div className="bg-card border border-card-border rounded-2xl p-6 flex items-center justify-center h-[400px]">
      <Loader2 className="w-6 h-6 animate-spin text-accent" />
    </div>
  ),
});

// Dynamic import for map component to avoid SSR issues
const AlertMap = dynamic(() => import('@/components/AlertMap'), {
  ssr: false,
  loading: () => (
    <div className="h-[500px] bg-card border border-card-border rounded-2xl flex items-center justify-center">
      <Loader2 className="w-6 h-6 animate-spin text-accent" />
    </div>
  ),
});

// Matrix Rain background
const MatrixRain = dynamic(() => import('@/components/MatrixRain'), {
  ssr: false,
});

type ViewMode = 'table' | 'map' | 'split' | 'disasters' | 'analytics';

function Sidebar({
  isOpen,
  setIsOpen,
  userEmail,
  onSignOut,
  activeNav,
  onNavClick,
}: {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  userEmail: string | null;
  onSignOut: () => void;
  activeNav: string;
  onNavClick: (nav: string) => void;
}) {

  const navItems = [
    { icon: BarChart3, label: "Dashboard", id: "dashboard" },
    { icon: AlertTriangle, label: "SOS Signals", id: "table" },
    { icon: Map, label: "Live Map", id: "map" },
    { icon: CloudLightning, label: "Disasters", id: "disasters" },
    { icon: Activity, label: "Analytics", id: "analytics" },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-card border-r border-card-border z-50 transform transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo - Matrix Style */}
          <div className="p-6 border-b border-card-border">
            <div className="flex items-center gap-3">
              <img src="/icon.png" alt="AnchorMesh" className="w-10 h-10 rounded" />
              <div>
                <span className="font-bold text-lg text-foreground glow-text tracking-wider">ANCHOR_MESH</span>
                <p className="text-xs text-muted font-mono">[SYSTEM v2.0]</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onNavClick(item.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-colors ${
                  activeNav === item.id
                    ? "bg-accent/10 text-accent"
                    : "text-muted hover:bg-card-border/50 hover:text-foreground"
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            ))}
          </nav>

          {/* User section - Matrix Style */}
          <div className="p-4 border-t border-card-border">
            <div className="flex items-center gap-3 px-4 py-3 rounded border border-card-border bg-black">
              <div className="w-10 h-10 rounded border border-foreground flex items-center justify-center">
                <Shield className="w-5 h-5 text-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate text-foreground font-mono">OPERATOR</p>
                <p className="text-xs text-muted truncate font-mono">{userEmail || 'UNKNOWN'}</p>
              </div>
            </div>
            <button
              onClick={onSignOut}
              className="w-full flex items-center gap-3 px-4 py-3 mt-2 rounded border border-critical text-sm text-critical hover:bg-critical/10 transition-colors font-mono"
            >
              <LogOut className="w-5 h-5" />
              [DISCONNECT]
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

function StatsCard({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  iconColor,
  index = 0,
}: {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "up" | "down" | "neutral";
  icon: React.ElementType;
  iconColor: string;
  index?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="bg-black border border-card-border rounded p-6 card-hover group cursor-default relative overflow-hidden"
    >
      {/* Matrix data stream effect */}
      <div className="absolute inset-0 data-stream opacity-30" />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded border border-foreground flex items-center justify-center group-hover:glow-effect transition-all duration-300">
            <Icon className="w-6 h-6 text-foreground" />
          </div>
          {change && (
            <div
              className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded border font-mono ${
                changeType === "up"
                  ? "border-foreground text-foreground"
                  : changeType === "down"
                  ? "border-critical text-critical"
                  : "border-muted text-muted"
              }`}
            >
              {changeType === "up" ? (
                <TrendingUp className="w-3 h-3" />
              ) : changeType === "down" ? (
                <TrendingDown className="w-3 h-3" />
              ) : null}
              {change}
            </div>
          )}
        </div>
        <motion.p
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.05 + 0.2, type: "spring", stiffness: 200 }}
          className="text-3xl font-bold mb-1 tracking-tight text-foreground glow-text font-mono"
        >
          {value}
        </motion.p>
        <p className="text-sm text-muted font-mono uppercase tracking-wider">{title}</p>
      </div>
    </motion.div>
  );
}

function SOSTable({ alerts, loading, onAcknowledge, onResolve, onRowClick, totalCount, currentPage, totalPages, onPageChange }: {
  alerts: SOSAlert[];
  loading: boolean;
  onAcknowledge: (id: string) => void;
  onResolve: (id: string) => void;
  onRowClick?: (alert: SOSAlert) => void;
  totalCount?: number;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}) {
  const getStatusColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-critical text-white shadow-lg shadow-critical/30";
      case "high":
        return "bg-warning text-black";
      case "medium":
        return "bg-orange-500 text-white";
      default:
        return "bg-muted text-white";
    }
  };

  const getRowClass = (priority: string) => {
    switch (priority) {
      case "critical":
        return "critical-row priority-critical";
      case "high":
        return "priority-high";
      case "medium":
        return "priority-medium";
      default:
        return "priority-low";
    }
  };

  const formatLocation = (alert: SOSAlert) => {
    const loc = parseLocation(alert.location);
    if (loc) {
      return `${loc.latitude.toFixed(4)}, ${loc.longitude.toFixed(4)}`;
    }
    return "Unknown";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-black border border-card-border rounded overflow-hidden"
    >
      <div className="p-6 border-b border-card-border flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="font-mono text-lg text-foreground glow-text uppercase tracking-wider">&gt; ACTIVE_SOS_SIGNALS</h3>
            {alerts.length > 0 && (
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded border border-critical text-critical text-xs font-mono">
                <span className="w-2 h-2 rounded-full bg-critical animate-pulse" />
                [{alerts.length}] ACTIVE
              </span>
            )}
          </div>
          <p className="text-sm text-muted mt-1 font-mono">// Real-time emergency broadcasts from mesh network</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted px-2 py-1 rounded border border-card-border font-mono">
            [AUTO_REFRESH: ON]
          </span>
        </div>
      </div>

      <div className="overflow-x-auto custom-scrollbar">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="relative">
              <div className="w-16 h-16 border-2 border-card-border rounded" />
              <div className="absolute inset-0 w-16 h-16 border-2 border-foreground border-t-transparent rounded animate-spin" />
            </div>
            <p className="mt-4 text-muted font-mono">LOADING_ALERTS...</p>
          </div>
        ) : alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted">
            <div className="w-20 h-20 rounded border border-foreground flex items-center justify-center mb-4 glow-effect">
              <CheckCircle className="w-10 h-10 text-foreground" />
            </div>
            <p className="text-xl font-mono text-foreground glow-text">[STATUS: ALL_CLEAR]</p>
            <p className="text-sm mt-1 font-mono">// No SOS signals detected in mesh network</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-card-border text-left text-xs text-muted uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Signal ID</th>
                <th className="px-6 py-4 font-semibold">Type</th>
                <th className="px-6 py-4 font-semibold">Location</th>
                <th className="px-6 py-4 font-semibold">Device</th>
                <th className="px-6 py-4 font-semibold">Time</th>
                <th className="px-6 py-4 font-semibold">Hops</th>
                <th className="px-6 py-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((alert, index) => (
                <motion.tr
                  key={alert.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.02 }}
                  onClick={() => onRowClick?.(alert)}
                  className={`border-b border-card-border/50 hover:bg-card-border/30 transition-all duration-200 cursor-pointer ${getRowClass(alert.priority)}`}
                >
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm bg-background px-2 py-1 rounded">{alert.message_id.slice(0, 12)}...</span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${getStatusColor(alert.priority)}`}
                    >
                      {alert.priority === 'critical' && <span className="w-2 h-2 rounded-full bg-white animate-pulse" />}
                      {getEmergencyLabel(alert.emergency_type)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 group">
                      <MapPin className="w-4 h-4 text-accent group-hover:scale-110 transition-transform" />
                      <span className="font-mono text-sm">{formatLocation(alert)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-mono bg-card-border/50 px-2 py-1 rounded">
                      {alert.originator_device_id.slice(0, 8)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-muted">
                      <Clock className="w-4 h-4" />
                      <span className="font-medium">{timeAgo(alert.originated_at)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <Signal className="w-4 h-4 text-accent" />
                      <span className="text-sm font-semibold">{alert.hop_count}</span>
                      {alert.delivered_via === 'mesh_relay' && (
                        <span className="ml-1 text-xs px-1.5 py-0.5 rounded bg-accent/10 text-accent">relay</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {alert.status === 'active' && (
                        <button
                          onClick={() => onAcknowledge(alert.id)}
                          className="px-4 py-2 rounded-lg bg-accent text-white text-xs font-semibold hover:bg-accent/90 transition-all hover:shadow-lg hover:shadow-accent/30 btn-glow"
                        >
                          Acknowledge
                        </button>
                      )}
                      {alert.status === 'acknowledged' && (
                        <button
                          onClick={() => onResolve(alert.id)}
                          className="px-4 py-2 rounded-lg bg-safe text-white text-xs font-semibold hover:bg-safe/90 transition-all hover:shadow-lg hover:shadow-safe/30 btn-glow"
                        >
                          Resolve
                        </button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="p-4 border-t border-card-border flex items-center justify-between bg-black">
        <p className="text-sm text-muted font-mono">
          {loading ? '> LOADING...' : alerts.length === 0 ? '> NO_ACTIVE_SIGNALS' : `> ${totalCount || alerts.length} ACTIVE_SIGNAL${(totalCount || alerts.length) === 1 ? '' : 'S'}`}
        </p>
        {totalPages && totalPages > 1 && onPageChange && currentPage && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="px-2 py-1 rounded border border-card-border text-xs font-mono text-muted hover:text-foreground hover:border-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              PREV
            </button>
            <span className="text-xs font-mono text-muted">
              [{currentPage}/{totalPages}]
            </span>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="px-2 py-1 rounded border border-card-border text-xs font-mono text-muted hover:text-foreground hover:border-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              NEXT
            </button>
          </div>
        )}
        <div className="flex items-center gap-2 text-xs text-foreground font-mono">
          <span className="w-2 h-2 rounded-full bg-foreground animate-pulse" />
          [LIVE_STREAM: ACTIVE]
        </div>
      </div>
    </motion.div>
  );
}

function ActivityFeed({ alerts }: { alerts: SOSAlert[] }) {
  const getActivityIcon = (status: string, priority: string) => {
    if (status === 'resolved') {
      return <CheckCircle className="w-4 h-4 text-safe" />;
    }
    if (status === 'acknowledged') {
      return <Activity className="w-4 h-4 text-warning" />;
    }
    if (priority === 'critical') {
      return <AlertTriangle className="w-4 h-4 text-critical" />;
    }
    return <AlertCircle className="w-4 h-4 text-warning" />;
  };

  const getIconBg = (status: string, priority: string) => {
    if (status === 'resolved') return 'bg-safe/10';
    if (status === 'acknowledged') return 'bg-warning/10';
    if (priority === 'critical') return 'bg-critical/10';
    return 'bg-warning/10';
  };

  const getActivityMessage = (alert: SOSAlert) => {
    const type = getEmergencyLabel(alert.emergency_type);
    const deviceId = alert.originator_device_id.slice(0, 8);
    if (alert.status === 'resolved') {
      return `${type} alert from ${deviceId} resolved`;
    }
    if (alert.status === 'acknowledged') {
      return `${type} alert from ${deviceId} acknowledged`;
    }
    if (alert.delivered_via === 'mesh_relay') {
      return `${type} alert relayed (${alert.hop_count} hops) from ${deviceId}`;
    }
    return `New ${type} alert received from device ${deviceId}`;
  };

  // Sort alerts by received_at to show most recent first
  const recentAlerts = [...alerts]
    .sort((a, b) => new Date(b.received_at).getTime() - new Date(a.received_at).getTime())
    .slice(0, 10);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-black border border-card-border rounded"
    >
      <div className="p-6 border-b border-card-border">
        <div className="flex items-center gap-2">
          <h3 className="font-mono text-lg text-foreground glow-text uppercase tracking-wider">&gt; ACTIVITY_LOG</h3>
          <span className="flex items-center gap-1 text-xs text-foreground font-mono">
            <span className="w-2 h-2 rounded-full bg-foreground animate-pulse" />
            [LIVE]
          </span>
        </div>
        <p className="text-sm text-muted mt-1 font-mono">// Latest alerts from mesh network</p>
      </div>

      <div className="p-4 space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar">
        {recentAlerts.length === 0 ? (
          <div className="text-center py-12 text-muted">
            <div className="w-16 h-16 rounded border border-card-border flex items-center justify-center mx-auto mb-4">
              <Activity className="w-8 h-8 text-muted" />
            </div>
            <p className="font-mono text-foreground">[NO_RECENT_ACTIVITY]</p>
            <p className="text-xs mt-1 font-mono">// Awaiting real-time data stream...</p>
          </div>
        ) : (
          recentAlerts.map((alert, index) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03 }}
              className="flex items-start gap-3 p-3 rounded-xl hover:bg-card-border/30 transition-all cursor-pointer group"
            >
              <div className={`w-9 h-9 rounded-xl ${getIconBg(alert.status, alert.priority)} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                {getActivityIcon(alert.status, alert.priority)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium leading-tight">{getActivityMessage(alert)}</p>
                <p className="text-xs text-muted mt-1.5">{timeAgo(alert.received_at)}</p>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <div className="p-4 border-t border-card-border">
        <div className="flex items-center justify-center gap-2 text-xs text-foreground font-mono">
          <span className="w-2 h-2 rounded-full bg-foreground animate-pulse" />
          [REALTIME_STREAM: CONNECTED]
        </div>
      </div>
    </motion.div>
  );
}

function NetworkZones({ stats, alerts }: { stats: AlertStats | null; alerts: SOSAlert[] }) {
  // Generate zone data from alerts by emergency type
  const alertsByType = stats?.alerts_by_type || {};
  const alertsByPriority = stats?.alerts_by_priority || {};

  const zones = [
    {
      zone: "Medical Emergencies",
      count: alertsByType['medical'] || 0,
      status: (alertsByType['medical'] || 0) > 0 ? "active" : "clear",
      color: "bg-critical",
    },
    {
      zone: "Natural Disasters",
      count: alertsByType['natural_disaster'] || 0,
      status: (alertsByType['natural_disaster'] || 0) > 0 ? "active" : "clear",
      color: "bg-warning",
    },
    {
      zone: "Critical Priority",
      count: alertsByPriority['critical'] || 0,
      status: (alertsByPriority['critical'] || 0) > 0 ? "active" : "clear",
      color: "bg-critical",
    },
    {
      zone: "High Priority",
      count: alertsByPriority['high'] || 0,
      status: (alertsByPriority['high'] || 0) > 0 ? "warning" : "clear",
      color: "bg-warning",
    },
    {
      zone: "Other Alerts",
      count: alertsByType['other'] || 0,
      status: (alertsByType['other'] || 0) > 0 ? "active" : "clear",
      color: "bg-accent",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-black border border-card-border rounded"
    >
      <div className="p-6 border-b border-card-border">
        <h3 className="font-mono text-foreground glow-text uppercase tracking-wider">&gt; ALERT_CATEGORIES</h3>
        <p className="text-sm text-muted font-mono">// Breakdown by type and priority</p>
      </div>

      <div className="p-4 space-y-3">
        {zones.map((zone) => (
          <div
            key={zone.zone}
            className="flex items-center justify-between p-4 rounded border border-card-border bg-black hover:border-foreground transition-colors"
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-3 h-3 rounded-full ${
                  zone.status === "active" ? "bg-critical" : zone.status === "warning" ? "bg-foreground" : "bg-muted"
                }`}
              />
              <div>
                <p className="font-mono text-sm text-foreground uppercase">{zone.zone.replace(/ /g, '_')}</p>
                <p className="text-xs text-muted font-mono">[{zone.status.toUpperCase()}]</p>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-sm font-mono ${zone.count > 0 ? 'text-critical' : 'text-muted'}`}>
                [{zone.count}] ALERTS
              </p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function SystemHealth({ stats, alertsLoading, devices }: { stats: AlertStats | null; alertsLoading: boolean; devices: { id: string }[] }) {
  const isConnected = !alertsLoading && stats !== null;
  const activeDevices = stats?.active_devices || 0;
  const totalDevices = stats?.total_devices || 0;

  const metrics = [
    {
      label: "Supabase",
      value: isConnected ? "Connected" : "Connecting...",
      healthy: isConnected
    },
    {
      label: "Realtime",
      value: isConnected ? "Active" : "Waiting...",
      healthy: isConnected
    },
    {
      label: "Active Devices",
      value: `${activeDevices}/${totalDevices}`,
      healthy: activeDevices > 0
    },
    {
      label: "Mesh Network",
      value: devices.length > 0 ? "Online" : "Standby",
      healthy: devices.length > 0
    },
  ];

  const allHealthy = metrics.every(m => m.healthy);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="bg-black border border-card-border rounded p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-mono text-foreground glow-text uppercase tracking-wider">&gt; SYSTEM_STATUS</h3>
          <p className="text-sm text-muted font-mono">{allHealthy ? "// All systems operational" : "// Establishing connections..."}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${allHealthy ? 'bg-foreground' : 'bg-critical'} animate-pulse`} />
          <span className={`text-xs ${allHealthy ? 'text-foreground' : 'text-critical'} font-mono`}>
            [{allHealthy ? "HEALTHY" : "CONNECTING"}]
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="p-3 rounded border border-card-border bg-black hover:border-foreground transition-colors"
          >
            <p className="text-xs text-muted mb-1 font-mono uppercase">{metric.label.replace(/ /g, '_')}</p>
            <div className="flex items-center gap-2">
              {metric.healthy ? (
                <CheckCircle className="w-4 h-4 text-foreground" />
              ) : (
                <AlertCircle className="w-4 h-4 text-critical" />
              )}
              <span className="text-sm font-mono text-foreground">{metric.value}</span>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// Demo Mode Banner Component
function DemoModeBanner({
  scenario,
  onScenarioChange,
  onReset,
  isSimulating,
  onToggleSimulation,
}: {
  scenario: DisasterScenario;
  onScenarioChange: (s: DisasterScenario) => void;
  onReset: () => void;
  isSimulating: boolean;
  onToggleSimulation: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const scenarioInfo = DISASTER_SCENARIOS[scenario];

  return (
    <div className="bg-gradient-to-r from-accent/20 via-accent/10 to-accent/20 border-b border-accent/30">
      <div className="px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-accent" />
            <span className="text-sm font-mono text-accent">[DEMO_MODE]</span>
          </div>
          <div className="relative">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded border border-accent/50 bg-black/50 hover:border-accent transition-colors"
            >
              <span className="text-sm font-mono text-foreground">{scenarioInfo.name}</span>
              <ChevronDown className={`w-4 h-4 text-accent transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
              <div className="absolute top-full left-0 mt-2 w-72 bg-black border border-card-border rounded shadow-xl z-50">
                {(Object.keys(DISASTER_SCENARIOS) as DisasterScenario[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => { onScenarioChange(s); setIsOpen(false); }}
                    className={`w-full text-left px-4 py-3 hover:bg-card-border/50 transition-colors ${scenario === s ? 'bg-accent/10 border-l-2 border-accent' : ''}`}
                  >
                    <p className="font-mono text-sm text-foreground">{DISASTER_SCENARIOS[s].name}</p>
                    <p className="text-xs text-muted mt-1 line-clamp-2">{DISASTER_SCENARIOS[s].description}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSimulation}
            className={`flex items-center gap-2 px-3 py-1.5 rounded border transition-colors ${
              isSimulating
                ? 'border-safe/50 text-safe hover:bg-safe/10'
                : 'border-muted text-muted hover:border-foreground hover:text-foreground'
            }`}
          >
            {isSimulating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span className="text-xs font-mono">{isSimulating ? 'LIVE' : 'PAUSED'}</span>
          </button>
          <button
            onClick={onReset}
            className="flex items-center gap-2 px-3 py-1.5 rounded border border-muted text-muted hover:border-foreground hover:text-foreground transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="text-xs font-mono">RESET</span>
          </button>
        </div>
      </div>
      <div className="px-6 pb-2">
        <p className="text-xs text-muted font-mono">{scenarioInfo.description}</p>
      </div>
    </div>
  );
}

// Settings Modal Component
function SettingsModal({
  isOpen,
  onClose,
  isDemoMode,
  onToggleDemo,
  isMuted,
  onToggleMute,
}: {
  isOpen: boolean;
  onClose: () => void;
  isDemoMode: boolean;
  onToggleDemo: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-black border border-card-border rounded-lg w-full max-w-md"
      >
        <div className="p-6 border-b border-card-border flex items-center justify-between">
          <h2 className="font-mono text-lg text-foreground glow-text">&gt; SETTINGS</h2>
          <button onClick={onClose} className="p-2 rounded hover:bg-card-border/50 transition-colors">
            <X className="w-5 h-5 text-muted" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Demo Mode Toggle */}
          <div className="flex items-center justify-between p-4 rounded border border-card-border">
            <div>
              <p className="font-mono text-sm text-foreground">Demo Mode</p>
              <p className="text-xs text-muted mt-1">Show simulated disaster data</p>
            </div>
            <button
              onClick={onToggleDemo}
              className={`w-12 h-6 rounded-full transition-colors relative ${isDemoMode ? 'bg-accent' : 'bg-card-border'}`}
            >
              <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${isDemoMode ? 'left-7' : 'left-1'}`} />
            </button>
          </div>

          {/* Sound Toggle */}
          <div className="flex items-center justify-between p-4 rounded border border-card-border">
            <div>
              <p className="font-mono text-sm text-foreground">Alert Sounds</p>
              <p className="text-xs text-muted mt-1">Play audio for new alerts</p>
            </div>
            <button
              onClick={onToggleMute}
              className={`w-12 h-6 rounded-full transition-colors relative ${!isMuted ? 'bg-accent' : 'bg-card-border'}`}
            >
              <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${!isMuted ? 'left-7' : 'left-1'}`} />
            </button>
          </div>

          {/* System Info */}
          <div className="p-4 rounded border border-card-border space-y-2">
            <p className="font-mono text-sm text-foreground mb-3">System Info</p>
            <div className="flex justify-between text-xs">
              <span className="text-muted">Version</span>
              <span className="font-mono text-foreground">2.0.0</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted">Mode</span>
              <span className="font-mono text-foreground">{isDemoMode ? 'Demo' : 'Live'}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted">Connection</span>
              <span className="font-mono text-safe">Connected</span>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-card-border">
          <button
            onClick={onClose}
            className="w-full py-2 rounded border border-card-border hover:border-foreground text-foreground font-mono transition-colors"
          >
            [CLOSE]
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// Alert Details Modal Component
function AlertDetailsModal({
  alert,
  onClose,
  onAcknowledge,
  onResolve,
}: {
  alert: SOSAlert | null;
  onClose: () => void;
  onAcknowledge: (id: string) => void;
  onResolve: (id: string) => void;
}) {
  if (!alert) return null;

  const location = parseLocation(alert.location);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-black border border-card-border rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-card-border flex items-center justify-between sticky top-0 bg-black z-10">
          <div>
            <h2 className="font-mono text-lg text-foreground glow-text">&gt; ALERT_DETAILS</h2>
            <p className="text-xs text-muted font-mono mt-1">{alert.message_id}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded hover:bg-card-border/50 transition-colors">
            <X className="w-5 h-5 text-muted" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status Badge */}
          <div className="flex items-center gap-4">
            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
              alert.priority === 'critical' ? 'bg-critical text-white' :
              alert.priority === 'high' ? 'bg-warning text-black' :
              'bg-muted text-white'
            }`}>
              {alert.priority.toUpperCase()} - {getEmergencyLabel(alert.emergency_type)}
            </span>
            <span className={`px-3 py-1 rounded border text-xs font-mono ${
              alert.status === 'active' ? 'border-critical text-critical' :
              alert.status === 'acknowledged' ? 'border-warning text-warning' :
              'border-safe text-safe'
            }`}>
              {alert.status.toUpperCase()}
            </span>
          </div>

          {/* Message */}
          {alert.message && (
            <div className="p-4 rounded border border-card-border bg-card">
              <p className="text-sm text-muted mb-1 font-mono">MESSAGE:</p>
              <p className="text-foreground">{alert.message}</p>
            </div>
          )}

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded border border-card-border">
              <p className="text-xs text-muted font-mono mb-1">LOCATION</p>
              <p className="font-mono text-foreground">
                {location ? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}` : 'Unknown'}
              </p>
              {alert.location_accuracy && (
                <p className="text-xs text-muted mt-1">Accuracy: {alert.location_accuracy}m</p>
              )}
            </div>
            <div className="p-4 rounded border border-card-border">
              <p className="text-xs text-muted font-mono mb-1">DEVICE</p>
              <p className="font-mono text-foreground">{alert.originator_device_id}</p>
            </div>
            <div className="p-4 rounded border border-card-border">
              <p className="text-xs text-muted font-mono mb-1">RECEIVED</p>
              <p className="font-mono text-foreground">{timeAgo(alert.received_at)}</p>
              <p className="text-xs text-muted mt-1">{new Date(alert.received_at).toLocaleString()}</p>
            </div>
            <div className="p-4 rounded border border-card-border">
              <p className="text-xs text-muted font-mono mb-1">DELIVERY</p>
              <p className="font-mono text-foreground">
                {alert.delivered_via === 'mesh_relay' ? `Mesh Relay (${alert.hop_count} hops)` : 'Direct'}
              </p>
            </div>
          </div>

          {/* Relay Chain */}
          {alert.relay_chain && alert.relay_chain.length > 0 && (
            <div className="p-4 rounded border border-card-border">
              <p className="text-sm text-muted font-mono mb-3">RELAY_CHAIN:</p>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-1 rounded bg-accent/20 text-accent text-xs font-mono">
                  {alert.originator_device_id.slice(0, 8)}
                </span>
                {alert.relay_chain.map((relay, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-muted">→</span>
                    <span className={`px-2 py-1 rounded text-xs font-mono ${
                      relay.had_internet ? 'bg-safe/20 text-safe' : 'bg-card-border text-foreground'
                    }`}>
                      {relay.device_id.slice(0, 8)}
                      {relay.had_internet && ' (internet)'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Resolution Notes */}
          {alert.verification_notes && (
            <div className="p-4 rounded border border-safe/30 bg-safe/10">
              <p className="text-xs text-safe font-mono mb-1">RESOLUTION_NOTES:</p>
              <p className="text-foreground">{alert.verification_notes}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-card-border flex items-center gap-4">
          {alert.status === 'active' && (
            <button
              onClick={() => { onAcknowledge(alert.id); onClose(); }}
              className="flex-1 py-3 rounded bg-accent text-white font-mono hover:bg-accent/90 transition-colors"
            >
              [ACKNOWLEDGE]
            </button>
          )}
          {alert.status === 'acknowledged' && (
            <button
              onClick={() => { onResolve(alert.id); onClose(); }}
              className="flex-1 py-3 rounded bg-safe text-white font-mono hover:bg-safe/90 transition-colors"
            >
              [RESOLVE]
            </button>
          )}
          <button
            onClick={onClose}
            className="px-6 py-3 rounded border border-card-border text-foreground font-mono hover:border-foreground transition-colors"
          >
            [CLOSE]
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);
  const [activeNav, setActiveNav] = useState('dashboard');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [detailsAlert, setDetailsAlert] = useState<SOSAlert | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const alertsPerPage = 25;

  // Handle sidebar navigation
  const handleNavClick = (navId: string) => {
    setActiveNav(navId);
    if (navId === 'table' || navId === 'alerts') {
      setViewMode('table');
    } else if (navId === 'map') {
      setViewMode('map');
    } else if (navId === 'dashboard') {
      setViewMode('split');
    } else if (navId === 'disasters') {
      setViewMode('disasters');
    } else if (navId === 'analytics') {
      setViewMode('analytics');
    }
  };

  // Auth hook - redirects to login if not authenticated
  const { user, loading: authLoading, signOut } = useRequireAuth();

  // Demo mode context
  const demo = useDemo();

  // Unified hooks that work with both demo and real data
  const { alerts, loading: alertsLoading, refresh: refreshAlerts } = useUnifiedAlerts();
  const { stats, loading: statsLoading, refresh: refreshStats } = useUnifiedStats();
  const { devices } = useUnifiedDevices();
  const { allAlerts } = useAllAlerts();
  const { acknowledgeAlert, resolveAlert } = useAlertActions();

  // Live simulation for demo mode
  const { isRunning: isSimulating, toggle: toggleSimulation } = useLiveSimulation();

  // Alert sound notifications
  const { isMuted, toggleMute, isSupported: soundSupported } = useAlertSoundNotifications(
    alerts,
    { enabled: true, volume: 0.5 }
  );

  // Filter alerts by search
  const filteredAlerts = alerts.filter(alert => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      alert.message_id.toLowerCase().includes(query) ||
      alert.originator_device_id.toLowerCase().includes(query) ||
      alert.emergency_type.toLowerCase().includes(query) ||
      (alert.message && alert.message.toLowerCase().includes(query))
    );
  });

  // Pagination
  const totalPages = Math.ceil(filteredAlerts.length / alertsPerPage);
  const paginatedAlerts = filteredAlerts.slice(
    (currentPage - 1) * alertsPerPage,
    currentPage * alertsPerPage
  );

  // Handle alert actions
  const handleAcknowledge = async (alertId: string) => {
    try {
      await acknowledgeAlert(alertId, user?.id || 'admin');
      if (!demo.isDemoMode) refreshAlerts();
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
    }
  };

  const handleResolve = async (alertId: string) => {
    try {
      await resolveAlert(alertId, 'Resolved by admin');
      if (!demo.isDemoMode) refreshAlerts();
    } catch (error) {
      console.error('Failed to resolve alert:', error);
    }
  };

  const handleRefresh = () => {
    if (demo.isDemoMode) {
      demo.resetDemo();
    } else {
      refreshAlerts();
      refreshStats();
    }
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-foreground/30 border-t-foreground rounded animate-spin" />
          <p className="text-foreground font-mono glow-text">INITIALIZING_SYSTEM...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative">
      {/* Matrix Rain Background */}
      <MatrixRain />

      <Sidebar
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        userEmail={user?.email || null}
        onSignOut={signOut}
        activeNav={activeNav}
        onNavClick={handleNavClick}
      />

      {/* Main content */}
      <main className="lg:ml-64 relative z-10">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-black/90 backdrop-blur-xl border-b border-card-border">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded border border-card-border hover:border-foreground lg:hidden transition-colors"
              >
                <Menu className="w-5 h-5 text-foreground" />
              </button>
              <div>
                <h1 className="text-xl font-mono text-foreground glow-text uppercase tracking-wider">&gt; COMMAND_CENTER</h1>
                <p className="text-sm text-muted font-mono">// OPERATOR: {user?.email ? user.email.split('@')[0].toUpperCase() : 'UNKNOWN'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* View mode toggle */}
              <div className="hidden sm:flex items-center bg-black border border-card-border rounded p-1">
                <button
                  onClick={() => { setViewMode('table'); setActiveNav('table'); }}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'table' ? 'border border-foreground text-foreground' : 'text-muted hover:text-foreground'
                  }`}
                  title="Table view"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => { setViewMode('map'); setActiveNav('map'); }}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'map' ? 'border border-foreground text-foreground' : 'text-muted hover:text-foreground'
                  }`}
                  title="Map view"
                >
                  <MapIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => { setViewMode('split'); setActiveNav('dashboard'); }}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'split' ? 'border border-foreground text-foreground' : 'text-muted hover:text-foreground'
                  }`}
                  title="Split view"
                >
                  <Split className="w-4 h-4" />
                </button>
              </div>

              {/* Sound toggle button */}
              {soundSupported && (
                <button
                  onClick={toggleMute}
                  className={`p-2 rounded border border-card-border hover:border-foreground transition-colors ${isMuted ? 'text-muted' : 'text-foreground'}`}
                  title={isMuted ? 'Unmute alerts' : 'Mute alerts'}
                >
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
              )}

              <button
                onClick={handleRefresh}
                className="p-2 rounded border border-card-border hover:border-foreground transition-colors relative"
                title={alerts.length > 0 ? `${alerts.length} active alerts - Click to refresh` : 'No active alerts'}
              >
                <Bell className="w-5 h-5 text-foreground" />
                {alerts.length > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-critical rounded-full animate-pulse" />
                )}
              </button>
              <button
                onClick={handleRefresh}
                className="flex items-center gap-2 px-3 py-2 rounded border border-card-border bg-black hover:border-foreground transition-colors font-mono text-foreground"
              >
                <RefreshCw className={`w-4 h-4 ${alertsLoading ? 'animate-spin' : ''}`} />
                <span className="text-sm hidden sm:inline">[SYNC]</span>
              </button>
              <button
                onClick={() => setSettingsOpen(true)}
                className="p-2 rounded border border-card-border hover:border-foreground transition-colors"
                title="Settings"
              >
                <Settings className="w-5 h-5 text-foreground" />
              </button>
            </div>
          </div>

          {/* Demo Mode Banner */}
          {demo.isDemoMode && (
            <DemoModeBanner
              scenario={demo.scenario}
              onScenarioChange={demo.setScenario}
              onReset={demo.resetDemo}
              isSimulating={isSimulating}
              onToggleSimulation={toggleSimulation}
            />
          )}

          {/* Alert Banner - only show if there are critical alerts */}
          {alerts.some(a => a.priority === 'critical' && a.status === 'active') && (
            <div className="px-6 pb-4">
              <div className="flex items-center gap-3 p-3 rounded border border-critical bg-black critical-row">
                <Zap className="w-5 h-5 text-critical" />
                <div className="flex-1">
                  <p className="text-sm font-mono text-critical">!!! CRITICAL_ALERT_ACTIVE !!!</p>
                  <p className="text-xs text-muted font-mono">
                    [{alerts.filter(a => a.priority === 'critical' && a.status === 'active').length}] CRITICAL EMERGENCY SIGNAL(S) REQUIRE IMMEDIATE ATTENTION
                  </p>
                </div>
                <button
                  onClick={() => { setViewMode('table'); setActiveNav('table'); }}
                  className="text-xs text-critical font-mono border border-critical px-2 py-1 rounded hover:bg-critical/20 transition-colors"
                >
                  [VIEW_ALERTS]
                </button>
              </div>
            </div>
          )}
        </header>

        {/* Dashboard content */}
        <div className="p-6 space-y-6">
          {/* Stats grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <StatsCard
              title="Active Nodes"
              value={statsLoading ? '...' : (stats?.active_devices || devices.length).toLocaleString()}
              change={devices.length > 0 ? "Online" : undefined}
              changeType="up"
              icon={Smartphone}
              iconColor="bg-gradient-to-br from-accent to-blue-600"
              index={0}
            />
            <StatsCard
              title="Active SOS"
              value={statsLoading ? '...' : (stats?.active_count || alerts.length)}
              change={alerts.length > 0 ? `${alerts.length} active` : "Clear"}
              changeType={alerts.length > 0 ? "up" : "neutral"}
              icon={AlertTriangle}
              iconColor="bg-gradient-to-br from-critical to-red-600"
              index={1}
            />
            <StatsCard
              title="Acknowledged"
              value={statsLoading ? '...' : (stats?.acknowledged_count || 0)}
              change="Responding"
              changeType="neutral"
              icon={Signal}
              iconColor="bg-gradient-to-br from-warning to-amber-600"
              index={2}
            />
            <StatsCard
              title="Resolved Today"
              value={statsLoading ? '...' : (stats?.resolved_today || 0)}
              change="Rescued"
              changeType="up"
              icon={CheckCircle}
              iconColor="bg-gradient-to-br from-safe to-emerald-600"
              index={3}
            />
            <StatsCard
              title="Total Devices"
              value={statsLoading ? '...' : (stats?.total_devices || 0).toLocaleString()}
              change="Registered"
              changeType="neutral"
              icon={Globe}
              iconColor="bg-gradient-to-br from-purple-500 to-violet-600"
              index={4}
            />
            <StatsCard
              title="Network"
              value={devices.length > 0 ? "Online" : "Standby"}
              change={devices.length > 0 ? "Active" : "Ready"}
              changeType={devices.length > 0 ? "up" : "neutral"}
              icon={Battery}
              iconColor="bg-gradient-to-br from-safe to-teal-600"
              index={5}
            />
          </div>

          {/* Main content grid - changes based on view mode */}
          {viewMode === 'table' && (
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                {/* Search Bar */}
                <div className="mb-4 flex items-center gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                      placeholder="Search alerts by ID, device, type..."
                      className="w-full pl-10 pr-4 py-2 rounded border border-card-border bg-black text-foreground font-mono text-sm placeholder:text-muted focus:border-accent focus:outline-none transition-colors"
                    />
                  </div>
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="px-3 py-2 rounded border border-card-border text-muted hover:text-foreground hover:border-foreground transition-colors text-sm font-mono"
                    >
                      [CLEAR]
                    </button>
                  )}
                </div>
                <SOSTable
                  alerts={paginatedAlerts}
                  loading={alertsLoading}
                  onAcknowledge={handleAcknowledge}
                  onResolve={handleResolve}
                  onRowClick={setDetailsAlert}
                  totalCount={filteredAlerts.length}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
              <div className="space-y-6">
                <ActivityFeed alerts={alerts} />
              </div>
            </div>
          )}

          {viewMode === 'map' && (
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <AlertMap
                  alerts={alerts}
                  selectedAlertId={selectedAlertId}
                  onAlertClick={(alert) => { setSelectedAlertId(alert.id); setDetailsAlert(alert); }}
                  className="h-[600px]"
                />
              </div>
              <div className="space-y-6">
                <ActivityFeed alerts={alerts} />
              </div>
            </div>
          )}

          {viewMode === 'split' && (
            <div className="space-y-6">
              {/* Map on top */}
              <AlertMap
                alerts={alerts}
                selectedAlertId={selectedAlertId}
                onAlertClick={(alert) => { setSelectedAlertId(alert.id); setDetailsAlert(alert); }}
                className="h-[400px]"
              />
              {/* Table below */}
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <SOSTable
                    alerts={paginatedAlerts}
                    loading={alertsLoading}
                    onAcknowledge={handleAcknowledge}
                    onResolve={handleResolve}
                    onRowClick={setDetailsAlert}
                    totalCount={filteredAlerts.length}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>
                <div className="space-y-6">
                  <ActivityFeed alerts={alerts} />
                </div>
              </div>
            </div>
          )}

          {viewMode === 'disasters' && (
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <DisasterFeed maxItems={20} showStats={true} />
              </div>
              <div className="space-y-6">
                <ActivityFeed alerts={alerts} />
                <SystemHealth stats={stats} alertsLoading={alertsLoading} devices={devices} />
              </div>
            </div>
          )}

          {viewMode === 'analytics' && (
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <AnalyticsDashboard alerts={demo.isDemoMode ? allAlerts : alerts} stats={stats} />
              </div>
              <div className="space-y-6">
                <NetworkZones stats={stats} alerts={alerts} />
                <ActivityFeed alerts={alerts} />
              </div>
            </div>
          )}

          {/* Bottom grid */}
          <div className="grid md:grid-cols-2 gap-6">
            <NetworkZones stats={stats} alerts={alerts} />
            <SystemHealth stats={stats} alertsLoading={alertsLoading} devices={devices} />
          </div>
        </div>
      </main>

      {/* Modals */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        isDemoMode={demo.isDemoMode}
        onToggleDemo={demo.toggleDemoMode}
        isMuted={isMuted}
        onToggleMute={toggleMute}
      />

      <AlertDetailsModal
        alert={detailsAlert}
        onClose={() => setDetailsAlert(null)}
        onAcknowledge={handleAcknowledge}
        onResolve={handleResolve}
      />
    </div>
  );
}

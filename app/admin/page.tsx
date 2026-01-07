"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Radio,
  Users,
  AlertTriangle,
  Activity,
  MapPin,
  Signal,
  Battery,
  Wifi,
  WifiOff,
  Clock,
  TrendingUp,
  TrendingDown,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  RefreshCw,
  Shield,
  Smartphone,
  Globe,
  Zap,
  CheckCircle,
  AlertCircle,
  Heart,
  Map,
  BarChart3,
  PieChart,
  Download,
  Filter,
} from "lucide-react";

// Mock data for the dashboard
const mockStats = {
  activeNodes: 12847,
  activeSOSSignals: 23,
  messagesRelayed: 458920,
  avgResponseTime: "4.2 min",
  networkCoverage: "94.7%",
  batteryEfficiency: "98.2%",
};

const mockSOSSignals = [
  { id: "SOS-001", status: "critical", location: "34.0522, -118.2437", user: "User #8734", time: "2 min ago", hops: 3 },
  { id: "SOS-002", status: "critical", location: "34.0195, -118.4912", user: "User #2391", time: "5 min ago", hops: 7 },
  { id: "SOS-003", status: "injured", location: "34.0689, -118.4452", user: "User #5672", time: "8 min ago", hops: 2 },
  { id: "SOS-004", status: "injured", location: "33.9425, -118.4081", user: "User #9103", time: "12 min ago", hops: 5 },
  { id: "SOS-005", status: "critical", location: "34.1478, -118.1445", user: "User #4456", time: "15 min ago", hops: 11 },
];

const mockRecentActivity = [
  { type: "sos_received", message: "New SOS signal received from Zone A-7", time: "1 min ago" },
  { type: "node_joined", message: "847 new nodes joined the mesh network", time: "3 min ago" },
  { type: "sos_resolved", message: "SOS #4521 marked as rescued", time: "7 min ago" },
  { type: "alert", message: "High traffic detected in Zone B-3", time: "12 min ago" },
  { type: "system", message: "DEFCON level changed to 3 for LA County", time: "18 min ago" },
  { type: "sos_received", message: "New SOS signal received from Zone C-2", time: "23 min ago" },
];

const mockZoneData = [
  { zone: "Zone A", nodes: 3421, sos: 8, status: "active" },
  { zone: "Zone B", nodes: 2847, sos: 5, status: "active" },
  { zone: "Zone C", nodes: 1923, sos: 3, status: "warning" },
  { zone: "Zone D", nodes: 2156, sos: 4, status: "active" },
  { zone: "Zone E", nodes: 2500, sos: 3, status: "active" },
];

function Sidebar({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: (open: boolean) => void }) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("aether_admin_auth");
    router.push("/admin/login");
  };

  const navItems = [
    { icon: BarChart3, label: "Dashboard", active: true },
    { icon: AlertTriangle, label: "SOS Signals", active: false },
    { icon: Map, label: "Live Map", active: false },
    { icon: Users, label: "Network Nodes", active: false },
    { icon: Activity, label: "Analytics", active: false },
    { icon: Bell, label: "Alerts", active: false },
    { icon: Settings, label: "Settings", active: false },
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
          {/* Logo */}
          <div className="p-6 border-b border-card-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-critical via-warning to-safe flex items-center justify-center">
                <Radio className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-bold text-lg">Aether SOS</span>
                <p className="text-xs text-muted">Admin Panel</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.label}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-colors ${
                  item.active
                    ? "bg-accent/10 text-accent"
                    : "text-muted hover:bg-card-border/50 hover:text-foreground"
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            ))}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-card-border">
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-background">
              <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                <Shield className="w-5 h-5 text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">Admin</p>
                <p className="text-xs text-muted truncate">admin@aethersos.com</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 mt-2 rounded-xl text-sm text-critical hover:bg-critical/10 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
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
}: {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "up" | "down" | "neutral";
  icon: React.ElementType;
  iconColor: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-card-border rounded-2xl p-6"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl ${iconColor} flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {change && (
          <div
            className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
              changeType === "up"
                ? "bg-safe/20 text-safe"
                : changeType === "down"
                ? "bg-critical/20 text-critical"
                : "bg-muted/20 text-muted"
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
      <p className="text-2xl font-bold mb-1">{value}</p>
      <p className="text-sm text-muted">{title}</p>
    </motion.div>
  );
}

function SOSTable() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "critical":
        return "bg-critical text-white";
      case "injured":
        return "bg-warning text-black";
      default:
        return "bg-muted text-white";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-card border border-card-border rounded-2xl overflow-hidden"
    >
      <div className="p-6 border-b border-card-border flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Active SOS Signals</h3>
          <p className="text-sm text-muted">Real-time emergency broadcasts</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-lg hover:bg-card-border/50 transition-colors">
            <Filter className="w-4 h-4 text-muted" />
          </button>
          <button className="p-2 rounded-lg hover:bg-card-border/50 transition-colors">
            <Download className="w-4 h-4 text-muted" />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-card-border text-left text-sm text-muted">
              <th className="px-6 py-4 font-medium">Signal ID</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Location</th>
              <th className="px-6 py-4 font-medium">User</th>
              <th className="px-6 py-4 font-medium">Time</th>
              <th className="px-6 py-4 font-medium">Hops</th>
              <th className="px-6 py-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {mockSOSSignals.map((signal, index) => (
              <tr
                key={signal.id}
                className="border-b border-card-border/50 hover:bg-card-border/20 transition-colors"
              >
                <td className="px-6 py-4">
                  <span className="font-mono text-sm">{signal.id}</span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(
                      signal.status
                    )}`}
                  >
                    {signal.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted" />
                    <span className="font-mono text-sm">{signal.location}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm">{signal.user}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-sm text-muted">
                    <Clock className="w-4 h-4" />
                    {signal.time}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1">
                    <Signal className="w-4 h-4 text-accent" />
                    <span className="text-sm">{signal.hops}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <button className="px-3 py-1.5 rounded-lg bg-accent/10 text-accent text-xs font-medium hover:bg-accent/20 transition-colors">
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-4 border-t border-card-border flex items-center justify-between">
        <p className="text-sm text-muted">Showing 5 of 23 active signals</p>
        <button className="text-sm text-accent hover:underline flex items-center gap-1">
          View all signals <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}

function ActivityFeed() {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "sos_received":
        return <AlertTriangle className="w-4 h-4 text-critical" />;
      case "sos_resolved":
        return <CheckCircle className="w-4 h-4 text-safe" />;
      case "node_joined":
        return <Users className="w-4 h-4 text-accent" />;
      case "alert":
        return <AlertCircle className="w-4 h-4 text-warning" />;
      default:
        return <Activity className="w-4 h-4 text-muted" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-card border border-card-border rounded-2xl"
    >
      <div className="p-6 border-b border-card-border">
        <h3 className="font-semibold">Recent Activity</h3>
        <p className="text-sm text-muted">Latest network events</p>
      </div>

      <div className="p-4 space-y-4 max-h-[400px] overflow-y-auto">
        {mockRecentActivity.map((activity, index) => (
          <div
            key={index}
            className="flex items-start gap-3 p-3 rounded-xl hover:bg-card-border/30 transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-background flex items-center justify-center flex-shrink-0">
              {getActivityIcon(activity.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm">{activity.message}</p>
              <p className="text-xs text-muted mt-1">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-card-border">
        <button className="w-full text-sm text-accent hover:underline">
          View all activity
        </button>
      </div>
    </motion.div>
  );
}

function NetworkZones() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-card border border-card-border rounded-2xl"
    >
      <div className="p-6 border-b border-card-border">
        <h3 className="font-semibold">Network Zones</h3>
        <p className="text-sm text-muted">Regional mesh network status</p>
      </div>

      <div className="p-4 space-y-3">
        {mockZoneData.map((zone) => (
          <div
            key={zone.zone}
            className="flex items-center justify-between p-4 rounded-xl bg-background border border-card-border"
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-3 h-3 rounded-full ${
                  zone.status === "active" ? "bg-safe" : "bg-warning"
                }`}
              />
              <div>
                <p className="font-medium text-sm">{zone.zone}</p>
                <p className="text-xs text-muted">{zone.nodes.toLocaleString()} nodes</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-critical">{zone.sos} SOS</p>
              <p className="text-xs text-muted capitalize">{zone.status}</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function SystemHealth() {
  const metrics = [
    { label: "API Latency", value: "45ms", status: "good" },
    { label: "Database", value: "Healthy", status: "good" },
    { label: "BLE Gateway", value: "Online", status: "good" },
    { label: "Cloud Sync", value: "Active", status: "good" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="bg-card border border-card-border rounded-2xl p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold">System Health</h3>
          <p className="text-sm text-muted">All systems operational</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-safe animate-pulse" />
          <span className="text-xs text-safe font-medium">Healthy</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="p-3 rounded-xl bg-background border border-card-border"
          >
            <p className="text-xs text-muted mb-1">{metric.label}</p>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-safe" />
              <span className="text-sm font-medium">{metric.value}</span>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check authentication
    const auth = localStorage.getItem("aether_admin_auth");
    if (!auth) {
      router.push("/admin/login");
      return;
    }

    try {
      const authData = JSON.parse(auth);
      if (!authData.authenticated) {
        router.push("/admin/login");
        return;
      }
    } catch {
      router.push("/admin/login");
      return;
    }

    setIsLoading(false);
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-accent/30 border-t-accent rounded-full animate-spin" />
          <p className="text-muted">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main content */}
      <main className="lg:ml-64">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-card-border">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-lg hover:bg-card-border/50 lg:hidden"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold">Dashboard</h1>
                <p className="text-sm text-muted">Welcome back, Admin</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button className="p-2 rounded-lg hover:bg-card-border/50 transition-colors relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-critical rounded-full" />
              </button>
              <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card border border-card-border hover:bg-card-border/50 transition-colors">
                <RefreshCw className="w-4 h-4" />
                <span className="text-sm hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>

          {/* DEFCON Alert Banner */}
          <div className="px-6 pb-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-warning/10 border border-warning/30">
              <Zap className="w-5 h-5 text-warning" />
              <div className="flex-1">
                <p className="text-sm font-medium text-warning">DEFCON Level 3 Active</p>
                <p className="text-xs text-muted">Earthquake warning issued for Los Angeles County - Mesh network on standby</p>
              </div>
              <button className="text-xs text-warning hover:underline">Details</button>
            </div>
          </div>
        </header>

        {/* Dashboard content */}
        <div className="p-6 space-y-6">
          {/* Stats grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <StatsCard
              title="Active Nodes"
              value={mockStats.activeNodes.toLocaleString()}
              change="+12.5%"
              changeType="up"
              icon={Smartphone}
              iconColor="bg-accent"
            />
            <StatsCard
              title="Active SOS"
              value={mockStats.activeSOSSignals}
              change="+3"
              changeType="up"
              icon={AlertTriangle}
              iconColor="bg-critical"
            />
            <StatsCard
              title="Messages Relayed"
              value={`${(mockStats.messagesRelayed / 1000).toFixed(1)}K`}
              change="+8.2%"
              changeType="up"
              icon={Signal}
              iconColor="bg-safe"
            />
            <StatsCard
              title="Avg Response"
              value={mockStats.avgResponseTime}
              change="-0.8 min"
              changeType="up"
              icon={Clock}
              iconColor="bg-warning"
            />
            <StatsCard
              title="Coverage"
              value={mockStats.networkCoverage}
              change="+2.1%"
              changeType="up"
              icon={Globe}
              iconColor="bg-purple-500"
            />
            <StatsCard
              title="Battery Eff."
              value={mockStats.batteryEfficiency}
              change="Optimal"
              changeType="neutral"
              icon={Battery}
              iconColor="bg-safe"
            />
          </div>

          {/* Main content grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <SOSTable />
            </div>
            <div className="space-y-6">
              <ActivityFeed />
            </div>
          </div>

          {/* Bottom grid */}
          <div className="grid md:grid-cols-2 gap-6">
            <NetworkZones />
            <SystemHealth />
          </div>
        </div>
      </main>
    </div>
  );
}

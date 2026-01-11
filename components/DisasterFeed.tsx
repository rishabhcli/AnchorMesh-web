'use client';

import { motion } from 'framer-motion';
import {
  Globe,
  RefreshCw,
  ExternalLink,
  Clock,
  MapPin,
  Loader2,
  AlertTriangle,
  Cloud,
  Activity,
} from 'lucide-react';
import {
  useDisasterFeed,
  DisasterEvent,
  getSeverityColor,
  getDisasterIcon,
  disasterTimeAgo,
} from '@/hooks/useDisasterFeed';

interface DisasterFeedProps {
  maxItems?: number;
  showStats?: boolean;
  className?: string;
}

export default function DisasterFeed({ maxItems = 15, showStats = true, className = '' }: DisasterFeedProps) {
  const { events, loading, error, lastUpdated, stats, refresh } = useDisasterFeed();

  const displayedEvents = events.slice(0, maxItems);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className={`bg-card border border-card-border rounded-2xl shadow-xl overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="p-6 border-b border-card-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Live Disaster Feed</h3>
              <p className="text-sm text-muted">USGS &amp; NOAA real-time data</p>
            </div>
          </div>
          <button
            onClick={refresh}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card-border/50 hover:bg-card-border transition-colors text-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Stats */}
        {showStats && (
          <div className="grid grid-cols-4 gap-3 mt-4">
            <div className="bg-background rounded-lg p-3 text-center">
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-muted">Total Events</p>
            </div>
            <div className="bg-background rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-orange-500">{stats.earthquakes}</p>
              <p className="text-xs text-muted">Earthquakes</p>
            </div>
            <div className="bg-background rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-blue-500">{stats.weather}</p>
              <p className="text-xs text-muted">Weather</p>
            </div>
            <div className="bg-background rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-red-500">{stats.severe}</p>
              <p className="text-xs text-muted">Severe</p>
            </div>
          </div>
        )}
      </div>

      {/* Events List */}
      <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
        {loading && events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-10 h-10 animate-spin text-accent mb-4" />
            <p className="text-muted">Fetching disaster data...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted">
            <AlertTriangle className="w-10 h-10 text-warning mb-4" />
            <p className="font-medium">Failed to load data</p>
            <p className="text-sm mt-1">{error}</p>
            <button
              onClick={refresh}
              className="mt-4 px-4 py-2 bg-accent text-white rounded-lg text-sm"
            >
              Try Again
            </button>
          </div>
        ) : displayedEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted">
            <Cloud className="w-10 h-10 mb-4 opacity-50" />
            <p className="font-medium">No active disasters</p>
            <p className="text-sm mt-1">All clear in the last 24 hours</p>
          </div>
        ) : (
          <div className="divide-y divide-card-border/50">
            {displayedEvents.map((event, index) => (
              <DisasterEventItem key={event.id} event={event} index={index} />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-card-border bg-background/50">
        <div className="flex items-center justify-between text-xs text-muted">
          <div className="flex items-center gap-2">
            <Activity className="w-3 h-3" />
            <span>
              {lastUpdated
                ? `Updated ${disasterTimeAgo(lastUpdated)}`
                : 'Loading...'}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-safe animate-pulse" />
            Auto-refresh every 5 min
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function DisasterEventItem({ event, index }: { event: DisasterEvent; index: number }) {
  const severityColor = getSeverityColor(event.severity);
  const icon = getDisasterIcon(event.type);

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.02 }}
      className="p-4 hover:bg-card-border/30 transition-colors group"
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
          style={{ backgroundColor: `${severityColor}20` }}
        >
          {icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="px-2 py-0.5 rounded text-xs font-semibold text-white"
              style={{ backgroundColor: severityColor }}
            >
              {event.severity.toUpperCase()}
            </span>
            <span className="text-xs text-muted capitalize">{event.type}</span>
            {event.magnitude && (
              <span className="text-xs font-mono bg-card-border/50 px-1.5 py-0.5 rounded">
                M{event.magnitude.toFixed(1)}
              </span>
            )}
          </div>

          <h4 className="font-medium text-sm leading-tight mb-1 line-clamp-1">
            {event.title}
          </h4>

          <p className="text-xs text-muted line-clamp-2 mb-2">
            {event.description}
          </p>

          <div className="flex items-center gap-4 text-xs text-muted">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {disasterTimeAgo(event.time)}
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {event.latitude.toFixed(2)}, {event.longitude.toFixed(2)}
            </div>
            <div className="flex items-center gap-1 uppercase">
              {event.source}
            </div>
          </div>
        </div>

        {/* External Link */}
        {event.sourceUrl && (
          <a
            href={event.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-card-border rounded-lg"
          >
            <ExternalLink className="w-4 h-4 text-muted" />
          </a>
        )}
      </div>
    </motion.div>
  );
}

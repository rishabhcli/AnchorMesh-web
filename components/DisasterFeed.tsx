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
      className={`bg-black border border-card-border rounded overflow-hidden ${className}`}
    >
      {/* Header - Matrix style */}
      <div className="p-6 border-b border-card-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded border border-foreground flex items-center justify-center glow-effect">
              <Globe className="w-5 h-5 text-foreground" />
            </div>
            <div>
              <h3 className="font-mono text-lg text-foreground glow-text uppercase tracking-wider">&gt; DISASTER_FEED</h3>
              <p className="text-sm text-muted font-mono">// USGS &amp; NOAA real-time data</p>
            </div>
          </div>
          <button
            onClick={refresh}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 rounded border border-card-border hover:border-foreground transition-colors text-sm font-mono text-foreground"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            [SYNC]
          </button>
        </div>

        {/* Stats - Matrix style */}
        {showStats && (
          <div className="grid grid-cols-4 gap-3 mt-4">
            <div className="bg-black rounded border border-card-border p-3 text-center hover:border-foreground transition-colors">
              <p className="text-2xl font-mono text-foreground glow-text">{stats.total}</p>
              <p className="text-xs text-muted font-mono uppercase">TOTAL</p>
            </div>
            <div className="bg-black rounded border border-card-border p-3 text-center hover:border-foreground transition-colors">
              <p className="text-2xl font-mono text-foreground glow-text">{stats.earthquakes}</p>
              <p className="text-xs text-muted font-mono uppercase">QUAKES</p>
            </div>
            <div className="bg-black rounded border border-card-border p-3 text-center hover:border-foreground transition-colors">
              <p className="text-2xl font-mono text-foreground glow-text">{stats.weather}</p>
              <p className="text-xs text-muted font-mono uppercase">WEATHER</p>
            </div>
            <div className="bg-black rounded border border-card-border p-3 text-center hover:border-critical transition-colors">
              <p className="text-2xl font-mono text-critical" style={{ textShadow: '0 0 10px rgba(255, 0, 0, 0.5)' }}>{stats.severe}</p>
              <p className="text-xs text-muted font-mono uppercase">CRITICAL</p>
            </div>
          </div>
        )}
      </div>

      {/* Events List */}
      <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
        {loading && events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-10 h-10 animate-spin text-foreground mb-4" />
            <p className="text-muted font-mono">FETCHING_DATA...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted">
            <AlertTriangle className="w-10 h-10 text-critical mb-4" />
            <p className="font-mono text-critical">[ERROR: DATA_FETCH_FAILED]</p>
            <p className="text-sm mt-1 font-mono">{error}</p>
            <button
              onClick={refresh}
              className="mt-4 px-4 py-2 border border-foreground text-foreground rounded text-sm font-mono hover:bg-foreground/10 transition-colors"
            >
              [RETRY]
            </button>
          </div>
        ) : displayedEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted">
            <Cloud className="w-10 h-10 mb-4 text-foreground" />
            <p className="font-mono text-foreground">[STATUS: ALL_CLEAR]</p>
            <p className="text-sm mt-1 font-mono">// No active disasters in last 24h</p>
          </div>
        ) : (
          <div className="divide-y divide-card-border/50">
            {displayedEvents.map((event, index) => (
              <DisasterEventItem key={event.id} event={event} index={index} />
            ))}
          </div>
        )}
      </div>

      {/* Footer - Matrix style */}
      <div className="p-4 border-t border-card-border bg-black">
        <div className="flex items-center justify-between text-xs text-muted font-mono">
          <div className="flex items-center gap-2">
            <Activity className="w-3 h-3 text-foreground" />
            <span>
              {lastUpdated
                ? `UPDATED: ${disasterTimeAgo(lastUpdated)}`
                : 'LOADING...'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-foreground">
            <span className="w-2 h-2 rounded-full bg-foreground animate-pulse" />
            [AUTO_SYNC: 5MIN]
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function DisasterEventItem({ event, index }: { event: DisasterEvent; index: number }) {
  const severityColor = event.severity === 'extreme' ? '#ff0000' : event.severity === 'high' ? '#ffffff' : '#888888';
  const icon = getDisasterIcon(event.type);

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.02 }}
      className="p-4 hover:bg-card-border/10 transition-colors group border-l-2"
      style={{ borderLeftColor: severityColor }}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className="w-10 h-10 rounded border flex items-center justify-center text-lg flex-shrink-0"
          style={{ borderColor: severityColor, backgroundColor: 'black', boxShadow: `0 0 10px ${severityColor}40` }}
        >
          {icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="px-2 py-0.5 rounded border text-xs font-mono"
              style={{ borderColor: severityColor, color: severityColor }}
            >
              [{event.severity.toUpperCase()}]
            </span>
            <span className="text-xs text-muted font-mono uppercase">{event.type}</span>
            {event.magnitude && (
              <span className="text-xs font-mono border border-card-border px-1.5 py-0.5 rounded text-foreground">
                M{event.magnitude.toFixed(1)}
              </span>
            )}
          </div>

          <h4 className="font-mono text-sm leading-tight mb-1 line-clamp-1 text-foreground">
            &gt; {event.title}
          </h4>

          <p className="text-xs text-muted line-clamp-2 mb-2 font-mono">
            // {event.description}
          </p>

          <div className="flex items-center gap-4 text-xs text-muted font-mono">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-foreground" />
              {disasterTimeAgo(event.time)}
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-foreground" />
              {event.latitude.toFixed(2)}, {event.longitude.toFixed(2)}
            </div>
            <div className="flex items-center gap-1 uppercase text-foreground">
              [{event.source}]
            </div>
          </div>
        </div>

        {/* External Link */}
        {event.sourceUrl && (
          <a
            href={event.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="opacity-0 group-hover:opacity-100 transition-opacity p-2 border border-card-border hover:border-foreground rounded"
          >
            <ExternalLink className="w-4 h-4 text-foreground" />
          </a>
        )}
      </div>
    </motion.div>
  );
}

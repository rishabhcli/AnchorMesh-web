'use client';

import { useRef, useCallback, useState, useEffect } from 'react';
import Map, { Marker, Popup, NavigationControl, MapRef } from 'react-map-gl/mapbox';
import { SOSAlert, parseLocation, getEmergencyLabel, timeAgo } from '@/lib/supabase';
import { AlertTriangle, X, MapPin, Clock, Signal, User } from 'lucide-react';
import 'mapbox-gl/dist/mapbox-gl.css';

interface AlertMapProps {
  alerts: SOSAlert[];
  onAlertClick?: (alert: SOSAlert) => void;
  selectedAlertId?: string | null;
  className?: string;
}

type MapStyle = 'dark' | 'satellite' | 'streets';

const mapStyles: Record<MapStyle, string> = {
  dark: 'mapbox://styles/mapbox/dark-v11',
  satellite: 'mapbox://styles/mapbox/satellite-streets-v12',
  streets: 'mapbox://styles/mapbox/streets-v12',
};

// Priority colors for markers - Matrix style (white)
const priorityColors: Record<string, string> = {
  critical: '#ff0000', // red (stays red for visibility)
  high: '#ffffff',     // white
  medium: '#aaaaaa',   // gray
  low: '#666666',      // dark gray
};

// Get marker color based on priority
function getMarkerColor(priority: string): string {
  return priorityColors[priority] || priorityColors.medium;
}

// Custom marker component - Matrix style
function AlertMarker({
  alert,
  isSelected,
  onClick,
}: {
  alert: SOSAlert;
  isSelected: boolean;
  onClick: () => void;
}) {
  const color = getMarkerColor(alert.priority);
  const size = isSelected ? 40 : alert.priority === 'critical' ? 32 : 24;

  return (
    <button
      onClick={onClick}
      className={`relative flex items-center justify-center transition-transform ${
        isSelected ? 'scale-110 z-50' : 'hover:scale-105'
      }`}
      style={{ width: size, height: size }}
      aria-label={`${getEmergencyLabel(alert.emergency_type)} alert from device ${alert.originator_device_id.slice(0, 8)}`}
    >
      {/* Pulse animation for critical alerts */}
      {alert.priority === 'critical' && (
        <span
          className="absolute inset-0 rounded animate-ping opacity-75"
          style={{ backgroundColor: color, boxShadow: `0 0 20px ${color}` }}
        />
      )}

      {/* Main marker - Matrix style square */}
      <span
        className="absolute inset-0 rounded border-2 flex items-center justify-center"
        style={{
          backgroundColor: 'black',
          borderColor: color,
          boxShadow: `0 0 10px ${color}40`
        }}
      >
        <AlertTriangle className="w-3/5 h-3/5" style={{ color }} />
      </span>

      {/* Selection ring */}
      {isSelected && (
        <span
          className="absolute -inset-1 rounded border animate-pulse"
          style={{ borderColor: color, boxShadow: `0 0 15px ${color}` }}
        />
      )}
    </button>
  );
}

// Alert popup component - Matrix style
function AlertPopup({
  alert,
  onClose,
}: {
  alert: SOSAlert;
  onClose: () => void;
}) {
  const location = parseLocation(alert.location);
  const markerColor = getMarkerColor(alert.priority);

  return (
    <div className="bg-black border rounded overflow-hidden min-w-[280px]" style={{ borderColor: markerColor, boxShadow: `0 0 20px ${markerColor}40` }}>
      {/* Header */}
      <div
        className="px-4 py-3 flex items-center justify-between border-b"
        style={{ borderColor: markerColor, backgroundColor: `${markerColor}10` }}
      >
        <div className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded animate-pulse"
            style={{ backgroundColor: markerColor, boxShadow: `0 0 10px ${markerColor}` }}
          />
          <span className="font-mono text-sm uppercase" style={{ color: markerColor }}>
            {getEmergencyLabel(alert.emergency_type)}
          </span>
          <span
            className="text-xs px-2 py-0.5 rounded border font-mono"
            style={{ borderColor: markerColor, color: markerColor }}
          >
            [{alert.priority.toUpperCase()}]
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded border border-card-border hover:border-foreground transition-colors"
        >
          <X className="w-4 h-4 text-foreground" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Message if available */}
        {alert.message && (
          <p className="text-sm text-foreground font-mono">&gt; {alert.message}</p>
        )}

        {/* Details */}
        <div className="space-y-2 text-xs text-muted font-mono">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-foreground" />
            <span>
              {location ? `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}` : 'UNKNOWN_LOCATION'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-foreground" />
            <span>DEVICE: {alert.originator_device_id.slice(0, 12)}...</span>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-foreground" />
            <span>TIME: {timeAgo(alert.originated_at)}</span>
          </div>

          <div className="flex items-center gap-2">
            <Signal className="w-4 h-4 text-foreground" />
            <span>
              HOPS: {alert.hop_count}
              {alert.delivered_via === 'mesh_relay' && ' [MESH_RELAY]'}
            </span>
          </div>
        </div>

        {/* Status badge */}
        <div className="pt-2 border-t border-card-border">
          <span className={`text-xs px-2 py-1 rounded border font-mono ${
            alert.status === 'active' ? 'border-critical text-critical' :
            alert.status === 'acknowledged' ? 'border-foreground text-foreground' :
            alert.status === 'responding' ? 'border-foreground text-foreground' :
            'border-muted text-muted'
          }`}>
            [STATUS: {alert.status.toUpperCase()}]
          </span>
        </div>
      </div>
    </div>
  );
}

export default function AlertMap({
  alerts,
  onAlertClick,
  selectedAlertId,
  className = '',
}: AlertMapProps) {
  const mapRef = useRef<MapRef>(null);
  const [popupAlert, setPopupAlert] = useState<SOSAlert | null>(null);
  const [mapStyle, setMapStyle] = useState<MapStyle>('dark');
  const [viewState, setViewState] = useState({
    longitude: -118.2437, // Los Angeles default
    latitude: 34.0522,
    zoom: 10,
  });

  // Filter alerts with valid locations
  const alertsWithLocation = alerts.filter((alert) => {
    const loc = parseLocation(alert.location);
    return loc !== null;
  });

  // Center map on alerts when they change
  useEffect(() => {
    if (alertsWithLocation.length > 0 && mapRef.current) {
      const locations = alertsWithLocation.map((a) => parseLocation(a.location)!);

      if (locations.length === 1) {
        setViewState((prev) => ({
          ...prev,
          longitude: locations[0].longitude,
          latitude: locations[0].latitude,
          zoom: 14,
        }));
      } else if (locations.length > 1) {
        // Calculate bounds
        const lngs = locations.map((l) => l.longitude);
        const lats = locations.map((l) => l.latitude);
        const minLng = Math.min(...lngs);
        const maxLng = Math.max(...lngs);
        const minLat = Math.min(...lats);
        const maxLat = Math.max(...lats);

        // Fit to bounds with padding
        mapRef.current.fitBounds(
          [[minLng, minLat], [maxLng, maxLat]],
          { padding: 100, duration: 1000 }
        );
      }
    }
  }, [alertsWithLocation.length]);

  // Handle marker click
  const handleMarkerClick = useCallback(
    (alert: SOSAlert) => {
      setPopupAlert(alert);
      onAlertClick?.(alert);

      // Center on clicked alert
      const loc = parseLocation(alert.location);
      if (loc) {
        setViewState((prev) => ({
          ...prev,
          longitude: loc.longitude,
          latitude: loc.latitude,
        }));
      }
    },
    [onAlertClick]
  );

  // Show selected alert popup
  useEffect(() => {
    if (selectedAlertId) {
      const alert = alerts.find((a) => a.id === selectedAlertId);
      if (alert) {
        setPopupAlert(alert);
        const loc = parseLocation(alert.location);
        if (loc) {
          setViewState((prev) => ({
            ...prev,
            longitude: loc.longitude,
            latitude: loc.latitude,
            zoom: 14,
          }));
        }
      }
    }
  }, [selectedAlertId, alerts]);

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  // If no token, show placeholder - Matrix style
  if (!mapboxToken) {
    return (
      <div className={`bg-black border border-card-border rounded flex items-center justify-center ${className}`}>
        <div className="text-center p-8">
          <MapPin className="w-12 h-12 text-foreground mx-auto mb-4" />
          <h3 className="font-mono text-foreground glow-text mb-2">[MAP_UNAVAILABLE]</h3>
          <p className="text-sm text-muted font-mono">
            // Set NEXT_PUBLIC_MAPBOX_TOKEN to enable live map
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded border border-card-border ${className}`}>
      <Map
        ref={mapRef}
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        mapStyle={mapStyles[mapStyle]}
        mapboxAccessToken={mapboxToken}
        style={{ width: '100%', height: '100%' }}
      >
        <NavigationControl position="top-right" />

        {/* Alert markers */}
        {alertsWithLocation.map((alert) => {
          const loc = parseLocation(alert.location);
          if (!loc) return null;

          return (
            <Marker
              key={alert.id}
              longitude={loc.longitude}
              latitude={loc.latitude}
              anchor="center"
            >
              <AlertMarker
                alert={alert}
                isSelected={selectedAlertId === alert.id || popupAlert?.id === alert.id}
                onClick={() => handleMarkerClick(alert)}
              />
            </Marker>
          );
        })}

        {/* Popup for selected alert */}
        {popupAlert && parseLocation(popupAlert.location) && (
          <Popup
            longitude={parseLocation(popupAlert.location)!.longitude}
            latitude={parseLocation(popupAlert.location)!.latitude}
            anchor="bottom"
            onClose={() => setPopupAlert(null)}
            closeButton={false}
            className="alert-popup"
            offset={25}
          >
            <AlertPopup alert={popupAlert} onClose={() => setPopupAlert(null)} />
          </Popup>
        )}
      </Map>

      {/* Legend - Matrix style */}
      <div className="absolute bottom-4 left-4 bg-black/90 backdrop-blur-sm border border-card-border rounded p-3" style={{ boxShadow: '0 0 10px rgba(255, 255, 255, 0.1)' }}>
        <p className="text-xs font-mono mb-2 text-foreground uppercase tracking-wider">&gt; PRIORITY_LEGEND</p>
        <div className="flex flex-col gap-1.5">
          {[
            { label: 'CRITICAL', color: priorityColors.critical },
            { label: 'HIGH', color: priorityColors.high },
            { label: 'MEDIUM', color: priorityColors.medium },
            { label: 'LOW', color: priorityColors.low },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded border"
                style={{ backgroundColor: 'black', borderColor: item.color, boxShadow: `0 0 5px ${item.color}` }}
              />
              <span className="text-xs font-mono" style={{ color: item.color }}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Alert count badge - Matrix style */}
      <div className="absolute top-4 left-4 bg-black/90 backdrop-blur-sm border border-card-border rounded px-3 py-2" style={{ boxShadow: '0 0 10px rgba(255, 255, 255, 0.1)' }}>
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-foreground" />
          <span className="text-sm font-mono text-foreground">[{alertsWithLocation.length}] ACTIVE_ALERTS</span>
        </div>
      </div>

      {/* Map style toggle */}
      <div className="absolute top-4 right-14 bg-black/90 backdrop-blur-sm border border-card-border rounded p-1 flex gap-1" style={{ boxShadow: '0 0 10px rgba(255, 255, 255, 0.1)' }}>
        {(['dark', 'satellite', 'streets'] as MapStyle[]).map((style) => (
          <button
            key={style}
            onClick={() => setMapStyle(style)}
            className={`px-2 py-1 rounded text-xs font-mono transition-colors ${
              mapStyle === style
                ? 'bg-foreground text-black'
                : 'text-muted hover:text-foreground'
            }`}
          >
            {style.toUpperCase().slice(0, 3)}
          </button>
        ))}
      </div>
    </div>
  );
}

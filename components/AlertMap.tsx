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

// Priority colors for markers
const priorityColors: Record<string, string> = {
  critical: '#ef4444', // red
  high: '#f97316',     // orange
  medium: '#eab308',   // yellow
  low: '#22c55e',      // green
};

// Get marker color based on priority
function getMarkerColor(priority: string): string {
  return priorityColors[priority] || priorityColors.medium;
}

// Custom marker component
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
          className="absolute inset-0 rounded-full animate-ping opacity-75"
          style={{ backgroundColor: color }}
        />
      )}

      {/* Main marker */}
      <span
        className="absolute inset-0 rounded-full border-2 border-white shadow-lg flex items-center justify-center"
        style={{ backgroundColor: color }}
      >
        <AlertTriangle className="w-3/5 h-3/5 text-white" />
      </span>

      {/* Selection ring */}
      {isSelected && (
        <span
          className="absolute -inset-1 rounded-full border-2 animate-pulse"
          style={{ borderColor: color }}
        />
      )}
    </button>
  );
}

// Alert popup component
function AlertPopup({
  alert,
  onClose,
}: {
  alert: SOSAlert;
  onClose: () => void;
}) {
  const location = parseLocation(alert.location);

  return (
    <div className="bg-card border border-card-border rounded-xl shadow-xl overflow-hidden min-w-[280px]">
      {/* Header */}
      <div
        className="px-4 py-3 flex items-center justify-between"
        style={{ backgroundColor: `${getMarkerColor(alert.priority)}20` }}
      >
        <div className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-full animate-pulse"
            style={{ backgroundColor: getMarkerColor(alert.priority) }}
          />
          <span className="font-semibold text-sm">
            {getEmergencyLabel(alert.emergency_type)}
          </span>
          <span
            className="text-xs px-2 py-0.5 rounded-full text-white"
            style={{ backgroundColor: getMarkerColor(alert.priority) }}
          >
            {alert.priority.toUpperCase()}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-card-border/50 transition-colors"
        >
          <X className="w-4 h-4 text-muted" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Message if available */}
        {alert.message && (
          <p className="text-sm text-foreground">{alert.message}</p>
        )}

        {/* Details */}
        <div className="space-y-2 text-xs text-muted">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span className="font-mono">
              {location ? `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}` : 'Unknown location'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span className="font-mono">{alert.originator_device_id.slice(0, 12)}...</span>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>{timeAgo(alert.originated_at)}</span>
          </div>

          <div className="flex items-center gap-2">
            <Signal className="w-4 h-4" />
            <span>
              {alert.hop_count} hops
              {alert.delivered_via === 'mesh_relay' && ' (mesh relay)'}
            </span>
          </div>
        </div>

        {/* Status badge */}
        <div className="pt-2 border-t border-card-border">
          <span className={`text-xs px-2 py-1 rounded-full ${
            alert.status === 'active' ? 'bg-critical/20 text-critical' :
            alert.status === 'acknowledged' ? 'bg-warning/20 text-warning' :
            alert.status === 'responding' ? 'bg-accent/20 text-accent' :
            'bg-safe/20 text-safe'
          }`}>
            {alert.status.charAt(0).toUpperCase() + alert.status.slice(1)}
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

  // If no token, show placeholder
  if (!mapboxToken) {
    return (
      <div className={`bg-card border border-card-border rounded-2xl flex items-center justify-center ${className}`}>
        <div className="text-center p-8">
          <MapPin className="w-12 h-12 text-muted mx-auto mb-4" />
          <h3 className="font-semibold mb-2">Map Unavailable</h3>
          <p className="text-sm text-muted">
            Set NEXT_PUBLIC_MAPBOX_TOKEN to enable the live map.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-card-border ${className}`}>
      <Map
        ref={mapRef}
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        mapStyle="mapbox://styles/mapbox/dark-v11"
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

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur-sm border border-card-border rounded-xl p-3">
        <p className="text-xs font-medium mb-2 text-muted">Alert Priority</p>
        <div className="flex flex-col gap-1.5">
          {[
            { label: 'Critical', color: priorityColors.critical },
            { label: 'High', color: priorityColors.high },
            { label: 'Medium', color: priorityColors.medium },
            { label: 'Low', color: priorityColors.low },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-xs">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Alert count badge */}
      <div className="absolute top-4 left-4 bg-card/90 backdrop-blur-sm border border-card-border rounded-xl px-3 py-2">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-critical" />
          <span className="text-sm font-medium">{alertsWithLocation.length} Active Alerts</span>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState, useCallback } from 'react';

// Disaster event types
export type DisasterType = 'earthquake' | 'hurricane' | 'tornado' | 'flood' | 'fire' | 'volcano' | 'weather' | 'other';
export type DisasterSeverity = 'low' | 'medium' | 'high' | 'extreme';

export interface DisasterEvent {
  id: string;
  type: DisasterType;
  title: string;
  description: string;
  severity: DisasterSeverity;
  magnitude?: number;
  latitude: number;
  longitude: number;
  time: Date;
  source: 'usgs' | 'noaa' | 'gdacs';
  sourceUrl?: string;
}

// USGS Earthquake API response types
interface USGSFeature {
  id: string;
  properties: {
    mag: number;
    place: string;
    time: number;
    url: string;
    title: string;
  };
  geometry: {
    coordinates: [number, number, number];
  };
}

// NOAA Alert API response types
interface NOAAFeature {
  id: string;
  properties: {
    id: string;
    event: string;
    headline: string;
    severity: string;
    effective: string;
    web?: string;
  };
  geometry: {
    type: string;
    coordinates: number[][][] | number[];
  } | null;
}

// Fetch earthquakes from USGS
async function fetchUSGSEarthquakes(): Promise<DisasterEvent[]> {
  try {
    const response = await fetch(
      'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson'
    );
    if (!response.ok) throw new Error('USGS fetch failed');

    const data = await response.json();
    const events: DisasterEvent[] = [];

    for (const feature of data.features as USGSFeature[]) {
      const mag = feature.properties.mag;
      const time = new Date(feature.properties.time);

      // Filter: only include earthquakes from last 24 hours
      const hoursSince = (Date.now() - time.getTime()) / (1000 * 60 * 60);
      if (hoursSince > 24) continue;

      // Determine severity based on magnitude
      let severity: DisasterSeverity = 'low';
      if (mag >= 6.0) severity = 'extreme';
      else if (mag >= 5.0) severity = 'high';
      else if (mag >= 4.0) severity = 'medium';

      events.push({
        id: `usgs_${feature.id}`,
        type: 'earthquake',
        title: feature.properties.title || `M${mag} Earthquake`,
        description: feature.properties.place || 'Unknown location',
        severity,
        magnitude: mag,
        latitude: feature.geometry.coordinates[1],
        longitude: feature.geometry.coordinates[0],
        time,
        source: 'usgs',
        sourceUrl: feature.properties.url,
      });
    }

    return events;
  } catch (error) {
    console.error('Error fetching USGS data:', error);
    return [];
  }
}

// Fetch weather alerts from NOAA (US only)
async function fetchNOAAAlerts(): Promise<DisasterEvent[]> {
  try {
    const response = await fetch(
      'https://api.weather.gov/alerts/active?severity=Severe,Extreme',
      {
        headers: {
          'User-Agent': 'AnchorMesh Emergency Dashboard',
          'Accept': 'application/geo+json',
        },
      }
    );
    if (!response.ok) throw new Error('NOAA fetch failed');

    const data = await response.json();
    const events: DisasterEvent[] = [];

    for (const feature of data.features as NOAAFeature[]) {
      const props = feature.properties;
      const geom = feature.geometry;
      if (!geom) continue;

      // Parse time
      let time = new Date();
      if (props.effective) {
        time = new Date(props.effective);
      }

      // Filter: only include alerts from last 24 hours
      const hoursSince = (Date.now() - time.getTime()) / (1000 * 60 * 60);
      if (hoursSince > 24) continue;

      // Extract coordinates
      let lat: number | null = null;
      let lon: number | null = null;

      if (geom.type === 'Polygon' && geom.coordinates) {
        const ring = (geom.coordinates as number[][][])[0];
        if (ring && ring.length > 0) {
          lon = ring[0][0];
          lat = ring[0][1];
        }
      } else if (geom.type === 'Point' && geom.coordinates) {
        const coords = geom.coordinates as number[];
        lon = coords[0];
        lat = coords[1];
      }

      if (lat === null || lon === null) continue;

      // Determine type from event name
      const eventLower = props.event.toLowerCase();
      let type: DisasterType = 'weather';
      if (eventLower.includes('tornado')) type = 'tornado';
      else if (eventLower.includes('hurricane') || eventLower.includes('tropical')) type = 'hurricane';
      else if (eventLower.includes('flood')) type = 'flood';
      else if (eventLower.includes('fire')) type = 'fire';

      // Determine severity
      const severity: DisasterSeverity = props.severity === 'Extreme' ? 'extreme' : 'high';

      events.push({
        id: `noaa_${props.id}`,
        type,
        title: props.event,
        description: props.headline || props.event,
        severity,
        latitude: lat,
        longitude: lon,
        time,
        source: 'noaa',
        sourceUrl: props.web,
      });
    }

    return events;
  } catch (error) {
    console.error('Error fetching NOAA data:', error);
    return [];
  }
}

// Fetch global disasters from GDACS RSS
async function fetchGDACSEvents(): Promise<DisasterEvent[]> {
  try {
    // Use a CORS proxy or server-side route for GDACS
    // For now, we'll skip GDACS in the browser due to CORS
    // In production, this should be fetched server-side
    return [];
  } catch (error) {
    console.error('Error fetching GDACS data:', error);
    return [];
  }
}

// Main hook
export function useDisasterFeed(options?: { refreshInterval?: number }) {
  const [events, setEvents] = useState<DisasterEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchAllEvents = useCallback(async () => {
    try {
      setError(null);

      // Fetch from all sources in parallel
      const [usgsEvents, noaaEvents] = await Promise.all([
        fetchUSGSEarthquakes(),
        fetchNOAAAlerts(),
      ]);

      // Combine and sort by time (newest first)
      const allEvents = [...usgsEvents, ...noaaEvents]
        .sort((a, b) => b.time.getTime() - a.time.getTime());

      setEvents(allEvents);
      setLastUpdated(new Date());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch disaster data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllEvents();

    // Refresh every 5 minutes by default
    const interval = setInterval(fetchAllEvents, options?.refreshInterval || 300000);

    return () => clearInterval(interval);
  }, [fetchAllEvents, options?.refreshInterval]);

  // Get stats
  const stats = {
    total: events.length,
    earthquakes: events.filter(e => e.type === 'earthquake').length,
    weather: events.filter(e => ['hurricane', 'tornado', 'flood', 'weather'].includes(e.type)).length,
    severe: events.filter(e => e.severity === 'extreme' || e.severity === 'high').length,
  };

  return { events, loading, error, lastUpdated, stats, refresh: fetchAllEvents };
}

// Get severity color
export function getSeverityColor(severity: DisasterSeverity): string {
  switch (severity) {
    case 'extreme': return '#ef4444';
    case 'high': return '#f97316';
    case 'medium': return '#eab308';
    case 'low': return '#22c55e';
  }
}

// Get disaster type icon
export function getDisasterIcon(type: DisasterType): string {
  switch (type) {
    case 'earthquake': return '🌍';
    case 'hurricane': return '🌀';
    case 'tornado': return '🌪️';
    case 'flood': return '🌊';
    case 'fire': return '🔥';
    case 'volcano': return '🌋';
    default: return '⚠️';
  }
}

// Format time ago
export function disasterTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

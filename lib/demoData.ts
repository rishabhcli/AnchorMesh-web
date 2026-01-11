import { SOSAlert, Device, AlertStats, EmergencyType, AlertPriority, AlertStatus } from './supabase';

// Disaster scenario types
export type DisasterScenario = 'wildfire' | 'tornado' | 'hurricane' | 'earthquake';

// Scenario configurations with realistic US locations
export const DISASTER_SCENARIOS: Record<DisasterScenario, {
  name: string;
  description: string;
  center: { lat: number; lng: number };
  radius: number; // km
  primaryEmergencyType: EmergencyType;
  alertCount: { min: number; max: number };
  deviceCount: { min: number; max: number };
}> = {
  wildfire: {
    name: 'Paradise Fire Complex',
    description: 'Rapidly spreading wildfire in Butte County, CA. Cell towers destroyed. Mesh network enabling evacuation coordination.',
    center: { lat: 39.7596, lng: -121.6219 },
    radius: 25,
    primaryEmergencyType: 'fire',
    alertCount: { min: 25, max: 35 },
    deviceCount: { min: 80, max: 120 },
  },
  tornado: {
    name: 'Oklahoma Tornado Outbreak',
    description: 'Multiple tornadoes across Oklahoma City metro. Power grid down. Mesh network bridging isolated communities.',
    center: { lat: 35.4676, lng: -97.5164 },
    radius: 40,
    primaryEmergencyType: 'natural_disaster',
    alertCount: { min: 18, max: 25 },
    deviceCount: { min: 60, max: 90 },
  },
  hurricane: {
    name: 'Hurricane Response - Galveston',
    description: 'Category 4 hurricane aftermath. Flooding widespread. Mesh network critical for rescue coordination.',
    center: { lat: 29.3013, lng: -94.7977 },
    radius: 35,
    primaryEmergencyType: 'natural_disaster',
    alertCount: { min: 30, max: 45 },
    deviceCount: { min: 100, max: 150 },
  },
  earthquake: {
    name: 'San Andreas Fault Activity',
    description: '6.8 magnitude earthquake in Greater LA. Infrastructure damaged. Mesh network connecting survivors.',
    center: { lat: 34.0195, lng: -118.4912 },
    radius: 50,
    primaryEmergencyType: 'natural_disaster',
    alertCount: { min: 35, max: 50 },
    deviceCount: { min: 120, max: 180 },
  },
};

// Realistic SOS messages by emergency type
const SOS_MESSAGES: Record<EmergencyType, string[]> = {
  medical: [
    'Need medical assistance - elderly person collapsed',
    'Diabetic emergency - insulin needed urgently',
    'Severe bleeding from debris injury',
    'Heart attack symptoms - need ambulance',
    'Child with asthma attack - no inhaler',
    'Pregnant woman in labor - cannot reach hospital',
    'Multiple injuries at this location',
    'Unconscious person - possible stroke',
  ],
  fire: [
    'House on fire - family trapped inside',
    'Fire spreading toward neighborhood',
    'Smoke inhalation - need oxygen',
    'Propane tank near flames - explosion risk',
    'Wildfire approaching - need evacuation route',
    'Barn fire with animals trapped',
    'Vehicle fire on road - blocking escape route',
  ],
  security: [
    'Looting in progress - need law enforcement',
    'Suspicious individuals near shelter',
    'Armed confrontation reported nearby',
    'Missing child - last seen near evacuation point',
    'Domestic situation escalating',
  ],
  natural_disaster: [
    'Trapped under debris - can hear rescuers',
    'Building collapsed - survivors inside',
    'Flooding rising - stranded on roof',
    'Gas leak detected - evacuating area',
    'Road washed out - vehicles stranded',
    'Bridge collapsed - people in water',
    'Landslide blocking only exit route',
    'Power lines down - blocking road',
  ],
  accident: [
    'Car accident - people injured',
    'Utility vehicle overturned',
    'Rescue vehicle stuck - need tow',
    'Equipment malfunction - worker injured',
  ],
  other: [
    'Need water and supplies urgently',
    'Shelter at capacity - need alternative',
    'Lost contact with family members',
    'Pet rescue needed at this location',
    'Checking in - we are safe',
  ],
};

// Device names for realistic relay chains
const DEVICE_PREFIXES = [
  'iPhone', 'Galaxy', 'Pixel', 'OnePlus', 'Motorola', 'LG', 'Samsung', 'Xiaomi'
];

// Seeded random number generator for reproducible demo data
class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  next(): number {
    this.seed = (this.seed * 16807) % 2147483647;
    return (this.seed - 1) / 2147483646;
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  pick<T>(array: T[]): T {
    return array[this.nextInt(0, array.length - 1)];
  }

  shuffle<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = this.nextInt(0, i);
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
}

// Generate a random point within radius of center
function randomPointInRadius(
  center: { lat: number; lng: number },
  radiusKm: number,
  rng: SeededRandom
): { lat: number; lng: number } {
  const radiusInDegrees = radiusKm / 111; // Approximate km to degrees
  const u = rng.next();
  const v = rng.next();
  const w = radiusInDegrees * Math.sqrt(u);
  const t = 2 * Math.PI * v;
  const x = w * Math.cos(t);
  const y = w * Math.sin(t);

  // Adjust for latitude
  const newLat = center.lat + y;
  const newLng = center.lng + x / Math.cos(center.lat * Math.PI / 180);

  return { lat: newLat, lng: newLng };
}

// Generate UUID-like ID
function generateId(rng: SeededRandom): string {
  const hex = '0123456789abcdef';
  let result = '';
  for (let i = 0; i < 32; i++) {
    if (i === 8 || i === 12 || i === 16 || i === 20) {
      result += '-';
    }
    result += hex[rng.nextInt(0, 15)];
  }
  return result;
}

// Generate device ID in realistic format
function generateDeviceId(rng: SeededRandom): string {
  const prefix = rng.pick(DEVICE_PREFIXES);
  const suffix = rng.nextInt(1000, 9999);
  return `${prefix}-${suffix}`;
}

// Generate relay chain for mesh network demonstration
function generateRelayChain(
  deviceIds: string[],
  hopCount: number,
  originTime: Date,
  rng: SeededRandom
): SOSAlert['relay_chain'] {
  const chain: SOSAlert['relay_chain'] = [];
  const availableDevices = rng.shuffle(deviceIds).slice(0, hopCount);

  let currentTime = new Date(originTime);

  for (let i = 0; i < hopCount; i++) {
    currentTime = new Date(currentTime.getTime() + rng.nextInt(500, 3000)); // 0.5-3 seconds per hop
    chain.push({
      device_id: availableDevices[i],
      timestamp: currentTime.toISOString(),
      had_internet: i === hopCount - 1 ? true : rng.next() < 0.1, // Last hop usually has internet
    });
  }

  return chain;
}

// Generate demo devices
export function generateDemoDevices(scenario: DisasterScenario, seed: number = 42): Device[] {
  const config = DISASTER_SCENARIOS[scenario];
  const rng = new SeededRandom(seed);
  const deviceCount = rng.nextInt(config.deviceCount.min, config.deviceCount.max);
  const devices: Device[] = [];
  const now = new Date();

  for (let i = 0; i < deviceCount; i++) {
    const location = randomPointInRadius(config.center, config.radius, rng);
    const platform = rng.next() < 0.6 ? 'ios' : 'android';
    const lastSeenMinutes = rng.nextInt(1, 180); // 1 min to 3 hours ago
    const batteryLevel = rng.nextInt(15, 100);

    devices.push({
      id: generateId(rng),
      device_id: generateDeviceId(rng),
      platform: platform as 'ios' | 'android',
      app_version: platform === 'ios' ? '2.1.4' : '2.1.3',
      os_version: platform === 'ios' ? '17.2' : '14',
      device_model: platform === 'ios'
        ? rng.pick(['iPhone 15 Pro', 'iPhone 14', 'iPhone 13', 'iPhone SE'])
        : rng.pick(['Galaxy S24', 'Pixel 8', 'Galaxy A54', 'OnePlus 12']),
      last_known_location: `POINT(${location.lng} ${location.lat})`,
      location_accuracy: rng.nextInt(5, 50),
      has_internet_capability: rng.next() < 0.3, // 30% have internet
      ble_supports_mesh: true,
      is_active: rng.next() < 0.85, // 85% active
      last_seen: new Date(now.getTime() - lastSeenMinutes * 60000).toISOString(),
      metadata: {
        battery_level: batteryLevel,
        network_type: rng.next() < 0.3 ? 'cellular' : 'mesh_only',
        mesh_connections: rng.nextInt(1, 8),
      },
      created_at: new Date(now.getTime() - rng.nextInt(1, 72) * 3600000).toISOString(),
      updated_at: new Date(now.getTime() - lastSeenMinutes * 60000).toISOString(),
    });
  }

  return devices;
}

// Generate demo alerts with realistic distribution
export function generateDemoAlerts(
  scenario: DisasterScenario,
  devices: Device[],
  seed: number = 42
): SOSAlert[] {
  const config = DISASTER_SCENARIOS[scenario];
  const rng = new SeededRandom(seed + 1000);
  const alertCount = rng.nextInt(config.alertCount.min, config.alertCount.max);
  const alerts: SOSAlert[] = [];
  const now = new Date();
  const deviceIds = devices.map(d => d.device_id);

  // Emergency type distribution based on scenario
  const emergencyTypes: EmergencyType[] = [];
  for (let i = 0; i < 5; i++) emergencyTypes.push(config.primaryEmergencyType);
  emergencyTypes.push('medical', 'medical', 'medical'); // Medical is always common
  emergencyTypes.push('accident', 'security', 'other');

  // Priority distribution
  const priorities: AlertPriority[] = ['critical', 'critical', 'high', 'high', 'high', 'medium', 'medium', 'medium', 'low'];

  // Status distribution with time-based logic
  const getStatus = (hoursAgo: number, rng: SeededRandom): AlertStatus => {
    if (hoursAgo > 8) {
      return rng.next() < 0.9 ? 'resolved' : 'acknowledged';
    } else if (hoursAgo > 4) {
      const r = rng.next();
      if (r < 0.5) return 'resolved';
      if (r < 0.8) return 'acknowledged';
      return 'responding';
    } else if (hoursAgo > 1) {
      const r = rng.next();
      if (r < 0.3) return 'resolved';
      if (r < 0.6) return 'acknowledged';
      return 'active';
    }
    return rng.next() < 0.7 ? 'active' : 'acknowledged';
  };

  for (let i = 0; i < alertCount; i++) {
    const location = randomPointInRadius(config.center, config.radius * 0.8, rng);
    const emergencyType = rng.pick(emergencyTypes);
    const priority = rng.pick(priorities);
    const hoursAgo = rng.nextInt(0, 12) + rng.next(); // 0-12 hours ago
    const originatedAt = new Date(now.getTime() - hoursAgo * 3600000);
    const status = getStatus(hoursAgo, rng);

    // Determine delivery method and hop count
    const isDirect = rng.next() < 0.3; // 30% direct, 70% mesh relay
    const hopCount = isDirect ? 0 : rng.nextInt(1, 5);

    // Generate relay chain for mesh-relayed alerts
    const relayChain = isDirect ? [] : generateRelayChain(deviceIds, hopCount, originatedAt, rng);

    // Calculate received time based on relay chain
    const receivedAt = isDirect
      ? new Date(originatedAt.getTime() + rng.nextInt(100, 500))
      : new Date(originatedAt.getTime() + hopCount * rng.nextInt(500, 3000));

    // Generate acknowledgment and resolution times for non-active alerts
    let acknowledgedAt: string | undefined;
    let resolvedAt: string | undefined;

    if (status === 'acknowledged' || status === 'responding' || status === 'resolved') {
      const ackDelayMinutes = rng.nextInt(2, 30);
      acknowledgedAt = new Date(receivedAt.getTime() + ackDelayMinutes * 60000).toISOString();
    }

    if (status === 'resolved') {
      const resolveDelayMinutes = rng.nextInt(30, 180);
      resolvedAt = new Date(new Date(acknowledgedAt!).getTime() + resolveDelayMinutes * 60000).toISOString();
    }

    const alert: SOSAlert = {
      id: generateId(rng),
      message_id: `MSG-${generateId(rng).slice(0, 8).toUpperCase()}`,
      originator_device_id: rng.pick(deviceIds),
      emergency_type: emergencyType,
      priority,
      status,
      location: `POINT(${location.lng} ${location.lat})`,
      location_accuracy: rng.nextInt(5, 100),
      message: rng.pick(SOS_MESSAGES[emergencyType]),
      hop_count: hopCount,
      relay_chain: relayChain,
      delivered_by: isDirect ? undefined : relayChain[relayChain.length - 1]?.device_id,
      delivered_via: isDirect ? 'direct' : 'mesh_relay',
      originated_at: originatedAt.toISOString(),
      received_at: receivedAt.toISOString(),
      acknowledged_at: acknowledgedAt,
      resolved_at: resolvedAt,
      expires_at: new Date(originatedAt.getTime() + 24 * 3600000).toISOString(),
      responders: acknowledgedAt ? [{
        responderId: `RESP-${rng.nextInt(100, 999)}`,
        type: rng.pick(['fire_dept', 'ems', 'police', 'search_rescue', 'volunteer']),
        acknowledgedAt,
      }] : [],
      is_verified: status === 'resolved' ? rng.next() < 0.9 : false,
      verification_notes: status === 'resolved'
        ? rng.pick(['Victim located and extracted', 'Medical assistance provided', 'Evacuated to safety', 'Situation resolved on scene', 'False alarm - confirmed safe'])
        : undefined,
      metadata: {
        signal_strength: rng.nextInt(-90, -40),
        battery_at_send: rng.nextInt(10, 100),
      },
      created_at: receivedAt.toISOString(),
      updated_at: (resolvedAt || acknowledgedAt || receivedAt.toISOString()),
    };

    alerts.push(alert);
  }

  // Sort by priority (critical first) then by time (newest first)
  return alerts.sort((a, b) => {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) return priorityDiff;
    return new Date(b.received_at).getTime() - new Date(a.received_at).getTime();
  });
}

// Calculate stats from demo data
export function calculateDemoStats(alerts: SOSAlert[], devices: Device[]): AlertStats {
  const activeAlerts = alerts.filter(a => a.status === 'active');
  const acknowledgedAlerts = alerts.filter(a => a.status === 'acknowledged' || a.status === 'responding');
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const resolvedToday = alerts.filter(a =>
    a.status === 'resolved' &&
    a.resolved_at &&
    new Date(a.resolved_at) >= todayStart
  );

  const activeDevices = devices.filter(d => {
    const lastSeen = new Date(d.last_seen);
    const hourAgo = new Date(now.getTime() - 3600000);
    return d.is_active && lastSeen >= hourAgo;
  });

  // Count by type
  const alertsByType: Record<string, number> = {};
  alerts.forEach(a => {
    alertsByType[a.emergency_type] = (alertsByType[a.emergency_type] || 0) + 1;
  });

  // Count by priority
  const alertsByPriority: Record<string, number> = {};
  alerts.forEach(a => {
    alertsByPriority[a.priority] = (alertsByPriority[a.priority] || 0) + 1;
  });

  return {
    active_count: activeAlerts.length,
    acknowledged_count: acknowledgedAlerts.length,
    resolved_today: resolvedToday.length,
    total_devices: devices.length,
    active_devices: activeDevices.length,
    alerts_by_type: alertsByType,
    alerts_by_priority: alertsByPriority,
  };
}

// Get active alerts only (for display)
export function getActiveAlerts(alerts: SOSAlert[]): SOSAlert[] {
  return alerts.filter(a => ['active', 'acknowledged', 'responding'].includes(a.status));
}

// Generate a new random alert for live simulation
export function generateNewAlert(
  scenario: DisasterScenario,
  deviceIds: string[],
  seed: number
): SOSAlert {
  const config = DISASTER_SCENARIOS[scenario];
  const rng = new SeededRandom(seed);
  const now = new Date();

  const emergencyTypes: EmergencyType[] = [config.primaryEmergencyType, 'medical', 'other'];
  const priorities: AlertPriority[] = ['critical', 'high', 'high', 'medium', 'medium', 'low'];

  const location = randomPointInRadius(config.center, config.radius * 0.7, rng);
  const emergencyType = rng.pick(emergencyTypes);
  const priority = rng.pick(priorities);
  const isDirect = rng.next() < 0.25;
  const hopCount = isDirect ? 0 : rng.nextInt(1, 4);
  const relayChain = isDirect ? [] : generateRelayChain(deviceIds, hopCount, now, rng);

  return {
    id: generateId(rng),
    message_id: `MSG-${generateId(rng).slice(0, 8).toUpperCase()}`,
    originator_device_id: rng.pick(deviceIds),
    emergency_type: emergencyType,
    priority,
    status: 'active',
    location: `POINT(${location.lng} ${location.lat})`,
    location_accuracy: rng.nextInt(5, 50),
    message: rng.pick(SOS_MESSAGES[emergencyType]),
    hop_count: hopCount,
    relay_chain: relayChain,
    delivered_by: isDirect ? undefined : relayChain[relayChain.length - 1]?.device_id,
    delivered_via: isDirect ? 'direct' : 'mesh_relay',
    originated_at: now.toISOString(),
    received_at: new Date(now.getTime() + hopCount * 1500).toISOString(),
    expires_at: new Date(now.getTime() + 24 * 3600000).toISOString(),
    responders: [],
    is_verified: false,
    metadata: {
      signal_strength: rng.nextInt(-90, -40),
      battery_at_send: rng.nextInt(20, 90),
    },
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
  };
}

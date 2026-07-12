import { GPSCoordinate } from '../types';

export interface RouteDefinition {
  origin: string;
  destination: string;
  waypoints: GPSCoordinate[];
}

export const HUBS: Record<string, { name: string } & GPSCoordinate> = {
  'WH-MUM': { name: 'Mumbai Logistics Hub', lat: 19.0760, lng: 72.8777 },
  'WH-DEL': { name: 'Delhi Dispatch Center', lat: 28.6139, lng: 77.2090 },
  'WH-BLR': { name: 'Bangalore Freight Terminal', lat: 12.9716, lng: 77.5946 },
  'WH-MAA': { name: 'Chennai Port Depot', lat: 13.0827, lng: 80.2707 },
  'WH-CCU': { name: 'Kolkata Cargo Gateway', lat: 22.5726, lng: 88.3639 }
};

// Route chains with key highway waypoints for curvy, realistic mapping polylines inside India
export const ROUTE_WAYPOINTS: RouteDefinition[] = [
  {
    origin: 'WH-MUM',
    destination: 'WH-DEL',
    waypoints: [
      { lat: 19.0760, lng: 72.8777 }, // Mumbai
      { lat: 21.1702, lng: 72.8311 }, // Surat
      { lat: 22.3072, lng: 73.1812 }, // Vadodara
      { lat: 23.0225, lng: 72.5714 }, // Ahmedabad
      { lat: 24.5854, lng: 73.7125 }, // Udaipur
      { lat: 26.9124, lng: 75.7873 }, // Jaipur
      { lat: 28.6139, lng: 77.2090 }  // Delhi
    ]
  },
  {
    origin: 'WH-DEL',
    destination: 'WH-MUM',
    waypoints: [
      { lat: 28.6139, lng: 77.2090 },
      { lat: 26.9124, lng: 75.7873 },
      { lat: 24.5854, lng: 73.7125 },
      { lat: 23.0225, lng: 72.5714 },
      { lat: 22.3072, lng: 73.1812 },
      { lat: 21.1702, lng: 72.8311 },
      { lat: 19.0760, lng: 72.8777 }
    ]
  },
  {
    origin: 'WH-MUM',
    destination: 'WH-BLR',
    waypoints: [
      { lat: 19.0760, lng: 72.8777 }, // Mumbai
      { lat: 18.5204, lng: 73.8567 }, // Pune
      { lat: 17.6805, lng: 74.0183 }, // Satara
      { lat: 16.8524, lng: 74.5564 }, // Sangli
      { lat: 15.8497, lng: 74.4977 }, // Belgaum
      { lat: 14.4426, lng: 75.9182 }, // Davanagere
      { lat: 12.9716, lng: 77.5946 }  // Bangalore
    ]
  },
  {
    origin: 'WH-BLR',
    destination: 'WH-MUM',
    waypoints: [
      { lat: 12.9716, lng: 77.5946 },
      { lat: 14.4426, lng: 75.9182 },
      { lat: 15.8497, lng: 74.4977 },
      { lat: 16.8524, lng: 74.5564 },
      { lat: 17.6805, lng: 74.0183 },
      { lat: 18.5204, lng: 73.8567 },
      { lat: 19.0760, lng: 72.8777 }
    ]
  },
  {
    origin: 'WH-DEL',
    destination: 'WH-BLR',
    waypoints: [
      { lat: 28.6139, lng: 77.2090 }, // Delhi
      { lat: 27.1767, lng: 78.0081 }, // Agra
      { lat: 26.2183, lng: 78.1828 }, // Gwalior
      { lat: 23.2599, lng: 77.4126 }, // Bhopal
      { lat: 21.1458, lng: 79.0882 }, // Nagpur
      { lat: 17.3850, lng: 78.4867 }, // Hyderabad
      { lat: 14.6819, lng: 77.6006 }, // Anantapur
      { lat: 12.9716, lng: 77.5946 }  // Bangalore
    ]
  },
  {
    origin: 'WH-BLR',
    destination: 'WH-DEL',
    waypoints: [
      { lat: 12.9716, lng: 77.5946 },
      { lat: 14.6819, lng: 77.6006 },
      { lat: 17.3850, lng: 78.4867 },
      { lat: 21.1458, lng: 79.0882 },
      { lat: 23.2599, lng: 77.4126 },
      { lat: 26.2183, lng: 78.1828 },
      { lat: 27.1767, lng: 78.0081 },
      { lat: 28.6139, lng: 77.2090 }
    ]
  },
  {
    origin: 'WH-BLR',
    destination: 'WH-MAA',
    waypoints: [
      { lat: 12.9716, lng: 77.5946 }, // Bangalore
      { lat: 12.7156, lng: 78.0076 }, // Hosur
      { lat: 12.9165, lng: 79.1325 }, // Vellore
      { lat: 12.9784, lng: 79.9770 }, // Sriperumbudur
      { lat: 13.0827, lng: 80.2707 }  // Chennai (MAA)
    ]
  },
  {
    origin: 'WH-MAA',
    destination: 'WH-BLR',
    waypoints: [
      { lat: 13.0827, lng: 80.2707 },
      { lat: 12.9784, lng: 79.9770 },
      { lat: 12.9165, lng: 79.1325 },
      { lat: 12.7156, lng: 78.0076 },
      { lat: 12.9716, lng: 77.5946 }
    ]
  },
  {
    origin: 'WH-DEL',
    destination: 'WH-CCU',
    waypoints: [
      { lat: 28.6139, lng: 77.2090 }, // Delhi
      { lat: 26.4499, lng: 80.3319 }, // Kanpur
      { lat: 25.3176, lng: 82.9739 }, // Varanasi
      { lat: 25.5941, lng: 85.1376 }, // Patna
      { lat: 23.7957, lng: 86.4304 }, // Dhanbad
      { lat: 22.5726, lng: 88.3639 }  // Kolkata (CCU)
    ]
  },
  {
    origin: 'WH-CCU',
    destination: 'WH-DEL',
    waypoints: [
      { lat: 22.5726, lng: 88.3639 },
      { lat: 23.7957, lng: 86.4304 },
      { lat: 25.5941, lng: 85.1376 },
      { lat: 25.3176, lng: 82.9739 },
      { lat: 26.4499, lng: 80.3319 },
      { lat: 28.6139, lng: 77.2090 }
    ]
  }
];

// Fallback straight-line waypoint path if no customized highway matches
export function getDirectWaypoints(originLat: number, originLng: number, destLat: number, destLng: number): GPSCoordinate[] {
  return [
    { lat: originLat, lng: originLng },
    { lat: (originLat + destLat) / 2, lng: (originLng + destLng) / 2 },
    { lat: destLat, lng: destLng }
  ];
}

// Interpolate segments to create high resolution tick steps
export function interpolateRoute(waypoints: GPSCoordinate[], resolution: number = 300): GPSCoordinate[] {
  if (waypoints.length < 2) return waypoints;
  const result: GPSCoordinate[] = [];
  const segmentsCount = waypoints.length - 1;
  const stepsPerSegment = Math.ceil(resolution / segmentsCount);

  for (let i = 0; i < segmentsCount; i++) {
    const start = waypoints[i];
    const end = waypoints[i + 1];

    for (let step = 0; step < stepsPerSegment; step++) {
      // Don't add the start coordinate on the last segment to avoid duplications
      if (i > 0 && step === 0) continue;
      const t = step / stepsPerSegment;
      result.push({
        lat: start.lat + (end.lat - start.lat) * t,
        lng: start.lng + (end.lng - start.lng) * t
      });
    }
  }

  // Push final destination coordinate
  result.push(waypoints[waypoints.length - 1]);
  return result;
}

export function findRouteWaypoints(originId: string, destId: string): GPSCoordinate[] {
  const route = ROUTE_WAYPOINTS.find(r => r.origin === originId && r.destination === destId);
  if (route) return route.waypoints;

  // Fallback if matching route not defined
  const origin = HUBS[originId];
  const dest = HUBS[destId];
  if (origin && dest) {
    return getDirectWaypoints(origin.lat, origin.lng, dest.lat, dest.lng);
  }
  return [];
}

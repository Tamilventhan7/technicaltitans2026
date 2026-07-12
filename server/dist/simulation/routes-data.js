"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ROUTE_WAYPOINTS = exports.HUBS = void 0;
exports.getDirectWaypoints = getDirectWaypoints;
exports.interpolateRoute = interpolateRoute;
exports.findRouteWaypoints = findRouteWaypoints;
exports.HUBS = {
    'WH-CHI': { name: 'Chicago Logistic Hub', lat: 41.8781, lng: -87.6298 },
    'WH-NYC': { name: 'New York Port Depot', lat: 40.7128, lng: -74.0060 },
    'WH-LAX': { name: 'Los Angeles Freight Terminal', lat: 34.0522, lng: -118.2437 },
    'WH-DFW': { name: 'Dallas Dispatch Yard', lat: 32.7767, lng: -96.7970 },
    'WH-SEA': { name: 'Seattle Port Gateway', lat: 47.6062, lng: -122.3321 }
};
// Route chains with key highway waypoints for curvy, realistic mapping polylines
exports.ROUTE_WAYPOINTS = [
    {
        origin: 'WH-CHI',
        destination: 'WH-NYC',
        waypoints: [
            { lat: 41.8781, lng: -87.6298 }, // Chicago
            { lat: 41.6764, lng: -86.2520 }, // South Bend
            { lat: 41.4993, lng: -81.6944 }, // Cleveland
            { lat: 41.1403, lng: -80.0811 }, // Mercer
            { lat: 40.8509, lng: -77.8600 }, // State College
            { lat: 40.6582, lng: -75.4744 }, // Allentown
            { lat: 40.7128, lng: -74.0060 } // New York
        ]
    },
    {
        origin: 'WH-NYC',
        destination: 'WH-CHI',
        waypoints: [
            { lat: 40.7128, lng: -74.0060 },
            { lat: 40.6582, lng: -75.4744 },
            { lat: 40.8509, lng: -77.8600 },
            { lat: 41.1403, lng: -80.0811 },
            { lat: 41.4993, lng: -81.6944 },
            { lat: 41.6764, lng: -86.2520 },
            { lat: 41.8781, lng: -87.6298 }
        ]
    },
    {
        origin: 'WH-CHI',
        destination: 'WH-SEA',
        waypoints: [
            { lat: 41.8781, lng: -87.6298 }, // Chicago
            { lat: 43.0389, lng: -87.9065 }, // Milwaukee
            { lat: 44.9778, lng: -93.2650 }, // Minneapolis
            { lat: 46.8083, lng: -100.7837 }, // Bismarck
            { lat: 45.7833, lng: -108.5007 }, // Billings
            { lat: 46.8797, lng: -113.9966 }, // Missoula
            { lat: 47.6588, lng: -117.4260 }, // Spokane
            { lat: 47.6062, lng: -122.3321 } // Seattle
        ]
    },
    {
        origin: 'WH-SEA',
        destination: 'WH-CHI',
        waypoints: [
            { lat: 47.6062, lng: -122.3321 },
            { lat: 47.6588, lng: -117.4260 },
            { lat: 46.8797, lng: -113.9966 },
            { lat: 45.7833, lng: -108.5007 },
            { lat: 46.8083, lng: -100.7837 },
            { lat: 44.9778, lng: -93.2650 },
            { lat: 43.0389, lng: -87.9065 },
            { lat: 41.8781, lng: -87.6298 }
        ]
    },
    {
        origin: 'WH-LAX',
        destination: 'WH-DFW',
        waypoints: [
            { lat: 34.0522, lng: -118.2437 }, // LA
            { lat: 33.6846, lng: -117.8265 }, // Irvine
            { lat: 32.7157, lng: -117.1611 }, // San Diego
            { lat: 32.6927, lng: -114.6276 }, // Yuma
            { lat: 33.4484, lng: -112.0740 }, // Phoenix
            { lat: 32.2226, lng: -110.9747 }, // Tucson
            { lat: 31.7619, lng: -106.4850 }, // El Paso
            { lat: 31.9973, lng: -102.0779 }, // Midland
            { lat: 32.4487, lng: -99.7331 }, // Abilene
            { lat: 32.7767, lng: -96.7970 } // Dallas
        ]
    },
    {
        origin: 'WH-DFW',
        destination: 'WH-LAX',
        waypoints: [
            { lat: 32.7767, lng: -96.7970 },
            { lat: 32.4487, lng: -99.7331 },
            { lat: 31.9973, lng: -102.0779 },
            { lat: 31.7619, lng: -106.4850 },
            { lat: 32.2226, lng: -110.9747 },
            { lat: 33.4484, lng: -112.0740 },
            { lat: 32.6927, lng: -114.6276 },
            { lat: 32.7157, lng: -117.1611 },
            { lat: 33.6846, lng: -117.8265 },
            { lat: 34.0522, lng: -118.2437 }
        ]
    },
    {
        origin: 'WH-SEA',
        destination: 'WH-LAX',
        waypoints: [
            { lat: 47.6062, lng: -122.3321 }, // Seattle
            { lat: 45.5152, lng: -122.6784 }, // Portland
            { lat: 44.0521, lng: -123.0868 }, // Eugene
            { lat: 42.3265, lng: -122.8756 }, // Medford
            { lat: 40.5865, lng: -122.3917 }, // Redding
            { lat: 38.5816, lng: -121.4944 }, // Sacramento
            { lat: 37.7749, lng: -122.4194 }, // San Francisco
            { lat: 36.6777, lng: -121.6555 }, // Salinas
            { lat: 34.4208, lng: -119.6982 }, // Santa Barbara
            { lat: 34.0522, lng: -118.2437 } // LA
        ]
    },
    {
        origin: 'WH-LAX',
        destination: 'WH-SEA',
        waypoints: [
            { lat: 34.0522, lng: -118.2437 },
            { lat: 34.4208, lng: -119.6982 },
            { lat: 36.6777, lng: -121.6555 },
            { lat: 37.7749, lng: -122.4194 },
            { lat: 38.5816, lng: -121.4944 },
            { lat: 40.5865, lng: -122.3917 },
            { lat: 42.3265, lng: -122.8756 },
            { lat: 44.0521, lng: -123.0868 },
            { lat: 45.5152, lng: -122.6784 },
            { lat: 47.6062, lng: -122.3321 }
        ]
    },
    {
        origin: 'WH-CHI',
        destination: 'WH-DFW',
        waypoints: [
            { lat: 41.8781, lng: -87.6298 }, // Chicago
            { lat: 40.4406, lng: -88.9898 }, // Bloomington
            { lat: 38.6270, lng: -90.1994 }, // St Louis
            { lat: 37.2089, lng: -93.2923 }, // Springfield
            { lat: 36.1540, lng: -95.9928 }, // Tulsa
            { lat: 35.4676, lng: -97.5164 }, // OKC
            { lat: 32.7767, lng: -96.7970 } // Dallas
        ]
    },
    {
        origin: 'WH-DFW',
        destination: 'WH-CHI',
        waypoints: [
            { lat: 32.7767, lng: -96.7970 },
            { lat: 35.4676, lng: -97.5164 },
            { lat: 36.1540, lng: -95.9928 },
            { lat: 37.2089, lng: -93.2923 },
            { lat: 38.6270, lng: -90.1994 },
            { lat: 40.4406, lng: -88.9898 },
            { lat: 41.8781, lng: -87.6298 }
        ]
    }
];
// Fallback straight-line waypoint path if no customized highway matches
function getDirectWaypoints(originLat, originLng, destLat, destLng) {
    return [
        { lat: originLat, lng: originLng },
        { lat: (originLat + destLat) / 2, lng: (originLng + destLng) / 2 },
        { lat: destLat, lng: destLng }
    ];
}
// Interpolate segments to create high resolution tick steps
function interpolateRoute(waypoints, resolution = 300) {
    if (waypoints.length < 2)
        return waypoints;
    const result = [];
    const segmentsCount = waypoints.length - 1;
    const stepsPerSegment = Math.ceil(resolution / segmentsCount);
    for (let i = 0; i < segmentsCount; i++) {
        const start = waypoints[i];
        const end = waypoints[i + 1];
        for (let step = 0; step < stepsPerSegment; step++) {
            // Don't add the start coordinate on the last segment to avoid duplications
            if (i > 0 && step === 0)
                continue;
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
function findRouteWaypoints(originId, destId) {
    const route = exports.ROUTE_WAYPOINTS.find(r => r.origin === originId && r.destination === destId);
    if (route)
        return route.waypoints;
    // Fallback if matching route not defined
    const origin = exports.HUBS[originId];
    const dest = exports.HUBS[destId];
    if (origin && dest) {
        return getDirectWaypoints(origin.lat, origin.lng, dest.lat, dest.lng);
    }
    return [];
}

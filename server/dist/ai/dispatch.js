"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDistanceKM = getDistanceKM;
exports.getDispatchRecommendations = getDispatchRecommendations;
const db_1 = require("../db");
const routes_data_1 = require("../simulation/routes-data");
// Distance calculation between two GPS coordinates (Haversine formula)
function getDistanceKM(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
}
function deg2rad(deg) {
    return deg * (Math.PI / 180);
}
// Score pairings
async function getDispatchRecommendations(originId, destId, cargoWeightKG, cargoType) {
    const vehicles = (await (0, db_1.getVehicles)()).filter(v => v.status === 'idle');
    const drivers = (await (0, db_1.getDrivers)()).filter(d => d.status === 'available');
    const config = await (0, db_1.getSimulationConfig)();
    const origin = routes_data_1.HUBS[originId];
    const dest = routes_data_1.HUBS[destId];
    if (!origin || !dest)
        return [];
    // Find waypoints and calculate route distance
    const routeWaypoints = (0, routes_data_1.findRouteWaypoints)(originId, destId);
    // Calculate total route distance
    let distanceKM = 0;
    for (let i = 0; i < routeWaypoints.length - 1; i++) {
        distanceKM += getDistanceKM(routeWaypoints[i].lat, routeWaypoints[i].lng, routeWaypoints[i + 1].lat, routeWaypoints[i + 1].lng);
    }
    if (distanceKM === 0) {
        distanceKM = getDistanceKM(origin.lat, origin.lng, dest.lat, dest.lng);
    }
    // Adjust distance slightly for real-world driving multiplier
    distanceKM = Math.round(distanceKM * 1.15);
    const recommendations = [];
    // If no available trucks or drivers, return empty list
    if (vehicles.length === 0 || drivers.length === 0) {
        return [];
    }
    // Iterate over vehicles and drivers to find combinations
    for (const vehicle of vehicles) {
        // Capacity validations
        let capacityLimitKG = 2000; // Sprinter Van
        if (vehicle.type === 'Heavy Duty Truck')
            capacityLimitKG = 25000;
        else if (vehicle.type === 'Reefer')
            capacityLimitKG = 20000;
        else if (vehicle.type === 'Medium Cargo')
            capacityLimitKG = 10000;
        const isOverloaded = cargoWeightKG > capacityLimitKG;
        // Prevent small vans from taking extreme heavy container loads
        if (isOverloaded && cargoWeightKG > 45000 && (vehicle.type === 'Sprinter Van' || vehicle.type === 'Medium Cargo')) {
            continue;
        }
        for (const driver of drivers) {
            // Driver active hours validation (e.g. check if driver will exceed 11h driving)
            const avgSpeed = vehicle.type === 'Sprinter Van' ? 95 : 80;
            const durationHours = distanceKM / avgSpeed;
            if (driver.activeHoursToday + durationHours > 11)
                continue; // driver hours limit risk
            // Calculate fuel burn prediction
            const cargoFactor = (cargoWeightKG / 10000) * 0.05;
            let weatherFactor = 1.0;
            if (config.weatherSeverity === 'storm')
                weatherFactor = 1.25;
            else if (config.weatherSeverity === 'rain')
                weatherFactor = 1.1;
            const predictedEfficiency = vehicle.fuelEfficiency / ((1 + cargoFactor) * weatherFactor);
            const expectedFuel = distanceKM / predictedEfficiency;
            // Predict financials (Rupees conversion)
            const fuelCost = expectedFuel * 95.0 * config.fuelPriceMultiplier;
            const driverCost = distanceKM * 5.0;
            const tollCost = distanceKM * 2.0;
            const totalCost = fuelCost + driverCost + tollCost;
            let baseRate = 35.00;
            if (cargoType.toLowerCase() === 'hazmat')
                baseRate = 55.00;
            else if (cargoType.toLowerCase() === 'cold-chain')
                baseRate = 45.00;
            else if (cargoType.toLowerCase() === 'high-value')
                baseRate = 48.00;
            const revenue = distanceKM * baseRate * (1 + (cargoWeightKG / 25000) * 0.3);
            const profit = revenue - totalCost;
            // Match scoring logic
            const driverSafetyScore = driver.safetyScore * 0.4;
            const driverRatingScore = (driver.rating / 5.0) * 100 * 0.2;
            const driverFactor = driverSafetyScore + driverRatingScore;
            const healthFactor = vehicle.healthScore * 0.15;
            let typeMatch = 15;
            if (cargoWeightKG > 8000 && vehicle.type !== 'Heavy Duty Truck' && vehicle.type !== 'Reefer') {
                typeMatch = 5;
            }
            const vehicleFactor = healthFactor + typeMatch;
            const efficiencyFactor = Math.min(10, vehicle.fuelEfficiency * 1.2);
            let score = Math.round(driverFactor + vehicleFactor + efficiencyFactor);
            // Penalties
            if (vehicle.healthScore < 70)
                score -= 15;
            if (driver.safetyScore < 80)
                score -= 15;
            if (vehicle.currentFuel < expectedFuel) {
                score -= 5;
            }
            if (isOverloaded) {
                score -= 40; // Deduct score heavily for safety overload
            }
            const finalScore = Math.max(10, Math.min(100, score));
            // Construct reasoning text
            let reasoning = '';
            if (isOverloaded) {
                reasoning = `CRITICAL WARNING: Cargo weight (${cargoWeightKG.toLocaleString()} KG) exceeds safety capacity rating of this ${vehicle.type} (${capacityLimitKG.toLocaleString()} KG). Overload hazard detected.`;
            }
            else {
                reasoning = `Recommended based on Driver ${driver.name}'s safety score of ${driver.safetyScore}% `;
                if (vehicle.type === 'Reefer' && cargoType.toLowerCase() === 'cold-chain') {
                    reasoning += `and the Reefer asset's cooling capabilities for cold-chain inventory.`;
                }
                else if (vehicle.healthScore > 90) {
                    reasoning += `and high asset mechanical health (${vehicle.healthScore}%).`;
                }
                else {
                    reasoning += `and optimal asset capacity matching.`;
                }
            }
            if (vehicle.currentFuel < expectedFuel) {
                reasoning += ` Note: Refueling stop of ${Math.round(expectedFuel - vehicle.currentFuel)}L required en route.`;
            }
            recommendations.push({
                driver,
                vehicle,
                route: routeWaypoints,
                estimatedDistanceKM: Math.round(distanceKM),
                estimatedDurationHours: parseFloat(durationHours.toFixed(1)),
                expectedFuelLiters: Math.round(expectedFuel),
                expectedCostUSD: Math.round(totalCost),
                expectedRevenueUSD: Math.round(revenue),
                expectedProfitUSD: Math.round(profit),
                matchScore: finalScore,
                reasoning
            });
        }
    }
    // Sort by highest match score, then highest profit
    return recommendations
        .sort((a, b) => b.matchScore - a.matchScore || b.expectedProfitUSD - a.expectedProfitUSD)
        .slice(0, 3);
}

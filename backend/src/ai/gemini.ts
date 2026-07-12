import { GoogleGenerativeAI } from '@google/generative-ai';
import { Vehicle, Driver, Trip, Alert, MaintenanceRecord, FuelLog } from '../models';
import { getSimulationConfig } from '../db';
import { processLocalNLPQuery, AIResponse } from './nlp-agent';

const apiKey = process.env.GEMINI_API_KEY || '';

export async function askAiCopilot(query: string): Promise<AIResponse> {
  if (!apiKey) {
    console.log('GEMINI_API_KEY not found. Using local NLP fallback agent.');
    return processLocalNLPQuery(query);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Gather database state for AI context
    const vehicles = await Vehicle.find({ isDeleted: false });
    const drivers = await Driver.find({ isDeleted: false });
    const trips = await Trip.find({ isDeleted: false });
    const alerts = await Alert.find({ isDeleted: false });
    const maintenance = await MaintenanceRecord.find({ isDeleted: false });
    const config = await getSimulationConfig();

    const systemPrompt = `
You are TransitOps AI+, the voice and decision-making engine of an advanced Fleet Operations Center.
You are given the live data state of the logistics company below:

---
VEHICLES:
${JSON.stringify(vehicles.map(v => ({ id: v.id, type: v.type, status: v.status, fuel: v.currentFuel, health: v.healthScore, speed: v.gps.speed, temp: v.telemetry.engineTemp })))}

DRIVERS:
${JSON.stringify(drivers.map(d => ({ id: d.id, name: d.name, status: d.status, score: d.safetyScore, rating: d.rating, points: d.gamification.points, tier: d.gamification.tier })))}

ACTIVE TRIPS:
${JSON.stringify(trips.filter(t => t.status === 'in-transit' || t.status === 'delayed').map(t => ({ id: t.id, origin: t.origin.name, dest: t.destination.name, status: t.status, cargo: t.cargoType, eta: t.estimatedArrivalTime, profit: t.financials.profit })))}

ACTIVE ALERTS:
${JSON.stringify(alerts.filter((a: any) => !a.resolved).map((a: any) => ({ id: a.id, vehicle: a.vehicleId, driver: a.driverId, category: a.category, msg: a.message, severity: a.severity })))}

SIMULATION SETTINGS:
${JSON.stringify(config)}
---

Answer the user's fleet-related query using this data.
You MUST respond with a JSON object ONLY matching this schema:
{
  "message": "Write a helpful, detailed response in GitHub Markdown format. Reference specific trucks, drivers, or numbers. Outline suggestions, reasons, and actions.",
  "widget": {
    "type": "chart" | "list" | "actions" | "kpis",
    "title": "Short descriptive title for the visual element",
    "data": [
      // For "chart": array of objects: { name: string, value: number, ... }
      // For "list": array of objects: { label: string, subLabel: string, value: string, status: 'success'|'warning'|'danger' }
      // For "actions": array of objects: { id: string, actionLabel: string, title: string, description: string, payload: object }
      // For "kpis": array of objects: { label: string, value: string | number }
    ]
  }
}

Important Widget formatting:
- If answering about safety or rankings, use "list" with status colors.
- If answering about expenses, reports, profit or trends, use "chart".
- If recommending actions (like scheduling maintenance, coaching drivers, rerouting), use "actions".
- If summarizing high-level executive statistics, use "kpis".
- The "widget" property is OPTIONAL. Only include it if there is a natural visual display for the user's question.

Ensure your response is valid JSON. Do not include any backticks or markdown fence outside the JSON block. Return ONLY the JSON object.
`;

    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: systemPrompt,
      generationConfig: {
        responseMimeType: 'application/json'
      }
    });

    const result = await model.generateContent(query);
    const response = await result.response;
    const text = response.text() || '';

    try {
      const parsed: AIResponse = JSON.parse(text);
      return parsed;
    } catch (parseErr) {
      console.error('Failed to parse Gemini JSON output. Raw text:', text, parseErr);
      return processLocalNLPQuery(query);
    }
  } catch (err) {
    console.error('Error during Gemini API call, falling back to local NLP:', err);
    return processLocalNLPQuery(query);
  }
}

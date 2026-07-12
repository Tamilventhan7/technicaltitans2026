import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { DispatchRecommendation } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, Sparkles, Brain, Award, ShieldCheck, ArrowRight, ArrowLeft, User, Truck, Check, MapPin, Layers, Briefcase, FileText
} from 'lucide-react';

export const DispatchBoard: React.FC = () => {
  const { warehouses, drivers, vehicles, dispatchTrip } = useApp();
  
  // Mode Selector: 'ai' or 'manual'
  const [dispatchMode, setDispatchMode] = useState<'ai' | 'manual'>('ai');

  // AI Matching Form State
  const [origin, setOrigin] = useState('WH-CHI');
  const [destination, setDestination] = useState('WH-NYC');
  const [cargoType, setCargoType] = useState('hazmat');
  const [cargoWeight, setCargoWeight] = useState(12000);
  const [recommendations, setRecommendations] = useState<DispatchRecommendation[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [dispatching, setDispatching] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Manual Wizard State (Steps 1 to 7)
  const [currentStep, setCurrentStep] = useState(1);
  const [customerName, setCustomerName] = useState('Acme Logistics Corp');
  const [contractId, setContractId] = useState('CON-992A');
  const [pickupWarehouse, setPickupWarehouse] = useState('WH-CHI');
  const [dropWarehouse, setDropWarehouse] = useState('WH-NYC');
  const [cargoClass, setCargoClass] = useState('standard');
  const [cargoLoadWeight, setCargoLoadWeight] = useState(8500);
  const [manualDriverId, setManualDriverId] = useState('');
  const [manualVehicleId, setManualVehicleId] = useState('');

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

  // Automatically trigger recommendation audit on form change
  const fetchRecommendations = async () => {
    setLoadingOptions(true);
    setSuccessMsg(null);
    try {
      const res = await fetch(`${backendUrl}/api/ai/dispatch-recommendation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originId: origin,
          destinationId: destination,
          cargoWeightKG: Number(cargoWeight),
          cargoType
        })
      });
      const data = await res.json();
      setRecommendations(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingOptions(false);
    }
  };

  useEffect(() => {
    if (dispatchMode === 'ai') {
      fetchRecommendations();
    }
  }, [origin, destination, cargoType, cargoWeight, dispatchMode]);

  // Set default driver/vehicle when entering step 4/5 in manual mode
  useEffect(() => {
    if (!manualDriverId && drivers.length > 0) {
      const available = drivers.find(d => d.status === 'available');
      setManualDriverId(available ? available.id : drivers[0].id);
    }
  }, [drivers, currentStep]);

  useEffect(() => {
    if (!manualVehicleId && vehicles.length > 0) {
      const available = vehicles.find(v => v.status === 'idle');
      setManualVehicleId(available ? available.id : vehicles[0].id);
    }
  }, [vehicles, currentStep]);

  const handleAIDispatch = async (rec: DispatchRecommendation) => {
    setDispatching(rec.vehicle.id);
    try {
      await dispatchTrip({
        originId: origin,
        destinationId: destination,
        vehicleId: rec.vehicle.id,
        driverId: rec.driver.id,
        cargoType,
        cargoWeightKG: Number(cargoWeight)
      });
      setSuccessMsg(`Successfully Dispatched Trip ${rec.vehicle.id} with Driver ${rec.driver.name}!`);
      setRecommendations([]);
      fetchRecommendations();
    } catch (err: any) {
      alert(err.message || 'Dispatch failure');
    } finally {
      setDispatching(null);
    }
  };

  const handleManualConfirmDispatch = async () => {
    setDispatching('manual-dispatch');
    try {
      const driverObj = drivers.find(d => d.id === manualDriverId);
      await dispatchTrip({
        originId: pickupWarehouse,
        destinationId: dropWarehouse,
        vehicleId: manualVehicleId,
        driverId: manualDriverId,
        cargoType: cargoClass,
        cargoWeightKG: Number(cargoLoadWeight)
      });
      setSuccessMsg(`Successfully Dispatched Trip ${manualVehicleId} with Driver ${driverObj?.name || manualDriverId}!`);
      setCurrentStep(7); // Jump to Confirm checked step
      setTimeout(() => {
        // Reset form after short wait
        setCurrentStep(1);
        setSuccessMsg(null);
      }, 4000);
    } catch (err: any) {
      alert(err.message || 'Manual dispatch failed');
    } finally {
      setDispatching(null);
    }
  };

  const nextStep = () => {
    if (currentStep < 6) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const activeDriverObj = drivers.find(d => d.id === manualDriverId);
  const activeVehicleObj = vehicles.find(v => v.id === manualVehicleId);

  return (
    <div className="space-y-6 text-slate-100 font-sans">
      
      {/* Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-900 pb-5">
        <div>
          <h2 className="text-xl font-extrabold text-slate-100 flex items-center space-x-2.5">
            <Brain className="w-5.5 h-5.5 text-blue-400" />
            <span>Smart Dispatch Control Board</span>
          </h2>
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-1">
            Toggle between AI match automation and structural step-by-step route wizard.
          </p>
        </div>

        {/* Mode switch pills */}
        <div className="bg-slate-950 border border-slate-850 p-1.5 rounded-2xl flex space-x-1.5 shadow-inner">
          <button
            onClick={() => { setDispatchMode('ai'); setSuccessMsg(null); }}
            className={`px-4 py-2 text-[10px] uppercase font-black tracking-widest rounded-xl transition-all flex items-center space-x-1.5 ${
              dispatchMode === 'ai'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/10'
                : 'text-slate-450 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Auto-Match</span>
          </button>
          <button
            onClick={() => { setDispatchMode('manual'); setSuccessMsg(null); }}
            className={`px-4 py-2 text-[10px] uppercase font-black tracking-widest rounded-xl transition-all flex items-center space-x-1.5 ${
              dispatchMode === 'manual'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/10'
                : 'text-slate-450 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Manual Wizard</span>
          </button>
        </div>
      </div>

      {dispatchMode === 'ai' ? (
        /* ======================== MODE A: AI AUTOMATCH ======================== */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Form Selector (4 cols) */}
          <div className="lg:col-span-4 glass-panel p-6 rounded-3xl border border-slate-850 space-y-4">
            <h3 className="text-xs font-black uppercase text-slate-350 tracking-wider mb-4 border-b border-slate-850 pb-3">
              Shipment Specifications
            </h3>

            <div className="space-y-4 text-xs font-semibold text-slate-350">
              <div className="space-y-1.5">
                <label className="block text-[10px] text-slate-400 uppercase tracking-widest">Origin Warehouse</label>
                <select
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl p-3 text-slate-200 text-xs font-bold focus:outline-none focus:border-blue-500/30 cursor-pointer"
                >
                  {warehouses.map(w => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] text-slate-400 uppercase tracking-widest">Destination Hub</label>
                <select
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl p-3 text-slate-200 text-xs font-bold focus:outline-none focus:border-blue-500/30 cursor-pointer"
                >
                  {warehouses.filter(w => w.id !== origin).map(w => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] text-slate-400 uppercase tracking-widest">Cargo Classification</label>
                <select
                  value={cargoType}
                  onChange={(e) => setCargoType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl p-3 text-slate-200 text-xs font-bold focus:outline-none focus:border-blue-500/30 cursor-pointer"
                >
                  <option value="standard">Standard Dry Freight</option>
                  <option value="cold-chain">Cold Chain Reefers</option>
                  <option value="hazmat">Chemicals (HazMat)</option>
                  <option value="high-value">High Value Electronics</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] text-slate-400 uppercase tracking-widest">Payload Weight (KG)</label>
                <input
                  type="number"
                  value={cargoWeight}
                  onChange={(e) => setCargoWeight(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl p-3 text-slate-200 text-xs font-mono font-bold focus:outline-none focus:border-blue-500/30"
                  min="500"
                  max="25000"
                />
              </div>
            </div>
          </div>

          {/* Scored Pairings (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span>AI Scored Pairings</span>
              </h4>
              {loadingOptions && (
                <span className="text-[10px] text-slate-500 animate-pulse">Running match calculations...</span>
              )}
            </div>

            {successMsg && (
              <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-xs font-bold shadow-lg animate-pulse flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                <span>{successMsg}</span>
              </div>
            )}

            {recommendations.length === 0 && !loadingOptions && !successMsg && (
              <div className="glass-panel p-12 rounded-3xl border border-slate-850 text-center text-slate-500 text-xs font-bold">
                No active idle matches found. Verify that fleet vehicles are idle and drivers are off shift.
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recommendations.map((rec, index) => {
                const isBest = index === 0;
                return (
                  <div 
                    key={rec.vehicle.id} 
                    className={`glass-panel p-6 rounded-3xl border transition-all duration-200 flex flex-col justify-between ${
                      isBest 
                        ? 'border-blue-500/20 bg-blue-950/5 shadow-[0_0_20px_rgba(59,130,246,0.04)]' 
                        : 'border-slate-850 hover:border-slate-800'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <span className={`px-2 py-0.5 rounded text-[8.5px] font-black uppercase border ${
                          isBest 
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' 
                            : 'bg-slate-850 text-slate-400 border-slate-800'
                        }`}>
                          {isBest ? 'AI Recommended Match' : `Route Pairing Option #${index + 1}`}
                        </span>
                        <span className="font-extrabold text-sm text-slate-200">{rec.matchScore}% Match</span>
                      </div>

                      <p className="text-[11px] text-slate-400 italic mb-4 leading-relaxed bg-slate-950/40 p-3 rounded-2xl border border-slate-850">
                        "{rec.reasoning}"
                      </p>

                      <div className="space-y-3.5 mb-6 border-b border-slate-850 pb-4 text-xs font-semibold">
                        <div>
                          <div className="text-[9.5px] text-slate-500 uppercase tracking-widest">Vehicle Asset</div>
                          <div className="text-slate-200 mt-0.5">{rec.vehicle.id} ({rec.vehicle.type})</div>
                          <div className="text-[9.5px] text-slate-500 font-mono mt-0.5">Health Score: {rec.vehicle.healthScore}% • fuel capacity: {rec.vehicle.fuelCapacity}L</div>
                        </div>

                        <div>
                          <div className="text-[9.5px] text-slate-500 uppercase tracking-widest">Driver Pilot</div>
                          <div className="text-slate-200 mt-0.5">{rec.driver.name}</div>
                          <div className="text-[9.5px] text-slate-500 font-mono mt-0.5">Safety Index: {rec.driver.safetyScore}% • Tier: {rec.driver.gamification.tier}</div>
                        </div>
                      </div>

                      {/* Travel Estimates */}
                      <div className="grid grid-cols-2 gap-3.5 mb-6 text-xs bg-slate-950/20 p-3.5 rounded-2xl border border-slate-850">
                        <div>
                          <span className="text-[9.5px] text-slate-500 font-bold uppercase tracking-wider block">Route Distance</span>
                          <span className="font-bold text-slate-350 mt-0.5">{rec.estimatedDistanceKM} KM</span>
                        </div>
                        <div>
                          <span className="text-[9.5px] text-slate-500 font-bold uppercase tracking-wider block">Duration</span>
                          <span className="font-bold text-slate-350 mt-0.5">{rec.estimatedDurationHours} Hours</span>
                        </div>
                        <div>
                          <span className="text-[9.5px] text-slate-500 font-bold uppercase tracking-wider block">Required Fuel</span>
                          <span className="font-bold text-slate-350 mt-0.5">{rec.expectedFuelLiters} L</span>
                        </div>
                        <div>
                          <span className="text-[9.5px] text-slate-500 font-bold uppercase tracking-wider block">Est. Profit Margin</span>
                          <span className="font-extrabold text-emerald-400 mt-0.5">${rec.expectedProfitUSD}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      disabled={dispatching !== null}
                      onClick={() => handleAIDispatch(rec)}
                      className={`w-full py-3.5 rounded-xl font-extrabold text-xs flex items-center justify-center space-x-2 transition-all active:scale-98 ${
                        isBest
                          ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/10'
                          : 'bg-slate-900 text-slate-300 border border-slate-850 hover:bg-slate-850'
                      }`}
                    >
                      <span>{dispatching === rec.vehicle.id ? 'Dispatching...' : 'Confirm & Dispatch Dispatch'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                  </div>
                );
              })}
            </div>

          </div>

        </div>
      ) : (
        /* ======================== MODE B: MANUAL WIZARD ======================== */
        <div className="space-y-6">
          
          {/* Progress Circle Track */}
          <div className="glass-panel p-5.5 rounded-3xl border border-slate-850 max-w-4xl mx-auto flex justify-between items-center relative overflow-hidden">
            
            {/* Background line */}
            <div className="absolute top-1/2 left-8 right-8 h-0.5 bg-slate-850 -translate-y-1/2 z-0" />

            {/* Simulated active fill line */}
            <div 
              className="absolute top-1/2 left-8 h-0.5 bg-blue-600 -translate-y-1/2 z-0 transition-all duration-300"
              style={{ width: `${((currentStep - 1) / 5) * 88}%` }}
            />

            {[1, 2, 3, 4, 5, 6].map((num) => {
              const isActive = num <= currentStep;
              const isCurrent = num === currentStep;
              
              const stepLabels = ['Customer', 'Pickup', 'Drop-off', 'Driver', 'Vehicle', 'Review'];

              return (
                <div key={num} className="flex flex-col items-center relative z-10">
                  <div className={`w-8.5 h-8.5 rounded-full flex items-center justify-center text-xs font-bold border transition-all duration-200 ${
                    isCurrent
                      ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/10 scale-110'
                      : isActive
                      ? 'bg-slate-950 text-blue-400 border-blue-500/30'
                      : 'bg-slate-950 text-slate-500 border-slate-850'
                  }`}>
                    {isActive && num < currentStep ? <Check className="w-4 h-4" /> : num}
                  </div>
                  <span className={`text-[9px] uppercase tracking-wider font-extrabold mt-2 ${
                    isCurrent ? 'text-blue-400' : isActive ? 'text-slate-350' : 'text-slate-550'
                  }`}>
                    {stepLabels[num - 1]}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Form Step Switch Case */}
          <div className="max-w-xl mx-auto glass-panel p-8 rounded-3xl border border-slate-850 min-h-[300px] flex flex-col justify-between relative">
            
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-4 flex-1"
              >
                
                {/* STEP 1: CUSTOMER */}
                {currentStep === 1 && (
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-xs font-black uppercase text-slate-350 tracking-wider mb-1 flex items-center space-x-1">
                        <Briefcase className="w-4 h-4 text-blue-400" />
                        <span>Step 1: Account & Contracts</span>
                      </h4>
                      <p className="text-[10.5px] text-slate-500">Provide account invoice details</p>
                    </div>

                    <div className="space-y-1.5 text-xs font-semibold">
                      <label className="block text-[10px] text-slate-400 uppercase tracking-widest">Customer Corporate Client</label>
                      <input 
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl p-3 text-slate-200 text-xs font-bold focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5 text-xs font-semibold">
                      <label className="block text-[10px] text-slate-400 uppercase tracking-widest">Contract SLA Reference ID</label>
                      <input 
                        type="text"
                        value={contractId}
                        onChange={(e) => setContractId(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl p-3 text-slate-200 text-xs font-mono font-bold focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* STEP 2: PICKUP */}
                {currentStep === 2 && (
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-xs font-black uppercase text-slate-350 tracking-wider mb-1 flex items-center space-x-1">
                        <MapPin className="w-4 h-4 text-blue-400" />
                        <span>Step 2: Pickup Logistics</span>
                      </h4>
                      <p className="text-[10.5px] text-slate-500">Specify payload pickup parameters</p>
                    </div>

                    <div className="space-y-1.5 text-xs font-semibold">
                      <label className="block text-[10px] text-slate-400 uppercase tracking-widest">Origin Warehouse</label>
                      <select
                        value={pickupWarehouse}
                        onChange={(e) => setPickupWarehouse(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl p-3 text-slate-200 text-xs font-bold focus:outline-none cursor-pointer"
                      >
                        {warehouses.map(w => (
                          <option key={w.id} value={w.id}>{w.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5 text-xs font-semibold">
                      <label className="block text-[10px] text-slate-400 uppercase tracking-widest">Cargo Payload Weight (KG)</label>
                      <input
                        type="number"
                        value={cargoLoadWeight}
                        onChange={(e) => setCargoLoadWeight(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl p-3 text-slate-200 text-xs font-mono font-bold focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* STEP 3: DROP */}
                {currentStep === 3 && (
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-xs font-black uppercase text-slate-350 tracking-wider mb-1 flex items-center space-x-1">
                        <MapPin className="w-4 h-4 text-emerald-400" />
                        <span>Step 3: Drop-Off Hub</span>
                      </h4>
                      <p className="text-[10.5px] text-slate-500">Specify shipment destination</p>
                    </div>

                    <div className="space-y-1.5 text-xs font-semibold">
                      <label className="block text-[10px] text-slate-400 uppercase tracking-widest">Destination Warehouse</label>
                      <select
                        value={dropWarehouse}
                        onChange={(e) => setDropWarehouse(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl p-3 text-slate-200 text-xs font-bold focus:outline-none cursor-pointer"
                      >
                        {warehouses.filter(w => w.id !== pickupWarehouse).map(w => (
                          <option key={w.id} value={w.id}>{w.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5 text-xs font-semibold">
                      <label className="block text-[10px] text-slate-400 uppercase tracking-widest">Cargo Category</label>
                      <select
                        value={cargoClass}
                        onChange={(e) => setCargoClass(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl p-3 text-slate-200 text-xs font-bold focus:outline-none cursor-pointer"
                      >
                        <option value="standard">Standard Dry Freight</option>
                        <option value="cold-chain">Cold Chain Reefers</option>
                        <option value="hazmat">Chemicals (HazMat)</option>
                        <option value="high-value">High Value Electronics</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* STEP 4: ASSIGN DRIVER */}
                {currentStep === 4 && (
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-xs font-black uppercase text-slate-350 tracking-wider mb-1 flex items-center space-x-1">
                        <User className="w-4 h-4 text-blue-400" />
                        <span>Step 4: Driver Match</span>
                      </h4>
                      <p className="text-[10.5px] text-slate-500">Select active shift driver profile</p>
                    </div>

                    <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                      {drivers.map(d => {
                        const isSelected = d.id === manualDriverId;
                        return (
                          <div 
                            key={d.id} 
                            onClick={() => setManualDriverId(d.id)}
                            className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between text-xs ${
                              isSelected 
                                ? 'bg-blue-600/10 border-blue-500/30' 
                                : 'bg-slate-950/40 border-slate-850 hover:bg-slate-950'
                            }`}
                          >
                            <div>
                              <div className="font-bold text-slate-200">{d.name} ({d.id})</div>
                              <span className="text-[9.5px] text-slate-500 font-mono">License: {d.licenseNumber}</span>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-slate-200 font-mono">Safety: {d.safetyScore}</div>
                              <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                                d.status === 'available' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              }`}>{d.status}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* STEP 5: ASSIGN VEHICLE */}
                {currentStep === 5 && (
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-xs font-black uppercase text-slate-350 tracking-wider mb-1 flex items-center space-x-1">
                        <Truck className="w-4 h-4 text-blue-400" />
                        <span>Step 5: Vehicle Selection</span>
                      </h4>
                      <p className="text-[10.5px] text-slate-500">Select transport vehicle asset</p>
                    </div>

                    <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                      {vehicles.map(v => {
                        const isSelected = v.id === manualVehicleId;
                        return (
                          <div 
                            key={v.id} 
                            onClick={() => setManualVehicleId(v.id)}
                            className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between text-xs ${
                              isSelected 
                                ? 'bg-blue-600/10 border-blue-500/30' 
                                : 'bg-slate-950/40 border-slate-850 hover:bg-slate-950'
                            }`}
                          >
                            <div>
                              <div className="font-bold text-slate-200">{v.id} ({v.type})</div>
                              <span className="text-[9.5px] text-slate-500 font-mono">Plate: {v.plateNumber}</span>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-slate-200 font-mono">Health: {v.healthScore}%</div>
                              <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                                v.status === 'idle' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                              }`}>{v.status}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* STEP 6: REVIEW SUMMARY */}
                {currentStep === 6 && (
                  <div className="space-y-4 text-xs font-semibold">
                    <div>
                      <h4 className="text-xs font-black uppercase text-slate-350 tracking-wider mb-1 flex items-center space-x-1">
                        <FileText className="w-4 h-4 text-blue-400" />
                        <span>Step 6: Audit Review</span>
                      </h4>
                      <p className="text-[10.5px] text-slate-500">Confirm final dispatch configurations</p>
                    </div>

                    <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-850 space-y-3">
                      <div className="flex justify-between items-center border-b border-slate-850 pb-2">
                        <span className="text-slate-500 font-bold uppercase text-[9.5px]">Client Customer</span>
                        <span className="text-slate-200 font-bold">{customerName} ({contractId})</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-slate-850 pb-2">
                        <span className="text-slate-500 font-bold uppercase text-[9.5px]">Route Path</span>
                        <span className="text-slate-200 font-bold font-mono">{pickupWarehouse} ➔ {dropWarehouse}</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-slate-850 pb-2">
                        <span className="text-slate-500 font-bold uppercase text-[9.5px]">Cargo Details</span>
                        <span className="text-slate-200 font-bold">{cargoClass} ({cargoLoadWeight} KG)</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-slate-850 pb-2">
                        <span className="text-slate-500 font-bold uppercase text-[9.5px]">Driver Pilot</span>
                        <span className="text-slate-200 font-bold">{activeDriverObj?.name || manualDriverId}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 font-bold uppercase text-[9.5px]">Vehicle Truck</span>
                        <span className="text-slate-200 font-bold">{activeVehicleObj?.id || manualVehicleId}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 7: CONFIRMED SUCCESS */}
                {currentStep === 7 && (
                  <div className="flex flex-col items-center justify-center text-center py-6 space-y-4">
                    <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/5 animate-pulse">
                      <Check className="w-7 h-7" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-100 text-sm">Shipment Dispatched Successfully</h4>
                      <p className="text-[11px] text-slate-500 mt-1 uppercase tracking-wider font-bold">
                        Driver and truck logs updated. Telematics trackers active.
                      </p>
                    </div>
                  </div>
                )}

              </motion.div>
            </AnimatePresence>

            {/* Prev / Next controls */}
            {currentStep <= 6 && (
              <div className="mt-8 pt-4 border-t border-slate-850 flex justify-between">
                <button
                  disabled={currentStep === 1}
                  onClick={prevStep}
                  className="px-4 py-2.5 rounded-xl border border-slate-850 hover:bg-slate-900 text-slate-450 hover:text-slate-200 text-xs font-bold flex items-center space-x-1.5 transition-all disabled:opacity-50"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>

                {currentStep === 6 ? (
                  <button
                    onClick={handleManualConfirmDispatch}
                    disabled={dispatching !== null}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-extrabold flex items-center space-x-1.5 transition-all shadow-lg shadow-emerald-500/10 active:scale-98"
                  >
                    <span>{dispatching === 'manual-dispatch' ? 'Confirming...' : 'Dispatch Shipment'}</span>
                    <Check className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={nextStep}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-extrabold flex items-center space-x-1.5 transition-all shadow-lg shadow-blue-500/10 active:scale-98"
                  >
                    <span>Next</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
};

export default DispatchBoard;

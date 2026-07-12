import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Smartphone, ShieldAlert, Award, Compass, Camera, FileSignature, Send, AlertTriangle, ShieldCheck, Heart, User } from 'lucide-react';

export const MobileDriverApp: React.FC = () => {
  const { drivers, trips, submitPod, injectIncident } = useApp();

  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [odometer, setOdometer] = useState(120500);
  const [fuelLiters, setFuelLiters] = useState(100);
  const [fuelCost, setFuelCost] = useState(150);
  const [podReceiver, setPodReceiver] = useState('John Doe');
  const [station, setStation] = useState('Shell Route-80 North');
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [submittingPod, setSubmittingPod] = useState(false);
  const [success, setSuccess] = useState(false);

  // Filter for active driver & trip
  const activeDriver = drivers.find(d => d.id === selectedDriverId);
  const activeTrip = trips.find(t => t.driverId === selectedDriverId && (t.status === 'in-transit' || t.status === 'delayed'));

  useEffect(() => {
    if (drivers.length > 0 && !selectedDriverId) {
      const driving = drivers.find(d => d.status === 'driving');
      if (driving) setSelectedDriverId(driving.id);
      else setSelectedDriverId(drivers[0].id);
    }
  }, [drivers]);

  // Sync odometer if trip exists
  useEffect(() => {
    if (activeTrip) {
      setOdometer(Math.round(120500 + activeTrip.currentRouteIndex * 5));
    }
  }, [activeTrip]);

  const handleSOS = async () => {
    if (!activeTrip) return;
    try {
      await injectIncident(activeTrip.id, 'accident');
      alert(`Emergency SOS Triggered! Ops Command and Safety Teams have been notified with your GPS coordinates.`);
    } catch (err) {
      console.error(err);
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 3;
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const handlePodSubmit = async () => {
    if (!activeTrip || !hasSignature) return;

    setSubmittingPod(true);
    try {
      const signatureBase64 = canvasRef.current?.toDataURL() || '';
      const mockPhotoBase64 = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';

      await submitPod({
        tripId: activeTrip.id,
        signature: signatureBase64,
        photoUrl: mockPhotoBase64,
        receivedBy: podReceiver,
        odometer: odometer
      });

      setSuccess(true);
      clearCanvas();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || 'POD upload failed');
    } finally {
      setSubmittingPod(false);
    }
  };

  return (
    <div className="space-y-6 font-sans text-slate-100">
      
      {/* Top Header & Selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/30 p-5 border border-slate-850 rounded-3xl">
        <div>
          <h2 className="text-xl font-extrabold text-slate-100 flex items-center space-x-2.5">
            <Smartphone className="w-5.5 h-5.5 text-blue-400" />
            <span>Driver Dispatch Portal</span>
          </h2>
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-1">
            Web interface for logging active shipments, fuel receipts, and delivery receipts.
          </p>
        </div>

        {/* Driver selector */}
        <div className="flex items-center space-x-3 bg-slate-950/80 border border-slate-850 p-2.5 rounded-2xl">
          <span className="text-[10px] text-slate-500 uppercase font-black tracking-wider">Active Shift User:</span>
          <select
            value={selectedDriverId}
            onChange={(e) => setSelectedDriverId(e.target.value)}
            className="bg-transparent border-none focus:outline-none text-xs font-bold text-blue-400 cursor-pointer"
          >
            {drivers.map(d => (
              <option key={d.id} value={d.id}>{d.name} ({d.status})</option>
            ))}
          </select>
        </div>
      </div>

      {activeTrip ? (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch relative">
          
          {/* Left Columns (8 cols): Trip Info, Navigation, Odometer/Fuel */}
          <div className="xl:col-span-8 space-y-6">
            
            {/* Shift Summary Header */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-850 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-blue-950/15">
              <div className="space-y-1">
                <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  Active Transit Shift
                </span>
                <h3 className="text-md font-black text-slate-200">{activeTrip.id} ➔ {activeTrip.destination?.name}</h3>
                <p className="text-xs text-slate-400 font-medium">Cargo: {activeTrip.cargoType} ({activeTrip.cargoWeight} KG)</p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleSOS}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-extrabold rounded-xl flex items-center space-x-2 border border-red-500 shadow-lg shadow-red-600/10 transition-all animate-pulse"
                >
                  <ShieldAlert className="w-4.5 h-4.5" />
                  <span>Activate SOS Alarm</span>
                </button>
              </div>
            </div>

            {/* Step-by-Step Waypoint Navigation Guide */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-850 space-y-4">
              <h4 className="text-xs font-black uppercase text-slate-350 tracking-wider flex items-center space-x-1.5">
                <Compass className="w-4.5 h-4.5 text-blue-400" />
                <span>GPS Navigation Path</span>
              </h4>
              
              <div className="p-4 bg-slate-950/60 border border-slate-850 rounded-2xl flex items-start space-x-4">
                <div className="p-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Current Step Instructions</span>
                  <p className="text-sm font-bold text-slate-200 mt-0.5">Head East on Interstate 80</p>
                  <p className="text-xs text-slate-400 mt-1">Estimated 124 KM until Cleveland interchange checkpoint. Keep average speed at 85 KM/H.</p>
                </div>
              </div>
            </div>

            {/* Fuel Purchase Logger */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-850 space-y-4">
              <h4 className="text-xs font-black uppercase text-slate-350 tracking-wider">Refuel Purchase Registry</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[9.5px] text-slate-500 font-bold uppercase">Current Odometer (KM)</label>
                  <input
                    type="number"
                    value={odometer}
                    onChange={(e) => setOdometer(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl p-3 text-slate-200 text-xs font-mono font-bold focus:outline-none focus:border-blue-500/20"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[9.5px] text-slate-500 font-bold uppercase">Purchased Liters (L)</label>
                  <input
                    type="number"
                    value={fuelLiters}
                    onChange={(e) => setFuelLiters(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl p-3 text-slate-200 text-xs font-mono font-bold focus:outline-none focus:border-blue-500/20"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[9.5px] text-slate-500 font-bold uppercase">Station Location / Remarks</label>
                  <input
                    type="text"
                    value={station}
                    onChange={(e) => setStation(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl p-3 text-slate-200 text-xs font-semibold focus:outline-none focus:border-blue-500/20"
                  />
                </div>
              </div>
            </div>

          </div>

          {/* Right Column (4 cols): Proof of Delivery Canvas */}
          <div className="xl:col-span-4 glass-panel p-6 rounded-3xl border border-slate-850 flex flex-col justify-between space-y-6">
            <div>
              <h4 className="text-xs font-black uppercase text-slate-350 tracking-wider flex items-center space-x-1.5 mb-4 border-b border-slate-850 pb-3">
                <FileSignature className="w-4.5 h-4.5 text-emerald-400" />
                <span>Verify Proof of Delivery (POD)</span>
              </h4>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-[9.5px] text-slate-500 font-bold uppercase">Authorized Cargo Receiver Name</label>
                  <input
                    type="text"
                    value={podReceiver}
                    onChange={(e) => setPodReceiver(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl p-3 text-slate-200 text-xs font-bold focus:outline-none"
                    placeholder="e.g. Alice Cooper"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[9.5px] text-slate-500 font-bold uppercase">
                    <span>Receiver E-Signature</span>
                    <button onClick={clearCanvas} className="text-blue-400 hover:text-blue-300 lowercase font-extrabold">
                      Clear Drawing
                    </button>
                  </div>
                  <canvas
                    ref={canvasRef}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    width="320"
                    height="140"
                    className="w-full bg-slate-950 border border-slate-850 rounded-2xl cursor-crosshair shadow-inner"
                  />
                </div>
              </div>
            </div>

            <button
              disabled={!hasSignature || submittingPod}
              onClick={handlePodSubmit}
              className={`w-full py-4 rounded-xl font-extrabold text-xs transition-all duration-200 ${
                hasSignature 
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/10 active:scale-98' 
                  : 'bg-slate-900 text-slate-500 border border-slate-850'
              }`}
            >
              {submittingPod ? 'Uploading POD telemetry...' : 'Submit POD & Complete Shift'}
            </button>
          </div>

          {/* Success Overlay */}
          {success && (
            <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center p-6 text-center animate-fade-in z-40 rounded-3xl border border-slate-850">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h4 className="font-black text-slate-100 text-md">Shift Complete & POD Verified</h4>
              <p className="text-xs text-slate-400 mt-2 max-w-sm leading-relaxed">
                Proof of Delivery uploaded successfully. Safe driving streak validated and reward points credited to wallet.
              </p>
            </div>
          )}

        </div>
      ) : (
        <div className="glass-panel p-12 rounded-3xl border border-slate-850 flex flex-col items-center justify-center text-center space-y-4">
          <div className="p-4.5 bg-slate-900 border border-slate-800 rounded-3xl text-slate-500">
            <Smartphone className="w-8 h-8" />
          </div>
          <div>
            <h4 className="font-extrabold text-slate-200 text-sm">Awaiting Dispatch Orders</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
              Driver <strong>{activeDriver?.name || 'Selected'}</strong> is currently in idle status. Trigger a trip on the <strong>Smart Dispatch Board</strong> to log telemetry.
            </p>
          </div>
        </div>
      )}

    </div>
  );
};

export default MobileDriverApp;

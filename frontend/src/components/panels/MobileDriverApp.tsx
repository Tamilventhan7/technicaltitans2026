import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Smartphone, ShieldAlert, Award, Compass, Camera, FileSignature, Send, AlertTriangle, ShieldCheck } from 'lucide-react';

export const MobileDriverApp: React.FC = () => {
  const { drivers, trips, submitPod, injectIncident } = useApp();

  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [odometer, setOdometer] = useState(120500);
  const [fuelLiters, setFuelLiters] = useState(100);
  const [fuelCost, setFuelCost] = useState(150);
  const [podReceiver, setPodReceiver] = useState('John Doe');
  
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
      // Pick first driver who is currently driving, fallback to first available
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

  // SOS button handler
  const handleSOS = async () => {
    if (!activeTrip) return;
    try {
      await injectIncident(activeTrip.id, 'accident');
      alert(`SOS Alert Dispatched from Trip ${activeTrip.id}! Emergency response unit dispatched.`);
    } catch (err) {
      console.error(err);
    }
  };

  // Canvas Signature pad handlers
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
    ctx.lineWidth = 2;
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
      // Mock cargo image
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-extrabold text-slate-100 flex items-center space-x-2">
            <Smartphone className="w-5 h-5 text-blue-400" />
            <span>Driver Simulation Web Console</span>
          </h2>
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-1">
            Simulate Driver Mobile Operations Panel
          </p>
        </div>

        {/* Driver Selector */}
        <div className="flex items-center space-x-3 bg-slate-900 border border-slate-800 p-2.5 rounded-xl">
          <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Select Driver:</span>
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start justify-center">
        
        {/* Helper Explanation panel */}
        <div className="lg:col-span-4 space-y-4">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800/80">
            <h3 className="text-sm font-extrabold text-slate-200 tracking-wider uppercase border-b border-slate-850 pb-3 mb-4">
              Simulator Information
            </h3>
            <p className="text-xs text-slate-450 leading-relaxed">
              Use this workspace to simulate the **Mobile Driver App** directly within the web console.
            </p>
            <div className="mt-4 p-4 rounded-xl border border-slate-800 bg-slate-950/40 space-y-3 text-xs leading-normal">
              <div className="flex items-center space-x-2.5"><Compass className="w-4 h-4 text-blue-400" /> <span className="font-medium text-slate-350">Step-by-step navigational guides</span></div>
              <div className="flex items-center space-x-2.5"><FileSignature className="w-4 h-4 text-emerald-400" /> <span className="font-medium text-slate-350">Interactive HTML5 signature canvas</span></div>
              <div className="flex items-center space-x-2.5"><ShieldAlert className="w-4 h-4 text-red-500" /> <span className="font-medium text-slate-350">Critical SOS alarm triggers</span></div>
            </div>
          </div>
        </div>

        {/* Virtual Smartphone Chassis Mockup */}
        <div className="lg:col-span-8 flex justify-center">
          <div className="w-[360px] h-[720px] rounded-[48px] border-[12px] border-slate-900 bg-slate-950 shadow-2xl flex flex-col overflow-hidden relative border-slate-950 shadow-[0_0_40px_rgba(59,130,246,0.08)] ring-8 ring-slate-900/60">
            
            {/* Phone Screen Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-36 h-6 bg-slate-900 rounded-b-2xl z-50 flex items-center justify-center">
              <div className="w-2.5 h-2.5 bg-slate-800 rounded-full" />
            </div>

            {/* Mobile Header */}
            <div className="pt-8 pb-3 px-6 bg-slate-900 border-b border-slate-850 flex justify-between items-center text-[10px] font-bold text-slate-400">
              <span>TransitOps Mobile</span>
              <span className="font-mono">9:41 AM</span>
            </div>

            {/* Mobile Application Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {activeTrip ? (
                <>
                  {/* Driver Header Summary */}
                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-blue-600/10 border border-blue-500/20">
                    <div>
                      <span className="text-[9px] text-slate-500 uppercase font-black tracking-wider">Active Shift</span>
                      <h4 className="font-extrabold text-slate-200 text-xs mt-0.5">{activeTrip.id}</h4>
                    </div>
                    <button
                      onClick={handleSOS}
                      className="px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-white text-[10px] font-extrabold rounded-lg flex items-center space-x-1 border border-red-500 shadow-md animate-pulse"
                    >
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>SOS</span>
                    </button>
                  </div>

                  {/* Step By Step Navigation Mock */}
                  <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-850 space-y-2 text-xs">
                    <h5 className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Navigation Guide</h5>
                    <div className="flex items-start space-x-2">
                      <Compass className="w-4.5 h-4.5 text-blue-400 shrink-0" />
                      <div>
                        <div className="font-bold text-slate-200">Head East on Interstate 80</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">Estimated 124 KM until Cleveland interchange checkpoint.</div>
                      </div>
                    </div>
                  </div>

                  {/* Fuel entry mock */}
                  <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-850 space-y-3.5 text-xs">
                    <h5 className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Fuel Registry Log</h5>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[9px] text-slate-500 font-bold uppercase mb-1">Odometer (KM)</label>
                        <input
                          type="number"
                          value={odometer}
                          onChange={(e) => setOdometer(Number(e.target.value))}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 text-[11px]"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] text-slate-500 font-bold uppercase mb-1">Station Fuel (L)</label>
                        <input
                          type="number"
                          value={fuelLiters}
                          onChange={(e) => setFuelLiters(Number(e.target.value))}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 text-[11px]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Proof Of Delivery Canvas submission */}
                  <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-850 space-y-3 text-xs">
                    <h5 className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider flex items-center space-x-1">
                      <FileSignature className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Delivery POD Dispatch</span>
                    </h5>
                    
                    <div>
                      <label className="block text-[9px] text-slate-500 font-bold uppercase mb-1.5">Received By</label>
                      <input
                        type="text"
                        value={podReceiver}
                        onChange={(e) => setPodReceiver(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 text-[11px]"
                        placeholder="Receiver Name"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[9px] text-slate-500 font-bold uppercase">
                        <span>Customer Signature</span>
                        <button onClick={clearCanvas} className="text-blue-400 lowercase">clear</button>
                      </div>
                      <canvas
                        ref={canvasRef}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        width="290"
                        height="90"
                        className="bg-slate-950 border border-slate-800 rounded-xl cursor-crosshair"
                      />
                    </div>

                    <button
                      disabled={!hasSignature || submittingPod}
                      onClick={handlePodSubmit}
                      className={`w-full py-2.5 rounded-xl font-extrabold transition-all duration-200 text-[11px] ${
                        hasSignature 
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md' 
                          : 'bg-slate-800 text-slate-500 border border-slate-850'
                      }`}
                    >
                      {submittingPod ? 'Submitting POD...' : 'Upload POD & Complete Trip'}
                    </button>
                  </div>
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                  <div className="p-4 bg-slate-900 border border-slate-800 rounded-3xl text-slate-500">
                    <Smartphone className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-200 text-sm">Awaiting Dispatch Instructions</h4>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                      Driver **{activeDriver?.name || 'Selected'}** is currently idle at terminal hubs. Start a trip on the **Smart Dispatch** panel.
                    </p>
                  </div>
                </div>
              )}

              {success && (
                <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center p-6 text-center animate-fade-in z-50">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h4 className="font-black text-slate-100 text-sm">POD Upload Completed</h4>
                  <p className="text-[10px] text-slate-500 mt-1 leading-normal">
                    Deliveries registers synchronized. Safety streak point updates logged.
                  </p>
                </div>
              )}
            </div>

            {/* Virtual Home Button */}
            <div className="h-10 bg-slate-900 flex items-center justify-center border-t border-slate-850">
              <div className="w-28 h-1 bg-slate-800 rounded-full" />
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
export default MobileDriverApp;

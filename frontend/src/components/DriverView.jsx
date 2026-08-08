import React, { useState, useEffect } from 'react';
import { Smartphone, Navigation, CheckCircle, AlertCircle, Phone, MapPin, IndianRupee, ArrowLeft, RefreshCw, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { routeAPI } from '../services/api';

export const DriverView = ({ route: initialRoute, stops: initialStops, onStatusUpdate }) => {
  const { switchRole } = useAuth();
  const [stops, setStops] = useState(initialStops || []);
  const [currentStopIndex, setCurrentStopIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [completedStops, setCompletedStops] = useState(new Set());
  const [failedStops, setFailedStops] = useState(new Set());

  // Fetch active route stops if not provided as props
  const fetchDriverRoute = async () => {
    try {
      setLoading(true);
      const res = await routeAPI.getRoutes();
      if (res.data && res.data.length > 0) {
        const activeRoute = res.data[0]; // Tata Ace EV route
        setStops(activeRoute.stops || []);
      }
    } catch (err) {
      console.error("Failed to load driver route:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialStops || initialStops.length === 0) {
      fetchDriverRoute();
    }
  }, [initialStops]);

  // Default fallback stop if loading
  const currentStop = stops[currentStopIndex] || {
    stop_id: 'STOP_001',
    sequence_order: currentStopIndex + 1,
    address: 'Building #42, 4th Cross, Indiranagar, Bengaluru',
    customer_name: 'Ananya Sharma',
    customer_phone: '+91 98765 43210',
    time_window_start: '09:00',
    time_window_end: '12:00',
    eta: '10:15',
    is_cod: true,
    cod_amount_inr: 1850.0,
    package_weight_kg: 2.5,
    lat: 12.9784,
    lng: 77.6408
  };

  const handleMarkDelivered = () => {
    const stopId = currentStop.stop_id;
    setCompletedStops(prev => new Set(prev).add(stopId));
    setToast(`✓ Stop #${currentStop.sequence_order} Marked DELIVERED!`);
    setTimeout(() => setToast(null), 3000);

    if (currentStopIndex < stops.length - 1) {
      setCurrentStopIndex(prev => prev + 1);
    }
  };

  const handleMarkFailed = async () => {
    const stopId = currentStop.stop_id;
    setFailedStops(prev => new Set(prev).add(stopId));
    setToast(`⚠️ Delivery Failed recorded. AI Replanner notified.`);

    try {
      // Trigger AI Dynamic Replanning for failed delivery
      await routeAPI.replan({
        event_type: 'FAILED_DELIVERY',
        route_id: initialRoute?.route_id || 'RT_VEH_BLR_01',
        affected_stop_id: stopId,
        description: `Driver marked customer absent at ${currentStop.address}`
      });
    } catch (err) {
      console.error("Failed delivery replan error:", err);
    } finally {
      setTimeout(() => setToast(null), 3000);
      if (currentStopIndex < stops.length - 1) {
        setCurrentStopIndex(prev => prev + 1);
      }
    }
  };

  const handleStartGoogleMaps = () => {
    const lat = currentStop.lat || 12.9784;
    const lng = currentStop.lng || 77.6408;
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(mapsUrl, '_blank');
  };

  const totalCodCollected = stops
    .slice(0, currentStopIndex)
    .filter(s => s.is_cod)
    .reduce((sum, s) => sum + (s.cod_amount_inr || 0), 0);

  return (
    <div className="w-full max-w-md mx-auto bg-[#0b0f19] border border-cyan-500/40 rounded-3xl p-5 shadow-2xl space-y-4 text-white relative">
      {/* Toast Notification */}
      {toast && (
        <div className="absolute top-2 left-4 right-4 z-20 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-extrabold px-3 py-2 rounded-xl text-center shadow-lg animate-bounce">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-cyan-400" />
          <h3 className="font-extrabold text-sm text-cyan-300">RouteMind Driver Navigation</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="badge badge-green text-[9px]">LIVE GPS</span>
          <button
            onClick={() => switchRole('SUPERVISOR')}
            className="text-[10px] bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 cursor-pointer"
          >
            <ArrowLeft className="w-3 h-3" /> Operations View
          </button>
        </div>
      </div>

      {/* Driver Summary */}
      <div className="p-3 rounded-2xl bg-slate-900/90 border border-white/10 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-slate-200">Ramesh Kumar (Tata Ace EV)</p>
          <p className="text-[10px] text-slate-400 font-medium">
            Stop {currentStopIndex + 1} of {stops.length || 18} • {(stops.length - currentStopIndex)} Remaining
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-slate-400 uppercase font-semibold">COD Collected</p>
          <p className="text-xs font-extrabold text-amber-400">₹{totalCodCollected.toLocaleString('en-IN')} / ₹50,000</p>
        </div>
      </div>

      {/* Next Stop Navigation Card */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-cyan-950/40 to-slate-900 border border-cyan-500/40 space-y-3.5 relative overflow-hidden shadow-xl">
        <div className="flex items-center justify-between">
          <span className="badge badge-cyan text-[10px]">
            NEXT STOP #{currentStop.sequence_order || (currentStopIndex + 1)}
          </span>
          <span className="text-xs font-extrabold text-amber-400 flex items-center gap-1">
            ETA: {currentStop.eta || '10:15'}
          </span>
        </div>

        <div>
          <h4 className="text-base font-extrabold text-white mb-1">
            {currentStop.customer_name || `Customer #${currentStopIndex + 1}`}
          </h4>
          <p className="text-xs text-slate-300 flex items-start gap-1.5 leading-relaxed font-medium">
            <MapPin className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            {currentStop.address || currentStop.zone_name}
          </p>
        </div>

        {/* Customer Phone & Window */}
        <div className="grid grid-cols-2 gap-2 text-xs border-t border-white/10 pt-3">
          <div className="flex items-center gap-1.5 text-slate-300">
            <Phone className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <a href={`tel:${currentStop.customer_phone || '+919876543210'}`} className="hover:underline text-cyan-300 font-bold truncate">
              {currentStop.customer_phone || '+91 98765 43210'}
            </a>
          </div>
          <div className="text-right text-slate-400 text-[11px]">
            Window: <strong className="text-white">{currentStop.time_window_start || '09:00'}-{currentStop.time_window_end || '12:00'}</strong>
          </div>
        </div>

        {/* COD Badge */}
        {currentStop.is_cod ? (
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs">
            <span className="text-amber-300 font-bold flex items-center gap-1">
              <IndianRupee className="w-4 h-4" /> Collect Cash on Delivery
            </span>
            <span className="font-extrabold text-amber-400 text-sm">₹{currentStop.cod_amount_inr}</span>
          </div>
        ) : (
          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-bold text-emerald-400 text-center">
            ✓ Prepaid Order - No Cash Required
          </div>
        )}
      </div>

      {/* Interactive Action Buttons */}
      <div className="space-y-2.5 pt-1">
        <button
          onClick={handleMarkDelivered}
          className="w-full btn-primary justify-center py-3 text-sm shadow-emerald-500/20 font-extrabold cursor-pointer hover:scale-[1.01] transition-transform"
        >
          <CheckCircle className="w-5 h-5" /> Mark Order Delivered
        </button>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={handleMarkFailed}
            className="w-full py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
          >
            <AlertCircle className="w-4 h-4" /> Delivery Failed
          </button>
          <button
            onClick={handleStartGoogleMaps}
            className="w-full btn-secondary justify-center py-2.5 text-xs font-bold cursor-pointer hover:scale-[1.01] transition-transform"
          >
            <Navigation className="w-4 h-4 text-cyan-400" /> Start Google Maps
          </button>
        </div>
      </div>

      {/* Stop Sequence Navigator List */}
      {stops.length > 0 && (
        <div className="space-y-2 pt-3 border-t border-white/10">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Route Stop Manifest ({stops.length})</p>
            <span className="text-[10px] text-cyan-400 font-bold">Tap to Navigate</span>
          </div>
          <div className="max-h-48 overflow-y-auto space-y-1.5 custom-scrollbar pr-1">
            {stops.map((s, idx) => {
              const isCompleted = completedStops.has(s.stop_id);
              const isFailed = failedStops.has(s.stop_id);
              const isCurrent = idx === currentStopIndex;

              return (
                <div
                  key={s.stop_id || idx}
                  onClick={() => setCurrentStopIndex(idx)}
                  className={`p-2 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition-all ${
                    isCurrent
                      ? 'bg-cyan-500/20 border-cyan-500/50 text-white font-bold'
                      : isCompleted
                      ? 'bg-emerald-950/30 border-emerald-500/30 text-slate-400 line-through'
                      : isFailed
                      ? 'bg-rose-950/30 border-rose-500/30 text-rose-400'
                      : 'bg-slate-900/60 border-white/5 text-slate-300 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <span className="w-4 h-4 rounded-full bg-slate-800 text-[9px] font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="truncate">{s.customer_name || s.zone_name}</span>
                  </div>
                  <span className="text-[10px] text-amber-400 font-semibold shrink-0">
                    {isCompleted ? '✓ Done' : isFailed ? '✕ Failed' : (s.eta || '10:15')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

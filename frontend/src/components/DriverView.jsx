import React, { useState } from 'react';
import { Smartphone, Navigation, CheckCircle, AlertCircle, Phone, MapPin, IndianRupee, Bell, Shield, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const DriverView = ({ route, stops = [], onStatusUpdate }) => {
  const { user, switchRole } = useAuth();
  const [currentStopIndex, setCurrentStopIndex] = useState(0);
  const currentStop = stops[currentStopIndex] || stops[0] || {
    stop_id: 'STOP_001',
    sequence_order: 1,
    address: 'Building #42, 4th Cross, Indiranagar, Bengaluru',
    customer_name: 'Ananya Sharma',
    customer_phone: '+91 98765 43210',
    time_window_start: '09:00',
    time_window_end: '12:00',
    eta: '10:15',
    is_cod: true,
    cod_amount_inr: 1850.0,
    package_weight_kg: 2.5
  };

  const handleNext = (status) => {
    if (currentStopIndex < stops.length - 1) {
      setCurrentStopIndex(prev => prev + 1);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-[#0b0f19] border border-cyan-500/30 rounded-3xl p-5 shadow-2xl space-y-5 text-white">
      {/* Mobile Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-cyan-400" />
          <h3 className="font-bold text-sm text-cyan-300">RouteMind Driver Navigation</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="badge badge-green text-[10px]">LIVE GPS</span>
          <button
            onClick={() => switchRole('SUPERVISOR')}
            className="text-[10px] bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 px-2 py-1 rounded-lg font-bold transition-all flex items-center gap-1 cursor-pointer"
            title="Switch to Supervisor Executive View"
          >
            <ArrowLeft className="w-3 h-3" /> Operations View
          </button>
        </div>
      </div>

      {/* Driver & Vehicle Summary */}
      <div className="p-3 rounded-2xl bg-slate-900/90 border border-white/10 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-200">Ramesh Kumar (Tata Ace EV)</p>
          <p className="text-[11px] text-slate-400">Route: RT_VEH_BLR_01 • 14 Stops Remaining</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-slate-400">COD Collected</p>
          <p className="text-xs font-bold text-amber-400">₹8,450 / ₹50,000</p>
        </div>
      </div>

      {/* Next Stop Card */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-cyan-950/60 border border-cyan-500/40 space-y-4 relative overflow-hidden shadow-lg">
        <div className="flex items-center justify-between">
          <span className="badge badge-cyan">NEXT STOP #{currentStop.sequence_order}</span>
          <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
            ETA: {currentStop.eta || '10:15'}
          </span>
        </div>

        <div>
          <h4 className="text-base font-bold text-white mb-1">{currentStop.customer_name}</h4>
          <p className="text-xs text-slate-300 flex items-start gap-1.5 leading-relaxed">
            <MapPin className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            {currentStop.address}
          </p>
        </div>

        {/* Customer Phone & Delivery Window */}
        <div className="grid grid-cols-2 gap-2 text-xs border-t border-white/10 pt-3">
          <div className="flex items-center gap-1.5 text-slate-300">
            <Phone className="w-3.5 h-3.5 text-cyan-400" />
            <a href={`tel:${currentStop.customer_phone}`} className="hover:underline text-cyan-300">
              {currentStop.customer_phone}
            </a>
          </div>
          <div className="text-right text-slate-400">
            Window: <strong className="text-white">{currentStop.time_window_start}-{currentStop.time_window_end}</strong>
          </div>
        </div>

        {/* COD Badge */}
        {currentStop.is_cod ? (
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs">
            <span className="text-amber-300 font-semibold flex items-center gap-1">
              <IndianRupee className="w-4 h-4" /> Collect Cash on Delivery
            </span>
            <span className="font-extrabold text-amber-400 text-sm">₹{currentStop.cod_amount_inr}</span>
          </div>
        ) : (
          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-semibold text-emerald-400 text-center">
            ✓ Prepaid Order - No Cash Required
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="space-y-2">
        <button
          onClick={() => handleNext('DELIVERED')}
          className="w-full btn-primary justify-center py-3 text-sm shadow-emerald-500/20"
        >
          <CheckCircle className="w-5 h-5" /> Mark Order Delivered
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleNext('FAILED')}
            className="w-full py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold flex items-center justify-center gap-1"
          >
            <AlertCircle className="w-4 h-4" /> Delivery Failed
          </button>
          <button
            onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${currentStop.lat},${currentStop.lng}`)}
            className="w-full btn-secondary justify-center py-2.5 text-xs font-semibold"
          >
            <Navigation className="w-4 h-4 text-cyan-400" /> Start Google Maps
          </button>
        </div>
      </div>
    </div>
  );
};

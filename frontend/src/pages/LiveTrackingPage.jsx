import React, { useState, useEffect } from 'react';
import { MapView } from '../components/MapView';
import { routeAPI, vehicleAPI } from '../services/api';
import { MapPin, AlertTriangle, RefreshCw, Zap, Truck, CheckCircle2 } from 'lucide-react';

export const LiveTrackingPage = ({ onTriggerReplan, onTriggerPickup }) => {
  const [routes, setRoutes] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('TRAFFIC_JAM');

  useEffect(() => {
    const load = async () => {
      try {
        const [rRes, vRes] = await Promise.all([routeAPI.getRoutes(), vehicleAPI.getVehicles()]);
        setRoutes(rRes.data);
        setVehicles(vRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <MapPin className="w-6 h-6 text-cyan-400" /> Real-Time Telematics & Fleet Tracking
          </h2>
          <p className="text-xs text-slate-400">
            OpenStreetMap live GPS simulation & dynamic event replanning engine.
          </p>
        </div>

        <span className="badge badge-green flex items-center gap-1.5 py-1.5 px-3 text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          WebSocket Stream Active
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Map (3 cols) */}
        <div className="lg:col-span-3 glass-panel p-4 h-[600px]">
          <MapView
            routes={routes}
            vehicles={vehicles}
            onTriggerPickup={onTriggerPickup}
          />
        </div>

        {/* Dynamic Replanning Event Controls (1 col) */}
        <div className="glass-panel p-5 space-y-5">
          <h3 className="text-sm font-bold text-white border-b border-white/10 pb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" /> Live Event Simulator
          </h3>

          <p className="text-xs text-slate-400 leading-relaxed">
            Trigger a real-world supply chain disruption to test RouteMind's sub-30 second dynamic re-optimization.
          </p>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 block">Select Disruption Event:</label>
            
            <button
              onClick={() => setSelectedEvent('TRAFFIC_JAM')}
              className={`w-full p-3 rounded-xl border text-left text-xs transition-all flex items-center gap-2.5 ${
                selectedEvent === 'TRAFFIC_JAM'
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 font-bold'
                  : 'bg-slate-900/60 border-white/5 text-slate-400 hover:text-slate-200'
              }`}
            >
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <p>Traffic Congestion Gridlock</p>
                <p className="text-[10px] text-slate-400 font-normal">Indiranagar 100ft Road Corridor</p>
              </div>
            </button>

            <button
              onClick={() => setSelectedEvent('INSTANT_PICKUP')}
              className={`w-full p-3 rounded-xl border text-left text-xs transition-all flex items-center gap-2.5 ${
                selectedEvent === 'INSTANT_PICKUP'
                  ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 font-bold'
                  : 'bg-slate-900/60 border-white/5 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Zap className="w-4 h-4 text-cyan-400 shrink-0" />
              <div>
                <p>On-Demand Instant Pickup</p>
                <p className="text-[10px] text-slate-400 font-normal">Express customer return request</p>
              </div>
            </button>

            <button
              onClick={() => setSelectedEvent('FAILED_DELIVERY')}
              className={`w-full p-3 rounded-xl border text-left text-xs transition-all flex items-center gap-2.5 ${
                selectedEvent === 'FAILED_DELIVERY'
                  ? 'bg-rose-500/20 border-rose-500/50 text-rose-300 font-bold'
                  : 'bg-slate-900/60 border-white/5 text-slate-400 hover:text-slate-200'
              }`}
            >
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <div>
                <p>Failed Delivery Attempt</p>
                <p className="text-[10px] text-slate-400 font-normal">Customer absent / door locked</p>
              </div>
            </button>
          </div>

          <button
            onClick={() => onTriggerReplan && onTriggerReplan(selectedEvent)}
            className="w-full btn-orange justify-center py-3 text-xs shadow-orange-500/30"
          >
            <RefreshCw className="w-4 h-4" /> Trigger Dynamic Replan
          </button>
        </div>
      </div>
    </div>
  );
};

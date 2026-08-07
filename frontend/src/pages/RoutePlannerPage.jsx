import React, { useState, useEffect } from 'react';
import { routeAPI } from '../services/api';
import { Cpu, Play, CheckCircle2, Sliders, ShieldCheck, MapPin, Clock, IndianRupee } from 'lucide-react';

export const RoutePlannerPage = () => {
  const [loading, setLoading] = useState(false);
  const [routes, setRoutes] = useState([]);
  const [constraints, setConstraints] = useState({
    enforce_no_truck_zones: true,
    enforce_cod_limits: true,
    enforce_time_windows: true,
    ev_priority: true
  });

  const fetchExistingRoutes = async () => {
    try {
      const res = await routeAPI.getRoutes();
      if (res.data && res.data.length > 0) {
        setRoutes(res.data);
      }
    } catch (err) {
      console.error("Failed to load existing routes:", err);
    }
  };

  useEffect(() => {
    fetchExistingRoutes();
  }, []);

  const handleRunOptimization = async () => {
    setLoading(true);
    try {
      const res = await routeAPI.optimize();
      setRoutes(res.data);
    } catch (err) {
      console.error("Optimization failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <Cpu className="w-6 h-6 text-cyan-400" /> Google OR-Tools VRPTW Route Optimizer
          </h2>
          <p className="text-xs text-slate-400">
            Multi-vehicle capacity & time window vehicle routing engine for Amazon Last Mile dataset.
          </p>
        </div>

        <button
          disabled={loading}
          onClick={handleRunOptimization}
          className="btn-primary text-sm py-2.5 px-6 shadow-cyan-500/30"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              Solving VRP Constraint Engine...
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-white" /> Execute AI Optimization
            </>
          )}
        </button>
      </div>

      {/* Constraints Control Bar */}
      <div className="glass-panel p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer">
          <input
            type="checkbox"
            checked={constraints.enforce_no_truck_zones}
            onChange={(e) => setConstraints({ ...constraints, enforce_no_truck_zones: e.target.checked })}
            className="rounded bg-slate-800 border-white/20 text-cyan-500 focus:ring-0"
          />
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          No-Truck Restrictions (08-11 & 17-20)
        </label>

        <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer">
          <input
            type="checkbox"
            checked={constraints.enforce_cod_limits}
            onChange={(e) => setConstraints({ ...constraints, enforce_cod_limits: e.target.checked })}
            className="rounded bg-slate-800 border-white/20 text-amber-500 focus:ring-0"
          />
          <IndianRupee className="w-4 h-4 text-amber-400" />
          COD Safety Threshold (₹50,000 max)
        </label>

        <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer">
          <input
            type="checkbox"
            checked={constraints.enforce_time_windows}
            onChange={(e) => setConstraints({ ...constraints, enforce_time_windows: e.target.checked })}
            className="rounded bg-slate-800 border-white/20 text-emerald-500 focus:ring-0"
          />
          <Clock className="w-4 h-4 text-emerald-400" />
          Customer Time Windows (VRPTW)
        </label>

        <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer">
          <input
            type="checkbox"
            checked={constraints.ev_priority}
            onChange={(e) => setConstraints({ ...constraints, ev_priority: e.target.checked })}
            className="rounded bg-slate-800 border-white/20 text-purple-500 focus:ring-0"
          />
          <Sliders className="w-4 h-4 text-purple-400" />
          Prioritize EV Vehicles (Low CO2)
        </label>
      </div>

      {/* Generated Route Manifests */}
      {routes.length > 0 ? (
        <div className="space-y-6">
          <h3 className="text-base font-bold text-white">Generated Optimal Delivery Routes ({routes.length})</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {routes.map((route, idx) => (
              <div key={route.route_id || idx} className="glass-panel p-5 space-y-4 border-cyan-500/20">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div>
                    <h4 className="text-sm font-extrabold text-cyan-400">{route.vehicle_id}</h4>
                    <p className="text-[11px] text-slate-400">Driver ID: {route.driver_id}</p>
                  </div>
                  <span className="badge badge-green">OPTIMIZED</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-900/80 border border-white/5">
                    <p className="text-[10px] text-slate-400">Total Distance</p>
                    <p className="font-bold text-white">{route.total_distance_km} km</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900/80 border border-white/5">
                    <p className="text-[10px] text-slate-400">Estimated Duration</p>
                    <p className="font-bold text-white">{route.total_duration_minutes} min</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900/80 border border-white/5">
                    <p className="text-[10px] text-slate-400">Fuel Cost</p>
                    <p className="font-bold text-amber-400">₹{route.total_fuel_cost_inr}</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900/80 border border-white/5">
                    <p className="text-[10px] text-slate-400">COD Total</p>
                    <p className="font-bold text-emerald-400">₹{route.total_cod_amount_inr}</p>
                  </div>
                </div>

                {/* Stop Manifest */}
                <div className="space-y-2 pt-2">
                  <p className="text-[11px] font-bold text-slate-400 uppercase">Sequence ({route.stops.length} stops)</p>
                  <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                    {route.stops.map((s) => (
                      <div key={s.stop_id} className="p-2 rounded-lg bg-slate-900/60 border border-white/5 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 truncate pr-2">
                          <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold text-[10px] flex items-center justify-center shrink-0">
                            {s.sequence_order}
                          </span>
                          <span className="truncate text-slate-200">{s.zone_name}</span>
                        </div>
                        <span className="text-[10px] text-amber-400 font-medium shrink-0">{s.eta || '10:30'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-12 text-center glass-panel space-y-3">
          <Cpu className="w-12 h-12 text-slate-600 mx-auto animate-pulse" />
          <h3 className="text-base font-bold text-slate-300">No Routes Generated Yet</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Click "Execute AI Optimization" above to process the Amazon Last Mile dataset through Google OR-Tools VRP and Indian logistics rules.
          </p>
        </div>
      )}
    </div>
  );
};

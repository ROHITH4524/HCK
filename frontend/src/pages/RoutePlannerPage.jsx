import React, { useState, useEffect } from 'react';
import { routeAPI } from '../services/api';
import { Cpu, Play, CheckCircle2, Sliders, ShieldCheck, MapPin, Clock, IndianRupee, Package, Sparkles } from 'lucide-react';

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
      const res = await routeAPI.optimize({
        enforce_indian_constraints: constraints.enforce_no_truck_zones || constraints.enforce_cod_limits,
        consider_traffic: constraints.enforce_time_windows
      });
      setRoutes(res.data || []);
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
          className="btn-primary text-sm py-2.5 px-6 shadow-cyan-500/30 cursor-pointer hover:scale-[1.02] transition-transform"
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

      {/* Interactive Constraints Control Bar */}
      <div className="glass-panel p-4.5 border-cyan-500/30">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Indian Logistics Rules Filter</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-200 cursor-pointer p-2.5 rounded-xl bg-slate-900/80 border border-white/5 hover:border-cyan-500/40 transition-all">
            <input
              type="checkbox"
              checked={constraints.enforce_no_truck_zones}
              onChange={(e) => setConstraints({ ...constraints, enforce_no_truck_zones: e.target.checked })}
              className="rounded bg-slate-800 border-white/20 text-cyan-500 focus:ring-0 w-4 h-4 cursor-pointer"
            />
            <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>No-Truck Restrictions (08-11 & 17-20)</span>
          </label>

          <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-200 cursor-pointer p-2.5 rounded-xl bg-slate-900/80 border border-white/5 hover:border-amber-500/40 transition-all">
            <input
              type="checkbox"
              checked={constraints.enforce_cod_limits}
              onChange={(e) => setConstraints({ ...constraints, enforce_cod_limits: e.target.checked })}
              className="rounded bg-slate-800 border-white/20 text-amber-500 focus:ring-0 w-4 h-4 cursor-pointer"
            />
            <IndianRupee className="w-4 h-4 text-amber-400 shrink-0" />
            <span>COD Safety Threshold (₹50,000 max)</span>
          </label>

          <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-200 cursor-pointer p-2.5 rounded-xl bg-slate-900/80 border border-white/5 hover:border-emerald-500/40 transition-all">
            <input
              type="checkbox"
              checked={constraints.enforce_time_windows}
              onChange={(e) => setConstraints({ ...constraints, enforce_time_windows: e.target.checked })}
              className="rounded bg-slate-800 border-white/20 text-emerald-500 focus:ring-0 w-4 h-4 cursor-pointer"
            />
            <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Customer Time Windows (VRPTW)</span>
          </label>

          <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-200 cursor-pointer p-2.5 rounded-xl bg-slate-900/80 border border-white/5 hover:border-purple-500/40 transition-all">
            <input
              type="checkbox"
              checked={constraints.ev_priority}
              onChange={(e) => setConstraints({ ...constraints, ev_priority: e.target.checked })}
              className="rounded bg-slate-800 border-white/20 text-purple-500 focus:ring-0 w-4 h-4 cursor-pointer"
            />
            <Sliders className="w-4 h-4 text-purple-400 shrink-0" />
            <span>Prioritize EV Vehicles (Low CO2)</span>
          </label>
        </div>
      </div>

      {/* Generated Route Manifests */}
      {routes.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Generated Optimal Delivery Routes ({routes.length})</h3>
            <span className="badge badge-green">Google OR-Tools VRPTW Solved</span>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {routes.map((route, idx) => (
              <div key={route.route_id || idx} className="glass-panel p-5 space-y-4 border-cyan-500/20 shadow-lg">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div>
                    <h4 className="text-sm font-extrabold text-cyan-400">{route.vehicle_id}</h4>
                    <p className="text-[11px] text-slate-400 font-medium">Driver: {route.driver_id}</p>
                  </div>
                  <span className="badge badge-green text-[10px]">OPTIMIZED</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-white/5">
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Distance</p>
                    <p className="font-extrabold text-white text-sm">{route.total_distance_km} km</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-white/5">
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Duration</p>
                    <p className="font-extrabold text-white text-sm">{route.total_duration_minutes} min</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-white/5">
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Fuel Cost</p>
                    <p className="font-extrabold text-amber-400 text-sm">₹{route.total_fuel_cost_inr}</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-white/5">
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">COD Total</p>
                    <p className="font-extrabold text-emerald-400 text-sm">₹{route.total_cod_amount_inr}</p>
                  </div>
                </div>

                {/* Stop Manifest */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Sequence ({route.stops.length} Stops)</p>
                    <span className="text-[10px] text-cyan-400 font-semibold">Live ETAs</span>
                  </div>
                  <div className="max-h-60 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                    {route.stops.map((s) => (
                      <div key={s.stop_id} className="p-2.5 rounded-xl bg-slate-900/90 border border-white/5 flex items-center justify-between text-xs hover:border-cyan-500/30 transition-all">
                        <div className="flex items-center gap-2.5 min-w-0 pr-2">
                          <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 font-extrabold text-[10px] flex items-center justify-center shrink-0 border border-cyan-500/30">
                            {s.sequence_order}
                          </span>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-200 text-[11px] truncate">{s.customer_name || s.zone_name}</p>
                            <p className="text-[10px] text-slate-400 truncate">{s.address || s.zone_name}</p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-[11px] text-amber-400 font-bold block">{s.eta || '10:30'}</span>
                          {s.is_cod && (
                            <span className="text-[9px] text-emerald-400 font-semibold block">₹{s.cod_amount_inr} COD</span>
                          )}
                        </div>
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

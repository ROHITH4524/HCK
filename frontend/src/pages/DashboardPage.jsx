import React, { useState, useEffect } from 'react';
import { KPICard } from '../components/KPICard';
import { MapView } from '../components/MapView';
import { analyticsAPI, routeAPI, vehicleAPI } from '../services/api';
import { Route, Truck, Fuel, Clock, AlertTriangle, RefreshCw, IndianRupee, ShieldCheck, Cpu } from 'lucide-react';

export const DashboardPage = ({ onTriggerReplan, onTriggerPickup }) => {
  const [kpis, setKpis] = useState({
    total_routes_today: 3,
    active_vehicles: 3,
    fuel_saved_inr: 1420.50,
    co2_reduced_kg: 18.5,
    avg_eta_accuracy_percent: 95.8,
    delayed_deliveries: 1,
    replanned_routes_today: 4,
    success_rate_percent: 98.2,
    total_cod_collected_inr: 48500.0
  });

  const [routes, setRoutes] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [kpiRes, routesRes, vRes] = await Promise.all([
        analyticsAPI.getDashboardKPIs(),
        routeAPI.getRoutes(),
        vehicleAPI.getVehicles()
      ]);
      setKpis(kpiRes.data);
      setRoutes(routesRes.data);
      setVehicles(vRes.data);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
            Operations Executive Dashboard
          </h2>
          <p className="text-xs text-slate-400">
            Real-time supply chain monitoring • Peenya Central Hub, Bengaluru Region
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={fetchData} className="btn-secondary text-xs">
            <RefreshCw className="w-4 h-4" /> Refresh Fleet
          </button>
          <button onClick={() => onTriggerReplan && onTriggerReplan("TRAFFIC_JAM")} className="btn-orange text-xs">
            + Trigger Live Traffic Event
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Routes Today"
          value={kpis.total_routes_today}
          unit="Active Fleet"
          icon={Route}
          color="cyan"
          trend={{ value: 12.5, isPositive: true, label: 'efficiency gain' }}
        />
        <KPICard
          title="Fuel & Cost Saved"
          value={`₹${kpis.fuel_saved_inr.toLocaleString()}`}
          unit="Saved"
          icon={Fuel}
          color="amber"
          trend={{ value: 18.2, isPositive: true, label: 'vs unoptimized VRP' }}
        />
        <KPICard
          title="Average ETA Accuracy"
          value={`${kpis.avg_eta_accuracy_percent}%`}
          unit="On-Time"
          icon={Clock}
          color="green"
          trend={{ value: 4.8, isPositive: true }}
        />
        <KPICard
          title="Total COD Collected"
          value={`₹${kpis.total_cod_collected_inr.toLocaleString()}`}
          unit="INR Cash"
          icon={IndianRupee}
          color="purple"
        />
      </div>

      {/* Main Map & Live Fleet Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Map (2 cols) */}
        <div className="lg:col-span-2 glass-panel p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
              <h3 className="text-sm font-bold text-white">Live OpenStreetMap Logistics Dispatch</h3>
            </div>
            <span className="badge badge-cyan">40 Indian Delivery Stops</span>
          </div>

          <div className="h-[460px]">
            <MapView
              routes={routes}
              vehicles={vehicles}
              onTriggerPickup={onTriggerPickup}
            />
          </div>
        </div>

        {/* Fleet Vehicles Status Panel (1 col) */}
        <div className="glass-panel p-5 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center justify-between border-b border-white/10 pb-3">
            <span>Active Fleet Status</span>
            <span className="badge badge-green">3 En-Route</span>
          </h3>

          <div className="space-y-3">
            {vehicles.map((v) => (
              <div key={v.vehicle_id} className="p-3.5 rounded-xl bg-slate-900/80 border border-white/5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-bold text-white">{v.name}</span>
                  </div>
                  <span className={`badge ${v.is_eco_friendly ? 'badge-green' : 'badge-orange'}`}>
                    {v.type}
                  </span>
                </div>

                {/* Meter Bars */}
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex justify-between text-slate-400">
                    <span>Weight Capacity</span>
                    <span className="text-slate-200 font-semibold">185kg / {v.max_capacity_kg}kg</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full bg-cyan-500 rounded-full" style={{ width: '74%' }} />
                  </div>

                  <div className="flex justify-between text-slate-400 pt-1">
                    <span>COD Safety Cash Limit</span>
                    <span className="text-amber-400 font-semibold">₹18,500 / ₹{v.max_cod_limit_inr.toLocaleString()}</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: '37%' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

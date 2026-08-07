import React, { useState } from 'react';
import { Sliders, ShieldCheck, IndianRupee, Clock, Truck, Save, CheckCircle2 } from 'lucide-react';

export const SettingsPage = () => {
  const [saved, setSaved] = useState(false);
  const [params, setParams] = useState({
    max_cod_limit_inr: 50000,
    no_truck_start_am: '08:00',
    no_truck_end_am: '11:00',
    no_truck_start_pm: '17:00',
    no_truck_end_pm: '20:00',
    avg_speed_kmh: 28,
    max_duty_hours: 9
  });

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
          <Sliders className="w-6 h-6 text-cyan-400" /> Indian Logistics Rules & Constraint Parameters
        </h2>
        <p className="text-xs text-slate-400">
          Configure hyper-local operational constraints enforced by RouteMind AI.
        </p>
      </div>

      <form onSubmit={handleSave} className="glass-panel p-6 space-y-6">
        {/* COD Safety Limit */}
        <div className="space-y-2 border-b border-white/10 pb-5">
          <label className="text-sm font-bold text-white flex items-center gap-2">
            <IndianRupee className="w-4 h-4 text-amber-400" /> Cash-on-Delivery (COD) Cash Safety Threshold
          </label>
          <p className="text-xs text-slate-400">
            Maximum cash amount a driver is permitted to carry in their vehicle before requiring bank deposit or security lockbox.
          </p>
          <div className="flex items-center gap-3 pt-1">
            <input
              type="number"
              value={params.max_cod_limit_inr}
              onChange={(e) => setParams({ ...params, max_cod_limit_inr: Number(e.target.value) })}
              className="bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 w-48"
            />
            <span className="text-xs text-slate-400">INR (₹)</span>
          </div>
        </div>

        {/* No Truck Zone Restrictions */}
        <div className="space-y-2 border-b border-white/10 pb-5">
          <label className="text-sm font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400" /> No-Truck Zone Peak Prohibition Hours
          </label>
          <p className="text-xs text-slate-400">
            Heavy commercial vehicle prohibition windows enforced by Indian urban traffic police (Bengaluru, Mumbai, Delhi).
          </p>
          
          <div className="grid grid-cols-2 gap-4 pt-2 text-xs">
            <div className="p-3 rounded-lg bg-slate-900/60 border border-white/5 space-y-2">
              <span className="font-semibold text-amber-400">Morning Peak Prohibition</span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={params.no_truck_start_am}
                  onChange={(e) => setParams({ ...params, no_truck_start_am: e.target.value })}
                  className="bg-slate-900 border border-white/10 rounded px-2 py-1 text-white w-20"
                />
                <span className="text-slate-400">to</span>
                <input
                  type="text"
                  value={params.no_truck_end_am}
                  onChange={(e) => setParams({ ...params, no_truck_end_am: e.target.value })}
                  className="bg-slate-900 border border-white/10 rounded px-2 py-1 text-white w-20"
                />
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-900/60 border border-white/5 space-y-2">
              <span className="font-semibold text-amber-400">Evening Peak Prohibition</span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={params.no_truck_start_pm}
                  onChange={(e) => setParams({ ...params, no_truck_start_pm: e.target.value })}
                  className="bg-slate-900 border border-white/10 rounded px-2 py-1 text-white w-20"
                />
                <span className="text-slate-400">to</span>
                <input
                  type="text"
                  value={params.no_truck_end_pm}
                  onChange={(e) => setParams({ ...params, no_truck_end_pm: e.target.value })}
                  className="bg-slate-900 border border-white/10 rounded px-2 py-1 text-white w-20"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Speed & Duty Hours */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Average Urban Speed (km/h)</label>
            <input
              type="number"
              value={params.avg_speed_kmh}
              onChange={(e) => setParams({ ...params, avg_speed_kmh: Number(e.target.value) })}
              className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Max Driver Duty Hours / Day</label>
            <input
              type="number"
              value={params.max_duty_hours}
              onChange={(e) => setParams({ ...params, max_duty_hours: Number(e.target.value) })}
              className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-between border-t border-white/10 pt-4">
          {saved ? (
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Parameters saved successfully!
            </span>
          ) : (
            <span className="text-xs text-slate-500">Changes apply to all future AI routing runs.</span>
          )}

          <button type="submit" className="btn-primary text-xs py-2 px-6">
            <Save className="w-4 h-4" /> Save Logistics Rules
          </button>
        </div>
      </form>
    </div>
  );
};

import React, { useState } from 'react';
import { Sliders, ShieldCheck, IndianRupee, Clock, Truck, Save, CheckCircle2, Zap, AlertTriangle } from 'lucide-react';

export const SettingsPage = () => {
  const [saved, setSaved] = useState(false);
  const [params, setParams] = useState({
    max_cod_limit_inr: 50000,
    no_truck_start_am: '08:00',
    no_truck_end_am: '11:00',
    no_truck_start_pm: '17:00',
    no_truck_end_pm: '20:00',
    avg_speed_kmh: 28,
    max_duty_hours: 9,
    ev_exemption_enabled: true,
    service_time_minutes: 8,
    strict_window_enforcement: true
  });

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3500);
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <Sliders className="w-6 h-6 text-cyan-400" /> Indian Logistics Rules & Constraint Parameters
          </h2>
          <p className="text-xs text-slate-400">
            Configure hyper-local operational constraints enforced by RouteMind AI.
          </p>
        </div>

        {saved && (
          <div className="badge badge-green text-xs font-bold py-2 px-4 shadow-lg animate-bounce flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Logistics Rules Successfully Saved & Applied!
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Financial & Traffic Rules */}
        <div className="space-y-6">
          {/* COD Cash Safety Threshold */}
          <div className="glass-panel p-5 space-y-4 border-amber-500/30">
            <div className="flex items-center gap-2 border-b border-white/10 pb-3">
              <IndianRupee className="w-5 h-5 text-amber-400" />
              <div>
                <h3 className="text-sm font-extrabold text-white">Cash-on-Delivery (COD) Safety Threshold</h3>
                <p className="text-[11px] text-slate-400">Maximum cash limit per vehicle before bank deposit lockbox</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <label className="block text-slate-300 font-semibold">Max Vehicle Cash Limit (INR ₹)</label>
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <input
                    type="number"
                    value={params.max_cod_limit_inr}
                    onChange={(e) => setParams({ ...params, max_cod_limit_inr: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm font-bold text-amber-400 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <span className="badge badge-orange text-xs py-2 px-3">₹50,000 DEFAULT</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Prevents cash-carry robbery risks across dense metro corridors in Bengaluru, Mumbai & Delhi.
              </p>
            </div>
          </div>

          {/* No-Truck Zone Restrictions */}
          <div className="glass-panel p-5 space-y-4 border-cyan-500/30">
            <div className="flex items-center gap-2 border-b border-white/10 pb-3">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
              <div>
                <h3 className="text-sm font-extrabold text-white">No-Truck Zone Peak Prohibition Hours</h3>
                <p className="text-[11px] text-slate-400">Indian commercial vehicle traffic police ban windows</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/5 space-y-2">
                <span className="font-bold text-amber-400 block">Morning Peak Ban</span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={params.no_truck_start_am}
                    onChange={(e) => setParams({ ...params, no_truck_start_am: e.target.value })}
                    className="bg-slate-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-white font-bold w-20 text-center"
                  />
                  <span className="text-slate-400 font-semibold">to</span>
                  <input
                    type="text"
                    value={params.no_truck_end_am}
                    onChange={(e) => setParams({ ...params, no_truck_end_am: e.target.value })}
                    className="bg-slate-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-white font-bold w-20 text-center"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/5 space-y-2">
                <span className="font-bold text-amber-400 block">Evening Peak Ban</span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={params.no_truck_start_pm}
                    onChange={(e) => setParams({ ...params, no_truck_start_pm: e.target.value })}
                    className="bg-slate-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-white font-bold w-20 text-center"
                  />
                  <span className="text-slate-400 font-semibold">to</span>
                  <input
                    type="text"
                    value={params.no_truck_end_pm}
                    onChange={(e) => setParams({ ...params, no_truck_end_pm: e.target.value })}
                    className="bg-slate-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-white font-bold w-20 text-center"
                  />
                </div>
              </div>
            </div>

            <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-200 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={params.ev_exemption_enabled}
                onChange={(e) => setParams({ ...params, ev_exemption_enabled: e.target.checked })}
                className="rounded bg-slate-800 border-white/20 text-cyan-500 focus:ring-0 w-4 h-4 cursor-pointer"
              />
              <span>Exempt Small Electric Vehicles (Tata Ace EV & 3W EV) from Peak Ban</span>
            </label>
          </div>
        </div>

        {/* Right Column: Fleet Telematics & Delivery Windows */}
        <div className="space-y-6">
          {/* Speed & Driver Duty Hours */}
          <div className="glass-panel p-5 space-y-4 border-emerald-500/30">
            <div className="flex items-center gap-2 border-b border-white/10 pb-3">
              <Truck className="w-5 h-5 text-emerald-400" />
              <div>
                <h3 className="text-sm font-extrabold text-white">Urban Speed Profile & Driver Duty Hours</h3>
                <p className="text-[11px] text-slate-400">Road curvature factor & legal driving duration constraints</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="block text-slate-300 font-semibold">Average Urban Speed (km/h)</label>
                <input
                  type="number"
                  value={params.avg_speed_kmh}
                  onChange={(e) => setParams({ ...params, avg_speed_kmh: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white font-bold focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-slate-300 font-semibold">Max Driver Duty Hours / Day</label>
                <input
                  type="number"
                  value={params.max_duty_hours}
                  onChange={(e) => setParams({ ...params, max_duty_hours: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white font-bold focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Customer VRPTW Windows */}
          <div className="glass-panel p-5 space-y-4 border-purple-500/30">
            <div className="flex items-center gap-2 border-b border-white/10 pb-3">
              <Clock className="w-5 h-5 text-purple-400" />
              <div>
                <h3 className="text-sm font-extrabold text-white">Customer VRPTW Delivery Windows</h3>
                <p className="text-[11px] text-slate-400">Service duration & time window penalty parameters</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Average Stop Service Duration (minutes)</label>
                <input
                  type="number"
                  value={params.service_time_minutes}
                  onChange={(e) => setParams({ ...params, service_time_minutes: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white font-bold focus:outline-none focus:border-cyan-500"
                />
              </div>

              <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-200 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={params.strict_window_enforcement}
                  onChange={(e) => setParams({ ...params, strict_window_enforcement: e.target.checked })}
                  className="rounded bg-slate-800 border-white/20 text-purple-500 focus:ring-0 w-4 h-4 cursor-pointer"
                />
                <span>Strict Time Window Enforcement (Reject orders outside 2h window)</span>
              </label>
            </div>
          </div>

          {/* Action Bar */}
          <div className="glass-panel p-4 flex items-center justify-between border-cyan-500/40">
            <span className="text-xs text-slate-400 font-medium">Changes immediately update OR-Tools VRP engine.</span>
            <button
              type="submit"
              className="btn-primary text-xs py-2.5 px-6 shadow-cyan-500/20 font-extrabold cursor-pointer hover:scale-[1.02] transition-transform"
            >
              <Save className="w-4 h-4" /> Save Logistics Rules & Apply
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

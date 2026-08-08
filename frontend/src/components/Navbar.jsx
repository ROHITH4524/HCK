import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, UserCheck, RefreshCw, Cpu, Zap } from 'lucide-react';

export const Navbar = ({ onTriggerReplan }) => {
  const { user, switchRole } = useAuth();

  return (
    <header className="h-16 border-b border-white/10 bg-[#0b0f19]/90 backdrop-blur-lg sticky top-0 z-40 px-6 flex items-center justify-between gap-4">
      {/* Brand Logo & Title */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
          <Cpu className="w-6 h-6 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 via-sky-200 to-amber-400 bg-clip-text text-transparent">
              RouteMind
            </h1>
            <span className="badge badge-cyan text-[10px]">AI Supply Chain v1.0</span>
          </div>
          <p className="text-[11px] text-slate-400">Amazon Last Mile Adaptive Optimization Engine</p>
        </div>
      </div>

      {/* Right Controls / Actions */}
      <div className="flex items-center gap-4 shrink-0">
        {/* Dynamic Replan Simulation Trigger */}
        <button
          onClick={() => onTriggerReplan && onTriggerReplan("TRAFFIC_JAM")}
          className="btn-orange text-xs py-2 px-3.5 shadow-orange-500/20 hover:scale-[1.02] transition-transform cursor-pointer"
          title="Simulate Instant Traffic Congestion Replan"
        >
          <Zap className="w-3.5 h-3.5 text-white" />
          Simulate Dynamic Replan
        </button>

        {/* Role Switcher for Hackathon Demo */}
        <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-white/10 text-xs shadow-inner">
          <button
            onClick={() => switchRole('SUPERVISOR')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              user?.role === 'SUPERVISOR'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Supervisor View
          </button>
          <button
            onClick={() => switchRole('DRIVER')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              user?.role === 'DRIVER'
                ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Driver Mobile
          </button>
        </div>

        {/* User Info Badge */}
        <div className="flex items-center gap-3 pl-3 border-l border-white/10">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-slate-200 leading-tight">{user?.full_name || 'Fleet Supervisor'}</p>
            <p className="text-[10px] text-cyan-400 uppercase tracking-wider font-semibold">{user?.role || 'SUPERVISOR'}</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-slate-800 border border-cyan-500/40 flex items-center justify-center shadow-md">
            {user?.role === 'DRIVER' ? (
              <UserCheck className="w-4 h-4 text-amber-400" />
            ) : (
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigation, Bell, ShieldCheck, UserCheck, RefreshCw, Cpu } from 'lucide-react';

export const Navbar = ({ onTriggerReplan }) => {
  const { user, switchRole, logout } = useAuth();

  return (
    <header className="h-16 border-b border-white/10 bg-[#0b0f19]/80 backdrop-blur-md sticky top-0 z-40 px-6 flex items-center justify-between">
      {/* Brand Logo */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
          <Cpu className="w-6 h-6 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 via-sky-200 to-amber-400 bg-clip-text text-transparent">
              RouteMind
            </h1>
            <span className="badge badge-cyan">AI Supply Chain v1.0</span>
          </div>
          <p className="text-xs text-slate-400">Amazon Last Mile Adaptive Engine</p>
        </div>
      </div>

      {/* Center Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => onTriggerReplan && onTriggerReplan("TRAFFIC_JAM")}
          className="btn-orange text-xs py-2 px-3"
          title="Simulate Instant Traffic Congestion Replan"
        >
          <RefreshCw className="w-4 h-4 animate-spin-slow" />
          Simulate Dynamic Replan
        </button>
      </div>

      {/* Right Controls / Profile */}
      <div className="flex items-center gap-4">
        {/* Role Switcher for Hackathon Demo */}
        <div className="flex items-center bg-slate-900/80 p-1 rounded-lg border border-white/10 text-xs">
          <button
            onClick={() => switchRole('SUPERVISOR')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all ${
              user?.role === 'SUPERVISOR'
                ? 'bg-cyan-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Supervisor View
          </button>
          <button
            onClick={() => switchRole('DRIVER')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all ${
              user?.role === 'DRIVER'
                ? 'bg-amber-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Driver Mobile
          </button>
        </div>

        {/* User Info */}
        <div className="flex items-center gap-3 pl-2 border-l border-white/10">
          <div className="text-right">
            <p className="text-xs font-semibold text-slate-200">{user?.full_name || 'Fleet Supervisor'}</p>
            <p className="text-[10px] text-cyan-400 uppercase tracking-wider">{user?.role || 'SUPERVISOR'}</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-slate-800 border border-cyan-500/40 flex items-center justify-center">
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

import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Route as RouteIcon, 
  MapPin, 
  CheckSquare, 
  Smartphone, 
  BarChart3, 
  Sliders, 
  Sparkles 
} from 'lucide-react';

export const Sidebar = () => {
  const menuItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/route-planner', label: 'AI Route Planner', icon: RouteIcon },
    { path: '/live-tracking', label: 'Live Map & Fleet', icon: MapPin },
    { path: '/supervisor', label: 'Supervisor Approvals', icon: CheckSquare, badge: 'AI' },
    { path: '/driver', label: 'Driver View', icon: Smartphone },
    { path: '/analytics', label: 'Analytics & Benchmarks', icon: BarChart3 },
    { path: '/settings', label: 'Logistics Rules', icon: Sliders },
  ];

  return (
    <aside className="w-64 border-r border-white/10 bg-[#0b0f19]/60 backdrop-blur-md flex flex-col justify-between p-4 sticky top-16 h-[calc(100vh-4rem)]">
      <div className="space-y-1">
        <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
          Supply Chain Core
        </p>
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/10 text-cyan-400 border border-cyan-500/30 shadow-lg shadow-cyan-500/5'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="badge badge-orange text-[9px] px-1.5 py-0.5">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Footer Banner */}
      <div className="p-3.5 rounded-xl glass-panel border-cyan-500/20 bg-gradient-to-br from-cyan-950/40 to-slate-900/80">
        <div className="flex items-center gap-2 mb-1.5">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <p className="text-xs font-semibold text-cyan-300">Indian Logistics Rules</p>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Enforcing No-Truck hours, COD cash safety limits & Bangalore traffic windows.
        </p>
      </div>
    </aside>
  );
};

import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export const KPICard = ({ title, value, unit = '', trend = null, icon: Icon, color = 'cyan' }) => {
  const colorMap = {
    cyan: 'from-cyan-500/20 to-blue-600/10 border-cyan-500/30 text-cyan-400',
    amber: 'from-amber-500/20 to-orange-600/10 border-amber-500/30 text-amber-400',
    green: 'from-emerald-500/20 to-teal-600/10 border-emerald-500/30 text-emerald-400',
    rose: 'from-rose-500/20 to-red-600/10 border-rose-500/30 text-rose-400',
    purple: 'from-purple-500/20 to-indigo-600/10 border-purple-500/30 text-purple-400',
  };

  return (
    <div className={`p-5 rounded-2xl glass-panel glass-panel-hover bg-gradient-to-br ${colorMap[color] || colorMap.cyan} relative overflow-hidden group`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</span>
        {Icon && (
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 group-hover:scale-110 transition-transform">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2">
        <h3 className="text-2xl font-extrabold tracking-tight text-white">{value}</h3>
        {unit && <span className="text-sm font-medium text-slate-400">{unit}</span>}
      </div>

      {trend && (
        <div className="flex items-center gap-1.5 mt-2.5 text-xs font-medium">
          {trend.isPositive ? (
            <span className="text-emerald-400 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> +{trend.value}%
            </span>
          ) : (
            <span className="text-rose-400 flex items-center gap-1">
              <TrendingDown className="w-3.5 h-3.5" /> -{trend.value}%
            </span>
          )}
          <span className="text-slate-500">{trend.label || 'vs last week'}</span>
        </div>
      )}
    </div>
  );
};

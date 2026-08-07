import React, { useState, useEffect } from 'react';
import { analyticsAPI } from '../services/api';
import { BarChart3, TrendingUp, Cpu, Award, Zap, ShieldCheck } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export const AnalyticsPage = () => {
  const [benchmarks, setBenchmarks] = useState([]);
  const [analyticsData, setAnalyticsData] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [bRes, aRes] = await Promise.all([
          analyticsAPI.getBenchmark(),
          analyticsAPI.getAnalytics()
        ]);
        setBenchmarks(bRes.data);
        setAnalyticsData(aRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, []);

  const COLORS = ['#06b6d4', '#f97316', '#10b981', '#a855f7'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-cyan-400" /> Algorithmic Benchmarks & Supply Chain Analytics
        </h2>
        <p className="text-xs text-slate-400">
          Comparing RouteMind AI against Greedy, Nearest Neighbor, and Standard OR-Tools solvers.
        </p>
      </div>

      {/* Benchmark Comparison Table Card */}
      <div className="glass-panel p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-white">Algorithm Performance Matrix</h3>
          </div>
          <span className="badge badge-cyan">40 Stops Amazon Benchmark</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="p-3">Routing Algorithm</th>
                <th className="p-3">Total Distance (km)</th>
                <th className="p-3">Total Time (min)</th>
                <th className="p-3">Fuel Cost (INR)</th>
                <th className="p-3">ETA Accuracy</th>
                <th className="p-3">Success Rate</th>
                <th className="p-3 text-right">Savings vs Baseline</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {benchmarks.map((b, idx) => (
                <tr key={idx} className={b.algorithm.includes('RouteMind') ? 'bg-cyan-500/10 font-bold' : ''}>
                  <td className="p-3 flex items-center gap-2">
                    {b.algorithm.includes('RouteMind') && <Cpu className="w-4 h-4 text-cyan-400" />}
                    <span className={b.algorithm.includes('RouteMind') ? 'text-cyan-300 font-extrabold' : 'text-slate-200'}>
                      {b.algorithm}
                    </span>
                  </td>
                  <td className="p-3 text-slate-200">{b.total_distance_km} km</td>
                  <td className="p-3 text-slate-200">{b.total_time_min} min</td>
                  <td className="p-3 text-amber-400">₹{b.fuel_cost_inr}</td>
                  <td className="p-3 text-emerald-400">{b.eta_accuracy_percent}%</td>
                  <td className="p-3 text-emerald-400">{b.delivery_success_rate}%</td>
                  <td className="p-3 text-right font-extrabold text-cyan-400">
                    +{b.savings_vs_greedy_percent}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Visual Benchmark Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distance Comparison Chart */}
        <div className="glass-panel p-5 space-y-4">
          <h3 className="text-sm font-bold text-white">Total Fleet Distance by Algorithm (Lower is Better)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={benchmarks}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="algorithm" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#06b6d4' }} />
                <Bar dataKey="total_distance_km" fill="#06b6d4" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ETA Accuracy Chart */}
        <div className="glass-panel p-5 space-y-4">
          <h3 className="text-sm font-bold text-white">ETA Accuracy % Comparison</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={benchmarks}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="algorithm" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} domain={[50, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#10b981' }} />
                <Bar dataKey="eta_accuracy_percent" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

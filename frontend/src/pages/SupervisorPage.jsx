import React, { useState, useEffect } from 'react';
import { supervisorAPI, routeAPI } from '../services/api';
import { CheckSquare, ShieldCheck, Clock, MapPin, CheckCircle2, XCircle, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';
import { SupervisorModal } from '../components/SupervisorModal';

export const SupervisorPage = () => {
  const [pendingDecisions, setPendingDecisions] = useState([]);
  const [history, setHistory] = useState([]);
  const [activeDecision, setActiveDecision] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSupervisorData = async () => {
    try {
      setLoading(true);
      const [pendingRes, historyRes] = await Promise.all([
        supervisorAPI.getPending(),
        routeAPI.getHistory()
      ]);
      setPendingDecisions(pendingRes.data || []);
      setHistory(historyRes.data || []);
    } catch (err) {
      console.error("Supervisor page error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSupervisorData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-cyan-400" /> Fleet Supervisor Approval Dashboard
          </h2>
          <p className="text-xs text-slate-400">
            Review and approve sub-30 second AI dynamic route replanning proposals.
          </p>
        </div>

        <span className={`badge ${pendingDecisions.length > 0 ? 'badge-orange' : 'badge-green'} py-1.5 px-3.5 text-xs font-bold`}>
          {pendingDecisions.length} Pending Review Queue
        </span>
      </div>

      {/* Pending Proposals Queue */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" /> Pending AI Replan Proposals ({pendingDecisions.length})
        </h3>

        {pendingDecisions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pendingDecisions.map((dec) => (
              <div key={dec.decision_id} className="glass-panel p-5 space-y-4 border-amber-500/40 shadow-xl relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div>
                    <h4 className="text-sm font-extrabold text-white">Decision ID: {dec.decision_id}</h4>
                    <p className="text-[11px] text-slate-400 font-medium">Route: {dec.route_id}</p>
                  </div>
                  <span className="badge badge-orange text-[10px]">PENDING APPROVAL</span>
                </div>

                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">{dec.explanation}</p>

                {/* Metrics Highlights */}
                <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-900/90 text-center text-xs border border-white/5">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Time Saved</p>
                    <p className="font-extrabold text-emerald-400">{Math.abs(dec.time_saved_min || 0).toFixed(1)} min</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">New Distance</p>
                    <p className="font-extrabold text-cyan-400">{dec.after_distance_km} km</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Fuel Saved</p>
                    <p className="font-extrabold text-amber-400">₹{Math.abs(dec.cost_diff_inr || 0).toFixed(2)}</p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveDecision(dec)}
                  className="w-full btn-primary justify-center text-xs py-2.5 shadow-cyan-500/20 cursor-pointer hover:scale-[1.01] transition-transform"
                >
                  <ShieldCheck className="w-4 h-4" /> Review Details & Sign-Off
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center glass-panel border-white/5 space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <p className="text-sm font-bold text-white">Pending Queue Empty</p>
            <p className="text-xs text-slate-400">All AI dynamic route adjustments have been reviewed by supervisor.</p>
          </div>
        )}
      </div>

      {/* Historical Decisions Audit Trail */}
      <div className="glass-panel p-5 space-y-4 border-cyan-500/20">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h3 className="text-sm font-bold text-white">
            AI Decision History & Audit Trail ({history.length})
          </h3>
          <span className="badge badge-cyan">Full Audit Log</span>
        </div>

        <div className="space-y-3">
          {history.length > 0 ? (
            history.map((h) => (
              <div key={h.decision_id} className="p-4 rounded-xl bg-slate-900/80 border border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-white/10 transition-all">
                <div className="space-y-1 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-xs text-cyan-400">{h.decision_id}</span>
                    <span className={`badge ${h.status === 'APPROVED' ? 'badge-green' : 'badge-red'} text-[10px]`}>
                      {h.status}
                    </span>
                    <span className="text-[10px] text-slate-400">• Route: {h.route_id}</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{h.explanation}</p>
                  <p className="text-[10px] text-slate-500 font-medium">Timestamp: {new Date(h.created_at).toLocaleString()}</p>
                </div>

                <div className="flex items-center gap-4 text-xs font-semibold shrink-0 bg-slate-950/60 p-2.5 rounded-xl border border-white/5">
                  <div className="text-right">
                    <p className="text-[9px] text-slate-400 uppercase">Time Saved</p>
                    <p className="text-emerald-400 font-extrabold">{Math.abs(h.time_saved_min || 0).toFixed(1)} min</p>
                  </div>
                  <div className="text-right border-l border-white/10 pl-3">
                    <p className="text-[9px] text-slate-400 uppercase">Distance</p>
                    <p className="text-cyan-400 font-extrabold">{h.after_distance_km} km</p>
                  </div>
                  <div className="text-right border-l border-white/10 pl-3">
                    <p className="text-[9px] text-slate-400 uppercase">Fuel Impact</p>
                    <p className="text-amber-400 font-extrabold">₹{Math.abs(h.cost_diff_inr || 0).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400 text-center py-4">No historical AI decisions recorded yet.</p>
          )}
        </div>
      </div>

      {/* Active Modal */}
      {activeDecision && (
        <SupervisorModal
          decision={activeDecision}
          onClose={() => setActiveDecision(null)}
          onActionComplete={fetchSupervisorData}
        />
      )}
    </div>
  );
};

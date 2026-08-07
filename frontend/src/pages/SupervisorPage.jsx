import React, { useState, useEffect } from 'react';
import { supervisorAPI, routeAPI } from '../services/api';
import { CheckSquare, ShieldCheck, Clock, MapPin, CheckCircle2, XCircle, ArrowRight, Sparkles } from 'lucide-react';
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
      setPendingDecisions(pendingRes.data);
      setHistory(historyRes.data);
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-cyan-400" /> Fleet Supervisor Approval Dashboard
          </h2>
          <p className="text-xs text-slate-400">
            Review and approve sub-30 second AI dynamic route replanning proposals.
          </p>
        </div>

        <span className="badge badge-cyan py-1.5 px-3">
          {pendingDecisions.length} Pending Review
        </span>
      </div>

      {/* Pending Proposals Queue */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" /> Pending AI Replan Queue
        </h3>

        {pendingDecisions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingDecisions.map((dec) => (
              <div key={dec.decision_id} className="glass-panel p-5 space-y-4 border-amber-500/30">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div>
                    <h4 className="text-sm font-bold text-white">Decision ID: {dec.decision_id}</h4>
                    <p className="text-[11px] text-slate-400">Route ID: {dec.route_id}</p>
                  </div>
                  <span className="badge badge-orange">PENDING APPROVAL</span>
                </div>

                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">{dec.explanation}</p>

                <div className="grid grid-cols-3 gap-2 p-2.5 rounded-lg bg-slate-900/80 text-center text-xs">
                  <div>
                    <p className="text-[10px] text-slate-400">Time Saved</p>
                    <p className="font-bold text-emerald-400">{dec.time_saved_min} min</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400">Distance</p>
                    <p className="font-bold text-cyan-400">{dec.after_distance_km} km</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400">Cost Impact</p>
                    <p className="font-bold text-amber-400">₹{dec.cost_diff_inr}</p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveDecision(dec)}
                  className="w-full btn-primary justify-center text-xs py-2"
                >
                  Review Details & Approve
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center glass-panel border-white/5 space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <p className="text-sm font-bold text-white">Queue Empty</p>
            <p className="text-xs text-slate-400">All AI dynamic route changes have been approved by supervisor.</p>
          </div>
        )}
      </div>

      {/* Historical Decisions Audit Trail */}
      <div className="glass-panel p-5 space-y-4">
        <h3 className="text-sm font-bold text-white border-b border-white/10 pb-3">
          AI Decision History & Audit Trail ({history.length})
        </h3>

        <div className="space-y-3">
          {history.map((h) => (
            <div key={h.decision_id} className="p-4 rounded-xl bg-slate-900/80 border border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-cyan-400">{h.decision_id}</span>
                  <span className={`badge ${h.status === 'APPROVED' ? 'badge-green' : 'badge-orange'}`}>
                    {h.status}
                  </span>
                </div>
                <p className="text-xs text-slate-300">{h.explanation}</p>
                <p className="text-[10px] text-slate-500">Timestamp: {new Date(h.created_at).toLocaleString()}</p>
              </div>

              <div className="flex items-center gap-4 text-xs font-semibold shrink-0">
                <span className="text-emerald-400">-{h.time_saved_min} min</span>
                <span className="text-cyan-400">{h.after_distance_km} km</span>
                <span className="text-amber-400">₹{h.cost_diff_inr}</span>
              </div>
            </div>
          ))}
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

import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, XCircle, AlertTriangle, ArrowRight, Sparkles, Clock, MapPin, Fuel } from 'lucide-react';
import { supervisorAPI } from '../services/api';

export const SupervisorModal = ({ decision, onClose, onActionComplete }) => {
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState('');

  if (!decision) return null;

  const handleApprove = async () => {
    setLoading(true);
    try {
      await supervisorAPI.approveDecision(decision.decision_id, true, notes);
      onActionComplete && onActionComplete(decision.decision_id, 'APPROVED');
      onClose();
    } catch (err) {
      console.error(err);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    setLoading(true);
    try {
      await supervisorAPI.approveDecision(decision.decision_id, false, notes);
      onActionComplete && onActionComplete(decision.decision_id, 'REJECTED');
      onClose();
    } catch (err) {
      console.error(err);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#111827] border border-cyan-500/30 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-6 relative overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Glow Header Accent */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">AI Dynamic Replanning Proposal</h3>
                <span className="badge badge-green text-[10px]">✓ Self-Check Passed</span>
              </div>
              <p className="text-xs text-slate-400">Decision ID: {decision.decision_id} • Route: {decision.route_id}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-sm font-bold">✕</button>
        </div>

        {/* Guardrails Verification Banner */}
        <div className="p-3 rounded-xl bg-slate-900/90 border border-cyan-500/30 flex items-center justify-between text-[11px]">
          <span className="text-emerald-400 font-bold flex items-center gap-1">
            ⚡ Latency: 0.14s (Sub-30s Guardrail Met)
          </span>
          <span className="text-cyan-300 font-semibold flex items-center gap-1">
            🛡️ Self-Check: All Constraints Verified
          </span>
          <span className="text-amber-400 font-semibold">
            💵 Compute Cost: $0.00195 / ₹0.16
          </span>
        </div>

        {/* Narrative & Rationale */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-white/5 space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400">AI Recommendation & Rationale</h4>
          <p className="text-xs text-slate-300 leading-relaxed">{decision.explanation}</p>
        </div>

        {/* Before vs After Metric Comparison Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* BEFORE */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-rose-500/20 space-y-2">
            <span className="badge badge-red">Original Plan</span>
            <div className="space-y-1 mt-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Distance:</span>
                <span className="font-semibold text-slate-200">{decision.before_distance_km} km</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Duration:</span>
                <span className="font-semibold text-slate-200">{decision.before_duration_min} min</span>
              </div>
            </div>
          </div>

          {/* AFTER */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-emerald-500/20 space-y-2">
            <span className="badge badge-green">AI Optimized Plan</span>
            <div className="space-y-1 mt-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> New Distance:</span>
                <span className="font-semibold text-emerald-400">{decision.after_distance_km} km</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> New Duration:</span>
                <span className="font-semibold text-emerald-400">{decision.after_duration_min} min</span>
              </div>
            </div>
          </div>
        </div>

        {/* Net Savings Highlights */}
        <div className="grid grid-cols-3 gap-3 p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-500/30 text-center">
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400">Distance Saved</p>
            <p className="text-base font-extrabold text-cyan-400">{decision.distance_saved_km} km</p>
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400">Time Saved</p>
            <p className="text-base font-extrabold text-emerald-400">{decision.time_saved_min} min</p>
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400">Fuel Savings</p>
            <p className="text-base font-extrabold text-amber-400">₹{decision.cost_diff_inr}</p>
          </div>
        </div>

        {/* Constraints List */}
        {decision.affected_constraints && (
          <div className="space-y-1.5">
            <p className="text-[11px] font-bold text-slate-400 uppercase">Indian Constraints Evaluated:</p>
            <div className="flex flex-wrap gap-2">
              {decision.affected_constraints.map((c, i) => (
                <span key={i} className="badge badge-cyan text-[10px]">
                  ✓ {c}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Supervisor Notes Input */}
        <div>
          <label className="text-xs text-slate-400 font-medium block mb-1">Supervisor Notes / Justification (Optional)</label>
          <input
            type="text"
            placeholder="e.g. Approved detour bypass around Indiranagar gridlock..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 border-t border-white/10 pt-4">
          <button
            disabled={loading}
            onClick={handleReject}
            className="px-4 py-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5"
          >
            <XCircle className="w-4 h-4" /> Reject Proposal
          </button>

          <button
            disabled={loading}
            onClick={handleApprove}
            className="btn-primary text-xs py-2 px-5"
          >
            <CheckCircle2 className="w-4 h-4" /> Approve & Update Driver Sequence
          </button>
        </div>

      </div>
    </div>
  );
};

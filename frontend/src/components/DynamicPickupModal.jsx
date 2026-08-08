import React, { useState } from 'react';
import { Zap, X, MapPin, User, Package, IndianRupee, Clock, ArrowRight } from 'lucide-react';

export const DynamicPickupModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    customer_name: 'Ananya Sharma',
    address: 'Koramangala 5th Block, Bengaluru',
    lat: 12.9352,
    lng: 77.6245,
    package_weight_kg: 3.5,
    is_cod: true,
    cod_amount_inr: 2400.0,
    time_window_end: '16:00'
  });
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel max-w-md w-full p-6 space-y-5 border-amber-500/40 shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
              <Zap className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">Dynamic On-Demand Pickup Request</h3>
              <p className="text-xs text-slate-400">Inject priority pickup into live VRP fleet</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Customer Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                required
                value={formData.customer_name}
                onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                className="w-full bg-slate-900 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Pickup Address (Bengaluru)</label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full bg-slate-900 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Package Weight (kg)</label>
              <div className="relative">
                <Package className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="number"
                  step="0.1"
                  required
                  value={formData.package_weight_kg}
                  onChange={(e) => setFormData({ ...formData, package_weight_kg: parseFloat(e.target.value) })}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">COD Collection (₹)</label>
              <div className="relative">
                <IndianRupee className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="number"
                  required
                  value={formData.cod_amount_inr}
                  onChange={(e) => setFormData({ ...formData, cod_amount_inr: parseFloat(e.target.value) })}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary text-xs py-2 px-4 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-orange text-xs py-2 px-5 shadow-orange-500/20 cursor-pointer hover:scale-[1.02] transition-transform"
            >
              {submitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Calculating VRP Insertion...
                </>
              ) : (
                <>
                  Submit Dynamic Pickup <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

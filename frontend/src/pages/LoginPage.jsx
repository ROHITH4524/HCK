import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Cpu, ShieldCheck, UserCheck, Lock, User } from 'lucide-react';

export const LoginPage = () => {
  const [username, setUsername] = useState('supervisor');
  const [password, setPassword] = useState('supervisor123');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await login(username, password);
    setLoading(false);
    navigate('/');
  };

  const handleQuickRole = (roleUser, rolePass) => {
    setUsername(roleUser);
    setPassword(rolePass);
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md glass-panel p-8 space-y-6 border-cyan-500/30 shadow-2xl relative z-10">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 mx-auto flex items-center justify-center shadow-lg shadow-cyan-500/30 mb-3">
            <Cpu className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">RouteMind AI</h2>
          <p className="text-xs text-slate-400">Adaptive Supply Chain Route Optimization Platform</p>
        </div>

        {/* Demo Quick Role Selector */}
        <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5 space-y-2">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Hackathon Quick Demo Roles</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickRole('supervisor', 'supervisor123')}
              className={`p-2 rounded-lg text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all ${
                username === 'supervisor'
                  ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                  : 'bg-slate-800/50 border-white/5 text-slate-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" /> Supervisor View
            </button>
            <button
              type="button"
              onClick={() => handleQuickRole('driver1', 'driver123')}
              className={`p-2 rounded-lg text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all ${
                username === 'driver1'
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                  : 'bg-slate-800/50 border-white/5 text-slate-400 hover:text-white'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" /> Driver View
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Username</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:border-cyan-500"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:border-cyan-500"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary justify-center py-3 text-xs shadow-cyan-500/30 mt-2"
          >
            {loading ? 'Authenticating...' : 'Sign In to Operations Portal'}
          </button>
        </form>
      </div>
    </div>
  );
};

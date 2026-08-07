import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DriverView } from './components/DriverView';
import { SupervisorModal } from './components/SupervisorModal';

import { DashboardPage } from './pages/DashboardPage';
import { RoutePlannerPage } from './pages/RoutePlannerPage';
import { LiveTrackingPage } from './pages/LiveTrackingPage';
import { SupervisorPage } from './pages/SupervisorPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SettingsPage } from './pages/SettingsPage';
import { LoginPage } from './pages/LoginPage';

import { routeAPI } from './services/api';

const MainLayout = () => {
  const { user, switchRole } = useAuth();
  const [activeReplanDecision, setActiveReplanDecision] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const triggerReplanFlow = async (eventType = 'TRAFFIC_JAM') => {
    try {
      const res = await routeAPI.replan({
        event_type: eventType,
        route_id: 'RT_VEH_BLR_01',
        affected_stop_id: 'STOP_005',
        description: `Simulated live event: ${eventType} gridlock detected`
      });
      setActiveReplanDecision(res.data);
      setToastMessage(`AI Replanning Proposal generated for ${eventType}`);
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      console.error('Replan trigger error:', err);
    }
  };

  const triggerInstantPickupModal = () => {
    triggerReplanFlow('INSTANT_PICKUP');
  };

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Driver View override for mobile demo mode
  if (user.role === 'DRIVER') {
    return (
      <div className="min-h-screen bg-[#0b0f19] p-4 flex flex-col items-center justify-center space-y-4">
        <div className="w-full max-w-md flex items-center justify-between bg-slate-900/90 border border-white/10 p-3 rounded-2xl glass-panel shadow-lg">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-slate-200">Driver Mobile App Mode</span>
          </div>
          <button
            onClick={() => switchRole('SUPERVISOR')}
            className="btn-primary text-xs py-1.5 px-3 font-semibold cursor-pointer"
          >
            ← Supervisor View
          </button>
        </div>
        <DriverView />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col font-sans">
      <Navbar onTriggerReplan={triggerReplanFlow} />

      {toastMessage && (
        <div className="bg-cyan-500 text-white px-4 py-2 text-xs font-bold text-center animate-pulse sticky top-16 z-30">
          ⚡ {toastMessage}
        </div>
      )}

      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto max-w-7xl">
          <Routes>
            <Route path="/" element={<DashboardPage onTriggerReplan={triggerReplanFlow} onTriggerPickup={triggerInstantPickupModal} />} />
            <Route path="/route-planner" element={<RoutePlannerPage />} />
            <Route path="/live-tracking" element={<LiveTrackingPage onTriggerReplan={triggerReplanFlow} onTriggerPickup={triggerInstantPickupModal} />} />
            <Route path="/supervisor" element={<SupervisorPage />} />
            <Route path="/driver" element={<DriverView />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </main>
      </div>

      {activeReplanDecision && (
        <SupervisorModal
          decision={activeReplanDecision}
          onClose={() => setActiveReplanDecision(null)}
          onActionComplete={() => setToastMessage('Decision processed!')}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/*" element={<MainLayout />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Truck, MapPin, AlertTriangle, ShieldCheck, Zap, Navigation } from 'lucide-react';

// Custom Leaflet Icons
const hubIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/447/447031.png',
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36]
});

const deliveryIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -28]
});

const pickupIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/1006/1006771.png',
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30]
});

const vehicleIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3202/3202926.png',
  iconSize: [38, 38],
  iconAnchor: [19, 38],
  popupAnchor: [0, -38]
});

// Component to handle auto-fit bounds
const AutoFitBounds = ({ routes, hub }) => {
  const map = useMap();
  useEffect(() => {
    if (routes && routes.length > 0) {
      const points = [
        [hub.lat, hub.lng],
        ...routes.flatMap(r => (r.stops || []).map(s => [s.lat, s.lng]))
      ];
      if (points.length > 1) {
        map.fitBounds(points, { padding: [40, 40] });
      }
    }
  }, [routes, hub, map]);
  return null;
};

export const MapView = ({ routes = [], vehicles = [], onStopClick, onTriggerPickup }) => {
  const hub = { lat: 13.0285, lng: 77.5197, name: 'Peenya Hub (Bengaluru Depot)' };
  const routeColors = ['#06b6d4', '#f97316', '#10b981', '#a855f7', '#ec4899'];
  const [animatedPositions, setAnimatedPositions] = useState({});

  // Live Vehicle Telematics Movement Simulation along Route Polylines
  useEffect(() => {
    if (!routes || routes.length === 0) return;

    let stepIndex = 0;
    const interval = setInterval(() => {
      stepIndex++;
      const newPos = {};

      routes.forEach((route) => {
        const stops = route.stops || [];
        if (stops.length > 0) {
          const pathPoints = [
            [hub.lat, hub.lng],
            ...stops.map(s => [s.lat, s.lng]),
            [hub.lat, hub.lng]
          ];
          const currIdx = stepIndex % pathPoints.length;
          newPos[route.vehicle_id] = {
            lat: pathPoints[currIdx][0],
            lng: pathPoints[currIdx][1],
            nextStop: stops[currIdx]?.customer_name || 'En-Route'
          };
        }
      });

      setAnimatedPositions(newPos);
    }, 4000);

    return () => clearInterval(interval);
  }, [routes]);

  return (
    <div className="w-full h-full min-h-[500px] rounded-2xl overflow-hidden border border-white/10 relative shadow-2xl">
      <MapContainer
        center={[hub.lat, hub.lng]}
        zoom={12}
        style={{ width: '100%', height: '100%', minHeight: '500px' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        <AutoFitBounds routes={routes} hub={hub} />

        {/* Hub Depot Marker */}
        <Marker position={[hub.lat, hub.lng]} icon={hubIcon}>
          <Popup>
            <div className="p-1 space-y-1">
              <h4 className="font-bold text-cyan-400 text-sm">{hub.name}</h4>
              <p className="text-xs text-slate-300">Central Amazon Fulfillment Hub</p>
              <span className="badge badge-cyan mt-1">Depot Origin</span>
            </div>
          </Popup>
        </Marker>

        {/* Render Routes & Stops */}
        {routes.map((route, rIdx) => {
          const stops = route.stops || [];
          const polylineCoords = [
            [hub.lat, hub.lng],
            ...stops.map(s => [s.lat, s.lng]),
            [hub.lat, hub.lng]
          ];

          const color = routeColors[rIdx % routeColors.length];

          return (
            <React.Fragment key={route.route_id || rIdx}>
              {/* Route Polyline */}
              <Polyline
                positions={polylineCoords}
                pathOptions={{
                  color: color,
                  weight: 4,
                  opacity: 0.85,
                  dashArray: route.status === 'REPLANNED' ? '6, 6' : undefined
                }}
              />

              {/* Stop Markers */}
              {stops.map((stop) => (
                <Marker
                  key={stop.stop_id}
                  position={[stop.lat, stop.lng]}
                  icon={stop.type === 'PICKUP' ? pickupIcon : deliveryIcon}
                >
                  <Popup>
                    <div className="p-2 space-y-1.5 max-w-xs">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-xs text-cyan-300">Stop #{stop.sequence_order}</span>
                        <span className={`badge ${stop.is_cod ? 'badge-orange' : 'badge-green'}`}>
                          {stop.is_cod ? `COD ₹${stop.cod_amount_inr}` : 'PREPAID'}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-white">{stop.customer_name || stop.address}</p>
                      <p className="text-[11px] text-slate-300">{stop.address}</p>
                      <p className="text-[11px] text-slate-400">ETA: <strong className="text-amber-400">{stop.eta || '10:30'}</strong> ({stop.service_time_minutes} min service)</p>
                      {stop.no_truck_zone && (
                        <div className="flex items-center gap-1 text-[10px] text-rose-400 font-semibold pt-1">
                          <AlertTriangle className="w-3 h-3" /> No-Truck Prohibition Zone
                        </div>
                      )}
                    </div>
                  </Popup>
                </Marker>
              ))}
            </React.Fragment>
          );
        })}

        {/* Live Moving Vehicles */}
        {vehicles.map((v) => {
          const livePos = animatedPositions[v.vehicle_id];
          const lat = livePos?.lat || v.current_lat || hub.lat;
          const lng = livePos?.lng || v.current_lng || hub.lng;

          return (
            <Marker
              key={v.vehicle_id}
              position={[lat, lng]}
              icon={vehicleIcon}
            >
              <Popup>
                <div className="p-2 space-y-1">
                  <h4 className="font-bold text-sm text-cyan-400 flex items-center gap-1.5">
                    <Navigation className="w-3.5 h-3.5 text-emerald-400 animate-spin-slow" />
                    {v.name}
                  </h4>
                  <p className="text-xs text-slate-300">Type: {v.type}</p>
                  <p className="text-xs text-slate-300">Target: <strong className="text-amber-400">{livePos?.nextStop || 'En-Route'}</strong></p>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="badge badge-green">LIVE TRACKING</span>
                    <span className="text-slate-400 font-semibold">Max COD: ₹{v.max_cod_limit_inr?.toLocaleString()}</span>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Floating Map Controls Overlay */}
      <div className="absolute top-4 right-4 z-[1000] bg-slate-900/90 border border-white/10 backdrop-blur-md p-1.5 rounded-xl shadow-xl flex items-center gap-2">
        <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400 px-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          Live Telematics Moving
        </span>
        <button
          onClick={() => onTriggerPickup && onTriggerPickup()}
          className="btn-orange text-xs py-2 px-3.5 shadow-md flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] transition-transform"
        >
          <Zap className="w-3.5 h-3.5 text-white" />
          + Add Instant Pickup Request
        </button>
      </div>
    </div>
  );
};

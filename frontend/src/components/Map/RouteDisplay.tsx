
import { useMemo } from 'react';
import { Polyline, Marker, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { ClusterAlert } from '@/hooks/useBusData';

interface RouteDisplayProps {
  alert: ClusterAlert;
}

const RouteDisplay = ({ alert }: RouteDisplayProps) => {
  // Create custom icons for the route stops
  const fromStopIcon = useMemo(() => {
    return L.divIcon({
      className: 'marker-icon',
      html: `
        <div class="flex items-center justify-center w-8 h-8 rounded-full bg-yellow-500 text-white shadow-lg">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M12 8v4l2 2"></path>
          </svg>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16]
    });
  }, []);

  const toStopIcon = useMemo(() => {
    return L.divIcon({
      className: 'marker-icon',
      html: `
        <div class="flex items-center justify-center w-8 h-8 rounded-full bg-green-500 text-white shadow-lg">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 22L2 12 12 2l10 10-10 10z"></path>
          </svg>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16]
    });
  }, []);

  if (!alert.alternateRoute) {
    return null;
  }

  const { points, fromStop, toStop } = alert.alternateRoute;
  const startPoint = points[0];
  const endPoint = points[points.length - 1];

  return (
    <>
      <Polyline 
        positions={points} 
        pathOptions={{ 
          color: '#00C2A8', 
          weight: 4, 
          opacity: 0.7,
          dashArray: '10, 10',
          lineCap: 'round'
        }} 
      />
      
      <Marker position={startPoint} icon={fromStopIcon}>
        <Tooltip permanent direction="top" offset={[0, -16]}>
          <div className="text-xs font-medium">{fromStop}</div>
        </Tooltip>
      </Marker>
      
      <Marker position={endPoint} icon={toStopIcon}>
        <Tooltip permanent direction="top" offset={[0, -16]}>
          <div className="text-xs font-medium">{toStop}</div>
        </Tooltip>
      </Marker>
    </>
  );
};

export default RouteDisplay;

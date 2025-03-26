
import { useMemo } from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Bus } from '@/hooks/useBusData';

interface BusMarkerProps {
  bus: Bus;
  onClick?: (busId: string) => void;
}

const BusMarker = ({ bus, onClick }: BusMarkerProps) => {
  // Create a custom icon based on the bus status
  const busIcon = useMemo(() => {
    let className = 'bus-marker-normal';
    
    if (bus.status === 'alert') {
      className = 'bus-marker-alert';
    } else if (bus.status === 'alternate') {
      className = 'bus-marker-alternate';
    }
    
    return L.divIcon({
      className: `marker-icon ${bus.status === 'alert' ? 'marker-icon-bounce' : ''}`,
      html: `
        <div class="flex items-center justify-center w-10 h-10 rounded-full ${className} shadow-lg">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M8 6v12m8-12v12M4 6h16M4 18h16M6 6h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z"></path>
          </svg>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
      popupAnchor: [0, -20]
    });
  }, [bus.status]);

  const statusText = {
    normal: 'On Schedule',
    alert: 'Clustered - Needs Rerouting',
    alternate: 'Taking Alternate Route'
  };

  return (
    <Marker 
      position={bus.position} 
      icon={busIcon}
      eventHandlers={{
        click: () => onClick && onClick(bus.id)
      }}
    >
      <Popup className="bus-popup">
        <div className="space-y-2 p-1">
          <div className="font-medium text-lg border-b pb-1">Bus {bus.id}</div>
          
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Route:</span>
            <span className="font-medium">{bus.route}</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Speed:</span>
            <span className="font-medium">{bus.speed} km/h</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Status:</span>
            <span className={`font-medium ${
              bus.status === 'alert' 
                ? 'text-red-500' 
                : bus.status === 'alternate' 
                  ? 'text-teal-500' 
                  : 'text-green-500'
            }`}>
              {statusText[bus.status]}
            </span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Occupancy:</span>
            <span className="font-medium">
              {bus.occupancy}/{bus.capacity} ({Math.round((bus.occupancy / bus.capacity) * 100)}%)
            </span>
          </div>
        </div>
      </Popup>
    </Marker>
  );
};

export default BusMarker;


import { useEffect } from 'react';
import { MapContainer, TileLayer, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import BusMarker from './BusMarker';
import RouteDisplay from './RouteDisplay';
import { useBusData } from '@/hooks/useBusData';
import { Button } from '@/components/ui/button';
import { Info, RefreshCw } from 'lucide-react';

// Fix for default marker icons in Leaflet with React
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const MapView = () => {
  const { buses, alerts, loading, rerouteBus } = useBusData();
  
  // Set default map view to New York City
  const defaultPosition: [number, number] = [40.7128, -74.006];
  const defaultZoom = 14;
  
  // Handle bus click - could trigger a reroute action
  const handleBusClick = (busId: string) => {
    console.log('Bus clicked:', busId);
    
    // Check if this bus is in alert state
    const bus = buses.find(b => b.id === busId);
    if (bus?.status === 'alert') {
      rerouteBus(busId);
    }
  };

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] overflow-hidden rounded-lg shadow-subtle">
      {loading ? (
        <div className="flex items-center justify-center h-full bg-gray-100 dark:bg-gray-800 animate-pulse">
          <div className="text-lg font-medium text-gray-500 dark:text-gray-400">Loading map data...</div>
        </div>
      ) : (
        <>
          <MapContainer 
            center={defaultPosition} 
            zoom={defaultZoom} 
            zoomControl={false}
            className="w-full h-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <ZoomControl position="bottomright" />
            
            {/* Render all buses */}
            {buses.map(bus => (
              <BusMarker 
                key={bus.id} 
                bus={bus} 
                onClick={handleBusClick}
              />
            ))}
            
            {/* Render alternate routes for alerts */}
            {alerts.map(alert => (
              <RouteDisplay key={alert.id} alert={alert} />
            ))}
          </MapContainer>
          
          <div className="absolute top-4 right-4 z-[1000] glass-panel p-3 max-w-xs">
            <div className="flex items-start space-x-2">
              <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-sm">Map Legend</h3>
                <ul className="mt-2 text-xs space-y-2">
                  <li className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-bus-normal"></div>
                    <span>Normal Bus</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-bus-alert animate-pulse"></div>
                    <span>Clustered Bus (Needs Rerouting)</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-bus-alternate"></div>
                    <span>Rerouted Bus</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-3 h-0.5 bg-bus-alternate" style={{ borderStyle: 'dashed' }}></div>
                    <span>Alternate Route</span>
                  </li>
                </ul>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Click on a clustered bus to reroute it.
                </p>
              </div>
            </div>
          </div>
          
          <div className="absolute bottom-4 left-4 z-[1000]">
            <Button variant="outline" className="glass-panel glass-panel-hover bg-white/90 dark:bg-gray-900/90">
              <RefreshCw className="h-4 w-4 mr-2" />
              <span>Refresh Map</span>
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default MapView;

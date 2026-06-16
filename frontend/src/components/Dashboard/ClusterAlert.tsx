
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Info, Map } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ClusterAlert as ClusterAlertType, Bus } from '@/hooks/useBusData';
import BusAnalysis from '@/components/Analysis/BusAnalysis';

interface ClusterAlertProps {
  alert: ClusterAlertType;
  buses: Bus[];
  onViewOnMap: (alertId: string) => void;
  onClearAlert: (alertId: string) => void;
  onGoToAlternateStop: (busId: string) => void; // Renamed from onRerouteBus
  isAdmin?: boolean;
}

const ClusterAlert = ({ 
  alert, 
  buses,
  onViewOnMap, 
  onClearAlert, 
  onGoToAlternateStop, // Renamed from onRerouteBus
  isAdmin = false 
}: ClusterAlertProps) => {
  const severityColors = {
    low: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200',
    medium: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200',
    high: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
  };

  // Get bus details for the affected buses
  const affectedBuses = buses.filter(bus => alert.busIds.includes(bus.id));
  
  // Get bus details string, ensuring we only show buses in the same direction
  const busDirection = affectedBuses.length > 0 ? affectedBuses[0].direction : null;
  const sameDirBuses = affectedBuses.filter(bus => bus.direction === busDirection);
  const busDetails = sameDirBuses.map(bus => `${bus.id} (${bus.route})`).join(', ');

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-subtle overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          <h3 className="font-medium">Cluster Alert #{alert.id.split('-')[1]}</h3>
        </div>
        <Badge className={severityColors[alert.severity]}>
          {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)} Severity
        </Badge>
      </div>
      
      <div className="p-4 space-y-4">
        <div className="flex items-start space-x-3">
          <Info className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
          <div>
            <div className="font-medium">Alert Details</div>
            <div className="mt-1 text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <div>
                Location: {alert.location[0].toFixed(4)}, {alert.location[1].toFixed(4)}
              </div>
              <div>
                Detected: {formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}
              </div>
              <div>
                <span className="font-medium">Buses affected:</span> {sameDirBuses.length} ({busDetails})
              </div>
              <div>
                <span className="font-medium">Direction:</span> {busDirection ? <span className="capitalize">{busDirection}</span> : 'N/A'}
              </div>
            </div>
          </div>
        </div>
        
        {alert.alternateRoute && (
          <div className="flex items-start space-x-3">
            <Map className="h-5 w-5 text-teal-500 mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-medium">Alternate Stop Suggestion</div>
              <div className="mt-1 text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <div>
                  From: {alert.alternateRoute.fromStop}
                </div>
                <div>
                  To: {alert.alternateRoute.toStop}
                </div>
                <div className="text-teal-600 dark:text-teal-400 font-medium">
                  Route calculated via {alert.alternateRoute.points.length} optimal waypoints
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex space-x-2 pt-2">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => onViewOnMap(alert.id)}
          >
            <Map className="h-4 w-4 mr-2" />
            View on Map
          </Button>
          
          {isAdmin && (
            <>
              {/* Update BusAnalysis component props */}
              <BusAnalysis 
                alert={alert}
                buses={buses}
                onGoToAlternateStop={onGoToAlternateStop}
              />
              
              <Button 
                variant="outline" 
                className="flex-1 text-green-600 border-green-200 hover:bg-green-50 dark:text-green-400 dark:border-green-800 dark:hover:bg-green-900/20"
                onClick={() => onClearAlert(alert.id)}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Resolve
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClusterAlert;

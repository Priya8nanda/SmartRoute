
import { useState } from 'react';
import { Bus, ClusterAlert } from '@/hooks/useBusData';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AlertTriangle, ArrowRight, TrendingUp, Timer, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

interface BusAnalysisProps {
  alert: ClusterAlert;
  buses: Bus[];
  onGoToAlternateStop: (busId: string) => void; // Renamed from onRerouteBus
}

const BusAnalysis = ({ alert, buses, onGoToAlternateStop }: BusAnalysisProps) => {
  const [selectedBusId, setSelectedBusId] = useState<string | null>(null);
  
  // Filter buses that are clustered in this alert
  const clusteredBuses = buses.filter(bus => alert.busIds.includes(bus.id));
  
  // Get the direction of the clustered buses - they should all be in the same direction
  const clusterDirection = clusteredBuses.length > 0 ? clusteredBuses[0].direction : null;
  
  // Filter potential alternative buses by direction
  const potentialAlternateBuses = buses.filter(bus => 
    !alert.busIds.includes(bus.id) && 
    bus.status !== 'alert' &&
    bus.occupancy < (bus.capacity * 0.8) && // Only buses with less than 80% capacity
    bus.direction === clusterDirection // Must be in the same direction
  );
  
  // Calculate metrics for each potential solution
  const solutions = potentialAlternateBuses.map(bus => {
    // Calculate estimated time to reach destination based on distance and speed
    const distance = calculateDistance(
      bus.position[0], 
      bus.position[1], 
      alert.location[0], 
      alert.location[1]
    );
    
    const estimatedMinutes = bus.speed > 0 ? Math.round((distance / bus.speed) * 60) : 0;
    
    // Available capacity
    const availableCapacity = bus.capacity - bus.occupancy;
    
    // Score based on time, capacity and current status
    const timeScore = estimatedMinutes === 0 ? 0 : 100 / estimatedMinutes;
    const capacityScore = (availableCapacity / bus.capacity) * 100;
    const statusScore = bus.status === 'normal' ? 100 : 50;
    
    const totalScore = (timeScore * 0.5) + (capacityScore * 0.3) + (statusScore * 0.2);
    
    return {
      bus,
      estimatedMinutes,
      availableCapacity,
      distance,
      score: totalScore
    };
  }).sort((a, b) => b.score - a.score); // Sort by score (highest first)

  // Function to calculate distance between coordinates (in km)
  function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const distance = R * c; // Distance in km
    return distance;
  }

  function deg2rad(deg: number) {
    return deg * (Math.PI/180);
  }

  // Handle sending bus to alternate stop
  const handleGoToAlternateStop = () => {
    if (selectedBusId) {
      onGoToAlternateStop(selectedBusId);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="flex-1 text-amber-600 border-amber-200 hover:bg-amber-50 dark:text-amber-400 dark:border-amber-800 dark:hover:bg-amber-900/20"
        >
          <TrendingUp className="h-4 w-4 mr-2" />
          Analyze Solutions
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Cluster Analysis - Alert #{alert.id.split('-')[1]}</DialogTitle>
          <DialogDescription>
            Analysis of possible alternative stops for the clustered buses
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Current situation */}
          <div className="rounded-lg border p-3 bg-red-50 dark:bg-red-900/20">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <h3 className="font-medium">Current Situation</h3>
                <p className="text-sm">
                  {clusteredBuses.length} {clusterDirection} buses are clustered at location approximately 
                  {' '}{alert.location[0].toFixed(4)}, {alert.location[1].toFixed(4)}.
                </p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {clusteredBuses.map(bus => (
                    <Badge key={bus.id} variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200">
                      {bus.id} ({bus.occupancy} passengers)
                    </Badge>
                  ))}
                </div>
                <p className="text-sm mt-1">
                  Issue detected {formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}
                </p>
              </div>
            </div>
          </div>
          
          {/* Available solutions */}
          <div className="space-y-3">
            <h3 className="font-medium">Possible Alternative Stops</h3>
            
            {solutions.length > 0 ? (
              <div className="space-y-2">
                {solutions.map(({ bus, estimatedMinutes, availableCapacity, distance, score }) => (
                  <div 
                    key={bus.id}
                    className={`rounded-lg border p-3 transition-colors cursor-pointer ${
                      selectedBusId === bus.id 
                        ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-800' 
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                    onClick={() => setSelectedBusId(bus.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <span className="font-medium">{Math.round(score)}</span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="font-medium">{bus.id} - {bus.route}</div>
                          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex items-center">
                              <Timer className="h-3.5 w-3.5 mr-1" />
                              <span>{estimatedMinutes} min</span>
                            </div>
                            <div className="flex items-center">
                              <Users className="h-3.5 w-3.5 mr-1" />
                              <span>{availableCapacity} seats</span>
                            </div>
                            <div>
                              {distance.toFixed(1)} km away
                            </div>
                          </div>
                        </div>
                      </div>
                      <ArrowRight className={`h-5 w-5 ${
                        selectedBusId === bus.id 
                          ? 'text-blue-500' 
                          : 'text-gray-300 dark:text-gray-600'
                      }`} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border p-4 text-center">
                <p className="text-gray-500 dark:text-gray-400">
                  No suitable alternative buses available in the same direction
                </p>
              </div>
            )}
          </div>
          
          {/* Action buttons */}
          <div className="flex justify-end space-x-3 pt-2">
            <Button variant="outline" type="button">
              Cancel
            </Button>
            <Button 
              type="button" 
              disabled={!selectedBusId}
              onClick={handleGoToAlternateStop}
            >
              Send to Alternate Stop
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BusAnalysis;

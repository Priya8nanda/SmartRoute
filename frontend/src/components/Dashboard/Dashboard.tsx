
import { useBusData } from '@/hooks/useBusData';
import BusList from './BusList';
import ClusterAlert from './ClusterAlert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Bus, 
  AlertTriangle, 
  Clock, 
  Users, 
  BarChart,
  TrendingUp,
  TrendingDown,
  CheckCircle
} from 'lucide-react';

interface DashboardProps {
  onSelectBus: (busId: string) => void;
  onViewAlertOnMap: (alertId: string) => void;
  isAdmin?: boolean;
}

const Dashboard = ({ onSelectBus, onViewAlertOnMap, isAdmin = false }: DashboardProps) => {
  const { buses, alerts, loading, rerouteBus, clearAlert } = useBusData();
  
  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="text-lg font-medium text-gray-500 dark:text-gray-400 animate-pulse">
          Loading dashboard data...
        </div>
      </div>
    );
  }

  // Calculate statistics
  const activeAlerts = alerts.length;
  const activeBuses = buses.length;
  const busesWithAlerts = buses.filter(bus => bus.status === 'alert').length;
  const reroutedBuses = buses.filter(bus => bus.status === 'alternate').length;
  
  // Calculate average occupancy
  const totalCapacity = buses.reduce((acc, bus) => acc + bus.capacity, 0);
  const totalOccupancy = buses.reduce((acc, bus) => acc + bus.occupancy, 0);
  const averageOccupancy = totalCapacity > 0 
    ? Math.round((totalOccupancy / totalCapacity) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total buses */}
        <Card className="animate-scale-in">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Active Buses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
                <Bus className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-2xl font-bold">{activeBuses}</div>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {reroutedBuses > 0 ? (
                <div className="flex items-center text-teal-600 dark:text-teal-400">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {reroutedBuses} buses rerouted
                </div>
              ) : (
                <div className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  All buses on schedule
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Active alerts */}
        <Card className="animate-scale-in [animation-delay:100ms]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Active Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/30">
                <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
              </div>
              <div className="text-2xl font-bold">{activeAlerts}</div>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {busesWithAlerts > 0 ? (
                <div className="flex items-center text-red-600 dark:text-red-400">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {busesWithAlerts} buses need attention
                </div>
              ) : (
                <div className="flex items-center text-green-600 dark:text-green-400">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  No clustering detected
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Occupancy */}
        <Card className="animate-scale-in [animation-delay:200ms]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Average Occupancy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30">
                <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div className="text-2xl font-bold">{averageOccupancy}%</div>
            </div>
            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-2">
              <div 
                className={`h-2 rounded-full ${
                  averageOccupancy > 80 
                    ? 'bg-red-500' 
                    : averageOccupancy > 50 
                      ? 'bg-yellow-500' 
                      : 'bg-green-500'
                }`}
                style={{ width: `${averageOccupancy}%` }}
              />
            </div>
          </CardContent>
        </Card>
        
        {/* System status */}
        <Card className="animate-scale-in [animation-delay:300ms]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/30">
                <BarChart className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="text-xl font-bold">
                {activeAlerts > 0 ? 'Needs Attention' : 'Optimal'}
              </div>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Last updated: just now
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <BusList 
            buses={buses}
            onSelectBus={onSelectBus}
            onRerouteBus={rerouteBus}
            isAdmin={isAdmin}
          />
        </div>
        
        <div className="space-y-4">
          <h2 className="text-lg font-medium">Active Alerts</h2>
          
          {alerts.length > 0 ? (
            alerts.map(alert => (
              <ClusterAlert 
                key={alert.id}
                alert={alert}
                onViewOnMap={() => onViewAlertOnMap(alert.id)}
                onClearAlert={clearAlert}
                isAdmin={isAdmin}
              />
            ))
          ) : (
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-subtle p-6 flex flex-col items-center justify-center text-center">
              <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30 mb-3">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-medium text-lg">No Active Alerts</h3>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                The system is currently running optimally with no clustering detected.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

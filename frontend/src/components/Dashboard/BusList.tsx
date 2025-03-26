
import { useState } from 'react';
import { Bus } from '@/hooks/useBusData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Bus as BusIcon, 
  AlertTriangle, 
  CornerUpRight,
  Search, 
  ArrowUpDown
} from 'lucide-react';

interface BusListProps {
  buses: Bus[];
  onSelectBus: (busId: string) => void;
  onRerouteBus: (busId: string) => void;
  isAdmin?: boolean;
}

const BusList = ({ buses, onSelectBus, onRerouteBus, isAdmin = false }: BusListProps) => {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'id' | 'route' | 'status'>('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Filter buses by search
  const filteredBuses = buses.filter(bus => 
    bus.id.toLowerCase().includes(search.toLowerCase()) ||
    bus.route.toLowerCase().includes(search.toLowerCase())
  );

  // Sort buses
  const sortedBuses = [...filteredBuses].sort((a, b) => {
    let comparison = 0;
    
    if (sortBy === 'id') {
      comparison = a.id.localeCompare(b.id);
    } else if (sortBy === 'route') {
      comparison = a.route.localeCompare(b.route);
    } else if (sortBy === 'status') {
      // Sort by status priority
      const statusOrder = { alert: 0, alternate: 1, normal: 2 };
      comparison = statusOrder[a.status] - statusOrder[b.status];
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // Toggle sort
  const toggleSort = (column: 'id' | 'route' | 'status') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-subtle overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <h2 className="text-lg font-medium">Bus Fleet</h2>
        <div className="mt-2 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input 
            placeholder="Search buses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800 text-left">
              <th 
                className="px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400 cursor-pointer"
                onClick={() => toggleSort('id')}
              >
                <div className="flex items-center space-x-1">
                  <span>Bus ID</span>
                  {sortBy === 'id' && (
                    <ArrowUpDown className="h-3 w-3" />
                  )}
                </div>
              </th>
              <th 
                className="px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400 cursor-pointer"
                onClick={() => toggleSort('route')}
              >
                <div className="flex items-center space-x-1">
                  <span>Route</span>
                  {sortBy === 'route' && (
                    <ArrowUpDown className="h-3 w-3" />
                  )}
                </div>
              </th>
              <th 
                className="px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400 cursor-pointer"
                onClick={() => toggleSort('status')}
              >
                <div className="flex items-center space-x-1">
                  <span>Status</span>
                  {sortBy === 'status' && (
                    <ArrowUpDown className="h-3 w-3" />
                  )}
                </div>
              </th>
              <th className="px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                Speed
              </th>
              <th className="px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                Occupancy
              </th>
              <th className="px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {sortedBuses.map(bus => (
              <tr 
                key={bus.id} 
                className={`hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                  bus.status === 'alert' ? 'bg-red-50 dark:bg-red-900/20' : ''
                }`}
              >
                <td className="px-4 py-3 text-sm">
                  <div className="flex items-center space-x-2">
                    <BusIcon className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">{bus.id}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm">{bus.route}</td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex items-center space-x-1">
                    {bus.status === 'alert' ? (
                      <>
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        <span className="text-red-600 dark:text-red-400">Clustered</span>
                      </>
                    ) : bus.status === 'alternate' ? (
                      <>
                        <CornerUpRight className="h-4 w-4 text-teal-500" />
                        <span className="text-teal-600 dark:text-teal-400">Rerouted</span>
                      </>
                    ) : (
                      <span className="text-green-600 dark:text-green-400">Normal</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm">
                  {bus.speed} km/h
                </td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          bus.occupancy / bus.capacity > 0.8 
                            ? 'bg-red-500' 
                            : bus.occupancy / bus.capacity > 0.5 
                              ? 'bg-yellow-500' 
                              : 'bg-green-500'
                        }`}
                        style={{ width: `${(bus.occupancy / bus.capacity) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">
                      {Math.round((bus.occupancy / bus.capacity) * 100)}%
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => onSelectBus(bus.id)}
                    >
                      View
                    </Button>
                    
                    {isAdmin && bus.status === 'alert' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-teal-600 border-teal-200 hover:bg-teal-50 dark:text-teal-400 dark:border-teal-800 dark:hover:bg-teal-900/20"
                        onClick={() => onRerouteBus(bus.id)}
                      >
                        Reroute
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="p-4 border-t border-gray-200 dark:border-gray-800 text-sm text-gray-500 dark:text-gray-400">
        Showing {filteredBuses.length} of {buses.length} buses
      </div>
    </div>
  );
};

export default BusList;

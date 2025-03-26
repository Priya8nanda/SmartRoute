
import { useState, useEffect } from 'react';

export interface Bus {
  id: string;
  position: [number, number];
  route: string;
  status: 'normal' | 'alert' | 'alternate';
  speed: number;
  heading: number;
  lastUpdated: string;
  capacity: number;
  occupancy: number;
}

export interface ClusterAlert {
  id: string;
  busIds: string[];
  location: [number, number];
  severity: 'low' | 'medium' | 'high';
  timestamp: string;
  alternateRoute?: {
    fromStop: string;
    toStop: string;
    points: [number, number][];
  };
}

// Simulated bus data - in a real app this would come from an API or Firebase
const generateInitialBusData = (): Bus[] => {
  return [
    {
      id: 'BUS-1001',
      position: [40.7128, -74.006],
      route: 'Route 42',
      status: 'normal',
      speed: 25,
      heading: 90,
      lastUpdated: new Date().toISOString(),
      capacity: 50,
      occupancy: 28
    },
    {
      id: 'BUS-1002',
      position: [40.7138, -74.008],
      route: 'Route 42',
      status: 'normal',
      speed: 18,
      heading: 180,
      lastUpdated: new Date().toISOString(),
      capacity: 50,
      occupancy: 35
    },
    {
      id: 'BUS-1003',
      position: [40.7148, -74.003],
      route: 'Route 36',
      status: 'alert',
      speed: 0,
      heading: 270,
      lastUpdated: new Date().toISOString(),
      capacity: 50,
      occupancy: 42
    },
    {
      id: 'BUS-1004',
      position: [40.7118, -74.001],
      route: 'Route 36',
      status: 'alternate',
      speed: 22,
      heading: 45,
      lastUpdated: new Date().toISOString(),
      capacity: 50,
      occupancy: 15
    },
    {
      id: 'BUS-1005',
      position: [40.7108, -74.009],
      route: 'Route 15',
      status: 'normal',
      speed: 30,
      heading: 135,
      lastUpdated: new Date().toISOString(),
      capacity: 50,
      occupancy: 22
    }
  ];
};

// Simulated cluster alerts
const generateInitialAlertData = (): ClusterAlert[] => {
  return [
    {
      id: 'ALERT-001',
      busIds: ['BUS-1003', 'BUS-1002'],
      location: [40.7143, -74.005],
      severity: 'medium',
      timestamp: new Date().toISOString(),
      alternateRoute: {
        fromStop: 'Union Square',
        toStop: 'Washington Square',
        points: [
          [40.7143, -74.005],
          [40.7150, -74.0],
          [40.7160, -73.995]
        ]
      }
    }
  ];
};

// Simulate real-time movement
const updateBusPosition = (bus: Bus): Bus => {
  const latChange = (Math.random() - 0.5) * 0.0005;
  const lngChange = (Math.random() - 0.5) * 0.0005;
  
  return {
    ...bus,
    position: [
      bus.position[0] + latChange,
      bus.position[1] + lngChange
    ],
    speed: bus.status === 'alert' ? 0 : Math.floor(Math.random() * 15) + 15,
    lastUpdated: new Date().toISOString()
  };
};

export const useBusData = () => {
  const [buses, setBuses] = useState<Bus[]>(generateInitialBusData());
  const [alerts, setAlerts] = useState<ClusterAlert[]>(generateInitialAlertData());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Simulate real-time updates
  useEffect(() => {
    setLoading(true);
    
    // Initial data load
    setTimeout(() => {
      setBuses(generateInitialBusData());
      setAlerts(generateInitialAlertData());
      setLoading(false);
    }, 1000);
    
    // Update bus positions every 2 seconds
    const interval = setInterval(() => {
      setBuses(prevBuses => prevBuses.map(updateBusPosition));
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);

  // Simulate rerouting a bus
  const rerouteBus = (busId: string) => {
    setBuses(prevBuses => 
      prevBuses.map(bus => 
        bus.id === busId 
          ? { ...bus, status: 'alternate' } 
          : bus
      )
    );
  };

  // Simulate clearing an alert
  const clearAlert = (alertId: string) => {
    setAlerts(prevAlerts => prevAlerts.filter(alert => alert.id !== alertId));
    
    // Also update the buses involved in this alert
    const alertToRemove = alerts.find(alert => alert.id === alertId);
    if (alertToRemove) {
      setBuses(prevBuses => 
        prevBuses.map(bus => 
          alertToRemove.busIds.includes(bus.id) 
            ? { ...bus, status: 'normal' } 
            : bus
        )
      );
    }
  };

  return {
    buses,
    alerts,
    loading,
    error,
    rerouteBus,
    clearAlert
  };
};

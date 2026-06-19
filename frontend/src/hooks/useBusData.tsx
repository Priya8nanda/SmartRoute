
import { useState, useEffect } from 'react';

export interface Bus {
  id: string;
  position: [number, number];
  route: string;
  status: 'normal' | 'alert' | 'alternate';
  speed: number;
  heading: number;
  direction: 'inbound' | 'outbound'; // Add direction property
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
      direction: 'inbound',
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
      direction: 'inbound',
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
      direction: 'inbound',
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
      direction: 'outbound',
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
      direction: 'outbound',
      lastUpdated: new Date().toISOString(),
      capacity: 50,
      occupancy: 22
    }
  ];
};

// Simulated cluster alerts - now only clustering buses in the same direction
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

//step2
const detectClusters = async (buses: Bus[]) => {

  const response = await fetch(
    "https://smartroute-adxr.onrender.com/detect-clusters",
    {
      method:"POST",
      headers:{
        "Content-Type":"application/json"
      },
      body:JSON.stringify({

        bus_points:buses.map(bus => ({
          bus_id: bus.id,
          speed: bus.speed,
          people_count: bus.occupancy,
          latitude: bus.position[0],
          longitude: bus.position[1],
          timestamp: bus.lastUpdated
        }))

      })
    }
  );

  if(!response.ok){
    throw new Error("Backend error");
  }

  return await response.json();
};

//step4
const createAlertsFromClusters = (
 result:any,
 buses:Bus[]
):ClusterAlert[] => {

 return result.clusters.map(
 (cluster:string[],index:number)=>{

   const bus = buses.find(
    b=>cluster.includes(b.id)
   );

   return {
    id:`ALERT-${index+1}`,

    busIds:cluster,

    location:bus 
      ? bus.position
      : [0,0],

    severity:
      result.overall_risk_level.toLowerCase(),

    timestamp:new Date().toISOString()
   };

 });

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
  //step3
  const [alerts,setAlerts] = useState<ClusterAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Simulate real-time updates
  useEffect(() => {
    setLoading(true);
    
    // Initial data load
    setTimeout(() => {
      //step5
      const initialBuses = generateInitialBusData();

setBuses(initialBuses);


detectClusters(initialBuses)
.then(result=>{

 const newAlerts =
 createAlertsFromClusters(result,initialBuses);

 setAlerts(newAlerts);

})
.catch(error=>{
 console.log(error);
});
      setLoading(false);
    }, 1000);
    
    // Update bus positions every 2 seconds
    //step6
    //againstep1
  }, []);
  //againstep2
  useEffect(() => {
  const interval = setInterval(() => {

    setBuses(prevBuses => {
      const updated = prevBuses.map(updateBusPosition);

      detectClusters(updated)
        .then(result => {

          console.log("FULL BACKEND RESPONSE",result);
          console.log("CLUSTERS ONLY");
          console.log(result.clusters);

          const newAlerts = createAlertsFromClusters(result, updated);

          //change 2
          console.log("NEW ALERTS SENT TO UI");
console.log(JSON.stringify(newAlerts, null, 2));

          setAlerts(newAlerts);

        })
        .catch(console.log);

      return updated;
    });

  }, 5000);

  return () => clearInterval(interval);
}, []);

  // Simulate sending a bus to alternate stop
  const goToAlternateStop = (busId: string) => {
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
    goToAlternateStop, // Renamed from rerouteBus
    clearAlert
  };
};

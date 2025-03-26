
import { useState, useRef, useEffect } from 'react';
import Header from '@/components/Layout/Header';
import Dashboard from '@/components/Dashboard/Dashboard';
import MapView from '@/components/Map/MapView';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

interface IndexProps {
  onLogout: () => void;
  isAdmin?: boolean;
}

const Index = ({ onLogout, isAdmin = false }: IndexProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const mainRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  // Handle bus selection
  const handleSelectBus = (busId: string) => {
    setActiveTab('map');
    toast({
      title: "Bus Selected",
      description: `Viewing details for bus ${busId}`,
      duration: 3000,
    });
  };
  
  // Handle alert view on map
  const handleViewAlertOnMap = (alertId: string) => {
    setActiveTab('map');
    toast({
      title: "Alert Selected",
      description: `Viewing alert ${alertId} on map`,
      duration: 3000,
    });
  };
  
  // Scroll to top when changing tabs
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTo(0, 0);
    }
  }, [activeTab]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} onLogout={onLogout} />
      
      <div className="flex flex-1 overflow-hidden">
        <main 
          ref={mainRef}
          className="flex-1 transition-all duration-300 overflow-y-auto"
        >
          <div className="container mx-auto px-4 py-6 max-w-7xl">
            <Tabs 
              defaultValue="dashboard" 
              value={activeTab} 
              onValueChange={setActiveTab}
              className="space-y-4"
            >
              <TabsList className="w-full max-w-md mx-auto grid grid-cols-2">
                <TabsTrigger value="dashboard" className="rounded-lg">
                  Dashboard
                </TabsTrigger>
                <TabsTrigger value="map" className="rounded-lg">
                  Live Map
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="dashboard" className="animate-in">
                <Dashboard 
                  onSelectBus={handleSelectBus}
                  onViewAlertOnMap={handleViewAlertOnMap}
                  isAdmin={isAdmin}
                />
              </TabsContent>
              
              <TabsContent value="map" className="h-[calc(100vh-14rem)] animate-in">
                <MapView />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;

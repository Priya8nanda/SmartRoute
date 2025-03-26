
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronLeft, ChevronRight, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

interface NavItem {
  label: string;
  href: string;
  badge?: number;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/" },
  { label: "Live Map", href: "/map" },
  { label: "Buses", href: "/buses" },
  { label: "Alerts", href: "/alerts", badge: 2 },
  { label: "Settings", href: "/settings" },
];

const Sidebar = ({ isOpen, setIsOpen }: SidebarProps) => {
  const location = useLocation();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) return null;

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 md:hidden ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsOpen(false)}
      />
      
      <aside 
        className={`fixed top-0 left-0 z-40 h-full bg-white dark:bg-gray-900 shadow-lg flex flex-col transition-all duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } ${
          isOpen ? "w-64" : "md:w-20"
        }`}
      >
        <div className="p-4 flex items-center justify-between h-16 border-b border-gray-200 dark:border-gray-800">
          <div className={`flex items-center space-x-2 ${!isOpen && "md:hidden"}`}>
            <span className="font-medium">Menu</span>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(!isOpen)}
            className="hidden md:flex"
          >
            {isOpen ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="md:hidden"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </div>
        
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center space-x-2 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                } ${!isOpen && "md:justify-center"}`}
              >
                {(isOpen || window.innerWidth < 768) && (
                  <>
                    <span className="font-medium">{item.label}</span>
                    
                    {item.badge && (
                      <Badge variant="destructive" className="ml-auto">
                        {item.badge}
                      </Badge>
                    )}
                  </>
                )}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-3 mt-auto border-t border-gray-200 dark:border-gray-800">
          <div className={`rounded-lg bg-gray-50 dark:bg-gray-800 p-2.5 mb-3 ${!isOpen && "md:hidden"}`}>
            <div className="flex items-center space-x-2">
              <Info className="h-5 w-5 text-blue-500" />
              <div className="text-sm">
                <p>System is running normally</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Last updated: 2 min ago</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

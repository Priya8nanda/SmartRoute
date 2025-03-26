
import { useState } from 'react';
import Header from '@/components/Layout/Header';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

interface ProfileProps {
  onLogout: () => void;
}

const Profile = ({ onLogout }: ProfileProps) => {
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState('John Doe');
  const [email, setEmail] = useState('john.doe@example.com');
  const [isAdmin, setIsAdmin] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const { toast } = useToast();

  const handleSave = () => {
    setEditMode(false);
    toast({
      title: "Profile Updated",
      description: "Your profile has been successfully updated.",
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header toggleSidebar={() => {}} sidebarOpen={false} onLogout={onLogout} />
      
      <main className="flex-1 overflow-hidden">
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          <h1 className="text-2xl font-bold mb-6">Your Profile</h1>
          
          <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <Avatar className="h-16 w-16 border-2 border-primary/10">
                <AvatarImage src="/placeholder.svg" alt="Profile" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-xl">{name}</CardTitle>
                <CardDescription>{email}</CardDescription>
                <div className="flex gap-2 mt-1">
                  {isAdmin && (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50 border-blue-200">
                      Administrator
                    </Badge>
                  )}
                  <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50 border-green-200">
                    Active
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  {editMode ? (
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                  ) : (
                    <div className="px-3 py-2 border rounded-md bg-gray-50">{name}</div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  {editMode ? (
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                  ) : (
                    <div className="px-3 py-2 border rounded-md bg-gray-50">{email}</div>
                  )}
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="role">Role</Label>
                  <div className="flex items-center justify-between px-3 py-2 border rounded-md bg-gray-50">
                    <span>{isAdmin ? 'Administrator' : 'Standard User'}</span>
                    {editMode && (
                      <Switch checked={isAdmin} onCheckedChange={setIsAdmin} />
                    )}
                  </div>
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="notifications">Notifications</Label>
                  <div className="flex items-center justify-between px-3 py-2 border rounded-md bg-gray-50">
                    <span>Receive system alerts</span>
                    <Switch 
                      checked={notifications} 
                      onCheckedChange={setNotifications} 
                      disabled={!editMode}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-between border-t pt-6">
              {editMode ? (
                <>
                  <Button variant="outline" onClick={() => setEditMode(false)}>Cancel</Button>
                  <Button onClick={handleSave}>Save Changes</Button>
                </>
              ) : (
                <>
                  <Button variant="outline" onClick={onLogout}>Sign Out</Button>
                  <Button onClick={() => setEditMode(true)}>Edit Profile</Button>
                </>
              )}
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Profile;

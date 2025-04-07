
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ChevronLeft, Eye, Bell, BellOff } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface MonitoringHeaderProps {
  alertMode: boolean;
  setAlertMode: (value: boolean) => void;
  stopMonitoring: () => void;
}

const MonitoringHeader: React.FC<MonitoringHeaderProps> = ({ 
  alertMode, 
  setAlertMode, 
  stopMonitoring 
}) => {
  
  const toggleAlertMode = () => {
    setAlertMode(!alertMode);
    toast({
      title: alertMode ? "Alerts Disabled" : "Alerts Enabled",
      description: alertMode 
        ? "You will no longer receive notifications for detections" 
        : "You will now receive notifications for weapon detections",
    });
  };

  return (
    <header className="bg-security-dark text-white py-4 px-4 md:px-6">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          <h1 className="text-xl font-bold">Alert Eye Watch</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch
              id="alert-mode"
              checked={alertMode}
              onCheckedChange={toggleAlertMode}
            />
            <Label htmlFor="alert-mode" className="text-white text-sm cursor-pointer">
              {alertMode ? (
                <span className="flex items-center gap-1">
                  <Bell className="h-3.5 w-3.5" />
                  Alerts On
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <BellOff className="h-3.5 w-3.5" />
                  Alerts Off
                </span>
              )}
            </Label>
          </div>
          
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={stopMonitoring}
            className="bg-white/10 hover:bg-white/20 text-white"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        </div>
      </div>
    </header>
  );
};

export default MonitoringHeader;


import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield } from 'lucide-react';
import { AlertSettings } from '@/types';

interface StatusCardProps {
  alertMode: boolean;
  settings: AlertSettings;
}

const StatusCard: React.FC<StatusCardProps> = ({ alertMode, settings }) => {
  return (
    <Card className="flex-1">
      <CardContent className="p-4">
        <h3 className="font-medium mb-1 flex items-center gap-1.5">
          <Shield className="h-4 w-4 text-security" />
          Monitor Status
        </h3>
        <div className="flex flex-col gap-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Alert Mode:</span>
            <Badge variant={alertMode ? "default" : "outline"}>
              {alertMode ? "Enabled" : "Disabled"}
            </Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Detection Sensitivity:</span>
            <span>{Math.round(settings.threshold * 100)}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Email Alerts:</span>
            <Badge variant={settings.enableEmailAlerts ? "default" : "outline"}>
              {settings.enableEmailAlerts ? "Enabled" : "Disabled"}
            </Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">SMS Alerts:</span>
            <Badge variant={settings.enableSmsAlerts ? "default" : "outline"}>
              {settings.enableSmsAlerts ? "Enabled" : "Disabled"}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatusCard;

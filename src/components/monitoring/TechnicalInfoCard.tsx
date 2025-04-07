
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const TechnicalInfoCard: React.FC = () => {
  return (
    <Card className="flex-1">
      <CardContent className="p-4">
        <h3 className="font-medium mb-1">Technical Information</h3>
        <div className="flex flex-col gap-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Detection Model:</span>
            <span>Weapon Detection v1.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Processing:</span>
            <span>Real-time</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Alert Latency:</span>
            <span>~1 second</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Status:</span>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              Operational
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TechnicalInfoCard;

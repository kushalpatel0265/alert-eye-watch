
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface TechnicalInfoCardProps {
  isModelLoaded: boolean;
  modelName?: string;
}

const TechnicalInfoCard: React.FC<TechnicalInfoCardProps> = ({ 
  isModelLoaded,
  modelName = "Weapon Detection Model"
}) => {
  return (
    <Card className="flex-1">
      <CardContent className="p-4">
        <h3 className="font-medium mb-1">Technical Information</h3>
        <div className="flex flex-col gap-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Detection Model:</span>
            <span>{modelName}</span>
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
            {isModelLoaded ? (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Operational
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                Awaiting Model
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TechnicalInfoCard;


import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface TechnicalInfoCardProps {
  isModelLoaded: boolean;
  isStreaming: boolean;
  modelName?: string;
}

const TechnicalInfoCard: React.FC<TechnicalInfoCardProps> = ({ 
  isModelLoaded,
  isStreaming,
  modelName = "Weapon Detection Model"
}) => {
  const getStatusBadge = () => {
    if (!isModelLoaded) {
      return (
        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
          Awaiting Model
        </Badge>
      );
    }
    
    if (!isStreaming) {
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          Stream Error
        </Badge>
      );
    }
    
    return (
      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
        Operational
      </Badge>
    );
  };

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
            <span>{isStreaming ? 'Real-time' : 'Inactive'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Alert Latency:</span>
            <span>~1 second</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Status:</span>
            {getStatusBadge()}
          </div>
          {!isStreaming && (
            <div className="mt-2 text-xs text-red-600">
              Camera stream is not active. Please check camera permissions.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TechnicalInfoCard;

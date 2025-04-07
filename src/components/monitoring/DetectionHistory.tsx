
import React from 'react';
import { formatDistance } from 'date-fns';
import { Detection } from '@/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield } from 'lucide-react';

interface DetectionHistoryProps {
  detections: Detection[];
}

const DetectionHistory: React.FC<DetectionHistoryProps> = ({ detections }) => {
  return (
    <Card className="h-full">
      <div className="p-4 border-b">
        <h2 className="font-medium">Detection History</h2>
      </div>
      
      <ScrollArea className="h-[calc(100vh-240px)]">
        {detections.length > 0 ? (
          <div className="p-4 space-y-4">
            {detections.map((detection, index) => (
              <div key={index} className="border rounded-lg overflow-hidden">
                {detection.imageData && (
                  <img 
                    src={detection.imageData} 
                    alt={`Detection ${index + 1}`}
                    className="w-full h-32 object-cover border-b"
                  />
                )}
                <div className="p-3">
                  <div className="flex justify-between items-center mb-1">
                    <Badge variant="outline" className="bg-alert/10 text-alert border-alert/30">
                      Weapon Detected
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDistance(detection.timestamp, new Date(), { addSuffix: true })}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground flex justify-between mt-1">
                    <span>Confidence:</span>
                    <span className="font-medium text-foreground">
                      {Math.round(detection.confidence * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <div className="bg-muted rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
              <Shield className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="font-medium text-sm mb-1">No Detections Yet</h3>
            <p className="text-xs text-muted-foreground">
              Detection events will appear here when weapons are identified
            </p>
          </div>
        )}
      </ScrollArea>
    </Card>
  );
};

export default DetectionHistory;

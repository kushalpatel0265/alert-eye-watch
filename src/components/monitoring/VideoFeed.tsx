
import React, { useRef, useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, AlertTriangle, Camera } from 'lucide-react';
import { Detection } from '@/types';
import { Button } from '@/components/ui/button';

interface VideoFeedProps {
  isLoading: boolean;
  isStreaming: boolean;
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  currentDetection: Detection | null;
  onRetryStream?: () => Promise<void>;
}

const VideoFeed: React.FC<VideoFeedProps> = ({
  isLoading,
  isStreaming,
  videoRef,
  canvasRef,
  currentDetection,
  onRetryStream
}) => {
  const [hasStreamError, setHasStreamError] = useState(false);

  // Reset stream error when isStreaming changes
  useEffect(() => {
    if (isStreaming) {
      setHasStreamError(false);
    }
  }, [isStreaming]);

  // Handler for video errors
  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    console.error("Video error:", e);
    setHasStreamError(true);
  };

  return (
    <Card className={`overflow-hidden ${currentDetection ? 'detection-alert border-alert' : ''}`}>
      <CardContent className="p-0 relative">
        {isLoading ? (
          <div className="video-container flex flex-col items-center justify-center min-h-[300px]">
            <Loader2 className="h-8 w-8 text-muted-foreground animate-spin mb-2" />
            <p className="text-muted-foreground">Starting camera...</p>
          </div>
        ) : !isStreaming || hasStreamError ? (
          <div className="video-container flex flex-col items-center justify-center min-h-[300px] bg-gray-900">
            <div className="text-white mb-4 flex flex-col items-center">
              <Camera className="h-12 w-12 text-red-500 mb-3" />
              <p className="font-medium text-red-400">Stream Stopped</p>
              <p className="text-sm text-gray-400 max-w-md text-center mt-2">
                The camera stream is not active. This could be due to camera permissions, 
                hardware issues, or the camera being in use by another application.
              </p>
            </div>
            
            {onRetryStream && (
              <Button 
                variant="default" 
                onClick={() => {
                  onRetryStream().catch(err => console.error("Retry failed:", err));
                }}
                className="mt-3"
              >
                <Camera className="mr-2 h-4 w-4" />
                Retry Camera Stream
              </Button>
            )}
          </div>
        ) : (
          <>
            <video 
              ref={videoRef} 
              className="w-full h-full object-cover video-container min-h-[300px]"
              playsInline
              muted
              onError={handleVideoError}
            />
            <canvas 
              ref={canvasRef}
              className="hidden" // Hidden canvas for image capture
            />
            
            {/* Status indicator */}
            <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/50 text-white px-3 py-1.5 rounded-full text-sm">
              <div className={`w-2 h-2 rounded-full ${isStreaming ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              {isStreaming ? 'Monitoring Active' : 'Stream Stopped'}
            </div>
            
            {/* Alert overlay when weapon detected */}
            {currentDetection && (
              <div className="absolute inset-0 bg-alert/20 flex items-center justify-center">
                <div className="bg-alert text-white px-4 py-3 rounded-lg flex items-center gap-2 shadow-lg">
                  <AlertTriangle className="h-5 w-5" />
                  <span className="font-bold">Weapon Detected!</span>
                  <span className="text-sm opacity-90">
                    {Math.round(currentDetection.confidence * 100)}% confidence
                  </span>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default VideoFeed;

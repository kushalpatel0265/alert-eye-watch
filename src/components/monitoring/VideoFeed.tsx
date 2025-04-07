
import React, { useRef, useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Detection } from '@/types';

interface VideoFeedProps {
  isLoading: boolean;
  isStreaming: boolean;
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  currentDetection: Detection | null;
}

const VideoFeed: React.FC<VideoFeedProps> = ({
  isLoading,
  isStreaming,
  videoRef,
  canvasRef,
  currentDetection
}) => {
  return (
    <Card className={`overflow-hidden ${currentDetection ? 'detection-alert border-alert' : ''}`}>
      <CardContent className="p-0 relative">
        {isLoading ? (
          <div className="video-container flex flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 text-muted-foreground animate-spin mb-2" />
            <p className="text-muted-foreground">Starting camera...</p>
          </div>
        ) : (
          <>
            <video 
              ref={videoRef} 
              className="w-full h-full object-cover video-container"
              playsInline
              muted
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

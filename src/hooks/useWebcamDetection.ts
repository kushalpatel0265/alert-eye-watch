
import { useState, useEffect, useRef } from 'react';
import { Detection } from '@/types';
import { detectWeapons, loadModel, getModelName } from '@/utils/weaponDetection';
import { toast } from '@/components/ui/use-toast';

interface UseWebcamDetectionProps {
  cameraId?: string;
  threshold: number;
  alertMode: boolean;
  onDetection: (detection: Detection) => void;
  sendAlert: (detection: Detection) => void;
}

const useWebcamDetection = ({
  cameraId,
  threshold,
  alertMode,
  onDetection,
  sendAlert
}: UseWebcamDetectionProps) => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDetection, setCurrentDetection] = useState<Detection | null>(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [modelName, setModelName] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const detectionIntervalRef = useRef<number | null>(null);

  const startStream = async () => {
    try {
      setIsLoading(true);
      
      // Clear any existing stream
      if (streamRef.current) {
        stopStream();
      }

      // If no camera ID is provided, use default camera
      const constraints = {
        video: cameraId ? { deviceId: { exact: cameraId } } : true,
        audio: false
      };
      
      console.log("Requesting camera with constraints:", constraints);
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Wait for video to be ready before playing
        videoRef.current.onloadedmetadata = async () => {
          if (videoRef.current) {
            try {
              await videoRef.current.play();
              setIsStreaming(true);
              console.log("Video stream started successfully");
            } catch (playError) {
              console.error("Error playing video:", playError);
              toast({
                title: "Video Playback Error",
                description: "Could not play the video stream. Please refresh and try again.",
                variant: "destructive",
              });
            }
          }
        };
      }
      
    } catch (error) {
      console.error("Error starting camera stream:", error);
      toast({
        title: "Camera Error",
        description: "Failed to start camera stream. Please check your camera permissions and try again.",
        variant: "destructive",
      });
      throw error; // Re-throw so the caller can handle navigation if needed
    } finally {
      setIsLoading(false);
    }
  };

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        console.log("Stopping track:", track.kind, track.label, "enabled:", track.enabled);
        track.stop();
      });
      streamRef.current = null;
    }
    
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
    
    setIsStreaming(false);
    
    // Also clear video element
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const startDetection = () => {
    // Check if the model is loaded
    if (!isModelLoaded) {
      toast({
        title: "Model Not Loaded",
        description: "Please upload and load your detection model first.",
        variant: "default",
      });
      return;
    }
    
    // Check if streaming is active
    if (!isStreaming) {
      toast({
        title: "Stream Not Active",
        description: "Camera stream is not active. Please check your camera settings.",
        variant: "destructive",
      });
      return;
    }
    
    // Run detection at regular intervals
    detectionIntervalRef.current = window.setInterval(async () => {
      if (!videoRef.current || !canvasRef.current || !isStreaming) return;
      
      try {
        // Capture frame from video
        const canvas = canvasRef.current;
        const video = videoRef.current;
        const context = canvas.getContext('2d');
        
        if (context) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          // Get image data for model inference
          const imageData = canvas.toDataURL('image/jpeg');
          
          // Run detection on the current frame
          const result = await detectWeapons(imageData);
          
          // Process detection results
          if (result.detected && result.confidence >= threshold) {
            const detection: Detection = {
              timestamp: new Date(),
              confidence: result.confidence,
              imageData,
              boundingBoxes: result.boundingBoxes
            };
            
            // Add to detections history via callback
            onDetection(detection);
            setCurrentDetection(detection);
            
            // Send alert if in alert mode
            if (alertMode) {
              sendAlert(detection);
            }
          } else {
            // Clear current detection if nothing is detected
            setCurrentDetection(null);
          }
        }
      } catch (error) {
        console.error("Error during weapon detection:", error);
      }
    }, 1000); // Check every 1 second
  };

  // Handle model loading
  const handleModelLoaded = (loaded: boolean) => {
    setIsModelLoaded(loaded);
    if (loaded) {
      setModelName(getModelName());
      // Start detection automatically when model is loaded
      if (isStreaming) {
        startDetection();
      } else {
        // Try to restart the stream if it's not active
        startStream().then(() => {
          startDetection();
        }).catch(error => {
          console.error("Failed to restart stream after model load:", error);
        });
      }
    }
  };

  // Clean up detection interval and streams on unmount
  useEffect(() => {
    return () => {
      stopStream();
    };
  }, []);

  return {
    isStreaming,
    isLoading,
    currentDetection,
    isModelLoaded,
    modelName,
    videoRef,
    canvasRef,
    startStream,
    stopStream,
    startDetection,
    handleModelLoaded
  };
};

export default useWebcamDetection;

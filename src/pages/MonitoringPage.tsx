
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/contexts/SettingsContext";
import { Detection } from "@/types";
import { toast } from "@/components/ui/use-toast";

// Import our components
import MonitoringHeader from "@/components/monitoring/MonitoringHeader";
import VideoFeed from "@/components/monitoring/VideoFeed";
import StatusCard from "@/components/monitoring/StatusCard";
import TechnicalInfoCard from "@/components/monitoring/TechnicalInfoCard";
import DetectionHistory from "@/components/monitoring/DetectionHistory";
import ModelUpload from "@/components/monitoring/ModelUpload";
import useWebcamDetection from "@/hooks/useWebcamDetection";
import { handleSendAlert } from "@/services/alertService";

const MonitoringPage = () => {
  const { cameraId } = useParams<{ cameraId: string }>();
  const [alertMode, setAlertMode] = useState(true);
  const [detections, setDetections] = useState<Detection[]>([]);
  
  const { user } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();

  // Handle adding a new detection
  const handleNewDetection = (detection: Detection) => {
    setDetections(prev => [detection, ...prev]);
  };
  
  // Handle sending alerts with proper context
  const sendDetectionAlert = async (detection: Detection) => {
    const email = settings.enableEmailAlerts ? settings.email || user?.email : undefined;
    const phone = settings.enableSmsAlerts ? settings.phone || user?.phone : undefined;
    await handleSendAlert(detection, email, phone);
  };
  
  // Use our custom hook for webcam detection
  const {
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
  } = useWebcamDetection({
    cameraId,
    threshold: settings.threshold,
    alertMode,
    onDetection: handleNewDetection,
    sendAlert: sendDetectionAlert
  });

  useEffect(() => {
    // Redirect if not logged in
    if (!user) {
      navigate("/login");
      return;
    }

    // Start the camera stream
    const initializeCamera = async () => {
      try {
        await startStream();
        // Note: We don't start detection automatically here anymore
        // We'll wait for the model to be loaded first
      } catch (error) {
        // Error handling is done in the hook, just navigate away
        navigate("/cameras");
      }
    };

    initializeCamera();
    
    // Cleanup on unmount
    return () => {
      stopStream();
    };
  }, [cameraId, navigate, user]);

  const stopMonitoring = () => {
    stopStream();
    navigate("/cameras");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <MonitoringHeader 
        alertMode={alertMode} 
        setAlertMode={setAlertMode} 
        stopMonitoring={stopMonitoring} 
      />

      <main className="flex-1 container mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            {/* Model upload section - visible above the video feed */}
            <ModelUpload onModelLoaded={handleModelLoaded} />
            
            {/* Video feed */}
            <VideoFeed 
              isLoading={isLoading}
              isStreaming={isStreaming}
              videoRef={videoRef}
              canvasRef={canvasRef}
              currentDetection={currentDetection}
            />
            
            {/* Controls and info */}
            <div className="mt-4 flex flex-col md:flex-row gap-4">
              <StatusCard alertMode={alertMode} settings={settings} />
              <TechnicalInfoCard isModelLoaded={isModelLoaded} modelName={modelName} />
            </div>
          </div>
          
          {/* Detection history */}
          <div className="lg:col-span-1">
            <DetectionHistory detections={detections} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default MonitoringPage;

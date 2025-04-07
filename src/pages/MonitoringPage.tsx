
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/contexts/SettingsContext";
import { Detection } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Shield, AlertTriangle, ChevronLeft, Eye, Bell, BellOff } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { formatDistance } from "date-fns";

// Simulate weapon detection (in a real app, this would be handled by your model)
const simulateDetection = (): { detected: boolean; confidence: number } => {
  const randomNumber = Math.random();
  // 5% chance of detection for demo purposes
  return { 
    detected: randomNumber < 0.05, 
    confidence: randomNumber < 0.05 ? 0.7 + (randomNumber * 0.3) : 0 
  };
};

// Mock function to send alert (in real app, would make API call to your .NET backend)
const sendAlert = async (detection: Detection, email?: string, phone?: string) => {
  console.log("Alert sent!", { detection, email, phone });
  // In a real implementation, this would make a fetch request to your backend API
  return new Promise(resolve => setTimeout(resolve, 1000));
};

const MonitoringPage = () => {
  const { cameraId } = useParams<{ cameraId: string }>();
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [alertMode, setAlertMode] = useState(true);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [currentDetection, setCurrentDetection] = useState<Detection | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const detectionIntervalRef = useRef<number | null>(null);

  const { user } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if not logged in
    if (!user) {
      navigate("/login");
      return;
    }

    // Start the camera stream
    const startStream = async () => {
      try {
        setIsLoading(true);
        
        if (!cameraId) {
          throw new Error("No camera selected");
        }

        const constraints = {
          video: { deviceId: { exact: cameraId } }
        };
        
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        streamRef.current = stream;
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          setIsStreaming(true);
        }
        
      } catch (error) {
        console.error("Error starting camera stream:", error);
        toast({
          title: "Camera Error",
          description: "Failed to start camera stream. Please try again or select a different camera.",
          variant: "destructive",
        });
        navigate("/cameras");
      } finally {
        setIsLoading(false);
      }
    };

    startStream();
    
    // Start detection process
    startDetection();

    // Cleanup on unmount
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
    };
  }, [cameraId, navigate, user]);

  const startDetection = () => {
    // In a real app, this would be running your ML model on frames from the video
    detectionIntervalRef.current = window.setInterval(() => {
      if (!videoRef.current || !canvasRef.current || !isStreaming) return;
      
      const { detected, confidence } = simulateDetection();
      
      if (detected && confidence >= settings.threshold) {
        // Capture frame
        const canvas = canvasRef.current;
        const video = videoRef.current;
        const context = canvas.getContext('2d');
        
        if (context) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          // In a real app, you might want to compress this or send it directly
          const imageData = canvas.toDataURL('image/jpeg');
          
          const detection: Detection = {
            timestamp: new Date(),
            confidence,
            imageData
          };
          
          // Add to detections history
          setDetections(prev => [detection, ...prev]);
          setCurrentDetection(detection);
          
          // Send alert if in alert mode
          if (alertMode) {
            handleSendAlert(detection);
          }
        }
      }
    }, 2000); // Check every 2 seconds
  };

  const handleSendAlert = async (detection: Detection) => {
    try {
      // Determine recipients based on settings
      const email = settings.enableEmailAlerts ? settings.email || user?.email : undefined;
      const phone = settings.enableSmsAlerts ? settings.phone || user?.phone : undefined;
      
      if (!email && !phone) {
        toast({
          title: "Alert Configuration Error",
          description: "No alert destinations configured. Please update your settings.",
          variant: "destructive",
        });
        return;
      }
      
      await sendAlert(detection, email, phone);
      
      toast({
        title: "⚠️ Weapon Detected!",
        description: `Alert sent to ${email ? 'email' : ''}${email && phone ? ' and ' : ''}${phone ? 'phone' : ''}`,
        variant: "destructive",
      });
    } catch (error) {
      console.error("Error sending alert:", error);
      toast({
        title: "Alert Error",
        description: "Failed to send alert notification",
        variant: "destructive",
      });
    }
  };

  const toggleAlertMode = () => {
    setAlertMode(prev => !prev);
    toast({
      title: alertMode ? "Alerts Disabled" : "Alerts Enabled",
      description: alertMode 
        ? "You will no longer receive notifications for detections" 
        : "You will now receive notifications for weapon detections",
    });
  };

  const stopMonitoring = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
    }
    setIsStreaming(false);
    navigate("/cameras");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
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

      <main className="flex-1 container mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
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
            
            {/* Controls and info */}
            <div className="mt-4 flex flex-col md:flex-row gap-4">
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
            </div>
          </div>
          
          {/* Detection history */}
          <div className="lg:col-span-1">
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
          </div>
        </div>
      </main>
    </div>
  );
};

export default MonitoringPage;


import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Camera } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera as CameraIcon, Loader2, ChevronLeft, Eye } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";

const CameraSelection = () => {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCamera, setSelectedCamera] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if not logged in
    if (!user) {
      navigate("/login");
      return;
    }

    // Get list of cameras
    const fetchCameras = async () => {
      try {
        setIsLoading(true);
        
        // Request camera permissions
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        
        // Get list of video devices
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === "videoinput");
        
        // Stop the stream we used to get permissions
        stream.getTracks().forEach(track => track.stop());
        
        if (videoDevices.length === 0) {
          toast({
            title: "No Cameras Found",
            description: "We couldn't detect any cameras connected to your device",
            variant: "destructive",
          });
          setCameras([]);
        } else {
          const cameraList: Camera[] = videoDevices.map(device => ({
            deviceId: device.deviceId,
            label: device.label || `Camera ${videoDevices.indexOf(device) + 1}`,
          }));
          
          setCameras(cameraList);
          
          // Preselect the first camera
          if (cameraList.length > 0) {
            setSelectedCamera(cameraList[0].deviceId);
          }
        }
      } catch (error) {
        console.error("Error accessing cameras:", error);
        toast({
          title: "Camera Access Error",
          description: "Failed to access your device cameras. Please check permissions.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCameras();
  }, [user, navigate]);

  const handleStartMonitoring = () => {
    if (selectedCamera) {
      navigate(`/monitor/${selectedCamera}`);
    } else {
      toast({
        title: "No Camera Selected",
        description: "Please select a camera to continue",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-security-light/10 p-4">
      <header className="container mx-auto py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye className="h-6 w-6 text-security" />
          <h1 className="text-2xl font-bold text-security-dark">Alert Eye Watch</h1>
        </div>
        <Button variant="ghost" size="sm" onClick={() => navigate("/settings")}>
          Settings
        </Button>
      </header>

      <main className="container mx-auto flex-1 flex flex-col items-center justify-center">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Select Camera</CardTitle>
            <CardDescription>
              Choose a camera to use for weapon detection monitoring
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {isLoading ? (
              <div className="flex flex-col items-center justify-center p-8">
                <Loader2 className="h-8 w-8 text-security animate-spin mb-4" />
                <p className="text-muted-foreground">Scanning for cameras...</p>
              </div>
            ) : cameras.length > 0 ? (
              <Tabs value="cameras" className="w-full">
                <TabsList className="w-full mb-4">
                  <TabsTrigger value="cameras" className="w-full">Available Cameras</TabsTrigger>
                </TabsList>
                
                <TabsContent value="cameras" className="space-y-2">
                  {cameras.map((camera) => (
                    <div
                      key={camera.deviceId}
                      className={`p-4 rounded-lg border-2 cursor-pointer flex items-center gap-3 transition-all ${
                        selectedCamera === camera.deviceId
                          ? "border-security bg-security/5"
                          : "border-border hover:border-security/30"
                      }`}
                      onClick={() => setSelectedCamera(camera.deviceId)}
                    >
                      <CameraIcon className={`h-5 w-5 ${
                        selectedCamera === camera.deviceId ? "text-security" : "text-muted-foreground"
                      }`} />
                      <div className="flex-1">
                        <p className={`font-medium ${
                          selectedCamera === camera.deviceId ? "text-security-dark" : ""
                        }`}>
                          {camera.label}
                        </p>
                      </div>
                      {selectedCamera === camera.deviceId && (
                        <Badge variant="outline" className="bg-security-light/10 text-security border-security">
                          Selected
                        </Badge>
                      )}
                    </div>
                  ))}
                </TabsContent>
              </Tabs>
            ) : (
              <div className="camera-error">
                <CameraIcon className="h-12 w-12 mb-4 opacity-50" />
                <p>No cameras found</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Connect a camera and refresh the page
                </p>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/login")} className="flex items-center gap-1">
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>
            <Button 
              className="flex-1"
              onClick={handleStartMonitoring}
              disabled={isLoading || !selectedCamera}
            >
              Start Monitoring
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
};

export default CameraSelection;


import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/contexts/SettingsContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { ChevronLeft, Eye, Mail, Phone, Bell, ShieldAlert, LogOut } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const Settings = () => {
  const { user, logout } = useAuth();
  const { settings, updateSettings } = useSettings();
  const navigate = useNavigate();

  const [email, setEmail] = useState(settings.email || user?.email || "");
  const [phone, setPhone] = useState(settings.phone || user?.phone || "");
  const [threshold, setThreshold] = useState(settings.threshold * 100);
  const [enableEmail, setEnableEmail] = useState(settings.enableEmailAlerts);
  const [enableSms, setEnableSms] = useState(settings.enableSmsAlerts);

  const handleSave = () => {
    updateSettings({
      email,
      phone,
      threshold: threshold / 100,
      enableEmailAlerts: enableEmail,
      enableSmsAlerts: enableSms,
    });
    
    navigate("/cameras");
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-security-light/10">
      <header className="container mx-auto py-4 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye className="h-6 w-6 text-security" />
          <h1 className="text-2xl font-bold text-security-dark">Alert Eye Watch</h1>
        </div>
      </header>

      <main className="container mx-auto flex-1 p-4 max-w-2xl">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/cameras")}
          className="mb-6"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Cameras
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
            <CardDescription>
              Configure your alert preferences and notification settings
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-medium flex items-center gap-2">
                <Bell className="h-4 w-4 text-security" />
                Alert Settings
              </h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="threshold">Detection Threshold: {Math.round(threshold)}%</Label>
                  </div>
                  <Slider
                    id="threshold"
                    min={50}
                    max={95}
                    step={5}
                    value={[threshold]}
                    onValueChange={(value) => setThreshold(value[0])}
                    className="w-full"
                  />
                  <p className="text-sm text-muted-foreground">
                    Higher values reduce false positives but may miss some detections
                  </p>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-4">
              <h3 className="font-medium flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-security" />
                Notification Preferences
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between space-x-2">
                  <div className="flex flex-col space-y-1">
                    <Label htmlFor="email-alerts" className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      Email Alerts
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Receive alert notifications via email
                    </p>
                  </div>
                  <Switch
                    id="email-alerts"
                    checked={enableEmail}
                    onCheckedChange={setEnableEmail}
                  />
                </div>
                
                {enableEmail && (
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter email address"
                    />
                  </div>
                )}
                
                <div className="flex items-center justify-between space-x-2">
                  <div className="flex flex-col space-y-1">
                    <Label htmlFor="sms-alerts" className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      SMS Alerts
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Receive alert notifications via SMS
                    </p>
                  </div>
                  <Switch
                    id="sms-alerts"
                    checked={enableSms}
                    onCheckedChange={setEnableSms}
                  />
                </div>
                
                {enableSms && (
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Enter phone number"
                    />
                  </div>
                )}
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="font-medium mb-4">Account</h3>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 border-destructive/30 text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </CardContent>
          
          <CardFooter>
            <Button className="w-full" onClick={handleSave}>
              Save Settings
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
};

export default Settings;

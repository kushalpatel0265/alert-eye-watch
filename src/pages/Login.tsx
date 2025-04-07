
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Shield, Eye } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [activeTab, setActiveTab] = useState("email");
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(
      activeTab === "email" ? email : undefined,
      activeTab === "phone" ? phone : undefined
    );
    
    if (success) {
      navigate("/cameras");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-security-light/10 p-4">
      <div className="mb-8 flex flex-col items-center">
        <div className="flex items-center gap-2 mb-2">
          <Eye className="h-8 w-8 text-security" />
          <h1 className="text-3xl font-bold text-security-dark">Alert Eye Watch</h1>
        </div>
        <p className="text-muted-foreground text-center max-w-md">
          Advanced weapon detection system with real-time alerts
        </p>
      </div>

      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Sign In</CardTitle>
          <CardDescription className="text-center">
            Login to access the weapon detection system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-2 mb-4">
                <TabsTrigger value="email">Email</TabsTrigger>
                <TabsTrigger value="phone">Phone</TabsTrigger>
              </TabsList>
              <TabsContent value="email" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required={activeTab === "email"}
                    className="w-full"
                  />
                </div>
              </TabsContent>
              <TabsContent value="phone" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required={activeTab === "phone"}
                    className="w-full"
                  />
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex items-center p-4 mt-3 rounded-lg bg-yellow-50 border border-yellow-200 text-sm">
              <AlertTriangle className="h-4 w-4 text-yellow-500 mr-2 flex-shrink-0" />
              <p className="text-yellow-700">
                In a real system, secure authentication would be required
              </p>
            </div>

            <Button type="submit" className="w-full mt-6" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <div className="flex items-center text-xs text-muted-foreground gap-1">
            <Shield className="h-3 w-3" />
            <span>Secure Connection</span>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;


import { Detection } from '@/types';
import { toast } from '@/components/ui/use-toast';

// Mock function to send alert (in real app, would make API call to your .NET backend)
export const sendAlert = async (detection: Detection, email?: string, phone?: string) => {
  console.log("Alert sent!", { detection, email, phone });
  // In a real implementation, this would make a fetch request to your backend API
  return new Promise(resolve => setTimeout(resolve, 1000));
};

// Helper function to handle alert sending with proper error handling and toast notifications
export const handleSendAlert = async (
  detection: Detection, 
  email?: string, 
  phone?: string
) => {
  try {
    // Validate recipients
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

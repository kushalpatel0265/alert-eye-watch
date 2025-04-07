
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, Check, X, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { loadModel } from '@/utils/weaponDetection';

interface ModelUploadProps {
  onModelLoaded: (isLoaded: boolean) => void;
}

const ModelUpload: React.FC<ModelUploadProps> = ({ onModelLoaded }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Check if it's a PyTorch model file
      if (!selectedFile.name.endsWith('.pt')) {
        toast({
          title: "Invalid File Format",
          description: "Please upload a valid PyTorch model file (.pt)",
          variant: "destructive",
        });
        return;
      }
      
      setFile(selectedFile);
      setUploadStatus('idle');
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleModelLoad = async () => {
    if (!file) return;
    
    setIsLoading(true);
    setUploadStatus('loading');
    
    try {
      // Read the file as ArrayBuffer
      const fileReader = new FileReader();
      
      fileReader.onload = async (e) => {
        try {
          const modelBuffer = e.target?.result;
          
          // Attempt to load the model with our utility
          const success = await loadModel(modelBuffer);
          
          if (success) {
            setUploadStatus('success');
            onModelLoaded(true);
            toast({
              title: "Model Loaded Successfully",
              description: `${file.name} is ready for weapon detection.`,
            });
          } else {
            throw new Error("Failed to initialize model");
          }
        } catch (error) {
          console.error("Model loading error:", error);
          setUploadStatus('error');
          onModelLoaded(false);
          toast({
            title: "Model Loading Failed",
            description: "Could not initialize the model. Please try again with a compatible model.",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      };
      
      fileReader.onerror = () => {
        setUploadStatus('error');
        setIsLoading(false);
        onModelLoaded(false);
        toast({
          title: "File Reading Error",
          description: "Could not read the model file. Please try again.",
          variant: "destructive",
        });
      };
      
      fileReader.readAsArrayBuffer(file);
      
    } catch (error) {
      console.error("Model upload error:", error);
      setUploadStatus('error');
      setIsLoading(false);
      onModelLoaded(false);
    }
  };

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <h3 className="font-medium mb-3">Upload Detection Model</h3>
        
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={handleUploadClick}
              disabled={isLoading}
            >
              <Upload className="mr-2 h-4 w-4" />
              Select Model File
            </Button>
            <input
              type="file"
              accept=".pt"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
              disabled={isLoading}
            />
          </div>
          
          {file && (
            <div className="flex flex-col gap-2">
              <div className="text-sm flex justify-between items-center">
                <span className="font-medium truncate max-w-[200px]" title={file.name}>
                  {file.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                </span>
              </div>
              
              <Button
                variant="default"
                size="sm"
                disabled={isLoading || !file}
                onClick={handleModelLoad}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading Model...
                  </>
                ) : uploadStatus === 'success' ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Model Loaded
                  </>
                ) : uploadStatus === 'error' ? (
                  <>
                    <X className="mr-2 h-4 w-4" />
                    Try Again
                  </>
                ) : (
                  'Load Model'
                )}
              </Button>
            </div>
          )}
          
          {!file && (
            <p className="text-sm text-muted-foreground mt-1">
              Upload your PyTorch (.pt) weapon detection model to enable real-time detection.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ModelUpload;

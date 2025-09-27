import React, { useRef, useState } from 'react';
import { Camera, User, X, Upload } from 'lucide-react';
import { Button } from './Button';

interface PhotoCaptureProps {
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
  label?: string;
  placeholder?: React.ReactNode;
}

export function PhotoCapture({ value, onChange, disabled = false, className = '', label = 'Photo', placeholder }: PhotoCaptureProps) {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  // Detect if device is mobile (only actual mobile devices, not touchscreen laptops)
  const isMobileDevice = () => {
    return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  const handleRemove = () => {
    onChange('');
  };

  // Process selected/captured image file
  const processImageFile = (file: File) => {
    if (!file || !file.type.startsWith('image/')) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Create canvas to resize and crop image to square
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const size = Math.min(img.width, img.height);
        canvas.width = 512;
        canvas.height = 512;

        // Calculate crop position for center square
        const sx = (img.width - size) / 2;
        const sy = (img.height - size) / 2;

        // Draw the cropped square image
        ctx.drawImage(img, sx, sy, size, size, 0, 0, 512, 512);
        
        // Convert to base64
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        onChange(imageData);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Handle camera capture from file input (mobile)
  const handleCameraCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('Camera input triggered - mobile device');
    const file = event.target.files?.[0];
    if (file) {
      console.log('File captured from camera input:', file.name);
      processImageFile(file);
    }
    event.target.value = '';
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('File input triggered - file picker');
    const file = event.target.files?.[0];
    if (file) {
      console.log('File selected from file input:', file.name);
      processImageFile(file);
    }
    event.target.value = '';
  };

  // Desktop camera access using getUserMedia
  const startDesktopCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      setStream(mediaStream);
      setShowCameraModal(true);
      
      // Wait for modal to render, then start video
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play();
        }
      }, 100);
    } catch (error) {
      console.error('Error accessing camera:', error);
      // Fallback to file input on error
      cameraInputRef.current?.click();
    }
  };

  // Stop camera stream
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCameraModal(false);
  };

  // Capture photo from video stream
  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const video = videoRef.current;
      const size = Math.min(video.videoWidth, video.videoHeight);
      canvas.width = 512;
      canvas.height = 512;

      // Calculate crop position for center square
      const sx = (video.videoWidth - size) / 2;
      const sy = (video.videoHeight - size) / 2;

      // Draw the cropped square image
      ctx.drawImage(video, sx, sy, size, size, 0, 0, 512, 512);
      
      // Convert to base64
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      onChange(imageData);
      
      stopCamera();
    }
  };

  const handleTakePhotoClick = () => {
    console.log('Take Photo clicked');
    if (isMobileDevice()) {
      console.log('Mobile device detected - using capture input');
      cameraInputRef.current?.click();
    } else {
      console.log('Desktop device detected - using getUserMedia');
      startDesktopCamera();
    }
  };

  const handleUploadClick = () => {
    console.log('Upload Photo clicked - triggering file input');
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      
      {/* Photo display area */}
      <div className="relative">
        {value ? (
          <div className="relative inline-block">
            <div className="w-32 h-32 rounded-lg border-2 border-gray-200 overflow-hidden bg-gray-50">
              <img
                src={value}
                alt="Patient photo"
                className="w-full h-full object-cover"
              />
            </div>
            {!disabled && (
              <button
                type="button"
                onClick={handleRemove}
                className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-lg transition-colors"
                title="Remove photo"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        ) : (
          <div className="w-32 h-32 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center">
            {placeholder || <User className="h-12 w-12 text-gray-400" />}
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 flex-wrap">
        <Button
          type="button"
          variant="outline"
          onClick={handleTakePhotoClick}
          disabled={disabled}
          className="flex items-center gap-2 text-sm"
        >
          <Camera className="h-4 w-4" />
          {value ? 'Retake Photo' : 'Take Photo'}
        </Button>
        
        <Button
          type="button"
          variant="outline"
          onClick={handleUploadClick}
          disabled={disabled}
          className="flex items-center gap-2 text-sm"
        >
          <Upload className="h-4 w-4" />
          {value ? 'Replace Photo' : 'Upload Photo'}
        </Button>
      </div>

      {/* Hidden camera input - for mobile devices */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        id="camera-input"
        onChange={handleCameraCapture}
        disabled={disabled}
        className="hidden"
      />

      {/* Hidden file input - for file selection */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        id="file-input"
        onChange={handleFileUpload}
        disabled={disabled}
        className="hidden"
      />

      {/* Desktop camera modal */}
      {showCameraModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Take Photo</h3>
              <button
                onClick={stopCamera}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="aspect-square bg-black rounded-lg overflow-hidden mb-4">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="flex gap-2 justify-center">
              <Button onClick={capturePhoto} className="flex items-center gap-2">
                <Camera className="h-4 w-4" />
                Capture
              </Button>
              <Button variant="outline" onClick={stopCamera}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PhotoCapture;
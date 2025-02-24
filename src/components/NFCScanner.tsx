// src/components/NFCScanner.tsx
import React, { useState, useCallback, useEffect } from 'react';
import { CreditCard, RefreshCw } from 'lucide-react';
import { nfcService, NFCTagData } from '../lib/nfc';

interface NFCScannerProps {
  onTagDetected: (tag: NFCTagData) => void;
  onError: (error: string) => void;
  isActive: boolean;
}

export const NFCScanner: React.FC<NFCScannerProps> = ({ 
  onTagDetected, 
  onError,
  isActive 
}) => {
  const [isScanning, setIsScanning] = useState(false);

  const startScanning = useCallback(async () => {
    setIsScanning(true);
    await nfcService.startScanning(
      (tag) => {
        setIsScanning(false);
        onTagDetected(tag);
      },
      (error) => {
        setIsScanning(false);
        onError(error);
      }
    );
  }, [onTagDetected, onError]);

  useEffect(() => {
    if (isActive) {
      startScanning();
    } else {
      nfcService.stopScanning();
      setIsScanning(false);
    }
    
    return () => {
      nfcService.stopScanning();
    };
  }, [isActive, startScanning]);

  // Animation for scanning
  const NFCScanAnimation = () => (
    <div className="relative w-32 h-32 mx-auto mb-4">
      <div className="absolute inset-0 border-4 border-blue-500 rounded-full animate-ping"></div>
      <div className="absolute inset-0 flex items-center justify-center">
        <CreditCard className="h-16 w-16 text-blue-600" />
      </div>
    </div>
  );

  return (
    <div className="text-center">
      {isScanning && <NFCScanAnimation />}
      <div className="text-gray-600">
        {isScanning ? (
          <div className="flex items-center justify-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span>Scanning for NFC tag...</span>
          </div>
        ) : (
          <span>Ready to scan</span>
        )}
      </div>
    </div>
  );
};
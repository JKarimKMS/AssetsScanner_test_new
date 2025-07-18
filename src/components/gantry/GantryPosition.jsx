
import React from 'react';
import { CheckCircle, Circle, CloudOff, Camera } from 'lucide-react';

const GantryPosition = React.memo(function GantryPosition({ position, onClick, scanResult, status, isSelected }) {
  const isCompleted = status === "completed";
  const hasPhoto = isCompleted && scanResult?.photo_url;

  const getStatusColor = () => {
    switch (status) {
      case "completed": return "bg-green-100 border-green-500 text-green-700";
      case "current": return "bg-yellow-100 border-yellow-500 text-yellow-700 scan-pulse";
      default: return "bg-gray-50 border-gray-300 text-gray-600 border-dashed";
    }
  };

  // isScanComplete retains its original logic as it's used for the main icon and outer photo indicator condition
  const isScanComplete = scanResult && scanResult.model_id && scanResult.serial_number && scanResult.asset_tag;
  
  return (
    <div className="flex flex-col items-center space-y-2 flex-shrink-0">
      <button
        onClick={onClick}
        className={`relative w-24 h-16 rounded-md border-2 transition-all duration-200 hover:scale-105 active:scale-95 ${getStatusColor()} ${isSelected ? 'ring-2 ring-emerald-500 ring-offset-2' : ''}`}
      >
        <div className="absolute inset-0 flex items-center justify-center p-1">
          {position.type === 'quad' ? (
            <div className="grid grid-cols-2 gap-0.5 w-full h-full">
              <div className="bg-white/60 rounded-sm flex items-center justify-center text-xs font-medium">A</div>
              <div className="bg-white/60 rounded-sm flex items-center justify-center text-xs font-medium">B</div>
              <div className="bg-white/60 rounded-sm flex items-center justify-center text-xs font-medium">C</div>
              <div className="bg-white/60 rounded-sm flex items-center justify-center text-xs font-medium">D</div>
            </div>
          ) : (
            isScanComplete ? <CheckCircle className="w-6 h-6" /> : <Circle className="w-6 h-6" />
          )}
        </div>
        
        {/* Photo indicator */}
        {isScanComplete && ( // This condition still uses isScanComplete to show the photo icon only for 'scanned' items
          <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow">
            <Camera className={`w-3 h-3 ${hasPhoto ? 'text-green-600' : 'text-red-500'}`} />
          </div>
        )}
        
        {/* Sync indicator */}
        {scanResult && !scanResult.synced && (
          <div className="absolute -top-1 -left-1 bg-white rounded-full p-0.5 shadow">
            <CloudOff className="w-3 h-3 text-amber-500" />
          </div>
        )}
      </button>
      <div className="text-xs font-medium text-gray-700 text-center whitespace-nowrap">
        {position.label}
      </div>
    </div>
  );
});

export default GantryPosition;

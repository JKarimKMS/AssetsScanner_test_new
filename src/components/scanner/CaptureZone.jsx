import React from "react";
import { CheckCircle } from "lucide-react";

export default function CaptureZone({ label, status, confidence, value }) {
  const getZoneStyle = () => {
    switch (status) {
      case "scanning":
        return "border-amber-400 border-solid scan-pulse";
      case "captured":
        return "border-green-500 border-solid";
      default:
        return "border-gray-400 border-dashed";
    }
  };

  const getTextColor = () => {
    switch (status) {
      case "scanning":
        return "text-amber-400";
      case "captured":
        return "text-green-400";
      default:
        return "text-gray-400";
    }
  };

  return (
    <div className={`flex-1 min-h-0 border-2 rounded-lg p-3 ${getZoneStyle()} transition-all duration-300 flex flex-col justify-center`}>
      <div className="flex items-center justify-between mb-1">
        <span className={`text-xs font-medium ${getTextColor()}`}>
          {label}
        </span>
        {status === "captured" && (
          <CheckCircle className="w-3 h-3 text-green-400 flex-shrink-0" />
        )}
      </div>
      
      <div className="flex-1 min-h-0 flex flex-col justify-center">
        {status === "scanning" && (
          <div className="text-xs text-amber-400">
            Confidence: {Math.round(confidence)}%
          </div>
        )}
        
        {status === "captured" && value && (
          <div className="text-white font-mono text-xs bg-black bg-opacity-50 px-2 py-1 rounded truncate">
            {value}
          </div>
        )}
        
        {status === "idle" && (
          <div className="text-xs text-gray-500">
            Position device to scan
          </div>
        )}
      </div>
    </div>
  );
}
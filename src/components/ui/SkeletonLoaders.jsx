import React from 'react';

export const CardSkeleton = ({ className = "" }) => {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="bg-gray-200 rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="space-y-2 flex-1">
            <div className="h-5 bg-gray-300 rounded w-3/4"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
          </div>
          <div className="h-6 w-16 bg-gray-300 rounded"></div>
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-gray-300 rounded w-full"></div>
          <div className="h-3 bg-gray-300 rounded w-2/3"></div>
        </div>
        <div className="flex justify-between items-center">
          <div className="h-4 bg-gray-300 rounded w-1/3"></div>
          <div className="h-8 w-20 bg-gray-300 rounded"></div>
        </div>
      </div>
    </div>
  );
};

export const ListItemSkeleton = ({ className = "" }) => {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="flex items-center space-x-4 p-4">
        <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-300 rounded w-3/4"></div>
          <div className="h-3 bg-gray-300 rounded w-1/2"></div>
        </div>
        <div className="h-6 w-16 bg-gray-300 rounded"></div>
      </div>
    </div>
  );
};

export const TableSkeleton = ({ rows = 5, cols = 4, className = "" }) => {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="space-y-3">
        {/* Header */}
        <div className="flex space-x-4">
          {Array.from({ length: cols }).map((_, i) => (
            <div key={i} className="h-4 bg-gray-300 rounded flex-1"></div>
          ))}
        </div>
        
        {/* Rows */}
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex space-x-4">
            {Array.from({ length: cols }).map((_, colIndex) => (
              <div key={colIndex} className="h-4 bg-gray-200 rounded flex-1"></div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export const ConfigurationCardSkeleton = ({ className = "" }) => {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="bg-white rounded-lg shadow-sm border p-6 text-center space-y-4">
        {/* Brand badge */}
        <div className="h-6 w-16 bg-gray-300 rounded-full mx-auto"></div>
        
        {/* Configuration name */}
        <div className="h-8 bg-gray-300 rounded w-32 mx-auto"></div>
        
        {/* Status */}
        <div className="h-4 bg-gray-200 rounded w-24 mx-auto"></div>
        
        {/* Time estimate */}
        <div className="h-4 bg-gray-200 rounded w-28 mx-auto"></div>
        
        {/* Button */}
        <div className="h-12 bg-gray-300 rounded w-full"></div>
        
        {/* Diagram area */}
        <div className="bg-gray-50 rounded-lg border p-4 space-y-3">
          <div className="h-3 bg-gray-300 rounded w-16 mx-auto"></div>
          <div className="flex justify-center space-x-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="w-8 h-6 bg-gray-300 rounded"></div>
            ))}
          </div>
          <div className="h-3 bg-gray-300 rounded w-20 mx-auto"></div>
          <div className="flex justify-center space-x-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="w-8 h-6 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const ProgressPageSkeleton = ({ className = "" }) => {
  return (
    <div className={`animate-pulse space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center space-x-4">
        <div className="w-8 h-8 bg-gray-300 rounded"></div>
        <div className="space-y-2">
          <div className="h-6 bg-gray-300 rounded w-32"></div>
          <div className="h-4 bg-gray-200 rounded w-24"></div>
        </div>
      </div>
      
      {/* Progress cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg border p-4 space-y-3">
          <div className="h-5 bg-gray-300 rounded w-3/4"></div>
          <div className="h-2 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="bg-white rounded-lg border p-4 space-y-3">
          <div className="h-5 bg-gray-300 rounded w-3/4"></div>
          <div className="h-2 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="space-y-4">
        <div className="flex space-x-4">
          <div className="h-10 bg-gray-300 rounded w-24"></div>
          <div className="h-10 bg-gray-200 rounded w-24"></div>
        </div>
        
        {/* Gantry grid */}
        <div className="bg-white rounded-lg border p-6 space-y-4">
          <div className="h-6 bg-gray-300 rounded w-32"></div>
          <div className="grid grid-cols-4 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-square bg-gray-200 rounded border"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const ScannerPageSkeleton = ({ className = "" }) => {
  return (
    <div className={`animate-pulse space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-8 h-8 bg-gray-300 rounded"></div>
          <div className="space-y-2">
            <div className="h-5 bg-gray-300 rounded w-24"></div>
            <div className="h-3 bg-gray-200 rounded w-20"></div>
          </div>
        </div>
        <div className="flex space-x-2">
          <div className="w-16 h-6 bg-gray-300 rounded"></div>
          <div className="w-8 h-8 bg-gray-300 rounded"></div>
        </div>
      </div>
      
      {/* Camera area */}
      <div className="bg-gray-300 rounded-lg aspect-[4/3] relative">
        <div className="absolute inset-4 space-y-2">
          <div className="h-16 bg-gray-400 rounded border-2 border-dashed"></div>
          <div className="h-16 bg-gray-400 rounded border-2 border-dashed"></div>
          <div className="h-16 bg-gray-400 rounded border-2 border-dashed"></div>
        </div>
      </div>
      
      {/* Buttons */}
      <div className="space-y-4">
        <div className="h-12 bg-gray-300 rounded w-full"></div>
        <div className="h-12 bg-gray-200 rounded w-full"></div>
      </div>
    </div>
  );
};

export default {
  CardSkeleton,
  ListItemSkeleton,
  TableSkeleton,
  ConfigurationCardSkeleton,
  ProgressPageSkeleton,
  ScannerPageSkeleton
};
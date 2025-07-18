import React, { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { Wifi, WifiOff, Cloud, CloudOff } from "lucide-react";

export default function ConnectionStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingChanges, setPendingChanges] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Simulate pending changes for demo
    const storedChanges = localStorage.getItem('pendingChanges');
    if (storedChanges) {
      setPendingChanges(parseInt(storedChanges) || 0);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const getStatusInfo = () => {
    if (!isOnline) {
      return {
        color: "bg-red-500",
        text: pendingChanges > 0 ? `Offline - ${pendingChanges} changes stored locally` : "Offline",
        icon: <WifiOff className="w-3 h-3" />
      };
    }
    
    if (isSyncing || pendingChanges > 0) {
      return {
        color: "bg-amber-500",
        text: `Syncing - ${pendingChanges} changes pending`,
        icon: <Cloud className="w-3 h-3" />
      };
    }

    return {
      color: "bg-green-500",
      text: "Online - All data synced",
      icon: <Wifi className="w-3 h-3" />
    };
  };

  const status = getStatusInfo();

  return (
    <div className="flex items-center space-x-2 text-xs">
      <div className={`w-2 h-2 rounded-full ${status.color} animate-pulse`}></div>
      <span className="hidden sm:inline text-gray-600">{status.text}</span>
      <span className="sm:hidden">{status.icon}</span>
    </div>
  );
}
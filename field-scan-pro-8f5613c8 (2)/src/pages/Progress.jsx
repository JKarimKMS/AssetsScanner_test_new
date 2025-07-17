
import React, { useState, useEffect, useMemo } from "react";
import { Session, Site } from "@/api/entities";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress as ProgressUI } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsTrigger, TabsList } from "@/components/ui/tabs";
import {
  ArrowLeft,
  CheckCircle,
  Monitor,
  AlertCircle,
  CloudOff,
  Grid,
  ListChecks
} from "lucide-react";
import ScanConfirmationDialog from "../components/progress/ScanConfirmationDialog";
import GantryView from "../components/progress/GantryView";
import AdditionalScreensList from "../components/progress/AdditionalScreensList";

export default function Progress() {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [scanResultForDialog, setScanResultForDialog] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    loadSessionData();
    
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadSessionData = async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const sessionId = urlParams.get("sessionId");

      if (sessionId) {
        const sessionData = await Session.filter({ id: sessionId });
        const currentSession = sessionData[0];
        
        // CRITICAL FIX: If session doesn't have layout, rebuild it from site configuration
        if (currentSession && (!currentSession.layout || currentSession.layout.length === 0)) {
          console.log("Session missing layout, attempting to rebuild...");
          
          // Try to get site and configuration data to rebuild layout
          if (currentSession.site_id) {
            try {
              const siteData = await Site.filter({ id: currentSession.site_id });
              const site = siteData[0];
              
              if (site && site.configurations && site.configurations.length > 0) {
                // Find the correct config by name, otherwise default to the first one
                const config = site.configurations.find(c => c.name === currentSession.config_name) || site.configurations[0];
                
                // Rebuild layout from configuration
                const gantryPositions = [
                  ...(config.gantry_layout?.topRow || []),
                  ...(config.gantry_layout?.bottomRow || [])
                ].map(p => ({
                    ...p,
                    type: p.type || "gantry" // Ensure type is set for gantry positions
                }));
                
                const additionalPositions = [];
                if (config.additional_screens) {
                  Object.entries(config.additional_screens).forEach(([zone, screens]) => {
                    screens.forEach((screenName, index) => {
                      additionalPositions.push({
                        id: `${zone}-${index + 1}`, // Ensure unique ID, starting index from 1
                        label: screenName,
                        type: "additional",
                        zone: zone,
                        row: null,
                        column: null
                      });
                    });
                  });
                }
                
                const allPositions = [...gantryPositions, ...additionalPositions];
                
                // Update session with layout
                await Session.update(sessionId, {
                  layout: allPositions,
                  config_name: config.name
                });
                
                // Update the currentSession object in memory to reflect changes
                currentSession.layout = allPositions;
                currentSession.config_name = config.name;
                
                console.log("Layout rebuilt successfully:", allPositions);
              } else {
                console.warn("Site or configuration not found for rebuilding layout.");
              }
            } catch (error) {
              console.error("Error rebuilding session layout:", error);
            }
          } else {
            console.warn("Session site_id is missing, cannot rebuild layout.");
          }
        }
        
        setSession(currentSession);
      }
    } catch (error) {
      console.error("Error loading session data:", error);
    } finally {
      setLoading(false);
    }
  };

  const { gantryPositions, additionalPositions, progressData } = useMemo(() => {
    if (!session || !session.layout) return { gantryPositions: [], additionalPositions: [], progressData: {} };

    const gantryPos = session.layout.filter(p => p.type === 'gantry' || p.row === 'top' || p.row === 'bottom'); // Filter by type for robustness
    const additionalPos = session.layout.filter(p => p.type === 'additional' || (!p.row && p.type !== 'gantry')); // Filter by type for robustness
    
    const isScanComplete = (result) => result && result.model_id && result.serial_number && result.asset_tag;

    const gantryCompleted = gantryPos.filter(p => {
        const result = session.scan_results?.find(r => r.position_id === p.id);
        return isScanComplete(result);
    }).length;

    const additionalCompleted = additionalPos.filter(p => {
        const result = session.scan_results?.find(r => r.position_id === p.id);
        return isScanComplete(result);
    }).length;

    const gantryTotal = gantryPos.length;
    const additionalTotal = additionalPos.length;
    const totalCompleted = gantryCompleted + additionalCompleted;
    const totalPositions = gantryTotal + additionalTotal;
    
    return {
      gantryPositions: gantryPos,
      additionalPositions: additionalPos,
      progressData: {
        gantryCompleted,
        gantryTotal,
        gantryPercentage: gantryTotal > 0 ? (gantryCompleted / gantryTotal) * 100 : 0,
        additionalCompleted,
        additionalTotal,
        additionalPercentage: additionalTotal > 0 ? (additionalCompleted / additionalTotal) * 100 : 0,
        totalCompleted,
        totalPercentage: totalPositions > 0 ? (totalCompleted / totalPositions) * 100 : 0,
      }
    };
  }, [session]);

  const handlePositionSelect = (position) => {
    const scanResult = session.scan_results?.find(r => r.position_id === position.id);
    setSelectedPosition(position);
    setScanResultForDialog(scanResult || null);
  };

  const handleConfirmScan = () => {
    if (selectedPosition) {
      const navUrl = createPageUrl("Scanner", `sessionId=${session.id}&positionId=${selectedPosition.id}&positionLabel=${encodeURIComponent(selectedPosition.label)}`);
      navigate(navUrl);
    }
  };

  const handleCancelScan = () => {
    setSelectedPosition(null);
    setScanResultForDialog(null);
  };

  const handleCompleteSession = async () => {
    try {
      await Session.update(session.id, {
        status: "completed",
        end_time: new Date().toISOString()
      });
      navigate(createPageUrl("Export", `sessionId=${session.id}`));
    } catch (error) {
      console.error("Error completing session:", error);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-48 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Session not found</p>
          <Button onClick={() => navigate(createPageUrl("Dashboard"))}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }
  
  const { gantryCompleted, gantryTotal, gantryPercentage, additionalCompleted, additionalTotal, additionalPercentage, totalPercentage } = progressData;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(createPageUrl("Dashboard"))}
          className="touch-target"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Progress ({Math.round(totalPercentage)}%)</h2>
          <p className="text-gray-600">{session.site_name} • {session.config_name}</p>
        </div>
        {!isOnline && (
          <Badge variant="destructive" className="ml-auto flex items-center space-x-1">
            <CloudOff className="w-4 h-4" />
            <span>Offline</span>
          </Badge>
        )}
      </div>

      {/* Progress Overview */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-gray-800">Gantry Progress (Mandatory)</h3>
                <span className="text-sm font-medium">{gantryCompleted} / {gantryTotal}</span>
              </div>
              <ProgressUI value={gantryPercentage} />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-gray-800">Additional Screens (Optional)</h3>
                <span className="text-sm font-medium">{additionalCompleted} / {additionalTotal}</span>
              </div>
              <ProgressUI value={additionalPercentage} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* View Toggle */}
      <Tabs defaultValue="gantry" className="mb-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="gantry" className="text-xs sm:text-sm">
            <Grid className="w-4 h-4 mr-1 sm:mr-2" />
            <span>Gantry ({gantryCompleted}/{gantryTotal})</span>
          </TabsTrigger>
          <TabsTrigger value="additional" className="text-xs sm:text-sm">
            <ListChecks className="w-4 h-4 mr-1 sm:mr-2" />
            <span>Additional ({additionalCompleted}/{additionalTotal})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="gantry" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Monitor className="w-5 h-5" />
                <span>Gantry Layout</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <GantryView
                session={session}
                positions={gantryPositions}
                onPositionSelect={handlePositionSelect}
                selectedPositionId={selectedPosition?.id}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="additional" className="mt-6">
          <Card>
            <CardHeader>
               <CardTitle className="flex items-center space-x-2">
                <ListChecks className="w-5 h-5" />
                <span>Additional Screen Groups</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AdditionalScreensList
                positions={additionalPositions}
                scanResults={session.scan_results || []}
                onScreenSelect={handlePositionSelect}
                selectedScreenId={selectedPosition?.id}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Complete Button */}
      {totalPercentage === 100 && (
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-6 text-center">
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Installation Complete!</h3>
            <p className="text-gray-600 mb-4">All positions have been scanned successfully</p>
            <Button
              size="lg"
              className="bg-green-600 hover:bg-green-700"
              onClick={handleCompleteSession}
            >
              Complete Session
            </Button>
          </CardContent>
        </Card>
      )}

      <ScanConfirmationDialog
        position={selectedPosition}
        scanResult={scanResultForDialog}
        onConfirm={handleConfirmScan}
        onCancel={handleCancelScan}
      />
    </div>
  );
}

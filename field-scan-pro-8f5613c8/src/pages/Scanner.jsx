
import React, { useState, useEffect } from "react";
import { Session } from "@/api/entities";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft, 
  Camera, 
  CheckCircle, 
  Flashlight,
  Edit,
  AlertCircle
} from "lucide-react";

import CaptureZone from "../components/scanner/CaptureZone";
import ManualEntry from "../components/scanner/ManualEntry";

export default function Scanner() {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [positionId, setPositionId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [scanPhase, setScanPhase] = useState("idle");
  const [scanData, setScanData] = useState({
    modelId: { value: "", confidence: 0, status: "idle" },
    serialNumber: { value: "", confidence: 0, status: "idle" },
    assetTag: { value: "", confidence: 0, status: "idle" }
  });
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [torchOn, setTorchOn] = useState(false);

  useEffect(() => {
    loadSession();
  }, []);

  const loadSession = async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const sessionId = urlParams.get("sessionId");
      const posId = urlParams.get("positionId");
      
      if (sessionId && posId) {
        const sessionData = await Session.filter({ id: sessionId });
        setSession(sessionData[0]);
        setPositionId(posId);
        
        // Load existing scan data if available
        const existingResult = sessionData[0].scan_results?.find(r => r.position_id === posId);
        if (existingResult) {
          setScanData({
            modelId: { value: existingResult.model_id || "", confidence: 100, status: "captured" },
            serialNumber: { value: existingResult.serial_number || "", confidence: 100, status: "captured" },
            assetTag: { value: existingResult.asset_tag || "", confidence: 100, status: "captured" }
          });
        }
      }
    } catch (error) {
      console.error("Error loading session:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateMockScanData = () => {
    const models = [
      "43BDL3650Q/00",
      "55BDL3050Q/00", 
      "32BDL3051T/00",
      "43BDL4550D/00",
      "55BDL4510D/00"
    ];
    
    const generateSerial = () => {
      const prefix = "AU0A";
      const numbers = Array.from({ length: 10 }, () => 
        Math.floor(Math.random() * 10)
      ).join('');
      return prefix + numbers;
    };
    
    const generateAssetTag = () => {
      return Array.from({ length: 6 }, () => 
        Math.floor(Math.random() * 10)
      ).join('');
    };
    
    return {
      modelId: models[Math.floor(Math.random() * models.length)],
      serialNumber: generateSerial(),
      assetTag: generateAssetTag()
    };
  };

  const handleScanAll = async () => {
    setIsScanning(true);
    setScanPhase("initializing");
    
    // Reset all zones
    setScanData({
      modelId: { value: "", confidence: 0, status: "scanning" },
      serialNumber: { value: "", confidence: 0, status: "scanning" },
      assetTag: { value: "", confidence: 0, status: "scanning" }
    });

    // Simulate scanning phases
    await new Promise(resolve => setTimeout(resolve, 500));
    setScanPhase("detecting");
    
    // Simulate progressive confidence building
    const mockData = generateMockScanData();
    let progress = 0;
    
    const progressInterval = setInterval(() => {
      progress += Math.random() * 15 + 5;
      if (progress >= 100) {
        progress = 100;
        clearInterval(progressInterval);
      }
      
      setScanData(prev => ({
        modelId: { 
          value: progress >= 95 ? mockData.modelId : "", 
          confidence: progress, 
          status: progress >= 95 ? "captured" : "scanning" 
        },
        serialNumber: { 
          value: progress >= 95 ? mockData.serialNumber : "", 
          confidence: progress, 
          status: progress >= 95 ? "captured" : "scanning" 
        },
        assetTag: { 
          value: progress >= 95 ? mockData.assetTag : "", 
          confidence: progress, 
          status: progress >= 95 ? "captured" : "scanning" 
        }
      }));
      
      if (progress >= 100) {
        setScanPhase("completed");
        setIsScanning(false);
      }
    }, 100);
  };

  const handleManualSave = async (data) => {
    setScanData({
      modelId: { value: data.modelId, confidence: 100, status: "captured" },
      serialNumber: { value: data.serialNumber, confidence: 100, status: "captured" },
      assetTag: { value: data.assetTag, confidence: 100, status: "captured" }
    });
    setShowManualEntry(false);
  };

  const handleSaveAndContinue = async () => {
    if (!session || !positionId) return;

    const scanResult = {
      position_id: positionId,
      position_label: getPositionLabel(positionId),
      model_id: scanData.modelId.value,
      serial_number: scanData.serialNumber.value,
      asset_tag: scanData.assetTag.value,
      confidence: Math.min(scanData.modelId.confidence, scanData.serialNumber.confidence, scanData.assetTag.confidence),
      timestamp: new Date().toISOString(),
      capture_method: "ocr"
    };

    try {
      // Update or add scan result
      const existingResults = session.scan_results || [];
      const existingIndex = existingResults.findIndex(r => r.position_id === positionId);
      
      if (existingIndex >= 0) {
        existingResults[existingIndex] = scanResult;
      } else {
        existingResults.push(scanResult);
      }

      await Session.update(session.id, { scan_results: existingResults });
      navigate(createPageUrl("Progress", `sessionId=${session.id}`));
    } catch (error) {
      console.error("Error saving scan result:", error);
    }
  };

  const getPositionLabel = (posId) => {
    const positionMap = {
      "p1": "Top-1",
      "p2": "Top-2", 
      "p3": "Top-3",
      "p4": "Top-4",
      "p5": "Top-5",
      "p6": "Bottom-Center"
    };
    return positionMap[posId] || posId;
  };

  const isAllCaptured = () => {
    return scanData.modelId.status === "captured" && 
           scanData.serialNumber.status === "captured" && 
           scanData.assetTag.status === "captured";
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6">
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

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(createPageUrl("Progress", `sessionId=${session.id}`))}
            className="touch-target"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{getPositionLabel(positionId)}</h2>
            <p className="text-sm text-gray-600">{session.site_name}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline">{session.site_code}</Badge>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTorchOn(!torchOn)}
            className={`touch-target ${torchOn ? "bg-yellow-100 text-yellow-700" : ""}`}
          >
            <Flashlight className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="mb-6">
        <div className="flex justify-center space-x-1">
          {["●", "●", "○", "○", "○", "○"].map((dot, index) => (
            <span key={index} className={`text-lg ${index < 2 ? "text-emerald-500" : "text-gray-300"}`}>
              {dot}
            </span>
          ))}
        </div>
      </div>

      {/* Camera View */}
      <Card className="mb-6">
        <CardContent className="p-0">
          <div className="bg-black rounded-lg aspect-[4/3] relative overflow-hidden">
            {/* Camera simulation */}
            <div className="absolute inset-0 bg-gradient-to-b from-gray-800 to-gray-900 flex items-center justify-center">
              <Camera className="w-16 h-16 text-gray-600" />
            </div>
            
            {/* Scan zones */}
            <div className="absolute inset-4 flex flex-col space-y-2 h-[calc(100%-2rem)]">
              <CaptureZone
                label="Model ID"
                status={scanData.modelId.status}
                confidence={scanData.modelId.confidence}
                value={scanData.modelId.value}
              />
              <CaptureZone
                label="Serial Number"
                status={scanData.serialNumber.status}
                confidence={scanData.serialNumber.confidence}
                value={scanData.serialNumber.value}
              />
              <CaptureZone
                label="Asset Tag"
                status={scanData.assetTag.status}
                confidence={scanData.assetTag.confidence}
                value={scanData.assetTag.value}
              />
            </div>
            
            {/* Scanning overlay */}
            {isScanning && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-lg font-medium">
                    {scanPhase === "initializing" && "Initializing..."}
                    {scanPhase === "detecting" && "Detecting text..."}
                    {scanPhase === "processing" && "Processing..."}
                  </p>
                  {scanPhase === "detecting" && (
                    <Progress value={scanData.modelId.confidence} className="w-48 mx-auto mt-2" />
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Scan Results Summary (when all captured) */}
      {isAllCaptured() && (
        <Card className="mb-6 bg-green-50 border-green-200">
          <CardContent className="p-4">
            <h3 className="font-semibold text-green-800 mb-3">Captured Data:</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-green-700">Model ID:</span>
                <span className="font-mono text-green-800">{scanData.modelId.value}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-700">Serial Number:</span>
                <span className="font-mono text-green-800">{scanData.serialNumber.value}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-700">Asset Tag:</span>
                <span className="font-mono text-green-800">{scanData.assetTag.value}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Controls */}
      <div className="space-y-4">
        {!isAllCaptured() ? (
          <>
            <Button
              size="lg"
              className="w-full bg-emerald-600 hover:bg-emerald-700 touch-target"
              onClick={handleScanAll}
              disabled={isScanning}
            >
              {isScanning ? "Scanning..." : "Scan All Fields"}
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full touch-target"
              onClick={() => setShowManualEntry(true)}
            >
              <Edit className="w-4 h-4 mr-2" />
              Enter Manually
            </Button>
          </>
        ) : (
          <Button
            size="lg"
            className="w-full bg-green-600 hover:bg-green-700 touch-target"
            onClick={handleSaveAndContinue}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Save & Continue
          </Button>
        )}
      </div>

      {/* Manual Entry Modal */}
      {showManualEntry && (
        <ManualEntry
          onSave={handleManualSave}
          onCancel={() => setShowManualEntry(false)}
          initialData={{
            modelId: scanData.modelId.value,
            serialNumber: scanData.serialNumber.value,
            assetTag: scanData.assetTag.value
          }}
        />
      )}
    </div>
  );
}

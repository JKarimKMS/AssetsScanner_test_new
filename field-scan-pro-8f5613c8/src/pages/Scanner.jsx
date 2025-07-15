
import React, { useState, useEffect } from "react";
import { Session } from "@/api/entities";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft, 
  Camera, 
  CheckCircle, 
  Flashlight,
  Save,
  RefreshCw,
  AlertCircle,
  Check
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

  // State for editing captured data
  const [editableData, setEditableData] = useState({ modelId: "", serialNumber: "", assetTag: "" });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadSession();
  }, []);

  const isAllCaptured = () => {
    return scanData.modelId.status === "captured" && 
           scanData.serialNumber.status === "captured" && 
           scanData.assetTag.status === "captured";
  };
  
  useEffect(() => {
    if (isAllCaptured()) {
      // Ensure data is formatted before setting editableData and validating
      // This is crucial as scanData might come from various sources (OCR, manual, loaded session)
      const formattedModelId = scanData.modelId.value.toUpperCase().replace(/\s/g, '');
      const formattedSerialNumber = scanData.serialNumber.value.toUpperCase().replace(/\s/g, '');
      const formattedAssetTag = scanData.assetTag.value.toUpperCase().replace(/\s/g, '');

      const newData = {
        modelId: formattedModelId,
        serialNumber: formattedSerialNumber,
        assetTag: formattedAssetTag,
      };
      setEditableData(newData);
      validateAllFields(newData);
    }
  }, [scanData.modelId.status, scanData.serialNumber.status, scanData.assetTag.status]);


  const loadSession = async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const sessionId = urlParams.get("sessionId");
      const posId = urlParams.get("positionId");
      
      if (sessionId && posId) {
        const sessionData = await Session.filter({ id: sessionId });
        const currentSession = sessionData[0];
        setSession(currentSession);
        setPositionId(posId);
        
        const existingResult = currentSession.scan_results?.find(r => r.position_id === posId);
        if (existingResult) {
          // Format existing data when loading from session to ensure consistency
          const modelIdVal = (existingResult.model_id || "").toUpperCase().replace(/\s/g, '');
          const serialNumberVal = (existingResult.serial_number || "").toUpperCase().replace(/\s/g, '');
          const assetTagVal = (existingResult.asset_tag || "").toUpperCase().replace(/\s/g, '');

          const capturedScanData = {
            modelId: { value: modelIdVal, confidence: 100, status: "captured" },
            serialNumber: { value: serialNumberVal, confidence: 100, status: "captured" },
            assetTag: { value: assetTagVal, confidence: 100, status: "captured" }
          };
          setScanData(capturedScanData);
          setEditableData({
            modelId: modelIdVal,
            serialNumber: serialNumberVal,
            assetTag: assetTagVal
          });
          // The useEffect above will handle validation after setting editableData
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
    setEditableData({ modelId: "", serialNumber: "", assetTag: "" }); // Clear editable data too
    setErrors({}); // Clear errors

    // Simulate scanning phases
    await new Promise(resolve => setTimeout(resolve, 500));
    setScanPhase("detecting");
    
    // Simulate progressive confidence building
    const mockData = generateMockScanData(); // mockData already produces formatted strings
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
    // Format data received from ManualEntry before setting scanData
    // This ensures that scanData.value always holds a consistently formatted string
    const formattedModelId = data.modelId.toUpperCase().replace(/\s/g, '');
    const formattedSerialNumber = data.serialNumber.toUpperCase().replace(/\s/g, '');
    const formattedAssetTag = data.assetTag.toUpperCase().replace(/\s/g, '');

    setScanData({
      modelId: { value: formattedModelId, confidence: 100, status: "captured" },
      serialNumber: { value: formattedSerialNumber, confidence: 100, status: "captured" },
      assetTag: { value: formattedAssetTag, confidence: 100, status: "captured" }
    });
    // editableData and errors will be updated by the useEffect watching scanData
    setShowManualEntry(false);
  };

  const handleSaveAndContinue = async () => {
    if (!session || !positionId || Object.values(errors).some(e => e !== null)) {
      console.warn("Cannot save: Session or position missing, or validation errors exist.");
      return;
    }

    const scanResult = {
      position_id: positionId,
      position_label: getPositionLabel(positionId),
      model_id: editableData.modelId, // editableData should already contain formatted values
      serial_number: editableData.serialNumber,
      asset_tag: editableData.assetTag,
      confidence: 100, // Confidence is 100 as data is confirmed/edited by user
      timestamp: new Date().toISOString(),
      capture_method: "ocr" // Simplified, as manual entry also funnels here
    };

    try {
      // Update or add scan result
      const existingResults = session.scan_results || [];
      const existingIndex = existingResults.findIndex(r => r.position_id === positionId); // Corrected from 'posId' to 'positionId'
      
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

  // --- Validation and Formatting for Editable fields ---
  const validateField = (field, value) => {
    // The 'value' passed into this function is expected to be already formatted
    // (uppercase, no spaces) due to previous processing steps (useEffect, handleManualSave, handleEditableChange).
    switch (field) {
      case "modelId":
        const modelPattern = /^\d{2}[A-Z]{3}\d{4}[A-Z](\/\d{2})?$/;
        return modelPattern.test(value) ? null : "Invalid format (e.g., 43BDL3650Q/00)";
      case "serialNumber":
        const serialPattern = /^[A-Z0-9]{4}\d{10}$/;
        return serialPattern.test(value) ? null : "Invalid format (e.g., FZ4A2434035142)";
      case "assetTag":
        const assetPattern = /^\d{6}$/;
        return assetPattern.test(value) ? null : "Must be 6 digits";
      default:
        return null;
    }
  };

  const validateAllFields = (data) => {
    const newErrors = {};
    // Data passed here (from useEffect) should already be formatted.
    const modelIdError = validateField("modelId", data.modelId);
    if (modelIdError) newErrors.modelId = modelIdError;
    
    const serialNumberError = validateField("serialNumber", data.serialNumber);
    if (serialNumberError) newErrors.serialNumber = serialNumberError;
    
    const assetTagError = validateField("assetTag", data.assetTag);
    if (assetTagError) newErrors.assetTag = assetTagError;

    setErrors(newErrors);
  };

  const handleEditableChange = (field, value) => {
    // This function formats the user input immediately
    const formattedValue = value.toUpperCase().replace(/\s/g, '');
    const newEditableData = { ...editableData, [field]: formattedValue };
    setEditableData(newEditableData);

    const error = validateField(field, formattedValue);
    setErrors(prev => ({...prev, [field]: error}));
  };
  
  const getInputClassName = (field) => {
    const baseClass = "touch-target font-mono";
    if (errors[field]) return `${baseClass} border-amber-500 focus:border-amber-500 focus:ring-amber-500`;
    if (editableData[field]) { // Only apply green if it's not erroneous and has a value
      return `${baseClass} border-green-500 focus:border-green-500 focus:ring-green-500`;
    }
    return baseClass;
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

      {/* Camera View / Results */}
      {!isAllCaptured() ? (
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
      ) : (
        <Card className="mb-6 bg-emerald-50 border-emerald-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-emerald-800">
              <CheckCircle className="w-5 h-5" />
              <span>Data Captured - Confirm or Edit</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div>
              <Label htmlFor="modelId" className="text-sm font-medium text-gray-700">Model ID</Label>
              <Input
                id="modelId"
                value={editableData.modelId}
                onChange={(e) => handleEditableChange("modelId", e.target.value)}
                className={getInputClassName("modelId")}
              />
              {errors.modelId && <p className="text-xs text-amber-700 mt-1">{errors.modelId}</p>}
            </div>
            <div>
              <Label htmlFor="serialNumber" className="text-sm font-medium text-gray-700">Serial Number</Label>
              <Input
                id="serialNumber"
                value={editableData.serialNumber}
                onChange={(e) => handleEditableChange("serialNumber", e.target.value)}
                className={getInputClassName("serialNumber")}
              />
              {errors.serialNumber && <p className="text-xs text-amber-700 mt-1">{errors.serialNumber}</p>}
            </div>
            <div>
              <Label htmlFor="assetTag" className="text-sm font-medium text-gray-700">Asset Tag</Label>
              <Input
                id="assetTag"
                value={editableData.assetTag}
                onChange={(e) => handleEditableChange("assetTag", e.target.value)}
                className={getInputClassName("assetTag")}
              />
              {errors.assetTag && <p className="text-xs text-amber-700 mt-1">{errors.assetTag}</p>}
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
              Enter Manually
            </Button>
          </>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <Button
              size="lg"
              variant="outline"
              className="w-full touch-target"
              onClick={handleScanAll}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Rescan
            </Button>
            <Button
              size="lg"
              className="w-full bg-green-600 hover:bg-green-700 touch-target"
              onClick={handleSaveAndContinue}
              disabled={Object.values(errors).some(e => e !== null)}
            >
              <Save className="w-4 h-4 mr-2" />
              Save & Continue
            </Button>
          </div>
        )}
      </div>

      {/* Manual Entry Modal */}
      {showManualEntry && (
        <ManualEntry
          onSave={handleManualSave}
          onCancel={() => setShowManualEntry(false)}
          initialData={{
            // Pass formatted values to ManualEntry if they exist and are captured
            modelId: scanData.modelId.status === "captured" ? scanData.modelId.value.toUpperCase().replace(/\s/g, '') : '',
            serialNumber: scanData.serialNumber.status === "captured" ? scanData.serialNumber.value.toUpperCase().replace(/\s/g, '') : '',
            assetTag: scanData.assetTag.status === "captured" ? scanData.assetTag.value.toUpperCase().replace(/\s/g, '') : ''
          }}
        />
      )}
    </div>
  );
}

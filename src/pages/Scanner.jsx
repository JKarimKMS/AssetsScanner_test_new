
import React, { useState, useEffect } from "react";
import { Session } from "@/api/entities";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft,
  Camera,
  CheckCircle,
  Flashlight,
  Save,
  RefreshCw,
  AlertCircle,
  Check,
  ChevronDown,
  ChevronRight,
  FileText,
  Loader2, // New import for loading spinner
  Image as ImageIcon, // Renamed from ImageIcon to Image as ImageIcon
  WifiOff // New import for offline indicator
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast"; // New import
import { EQUIPMENT_VALIDATORS, validateAllFields } from "../components/utils/validation"; // New import

import CaptureZone from "../components/scanner/CaptureZone";
import ManualEntry from "../components/scanner/ManualEntry";
import PhotoPreviewModal from "../components/scanner/PhotoPreviewModal"; // New import
import ConfirmationDialog from "../components/common/ConfirmationDialog";

export default function Scanner() {
  const navigate = useNavigate();
  const { toast } = useToast(); // Initialize useToast
  const [session, setSession] = useState(null);
  const [positionId, setPositionId] = useState(null);
  const [positionLabel, setPositionLabel] = useState("");
  const [loading, setLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [scanPhase, setScanPhase] = useState("idle");
  const [scanData, setScanData] = useState({
    modelId: { value: "", confidence: 0, status: "idle" },
    serialNumber: { value: "", confidence: 0, status: "idle" },
    assetTag: { value: "", confidence: 0, status: "idle" }
  });
  const [photo, setPhoto] = useState(null); // State for single photo object
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine); // State to track online status

  // State for editing captured data
  const [editableData, setEditableData] = useState({ modelId: "", serialNumber: "", assetTag: "" });
  const [errors, setErrors] = useState({});
  const [isDataCaptured, setIsDataCaptured] = useState(false); // New state to track if data fields are captured

  // Notes state
  const [notes, setNotes] = useState("");
  const [notesExpanded, setNotesExpanded] = useState(false);
  const [isRescanDialogOpen, setIsRescanDialogOpen] = useState(false);

  // Photo modal state
  const [showPhotoPreview, setShowPhotoPreview] = useState(false); // New state for photo preview modal

  useEffect(() => {
    loadSession();

    // Monitor connection status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Helper to determine if ready to save (all data captured, photo exists, no errors)
  const isReadyToSave = () => {
    return isDataCaptured && photo && photo.url && Object.keys(errors).length === 0; // Updated condition
  };

  // Effect to run when scanData changes and all fields are 'captured'
  useEffect(() => {
    const dataIsCaptured =
      scanData.modelId.status === "captured" &&
      scanData.serialNumber.status === "captured" &&
      scanData.assetTag.status === "captured";

    if (dataIsCaptured) {
      // Ensure data is formatted before setting editableData and validating
      const formattedModelId = scanData.modelId.value.toUpperCase().replace(/\s/g, '');
      const formattedSerialNumber = scanData.serialNumber.value.toUpperCase().replace(/\s/g, '');
      const formattedAssetTag = scanData.assetTag.value.toUpperCase().replace(/\s/g, '');

      const newData = {
        modelId: formattedModelId,
        serialNumber: formattedSerialNumber,
        assetTag: formattedAssetTag,
      };
      setEditableData(newData);
      validateAndSetAllFields(newData); // Using the new validation function
      setIsDataCaptured(true); // Set data captured state
    } else {
      setIsDataCaptured(false); // Reset if data is no longer fully captured
    }
  }, [scanData]);


  const loadSession = async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const sessionId = urlParams.get("sessionId");
      const posId = urlParams.get("positionId");
      const posLabel = urlParams.get("positionLabel");

      if (sessionId && posId) {
        const sessionData = await Session.filter({ id: sessionId });
        const currentSession = sessionData[0];
        setSession(currentSession);
        setPositionId(posId);
        setPositionLabel(posLabel ? decodeURIComponent(posLabel) : `Position ${posId}`);

        const existingResult = currentSession.scan_results?.find(r => r.position_id === posId);
        if (existingResult) {
          // Format existing data when loading from session to ensure consistency
          const modelIdVal = (existingResult.model_id || "").toUpperCase().replace(/\s/g, '');
          const serialNumberVal = (existingResult.serial_number || "").toUpperCase().replace(/\s/g, '');
          const assetTagVal = (existingResult.asset_tag || "").toUpperCase().replace(/\s/g, '');

          // Set scan data to trigger useEffect which then updates editableData and validates
          setScanData({
            modelId: { value: modelIdVal, confidence: 100, status: "captured" },
            serialNumber: { value: serialNumberVal, confidence: 100, status: "captured" },
            assetTag: { value: assetTagVal, confidence: 100, status: "captured" }
          });

          // Load existing photo
          if (existingResult.photo_url) {
            setPhoto({
              url: existingResult.photo_url,
              captured_at: existingResult.photo_captured_at,
              method: existingResult.photo_method,
            });
          }

          // Load existing notes
          if (existingResult.notes) {
            setNotes(existingResult.notes);
            if (existingResult.notes.trim()) {
              setNotesExpanded(true);
            }
          }
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

  // New function to reset all states for a new scan
  const resetAll = () => {
    setIsDataCaptured(false);
    setPhoto(null); // Clear any existing photo
    setEditableData({ modelId: "", serialNumber: "", assetTag: "" });
    setScanData({
      modelId: { value: "", confidence: 0, status: "idle" },
      serialNumber: { value: "", confidence: 0, status: "idle" },
      assetTag: { value: "", confidence: 0, status: "idle" }
    });
    setErrors({});
    setNotes("");
    setNotesExpanded(false);
  };

  const handleScanAll = async () => {
    setIsScanning(true);
    setScanPhase("initializing");

    resetAll(); // Reset all relevant states before starting a new scan

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
        // Simulate photo capture at the end of the scan
        setPhoto({
          url: `https://placehold.co/600x400/grey/white?text=Scanned+Image\\n${new Date().toLocaleTimeString()}`,
          captured_at: new Date().toISOString(),
          method: 'scan' // Indicate photo was captured during scan
        });
        setScanPhase("completed");
        setIsScanning(false);
      }
    }, 100);
  };

  const startRescan = () => {
    setIsRescanDialogOpen(false);
    handleScanAll();
  }

  const handleManualSave = async (data) => {
    // Format data received from ManualEntry before setting scanData
    const formattedModelId = data.modelId.toUpperCase().replace(/\s/g, '');
    const formattedSerialNumber = data.serialNumber.toUpperCase().replace(/\s/g, '');
    const formattedAssetTag = data.assetTag.toUpperCase().replace(/\s/g, '');

    setScanData({
      modelId: { value: formattedModelId, confidence: 100, status: "captured" },
      serialNumber: { value: formattedSerialNumber, confidence: 100, status: "captured" },
      assetTag: { value: formattedAssetTag, confidence: 100, status: "captured" }
    });
    setPhoto(null); // Manual entry means previous photo (if any) is invalid, require new photo
    setShowManualEntry(false);
    toast({
      title: "Data Entered",
      description: "Manual data has been recorded. Please take a photo to continue.",
      variant: "success",
    });
  };

  // New function to handle taking a photo
  const handleTakePhoto = async (method = 'manual') => {
    setPhoto({ url: null }); // Set photo to null to show loading indicator
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate photo capture delay
    setPhoto({
      url: `https://placehold.co/600x400/grey/white?text=New+Photo\\n${new Date().toLocaleTimeString()}`,
      captured_at: new Date().toISOString(),
      method: method // 'manual' or 'retake'
    });
    toast({
      title: "Photo Captured",
      description: "Photo documentation has been saved successfully.",
      variant: "success",
    });
  };

  const handleSaveAndContinue = async () => {
    if (!isReadyToSave()) {
      toast({
        title: "Incomplete Data",
        description: "Please ensure all data fields are valid and a photo is captured for documentation.",
        variant: "destructive",
      });
      return;
    }

    const scanResult = {
      position_id: positionId,
      position_label: positionLabel,
      model_id: editableData.modelId, // editableData should already contain formatted values
      serial_number: editableData.serialNumber,
      asset_tag: editableData.assetTag,
      notes: notes.trim(), // Add notes to the scan result
      confidence: 100, // Confidence is 100 as data is confirmed/edited by user
      timestamp: new Date().toISOString(),
      capture_method: scanData.capture_method || "ocr", // Use capture_method from scanData, or default to ocr
      photo_url: photo.url, // Save the single photo URL
      photo_captured_at: photo.captured_at,
      photo_method: photo.method,
      synced: isOnline // Track sync status
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

      if (!isOnline) {
        // Store locally when offline
        localStorage.setItem(`session_${session.id}`, JSON.stringify({
          ...session,
          scan_results: existingResults
        }));

        // Track pending changes (simple increment, could be more sophisticated)
        const pendingChanges = parseInt(localStorage.getItem('pendingChanges') || '0') + 1;
        localStorage.setItem('pendingChanges', pendingChanges.toString());
      } else {
        await Session.update(session.id, { scan_results: existingResults });
      }

      toast({
        title: "Scan Saved!",
        description: `Data for ${positionLabel} has been saved.`,
        variant: "success",
      });

      navigate(createPageUrl("Progress", `sessionId=${session.id}`));
    } catch (error) {
      console.error("Error saving scan result:", error);
      toast({
        title: "Save Failed",
        description: "There was an error saving the scan result. Please try again.",
        variant: "destructive",
      });
    }
  };

  // --- Validation and Formatting for Editable fields ---
  // New function to validate all fields using imported utility
  const validateAndSetAllFields = (data) => {
    const { errors: newErrors, isValid } = validateAllFields(data, EQUIPMENT_VALIDATORS);
    setErrors(newErrors);
    return isValid;
  };

  // Updated handleEditableChange to use imported validators directly
  const handleEditableChange = (field, value) => {
    // This function no longer formats the value, assumes validators handle it or data is already formatted.
    const newEditableData = { ...editableData, [field]: value };
    setEditableData(newEditableData);

    const individualValidator = EQUIPMENT_VALIDATORS[field];
    if (individualValidator) {
      const error = individualValidator(value); // Validator will format/validate the input
      setErrors(prev => ({ ...prev, [field]: error }));
    }
  };

  const getInputClassName = (field) => {
    const baseClass = "touch-target font-mono";
    if (errors[field]) return `${baseClass} border-amber-500 focus:border-amber-500 focus:ring-amber-500`;
    if (editableData[field] && !errors[field]) { // Only apply green if it's not erroneous and has a value
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Offline Mode Banner */}
      {!isOnline && (
        <Alert className="mb-6 border-amber-200 bg-amber-50">
          <WifiOff className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            <strong>Offline Mode:</strong> Your data will be saved locally and synced when connection is restored.
          </AlertDescription>
        </Alert>
      )}

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
            <h2 className="text-xl font-bold text-gray-900">{positionLabel}</h2>
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

      {/* Compliance Reminder */}
      <Alert className="mb-6 border-blue-200 bg-blue-50">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          📸 All installations must be photographed for compliance
        </AlertDescription>
      </Alert>

      {/* Main Content Area */}
      {!isDataCaptured ? (
        // Initial Scanning View
        <>
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
                        {scanPhase === "completed" && "Completed!"}
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
          <div className="space-y-4">
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
          </div>
        </>
      ) : (
        // Data and Photo Review View
        <div className="space-y-6">
          <Card className="bg-emerald-50 border-emerald-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-emerald-800">
                <CheckCircle className="w-5 h-5" />
                <span>Review Captured Data</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Photo Section */}
                <div className="space-y-3">
                  <Label>Photo Documentation</Label>
                  {photo && photo.url ? (
                    <div className="space-y-3">
                      <div className="relative">
                        <img
                          src={photo.url}
                          alt="Captured equipment"
                          className="w-full aspect-video object-cover rounded-lg border cursor-pointer"
                          onClick={() => setShowPhotoPreview(true)}
                        />
                        <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-green-400" /> Photo captured
                        </div>
                      </div>
                      <Button variant="outline" className="w-full" onClick={() => handleTakePhoto('retake')}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Retake Photo
                      </Button>
                    </div>
                  ) : photo && !photo.url ? (
                    // Loading state for photo
                    <div className="w-full aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                      <Loader2 className="w-8 h-8 text-gray-500 animate-spin" />
                    </div>
                  ) : (
                    // No photo yet, prompt to take one
                    <div className="space-y-3">
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>Photo required for documentation.</AlertDescription>
                      </Alert>
                      <Button className="w-full" onClick={() => handleTakePhoto('manual')}>
                        <Camera className="w-4 h-4 mr-2" />
                        Take Photo
                      </Button>
                    </div>
                  )}
                </div>

                {/* Data Fields Section */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="modelId" className="text-sm font-medium text-gray-700">Model ID</Label>
                    <Input id="modelId" value={editableData.modelId} onChange={(e) => handleEditableChange("modelId", e.target.value)} className={getInputClassName("modelId")} />
                    {errors.modelId && <p className="text-xs text-amber-700 mt-1">{errors.modelId}</p>}
                  </div>
                  <div>
                    <Label htmlFor="serialNumber" className="text-sm font-medium text-gray-700">Serial Number</Label>
                    <Input id="serialNumber" value={editableData.serialNumber} onChange={(e) => handleEditableChange("serialNumber", e.target.value)} className={getInputClassName("serialNumber")} />
                    {errors.serialNumber && <p className="text-xs text-amber-700 mt-1">{errors.serialNumber}</p>}
                  </div>
                  <div>
                    <Label htmlFor="assetTag" className="text-sm font-medium text-gray-700">Asset Tag</Label>
                    <Input id="assetTag" value={editableData.assetTag} onChange={(e) => handleEditableChange("assetTag", e.target.value)} className={getInputClassName("assetTag")} />
                    {errors.assetTag && <p className="text-xs text-amber-700 mt-1">{errors.assetTag}</p>}
                  </div>
                </div>
              </div>

              {/* Notes Section */}
              <div className="mt-6">
                <Collapsible open={notesExpanded} onOpenChange={setNotesExpanded}>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">Notes</span>
                        {notes.trim() && <span className="text-xs text-gray-500">(has content)</span>}
                      </div>
                      {notesExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-2 mt-2">
                    <Textarea
                      placeholder="Add any additional notes about this equipment..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="min-h-[80px] text-sm"
                    />
                    <p className="text-xs text-gray-500">Optional notes will be included in the export</p>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            </CardContent>
          </Card>

          {/* Controls */}
          <div className="grid grid-cols-2 gap-4">
            <Button
              size="lg"
              variant="outline"
              className="w-full touch-target"
              onClick={() => setIsRescanDialogOpen(true)}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Rescan All
            </Button>
            <Button
              size="lg"
              className="w-full bg-green-600 hover:bg-green-700 touch-target"
              onClick={handleSaveAndContinue}
              disabled={!isReadyToSave()} // Disable if data is not captured, photo not taken, or errors exist
            >
              <Save className="w-4 h-4 mr-2" />
              Save & Continue
            </Button>
          </div>
        </div>
      )}

      {/* Manual Entry Modal */}
      {showManualEntry && (
        <ManualEntry
          onSave={handleManualSave}
          onCancel={() => setShowManualEntry(false)}
          initialData={{
            // Pass current editable data to manual entry
            modelId: editableData.modelId,
            serialNumber: editableData.serialNumber,
            assetTag: editableData.assetTag
          }}
        />
      )}

      {/* Photo Preview Modal */}
      {showPhotoPreview && (
        <PhotoPreviewModal photoUrl={photo?.url} onClose={() => setShowPhotoPreview(false)} />
      )}

      <ConfirmationDialog
        isOpen={isRescanDialogOpen}
        onClose={() => setIsRescanDialogOpen(false)}
        onConfirm={startRescan}
        title="Rescan All Fields?"
        description="This will discard any manually entered data and start a new scan. Are you sure?"
        confirmText="Yes, Rescan"
        variant="destructive"
      />
    </div>
  );
}


import React, { useState, useEffect } from "react";
import { Session } from "@/api/entities";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  CheckCircle, 
  Circle, 
  Monitor, 
  Clock, 
  Grid3x3, 
  List,
  FileText,
  AlertCircle
} from "lucide-react";
import { format } from "date-fns";
import ScanConfirmationDialog from "../components/progress/ScanConfirmationDialog";

export default function ProgressPage() {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("grid");
  const [selectedPosition, setSelectedPosition] = useState(null);

  const mockPositions = [
    { id: "p1", label: "Top-1", row: 0, column: 0 },
    { id: "p2", label: "Top-2", row: 0, column: 1 },
    { id: "p3", label: "Top-3", row: 0, column: 2 },
    { id: "p4", label: "Top-4", row: 0, column: 3 },
    { id: "p5", label: "Top-5", row: 0, column: 4 },
    { id: "p6", label: "Bottom-Center", row: 1, column: 2 }
  ];

  useEffect(() => {
    loadSession();
  }, []);

  const loadSession = async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const sessionId = urlParams.get("sessionId");
      
      if (sessionId) {
        const sessionData = await Session.filter({ id: sessionId });
        setSession(sessionData[0]);
      }
    } catch (error) {
      console.error("Error loading session:", error);
    } finally {
      setLoading(false);
    }
  };

  const getProgress = () => {
    if (!session) return { completed: 0, total: 0, percentage: 0 };
    
    const total = mockPositions.length;
    const completed = session.scan_results?.filter(r => r.model_id && r.serial_number && r.asset_tag).length || 0;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { completed, total, percentage };
  };

  const handlePositionSelect = (position) => {
    setSelectedPosition(position);
  };

  const handleConfirmScan = () => {
    if (selectedPosition) {
      navigate(createPageUrl("Scanner", `sessionId=${session.id}&positionId=${selectedPosition.id}`));
    }
  };

  const handleCancelScan = () => {
    setSelectedPosition(null);
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

  const { completed, total, percentage } = getProgress();

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
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

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
          <h2 className="text-2xl font-bold text-gray-900">Progress ({percentage}%)</h2>
          <p className="text-gray-600">{session.site_name} • {session.config_name}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{session.site_name}</h3>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Monitor className="w-4 h-4" />
                  <span>{session.config_name}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{format(new Date(session.start_time), "HH:mm")}</span>
                </div>
              </div>
            </div>
            <Badge variant="outline" className="text-base px-3 py-1">
              {session.site_code}
            </Badge>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Completion Progress</span>
              <span className="font-medium">{completed} of {total} positions</span>
            </div>
            <Progress value={percentage} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* View Toggle */}
      <Tabs value={view} onValueChange={setView} className="mb-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="grid" className="flex items-center space-x-2">
            <Grid3x3 className="w-4 h-4" />
            <span>Grid View</span>
          </TabsTrigger>
          <TabsTrigger value="list" className="flex items-center space-x-2">
            <List className="w-4 h-4" />
            <span>List View</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="grid" className="space-y-6">
          <GantryView 
            session={session} 
            mockPositions={mockPositions} 
            onPositionSelect={handlePositionSelect} 
            selectedPositionId={selectedPosition?.id} 
          />
        </TabsContent>

        <TabsContent value="list" className="space-y-6">
          <ListView 
            session={session} 
            mockPositions={mockPositions} 
            onPositionSelect={handlePositionSelect} 
            selectedPositionId={selectedPosition?.id} 
          />
        </TabsContent>
      </Tabs>

      {/* Complete Button */}
      {percentage === 100 && (
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
        onConfirm={handleConfirmScan}
        onCancel={handleCancelScan}
      />
    </div>
  );
}

function GantryView({ session, mockPositions, onPositionSelect, selectedPositionId }) {
  const getScanResult = (positionId) => {
    return session.scan_results?.find(r => r.position_id === positionId);
  };

  const getPositionStatus = (positionId) => {
    const result = getScanResult(positionId);
    if (result && result.model_id && result.serial_number && result.asset_tag) {
      return "completed";
    }
    return "pending";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Monitor className="w-5 h-5" />
          <span>Gantry Layout</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <div className="space-y-8 sm:space-y-12">
          {/* Top Row - 5 screens */}
          <div className="flex justify-center space-x-2 sm:space-x-4 md:space-x-6 overflow-x-auto">
            <div className="flex space-x-2 sm:space-x-4 md:space-x-6 min-w-max px-2">
              {mockPositions.slice(0, 5).map((position) => (
                <GantryPosition
                  key={position.id}
                  position={position}
                  status={getPositionStatus(position.id)}
                  onClick={() => onPositionSelect(position)}
                  isSelected={selectedPositionId === position.id}
                />
              ))}
            </div>
          </div>
          
          {/* Bottom Row - 1 screen centered */}
          <div className="flex justify-center">
            <GantryPosition
              position={mockPositions[5]}
              status={getPositionStatus(mockPositions[5].id)}
              onClick={() => onPositionSelect(mockPositions[5])}
              isSelected={selectedPositionId === mockPositions[5].id}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function GantryPosition({ position, status, onClick, isSelected }) {
  const getStatusColor = () => {
    switch (status) {
      case "completed": return "bg-green-100 border-green-500 text-green-700";
      case "current": return "bg-yellow-100 border-yellow-500 text-yellow-700 scan-pulse";
      default: return "bg-gray-50 border-gray-300 text-gray-600 border-dashed";
    }
  };

  return (
    <div className="flex flex-col items-center space-y-2 flex-shrink-0">
      <button
        onClick={onClick}
        className={`relative w-12 h-8 sm:w-14 sm:h-9 md:w-16 md:h-10 rounded-md border-2 transition-all duration-200 hover:scale-105 active:scale-95 ${getStatusColor()} ${isSelected ? 'ring-2 ring-emerald-500 ring-offset-2' : ''}`}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          {status === "completed" ? (
            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
          ) : (
            <Circle className="w-4 h-4 sm:w-5 sm:h-5" />
          )}
        </div>
      </button>
      <div className="text-xs font-medium text-gray-700 text-center whitespace-nowrap">
        {position.label}
      </div>
    </div>
  );
}

function ListView({ session, mockPositions, onPositionSelect, selectedPositionId }) {
  const getScanResult = (positionId) => {
    return session.scan_results?.find(r => r.position_id === positionId);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <List className="w-5 h-5" />
          <span>Position List</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {mockPositions.map((position) => {
            const scanResult = getScanResult(position.id);
            const isCompleted = scanResult && scanResult.model_id && scanResult.serial_number && scanResult.asset_tag;
            
            return (
              <div
                key={position.id}
                className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${selectedPositionId === position.id ? 'bg-emerald-50' : ''}`}
                onClick={() => onPositionSelect(position)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isCompleted ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"
                    }`}>
                      {isCompleted ? <CheckCircle className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{position.label}</h4>
                      <p className="text-sm text-gray-500">
                        {isCompleted ? "Scanned" : "Not scanned"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {isCompleted ? (
                      <div className="text-sm text-gray-600">
                        <p>{scanResult.model_id}</p>
                        <p className="text-xs">{format(new Date(scanResult.timestamp), "HH:mm")}</p>
                      </div>
                    ) : (
                      <Button variant="outline" size="sm">
                        Scan
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

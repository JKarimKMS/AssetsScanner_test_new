
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  Trophy, 
  Users, 
  Monitor, 
  Gamepad2, 
  Building,
  Search,
  Filter,
  CheckCircle,
  Circle,
  ChevronDown,
  ChevronRight,
  Camera,
  CloudOff,
  MousePointerClick, // Changed from Touch to MousePointerClick
  Tv,
  Eye
} from "lucide-react";

const zoneIcons = {
  sportsZone: Trophy,
  oppositeGantry: Users,
  offGantry: Monitor,
  fobtZone: Gamepad2,
  counterArea: Building
};

const zoneColors = {
  sportsZone: "text-green-600",
  oppositeGantry: "text-blue-600", 
  offGantry: "text-purple-600",
  fobtZone: "text-orange-600",
  counterArea: "text-gray-600"
};

const zoneNames = {
  sportsZone: "Sports Zone",
  oppositeGantry: "Customer Area (Opposite Gantry)",
  offGantry: "Off-Gantry Equipment",
  fobtZone: "FOBT Zone",
  counterArea: "Counter Area"
};

const ScreenCard = React.memo(function ScreenCard({ screen, scanResult, onScreenSelect, isSelected }) {
  const isCompleted = scanResult && scanResult.model_id && scanResult.serial_number && scanResult.asset_tag;
  const hasPhoto = isCompleted && scanResult.photo_url;
  
  const getScreenIcon = (screenLabel) => {
    const label = screenLabel.toLowerCase();
    if (label.includes('touch')) return MousePointerClick; // Changed from Touch to MousePointerClick
    if (label.includes('multiviewer')) return Eye;
    if (label.includes('tv') || label.includes('screen')) return Tv;
    return Monitor;
  };

  const ScreenIcon = getScreenIcon(screen.label);

  return (
    <Card 
      className={`cursor-pointer transition-all duration-200 hover:shadow-md active:scale-95 ${
        isSelected ? 'ring-2 ring-emerald-500 bg-emerald-50' : 'hover:bg-gray-50'
      }`}
      onClick={() => onScreenSelect(screen)}
    >
      <CardContent className="p-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-2 min-w-0 flex-1">
            <div className="flex-shrink-0 mt-0.5">
              {isCompleted ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <Circle className="w-4 h-4 text-gray-400" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-medium text-sm text-gray-900 truncate">{screen.label}</h4>
              <div className="flex items-center space-x-1 mt-1">
                <ScreenIcon className="w-3 h-3 text-gray-500" />
                <span className="text-xs text-gray-500">{screen.type || 'Display'}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-1 ml-2">
            {isCompleted && (
              <Camera className={`w-3 h-3 ${hasPhoto ? 'text-green-600' : 'text-red-500'}`} />
            )}
            {scanResult && !scanResult.synced && (
              <CloudOff className="w-3 h-3 text-amber-500" />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

function ZoneSection({ zone, screens, scanResults, onScreenSelect, selectedScreenId, isExpanded, onToggle }) {
  const ZoneIcon = zoneIcons[zone] || Monitor;
  const zoneColor = zoneColors[zone] || "text-gray-600";
  const zoneName = zoneNames[zone] || zone;
  
  const completedCount = screens.filter(screen => {
    const result = scanResults.find(r => r.position_id === screen.id);
    return result && result.model_id && result.serial_number && result.asset_tag;
  }).length;

  return (
    <Collapsible open={isExpanded} onOpenChange={onToggle}>
      <CollapsibleTrigger asChild>
        <div className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <ZoneIcon className={`w-5 h-5 ${zoneColor}`} />
              <h3 className="font-semibold text-gray-900">{zoneName}</h3>
              <Badge variant="outline" className="text-xs">
                {completedCount} / {screens.length}
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <div className="text-sm text-gray-500">
                {isExpanded ? 'Collapse' : 'Expand'}
              </div>
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-500" />
              )}
            </div>
          </div>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {screens.map(screen => {
            const scanResult = scanResults.find(r => r.position_id === screen.id);
            return (
              <ScreenCard 
                key={screen.id}
                screen={screen}
                scanResult={scanResult}
                onScreenSelect={onScreenSelect}
                isSelected={selectedScreenId === screen.id}
              />
            );
          })}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export default function AdditionalScreensList({ 
  positions, 
  scanResults, 
  onScreenSelect, 
  selectedScreenId 
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLocation, setFilterLocation] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [expandedZones, setExpandedZones] = useState({
    sportsZone: true,
    oppositeGantry: true,
    offGantry: true,
    fobtZone: true,
    counterArea: true
  });

  // Group positions by zone
  const groupedPositions = positions.reduce((acc, position) => {
    const zone = position.zone || 'other';
    if (!acc[zone]) {
      acc[zone] = [];
    }
    acc[zone].push(position);
    return acc;
  }, {});

  // Apply filters
  const filteredGroups = Object.entries(groupedPositions).reduce((acc, [zone, screens]) => {
    let filteredScreens = screens;
    
    // Apply search filter
    if (searchTerm) {
      filteredScreens = filteredScreens.filter(screen =>
        screen.label.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply location filter
    if (filterLocation !== "all" && zone !== filterLocation) {
      return acc;
    }
    
    // Apply status filter
    if (filterStatus !== "all") {
      filteredScreens = filteredScreens.filter(screen => {
        const result = scanResults.find(r => r.position_id === screen.id);
        const isCompleted = result && result.model_id && result.serial_number && result.asset_tag;
        return filterStatus === "completed" ? isCompleted : !isCompleted;
      });
    }
    
    if (filteredScreens.length > 0) {
      acc[zone] = filteredScreens;
    }
    
    return acc;
  }, {});

  const toggleZone = (zone) => {
    setExpandedZones(prev => ({
      ...prev,
      [zone]: !prev[zone]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search screens..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Select value={filterLocation} onValueChange={setFilterLocation}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Zones</SelectItem>
                  <SelectItem value="sportsZone">Sports Zone</SelectItem>
                  <SelectItem value="oppositeGantry">Customer Area</SelectItem>
                  <SelectItem value="offGantry">Off-Gantry</SelectItem>
                  <SelectItem value="fobtZone">FOBT Zone</SelectItem>
                  <SelectItem value="counterArea">Counter Area</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Zone Sections */}
      <div className="space-y-4">
        {Object.entries(filteredGroups).map(([zone, screens]) => (
          <ZoneSection
            key={zone}
            zone={zone}
            screens={screens}
            scanResults={scanResults}
            onScreenSelect={onScreenSelect}
            selectedScreenId={selectedScreenId}
            isExpanded={expandedZones[zone]}
            onToggle={() => toggleZone(zone)}
          />
        ))}
      </div>

      {Object.keys(filteredGroups).length === 0 && (
        <Card className="p-8 text-center">
          <Filter className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-800">No screens found</h3>
          <p className="text-gray-500 mt-2">Try adjusting your search or filters</p>
        </Card>
      )}
    </div>
  );
}

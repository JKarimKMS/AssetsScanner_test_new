import React, { useState, useEffect } from "react";
import { Site, Session } from "@/api/entities";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Monitor, Clock, Grid3x3, Layers, View } from "lucide-react";

export default function Configuration() {
  const navigate = useNavigate();
  const [site, setSite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedConfig, setSelectedConfig] = useState(null);

  useEffect(() => {
    loadSite();
  }, []);

  const loadSite = async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const siteId = urlParams.get("siteId");
      
      if (siteId) {
        const siteData = await Site.filter({ id: siteId });
        setSite(siteData[0]);
      }
    } catch (error) {
      console.error("Error loading site:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfigurationSelect = async (config) => {
    setSelectedConfig(config);
    
    // Create flat position list from gantry layout and additional screens
    const gantryPositions = [
      ...(config.gantry_layout?.topRow || []),
      ...(config.gantry_layout?.bottomRow || [])
    ];
    
    const additionalPositions = [];
    if (config.additional_screens) {
      Object.entries(config.additional_screens).forEach(([zone, screens]) => {
        screens.forEach((screenName, index) => {
          additionalPositions.push({
            id: `${zone}-${index}`,
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
    
    const sessionData = {
      site_id: site.id,
      site_name: site.name,
      site_code: site.code,
      config_id: config.id,
      config_name: config.name,
      start_time: new Date().toISOString(),
      status: "active",
      scan_results: [],
      layout: allPositions // Store the complete layout for progress tracking
    };

    try {
      const session = await Session.create(sessionData);
      navigate(createPageUrl("Progress", `sessionId=${session.id}`));
    } catch (error) {
      console.error("Error creating session:", error);
    }
  };

  const getPositionTypeColor = (type) => {
    switch (type) {
      case "avr": return "bg-blue-100 border-blue-300 text-blue-700";
      case "sky": return "bg-green-100 border-green-300 text-green-700";
      case "quad": return "bg-purple-100 border-purple-300 text-purple-700";
      case "single": return "bg-gray-100 border-gray-300 text-gray-700";
      default: return "bg-gray-100 border-gray-300 text-gray-700";
    }
  };

  const renderPositionElement = (position, isCompact = false) => {
    const sizeClass = isCompact ? "w-12 h-8" : "w-16 h-10";
    const textClass = isCompact ? "text-xs" : "text-sm";
    
    if (position.type === "quad") {
      return (
        <div key={position.id} className={`${sizeClass} ${getPositionTypeColor(position.type)} border rounded relative flex items-center justify-center ${textClass} font-medium`}>
          <div className="grid grid-cols-2 gap-0.5 w-full h-full p-0.5">
            <div className="bg-white bg-opacity-50 rounded-sm flex items-center justify-center text-xs">A</div>
            <div className="bg-white bg-opacity-50 rounded-sm flex items-center justify-center text-xs">B</div>
            <div className="bg-white bg-opacity-50 rounded-sm flex items-center justify-center text-xs">C</div>
            <div className="bg-white bg-opacity-50 rounded-sm flex items-center justify-center text-xs">D</div>
          </div>
          <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 text-xs text-gray-600 whitespace-nowrap">
            {position.label}
          </div>
        </div>
      );
    }

    return (
      <div key={position.id} className={`${sizeClass} ${getPositionTypeColor(position.type)} border rounded flex items-center justify-center ${textClass} font-medium relative`}>
        <span className="truncate px-1">{position.label.replace(/^(CTV|LTV|BTV) /, "").replace(/^SKY /, "S")}</span>
        <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 text-xs text-gray-600 whitespace-nowrap">
          {position.label}
        </div>
      </div>
    );
  };

  const renderLayoutPreview = (config) => {
    const { gantry_layout } = config;
    const topRow = gantry_layout?.topRow || [];
    const bottomRow = gantry_layout?.bottomRow || [];
    
    // Determine grid columns based on the maximum row length
    const maxColumns = Math.max(topRow.length, bottomRow.length);
    const gridCols = maxColumns <= 4 ? "grid-cols-4" : maxColumns <= 5 ? "grid-cols-5" : "grid-cols-6";

    return (
      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
        <div className="space-y-4">
          {/* Top Row */}
          {topRow.length > 0 && (
            <div>
              <div className="text-xs text-center text-gray-500 mb-2">Top Row</div>
              <div className={`grid ${gridCols} gap-2 justify-items-center`}>
                {topRow.map((position) => renderPositionElement(position, true))}
              </div>
            </div>
          )}
          
          {/* Bottom Row */}
          {bottomRow.length > 0 && (
            <div>
              <div className="text-xs text-center text-gray-500 mb-2 mt-4">Bottom Row</div>
              <div className={`grid ${gridCols} gap-2 justify-items-center`}>
                {/* Create empty placeholders for proper alignment */}
                {Array.from({ length: maxColumns }, (_, index) => {
                  const position = bottomRow.find(p => p.column === index);
                  return position ? 
                    renderPositionElement(position, true) : 
                    <div key={`empty-${index}`} className="w-12 h-8"></div>;
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const getBrandColor = (brand) => {
    switch (brand) {
      case "Ladbrokes": return "bg-red-100 text-red-800";
      case "Coral": return "bg-blue-100 text-blue-800";
      case "Betfred": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getBrandBorder = (brand) => {
    switch (brand) {
      case "Ladbrokes": return "border-l-red-500";
      case "Coral": return "border-l-blue-500";
      case "Betfred": return "border-l-green-500";
      default: return "border-l-gray-500";
    }
  };

  const getGantryPositionCount = (config) => {
    const topCount = config.gantry_layout?.topRow?.length || 0;
    const bottomCount = config.gantry_layout?.bottomRow?.length || 0;
    return topCount + bottomCount;
  };

  const getAdditionalPositionCount = (config) => {
    if (!config.additional_screens) return 0;
    return Object.values(config.additional_screens).reduce((total, screens) => total + screens.length, 0);
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-80 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!site) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="text-center">
          <p className="text-gray-500">Site not found</p>
          <Button onClick={() => navigate(createPageUrl("SiteSelection"))}>
            Back to Site Selection
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(createPageUrl("SiteSelection"))}
          className="touch-target"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{site.name}</h2>
          <p className="text-gray-600">{site.code} • Select Configuration</p>
        </div>
      </div>

      {/* Site Info Card */}
      <Card className={`mb-6 border-l-4 ${getBrandBorder(site.brand)}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="font-semibold text-gray-900">{site.name}</h3>
                <Badge variant="outline">{site.code}</Badge>
                <Badge className={getBrandColor(site.brand)}>
                  {site.brand}
                </Badge>
              </div>
              <p className="text-sm text-gray-600">{site.address}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuration Selection */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Configurations</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {site.configurations?.map((config) => {
            const gantryCount = getGantryPositionCount(config);
            const additionalCount = getAdditionalPositionCount(config);
            
            return (
              <Card
                key={config.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg active:scale-98 ${
                  selectedConfig?.id === config.id ? "ring-2 ring-emerald-500" : ""
                }`}
                onClick={() => handleConfigurationSelect(config)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge className={getBrandColor(site.brand)}>{site.brand}</Badge>
                    <Badge variant="outline">{config.total_positions} positions</Badge>
                  </div>
                  <CardTitle className="text-lg">{config.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Visual Layout Preview */}
                  {renderLayoutPreview(config)}
                  
                  {/* Screen Count Summary */}
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex justify-between">
                      <span>Gantry Screens:</span>
                      <span className="font-semibold">{gantryCount} positions</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Additional Screens:</span>
                      <span className="font-semibold">{additionalCount} positions</span>
                    </div>
                    <div className="flex justify-between text-base font-semibold pt-2 border-t">
                      <span>Total:</span>
                      <span>{config.total_positions} positions</span>
                    </div>
                  </div>
                  
                  {/* Time Estimate */}
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2 text-amber-600" />
                      <span className="text-amber-800">
                        Estimated time: {config.estimated_minutes} minutes
                      </span>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full bg-emerald-600 hover:bg-emerald-700 mt-4"
                    disabled={selectedConfig?.id === config.id}
                  >
                    {selectedConfig?.id === config.id ? "Starting..." : "Start Session"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
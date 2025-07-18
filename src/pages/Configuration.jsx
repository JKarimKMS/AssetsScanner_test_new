
import React, { useState, useEffect } from "react";
import { Site, Session } from "@/api/entities";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Monitor, Clock, Grid3x3, Layers, View, Tv, Smartphone, FileText } from "lucide-react";

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
        const currentSite = siteData[0];
        
        // If site doesn't have proper configurations, generate them
        if (!currentSite.configurations || currentSite.configurations.length === 0 || !currentSite.configurations[0].gantry_layout) {
          const configs = ["4 over 4", "5 over 5", "5 over 1", "5 straight", "6 over 6"];
          const randomConfig = configs[Math.floor(Math.random() * configs.length)];
          currentSite.configurations = [generateConfigurationData(randomConfig, currentSite.brand)];
        }
        
        setSite(currentSite);
      }
    } catch (error) {
      console.error("Error loading site:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateConfigurationData = (configName, brand) => {
    const baseId = `${configName.replace(/ /g, '-').toLowerCase()}-${brand.toLowerCase()}`;
    
    const configurations = {
      "4 over 4": {
        gantry_layout: {
          topRow: [
            { id: "ctv-3", label: "CTV 3", type: "single", row: "top", column: 0 },
            { id: "ctv-2", label: "CTV 2", type: "single", row: "top", column: 1 },
            { id: "ctv-1", label: "CTV 1", type: "single", row: "top", column: 2 },
            { id: "sky-a", label: "SKY A", type: "sky", row: "top", column: 3 }
          ],
          bottomRow: [
            { id: "2a-2d", label: "2A-2D", type: "quad", row: "bottom", column: 0 },
            { id: "3a-3d", label: "3A-3D", type: "quad", row: "bottom", column: 1 },
            { id: "4a-4d", label: "4A-4D", type: "quad", row: "bottom", column: 2 },
            { id: "5a-5d", label: "5A-5D", type: "quad", row: "bottom", column: 3 }
          ]
        },
        gantry_count: 8,
        additional_count: 15,
        estimated_minutes: 60
      },
      "5 over 5": {
        gantry_layout: {
          topRow: [
            { id: "ctv-4", label: "CTV 4", type: "single", row: "top", column: 0 },
            { id: "ctv-3", label: "CTV 3", type: "single", row: "top", column: 1 },
            { id: "ctv-2", label: "CTV 2", type: "single", row: "top", column: 2 },
            { id: "ctv-1", label: "CTV 1", type: "single", row: "top", column: 3 },
            { id: "sky-a", label: "SKY A", type: "sky", row: "top", column: 4 }
          ],
          bottomRow: [
            { id: "2a-2d", label: "2A-2D", type: "quad", row: "bottom", column: 0 },
            { id: "3a-3d", label: "3A-3D", type: "quad", row: "bottom", column: 1 },
            { id: "4a-4d", label: "4A-4D", type: "quad", row: "bottom", column: 2 },
            { id: "5a-5d", label: "5A-5D", type: "quad", row: "bottom", column: 3 },
            { id: "6a-6d", label: "6A-6D", type: "quad", row: "bottom", column: 4 }
          ]
        },
        gantry_count: 10,
        additional_count: 18,
        estimated_minutes: 75
      },
      "5 over 1": {
        gantry_layout: {
          topRow: [
            { id: "ctv-4", label: "CTV 4", type: "single", row: "top", column: 0 },
            { id: "ctv-3", label: "CTV 3", type: "single", row: "top", column: 1 },
            { id: "ctv-2", label: "CTV 2", type: "single", row: "top", column: 2 },
            { id: "ctv-1", label: "CTV 1", type: "single", row: "top", column: 3 },
            { id: "sky-a", label: "SKY A", type: "sky", row: "top", column: 4 }
          ],
          bottomRow: [
            { id: "6a-6d", label: "6A-6D", type: "quad", row: "bottom", column: 2 }
          ]
        },
        gantry_count: 6,
        additional_count: 12,
        estimated_minutes: 55
      },
      "5 straight": {
        gantry_layout: {
          topRow: [
            { id: "ctv-4", label: "CTV 4", type: "single", row: "top", column: 0 },
            { id: "ctv-3", label: "CTV 3", type: "single", row: "top", column: 1 },
            { id: "ctv-2", label: "CTV 2", type: "single", row: "top", column: 2 },
            { id: "ctv-1", label: "CTV 1", type: "single", row: "top", column: 3 },
            { id: "sky-a", label: "SKY A", type: "sky", row: "top", column: 4 }
          ],
          bottomRow: []
        },
        gantry_count: 5,
        additional_count: 20,
        estimated_minutes: 65
      },
      "6 over 6": {
        gantry_layout: {
          topRow: [
            { id: "ctv-5", label: "CTV 5", type: "single", row: "top", column: 0 },
            { id: "ctv-4", label: "CTV 4", type: "single", row: "top", column: 1 },
            { id: "ctv-3", label: "CTV 3", type: "single", row: "top", column: 2 },
            { id: "ctv-2", label: "CTV 2", type: "single", row: "top", column: 3 },
            { id: "ctv-1", label: "CTV 1", type: "single", row: "top", column: 4 },
            { id: "sky-a", label: "SKY A", type: "sky", row: "top", column: 5 }
          ],
          bottomRow: [
            { id: "2a-2d", label: "2A-2D", type: "quad", row: "bottom", column: 0 },
            { id: "3a-3d", label: "3A-3D", type: "quad", row: "bottom", column: 1 },
            { id: "4a-4d", label: "4A-4D", type: "quad", row: "bottom", column: 2 },
            { id: "5a-5d", label: "5A-5D", type: "quad", row: "bottom", column: 3 },
            { id: "6a-6d", label: "6A-6D", type: "quad", row: "bottom", column: 4 },
            { id: "7a-7d", label: "7A-7D", type: "quad", row: "bottom", column: 5 }
          ]
        },
        gantry_count: 12,
        additional_count: 22,
        estimated_minutes: 90
      }
    };

    const config = configurations[configName];
    
    // Generate additional screens (removed multiviewer)
    const additionalScreens = {
      offGantry: ["Early Price Screen"],
      sportsZone: ["SKY B", "Sports TV 1", "Sports TV 2"],
      counterArea: ["Manager Monitor 1", "Manager Monitor 2", "Manager Monitor 3", "Manager Display Board"],
      fobtZone: ["FOBT TV 1", "FOBT TV 2", "FOBT TV 3", "FOBT TV 4"],
      oppositeGantry: ["Touch Screen 1", "Touch Screen 2", "Touch Screen 3", "Touch Screen 4", "Touch Screen 5"]
    };

    return {
      id: baseId,
      name: configName,
      type: configName,
      gantry_layout: config.gantry_layout,
      additional_screens: additionalScreens,
      total_positions: config.gantry_count + config.additional_count,
      gantry_count: config.gantry_count,
      additional_count: config.additional_count,
      estimated_minutes: config.estimated_minutes
    };
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
      layout: allPositions
    };

    try {
      const session = await Session.create(sessionData);
      navigate(createPageUrl("Progress", `sessionId=${session.id}`));
    } catch (error) {
      console.error("Error creating session:", error);
    }
  };

  const renderCompactLayoutPreview = (config) => {
    const { gantry_layout } = config;
    const topRow = gantry_layout?.topRow || [];
    const bottomRow = gantry_layout?.bottomRow || [];
    
    return (
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="space-y-4">
          {/* Top Row */}
          {topRow.length > 0 && (
            <div>
              <div className="text-xs text-center text-gray-400 mb-3 font-medium">Top Row</div>
              <div className="flex flex-wrap gap-2 justify-center">
                {topRow.map((position) => renderPositionElement(position))}
              </div>
            </div>
          )}
          
          {/* Bottom Row */}
          {bottomRow.length > 0 && (
            <div>
              <div className="text-xs text-center text-gray-400 mb-3 font-medium">Bottom Row</div>
              <div className="flex flex-wrap gap-2 justify-center">
                {bottomRow.map((position) => renderPositionElement(position))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderPositionElement = (position) => {
    const baseClass = "w-10 h-7 border rounded flex items-center justify-center text-xs font-medium transition-all duration-200";
    
    if (position.type === "quad") {
      return (
        <div key={position.id} className="flex flex-col items-center">
          <div className={`${baseClass} bg-gray-100 border-gray-300 text-gray-700 relative`}>
            {/* Subtle crosshatch pattern for quad */}
            <div className="absolute inset-1 opacity-40">
              <div className="w-full h-full grid grid-cols-2 grid-rows-2 gap-px">
                <div className="bg-gray-400 rounded-sm"></div>
                <div className="bg-gray-400 rounded-sm"></div>
                <div className="bg-gray-400 rounded-sm"></div>
                <div className="bg-gray-400 rounded-sm"></div>
              </div>
            </div>
            <span className="relative z-10 text-xs font-semibold">Q</span>
          </div>
          <div className="text-xs text-gray-500 mt-1 text-center font-medium">
            {position.label}
          </div>
        </div>
      );
    }

    const typeStyles = {
      sky: "bg-green-50 border-green-200 text-green-700",
      single: "bg-white border-gray-300 text-gray-700"
    };

    return (
      <div key={position.id} className="flex flex-col items-center">
        <div className={`${baseClass} ${typeStyles[position.type] || typeStyles.single}`}>
          <span className="truncate px-1 font-semibold">
            {position.label.replace(/^(CTV|LTV|BTV) /, "").replace(/^SKY /, "S")}
          </span>
        </div>
        <div className="text-xs text-gray-500 mt-1 text-center font-medium">
          {position.label}
        </div>
      </div>
    );
  };

  const getBrandColor = (brand) => {
    switch (brand) {
      case "Ladbrokes": return "bg-red-100 text-red-800";
      case "Coral": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getBrandBorder = (brand) => {
    switch (brand) {
      case "Ladbrokes": return "border-l-red-500";
      case "Coral": return "border-l-blue-500";
      default: return "border-l-gray-500";
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
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
        
        <Button
          variant="outline"
          onClick={() => navigate(createPageUrl("SiteDocumentation", `siteId=${site.id}`))}
          className="touch-target"
        >
          <FileText className="w-4 h-4 mr-2" />
          View Documents
        </Button>
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
        <div className="grid grid-cols-1 gap-6">
          {site.configurations?.map((config) => (
            <Card
              key={config.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-blue-300 active:scale-98 shadow-sm ${
                selectedConfig?.id === config.id ? "ring-2 ring-blue-500 border-blue-300" : ""
              }`}
              onClick={() => handleConfigurationSelect(config)}
            >
              <CardContent className="p-6 text-center">
                {/* Brand Badge */}
                <Badge className={`${getBrandColor(site.brand)} mb-4 mx-auto`}>
                  {site.brand}
                </Badge>
                
                {/* Configuration Name */}
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  {config.name}
                </h2>
                
                {/* Status */}
                <p className="text-gray-500 mb-6">Ready to start</p>
                
                {/* Time Estimate */}
                <div className="flex items-center justify-center gap-2 text-gray-600 mb-6">
                  <Clock className="w-4 h-4" />
                  <span>Est. time: {config.estimated_minutes} minutes</span>
                </div>
                
                {/* Start Button */}
                <Button 
                  size="lg"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 mb-6 min-h-[48px] transition-all duration-200"
                  disabled={selectedConfig?.id === config.id}
                >
                  {selectedConfig?.id === config.id ? "Starting..." : "Start Session"}
                </Button>
                
                {/* Diagram Section */}
                {renderCompactLayoutPreview(config)}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

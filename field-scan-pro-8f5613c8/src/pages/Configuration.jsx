
import React, { useState, useEffect } from "react";
import { Site, Session } from "@/api/entities";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Monitor, Clock, Grid3x3, Layers } from "lucide-react";

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
    
    // Create new session
    const sessionData = {
      site_id: site.id,
      site_name: site.name,
      site_code: site.code,
      config_id: config.id,
      config_name: config.name,
      start_time: new Date().toISOString(),
      status: "active",
      scan_results: []
    };

    try {
      const session = await Session.create(sessionData);
      navigate(createPageUrl("Progress", `sessionId=${session.id}`));
    } catch (error) {
      console.error("Error creating session:", error);
    }
  };

  const getConfigIcon = (configName) => {
    if (configName.includes("Grid")) return Grid3x3;
    if (configName.includes("over")) return Layers;
    return Monitor;
  };

  const getBrandColor = (brand) => {
    switch (brand) {
      case "Ladbrokes": return "border-brand-ladbrokes";
      case "Coral": return "border-brand-coral";
      case "Betfred": return "border-brand-betfred";
      default: return "border-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-40 bg-gray-200 rounded-lg"></div>
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

      {/* Site Info */}
      <Card className={`mb-6 border-l-4 ${getBrandColor(site.brand)}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="font-semibold text-gray-900">{site.name}</h3>
                <Badge variant="outline">{site.code}</Badge>
                <Badge className={`${site.brand === "Ladbrokes" ? "bg-red-100 text-red-800" : 
                  site.brand === "Coral" ? "bg-blue-100 text-blue-800" : 
                  "bg-green-100 text-green-800"}`}>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {site.configurations?.map((config) => {
            const IconComponent = getConfigIcon(config.name);
            return (
              <Card
                key={config.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg active:scale-98 ${
                  selectedConfig?.id === config.id ? "ring-2 ring-emerald-500" : ""
                }`}
                onClick={() => handleConfigurationSelect(config)}
              >
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <IconComponent className="w-8 h-8 text-emerald-600" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">{config.name}</h4>
                    <div className="flex justify-center space-x-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center space-x-1">
                        <Monitor className="w-4 h-4" />
                        <span>{config.screen_count} screens</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{config.estimated_minutes} min</span>
                      </div>
                    </div>
                    
                    {/* Visual Preview */}
                    <div className="mb-4">
                      <ConfigurationPreview config={config} />
                    </div>
                    
                    <Button 
                      className="w-full bg-emerald-600 hover:bg-emerald-700"
                      disabled={selectedConfig?.id === config.id}
                    >
                      {selectedConfig?.id === config.id ? "Starting..." : "Start Session"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ConfigurationPreview({ config }) {
  const renderLayout = () => {
    if (config.name === "3 over 1") {
      return (
        <div className="space-y-2">
          <div className="flex space-x-1 justify-center">
            <div className="w-6 h-4 bg-gray-300 rounded-sm"></div>
            <div className="w-6 h-4 bg-gray-300 rounded-sm"></div>
            <div className="w-6 h-4 bg-gray-300 rounded-sm"></div>
          </div>
          <div className="flex justify-center">
            <div className="w-6 h-4 bg-gray-300 rounded-sm"></div>
          </div>
        </div>
      );
    } else if (config.name === "5 over 1") {
      return (
        <div className="space-y-2">
          <div className="flex space-x-1 justify-center">
            <div className="w-5 h-3 bg-gray-300 rounded-sm"></div>
            <div className="w-5 h-3 bg-gray-300 rounded-sm"></div>
            <div className="w-5 h-3 bg-gray-300 rounded-sm"></div>
            <div className="w-5 h-3 bg-gray-300 rounded-sm"></div>
            <div className="w-5 h-3 bg-gray-300 rounded-sm"></div>
          </div>
          <div className="flex justify-center">
            <div className="w-5 h-3 bg-gray-300 rounded-sm"></div>
          </div>
        </div>
      );
    } else if (config.name === "2x2 Grid") {
      return (
        <div className="grid grid-cols-2 gap-1">
          <div className="w-6 h-4 bg-gray-300 rounded-sm"></div>
          <div className="w-6 h-4 bg-gray-300 rounded-sm"></div>
          <div className="w-6 h-4 bg-gray-300 rounded-sm"></div>
          <div className="w-6 h-4 bg-gray-300 rounded-sm"></div>
        </div>
      );
    } else if (config.name === "3x3 Grid") {
      return (
        <div className="grid grid-cols-3 gap-1">
          {Array(9).fill(0).map((_, i) => (
            <div key={i} className="w-4 h-3 bg-gray-300 rounded-sm"></div>
          ))}
        </div>
      );
    } else {
      return (
        <div className="flex justify-center">
          <div className="w-8 h-6 bg-gray-300 rounded-sm"></div>
        </div>
      );
    }
  };

  return (
    <div className="flex justify-center py-2">
      {renderLayout()}
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { Site } from "@/api/entities";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, MapPin, Clock, ChevronRight, Camera } from "lucide-react";

export default function SiteSelection() {
  const navigate = useNavigate();
  const [sites, setSites] = useState([]);
  const [filteredSites, setFilteredSites] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSites();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = sites.filter(site =>
        site.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        site.code.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredSites(filtered);
    } else {
      setFilteredSites(sites);
    }
  }, [searchTerm, sites]);

  const loadSites = async () => {
    try {
      const siteData = await Site.list();
      setSites(siteData);
      setFilteredSites(siteData);
    } catch (error) {
      console.error("Error loading sites:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSiteSelect = (site) => {
    Site.update(site.id, { last_visited: new Date().toISOString() });
    navigate(createPageUrl("Configuration", `siteId=${site.id}`));
  };

  const handlePhotoHistoryClick = (e, site) => {
    e.stopPropagation(); // Prevent site selection
    navigate(createPageUrl("SitePhotoHistory", `siteId=${site.id}`));
  };

  const getBrandColor = (brand) => {
    switch (brand) {
      case "Ladbrokes": return "border-brand-ladbrokes";
      case "Coral": return "border-brand-coral";
      case "Betfred": return "border-brand-betfred";
      default: return "border-gray-200";
    }
  };

  const getBrandTextColor = (brand) => {
    switch (brand) {
      case "Ladbrokes": return "text-red-600";
      case "Coral": return "text-blue-600";
      case "Betfred": return "text-green-600";
      default: return "text-gray-600";
    }
  };

  const recentSites = sites.filter(site => site.last_visited).slice(0, 3);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(createPageUrl("Dashboard"))}
          className="touch-target"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Select Site</h2>
          <p className="text-gray-600">Choose installation location</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <Input
          type="text"
          placeholder="Search sites by name or code..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 touch-target text-base"
        />
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-24 bg-gray-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Recent Sites */}
          {recentSites.length > 0 && !searchTerm && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Recent Sites</h3>
              <div className="space-y-2">
                {recentSites.map((site) => (
                  <SiteCard
                    key={site.id}
                    site={site}
                    onSiteSelect={handleSiteSelect}
                    onPhotoHistoryClick={handlePhotoHistoryClick}
                    getBrandColor={getBrandColor}
                    getBrandTextColor={getBrandTextColor}
                  />
                ))}
              </div>
            </div>
          )}

          {/* All Sites */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchTerm ? "Search Results" : "All Sites"}
            </h3>
            {filteredSites.length === 0 ? (
              <Card className="p-8 text-center">
                <div className="text-gray-500">
                  <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No sites found matching "{searchTerm}"</p>
                </div>
              </Card>
            ) : (
              <div className="space-y-2">
                {filteredSites.map((site) => (
                  <SiteCard
                    key={site.id}
                    site={site}
                    onSiteSelect={handleSiteSelect}
                    onPhotoHistoryClick={handlePhotoHistoryClick}
                    getBrandColor={getBrandColor}
                    getBrandTextColor={getBrandTextColor}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function SiteCard({ site, onSiteSelect, onPhotoHistoryClick, getBrandColor, getBrandTextColor }) {
  return (
    <Card
      className={`cursor-pointer transition-all duration-200 hover:shadow-md active:scale-98 border-l-4 ${getBrandColor(site.brand)}`}
    >
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div 
            className="flex-1 min-w-0"
            onClick={() => onSiteSelect(site)}
          >
            <div className="flex items-center space-x-3 mb-1">
              <h4 className="font-semibold text-gray-900 truncate">{site.name}</h4>
              <span className={`text-sm font-medium ${getBrandTextColor(site.brand)} whitespace-nowrap`}>
                {site.code}
              </span>
            </div>
            <div className="flex items-center space-x-1 text-sm text-gray-600">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{site.address}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2 ml-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => onPhotoHistoryClick(e, site)}
              className="touch-target flex-shrink-0"
              title="View photo history"
            >
              <Camera className="w-4 h-4 text-gray-500" />
            </Button>
            <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
import React, { useState, useEffect } from 'react';
import { Session, Site } from '@/api/entities';
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Camera, 
  Calendar, 
  Search, 
  Filter,
  Image as ImageIcon
} from "lucide-react";
import { format, parseISO } from "date-fns";
import PhotoPreviewModal from '../components/scanner/PhotoPreviewModal';

export default function SitePhotoHistory() {
  const navigate = useNavigate();
  const [site, setSite] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [filteredPhotos, setFilteredPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [groupBy, setGroupBy] = useState("session");
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  useEffect(() => {
    loadSiteAndPhotos();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [photos, searchTerm, groupBy]);

  const loadSiteAndPhotos = async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const siteId = urlParams.get("siteId");
      
      if (siteId) {
        // Load site details
        const siteData = await Site.filter({ id: siteId });
        const currentSite = siteData[0];
        setSite(currentSite);

        // Load all sessions for this site
        const sessions = await Session.filter({ site_id: siteId });
        
        // Extract all photos from scan results
        const allPhotos = [];
        sessions.forEach(session => {
          if (session.scan_results) {
            session.scan_results.forEach(result => {
              if (result.photo_url) {
                allPhotos.push({
                  ...result,
                  session_id: session.id,
                  session_start: session.start_time,
                  config_name: session.config_name,
                  site_name: session.site_name,
                  site_code: session.site_code
                });
              }
            });
          }
        });

        setPhotos(allPhotos);
      }
    } catch (error) {
      console.error("Error loading site photos:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = photos;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(photo => 
        photo.model_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        photo.position_label?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        photo.serial_number?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort by timestamp (newest first)
    filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    setFilteredPhotos(filtered);
  };

  const handlePhotoClick = (photo) => {
    setSelectedPhoto(photo);
  };

  const getBrandColor = (brand) => {
    switch (brand) {
      case "Ladbrokes": return "border-brand-ladbrokes";
      case "Coral": return "border-brand-coral"; 
      case "Betfred": return "border-brand-betfred";
      default: return "border-gray-200";
    }
  };

  const groupPhotos = () => {
    const grouped = {};
    
    filteredPhotos.forEach(photo => {
      let key;
      switch (groupBy) {
        case "session":
          key = `${format(parseISO(photo.session_start), "PPP")} - ${photo.config_name}`;
          break;
        case "position":
          key = photo.position_label;
          break;
        case "date":
          key = format(parseISO(photo.timestamp), "PPP");
          break;
        default:
          key = "All Photos";
      }
      
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(photo);
    });

    return grouped;
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1,2,3,4,5,6,7,8].map(i => (
              <div key={i} className="aspect-square bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!site) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="text-center">
          <p className="text-gray-500">Site not found</p>
          <Button onClick={() => navigate(createPageUrl("SiteSelection"))}>
            Back to Site Selection
          </Button>
        </div>
      </div>
    );
  }

  const groupedPhotos = groupPhotos();

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
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
          <h2 className="text-2xl font-bold text-gray-900">{site.name} Photos</h2>
          <p className="text-gray-600">{photos.length} photos from installations</p>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by model, position, or serial number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <Select value={groupBy} onValueChange={setGroupBy}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="session">By Session</SelectItem>
                  <SelectItem value="position">By Position</SelectItem>
                  <SelectItem value="date">By Date</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Photo Grid */}
      {photos.length === 0 ? (
        <Card className="p-12 text-center">
          <Camera className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-800">No Photos Yet</h3>
          <p className="text-gray-500 mt-2">Photos from equipment installations will appear here.</p>
        </Card>
      ) : filteredPhotos.length === 0 ? (
        <Card className="p-12 text-center">
          <Search className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-800">No Results Found</h3>
          <p className="text-gray-500 mt-2">Try adjusting your search terms.</p>
        </Card>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedPhotos).map(([groupName, groupPhotos]) => (
            <div key={groupName}>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{groupName}</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {groupPhotos.map((photo, index) => (
                  <PhotoCard
                    key={`${photo.session_id}-${photo.position_id}-${index}`}
                    photo={photo}
                    onClick={() => handlePhotoClick(photo)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Photo Preview Modal */}
      {selectedPhoto && (
        <PhotoPreviewModal
          photoUrl={selectedPhoto.photo_url}
          onClose={() => setSelectedPhoto(null)}
        />
      )}
    </div>
  );
}

function PhotoCard({ photo, onClick }) {
  return (
    <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={onClick}>
      <CardContent className="p-0">
        <div className="aspect-square relative overflow-hidden rounded-t-lg">
          <img
            src={photo.photo_url}
            alt={`${photo.position_label} - ${photo.model_id}`}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
            {photo.position_label}
          </div>
        </div>
        <div className="p-3 space-y-2">
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="text-xs">
              {photo.model_id}
            </Badge>
            <span className="text-xs text-gray-500">
              {format(parseISO(photo.timestamp), "MMM d")}
            </span>
          </div>
          <p className="text-sm text-gray-600 truncate">
            S/N: {photo.serial_number}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

import React, { useState, useEffect } from "react";
import { Site } from "@/api/entities";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Search, 
  MapPin, 
  Clock, 
  ChevronRight, 
  Camera,
  Calendar as CalendarIcon,
  Filter,
  Grid3X3,
  List,
  X,
  FileText,
  Image as ImageIcon,
  AlertCircle
} from "lucide-react";
import { format, isToday, isThisWeek, isAfter, isBefore, startOfDay, endOfDay, differenceInDays } from "date-fns";
import SiteCalendarView from "../components/site-selection/SiteCalendarView";
import EmptyState from "../components/common/EmptyState";
import { CardSkeleton } from "../components/ui/SkeletonLoaders";

export default function SiteSelection() {
  const navigate = useNavigate();
  const [sites, setSites] = useState([]);
  const [filteredSites, setFilteredSites] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [brandFilter, setBrandFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [selectedDateRange, setSelectedDateRange] = useState({ from: null, to: null });
  const [sortBy, setSortBy] = useState("date_asc");
  const [viewMode, setViewMode] = useState("list");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSites();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [sites, searchTerm, brandFilter, dateFilter, selectedDateRange, sortBy]);

  const loadSites = async () => {
    try {
      let siteData = await Site.list();
      
      // Add fallback configurations and dates if missing
      siteData = siteData.map(site => {
        if (!site.configurations || site.configurations.length === 0 || !site.configurations[0].gantry_layout) {
          const configs = ["4 over 4", "5 over 5", "5 over 1", "5 straight", "6 over 6"];
          const randomConfig = configs[Math.floor(Math.random() * configs.length)];
          
          // CRITICAL FIX: Generate the full configuration object, not just a stub.
          const configData = generateConfigurationData(randomConfig, site.brand);
          site.configurations = [configData];
        }
        
        if (!site.installation_date) {
          // Generate random date in Q3 2025 (July 1 - Sept 30)
          const start = new Date(2025, 6, 1); // July 1, 2025
          const end = new Date(2025, 8, 30); // Sept 30, 2025
          let randomDate;
          
          // Ensure weekdays only
          do {
            const randomTime = start.getTime() + Math.random() * (end.getTime() - start.getTime());
            randomDate = new Date(randomTime);
          } while (randomDate.getDay() === 0 || randomDate.getDay() === 6); // Skip weekends
          
          site.installation_date = randomDate.toISOString().split('T')[0];
        }

        // Add fallback for documents, reference_photos, and has_special_instructions
        if (!site.documents) {
            site.documents = [];
            // Add some dummy documents for testing/demonstration
            if (Math.random() > 0.5) {
                site.documents.push({ id: `doc-${site.id}-1`, name: "Site Plan.pdf" });
            }
            if (Math.random() > 0.7) {
                site.documents.push({ id: `doc-${site.id}-2`, name: "Safety Brief.docx" });
            }
        }
        if (!site.reference_photos) {
            site.reference_photos = [];
            // Add some dummy photos for testing/demonstration
            const numPhotos = Math.floor(Math.random() * 5); // 0 to 4 photos
            for (let i = 0; i < numPhotos; i++) {
                site.reference_photos.push({ id: `photo-${site.id}-${i+1}`, url: `/path/to/photo-${site.id}-${i+1}.jpg` });
            }
        }
        if (typeof site.has_special_instructions === 'undefined') {
            site.has_special_instructions = Math.random() > 0.8; // 20% chance of having special instructions
        }
        
        return site;
      });
      
      setSites(siteData);
      setFilteredSites(siteData);
    } catch (error) {
      console.error("Error loading sites:", error);
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
            { id: "sky-a", label: "SKY A", type: "sky", row: "top", column: 4 },
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
    
    // Generate additional screens
    const additionalScreens = {
      offGantry: ["Early Price Screen", "Multiviewer 1"],
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

  const applyFilters = () => {
    let filtered = [...sites];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(site =>
        site.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        site.code.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Brand filter
    if (brandFilter !== "all") {
      filtered = filtered.filter(site => site.brand === brandFilter);
    }

    // Date filter
    if (dateFilter !== "all") {
      filtered = filtered.filter(site => {
        const installDate = new Date(site.installation_date);
        const today = new Date();
        
        switch (dateFilter) {
          case "today":
            return isToday(installDate);
          case "week":
            return isThisWeek(installDate);  
          case "month":
            return installDate.getMonth() === today.getMonth() && 
                   installDate.getFullYear() === today.getFullYear();
          case "range":
            if (selectedDateRange.from && selectedDateRange.to) {
              const rangeStart = startOfDay(selectedDateRange.from);
              const rangeEnd = endOfDay(selectedDateRange.to);
              return installDate >= rangeStart && installDate <= rangeEnd;
            }
            return true;
          default:
            return true;
        }
      });
    }

    // Sort
    filtered.sort((a, b) => {
      const dateA = new Date(a.installation_date);
      const dateB = new Date(b.installation_date);
      
      switch (sortBy) {
        case "date_asc":
          return dateA - dateB;
        case "date_desc":
          return dateB - dateA;
        case "name_asc":
          return a.name.localeCompare(b.name);
        case "code_asc":
          return a.code.localeCompare(b.code);
        default:
          return dateA - dateB;
      }
    });

    setFilteredSites(filtered);
  };

  const handleSiteSelect = async (site) => {
    try {
      // The `site` object here is from our state and has had defaults applied.
      // We send the whole object to ensure any old records in the DB
      // are updated with now-required fields like `installation_date`.
      const payload = { ...site, last_visited: new Date().toISOString() };
      // The ID is passed as a separate argument to update, so it shouldn't be in the payload.
      delete payload.id; 
      
      await Site.update(site.id, payload);
    } catch (error) {
      console.error("Failed to update site on selection. The record may have outdated data.", error);
      // We will navigate anyway to not block the user. The configuration page will fetch the data again.
    } finally {
      // Navigate to the configuration page regardless of update success.
      navigate(createPageUrl("Configuration", `siteId=${site.id}`));
    }
  };

  const handlePhotoHistoryClick = (e, site) => {
    e.stopPropagation();
    navigate(createPageUrl("SitePhotoHistory", `siteId=${site.id}`));
  };

  const clearFilters = () => {
    setSearchTerm("");
    setBrandFilter("all");
    setDateFilter("all");
    setSelectedDateRange({ from: null, to: null });
  };

  const getBrandCounts = () => {
    return {
      all: sites.length,
      Coral: sites.filter(s => s.brand === "Coral").length,
      Ladbrokes: sites.filter(s => s.brand === "Ladbrokes").length
    };
  };

  const getDateCounts = () => {
    const today = new Date();
    return {
      today: sites.filter(s => isToday(new Date(s.installation_date))).length,
      week: sites.filter(s => isThisWeek(new Date(s.installation_date))).length,
      month: sites.filter(s => {
        const d = new Date(s.installation_date);
        return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
      }).length
    };
  };

  const brandCounts = getBrandCounts();
  const dateCounts = getDateCounts();

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

      {/* Brand Filter */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-2">
          {["all", "Coral", "Ladbrokes"].map((brand) => (
            <Button
              key={brand}
              variant={brandFilter === brand ? "default" : "outline"}
              size="sm"
              onClick={() => setBrandFilter(brandFilter === brand ? "all" : brand)}
              className={`${
                brandFilter === brand 
                  ? brand === "Coral" 
                    ? "bg-blue-600 hover:bg-blue-700" 
                    : brand === "Ladbrokes"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-gray-900"
                  : ""
              }`}
            >
              {brand === "all" ? "All" : brand} ({brandCounts[brand]})
            </Button>
          ))}
        </div>
      </div>

      {/* Date Filter */}
      <div className="mb-4 space-y-2">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={dateFilter === "today" ? "default" : "outline"}
            size="sm"
            onClick={() => setDateFilter(dateFilter === "today" ? "all" : "today")}
          >
            Today ({dateCounts.today})
          </Button>
          <Button
            variant={dateFilter === "week" ? "default" : "outline"}
            size="sm"
            onClick={() => setDateFilter(dateFilter === "week" ? "all" : "week")}
          >
            This Week ({dateCounts.week})
          </Button>
          <Button
            variant={dateFilter === "month" ? "default" : "outline"}
            size="sm"
            onClick={() => setDateFilter(dateFilter === "month" ? "all" : "month")}
          >
            This Month ({dateCounts.month})
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant={dateFilter === "range" ? "default" : "outline"} 
                size="sm"
              >
                <CalendarIcon className="w-4 h-4 mr-2" />
                Date Range
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="range"
                selected={selectedDateRange}
                onSelect={(range) => {
                  setSelectedDateRange(range || { from: null, to: null });
                  if (range?.from && range?.to) {
                    setDateFilter("range");
                  }
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
        
        {/* Show active filters */}
        <div className="flex flex-wrap gap-2">
          {dateFilter === "range" && selectedDateRange.from && selectedDateRange.to && (
            <Badge variant="secondary" className="pr-1">
              {format(selectedDateRange.from, "MMM d")} - {format(selectedDateRange.to, "MMM d")}
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-4 w-4 p-0 ml-1"
                onClick={() => {
                  setDateFilter("all");
                  setSelectedDateRange({ from: undefined, to: undefined });
                }}
              >
                <X className="w-3 h-3" />
              </Button>
            </Badge>
          )}
          {(searchTerm || brandFilter !== "all" || dateFilter !== "all") && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="w-4 h-4 mr-2" />
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {/* View Mode and Sort */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <Tabs value={viewMode} onValueChange={setViewMode}>
          <TabsList>
            <TabsTrigger value="list">
              <List className="w-4 h-4 mr-2" />
              List View
            </TabsTrigger>
            <TabsTrigger value="calendar">
              <CalendarIcon className="w-4 h-4 mr-2" />
              Calendar View
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date_asc">Date ↑ (Nearest first)</SelectItem>
            <SelectItem value="date_desc">Date ↓ (Latest first)</SelectItem>
            <SelectItem value="name_asc">Name A-Z</SelectItem>
            <SelectItem value="code_asc">Site Code</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Content */}
      {loading ? (
        <CardSkeleton count={5} />
      ) : viewMode === "calendar" ? (
        <SiteCalendarView 
          sites={filteredSites} 
          onSiteSelect={handleSiteSelect}
          onDateSelect={(date) => {
            setSelectedDateRange({ from: date, to: date });
            setDateFilter("range");
            setViewMode("list");
          }}
        />
      ) : (
        <div className="space-y-4">
          {filteredSites.length === 0 ? (
            <EmptyState
              Icon={MapPin}
              title="No sites found"
              message="No sites match your current filters."
              actionText="Clear Filters"
              onAction={clearFilters}
            />
          ) : (
            filteredSites.map((site) => (
              <SiteCard
                key={site.id}
                site={site}
                onSiteSelect={handleSiteSelect}
                onPhotoHistoryClick={handlePhotoHistoryClick}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

// New component to encapsulate the document indicators
const SiteDocumentationSummary = React.memo(function SiteDocumentationSummary({ site }) {
  const hasDocuments = site.documents && site.documents.length > 0;
  const hasPhotos = site.reference_photos && site.reference_photos.length > 0;
  const hasInstructions = site.has_special_instructions;

  if (!hasDocuments && !hasPhotos && !hasInstructions) {
    return null; // Don't render anything if no relevant data
  }

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {hasDocuments && (
        <Badge 
          variant="outline" 
          className="flex items-center gap-1 bg-green-50 text-green-800 border-green-200"
          title={`${site.documents.length} document(s)`}
        >
          <FileText className="w-3 h-3" />
          <span>{site.documents.length} Docs</span>
        </Badge>
      )}
      {hasPhotos && (
        <Badge 
          variant="outline" 
          className="flex items-center gap-1 bg-blue-50 text-blue-800 border-blue-200"
          title={`${site.reference_photos.length} reference photo(s)`}
        >
          <ImageIcon className="w-3 h-3" />
          <span>{site.reference_photos.length} Photos</span>
        </Badge>
      )}
      {hasInstructions && (
        <Badge 
          variant="outline" 
          className="flex items-center gap-1 bg-amber-50 text-amber-800 border-amber-200"
          title="Special instructions available for this site"
        >
          <AlertCircle className="w-3 h-3" />
          <span>Special Instructions</span>
        </Badge>
      )}
    </div>
  );
});

const SiteCard = React.memo(function SiteCard({ site, onSiteSelect, onPhotoHistoryClick }) {
  const installDate = new Date(site.installation_date);
  const today = new Date();
  const daysUntil = differenceInDays(installDate, today);
  
  const getUrgencyStyle = () => {
    if (daysUntil < 0) return "border-l-red-500"; // Past due
    if (daysUntil === 0) return "border-l-green-500"; // Today
    if (daysUntil <= 7) return "border-l-amber-500"; // This week
    return "border-l-gray-200"; // Future
  };

  const getUrgencyText = () => {
    if (daysUntil < 0) return `${Math.abs(daysUntil)} days overdue`;
    if (daysUntil === 0) return "Today";
    if (daysUntil === 1) return "Tomorrow";
    return `In ${daysUntil} days`;
  };

  const getBrandBackground = (brand) => {
    return brand === "Coral" ? "bg-blue-50" : "bg-red-50";
  };

  const getBrandColor = (brand) => {
    return brand === "Coral" ? "bg-blue-100 text-blue-800" : "bg-red-100 text-red-800";
  };

  const configuration = site.configurations?.[0]?.name || "Configuration TBD";

  return (
    <Card
      className={`cursor-pointer transition-all duration-200 hover:shadow-md active:scale-98 border-l-4 ${getUrgencyStyle()} ${getBrandBackground(site.brand)}`}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div 
            className="flex-1 min-w-0"
            onClick={() => onSiteSelect(site)}
          >
            <div className="flex items-center space-x-3 mb-2">
              <h4 className="font-semibold text-gray-900 truncate">{site.name}</h4>
              <Badge variant="outline" className="text-sm">
                {site.code}
              </Badge>
              <Badge className={getBrandColor(site.brand)}>
                {site.brand}
              </Badge>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center space-x-1 text-sm text-gray-600">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{site.address}</span>
              </div>
              
              <div className="flex items-center space-x-1 text-sm text-gray-600">
                <Grid3X3 className="w-4 h-4 flex-shrink-0" />
                <span>{configuration}</span>
              </div>
              
              <div className="flex items-center space-x-1 text-sm font-medium">
                <Clock className="w-4 h-4 flex-shrink-0" />
                <span>Install: {format(installDate, "MMM d, yyyy")}</span>
                <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                  daysUntil < 0 ? "bg-red-100 text-red-800" :
                  daysUntil === 0 ? "bg-green-100 text-green-800" :
                  daysUntil <= 7 ? "bg-amber-100 text-amber-800" :
                  "bg-gray-100 text-gray-800"
                }`}>
                  {getUrgencyText()}
                </span>
              </div>

              {/* Document Indicators */}
              <SiteDocumentationSummary site={site} />
            </div>
          </div>
          
          <div className="flex items-center space-x-2 ml-4">
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
});

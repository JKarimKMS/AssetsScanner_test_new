
import React, { useState, useEffect, useRef } from "react";
import { Session, Site } from "@/api/entities";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  Clock, 
  CheckCircle, 
  Play,
  FileText,
  MonitorSpeaker,
  TrendingUp,
  Calendar,
  Notebook,
  X,
  AlertCircle
} from "lucide-react";
import { format, isThisWeek } from "date-fns";
import EmptyState from "../components/common/EmptyState";
import { CardSkeleton, ListItemSkeleton } from "../components/ui/SkeletonLoaders";

export default function Dashboard() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState(null);
  const [filteredData, setFilteredData] = useState([]);
  const [error, setError] = useState(null);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    // Prevent multiple executions
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;

    const initializePage = async () => {
      try {
        // Check onboarding first
        const onboardingCompleted = localStorage.getItem('onboardingCompleted');
        if (!onboardingCompleted) {
          navigate(createPageUrl("Onboarding"));
          return;
        }
        
        // Check for URL filter param
        const urlParams = new URLSearchParams(window.location.search);
        const filterParam = urlParams.get('filter');
        if (filterParam) {
          setActiveFilter(filterParam);
        }
        
        // Load data with retry logic
        await loadDataWithRetry();
      } catch (error) {
        console.error("Error initializing dashboard:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    initializePage();
  }, [navigate]);

  useEffect(() => {
    // Only apply filter if we have sessions data
    if (sessions.length > 0 || activeFilter) {
      applyFilter();
    }
  }, [activeFilter, sessions]);

  const loadDataWithRetry = async (retryCount = 0) => {
    try {
      setError(null);
      const sessionData = await Session.list("-created_date", 50);
      setSessions(sessionData);
    } catch (error) {
      console.error("Error loading sessions:", error);
      
      if (error.response?.status === 429 && retryCount < 3) {
        // Wait and retry for 429 errors
        const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff
        console.log(`Rate limited, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return loadDataWithRetry(retryCount + 1);
      }
      
      setError("Failed to load sessions. Please refresh the page.");
      throw error;
    }
  };

  const applyFilter = () => {
    if (!activeFilter) {
      setFilteredData(sessions.slice(0, 10));
      return;
    }

    let filtered = [];
    switch (activeFilter) {
      case 'active':
        filtered = sessions.filter(s => s.status === 'active');
        break;
      case 'completed':
        filtered = sessions.filter(s => s.status === 'completed');
        break;
      case 'this_week':
        filtered = sessions.filter(s => s.start_time && isThisWeek(new Date(s.start_time)));
        break;
      case 'total_scans':
        filtered = sessions.reduce((acc, session) => {
          if (session.scan_results && session.scan_results.length > 0) {
            session.scan_results.forEach(scan => {
              acc.push({
                ...scan,
                session_id: session.id,
                site_name: session.site_name,
                site_code: session.site_code,
                session_start: session.start_time
              });
            });
          }
          return acc;
        }, []);
        break;
      default:
        filtered = sessions.slice(0, 10);
    }
    
    setFilteredData(filtered);
  };

  const handleFilterClick = (filter) => {
    const newFilter = activeFilter === filter ? null : filter;
    setActiveFilter(newFilter);
    
    // Update URL without causing re-render
    const url = new URL(window.location);
    if (newFilter) {
      url.searchParams.set('filter', newFilter);
    } else {
      url.searchParams.delete('filter');
    }
    window.history.replaceState({}, '', url);
  };

  const clearFilter = () => {
    setActiveFilter(null);
    const url = new URL(window.location);
    url.searchParams.delete('filter');
    window.history.replaceState({}, '', url);
  };

  // Show error state
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="text-center py-8">
          <div className="text-red-600 mb-4">
            <AlertCircle className="w-12 h-12 mx-auto mb-2" />
            <p className="text-lg font-semibold">Error Loading Dashboard</p>
            <p className="text-sm">{error}</p>
          </div>
          <Button onClick={() => window.location.reload()}>
            Refresh Page
          </Button>
        </div>
      </div>
    );
  }

  // Rest of component remains the same...
  const getStatusColor = (status) => {
    switch (status) {
      case "active": return "bg-amber-100 text-amber-800";
      case "completed": return "bg-green-100 text-green-800";
      case "exported": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getBrandColor = (siteCode) => {
    if (siteCode.startsWith("L")) return "border-brand-ladbrokes";
    if (siteCode.startsWith("C")) return "border-brand-coral";
    if (siteCode.startsWith("B")) return "border-brand-betfred";
    return "border-gray-200";
  };

  const getFilterTitle = () => {
    switch (activeFilter) {
      case 'active': return 'Active Sessions';
      case 'completed': return 'Completed Sessions';
      case 'this_week': return 'This Week\'s Sessions';
      case 'total_scans': return 'All Individual Scans';
      default: return 'Recent Sessions';
    }
  };

  const completedSessions = sessions.filter(s => s.status === "completed").length;
  const activeSessions = sessions.filter(s => s.status === "active").length;
  const totalScans = sessions.reduce((sum, s) => sum + (s.scan_results?.length || 0), 0);
  const thisWeekSessions = sessions.filter(s => s.start_time && isThisWeek(new Date(s.start_time))).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      {/* Compact Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-gray-600 mt-1">Ready to scan equipment installations.</p>
        </div>
        <Link to={createPageUrl("SiteSelection")} className="mt-4 sm:mt-0 w-full sm:w-auto">
          <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white w-full">
            <MonitorSpeaker className="w-5 h-5 mr-2" />
            Start New Installation
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card 
          className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
            activeFilter === 'active' ? 'ring-2 ring-emerald-500 scale-105' : 'hover:scale-102'
          }`}
          onClick={() => handleFilterClick('active')}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Active</p>
                <p className="text-2xl font-bold mt-1 text-gray-900">{activeSessions}</p>
              </div>
              <div className="bg-amber-100 p-3 rounded-full">
                <Play className="w-5 h-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
            activeFilter === 'completed' ? 'ring-2 ring-emerald-500 scale-105' : 'hover:scale-102'
          }`}
          onClick={() => handleFilterClick('completed')}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Completed</p>
                <p className="text-2xl font-bold mt-1 text-gray-900">{completedSessions}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
            activeFilter === 'total_scans' ? 'ring-2 ring-emerald-500 scale-105' : 'hover:scale-102'
          }`}
          onClick={() => handleFilterClick('total_scans')}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Scans</p>
                <p className="text-2xl font-bold mt-1 text-gray-900">{totalScans}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <MonitorSpeaker className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
            activeFilter === 'this_week' ? 'ring-2 ring-emerald-500 scale-105' : 'hover:scale-102'
          }`}
          onClick={() => handleFilterClick('this_week')}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">This Week</p>
                <p className="text-2xl font-bold mt-1 text-gray-900">{thisWeekSessions}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sessions List */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>{getFilterTitle()}</span>
              </CardTitle>
              {activeFilter && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={clearFilter}
                  className="h-7 px-2"
                >
                  <X className="w-3 h-3 mr-1" />
                  Clear filter
                </Button>
              )}
            </div>
            <Link to={createPageUrl("NotesView")} className="w-full sm:w-auto">
              <Button variant="outline" size="sm" className="w-full">
                <Notebook className="w-4 h-4 mr-2" />
                View All Notes
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              <ListItemSkeleton count={3} />
            </div>
          ) : filteredData.length === 0 ? (
            <EmptyState
              Icon={Calendar}
              title={`No ${activeFilter ? getFilterTitle().toLowerCase() : 'sessions'} found`}
              message="Completed or active sessions will appear here."
              actionText={activeFilter ? "Clear Filter" : null}
              onAction={activeFilter ? clearFilter : null}
            />
          ) : activeFilter === 'total_scans' ? (
            <div className="space-y-3">
              {filteredData.map((scan, index) => (
                <div
                  key={`${scan.session_id}-${scan.position_id}-${index}`}
                  className="p-3 rounded-lg border bg-white hover:bg-gray-50 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex-1 w-full">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h4 className="font-semibold text-gray-900">{scan.position_label}</h4>
                        <Badge variant="outline" className="text-xs whitespace-nowrap">
                          {scan.model_id}
                        </Badge>
                        <Badge className="bg-blue-100 text-blue-800 whitespace-nowrap">
                          {scan.site_code}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4" />
                          <span>{scan.site_name}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MonitorSpeaker className="w-4 h-4" />
                          <span>S/N: {scan.serial_number}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{scan.timestamp ? format(new Date(scan.timestamp), "MMM d, HH:mm") : "N/A"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredData.map((session) => (
                <div
                  key={session.id}
                  className={`p-3 rounded-lg border-l-4 ${getBrandColor(
                    session.site_code
                  )} bg-white hover:bg-gray-50 transition-colors`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex-1 w-full">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h4 className="font-semibold text-gray-900">{session.site_name}</h4>
                        <Badge variant="outline" className="text-xs whitespace-nowrap">
                          {session.site_code}
                        </Badge>
                        <Badge className={`${getStatusColor(session.status)} whitespace-nowrap`}>
                          {session.status}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <MonitorSpeaker className="w-4 h-4" />
                          <span>{session.config_name}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <CheckCircle className="w-4 h-4" />
                          <span>{session.scan_results?.length || 0} scans</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{session.start_time ? format(new Date(session.start_time), "MMM d, HH:mm") : "N/A"}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 w-full sm:w-auto">
                      {session.status === "active" && (
                        <Link to={createPageUrl("Progress", `sessionId=${session.id}`)} className="w-full sm:w-auto">
                          <Button variant="outline" size="sm" className="w-full">
                            Continue
                          </Button>
                        </Link>
                      )}
                      {session.status === "completed" && (
                        <Link to={createPageUrl("Export", `sessionId=${session.id}`)} className="w-full sm:w-auto">
                          <Button variant="outline" size="sm" className="w-full">
                            Export
                          </Button>
                        </Link>
                      )}
                      {session.status === "exported" && (
                        <Button variant="outline" size="sm" disabled className="w-full">
                          Exported
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

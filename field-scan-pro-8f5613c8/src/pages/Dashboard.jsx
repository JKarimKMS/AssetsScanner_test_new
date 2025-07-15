
import React, { useState, useEffect } from "react";
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
  Calendar
} from "lucide-react";
import { format } from "date-fns";

export default function Dashboard() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user has completed onboarding
    const onboardingCompleted = localStorage.getItem('onboardingCompleted');
    if (!onboardingCompleted) {
      navigate(createPageUrl("Onboarding"));
      return;
    }
    
    loadData();
  }, [navigate]);

  const loadData = async () => {
    try {
      const sessionData = await Session.list("-created_date", 10);
      setSessions(sessionData);
    } catch (error) {
      console.error("Error loading sessions:", error);
    } finally {
      setLoading(false);
    }
  };

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

  const completedSessions = sessions.filter(s => s.status === "completed").length;
  const activeSessions = sessions.filter(s => s.status === "active").length;
  const totalScans = sessions.reduce((sum, s) => sum + (s.scan_results?.length || 0), 0);

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
        <Card>
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

        <Card>
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

        <Card>
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

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">This Week</p>
                <p className="text-2xl font-bold mt-1 text-gray-900">{sessions.length}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>Recent Sessions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-20 bg-gray-200 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No sessions yet. Start your first installation!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map((session) => (
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
                          <span>{format(new Date(session.start_time), "MMM d, HH:mm")}</span>
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

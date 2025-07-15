
import React, { useState, useEffect } from "react";
import { Session } from "@/api/entities";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  CheckCircle, 
  Download, 
  Copy, 
  Share2,
  FileText,
  Clock,
  Monitor,
  AlertCircle,
  FileSpreadsheet
} from "lucide-react";
import { format } from "date-fns";

export default function Export() {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exportStatus, setExportStatus] = useState("idle");

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

  const generateCSV = () => {
    if (!session || !session.scan_results) return "";
    
    const headers = ["Site_Code", "Position", "Model_ID", "Serial_Number", "Asset_Tag", "Timestamp"];
    const rows = session.scan_results.map(result => [
      session.site_code,
      result.position_label,
      result.model_id,
      result.serial_number,
      result.asset_tag,
      format(new Date(result.timestamp), "yyyy-MM-dd'T'HH:mm:ss'Z'")
    ]);
    
    return [headers, ...rows].map(row => row.join(",")).join("\n");
  };

  const handleCopyToClipboard = async () => {
    setExportStatus("copying");
    try {
      const csvData = generateCSV();
      await navigator.clipboard.writeText(csvData);
      setExportStatus("copied");
      setTimeout(() => setExportStatus("idle"), 2000);
    } catch (error) {
      console.error("Error copying to clipboard:", error);
      setExportStatus("error");
      setTimeout(() => setExportStatus("idle"), 2000);
    }
  };

  const handleDownloadCSV = () => {
    setExportStatus("downloading");
    try {
      const csvData = generateCSV();
      const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      
      link.setAttribute("href", url);
      link.setAttribute("download", `${session.site_code}_${format(new Date(), "yyyy-MM-dd")}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setExportStatus("downloaded");
      setTimeout(() => setExportStatus("idle"), 2000);
    } catch (error) {
      console.error("Error downloading CSV:", error);
      setExportStatus("error");
      setTimeout(() => setExportStatus("idle"), 2000);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        const csvData = generateCSV();
        const blob = new Blob([csvData], { type: "text/csv" });
        const file = new File([blob], `${session.site_code}_${format(new Date(), "yyyy-MM-dd")}.csv`, {
          type: "text/csv"
        });
        
        await navigator.share({
          title: `Installation Data - ${session.site_name}`,
          text: `Equipment scan data for ${session.site_name}`,
          files: [file]
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    }
  };

  const markAsExported = async () => {
    try {
      await Session.update(session.id, { 
        status: "exported",
        exported_at: new Date().toISOString()
      });
      navigate(createPageUrl("Dashboard"));
    } catch (error) {
      console.error("Error marking as exported:", error);
    }
  };

  const getSessionDuration = () => {
    if (!session.start_time || !session.end_time) return "Unknown";
    const start = new Date(session.start_time);
    const end = new Date(session.end_time);
    const diffMinutes = Math.round((end - start) / (1000 * 60));
    return `${diffMinutes} minutes`;
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="h-32 bg-gray-200 rounded-lg"></div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
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
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-10 h-10 text-green-600 success-checkmark" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Session Complete!</h2>
        <p className="text-gray-600">All equipment has been scanned successfully</p>
      </div>

      {/* Session Summary */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Session Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 mb-1">{session.site_name}</div>
              <div className="text-sm text-gray-600">Site</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 mb-1">{session.scan_results?.length || 0}</div>
              <div className="text-sm text-gray-600">Screens Scanned</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 mb-1">{getSessionDuration()}</div>
              <div className="text-sm text-gray-600">Total Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 mb-1">{session.config_name}</div>
              <div className="text-sm text-gray-600">Configuration</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Preview */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>Scan Data Preview</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Position</th>
                  <th className="text-left p-2">Model ID</th>
                  <th className="text-left p-2">Serial Number</th>
                  <th className="text-left p-2">Asset Tag</th>
                  <th className="text-left p-2">Time</th>
                </tr>
              </thead>
              <tbody>
                {session.scan_results?.map((result, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-medium">{result.position_label}</td>
                    <td className="p-2 font-mono text-xs">{result.model_id}</td>
                    <td className="p-2 font-mono text-xs">{result.serial_number}</td>
                    <td className="p-2 font-mono text-xs">{result.asset_tag}</td>
                    <td className="p-2 text-xs text-gray-600">
                      {format(new Date(result.timestamp), "HH:mm")}
                    </td>
                  </tr>
                )) || (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-gray-500">
                      No scan data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Export Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Button
          variant="outline"
          size="lg"
          className="touch-target w-full"
          onClick={handleCopyToClipboard}
          disabled={exportStatus === "copying"}
        >
          <Copy className="w-4 h-4 mr-2" />
          {exportStatus === "copying" ? "Copying..." : 
           exportStatus === "copied" ? "Copied!" : "Copy CSV"}
        </Button>

        <Button
          variant="outline"
          size="lg"
          className="touch-target w-full"
          onClick={handleDownloadCSV}
          disabled={exportStatus === "downloading"}
        >
          <Download className="w-4 h-4 mr-2" />
          {exportStatus === "downloading" ? "Downloading..." : 
           exportStatus === "downloaded" ? "Downloaded!" : "Download CSV"}
        </Button>

        {navigator.share && (
          <Button
            variant="outline"
            size="lg"
            className="touch-target w-full"
            onClick={handleShare}
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share CSV
          </Button>
        )}

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="w-full">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full touch-target"
                  disabled
                >
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Generate Excel Report
                </Button>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>This feature is coming soon!</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Complete Actions */}
      <div className="flex flex-col md:flex-row gap-4">
        <Button
          size="lg"
          className="flex-1 bg-emerald-600 hover:bg-emerald-700 touch-target"
          onClick={markAsExported}
        >
          Mark as Exported & Continue
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="flex-1 touch-target"
          onClick={() => navigate(createPageUrl("SiteSelection"))}
        >
          Start New Session
        </Button>
      </div>
    </div>
  );
}

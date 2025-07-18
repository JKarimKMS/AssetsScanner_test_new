
import React, { useState, useEffect, useMemo } from "react";
import { Session } from "@/api/entities";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle,
  Download,
  Copy,
  Share2,
  FileText,
  Clock,
  Monitor,
  AlertCircle,
  FileSpreadsheet,
  FileJson,
  Mail,
  Settings,
  Save,
  Upload,
  Eye
} from "lucide-react";
import { format } from "date-fns";
import { SendEmail } from "@/api/integrations";
import { useToast } from "@/components/ui/use-toast";

export default function Export() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exportStatus, setExportStatus] = useState("idle");

  // Export configuration state
  const [exportConfig, setExportConfig] = useState({
    columns: {
      site_code: true,
      position: true,
      model_id: true,
      serial_number: true,
      asset_tag: true,
      timestamp: true,
      notes: false,
      photo_url: false
    },
    sortBy: "position",
    dateFormat: "yyyy-MM-dd'T'HH:mm:ss'Z'",
    includePhotos: false
  });

  // Email state
  const [emailData, setEmailData] = useState({
    to: "",
    subject: "",
    body: ""
  });
  const [isEmailSending, setIsEmailSending] = useState(false);

  // Template state
  const [templateName, setTemplateName] = useState("");
  const [savedTemplates, setSavedTemplates] = useState([]);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    loadSession();
    loadSavedTemplates();
  }, []);

  useEffect(() => {
    if (session) {
      const currentDate = new Date();
      const sessionEndDate = session.end_time ? new Date(session.end_time) : null;
      const sessionStartDate = session.start_time ? new Date(session.start_time) : null;

      const reportDate = sessionEndDate && !isNaN(sessionEndDate.getTime())
        ? sessionEndDate
        : (sessionStartDate && !isNaN(sessionStartDate.getTime())
          ? sessionStartDate
          : currentDate);

      setEmailData(prev => ({
        ...prev,
        subject: `[${session.site_code}] Installation Report - ${format(currentDate, "PPP")}`,
        body: `Installation report for ${session.site_name} (${session.site_code}) completed on ${format(reportDate, "PPP")}.\n\nTotal positions scanned: ${session.scan_results?.length || 0}\nConfiguration: ${session.config_name}\n\nPlease find the scan data attached.`
      }));
    }
  }, [session]);

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

  const loadSavedTemplates = () => {
    const templates = JSON.parse(localStorage.getItem('exportTemplates') || '[]');
    setSavedTemplates(templates);
  };

  // generateExportData must be defined before useMemo can call it
  const generateExportData = (formatType = 'csv') => {
    if (!session || !session.scan_results) return "";

    let data = [...session.scan_results];

    // Apply sorting
    switch (exportConfig.sortBy) {
      case "position":
        data.sort((a, b) => a.position_label.localeCompare(b.position_label));
        break;
      case "time":
        data.sort((a, b) => {
          const dateA = new Date(a.timestamp);
          const dateB = new Date(b.timestamp);
          return dateA - dateB;
        });
        break;
      case "model":
        data.sort((a, b) => a.model_id.localeCompare(b.model_id));
        break;
    }

    if (formatType === 'json') {
      const jsonData = {
        session_info: {
          site_name: session.site_name,
          site_code: session.site_code,
          config_name: session.config_name,
          start_time: session.start_time,
          end_time: session.end_time,
          total_positions: data.length
        },
        scan_results: data.map(result => {
          const row = {};
          if (exportConfig.columns.site_code) row.site_code = session.site_code;
          if (exportConfig.columns.position) row.position = result.position_label;
          if (exportConfig.columns.model_id) row.model_id = result.model_id;
          if (exportConfig.columns.serial_number) row.serial_number = result.serial_number;
          if (exportConfig.columns.asset_tag) row.asset_tag = result.asset_tag;
          if (exportConfig.columns.timestamp) {
            const timestamp = new Date(result.timestamp);
            row.timestamp = !isNaN(timestamp.getTime()) ? format(timestamp, exportConfig.dateFormat) : result.timestamp;
          }
          if (exportConfig.columns.notes && result.notes) row.notes = result.notes;
          if (exportConfig.columns.photo_url && result.photo_url) row.photo_url = result.photo_url;
          return row;
        })
      };
      return JSON.stringify(jsonData, null, 2);
    }

    // CSV format
    const headers = [];
    if (exportConfig.columns.site_code) headers.push("Site_Code");
    if (exportConfig.columns.position) headers.push("Position");
    if (exportConfig.columns.model_id) headers.push("Model_ID");
    if (exportConfig.columns.serial_number) headers.push("Serial_Number");
    if (exportConfig.columns.asset_tag) headers.push("Asset_Tag");
    if (exportConfig.columns.timestamp) headers.push("Timestamp");
    if (exportConfig.columns.notes) headers.push("Notes");
    if (exportConfig.columns.photo_url) headers.push("Photo_URL");

    const rows = data.map(result => {
      const row = [];
      if (exportConfig.columns.site_code) row.push(session.site_code);
      if (exportConfig.columns.position) row.push(result.position_label);
      if (exportConfig.columns.model_id) row.push(result.model_id);
      if (exportConfig.columns.serial_number) row.push(result.serial_number);
      if (exportConfig.columns.asset_tag) row.push(result.asset_tag);
      if (exportConfig.columns.timestamp) {
        const timestamp = new Date(result.timestamp);
        const formattedTime = !isNaN(timestamp.getTime()) ? format(timestamp, exportConfig.dateFormat) : result.timestamp;
        row.push(formattedTime);
      }
      if (exportConfig.columns.notes) row.push(result.notes || "");
      if (exportConfig.columns.photo_url) row.push(result.photo_url || "");
      return row;
    });

    return [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(",")).join("\n");
  };

  const generatedData = useMemo(() => {
    return {
      csv: generateExportData('csv'),
      json: generateExportData('json'),
    };
  }, [session, exportConfig]);

  const handleCopyToClipboard = async (formatType = 'csv') => {
    setExportStatus("copying");
    try {
      const data = formatType === 'csv' ? generatedData.csv : generatedData.json;
      await navigator.clipboard.writeText(data);
      toast({
        title: "Copied to clipboard!",
        variant: "success"
      });
      setExportStatus("copied");
      setTimeout(() => setExportStatus("idle"), 2000);
    } catch (error) {
      console.error("Error copying to clipboard:", error);
      toast({
        title: "Copy Failed",
        description: "Could not copy data to clipboard.",
        variant: "destructive"
      });
      setExportStatus("error");
      setTimeout(() => setExportStatus("idle"), 2000);
    }
  };

  const handleDownload = (formatType = 'csv') => {
    setExportStatus("downloading");
    try {
      const data = formatType === 'csv' ? generatedData.csv : generatedData.json;
      const mimeType = formatType === 'json' ? 'application/json' : 'text/csv';
      const extension = formatType === 'json' ? 'json' : 'csv';

      const blob = new Blob([data], { type: `${mimeType};charset=utf-8;` });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);

      const currentDate = new Date();
      const filename = `${session.site_code}_${format(currentDate, "yyyy-MM-dd")}.${extension}`;

      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Download Started",
        description: `Your ${formatType.toUpperCase()} file is downloading.`,
        variant: "success"
      });
      setExportStatus("downloaded");
      setTimeout(() => setExportStatus("idle"), 2000);
    } catch (error) {
      console.error("Error downloading file:", error);
      toast({
        title: "Download Failed",
        description: "There was an error preparing your download.",
        variant: "destructive"
      });
      setExportStatus("error");
      setTimeout(() => setExportStatus("idle"), 2000);
    }
  };

  const handleEmailExport = async () => {
    if (!emailData.to.trim()) {
      toast({
        title: "Recipient Missing",
        description: "Please enter an email address.",
        variant: "destructive"
      });
      return;
    }

    setIsEmailSending(true);
    try {
      const csvData = generatedData.csv; // Use memoized data here

      await SendEmail({
        to: emailData.to,
        subject: emailData.subject,
        body: `${emailData.body}\n\n--- CSV Data ---\n${csvData}`
      });

      toast({
        title: "Export Sent!",
        description: `The report has been sent to ${emailData.to}.`,
        variant: "success",
      });
      setEmailData(prev => ({ ...prev, to: "" }));
    } catch (error) {
      console.error("Error sending email:", error);

      // Handle the specific case where external emails aren't allowed
      if (error.message?.includes("outside the app") || error.message?.includes("404")) {
        toast({
          title: "Email Failed",
          description: "Email can only be sent to users within this app. Use copy or download instead.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Email Failed",
          description: "Could not send the email. Please try downloading the data instead.",
          variant: "destructive"
        });
      }
    } finally {
      setIsEmailSending(false);
    }
  };

  const handleSaveTemplate = () => {
    if (!templateName.trim()) {
      toast({
        title: "Template Name Required",
        description: "Please enter a name for your template.",
        variant: "destructive"
      });
      return;
    }

    const template = {
      id: Date.now().toString(),
      name: templateName,
      config: { ...exportConfig },
      created_at: new Date().toISOString()
    };

    const updatedTemplates = [...savedTemplates, template];
    setSavedTemplates(updatedTemplates);
    localStorage.setItem('exportTemplates', JSON.stringify(updatedTemplates));
    setTemplateName("");
    toast({
      title: "Template Saved!",
      variant: "success",
    });
  };

  const handleLoadTemplate = (template) => {
    setExportConfig(template.config);
    toast({
      title: "Template Loaded",
      description: `Settings from "${template.name}" have been applied.`,
      variant: "success",
    });
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

  const getPreviewData = () => {
    if (!session || !session.scan_results) return [];
    return session.scan_results.slice(0, 3); // Show first 3 rows for preview
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-6">
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
      <div className="max-w-6xl mx-auto px-4 py-6">
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
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-10 h-10 text-green-600 success-checkmark" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Session Complete!</h2>
        <p className="text-gray-600">Configure and export your installation data</p>
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

      {/* Export Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Configuration Panel */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="w-5 h-5" />
                <span>Export Configuration</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="columns" className="space-y-4">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="columns">Columns</TabsTrigger>
                  <TabsTrigger value="format">Format</TabsTrigger>
                  <TabsTrigger value="email">Email</TabsTrigger>
                  <TabsTrigger value="templates">Templates</TabsTrigger>
                </TabsList>

                <TabsContent value="columns" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(exportConfig.columns).map(([key, checked]) => (
                      <div key={key} className="flex items-center space-x-2">
                        <Checkbox
                          id={key}
                          checked={checked}
                          onCheckedChange={(checked) =>
                            setExportConfig(prev => ({
                              ...prev,
                              columns: { ...prev.columns, [key]: checked }
                            }))
                          }
                        />
                        <Label htmlFor={key} className="text-sm">
                          {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </Label>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="format" className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="sortBy">Sort By</Label>
                      <Select
                        value={exportConfig.sortBy}
                        onValueChange={(value) =>
                          setExportConfig(prev => ({ ...prev, sortBy: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="position">Position</SelectItem>
                          <SelectItem value="time">Timestamp</SelectItem>
                          <SelectItem value="model">Model ID</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="dateFormat">Date Format</Label>
                      <Select
                        value={exportConfig.dateFormat}
                        onValueChange={(value) =>
                          setExportConfig(prev => ({ ...prev, dateFormat: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yyyy-MM-dd'T'HH:mm:ss'Z'">ISO Format</SelectItem>
                          <SelectItem value="yyyy-MM-dd HH:mm:ss">Standard Format</SelectItem>
                          <SelectItem value="dd/MM/yyyy HH:mm">UK Format</SelectItem>
                          <SelectItem value="MM/dd/yyyy HH:mm">US Format</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="email" className="space-y-4">
                  <div className="space-y-4">
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                      <p className="text-sm text-amber-800">
                        <strong>Note:</strong> Email feature only works for users within this app. For external recipients, please use the download or copy options below.
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="emailTo">Email To (Internal Users Only)</Label>
                      <Input
                        id="emailTo"
                        type="email"
                        placeholder="user@company.com (must be app user)"
                        value={emailData.to}
                        onChange={(e) => setEmailData(prev => ({ ...prev, to: e.target.value }))}
                      />
                    </div>

                    <div>
                      <Label htmlFor="emailSubject">Subject</Label>
                      <Input
                        id="emailSubject"
                        value={emailData.subject}
                        onChange={(e) => setEmailData(prev => ({ ...prev, subject: e.target.value }))}
                      />
                    </div>

                    <div>
                      <Label htmlFor="emailBody">Message</Label>
                      <Textarea
                        id="emailBody"
                        rows={4}
                        value={emailData.body}
                        onChange={(e) => setEmailData(prev => ({ ...prev, body: e.target.value }))}
                      />
                    </div>

                    <Button
                      onClick={handleEmailExport}
                      disabled={isEmailSending || !emailData.to.trim()}
                      className="w-full"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      {isEmailSending ? "Sending..." : "Send to App User"}
                    </Button>

                    <div className="border-t pt-4">
                      <p className="text-sm text-gray-600 mb-3">For external recipients:</p>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopyToClipboard('csv')}
                          className="w-full"
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Copy Data
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload('csv')}
                          className="w-full"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="templates" className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Template name"
                        value={templateName}
                        onChange={(e) => setTemplateName(e.target.value)}
                      />
                      <Button onClick={handleSaveTemplate} disabled={!templateName.trim()}>
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <Label>Saved Templates</Label>
                      {savedTemplates.length === 0 ? (
                        <p className="text-sm text-gray-500">No saved templates</p>
                      ) : (
                        savedTemplates.map((template) => (
                          <div key={template.id} className="flex items-center justify-between p-2 border rounded-lg">
                            <div>
                              <div className="font-medium">{template.name}</div>
                              <div className="text-sm text-gray-500">
                                {format(new Date(template.created_at), "PPP")}
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleLoadTemplate(template)}
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              Load
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Preview Panel */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="w-5 h-5" />
                <span>Export Preview</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-sm text-gray-600">
                  {Object.values(exportConfig.columns).filter(Boolean).length} columns selected
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b">
                        {exportConfig.columns.site_code && <th className="text-left p-1">Site</th>}
                        {exportConfig.columns.position && <th className="text-left p-1">Pos</th>}
                        {exportConfig.columns.model_id && <th className="text-left p-1">Model</th>}
                        {exportConfig.columns.serial_number && <th className="text-left p-1">Serial</th>}
                        {exportConfig.columns.asset_tag && <th className="text-left p-1">Asset</th>}
                        {exportConfig.columns.timestamp && <th className="text-left p-1">Time</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {getPreviewData().map((result, index) => (
                        <tr key={index} className="border-b text-xs">
                          {exportConfig.columns.site_code && <td className="p-1">{session.site_code}</td>}
                          {exportConfig.columns.position && <td className="p-1">{result.position_label}</td>}
                          {exportConfig.columns.model_id && <td className="p-1">{result.model_id}</td>}
                          {exportConfig.columns.serial_number && <td className="p-1">{result.serial_number?.substring(0, 8)}...</td>}
                          {exportConfig.columns.asset_tag && <td className="p-1">{result.asset_tag}</td>}
                          {exportConfig.columns.timestamp && (
                            <td className="p-1">
                              {result.timestamp ? format(new Date(result.timestamp), "MM/dd") : "N/A"}
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {session.scan_results?.length > 3 && (
                  <div className="text-xs text-gray-500 text-center">
                    ... and {session.scan_results.length - 3} more rows
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Export Actions */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Export Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              variant="outline"
              size="lg"
              className="touch-target w-full"
              onClick={() => handleCopyToClipboard('csv')}
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
              onClick={() => handleDownload('csv')}
              disabled={exportStatus === "downloading"}
            >
              <Download className="w-4 h-4 mr-2" />
              {exportStatus === "downloading" ? "Downloading..." :
               exportStatus === "downloaded" ? "Downloaded!" : "Download CSV"}
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="touch-target w-full"
              onClick={() => handleDownload('json')}
            >
              <FileJson className="w-4 h-4 mr-2" />
              Download JSON
            </Button>

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
                      PDF Report
                    </Button>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>PDF export coming soon!</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardContent>
      </Card>

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

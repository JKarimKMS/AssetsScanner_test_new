import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, FileSpreadsheet, Eye, Download } from "lucide-react";
import { UploadFile } from "@/api/integrations";
import { ExcelTemplate } from "@/api/entities";
import FileUpload from '../components/settings/FileUpload';

export default function Settings() {
  const navigate = useNavigate();
  const [templateFile, setTemplateFile] = useState(null);
  const [activeTemplate, setActiveTemplate] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActiveTemplate();
  }, []);

  const loadActiveTemplate = async () => {
    try {
      const templates = await ExcelTemplate.filter({ is_active: true });
      if (templates.length > 0) {
        setActiveTemplate(templates[0]);
      }
    } catch (error) {
      console.error("Error loading active template:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file) => {
    if (!file) {
      setTemplateFile(null);
      return;
    }

    setTemplateFile(file);
    setUploading(true);

    try {
      // Upload file to storage
      const uploadResult = await UploadFile({ file: file });
      
      // Deactivate any existing templates
      const existingTemplates = await ExcelTemplate.filter({ is_active: true });
      for (const template of existingTemplates) {
        await ExcelTemplate.update(template.id, { is_active: false });
      }

      // Create new template record
      const templateData = {
        name: file.name,
        file_url: uploadResult.file_url,
        file_size: file.size,
        upload_date: new Date().toISOString(),
        is_active: true,
        config_mappings: {}
      };

      await ExcelTemplate.create(templateData);
      
      // Reload active template
      await loadActiveTemplate();
      
      // Show success notification
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);

    } catch (error) {
      console.error("Error uploading template:", error);
      alert("Failed to upload template. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleViewTemplate = () => {
    // This will be enhanced in the future
    if (activeTemplate) {
      alert(`Template: ${activeTemplate.name}\nUploaded: ${new Date(activeTemplate.upload_date).toLocaleDateString()}\nSize: ${formatBytes(activeTemplate.file_size)}`);
    } else {
      alert("No template has been uploaded yet.");
    }
  };

  const handleDownloadTemplate = () => {
    if (activeTemplate && activeTemplate.file_url) {
      window.open(activeTemplate.file_url, '_blank');
    }
  };

  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-in slide-in-from-top">
          <div className="flex items-center space-x-2">
            <FileSpreadsheet className="w-5 h-5" />
            <span>Template uploaded successfully!</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(createPageUrl("Dashboard"))}
          className="touch-target"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
          <p className="text-gray-600">Manage application settings and templates</p>
        </div>
      </div>

      {/* Excel Template Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <FileSpreadsheet className="w-6 h-6 text-emerald-600" />
            <div>
              <CardTitle>Excel Template Management</CardTitle>
              <CardDescription>Upload and manage the master Excel template for data exports.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Active Template */}
          {!loading && activeTemplate && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-blue-900 mb-2">Current Active Template</h4>
              <div className="text-sm text-blue-800 space-y-1">
                <p><strong>Name:</strong> {activeTemplate.name}</p>
                <p><strong>Uploaded:</strong> {new Date(activeTemplate.upload_date).toLocaleDateString()}</p>
                <p><strong>Size:</strong> {formatBytes(activeTemplate.file_size)}</p>
              </div>
              <div className="flex space-x-2 mt-3">
                <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          )}

          <FileUpload 
            onFileUpload={handleFileUpload} 
            uploadedFile={templateFile}
            uploading={uploading}
          />
          
          <div className="flex justify-end">
            <Button 
              variant="outline" 
              onClick={handleViewTemplate}
              disabled={!activeTemplate}
            >
              <Eye className="w-4 h-4 mr-2" />
              View Template Details
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
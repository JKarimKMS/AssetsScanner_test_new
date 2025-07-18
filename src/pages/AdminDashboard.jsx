import React, { useState, useEffect, useRef } from 'react';
import { Site, Session } from '@/api/entities';
import { UploadFile } from '@/api/integrations';
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { 
  Upload, FileText, Settings, Users, Plus, Edit, Archive, Trash, 
  Download, UserPlus, RefreshCw, Loader2, X, Search, File, 
  FileX, ExternalLink, LogOut, Building, Shield, Save
} from "lucide-react";
import { format } from "date-fns";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef(null);
  
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Sites state
  const [sites, setSites] = useState([]);
  const [newSite, setNewSite] = useState({});
  const [siteSearch, setSiteSearch] = useState('');
  const [filteredSites, setFilteredSites] = useState([]);
  
  // Documents state
  const [selectedSiteId, setSelectedSiteId] = useState('');
  const [docSiteSearch, setDocSiteSearch] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [currentDocuments, setCurrentDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [loadingDocs, setLoadingDocs] = useState(false);
  
  // Users state
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState('');
  const [activeSessions, setActiveSessions] = useState([]);
  
  // Settings state
  const [appSettings, setAppSettings] = useState({
    requirePhoto: true,
    strictValidation: false,
    allowDuplicates: false,
    enableNotes: true
  });

  // Check authentication on load
  useEffect(() => {
    const authExpiry = localStorage.getItem('adminAuthExpiry');
    if (authExpiry && new Date(authExpiry) > new Date()) {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  // Load data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadSites();
      loadUsers();
      loadActiveSessions();
      loadAppSettings();
    }
  }, [isAuthenticated]);

  // Filter sites based on search
  useEffect(() => {
    if (siteSearch) {
      setFilteredSites(sites.filter(site => 
        site.name.toLowerCase().includes(siteSearch.toLowerCase()) ||
        site.code.toLowerCase().includes(siteSearch.toLowerCase())
      ));
    } else {
      setFilteredSites(sites);
    }
  }, [sites, siteSearch]);

  // Load documents when site is selected
  useEffect(() => {
    if (selectedSiteId) {
      loadDocumentsForSite(selectedSiteId);
    }
  }, [selectedSiteId]);

  // Authentication handlers
  const handleLogin = () => {
    if (password === 'admin2025') {
      const expiry = new Date();
      expiry.setHours(expiry.getHours() + 24);
      localStorage.setItem('adminAuthExpiry', expiry.toISOString());
      setIsAuthenticated(true);
      setPassword('');
      toast({
        title: "Successfully logged in",
        description: "Welcome to the admin dashboard",
        variant: "success"
      });
    } else {
      toast({
        title: "Invalid password",
        description: "Please try again",
        variant: "destructive"
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminAuthExpiry');
    setIsAuthenticated(false);
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
      variant: "success"
    });
  };

  // Data loading functions
  const loadSites = async () => {
    try {
      const siteData = await Site.list();
      setSites(siteData);
    } catch (error) {
      console.error('Error loading sites:', error);
      toast({
        title: "Error loading sites",
        description: "Could not load site data",
        variant: "destructive"
      });
    }
  };

  const loadUsers = () => {
    const storedUsers = JSON.parse(localStorage.getItem('fieldScannerUsers') || '[]');
    setUsers(storedUsers);
  };

  const loadActiveSessions = async () => {
    try {
      const sessions = await Session.filter({ status: 'active' });
      setActiveSessions(sessions);
    } catch (error) {
      console.error('Error loading active sessions:', error);
    }
  };

  const loadAppSettings = () => {
    const storedSettings = JSON.parse(localStorage.getItem('fieldScannerSettings') || '{}');
    setAppSettings({ ...appSettings, ...storedSettings });
  };

  const loadDocumentsForSite = async (siteId) => {
    setLoadingDocs(true);
    try {
      const site = sites.find(s => s.id === siteId);
      if (site) {
        setCurrentDocuments(site.documents || []);
      }
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setLoadingDocs(false);
    }
  };

  // Site management functions
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

  const handleAddSite = async () => {
    try {
      const siteData = {
        name: newSite.name,
        code: newSite.code,
        brand: newSite.brand,
        address: newSite.address,
        installation_date: newSite.installation_date,
        status: newSite.status || 'pending',
        configurations: [generateConfigurationData(newSite.configuration, newSite.brand)],
        documents: [],
        reference_photos: [],
        has_sow: false,
        has_special_instructions: false,
        site_contacts: []
      };
      
      await Site.create(siteData);
      toast({
        title: "Site added successfully",
        description: `${newSite.name} has been added to the system`,
        variant: "success"
      });
      setNewSite({});
      loadSites();
    } catch (error) {
      console.error('Error adding site:', error);
      toast({
        title: "Failed to add site",
        description: "There was an error creating the site",
        variant: "destructive"
      });
    }
  };

  const handleArchiveSite = async (siteId) => {
    if (window.confirm('Are you sure you want to archive this site?')) {
      try {
        await Site.update(siteId, { status: 'archived' });
        toast({
          title: "Site archived",
          description: "The site has been archived successfully",
          variant: "success"
        });
        loadSites();
      } catch (error) {
        toast({
          title: "Failed to archive site",
          description: "There was an error archiving the site",
          variant: "destructive"
        });
      }
    }
  };

  const editSite = (site) => {
    setNewSite({
      ...site,
      configuration: site.configurations?.[0]?.name || ''
    });
    toast({
      title: "Site loaded for editing",
      description: "Make your changes and click Add Site to update",
      variant: "default"
    });
  };

  // Document management functions
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
  };

  const handleFiles = (files) => {
    const validFiles = files.filter(file => {
      const validTypes = ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'];
      const extension = file.name.split('.').pop().toLowerCase();
      const isValidType = validTypes.includes(extension);
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB
      
      if (!isValidType) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a supported file type`,
          variant: "destructive"
        });
        return false;
      }
      
      if (!isValidSize) {
        toast({
          title: "File too large",
          description: `${file.name} is larger than 10MB`,
          variant: "destructive"
        });
        return false;
      }
      
      return true;
    });

    setSelectedFiles(prev => [...prev, ...validFiles.map(file => ({
      ...file,
      customName: file.name.split('.').slice(0, -1).join('.'),
      docType: '',
      category: ''
    }))]);
  };

  const updateFileName = (index, name) => {
    setSelectedFiles(prev => prev.map((file, i) => 
      i === index ? { ...file, customName: name } : file
    ));
  };

  const updateFileType = (index, type) => {
    setSelectedFiles(prev => prev.map((file, i) => 
      i === index ? { ...file, docType: type } : file
    ));
  };

  const updateFileCategory = (index, category) => {
    setSelectedFiles(prev => prev.map((file, i) => 
      i === index ? { ...file, category: category } : file
    ));
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUploadAll = async () => {
    setUploading(true);
    setUploadProgress(0);
    
    const site = sites.find(s => s.id === selectedSiteId);
    if (!site) return;
    
    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      try {
        const result = await UploadFile({ file: file });
        
        const currentDocs = site.documents || [];
        const newDoc = {
          id: Date.now().toString() + i,
          type: file.docType || 'other',
          title: file.customName || file.name,
          url: result.file_url,
          uploaded_date: new Date().toISOString(),
          file_type: file.name.split('.').pop().toLowerCase(),
          file_size: file.size,
          category: file.category || 'reference'
        };
        
        await Site.update(selectedSiteId, {
          documents: [...currentDocs, newDoc]
        });
        
        setUploadProgress(i + 1);
      } catch (error) {
        console.error('Upload failed:', error);
        toast({
          title: "Upload failed",
          description: `Failed to upload ${file.name}`,
          variant: "destructive"
        });
      }
    }
    
    setUploading(false);
    setSelectedFiles([]);
    toast({
      title: "All files uploaded successfully!",
      description: `${selectedFiles.length} documents have been uploaded`,
      variant: "success"
    });
    loadSites();
    loadDocumentsForSite(selectedSiteId);
  };

  const handleDeleteDocument = async (docId) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        const site = sites.find(s => s.id === selectedSiteId);
        const updatedDocs = site.documents.filter(doc => doc.id !== docId);
        
        await Site.update(selectedSiteId, { documents: updatedDocs });
        
        toast({
          title: "Document deleted",
          description: "The document has been removed successfully",
          variant: "success"
        });
        loadSites();
        loadDocumentsForSite(selectedSiteId);
      } catch (error) {
        toast({
          title: "Failed to delete document",
          description: "There was an error deleting the document",
          variant: "destructive"
        });
      }
    }
  };

  // User management functions
  const handleAddUser = async () => {
    if (!newUser.trim()) return;
    
    const userData = {
      id: Date.now().toString(),
      email: newUser,
      isActive: true,
      created_at: new Date().toISOString()
    };
    
    const currentUsers = JSON.parse(localStorage.getItem('fieldScannerUsers') || '[]');
    currentUsers.push(userData);
    localStorage.setItem('fieldScannerUsers', JSON.stringify(currentUsers));
    
    setUsers(currentUsers);
    setNewUser('');
    toast({
      title: "User added successfully",
      description: `${newUser} has been granted access to the app`,
      variant: "success"
    });
  };

  const handleRemoveUser = (userId) => {
    if (window.confirm('Are you sure you want to remove this user?')) {
      const currentUsers = users.filter(user => user.id !== userId);
      localStorage.setItem('fieldScannerUsers', JSON.stringify(currentUsers));
      setUsers(currentUsers);
      toast({
        title: "User removed",
        description: "The user has been removed from the system",
        variant: "success"
      });
    }
  };

  const toggleUserAccess = (userId, isActive) => {
    const currentUsers = users.map(user => 
      user.id === userId ? { ...user, isActive } : user
    );
    localStorage.setItem('fieldScannerUsers', JSON.stringify(currentUsers));
    setUsers(currentUsers);
    toast({
      title: `User ${isActive ? 'activated' : 'deactivated'}`,
      description: `Access has been ${isActive ? 'granted' : 'revoked'}`,
      variant: "success"
    });
  };

  const handleForceComplete = async (sessionId) => {
    if (window.confirm('Are you sure you want to force complete this session?')) {
      try {
        await Session.update(sessionId, { 
          status: 'completed',
          end_time: new Date().toISOString()
        });
        toast({
          title: "Session completed",
          description: "The session has been marked as completed",
          variant: "success"
        });
        loadActiveSessions();
      } catch (error) {
        toast({
          title: "Failed to complete session",
          description: "There was an error completing the session",
          variant: "destructive"
        });
      }
    }
  };

  // Settings management
  const updateAppSetting = (key, value) => {
    const newSettings = { ...appSettings, [key]: value };
    setAppSettings(newSettings);
    localStorage.setItem('fieldScannerSettings', JSON.stringify(newSettings));
    toast({
      title: "Setting updated",
      description: `${key} has been ${value ? 'enabled' : 'disabled'}`,
      variant: "success"
    });
  };

  // Utility functions
  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return 'Unknown';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const handleCSVImport = async (file) => {
    // TODO: Implement CSV import functionality
    toast({
      title: "CSV Import",
      description: "This feature will be implemented in a future update",
      variant: "default"
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Shield className="w-12 h-12 mx-auto mb-4 text-gray-600" />
            <CardTitle>Admin Access Required</CardTitle>
            <CardDescription>Enter password to access admin dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter admin password"
                    autoFocus
                  />
                </div>
                <Button type="submit" className="w-full">
                  Login
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main admin interface
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Manage sites, documents, users, and settings</p>
        </div>
        <Button variant="outline" onClick={handleLogout}>
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>

      <Tabs defaultValue="sites" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="sites">
            <Building className="w-4 h-4 mr-2" />
            Sites
          </TabsTrigger>
          <TabsTrigger value="documents">
            <FileText className="w-4 h-4 mr-2" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="users">
            <Users className="w-4 h-4 mr-2" />
            Users
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Sites Tab */}
        <TabsContent value="sites" className="space-y-6">
          {/* Add New Site Form */}
          <Card>
            <CardHeader>
              <CardTitle>Add New Site</CardTitle>
              <CardDescription>Create a new site for equipment installation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Site Name*</Label>
                  <Input 
                    placeholder="e.g., Ladbrokes Oxford Street" 
                    value={newSite.name || ''}
                    onChange={(e) => setNewSite({...newSite, name: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label>Site Code*</Label>
                  <Input 
                    placeholder="e.g., L1234" 
                    value={newSite.code || ''}
                    onChange={(e) => setNewSite({...newSite, code: e.target.value.toUpperCase()})}
                    maxLength={6}
                  />
                </div>
                
                <div>
                  <Label>Brand*</Label>
                  <Select value={newSite.brand || ''} onValueChange={(value) => setNewSite({...newSite, brand: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select brand" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Ladbrokes">Ladbrokes</SelectItem>
                      <SelectItem value="Coral">Coral</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Configuration*</Label>
                  <Select value={newSite.configuration || ''} onValueChange={(value) => setNewSite({...newSite, configuration: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select configuration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="4 over 4">4 over 4</SelectItem>
                      <SelectItem value="5 over 5">5 over 5</SelectItem>
                      <SelectItem value="5 over 1">5 over 1</SelectItem>
                      <SelectItem value="5 straight">5 straight</SelectItem>
                      <SelectItem value="6 over 6">6 over 6</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="md:col-span-2">
                  <Label>Address*</Label>
                  <Input 
                    placeholder="Full address" 
                    value={newSite.address || ''}
                    onChange={(e) => setNewSite({...newSite, address: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label>Installation Date</Label>
                  <Input 
                    type="date" 
                    value={newSite.installation_date || ''}
                    onChange={(e) => setNewSite({...newSite, installation_date: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label>Status</Label>
                  <Select value={newSite.status || 'pending'} onValueChange={(value) => setNewSite({...newSite, status: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending Installation</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex justify-end mt-6 space-x-2">
                <Button variant="outline" onClick={() => setNewSite({})}>
                  Clear
                </Button>
                <Button 
                  onClick={handleAddSite} 
                  disabled={!newSite.name || !newSite.code || !newSite.brand || !newSite.configuration || !newSite.address}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Site
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Existing Sites Table */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <CardTitle>All Sites ({sites.length})</CardTitle>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:flex-initial">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input 
                      placeholder="Search sites..." 
                      value={siteSearch}
                      onChange={(e) => setSiteSearch(e.target.value)}
                      className="pl-9 w-full sm:w-64"
                    />
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => document.getElementById('csvInput').click()}>
                    <Upload className="w-4 h-4 mr-2" />
                    Import
                  </Button>
                  <input
                    id="csvInput"
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={(e) => handleCSVImport(e.target.files[0])}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Brand</TableHead>
                      <TableHead>Config</TableHead>
                      <TableHead>Install Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSites.map(site => (
                      <TableRow key={site.id}>
                        <TableCell className="font-mono">{site.code}</TableCell>
                        <TableCell>{site.name}</TableCell>
                        <TableCell>
                          <Badge className={site.brand === 'Coral' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}>
                            {site.brand}
                          </Badge>
                        </TableCell>
                        <TableCell>{site.configurations?.[0]?.name || 'Not set'}</TableCell>
                        <TableCell>
                          {site.installation_date ? format(new Date(site.installation_date), 'MMM d, yyyy') : '-'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            site.status === 'completed' ? 'default' : 
                            site.status === 'active' ? 'default' : 'secondary'
                          }>
                            {site.status || 'pending'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            <Button variant="ghost" size="sm" onClick={() => editSite(site)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setSelectedSiteId(site.id)}>
                              <FileText className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleArchiveSite(site.id)}
                              className="text-red-600"
                            >
                              <Archive className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-6">
          {/* Site Selector */}
          <Card>
            <CardHeader>
              <CardTitle>Select Site</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedSiteId} onValueChange={setSelectedSiteId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a site to manage documents" />
                </SelectTrigger>
                <SelectContent>
                  <div className="p-2">
                    <Input 
                      placeholder="Search sites..." 
                      value={docSiteSearch}
                      onChange={(e) => setDocSiteSearch(e.target.value)}
                      className="mb-2"
                    />
                  </div>
                  {sites
                    .filter(s => s.name.toLowerCase().includes(docSiteSearch.toLowerCase()) || 
                                s.code.toLowerCase().includes(docSiteSearch.toLowerCase()))
                    .map(site => (
                      <SelectItem key={site.id} value={site.id}>
                        {site.name} ({site.code})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {selectedSiteId && (
            <>
              {/* Upload Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Upload Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div 
                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                      isDragging ? 'border-emerald-500 bg-emerald-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                    
                    <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="font-semibold mb-2">Drop files here or click to upload</p>
                    <p className="text-sm text-gray-500">PDF, JPG, PNG, DOC (Max 10MB each)</p>
                  </div>

                  {/* File Preview */}
                  {selectedFiles.length > 0 && (
                    <div className="mt-6 space-y-3">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-start space-x-3">
                            <FileText className="w-8 h-8 text-gray-500 flex-shrink-0" />
                            <div className="flex-1">
                              <Input
                                type="text"
                                value={file.customName || file.name}
                                onChange={(e) => updateFileName(index, e.target.value)}
                                className="font-semibold mb-2"
                                placeholder="Document title"
                              />
                              <div className="grid grid-cols-2 gap-2">
                                <Select 
                                  value={file.docType || ''} 
                                  onValueChange={(value) => updateFileType(index, value)}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Document type" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="sow">SOW</SelectItem>
                                    <SelectItem value="floor_plan">Floor Plan</SelectItem>
                                    <SelectItem value="photo">Reference Photo</SelectItem>
                                    <SelectItem value="specification">Specification</SelectItem>
                                    <SelectItem value="instruction">Instructions</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                  </SelectContent>
                                </Select>
                                
                                <Select 
                                  value={file.category || ''} 
                                  onValueChange={(value) => updateFileCategory(index, value)}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Category" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="installation">Installation</SelectItem>
                                    <SelectItem value="safety">Safety</SelectItem>
                                    <SelectItem value="reference">Reference</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <p className="text-sm text-gray-500 mt-2">
                                {(file.size / 1024 / 1024).toFixed(1)} MB
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeFile(index)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      
                      <Button 
                        onClick={handleUploadAll} 
                        disabled={uploading}
                        className="w-full"
                      >
                        {uploading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Uploading {uploadProgress}/{selectedFiles.length}
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 mr-2" />
                            Upload {selectedFiles.length} Files
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Current Documents */}
              <Card>
                <CardHeader>
                  <CardTitle>Current Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingDocs ? (
                    <div className="space-y-2">
                      {[1,2,3].map(i => <Skeleton key={i} className="h-12" />)}
                    </div>
                  ) : currentDocuments.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <FileX className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p>No documents uploaded for this site</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Document</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Uploaded</TableHead>
                            <TableHead>Size</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {currentDocuments.map(doc => (
                            <TableRow key={doc.id}>
                              <TableCell className="font-medium">{doc.title}</TableCell>
                              <TableCell>
                                <Badge variant="outline">{doc.type}</Badge>
                              </TableCell>
                              <TableCell>
                                {doc.uploaded_date ? format(new Date(doc.uploaded_date), "MMM d, yyyy") : '-'}
                              </TableCell>
                              <TableCell>{formatFileSize(doc.file_size)}</TableCell>
                              <TableCell className="text-right">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => window.open(doc.url)}
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => handleDeleteDocument(doc.id)}
                                  className="text-red-600"
                                >
                                  <Trash className="w-4 h-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Engineer Access</CardTitle>
              <CardDescription>Control who can use the Field Scanner app</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <Input 
                    placeholder="Engineer email or ID" 
                    value={newUser}
                    onChange={(e) => setNewUser(e.target.value)}
                  />
                  <Button onClick={handleAddUser}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add User
                  </Button>
                </div>
                
                <div className="border rounded-lg divide-y">
                  {users.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p>No users added yet</p>
                    </div>
                  ) : (
                    users.map(user => (
                      <div key={user.id} className="flex items-center justify-between p-4">
                        <div>
                          <p className="font-medium">{user.email}</p>
                          <p className="text-sm text-gray-500">
                            Added {format(new Date(user.created_at), 'MMM d, yyyy')}
                          </p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2">
                            <Label htmlFor={`active-${user.id}`} className="text-sm">Active</Label>
                            <Switch 
                              id={`active-${user.id}`}
                              checked={user.isActive} 
                              onCheckedChange={(checked) => toggleUserAccess(user.id, checked)}
                            />
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleRemoveUser(user.id)}
                            className="text-red-600"
                          >
                            <Trash className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Sessions */}
          <Card>
            <CardHeader>
              <CardTitle>Active Sessions</CardTitle>
              <CardDescription>Current scanning sessions in progress</CardDescription>
            </CardHeader>
            <CardContent>
              {activeSessions.length === 0 ? (
                <p className="text-center text-gray-500 py-4">No active sessions</p>
              ) : (
                <div className="space-y-2">
                  {activeSessions.map(session => (
                    <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{session.site_name}</p>
                        <p className="text-sm text-gray-500">
                          Started {format(new Date(session.start_time), 'h:mm a')} • 
                          {session.scan_results?.length || 0} scans completed
                        </p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleForceComplete(session.id)}
                      >
                        Force Complete
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>App Settings</CardTitle>
              <CardDescription>Configure validation rules and features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Require Photo Documentation</Label>
                    <p className="text-sm text-gray-500">Enforce photo for every scan</p>
                  </div>
                  <Switch 
                    checked={appSettings.requirePhoto} 
                    onCheckedChange={(checked) => updateAppSetting('requirePhoto', checked)} 
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Strict Validation</Label>
                    <p className="text-sm text-gray-500">Enforce exact format matching</p>
                  </div>
                  <Switch 
                    checked={appSettings.strictValidation} 
                    onCheckedChange={(checked) => updateAppSetting('strictValidation', checked)} 
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Allow Duplicate Serials</Label>
                    <p className="text-sm text-gray-500">Show warning instead of blocking</p>
                  </div>
                  <Switch 
                    checked={appSettings.allowDuplicates} 
                    onCheckedChange={(checked) => updateAppSetting('allowDuplicates', checked)} 
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Notes Field</Label>
                    <p className="text-sm text-gray-500">Allow engineers to add notes</p>
                  </div>
                  <Switch 
                    checked={appSettings.enableNotes} 
                    onCheckedChange={(checked) => updateAppSetting('enableNotes', checked)} 
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Download className="w-4 h-4 mr-2" />
                Export All Data
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <RefreshCw className="w-4 h-4 mr-2" />
                Clear Test Sessions
              </Button>
              <Button variant="outline" className="w-full justify-start text-red-600">
                <Trash className="w-4 h-4 mr-2" />
                Reset All Data
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
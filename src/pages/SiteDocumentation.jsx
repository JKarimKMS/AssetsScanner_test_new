
import React, { useState, useEffect } from 'react';
import { Site } from '@/api/entities';
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowLeft, FileText, Image as ImageIcon, Download, Search, Phone, Mail, Copy,
  ExternalLink, Calendar, HardDrive, User, Building, Camera, MapPin, AlertCircle,
  File, FileX, X, Filter, Users, BookOpen
} from "lucide-react";
import { format, parseISO } from "date-fns";
import PhotoPreviewModal from "../components/scanner/PhotoPreviewModal";

const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return 'Unknown size';
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
};

const getFileIcon = (fileType) => {
  switch(fileType?.toLowerCase()) {
    case 'pdf': return <FileText className="w-10 h-10 text-red-500" />;
    case 'doc':
    case 'docx': return <FileText className="w-10 h-10 text-blue-500" />;
    case 'jpg':
    case 'jpeg':
    case 'png': return <ImageIcon className="w-10 h-10 text-green-500" />;
    default: return <File className="w-10 h-10 text-gray-500" />;
  }
};

export default function SiteDocumentation() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [site, setSite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [downloadingAll, setDownloadingAll] = useState(false);

  useEffect(() => {
    loadSiteData();
  }, []);

  const loadSiteData = async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const siteId = urlParams.get("siteId");
      
      if (siteId) {
        const siteData = await Site.filter({ id: siteId });
        let currentSite = siteData[0];
        
        if (!currentSite.documents || currentSite.documents.length === 0) {
          currentSite.documents = generateMockDocuments();
        }
        if (!currentSite.reference_photos || currentSite.reference_photos.length === 0) {
          currentSite.reference_photos = generateMockPhotos();
        }
        if (!currentSite.site_contacts || currentSite.site_contacts.length === 0) {
          currentSite.site_contacts = generateMockContacts();
        }
        
        currentSite.has_sow = currentSite.documents.some(doc => doc.type === 'sow');
        currentSite.has_special_instructions = currentSite.documents.some(doc => doc.type === 'instruction');
        
        setSite(currentSite);
      }
    } catch (error) {
      console.error("Error loading site data:", error);
      toast({
        title: "Error Loading Site",
        description: "Could not load site documentation.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const generateMockDocuments = () => {
    return [
      { id: "doc-1", type: "sow", title: "Statement of Work", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", uploaded_date: "2025-01-15T10:30:00Z", file_type: "pdf", file_size: 2457600, category: "installation" },
      { id: "doc-2", type: "floor_plan", title: "Site Floor Plan", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", uploaded_date: "2025-01-14T14:20:00Z", file_type: "pdf", file_size: 1843200, category: "reference" },
      { id: "doc-3", type: "instruction", title: "Special Instructions", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", uploaded_date: "2025-01-12T16:45:00Z", file_type: "pdf", file_size: 512000, category: "safety" }
    ];
  };

  const generateMockPhotos = () => {
    return [
      { id: "photo-1", caption: "Main Entrance", url: "https://placehold.co/400x300/0099cc/white?text=Entrance", category: "exterior", taken_date: "2025-01-10T12:00:00Z" },
      { id: "photo-2", caption: "Gaming Floor", url: "https://placehold.co/400x300/d70f37/white?text=Gaming+Floor", category: "interior", taken_date: "2025-01-10T12:15:00Z" },
      { id: "photo-3", caption: "Gantry Setup", url: "https://placehold.co/400x300/34d399/white?text=Gantry", category: "equipment", taken_date: "2025-01-10T12:30:00Z" },
    ];
  };

  const generateMockContacts = () => {
    return [
      { name: "Sarah Johnson", role: "Manager", phone: "+447700900123", email: "sarah.j@site.com", notes: "Site manager" },
      { name: "Mike Security", role: "Security", phone: "+447700900456", email: "security@site.com", notes: "24/7 security" },
    ];
  };

  const handleDownloadAll = async () => {
    if (!site?.documents?.length) {
      toast({ title: "No documents to download.", variant: "destructive" });
      return;
    }
    setDownloadingAll(true);
    try {
      site.documents.forEach((doc, index) => {
        setTimeout(() => window.open(doc.url, '_blank'), index * 200);
      });
      toast({ title: `Opening ${site.documents.length} documents...`, variant: "success" });
    } catch (e) {
      toast({ title: "Download failed.", description: "Could not open documents.", variant: "destructive" });
    } finally {
      setTimeout(() => setDownloadingAll(false), 2000);
    }
  };

  if (loading) {
    return <PageSkeleton />;
  }

  if (!site) {
    return (
      <div className="flex items-center justify-center h-screen">
        <EmptyView
          Icon={FileX}
          title="Site Not Found"
          message="Could not load documentation for this site."
          actionText="Back to Dashboard"
          onAction={() => navigate(createPageUrl("Dashboard"))}
        />
      </div>
    );
  }
  
  const allDocuments = site.documents || [];
  const sowDocuments = allDocuments.filter(doc => doc.type === 'sow');
  const floorPlanDocuments = allDocuments.filter(doc => doc.type === 'floor_plan');
  const referencePhotos = site.reference_photos || [];
  const siteContacts = site.site_contacts || [];

  const filteredContent = {
    docs: allDocuments.filter(doc => (doc.title || "").toLowerCase().includes(searchTerm.toLowerCase())),
    sow: sowDocuments.filter(doc => (doc.title || "").toLowerCase().includes(searchTerm.toLowerCase())),
    photos: referencePhotos.filter(photo => (photo.caption || "").toLowerCase().includes(searchTerm.toLowerCase())),
    plans: floorPlanDocuments.filter(doc => (doc.title || "").toLowerCase().includes(searchTerm.toLowerCase())),
    contacts: siteContacts.filter(contact => (contact.name || "").toLowerCase().includes(searchTerm.toLowerCase())),
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 pb-20">
      <style>{`.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; } .scrollbar-hide::-webkit-scrollbar { display: none; }`}</style>
      
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="touch-target -ml-2"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h2 className="text-xl font-bold text-gray-900 truncate">{site.name} Docs</h2>
        <Button 
          onClick={handleDownloadAll}
          disabled={downloadingAll || !allDocuments.length}
          size="sm"
          variant="outline"
          className="touch-target"
        >
          <Download className="w-4 h-4 mr-2" />
          <span>{downloadingAll ? "Opening..." : "All"}</span>
        </Button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          type="text"
          placeholder="Search documents, photos, contacts..."
          className="pl-9 pr-9"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7"
            onClick={() => setSearchTerm("")}
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="sow">SOW</TabsTrigger>
          <TabsTrigger value="photos">Photos</TabsTrigger>
          <TabsTrigger value="plans">Plans</TabsTrigger>
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <OverviewCard Icon={FileText} title="Documents" count={allDocuments.length} color="blue" onClick={() => {}} />
            <OverviewCard Icon={Camera} title="Photos" count={referencePhotos.length} color="green" onClick={() => setActiveTab('photos')} />
            <OverviewCard Icon={Users} title="Contacts" count={siteContacts.length} color="purple" onClick={() => setActiveTab('contacts')} />
            <OverviewCard Icon={BookOpen} title="SOW" count={sowDocuments.length} color="orange" onClick={() => setActiveTab('sow')} />
          </div>
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          {filteredContent.docs.slice(0,3).map(doc => <DocumentCard key={doc.id} document={doc} />)}
        </TabsContent>

        <TabsContent value="sow">
          {filteredContent.sow.length > 0 ? (
            filteredContent.sow.map(doc => <DocumentCard key={doc.id} document={doc} />)
          ) : (
            <EmptyView Icon={FileX} title="No SOW Available" message="Contact your manager for the Statement of Work." />
          )}
        </TabsContent>
        
        <TabsContent value="photos">
           {filteredContent.photos.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredContent.photos.map(photo => <PhotoCard key={photo.id} photo={photo} onClick={() => setSelectedPhoto(photo)} />)}
            </div>
          ) : (
            <EmptyView Icon={Camera} title="No Photos" message="No reference photos have been uploaded." />
          )}
        </TabsContent>

        <TabsContent value="plans">
          {filteredContent.plans.length > 0 ? (
            filteredContent.plans.map(doc => <DocumentCard key={doc.id} document={doc} />)
          ) : (
            <EmptyView Icon={MapPin} title="No Floor Plans" message="No floor plans have been uploaded for this site." />
          )}
        </TabsContent>
        
        <TabsContent value="contacts">
           {filteredContent.contacts.length > 0 ? (
            <div className="space-y-3">
              {filteredContent.contacts.map(contact => <ContactCard key={contact.name} contact={contact} />)}
            </div>
          ) : (
            <EmptyView Icon={Users} title="No Contacts" message="No site contacts have been added." />
          )}
        </TabsContent>
      </Tabs>
      
      {selectedPhoto && <PhotoPreviewModal photoUrl={selectedPhoto.url} onClose={() => setSelectedPhoto(null)} />}
    </div>
  );
}

function OverviewCard({ Icon, title, count, color, onClick }) {
  const colors = {
    blue: "bg-blue-50 border-blue-200 text-blue-600",
    green: "bg-green-50 border-green-200 text-green-600",
    purple: "bg-purple-50 border-purple-200 text-purple-600",
    orange: "bg-orange-50 border-orange-200 text-orange-600",
  };
  return (
    <Card className={`shadow-sm hover:shadow-md transition-shadow border ${colors[color]}`} onClick={onClick}>
      <CardContent className="p-4 flex items-center justify-between">
        <div>
          <p className="text-3xl font-bold">{count}</p>
          <p className="text-sm text-gray-600">{title}</p>
        </div>
        <Icon className="w-10 h-10" />
      </CardContent>
    </Card>
  );
}

function DocumentCard({ document: doc }) {
  const openDocument = () => window.open(doc.url, '_blank');
  return (
    <Card className="mb-3 hover:shadow-md transition-shadow cursor-pointer" onClick={openDocument}>
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">{getFileIcon(doc.file_type)}</div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">{doc.title || "Untitled Document"}</h3>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1 text-sm text-gray-500">
              <Badge variant="outline" className="text-xs">{doc.file_type?.toUpperCase() || 'FILE'}</Badge>
              <span>•</span>
              <span>{formatFileSize(doc.file_size)}</span>
              <span>•</span>
              <span>{doc.uploaded_date ? format(new Date(doc.uploaded_date), "MMM d, yyyy") : "Date unknown"}</span>
            </div>
            <Badge className="mt-2" variant="secondary">{doc.category || "Uncategorized"}</Badge>
          </div>
          <Button variant="ghost" size="icon" className="flex-shrink-0" onClick={(e) => { e.stopPropagation(); window.open(doc.url, '_blank'); }}>
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function PhotoCard({ photo, onClick }) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" onClick={onClick}>
      <div className="aspect-square relative bg-gray-100">
        <img src={photo.url} alt={photo.caption || "Site photo"} className="w-full h-full object-cover" loading="lazy" />
        {photo.caption && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
            <p className="text-white text-sm truncate">{photo.caption}</p>
          </div>
        )}
      </div>
      <CardContent className="p-2">
        <p className="text-xs text-gray-500">{photo.taken_date ? format(new Date(photo.taken_date), "MMM d, yyyy") : "Date unknown"}</p>
        <Badge variant="outline" className="text-xs mt-1">{photo.category}</Badge>
      </CardContent>
    </Card>
  );
}

function ContactCard({ contact }) {
  return (
    <Card className="mb-3">
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          <Avatar className="w-12 h-12"><AvatarFallback>{contact.name.charAt(0)}</AvatarFallback></Avatar>
          <div className="flex-1">
            <h3 className="font-semibold">{contact.name}</h3>
            <p className="text-sm text-gray-500">{contact.role}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              <Button variant="outline" size="sm" asChild><a href={`tel:${contact.phone}`}><Phone className="w-4 h-4 mr-1" />{contact.phone}</a></Button>
              {contact.email && <Button variant="outline" size="icon" asChild><a href={`mailto:${contact.email}`}><Mail className="w-4 h-4" /></a></Button>}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyView({ Icon, title, message, actionText, onAction }) {
  return (
    <div className="text-center py-12">
      <Icon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 mb-4">{message}</p>
      {actionText && <Button variant="outline" onClick={onAction}><Mail className="w-4 h-4 mr-2" />{actionText}</Button>}
    </div>
  );
}

function PageSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-6 animate-pulse">
      <Skeleton className="h-8 w-48 mb-4" />
      <Skeleton className="h-10 w-full mb-6" />
      <div className="grid grid-cols-5 gap-2 mb-6">
        {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10" />)}
      </div>
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
      </div>
    </div>
  );
}

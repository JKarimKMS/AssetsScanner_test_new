import React, { useState, useEffect } from 'react';
import { Site } from '@/api/entities';
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  X, 
  Phone, 
  User, 
  AlertCircle, 
  FileText, 
  ExternalLink,
  Building
} from "lucide-react";

export default function QuickReferenceSheet({ isOpen, onClose, siteId }) {
  const navigate = useNavigate();
  const [site, setSite] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && siteId) {
      loadSiteData();
    }
  }, [isOpen, siteId]);

  const loadSiteData = async () => {
    setLoading(true);
    try {
      const siteData = await Site.filter({ id: siteId });
      const currentSite = siteData[0];
      
      // Add mock data if missing (same as SiteDocumentation)
      if (!currentSite.site_contacts || currentSite.site_contacts.length === 0) {
        currentSite.site_contacts = [
          {
            name: "Sarah Johnson",
            role: "manager",
            phone: "+44 7700 900123",
            email: "sarah.johnson@coral.co.uk",
            notes: "Site manager, available 9AM-6PM weekdays"
          },
          {
            name: "Mike Security",
            role: "security",
            phone: "+44 7700 900456",
            email: "security@site.co.uk",
            notes: "24/7 security contact for access issues"
          }
        ];
      }
      
      if (!currentSite.documents || currentSite.documents.length === 0) {
        currentSite.documents = [
          {
            id: "doc-1",
            type: "sow",
            title: "Statement of Work - Installation Requirements",
            url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
            uploaded_date: "2025-01-15T10:30:00Z",
            file_type: "pdf",
            file_size: 2457600,
            category: "installation"
          }
        ];
      }
      
      setSite(currentSite);
    } catch (error) {
      console.error("Error loading site data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewAllDocuments = () => {
    onClose();
    navigate(createPageUrl("SiteDocumentation", `siteId=${siteId}`));
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'manager':
        return <User className="w-4 h-4 text-blue-600" />;
      case 'security':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'contractor':
        return <Building className="w-4 h-4 text-green-600" />;
      default:
        return <User className="w-4 h-4 text-gray-600" />;
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'manager':
        return 'bg-blue-100 text-blue-800';
      case 'security':
        return 'bg-red-100 text-red-800';
      case 'contractor':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50 animate-in fade-in-0">
      <div className="bg-white rounded-t-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden animate-in slide-in-from-bottom-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">Quick Reference</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(80vh-80px)]">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="h-20 bg-gray-200 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : site ? (
            <div className="space-y-6">
              {/* Site Info */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">{site.name}</h4>
                <p className="text-sm text-gray-600">{site.address}</p>
              </div>

              {/* Primary Contact */}
              {site.site_contacts && site.site_contacts.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Primary Contacts</h4>
                  <div className="space-y-3">
                    {site.site_contacts.slice(0, 3).map((contact, index) => (
                      <Card key={index} className="border-l-4 border-l-blue-500">
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              {getRoleIcon(contact.role)}
                              <div>
                                <p className="font-medium text-sm">{contact.name}</p>
                                <Badge className={`${getRoleBadgeColor(contact.role)} text-xs`}>
                                  {contact.role}
                                </Badge>
                              </div>
                            </div>
                            <a 
                              href={`tel:${contact.phone}`}
                              className="flex items-center space-x-2 bg-emerald-100 text-emerald-800 px-3 py-2 rounded-lg hover:bg-emerald-200 transition-colors touch-target"
                            >
                              <Phone className="w-4 h-4" />
                              <span className="font-medium text-sm">{contact.phone}</span>
                            </a>
                          </div>
                          {contact.notes && (
                            <p className="text-xs text-gray-500 mt-2">{contact.notes}</p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick SOW Summary */}
              {site.documents && site.documents.some(doc => doc.type === 'sow') && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Latest SOW</h4>
                  <Card>
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <FileText className="w-5 h-5 text-red-500" />
                          <div>
                            <p className="font-medium text-sm">
                              {site.documents.find(doc => doc.type === 'sow')?.title}
                            </p>
                            <p className="text-xs text-gray-500">Installation requirements</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(site.documents.find(doc => doc.type === 'sow')?.url, '_blank')}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* View All Button */}
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700 touch-target"
                onClick={handleViewAllDocuments}
              >
                <FileText className="w-4 h-4 mr-2" />
                View All Documents
              </Button>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No site information available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
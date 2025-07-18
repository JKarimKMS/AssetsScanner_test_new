import React, { useState, useEffect } from 'react';
import { Session } from '@/api/entities';
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, FileText, Calendar, StickyNote } from "lucide-react";
import { format } from "date-fns";

export default function NotesView() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      const sessionData = await Session.list("-created_date");
      // Filter for sessions that actually have notes
      const sessionsWithNotes = sessionData.filter(s => 
        (s.session_notes && s.session_notes.trim()) || 
        (s.scan_results && s.scan_results.some(r => r.notes && r.notes.trim()))
      );
      setSessions(sessionsWithNotes);
    } catch (error) {
      console.error("Error loading sessions for notes:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderScanNotes = (scanResults) => {
    const notes = scanResults?.filter(r => r.notes && r.notes.trim());
    if (!notes || notes.length === 0) return null;

    return (
      <div className="mt-4">
        <h4 className="font-semibold text-sm text-gray-800 mb-2">Equipment Notes:</h4>
        <div className="space-y-3">
          {notes.map((result, index) => (
            <div key={index} className="pl-4 border-l-2 border-gray-200">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{result.notes}</p>
              <p className="text-xs text-gray-500 mt-1">Position: {result.position_label}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  const renderSessionNotes = (sessionNotes) => {
    if (!sessionNotes || !sessionNotes.trim()) return null;
    
    return (
       <div className="mt-2">
        <h4 className="font-semibold text-sm text-gray-800 mb-2">Session Notes:</h4>
        <div className="pl-4 border-l-2 border-emerald-200 bg-emerald-50/50 p-3 rounded-r-lg">
           <p className="text-sm text-gray-700 whitespace-pre-wrap">{sessionNotes}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
          <h2 className="text-2xl font-bold text-gray-900">All Notes</h2>
          <p className="text-gray-600">A complete log of all session and equipment notes</p>
        </div>
      </div>
      
      {/* Notes Content */}
      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => <div key={i} className="animate-pulse h-32 bg-gray-200 rounded-lg"></div>)}
        </div>
      ) : sessions.length === 0 ? (
        <Card className="text-center p-12">
           <StickyNote className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-800">No Notes Found</h3>
          <p className="text-gray-500 mt-2">Notes you add during sessions will appear here.</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {sessions.map(session => (
            <Card key={session.id}>
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                  <div className="flex-1">
                    <CardTitle>{session.site_name}</CardTitle>
                    <CardDescription className="flex items-center space-x-4 mt-1">
                      <Badge variant="outline">{session.site_code}</Badge>
                       <span className="flex items-center space-x-1">
                         <Calendar className="w-4 h-4"/>
                         <span>{format(new Date(session.start_time), "PPP p")}</span>
                       </span>
                    </CardDescription>
                  </div>
                   <Button variant="outline" size="sm" onClick={() => navigate(createPageUrl("Progress", `sessionId=${session.id}`))}>
                     View Session
                   </Button>
                </div>
              </CardHeader>
              <CardContent>
                {renderSessionNotes(session.session_notes)}
                {renderScanNotes(session.scan_results)}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
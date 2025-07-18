import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { X, PlayCircle, Monitor, CheckCircle, Camera } from "lucide-react";
import { Badge } from '@/components/ui/badge';
import { format } from "date-fns";

export default function ScanConfirmationDialog({ position, scanResult, onConfirm, onCancel }) {
  if (!position) return null;

  const isCompleted = scanResult && scanResult.model_id && scanResult.serial_number && scanResult.asset_tag;
  const hasPhoto = isCompleted && scanResult.photo_url;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 animate-in fade-in-0">
      <Card className="w-full max-w-sm animate-in zoom-in-95">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2 text-lg">
              <Monitor className="w-5 h-5 text-gray-700" />
              <span>Position: {position.label}</span>
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={onCancel} className="touch-target">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {isCompleted ? (
            <div className='space-y-4'>
              <CardDescription>This position has been scanned. You can scan again to update the data.</CardDescription>
              {scanResult.photo_url && (
                <div className='space-y-2'>
                   <img src={scanResult.photo_url} alt="Captured equipment" className='rounded-lg w-full aspect-video object-cover' />
                   <div className={`flex items-center justify-center space-x-2 text-sm ${hasPhoto ? 'text-green-700' : 'text-red-700'}`}>
                     <Camera className='w-4 h-4' />
                     <span>{hasPhoto ? 'Photo captured' : 'Photo missing'}</span>
                   </div>
                </div>
              )}
              <div className='text-left text-sm space-y-1 bg-gray-50 p-3 rounded-md'>
                <p><strong>Model:</strong> {scanResult.model_id}</p>
                <p><strong>Serial:</strong> {scanResult.serial_number}</p>
                <p><strong>Asset:</strong> {scanResult.asset_tag}</p>
                <p><strong>Time:</strong> {format(new Date(scanResult.timestamp), 'p')}</p>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-gray-600 mb-2">
                This position has not been scanned yet.
              </p>
            </div>
          )}

          <div className="flex flex-col space-y-3 pt-2">
            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 touch-target" onClick={onConfirm}>
              <PlayCircle className="w-5 h-5 mr-2" />
              {isCompleted ? "Scan Again" : "Start Scan"}
            </Button>
            <Button size="lg" variant="outline" onClick={onCancel} className="touch-target">
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
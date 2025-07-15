import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, PlayCircle, Monitor } from "lucide-react";

export default function ScanConfirmationDialog({ position, onConfirm, onCancel }) {
  if (!position) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 animate-in fade-in-0">
      <Card className="w-full max-w-sm animate-in zoom-in-95">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2 text-lg">
              <Monitor className="w-5 h-5 text-gray-700" />
              <span>Confirm Scan</span>
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={onCancel} className="touch-target">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-gray-600 mb-2">
            Proceed to scan position:
          </p>
          <div className="bg-gray-100 rounded-lg p-4 mb-6">
            <h3 className="text-2xl font-bold text-gray-900">{position.label}</h3>
          </div>
          <div className="flex flex-col space-y-3">
            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 touch-target" onClick={onConfirm}>
              <PlayCircle className="w-5 h-5 mr-2" />
              Start Scan
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
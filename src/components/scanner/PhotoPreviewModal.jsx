import React from 'react';
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export default function PhotoPreviewModal({ photoUrl, onClose }) {
  if (!photoUrl) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-60 p-4"
      onClick={onClose}
    >
      <div className="relative max-w-full max-h-full" onClick={(e) => e.stopPropagation()}>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute -top-10 right-0 bg-black bg-opacity-50 text-white hover:bg-black hover:bg-opacity-70 z-10"
        >
          <X className="w-4 h-4" />
        </Button>
        
        <img
          src={photoUrl}
          alt="Captured equipment"
          className="max-w-full max-h-[90vh] object-contain rounded-lg"
        />
      </div>
    </div>
  );
}
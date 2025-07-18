import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertTriangle, Check, X } from "lucide-react";

export default function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default"
}) {
  if (!isOpen) return null;

  const iconColor = variant === "destructive" ? "text-red-500" : "text-amber-500";
  const buttonClass = variant === "destructive" 
    ? "bg-red-600 hover:bg-red-700" 
    : "bg-emerald-600 hover:bg-emerald-700";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 animate-in fade-in-0">
      <Card className="w-full max-w-sm animate-in zoom-in-95">
        <CardHeader className="text-center">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${iconColor} bg-opacity-10`}>
            <AlertTriangle className={`w-6 h-6 ${iconColor}`} />
          </div>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              <X className="w-4 h-4 mr-2" />
              {cancelText}
            </Button>
            <Button onClick={onConfirm} className={`flex-1 ${buttonClass}`}>
              <Check className="w-4 h-4 mr-2" />
              {confirmText}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
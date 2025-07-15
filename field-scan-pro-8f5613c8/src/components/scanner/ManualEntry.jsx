import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Save, AlertCircle } from "lucide-react";

export default function ManualEntry({ onSave, onCancel, initialData = {} }) {
  const [formData, setFormData] = useState({
    modelId: initialData.modelId || "",
    serialNumber: initialData.serialNumber || "",
    assetTag: initialData.assetTag || ""
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.modelId.trim()) {
      newErrors.modelId = "Model ID is required";
    } else if (!/^[A-Z0-9\/]+$/.test(formData.modelId)) {
      newErrors.modelId = "Invalid format. Example: 43BDL3650Q/00";
    }
    
    if (!formData.serialNumber.trim()) {
      newErrors.serialNumber = "Serial Number is required";
    } else if (formData.serialNumber.length < 10) {
      newErrors.serialNumber = "Serial Number must be at least 10 characters";
    }
    
    if (!formData.assetTag.trim()) {
      newErrors.assetTag = "Asset Tag is required";
    } else if (!/^\d{6}$/.test(formData.assetTag)) {
      newErrors.assetTag = "Asset Tag must be exactly 6 digits";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Manual Entry</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onCancel}
              className="touch-target"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="modelId">Model ID</Label>
              <Input
                id="modelId"
                type="text"
                placeholder="43BDL3650Q/00"
                value={formData.modelId}
                onChange={(e) => handleChange("modelId", e.target.value)}
                className={`touch-target ${errors.modelId ? "border-red-500" : ""}`}
              />
              {errors.modelId && (
                <div className="flex items-center space-x-1 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.modelId}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="serialNumber">Serial Number</Label>
              <Input
                id="serialNumber"
                type="text"
                placeholder="AU0A2446000697"
                value={formData.serialNumber}
                onChange={(e) => handleChange("serialNumber", e.target.value)}
                className={`touch-target ${errors.serialNumber ? "border-red-500" : ""}`}
              />
              {errors.serialNumber && (
                <div className="flex items-center space-x-1 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.serialNumber}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="assetTag">Asset Tag</Label>
              <Input
                id="assetTag"
                type="text"
                placeholder="153030"
                value={formData.assetTag}
                onChange={(e) => handleChange("assetTag", e.target.value)}
                className={`touch-target ${errors.assetTag ? "border-red-500" : ""}`}
              />
              {errors.assetTag && (
                <div className="flex items-center space-x-1 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.assetTag}</span>
                </div>
              )}
            </div>

            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1 touch-target"
                onClick={onCancel}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 touch-target"
              >
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
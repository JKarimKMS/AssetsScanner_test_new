import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Save, AlertCircle, Check } from "lucide-react";

export default function ManualEntry({ onSave, onCancel, initialData = {} }) {
  const [formData, setFormData] = useState({
    modelId: initialData.modelId || "",
    serialNumber: initialData.serialNumber || "",
    assetTag: initialData.assetTag || ""
  });
  const [errors, setErrors] = useState({});
  const [validFields, setValidFields] = useState({});

  const validateField = (field, value) => {
    switch (field) {
      case "modelId":
        const modelPattern = /^\d{2}[A-Z]{3}\d{4}[A-Z](\/\d{2})?$/;
        if (!value.trim()) {
          return "Model ID is required";
        } else if (!modelPattern.test(value)) {
          return "Invalid format.";
        }
        return null;
        
      case "serialNumber":
        const serialPattern = /^[A-Z0-9]{4}\d{10}$/;
        if (!value.trim()) {
          return "Serial Number is required";
        } else if (!serialPattern.test(value)) {
          return "Invalid format. Must be 4 alphanumeric chars + 10 digits.";
        }
        return null;
        
      case "assetTag":
        const assetPattern = /^\d{6}$/;
        if (!value.trim()) {
          return "Asset Tag is required";
        } else if (!assetPattern.test(value)) {
          return "Asset Tag must be exactly 6 digits (e.g., 153030)";
        }
        return null;
        
      default:
        return null;
    }
  };

  const formatInput = (field, value) => {
    switch (field) {
      case "modelId":
        return value.replace(/\s/g, '').toUpperCase();
        
      case "serialNumber":
        return value.replace(/\s/g, '').toUpperCase();
        
      case "assetTag":
        return value.replace(/\D/g, '');
        
      default:
        return value;
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    Object.keys(formData).forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
      }
    });
    
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
    const formattedValue = formatInput(field, value);
    setFormData(prev => ({ ...prev, [field]: formattedValue }));
    
    const error = validateField(field, formattedValue);
    const isValid = !error && formattedValue.trim();
    
    setErrors(prev => ({ ...prev, [field]: error }));
    setValidFields(prev => ({ ...prev, [field]: isValid }));
  };

  const getFieldStatus = (field) => {
    if (errors[field]) return "error";
    if (validFields[field]) return "valid";
    return "default";
  };

  const getInputClassName = (field) => {
    const status = getFieldStatus(field);
    const baseClass = "touch-target pr-10";
    
    switch (status) {
      case "error":
        return `${baseClass} border-red-500 focus:border-red-500 focus:ring-red-500`;
      case "valid":
        return `${baseClass} border-green-500 focus:border-green-500 focus:ring-green-500`;
      default:
        return baseClass;
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
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="modelId">Model ID</Label>
              <div className="relative">
                <Input
                  id="modelId"
                  type="text"
                  placeholder="43BDL4550D/00"
                  value={formData.modelId}
                  onChange={(e) => handleChange("modelId", e.target.value)}
                  className={getInputClassName("modelId")}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  {getFieldStatus("modelId") === "valid" && (
                    <Check className="w-4 h-4 text-green-500" />
                  )}
                  {getFieldStatus("modelId") === "error" && (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  )}
                </div>
              </div>
              <p className="text-xs text-gray-500">e.g., 55BDL3650Q or 43BDL4550D/00</p>
              {errors.modelId && (
                <div className="flex items-center space-x-1 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.modelId}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="serialNumber">Serial Number</Label>
              <div className="relative">
                <Input
                  id="serialNumber"
                  type="text"
                  placeholder="FZ4A2434035142"
                  value={formData.serialNumber}
                  onChange={(e) => handleChange("serialNumber", e.target.value)}
                  className={getInputClassName("serialNumber")}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  {getFieldStatus("serialNumber") === "valid" && (
                    <Check className="w-4 h-4 text-green-500" />
                  )}
                  {getFieldStatus("serialNumber") === "error" && (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  )}
                </div>
              </div>
              <p className="text-xs text-gray-500">e.g., FZ4A2434035142 or AU0A2443000434</p>
              {errors.serialNumber && (
                <div className="flex items-center space-x-1 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.serialNumber}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="assetTag">Asset Tag</Label>
              <div className="relative">
                <Input
                  id="assetTag"
                  type="text"
                  placeholder="153030"
                  maxLength="6"
                  value={formData.assetTag}
                  onChange={(e) => handleChange("assetTag", e.target.value)}
                  className={getInputClassName("assetTag")}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  {getFieldStatus("assetTag") === "valid" && (
                    <Check className="w-4 h-4 text-green-500" />
                  )}
                  {getFieldStatus("assetTag") === "error" && (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  )}
                </div>
              </div>
              <p className="text-xs text-gray-500">Format: 6 digits only (e.g., 153030)</p>
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
                disabled={Object.keys(errors).some(key => errors[key]) || !Object.keys(formData).every(key => !formData[key] || validFields[key])}
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
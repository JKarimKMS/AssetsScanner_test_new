import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  MonitorSpeaker, 
  ChevronLeft, 
  ChevronRight, 
  MapPin,
  Camera,
  FileText,
  Download,
  CheckCircle,
  ArrowRight,
  X
} from "lucide-react";

export default function Onboarding() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const slides = [
    {
      id: "welcome",
      title: "Welcome to Field Scanner",
      subtitle: "Your equipment installation companion",
      content: <WelcomeSlide />
    },
    {
      id: "select-site",
      title: "Select Your Site",
      subtitle: "Choose from your assigned locations",
      content: <SiteSlidePreview />
    },
    {
      id: "scan-equipment",
      title: "Scan Equipment Labels",
      subtitle: "Capture model IDs, serial numbers, and asset tags",
      content: <ScannerSlidePreview />
    },
    {
      id: "export-data",
      title: "Export Your Data",
      subtitle: "Generate CSV reports for your installations",
      content: <ExportSlidePreview />
    }
  ];

  const handleTouchStart = (e) => {
    setTouchEnd(0);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    }
    if (isRightSwipe && currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    }
  };

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    }
  };

  const handleGetStarted = () => {
    localStorage.setItem('onboardingCompleted', 'true');
    navigate(createPageUrl("Dashboard"));
  };

  const handleSkip = () => {
    localStorage.setItem('onboardingCompleted', 'true');
    navigate(createPageUrl("Dashboard"));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 flex flex-col">
      {/* Skip Button */}
      <div className="flex justify-end p-4">
        <Button 
          variant="ghost" 
          onClick={handleSkip}
          className="text-gray-600 hover:text-gray-800"
        >
          <X className="w-4 h-4 mr-2" />
          Skip
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center px-6 pb-8">
        <div 
          className="max-w-md mx-auto w-full"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Slide Content */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {slides[currentSlide].title}
            </h1>
            <p className="text-gray-600 mb-8">
              {slides[currentSlide].subtitle}
            </p>
            
            <div className="min-h-[300px] flex items-center justify-center">
              {slides[currentSlide].content}
            </div>
          </div>

          {/* Progress Dots */}
          <div className="flex justify-center space-x-2 mb-8">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide 
                    ? 'bg-emerald-500 w-8' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <Button
              variant="ghost"
              onClick={prevSlide}
              disabled={currentSlide === 0}
              className="touch-target"
            >
              <ChevronLeft className="w-5 h-5 mr-1" />
              Back
            </Button>

            {currentSlide === slides.length - 1 ? (
              <Button 
                size="lg"
                onClick={handleGetStarted}
                className="bg-emerald-600 hover:bg-emerald-700 touch-target px-6"
              >
                Get Started
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            ) : (
              <Button
                variant="ghost"
                onClick={nextSlide}
                className="touch-target"
              >
                Next
                <ChevronRight className="w-5 h-5 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function WelcomeSlide() {
  return (
    <div className="text-center">
      <div className="w-24 h-24 bg-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
        <MonitorSpeaker className="w-12 h-12 text-white" />
      </div>
      <div className="space-y-4">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-center space-x-2 text-emerald-600">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Professional Equipment Scanning</span>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-center space-x-2 text-emerald-600">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Real-time Data Capture</span>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-center space-x-2 text-emerald-600">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Instant CSV Export</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function SiteSlidePreview() {
  return (
    <div className="w-full max-w-sm">
      <Card className="border-l-4 border-l-red-500 hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h4 className="font-semibold text-gray-900">Ladbrokes Victoria</h4>
                <span className="text-sm font-medium text-red-600">L1774</span>
              </div>
              <div className="flex items-center space-x-1 text-sm text-gray-600">
                <MapPin className="w-4 h-4" />
                <span className="truncate">123 Collins Street, Melbourne</span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        </CardContent>
      </Card>
      
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          Browse and select from your assigned sites
        </p>
      </div>
    </div>
  );
}

function ScannerSlidePreview() {
  return (
    <div className="w-full max-w-sm">
      <Card>
        <CardContent className="p-0">
          <div className="bg-black rounded-lg aspect-[4/3] relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-gray-800 to-gray-900 flex items-center justify-center">
              <Camera className="w-12 h-12 text-gray-600" />
            </div>
            
            <div className="absolute inset-4 flex flex-col space-y-2">
              <div className="flex-1 border-2 border-green-500 rounded-lg p-2 bg-black bg-opacity-20">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-green-400 font-medium">Model ID</span>
                  <CheckCircle className="w-3 h-3 text-green-400" />
                </div>
                <div className="text-white font-mono text-xs bg-black bg-opacity-50 px-2 py-1 rounded">
                  43BDL4550D/00
                </div>
              </div>
              
              <div className="flex-1 border-2 border-amber-400 border-dashed rounded-lg p-2">
                <span className="text-xs text-amber-400 font-medium">Serial Number</span>
                <div className="text-xs text-amber-400 mt-1">Scanning...</div>
              </div>
              
              <div className="flex-1 border-2 border-gray-400 border-dashed rounded-lg p-2">
                <span className="text-xs text-gray-400 font-medium">Asset Tag</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          Point camera at equipment labels for automatic capture
        </p>
      </div>
    </div>
  );
}

function ExportSlidePreview() {
  return (
    <div className="w-full max-w-sm space-y-4">
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardContent className="p-4 text-center">
          <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <h3 className="font-semibold text-gray-900 mb-1">Installation Complete!</h3>
          <p className="text-sm text-gray-600">6 positions scanned</p>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" size="sm" className="touch-target">
          <FileText className="w-4 h-4 mr-2" />
          Copy CSV
        </Button>
        <Button variant="outline" size="sm" className="touch-target">
          <Download className="w-4 h-4 mr-2" />
          Download
        </Button>
      </div>
      
      <div className="text-center">
        <p className="text-sm text-gray-600">
          Export your scan data as CSV for reporting
        </p>
      </div>
    </div>
  );
}

import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { MonitorSpeaker, Home, Settings, Zap } from "lucide-react";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <style>{`
        :root {
          --primary-500: #10b981;
          --primary-600: #059669;
          --primary-700: #047857;
          --brand-ladbrokes: #d70f37;
          --brand-coral: #0099cc;
          --brand-betfred: #1b5e20;
          --space-xs: 0.5rem;
          --space-sm: 0.75rem;
          --space-md: 1rem;
          --space-lg: 1.5rem;
          --space-xl: 2rem;
        }
        
        .brand-ladbrokes { color: var(--brand-ladbrokes); }
        .brand-coral { color: var(--brand-coral); }
        .brand-betfred { color: var(--brand-betfred); }
        
        .border-brand-ladbrokes { border-color: var(--brand-ladbrokes); }
        .border-brand-coral { border-color: var(--brand-coral); }
        .border-brand-betfred { border-color: var(--brand-betfred); }
        
        .bg-brand-ladbrokes { background-color: var(--brand-ladbrokes); }
        .bg-brand-coral { background-color: var(--brand-coral); }
        .bg-brand-betfred { background-color: var(--brand-betfred); }
        
        .touch-target {
          min-height: 48px;
          min-width: 48px;
        }
        
        .scan-pulse {
          animation: scan-pulse 2s infinite;
        }
        
        @keyframes scan-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        .success-checkmark {
          animation: checkmark 0.5s ease-in-out;
        }
        
        @keyframes checkmark {
          0% { transform: scale(0); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
      `}</style>
      
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
                <MonitorSpeaker className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Field Scanner</h1>
                <p className="text-xs text-gray-500">Equipment Installation PWA</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Link
                to={createPageUrl("Dashboard")}
                className={`p-2 rounded-lg transition-colors ${
                  location.pathname === createPageUrl("Dashboard")
                    ? "bg-emerald-100 text-emerald-700"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Home className="w-5 h-5" />
              </Link>
              <div className="p-2 rounded-lg text-gray-400">
                <Settings className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
      
      {/* PWA Install Badge */}
      <div className="fixed bottom-4 right-4 z-50">
        <div className="bg-emerald-600 text-white px-3 py-2 rounded-lg shadow-lg text-sm font-medium flex items-center space-x-2">
          <Zap className="w-4 h-4" />
          <span>PWA Ready</span>
        </div>
      </div>
    </div>
  );
}

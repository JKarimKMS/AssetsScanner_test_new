import Layout from "./Layout.jsx";

import Dashboard from "./Dashboard";

import SiteSelection from "./SiteSelection";

import Configuration from "./Configuration";

import Scanner from "./Scanner";

import Export from "./Export";

import Onboarding from "./Onboarding";

import Settings from "./Settings";

import NotesView from "./NotesView";

import SitePhotoHistory from "./SitePhotoHistory";

import Progress from "./Progress";

import SiteDocumentation from "./SiteDocumentation";

import AdminDashboard from "./AdminDashboard";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Dashboard: Dashboard,
    
    SiteSelection: SiteSelection,
    
    Configuration: Configuration,
    
    Scanner: Scanner,
    
    Export: Export,
    
    Onboarding: Onboarding,
    
    Settings: Settings,
    
    NotesView: NotesView,
    
    SitePhotoHistory: SitePhotoHistory,
    
    Progress: Progress,
    
    SiteDocumentation: SiteDocumentation,
    
    AdminDashboard: AdminDashboard,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Dashboard />} />
                
                
                <Route path="/Dashboard" element={<Dashboard />} />
                
                <Route path="/SiteSelection" element={<SiteSelection />} />
                
                <Route path="/Configuration" element={<Configuration />} />
                
                <Route path="/Scanner" element={<Scanner />} />
                
                <Route path="/Export" element={<Export />} />
                
                <Route path="/Onboarding" element={<Onboarding />} />
                
                <Route path="/Settings" element={<Settings />} />
                
                <Route path="/NotesView" element={<NotesView />} />
                
                <Route path="/SitePhotoHistory" element={<SitePhotoHistory />} />
                
                <Route path="/Progress" element={<Progress />} />
                
                <Route path="/SiteDocumentation" element={<SiteDocumentation />} />
                
                <Route path="/AdminDashboard" element={<AdminDashboard />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}
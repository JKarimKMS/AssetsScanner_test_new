// Configuration types
export const CONFIGURATION_TYPES = [
  "4 over 4",
  "5 over 5", 
  "5 over 1",
  "5 straight",
  "6 over 6"
];

// Brand types
export const BRANDS = [
  "Coral",
  "Ladbrokes"
];

// Session statuses
export const SESSION_STATUS = {
  ACTIVE: "active",
  COMPLETED: "completed",
  EXPORTED: "exported"
};

// Position types
export const POSITION_TYPES = {
  SINGLE: "single",
  QUAD: "quad",
  SKY: "sky",
  ADDITIONAL: "additional"
};

// Screen zones for additional screens
export const SCREEN_ZONES = {
  OFF_GANTRY: "offGantry",
  SPORTS_ZONE: "sportsZone", 
  COUNTER_AREA: "counterArea",
  FOBT_ZONE: "fobtZone",
  OPPOSITE_GANTRY: "oppositeGantry"
};

// Capture methods
export const CAPTURE_METHODS = {
  OCR: "ocr",
  MANUAL: "manual"
};

// Photo methods
export const PHOTO_METHODS = {
  SCAN: "scan",
  MANUAL: "manual", 
  RETAKE: "retake"
};

// Date filter options
export const DATE_FILTERS = {
  ALL: "all",
  TODAY: "today",
  WEEK: "week", 
  MONTH: "month",
  RANGE: "range"
};

// Sort options
export const SORT_OPTIONS = {
  DATE_ASC: "date_asc",
  DATE_DESC: "date_desc",
  NAME_ASC: "name_asc",
  CODE_ASC: "code_asc"
};

// View modes
export const VIEW_MODES = {
  LIST: "list",
  CALENDAR: "calendar"
};

// Export formats
export const EXPORT_FORMATS = {
  CSV: "csv",
  JSON: "json",
  PDF: "pdf"
};

// Common screen models
export const COMMON_MODELS = [
  "43BDL3650Q/00",
  "55BDL3050Q/00", 
  "32BDL3051T/00",
  "43BDL4550D/00",
  "55BDL4510D/00"
];

// Additional screen definitions by zone
export const ADDITIONAL_SCREENS_BY_ZONE = {
  offGantry: ["Early Price Screen"],
  sportsZone: ["SKY B", "Sports TV 1", "Sports TV 2"],
  counterArea: ["Manager Monitor 1", "Manager Monitor 2", "Manager Monitor 3", "Manager Display Board"],
  fobtZone: ["FOBT TV 1", "FOBT TV 2", "FOBT TV 3", "FOBT TV 4"],
  oppositeGantry: ["Touch Screen 1", "Touch Screen 2", "Touch Screen 3", "Touch Screen 4", "Touch Screen 5"]
};

// Configuration distribution weights for demo data
export const CONFIG_DISTRIBUTION = {
  "4 over 4": 0.30,
  "5 over 5": 0.25,
  "5 over 1": 0.20,
  "5 straight": 0.15,
  "6 over 6": 0.10
};

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: "Network error. Please check your connection.",
  VALIDATION_ERROR: "Please check the highlighted fields.",
  SAVE_ERROR: "Failed to save. Please try again.",
  LOAD_ERROR: "Failed to load data. Please refresh the page.",
  PHOTO_ERROR: "Failed to capture photo. Please try again.",
  SESSION_ERROR: "Session error. Please restart the process."
};

// Success messages  
export const SUCCESS_MESSAGES = {
  SAVE_SUCCESS: "Data saved successfully",
  EXPORT_SUCCESS: "Export completed successfully",
  PHOTO_SUCCESS: "Photo captured successfully",
  SESSION_COMPLETE: "Session completed successfully"
};

// Loading states
export const LOADING_STATES = {
  IDLE: "idle",
  LOADING: "loading", 
  SUCCESS: "success",
  ERROR: "error"
};

// API endpoints (relative)
export const API_ENDPOINTS = {
  SITES: "/sites",
  SESSIONS: "/sessions", 
  EXPORT: "/export",
  UPLOAD: "/upload"
};

// Local storage keys
export const STORAGE_KEYS = {
  ONBOARDING_COMPLETED: "onboardingCompleted",
  EXPORT_TEMPLATES: "exportTemplates",
  PENDING_CHANGES: "pendingChanges",
  USER_PREFERENCES: "userPreferences"
};
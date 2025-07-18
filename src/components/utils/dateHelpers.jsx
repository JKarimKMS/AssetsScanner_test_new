import { format, isToday, isThisWeek, differenceInDays, parseISO, startOfDay, endOfDay, isAfter, isBefore } from "date-fns";

// Common date formats
export const DATE_FORMATS = {
  ISO: "yyyy-MM-dd'T'HH:mm:ss'Z'",
  STANDARD: "yyyy-MM-dd HH:mm:ss",
  UK: "dd/MM/yyyy HH:mm",
  US: "MM/dd/yyyy HH:mm",
  DATE_ONLY: "yyyy-MM-dd",
  DISPLAY_DATE: "PPP",
  DISPLAY_DATETIME: "PPP p",
  SHORT_DATE: "MMM d",
  SHORT_DATETIME: "MMM d, HH:mm"
};

// Format dates with error handling
export const formatDate = (date, formatString = DATE_FORMATS.DISPLAY_DATE) => {
  if (!date) return "N/A";
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (isNaN(dateObj.getTime())) return "Invalid Date";
    return format(dateObj, formatString);
  } catch (error) {
    console.error("Date formatting error:", error);
    return "Invalid Date";
  }
};

// Get relative time descriptions
export const getRelativeTime = (date) => {
  if (!date) return "Unknown";
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    const today = new Date();
    const daysDiff = differenceInDays(dateObj, today);
    
    if (daysDiff < 0) return `${Math.abs(daysDiff)} days overdue`;
    if (daysDiff === 0) return "Today";
    if (daysDiff === 1) return "Tomorrow";
    return `In ${daysDiff} days`;
  } catch (error) {
    console.error("Relative time error:", error);
    return "Unknown";
  }
};

// Get urgency styling based on date
export const getUrgencyStyle = (date) => {
  if (!date) return "border-l-gray-200";
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    const today = new Date();
    const daysDiff = differenceInDays(dateObj, today);
    
    if (daysDiff < 0) return "border-l-red-500"; // Past due
    if (daysDiff === 0) return "border-l-green-500"; // Today
    if (daysDiff <= 7) return "border-l-amber-500"; // This week
    return "border-l-gray-200"; // Future
  } catch (error) {
    return "border-l-gray-200";
  }
};

// Date filtering helpers
export const isDateInRange = (date, startDate, endDate) => {
  if (!date || !startDate || !endDate) return false;
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    const rangeStart = startOfDay(startDate);
    const rangeEnd = endOfDay(endDate);
    
    return isAfter(dateObj, rangeStart) && isBefore(dateObj, rangeEnd);
  } catch (error) {
    return false;
  }
};

export const isDateToday = (date) => {
  if (!date) return false;
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return isToday(dateObj);
  } catch (error) {
    return false;
  }
};

export const isDateThisWeek = (date) => {
  if (!date) return false;
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return isThisWeek(dateObj);
  } catch (error) {
    return false;
  }
};

export const isDateThisMonth = (date) => {
  if (!date) return false;
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    const today = new Date();
    return dateObj.getMonth() === today.getMonth() && 
           dateObj.getFullYear() === today.getFullYear();
  } catch (error) {
    return false;
  }
};

// Generate random dates for demo data
export const generateRandomDateInRange = (startDate, endDate, excludeWeekends = true) => {
  let randomDate;
  
  do {
    const start = startDate.getTime();
    const end = endDate.getTime();
    const randomTime = start + Math.random() * (end - start);
    randomDate = new Date(randomTime);
  } while (excludeWeekends && (randomDate.getDay() === 0 || randomDate.getDay() === 6));
  
  return randomDate;
};

// Generate Q3 2025 demo dates
export const generateQ3DemoDate = () => {
  const start = new Date(2025, 6, 1); // July 1, 2025
  const end = new Date(2025, 8, 30); // Sept 30, 2025
  return generateRandomDateInRange(start, end, true);
};

// Duration calculations
export const calculateSessionDuration = (startTime, endTime) => {
  if (!startTime) return "Unknown";
  if (!endTime) return "In progress";
  
  try {
    const start = typeof startTime === 'string' ? parseISO(startTime) : startTime;
    const end = typeof endTime === 'string' ? parseISO(endTime) : endTime;
    
    const diffMinutes = Math.round((end - start) / (1000 * 60));
    
    if (diffMinutes < 60) {
      return `${diffMinutes} minutes`;
    } else {
      const hours = Math.floor(diffMinutes / 60);
      const minutes = diffMinutes % 60;
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours} hours`;
    }
  } catch (error) {
    console.error("Duration calculation error:", error);
    return "Unknown";
  }
};
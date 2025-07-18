import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameDay, 
  isSameMonth,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek
} from "date-fns";

export default function SiteCalendarView({ sites, onSiteSelect, onDateSelect }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  
  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd
  });

  const getSitesForDate = (date) => {
    return sites.filter(site => 
      isSameDay(new Date(site.installation_date), date)
    );
  };

  const getBrandColor = (brand) => {
    return brand === "Coral" ? "bg-blue-500" : "bg-red-500";
  };

  const navigateMonth = (direction) => {
    if (direction === 'prev') {
      setCurrentDate(subMonths(currentDate, 1));
    } else {
      setCurrentDate(addMonths(currentDate, 1));
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{format(currentDate, "MMMM yyyy")}</CardTitle>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day) => {
            const daysSites = getSitesForDate(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            
            return (
              <div
                key={day.toISOString()}
                className={`min-h-[80px] p-1 border rounded cursor-pointer hover:bg-gray-50 ${
                  !isCurrentMonth ? 'text-gray-300 bg-gray-50' : 'bg-white'
                }`}
                onClick={() => onDateSelect(day)}
              >
                <div className="font-medium text-sm mb-1">
                  {format(day, 'd')}
                </div>
                
                <div className="space-y-1">
                  {daysSites.slice(0, 2).map((site) => (
                    <div
                      key={site.id}
                      className={`text-xs p-1 rounded text-white truncate ${getBrandColor(site.brand)}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSiteSelect(site);
                      }}
                    >
                      {site.code}
                    </div>
                  ))}
                  
                  {daysSites.length > 2 && (
                    <div className="text-xs text-gray-500">
                      +{daysSites.length - 2} more
                    </div>
                  )}
                </div>
                
                {daysSites.length > 0 && (
                  <Badge variant="outline" className="text-xs mt-1">
                    {daysSites.length}
                  </Badge>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
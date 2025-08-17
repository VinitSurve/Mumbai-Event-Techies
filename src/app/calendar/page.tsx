
// src/app/calendar/page.tsx
"use client";

import * as React from "react";
import { addDays, format, startOfDay } from "date-fns";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { mockEvents } from "@/lib/data";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import type { Event } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { UpcomingEventList } from "@/components/upcoming-event-list";

export default function CalendarPage() {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [currentMonth, setCurrentMonth] = React.useState(new Date());
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);


  const eventsByDate = React.useMemo(() => {
    const map = new Map<string, Event[]>();
    mockEvents.forEach((event) => {
      const eventDate = new Date(event.event_date);
      const dateKey = format(eventDate, "yyyy-MM-dd");
      if (!map.has(dateKey)) {
        map.set(dateKey, []);
      }
      map.get(dateKey)?.push(event);
    });
    return map;
  }, []);

  const handleMonthChange = (month: Date) => {
    setCurrentMonth(month);
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };
  
  const goToNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  if (!isMounted) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 mt-16">
        <div className="container py-8 md:py-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-8">Event Calendar</h1>
          <div className="bg-card p-4 sm:p-6 rounded-2xl shadow-sm border">
            <Calendar
              month={currentMonth}
              onMonthChange={handleMonthChange}
              mode="single"
              selected={date}
              onSelect={setDate}
              className="w-full"
              components={{
                DayContent: ({ date }) => {
                  const dateKey = format(date, "yyyy-MM-dd");
                  const dayEvents = eventsByDate.get(dateKey);
                  return (
                    <div className="relative h-full w-full">
                      <time dateTime={startOfDay(date).toISOString()} className="absolute top-1 left-1.5 text-xs">{format(date, 'd')}</time>
                      {dayEvents && (
                        <div className="absolute top-7 left-0 right-0 flex flex-col items-center gap-1 px-1">
                          {dayEvents.slice(0, 2).map(event => (
                            <Badge key={event.id} variant="default" className="w-full text-xs truncate justify-start p-1 bg-primary/20 text-primary hover:bg-primary/30">
                              {event.title}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                },
                Caption: () => (
                    <div className="flex justify-between items-center py-2 px-2 bg-primary text-primary-foreground rounded-t-lg">
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary-foreground/10" onClick={goToPreviousMonth}>
                            <ChevronLeft className="h-5 w-5" />
                        </Button>
                        <h2 className="text-lg font-bold">
                            {format(currentMonth, 'MMMM yyyy')}
                        </h2>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary-foreground/10" onClick={goToNextMonth}>
                            <ChevronRight className="h-5 w-5" />
                        </Button>
                    </div>
                )
              }}
               classNames={{
                months: "w-full",
                month: "w-full",
                table: "w-full border-collapse",
                head_row: "grid grid-cols-7 w-full",
                head_cell: "text-muted-foreground font-normal text-sm capitalize p-2 text-center",
                row: "grid grid-cols-7 mt-0 w-full",
                cell: "h-28 sm:h-32 text-left p-0 border-t border-l border-border first:border-l-0",
                day: "w-full h-full rounded-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0",
                day_today: "bg-accent/10 text-accent-foreground",
                day_selected: "bg-primary text-primary-foreground",
              }}
            />
          </div>
          
          <div className="mt-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">Upcoming Events</h2>
            <UpcomingEventList events={mockEvents} />
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}

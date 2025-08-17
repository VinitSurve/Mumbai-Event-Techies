
// src/components/upcoming-event-list.tsx
"use client";

import React from 'react';
import type { Event } from "@/lib/types";
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Calendar } from 'lucide-react';

interface UpcomingEventListProps {
    events: Event[];
}

export function UpcomingEventList({ events }: UpcomingEventListProps) {
    const [upcomingEvents, setUpcomingEvents] = React.useState<Event[]>([]);

    React.useEffect(() => {
        const sortedEvents = [...events]
            .filter(event => new Date(event.event_date) > new Date())
            .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime());
        setUpcomingEvents(sortedEvents);
    }, [events]);


    const formatEventDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric', 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
        }).format(date);
    };

    return (
        <div className="space-y-4">
            {upcomingEvents.map(event => (
                <Card key={event.id} className="p-4 flex items-center justify-between hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-center gap-4">
                        <div className="bg-primary/10 text-primary p-3 rounded-lg">
                           <Calendar className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-base">{event.title}</h3>
                            <p className="text-sm text-muted-foreground">
                                {formatEventDate(event.event_date)}
                            </p>
                             <p className="text-sm text-muted-foreground">{event.location}</p>
                        </div>
                    </div>
                    <Button variant="outline" size="sm">View</Button>
                </Card>
            ))}
        </div>
    );
}

// src/components/event-popover.tsx
"use client";

import React from 'react';
import type { Event } from "@/lib/types";
import { Button } from './ui/button';
import { Calendar, MapPin, ExternalLink, Clock } from 'lucide-react';
import { Badge } from './ui/badge';
import Image from 'next/image';

interface EventPopoverProps {
    event: Event;
}

export function EventPopover({ event }: EventPopoverProps) {
    const [formattedDate, setFormattedDate] = React.useState("");
    const [formattedTime, setFormattedTime] = React.useState("");

    React.useEffect(() => {
        if (event.event_date) {
            const eventDate = new Date(event.event_date);
            setFormattedDate(eventDate.toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
            }));
            setFormattedTime(eventDate.toLocaleTimeString("en-US", {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            }));
        }
    }, [event.event_date]);
    
    return (
        <div className="flex flex-col gap-4">
            <div className="relative h-32 w-full rounded-lg overflow-hidden">
                <Image
                    src={event.image_url || "https://placehold.co/600x400.png"}
                    alt={event.title}
                    fill
                    className="object-cover"
                    data-ai-hint="tech event"
                />
                 <Badge variant="secondary" className="absolute top-2 left-2 bg-background/80 backdrop-blur-sm">{event.category}</Badge>
            </div>
            <div>
                <h3 className="font-bold text-lg">{event.title}</h3>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-3">{event.description}</p>
            </div>
            <div className="space-y-2 text-sm">
                 <div className="flex items-center text-muted-foreground">
                    <Calendar className="mr-2 h-4 w-4 flex-shrink-0" />
                    <span>{formattedDate || 'Date TBD'}</span>
                </div>
                 <div className="flex items-center text-muted-foreground">
                    <Clock className="mr-2 h-4 w-4 flex-shrink-0" />
                    <span>{formattedTime || 'Time TBD'}</span>
                </div>
                <div className="flex items-center text-muted-foreground">
                    <MapPin className="mr-2 h-4 w-4 flex-shrink-0" />
                    <span>{event.location || "Location TBD"}</span>
                </div>
            </div>
            <Button size="sm" className="w-full bg-accent hover:bg-accent/90" asChild>
                <a href={event.urls?.[0]} target="_blank" rel="noopener noreferrer">
                    Register <ExternalLink className="ml-2 h-4 w-4"/>
                </a>
            </Button>
        </div>
    )
}

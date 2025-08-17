"use client";

import Image from "next/image";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Ticket, Clock, Star, ExternalLink } from "lucide-react";
import type { Event } from "@/lib/types";
import { cn } from "@/lib/utils";
import React from "react";
import Link from "next/link";

type EventCardProps = {
  event: Event;
  view: "grid" | "list";
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
};

export function EventCard({ event, view, isFavorite, onToggleFavorite }: EventCardProps) {
  const [formattedDate, setFormattedDate] = React.useState("");
  const [formattedTime, setFormattedTime] = React.useState("");

  React.useEffect(() => {
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
  }, [event.event_date]);

  const GridView = () => (
     <Card className="group transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1 overflow-hidden p-4 border rounded-2xl h-full flex flex-col">
       <div className="relative mb-4 aspect-[16/10] w-full overflow-hidden rounded-lg group">
        <Image
          src={event.image_url || "https://placehold.co/600x400.png"}
          alt={event.title}
          fill
          className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
          data-ai-hint="tech conference"
        />
        <Badge variant="secondary" className="absolute top-2 left-2 bg-background/80 backdrop-blur-sm">{event.category}</Badge>
        <Badge variant={event.status === 'upcoming' ? 'default' : 'secondary'} className="absolute top-2 right-2">{event.status}</Badge>
      </div>
      <div className="flex flex-col flex-grow">
        <CardTitle className="text-lg font-bold font-headline mb-2 group-hover:text-primary transition-colors">
            {event.title}
        </CardTitle>
        <CardContent className="p-0 flex-grow text-sm text-muted-foreground space-y-2">
          <div className="flex items-center">
            <Calendar className="mr-2 h-4 w-4 flex-shrink-0" />
            <span>{formattedDate || <span className="h-4 bg-muted rounded w-32 animate-pulse" />}</span>
          </div>
          <div className="flex items-center">
            <MapPin className="mr-2 h-4 w-4 flex-shrink-0" />
            <span>{event.location || "Location TBD"}</span>
          </div>
        </CardContent>
        <CardFooter className="p-0 mt-4 flex justify-between items-center">
          <Button variant="default" size="sm" className="bg-accent hover:bg-accent/90 w-full">
            Register
          </Button>
        </CardFooter>
      </div>
    </Card>
  )

  const ListView = () => (
    <Card className="group transition-all duration-300 ease-in-out hover:shadow-lg overflow-hidden border rounded-2xl md:flex">
        <div className="relative aspect-[16/9] md:aspect-auto md:w-1/3 lg:w-1/4">
             <Image
                src={event.image_url || "https://placehold.co/600x400.png"}
                alt={event.title}
                fill
                className="object-cover"
                data-ai-hint="tech meetup"
            />
            <Badge variant={event.status === 'upcoming' ? 'default' : 'secondary'} className="absolute top-2 right-2 capitalize">{event.status}</Badge>
        </div>
        <div className="p-4 md:p-6 flex-1 flex flex-col justify-between">
            <div>
                <Badge variant="secondary" className="mb-2">{event.category}</Badge>
                <CardTitle className="text-xl font-bold font-headline mb-2 group-hover:text-primary transition-colors">
                    {event.title}
                </CardTitle>
                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                    {event.description}
                </p>
                <div className="text-sm text-muted-foreground space-y-2 mb-4">
                    <div className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4 flex-shrink-0" />
                        <span>{formattedDate || <span className="h-4 bg-muted rounded w-32 animate-pulse" />}</span>
                    </div>
                    <div className="flex items-center">
                        <MapPin className="mr-2 h-4 w-4 flex-shrink-0" />
                        <span>{event.location || "Location TBD"}</span>
                    </div>
                     <div className="flex items-center">
                        <Clock className="mr-2 h-4 w-4 flex-shrink-0" />
                        <span>{formattedTime || <span className="h-4 bg-muted rounded w-20 animate-pulse" />}</span>
                    </div>
                </div>
            </div>
            <div className="flex justify-between items-center mt-4">
                 <Link href="#" className="text-sm font-medium text-primary hover:underline">
                    View Details
                </Link>
                <Button size="sm" className="bg-accent hover:bg-accent/90">
                    Register <ExternalLink className="ml-2 h-4 w-4"/>
                </Button>
            </div>
        </div>
    </Card>
  )

  return view === 'grid' ? <GridView /> : <ListView />;
}
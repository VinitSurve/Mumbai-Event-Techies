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
import { Calendar, MapPin, ArrowRight, Star } from "lucide-react";
import type { Event } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import React from "react";

type EventCardProps = {
  event: Event;
  view: "grid" | "list";
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
};

export function EventCard({ event, view, isFavorite, onToggleFavorite }: EventCardProps) {
  const [formattedDate, setFormattedDate] = React.useState("");

  React.useEffect(() => {
    const eventDate = new Date(event.event_date);
    setFormattedDate(eventDate.toLocaleDateString("en-IN", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    }));
  }, [event.event_date]);


  const cardContent = (
    <>
      <div className={cn("relative mb-4 aspect-video w-full overflow-hidden rounded-lg", view === 'list' && 'sm:w-48 sm:aspect-square sm:mb-0 sm:mr-6 flex-shrink-0')}>
        <Image
          src={event.image_url || "https://placehold.co/600x400.png"}
          alt={event.title}
          layout="fill"
          objectFit="cover"
          className="transition-transform duration-300 ease-in-out group-hover:scale-105"
          data-ai-hint="tech event"
        />
      </div>
      <div className="flex flex-col flex-grow">
        <CardHeader className="p-0 mb-3">
          <div className="flex justify-between items-start">
            <Badge variant="secondary" className="mb-2 capitalize">
              {event.category}
            </Badge>
          </div>
          <CardTitle className="text-lg font-headline group-hover:text-primary transition-colors">
            {event.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 flex-grow">
          <div className="flex items-center text-sm text-muted-foreground mb-2">
            <Calendar className="mr-2 h-4 w-4" />
            {formattedDate ? (
              <span>
                {formattedDate}
              </span>
            ) : (
              <div className="h-4 bg-muted rounded w-32 animate-pulse" />
            )}
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="mr-2 h-4 w-4" />
            <span>{event.location || "Location TBD"}</span>
          </div>
        </CardContent>
        <CardFooter className="p-0 mt-4 flex justify-between items-center">
          <Button variant="default" size="sm" asChild>
            <a
              href={event.urls?.[0] || "#"}
              target="_blank"
              rel="noopener noreferrer"
            >
              Register <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={() => onToggleFavorite(event.id)}>
                  <Star className={cn("h-5 w-5", isFavorite ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground")} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isFavorite ? "Remove from favorites" : "Add to favorites"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardFooter>
      </div>
    </>
  );

  return (
    <Card className={cn("group transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1 overflow-hidden", view === 'list' && 'flex flex-col sm:flex-row p-4')}>
        {view === 'grid' ? <div className="p-4">{cardContent}</div> : cardContent}
    </Card>
  );
}

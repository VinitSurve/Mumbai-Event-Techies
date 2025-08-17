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
import { Calendar, MapPin, Ticket, Users, Mic, Star } from "lucide-react";
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
    setFormattedDate(eventDate.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }));
  }, [event.event_date]);


  const cardContent = (
    <>
      <div className="relative mb-4 aspect-[16/10] w-full overflow-hidden rounded-lg group">
        <Image
          src={event.image_url || "https://placehold.co/600x400.png"}
          alt={event.title}
          fill
          objectFit="cover"
          className="transition-transform duration-300 ease-in-out group-hover:scale-105"
          data-ai-hint="tech conference"
        />
        <div className="absolute top-2 right-2">
          <Badge variant="secondary" className="bg-green-100 text-green-800">Sponsered</Badge>
        </div>
        <div className="absolute bottom-2 left-2 flex gap-2">
           <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={() => onToggleFavorite(event.id)} className="w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white">
                  <Star className={cn("h-4 w-4", isFavorite ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground")} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isFavorite ? "Remove from favorites" : "Add to favorites"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      <div className="flex flex-col flex-grow">
          <p className="text-sm text-primary font-semibold mb-1 capitalize">{event.category}</p>
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
          <div className="flex items-center">
            <Ticket className="mr-2 h-4 w-4 flex-shrink-0" />
            <span>Free</span>
          </div>
        </CardContent>
        <CardFooter className="p-0 mt-4 flex justify-between items-center">
          <div className="flex items-center">
            <div className="flex -space-x-2 mr-2">
                <Image className="inline-block h-6 w-6 rounded-full ring-2 ring-white" src="https://placehold.co/32x32.png" alt="User" width={24} height={24} />
                <Image className="inline-block h-6 w-6 rounded-full ring-2 ring-white" src="https://placehold.co/32x32.png" alt="User" width={24} height={24} />
            </div>
            <span className="text-xs text-muted-foreground">+54 going</span>
          </div>
          <Button variant="default" size="sm" className="bg-accent hover:bg-accent/90">
            Register
          </Button>
        </CardFooter>
      </div>
    </>
  );

  return (
    <Card className="group transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1 overflow-hidden p-4 border rounded-2xl">
        {cardContent}
    </Card>
  );
}

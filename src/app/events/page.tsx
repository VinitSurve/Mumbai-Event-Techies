
// src/app/events/page.tsx
"use client";

import * as React from "react";
import { mockEvents } from "@/lib/data";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { EventCard } from "@/components/event-card";
import { Button } from "@/components/ui/button";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { EventFilters } from "@/components/event-filters";
import { List, LayoutGrid } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function EventsPage() {
  const [favorites, setFavorites] = useLocalStorage<string[]>("favoriteEvents", []);
  const [view, setView] = useLocalStorage<"grid" | "list">("eventView", "list");

  const toggleFavorite = (eventId: string) => {
    setFavorites(prev => 
      prev.includes(eventId) 
        ? prev.filter(id => id !== eventId) 
        : [...prev, eventId]
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 mt-20">
        <div className="container py-8">
            <div className="text-center md:text-left mb-8">
                <h1 className="text-3xl md:text-4xl font-bold font-headline">Tech Events in Mumbai</h1>
                <p className="text-muted-foreground mt-2">Discover and attend the best tech events in Mumbai.</p>
            </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <aside className="hidden md:block md:col-span-1">
              <EventFilters />
            </aside>
            <div className="md:col-span-3">
               <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-muted-foreground">{mockEvents.length} events found</p>
                <div className="flex items-center gap-2">
                   <Button variant={view === 'list' ? 'default' : 'outline'} size="icon" onClick={() => setView('list')}>
                    <List className="h-4 w-4" />
                  </Button>
                   <Button variant={view === 'grid' ? 'default' : 'outline'} size="icon" onClick={() => setView('grid')}>
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Separator className="mb-6"/>
              <div 
                className={
                  view === 'grid' 
                  ? "grid grid-cols-1 sm:grid-cols-2 gap-6" 
                  : "flex flex-col gap-6"
                }
              >
                {mockEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    view={view}
                    isFavorite={favorites.includes(event.id)}
                    onToggleFavorite={toggleFavorite}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

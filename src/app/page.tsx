"use client";

import * as React from "react";
import { mockEvents } from "@/lib/data";
import type { Event } from "@/lib/types";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { EventFilters } from "@/components/event-filters";
import { EventCard } from "@/components/event-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LayoutGrid, List } from "lucide-react";
import { useLocalStorage } from "@/hooks/use-local-storage";

export default function Home() {
  const [view, setView] = React.useState<"grid" | "list">("grid");
  const [filters, setFilters] = React.useState({
    categories: [] as string[],
    date: null as Date | null,
    location: "",
  });
  const [favorites, setFavorites] = useLocalStorage<string[]>("favoriteEvents", []);

  const toggleFavorite = (eventId: string) => {
    setFavorites(prev => 
      prev.includes(eventId) 
        ? prev.filter(id => id !== eventId) 
        : [...prev, eventId]
    );
  };

  const filteredEvents = React.useMemo(() => {
    return mockEvents.filter((event) => {
      const categoryMatch =
        filters.categories.length === 0 ||
        filters.categories.includes(event.category);
      
      const locationMatch = 
        !filters.location ||
        event.location?.toLowerCase().includes(filters.location.toLowerCase());

      const dateMatch = !filters.date || new Date(event.event_date) >= filters.date;
      
      return categoryMatch && locationMatch && dateMatch;
    });
  }, [filters]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        <section className="py-20 md:py-28 bg-gradient-to-br from-primary/10 via-background to-background">
          <div className="container text-center">
            <h1 className="font-headline text-4xl md:text-6xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 text-transparent bg-clip-text">
              Discover Tech Events in Mumbai
            </h1>
            <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              Your live feed for Mumbai's tech events, sourced directly from
              the heart of the community.
            </p>
          </div>
        </section>

        <div className="container pb-16 md:pb-24 -mt-10 md:-mt-16">
          <div className="grid grid-cols-1 lg:grid-cols-4 lg:gap-8">
            <aside className="lg:col-span-1 mb-8 lg:mb-0">
              <div className="sticky top-20">
                <EventFilters filters={filters} onFilterChange={setFilters} />
              </div>
            </aside>

            <div className="lg:col-span-3">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-headline font-bold">
                  Upcoming Events
                </h2>
                <div className="hidden md:flex items-center gap-2">
                  <Button variant={view === 'grid' ? 'default' : 'outline'} size="icon" onClick={() => setView('grid')}>
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                  <Button variant={view === 'list' ? 'default' : 'outline'} size="icon" onClick={() => setView('list')}>
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {filteredEvents.length > 0 ? (
                <div
                  className={`grid gap-6 ${
                    view === "grid"
                      ? "grid-cols-1 md:grid-cols-2"
                      : "grid-cols-1"
                  }`}
                >
                  {filteredEvents.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      view={view}
                      isFavorite={favorites.includes(event.id)}
                      onToggleFavorite={toggleFavorite}
                    />
                  ))}
                </div>
              ) : (
                <Card className="flex flex-col items-center justify-center p-12 text-center">
                   <div className="mb-4 rounded-full bg-secondary p-3">
                      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><path d="M10.6.8a1 1 0 0 1 1.2 0l8.3 6.9a1 1 0 0 1 .4 1V21a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8.7a1 1 0 0 1 .4-1L10.6.8Z"/><path d="M12 22V15a3 3 0 0 1 3-3h.5a3 3 0 0 1 3 3v7"/><path d="M12 22V15a3 3 0 0 0-3-3H8.5a3 3 0 0 0-3 3v7"/></svg>
                    </div>
                  <h3 className="text-xl font-bold font-headline">No Events Found</h3>
                  <p className="text-muted-foreground mt-2">
                    Try adjusting your filters.
                  </p>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

"use client";

import * as React from "react";
import { mockEvents } from "@/lib/data";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { EventCard } from "@/components/event-card";
import { Button } from "@/components/ui/button";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Hero } from "@/components/hero";
import { EventCategories } from "@/components/event-categories";
import { HowItWorks } from "@/components/how-it-works";
import { Cta } from "@/components/cta";
import Link from "next/link";

export default function Home() {
  const [favorites, setFavorites] = useLocalStorage<string[]>("favoriteEvents", []);

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
      <main className="flex-1">
        <Hero />
        
        <section className="py-12 md:py-24">
          <div className="container">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold font-headline">Featured Events</h2>
              <Button asChild variant="link" className="text-primary">
                <Link href="/events">
                  View All &rarr;
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {mockEvents.slice(0, 3).map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  view="grid"
                  isFavorite={favorites.includes(event.id)}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </div>
          </div>
        </section>

        <EventCategories />
        <HowItWorks />
        <Cta />
      </main>
      <Footer />
    </div>
  );
}
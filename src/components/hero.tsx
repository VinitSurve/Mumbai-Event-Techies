
'use client';

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Search } from "lucide-react";
import { Logo } from "./logo";
import Link from "next/link";

export function Hero() {
  return (
    <div className="relative bg-primary pt-24 md:pt-32 pb-20 md:pb-28">
      <div className="absolute inset-0 bg-[url(/hero-grid.svg)] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
      <div className="container relative text-center">
        <div className="flex justify-center items-center gap-4 mb-4">
            <Logo light />
        </div>
        <p className="text-lg md:text-xl max-w-3xl mx-auto text-primary-foreground/80 mb-8">
          Your exclusive gateway to the most exciting tech events in Mumbai, curated by the community for the community.
        </p>
        <div className="max-w-xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              type="search" 
              placeholder="Search for an event, topic, or location"
              className="w-full rounded-full h-14 pl-12 pr-32 text-base text-foreground"
            />
            <Button type="submit" size="lg" className="absolute right-2 top-1/2 -translate-y-1/2 h-10">
              Search
            </Button>
          </div>
        </div>
        <div className="mt-8 flex justify-center gap-4">
          <Button asChild size="lg" variant="secondary">
            <Link href="/events">Latest Events</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-primary">
            <Link href="/submit-event">Submit an Event</Link>
          </Button>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 w-full h-20" 
         style={{
           background: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 1440 120\'%3E%3Cpath fill=\'%23F9FAFB\' fill-opacity=\'1\' d=\'M0,32L1440,120L1440,120L0,120Z\'%3E%3C/path%3E%3C/svg%3E")',
           backgroundRepeat: 'no-repeat',
           backgroundSize: 'cover',
           backgroundPosition: 'center bottom'
         }}
      />
    </div>
  )
}

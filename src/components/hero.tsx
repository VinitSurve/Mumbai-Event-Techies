
'use client';

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Search } from "lucide-react";

export function Hero() {
  return (
    <div className="relative bg-primary pt-24 md:pt-32 pb-20 md:pb-28">
      <div className="absolute inset-0 bg-[url(/hero-grid.svg)] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
      <div className="container relative text-center text-primary-foreground">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter mb-4">
          मुंबई Event Techies
        </h1>
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
            <Button type="submit" size="lg" className="absolute right-2 top-1/2 -translate-y-1/2 h-10 bg-accent hover:bg-accent/90">
              Search
            </Button>
          </div>
        </div>
        <div className="mt-8 flex justify-center gap-4">
          <Button size="lg" className="bg-accent hover:bg-accent/90">Latest Events</Button>
          <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-primary">
            Submit an Event
          </Button>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 w-full h-20 bg-background" style={{ clipPath: 'polygon(0 100%, 100% 100%, 100% 0, 0 100%)' }}></div>
       <div className="absolute bottom-0 left-0 w-full h-20" 
         style={{
           background: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 1440 120\'%3E%3Cpath fill=\'%23F8FAFC\' fill-opacity=\'1\' d=\'M0,32L1440,120L1440,120L0,120Z\'%3E%3C/path%3E%3C/svg%3E")',
           backgroundRepeat: 'no-repeat',
           backgroundSize: 'cover',
           backgroundPosition: 'center bottom'
         }}
      />

    </div>
  )
}

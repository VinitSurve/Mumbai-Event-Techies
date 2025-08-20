// src/app/events/[id]/page.tsx
"use client";

import * as React from "react";
import { mockEvents } from "@/lib/data";
import type { Event } from "@/lib/types";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { notFound, usePathname } from "next/navigation";
import Image from "next/image";
import { Calendar, Clock, MapPin, Share2, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { EventCard } from "@/components/event-card";
import { useToast } from "@/hooks/use-toast";

interface EventDetailPageProps {
  params: { id: string };
}

export default function EventDetailPage({ params }: EventDetailPageProps) {
    const { id } = params;
    const { toast } = useToast();
    const pathname = usePathname();
    
    const event = mockEvents.find((e) => e.id === id);

    if (!event) {
        notFound();
    }

    const otherEvents = mockEvents.filter(e => e.id !== id).slice(0, 3);

    const eventDate = new Date(event.event_date);
    const formattedDate = eventDate.toLocaleDateString("en-US", {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });
    const formattedTime = eventDate.toLocaleTimeString("en-US", {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
    
    const handleShare = async () => {
        const shareData = {
            title: event.title,
            text: `Check out this event: ${event.title}`,
            url: window.location.origin + pathname,
        };
        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(shareData.url);
                toast({
                    title: "Link Copied!",
                    description: "Event link copied to your clipboard.",
                });
            }
        } catch (error) {
            console.error("Error sharing:", error);
            toast({
                title: "Error",
                description: "Could not share the event.",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-secondary/30">
            <Header />
            <main className="flex-1 mt-16">
                <div className="relative h-64 md:h-80 w-full">
                    <Image
                        src={event.image_url || "https://placehold.co/1200x400.png"}
                        alt={event.title}
                        fill
                        className="object-cover"
                        data-ai-hint="event banner"
                        priority
                    />
                    <div className="absolute inset-0 bg-black/50" />
                </div>
                <div className="container -mt-24 md:-mt-32 relative z-10 pb-12 md:pb-20">
                    <div className="bg-card rounded-2xl shadow-xl p-6 md:p-8">
                        <div className="flex flex-col md:flex-row md:items-start md:gap-8">
                            <div className="flex-grow">
                                <Badge variant="secondary" className="mb-2 text-primary">{event.category}</Badge>
                                <h1 className="text-3xl md:text-4xl font-bold font-headline mb-4">{event.title}</h1>
                                <div className="flex flex-wrap gap-x-6 gap-y-3 text-muted-foreground mb-6">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-5 h-5 text-primary" />
                                        <span>{formattedDate}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-5 h-5 text-primary" />
                                        <span>{formattedTime}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-5 h-5 text-primary" />
                                        <span>{event.location}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex-shrink-0 flex flex-col gap-3 w-full md:w-auto mt-4 md:mt-0">
                                <Button size="lg" className="w-full bg-accent hover:bg-accent/90">Register Now</Button>
                                <Button size="lg" variant="outline" className="w-full" onClick={handleShare}>
                                    <Share2 className="mr-2 h-5 w-5" /> Share
                                </Button>
                            </div>
                        </div>
                        
                        <div className="mt-8 grid md:grid-cols-3 gap-8">
                            <div className="md:col-span-2">
                                <h2 className="text-2xl font-bold font-headline mb-4">About the Event</h2>
                                <div className="prose prose-stone dark:prose-invert max-w-none text-muted-foreground">
                                    <p>{event.description}</p>
                                    <p>Join us for an exciting session of learning and networking. This event is perfect for professionals looking to expand their knowledge and connect with peers in the industry.</p>
                                </div>
                            </div>
                            <div>
                                <Card className="p-4 bg-secondary/50">
                                    <h3 className="font-bold text-lg mb-4">Organizer</h3>
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                                            <Users className="w-6 h-6 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <p className="font-semibold">Mumbai Techies</p>
                                            <p className="text-sm text-muted-foreground">Community Hosted</p>
                                        </div>
                                    </div>
                                    <h3 className="font-bold text-lg mt-6 mb-4">Tags</h3>
                                    <div className="flex flex-wrap gap-2">
                                        <Badge variant="outline">Next.js</Badge>
                                        <Badge variant="outline">React</Badge>
                                        <Badge variant="outline">Mumbai</Badge>
                                        <Badge variant="outline">Tech</Badge>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 md:mt-20">
                        <h2 className="text-2xl md:text-3xl font-bold font-headline mb-8 text-center">
                            Other Events You Might Like
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                             {otherEvents.map((event) => (
                                <EventCard
                                    key={event.id}
                                    event={event}
                                    view="grid"
                                    isFavorite={false}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}

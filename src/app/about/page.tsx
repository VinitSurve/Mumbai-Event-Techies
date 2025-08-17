// src/app/about/page.tsx
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Bot, CalendarSearch, Bell, Rss, Mail } from 'lucide-react';
import { cn } from "@/lib/utils";

const howItWorksItems = [
    {
        icon: Users,
        title: "WhatsApp Community Integration",
        description: "Our platform monitors the मुंबई Event Techies WhatsApp community for event announcements. When a new event is posted, our system automatically detects and extracts the event details."
    },
    {
        icon: Bot,
        title: "Automated Event Processing",
        description: "Our AI-powered system processes the event information, categorizes it, and publishes it on our platform. This ensures that all events are properly organized and easily discoverable."
    },
    {
        icon: CalendarSearch,
        title: "Event Discovery",
        description: "Users can browse events by category, date, or location. Each event page provides comprehensive information, including date, time, location, and registration links."
    },
    {
        icon: Bell,
        title: "Stay Updated",
        description: "Users can subscribe to email notifications or use our RSS feed to stay updated on new events. No login or account creation is required."
    }
]

const communityGuidelines = [
    "Be respectful and considerate of others",
    "Share accurate and complete event information",
    "Avoid spamming or posting irrelevant content",
    "Respect intellectual property rights",
    "Follow the code of conduct at all events"
]

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-secondary/50">
      <Header />
      <main className="flex-1 mt-16">
        <div className="container py-12 md:py-20">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold font-headline text-center mb-12">
              About मुंबई Event Techies
            </h1>

            <div className="space-y-8">
              <Card className="p-6 md:p-8">
                <h2 className="text-2xl font-bold font-headline mb-4">Our Mission</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    मुंबई Event Techies is a community-driven platform that automatically syncs tech events from WhatsApp communities to a professional event management website. Our mission is to make it easy for tech enthusiasts in Mumbai to discover and attend the best tech events in the city.
                  </p>
                  <p>
                    We believe that knowledge sharing and networking are essential for the growth of the tech community in Mumbai. By providing a centralized platform for tech events, we aim to foster collaboration, learning, and innovation in the tech ecosystem.
                  </p>
                </div>
              </Card>

              <Card className="p-6 md:p-8">
                <h2 className="text-2xl font-bold font-headline mb-6">How It Works</h2>
                <div className="space-y-6">
                  {howItWorksItems.map((item, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <item.icon className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold">{item.title}</h3>
                        <p className="text-muted-foreground mt-1">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6 md:p-8">
                <h2 className="text-2xl font-bold font-headline mb-4">Community Guidelines</h2>
                <p className="text-muted-foreground mb-6">
                  मुंबई Event Techies is committed to fostering a welcoming and inclusive community. We expect all community members and event organizers to adhere to the following guidelines:
                </p>
                <ul className="space-y-3 list-disc list-inside text-muted-foreground">
                  {communityGuidelines.map((guideline, index) => (
                    <li key={index}>{guideline}</li>
                  ))}
                </ul>
              </Card>

              <div className="bg-primary text-primary-foreground rounded-2xl p-8 md:p-12 text-center">
                 <h2 className="text-3xl font-bold font-headline mb-3">Join Our Community</h2>
                 <p className="max-w-2xl mx-auto text-primary-foreground/80 mb-8">
                    Connect with fellow tech enthusiasts in Mumbai and stay updated on the latest tech events.
                 </p>
                 <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <Button size="lg" variant="secondary" className="bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground">
                        <Rss className="mr-2 h-5 w-5" />
                        Subscribe to RSS Feed
                    </Button>
                    <Button size="lg" variant="secondary" className="bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground">
                        <Mail className="mr-2 h-5 w-5" />
                        Email Notifications
                    </Button>
                 </div>
              </div>

            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
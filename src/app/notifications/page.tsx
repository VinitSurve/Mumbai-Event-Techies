
// src/app/notifications/page.tsx
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, WifiOff, Settings } from 'lucide-react';
import Link from 'next/link';

export default function NotificationsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-secondary/30">
      <Header />
      <main className="flex-1 mt-16">
        <div className="bg-primary text-primary-foreground py-16 text-center">
            <div className="container">
                <Bell className="mx-auto h-12 w-12 mb-4" />
                <h1 className="text-4xl md:text-5xl font-bold font-headline">Notifications</h1>
                <p className="mt-4 text-lg md:text-xl max-w-3xl mx-auto text-primary-foreground/80">
                    Stay updated with the latest event alerts and community news.
                </p>
            </div>
        </div>

        <div className="container py-12 md:py-20">
          <div className="max-w-3xl mx-auto">
            <Card className="text-center p-8">
              <CardHeader>
                <div className="mx-auto w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                    <WifiOff className="w-8 h-8 text-muted-foreground" />
                </div>
                <CardTitle className="text-2xl font-bold">You have no new notifications</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6">
                  Check back later for updates on events, new community features, and more. Enable notifications to get real-time alerts.
                </p>
                <div className="flex justify-center gap-4">
                    <Button>
                        <Settings className="mr-2 h-4 w-4" />
                        Notification Settings
                    </Button>
                    <Button variant="outline" asChild>
                        <Link href="/events">
                            Explore Events
                        </Link>
                    </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

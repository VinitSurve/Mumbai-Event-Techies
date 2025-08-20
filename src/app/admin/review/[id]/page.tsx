// src/app/admin/review/[id]/page.tsx
'use client';
import * as React from 'react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, X, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { notFound, useParams, useSearchParams } from 'next/navigation';
import type { Event } from '@/lib/types';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import { app } from '@/lib/firebase'; // Note: Using client-side firebase instance

const firestore = getFirestore(app);

interface PageProps {
  params: { id: string };
}

export default function AdminReviewPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const id = params.id as string;
    const adminKey = searchParams.get('key');

    const [event, setEvent] = React.useState<Event | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [isAuthorized, setIsAuthorized] = React.useState(false);
    const [actionLoading, setActionLoading] = React.useState<"approve" | "reject" | null>(null);

    React.useEffect(() => {
        // In a real app, this key would be checked on the server-side.
        // This is a simplified client-side check for prototyping.
        // NOTE: NEXT_PUBLIC_ is needed to expose env var to the client.
        if (adminKey && adminKey === (process.env.NEXT_PUBLIC_ADMIN_KEY || "SUPER_SECRET_ADMIN_KEY")) {
            setIsAuthorized(true);
        } else {
            setIsAuthorized(false);
            setLoading(false);
        }
    }, [adminKey]);

    React.useEffect(() => {
        if (isAuthorized && id) {
            const fetchPendingEvent = async () => {
                try {
                    const eventDocRef = doc(firestore, 'pendingEvents', id);
                    const eventDoc = await getDoc(eventDocRef);

                    if (eventDoc.exists()) {
                        setEvent({ id: eventDoc.id, ...eventDoc.data() } as Event);
                    } else {
                        toast({ title: "Event not found", description: `No pending event with ID: ${id}`, variant: "destructive" });
                    }
                } catch (err) {
                    console.error("Firestore error:", err);
                    toast({ title: "Failed to fetch event", description: (err as Error).message, variant: "destructive" });
                } finally {
                    setLoading(false);
                }
            };

            fetchPendingEvent();
        }
    }, [id, isAuthorized, toast]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        );
    }
    
    if (!isAuthorized) {
         return (
            <div className="flex flex-col min-h-screen bg-secondary/30 text-center py-20">
                <h1 className="text-3xl font-bold text-destructive">Access Denied</h1>
                <p className="text-muted-foreground mt-2">You are not authorized to view this page.</p>
            </div>
        )
    }

    if (!event) {
        // Instead of notFound(), show a message, as it might still be loading or just not found.
        return (
             <div className="flex flex-col min-h-screen bg-secondary/30 text-center py-20">
                <h1 className="text-3xl font-bold">Event Not Found</h1>
                <p className="text-muted-foreground mt-2">Could not find a pending event with the specified ID.</p>
            </div>
        )
    }

    const handleAction = async (action: 'approve' | 'reject') => {
        setActionLoading(action);
        console.log(`Performing action: ${action} for event ${id}`);
        // Simulate API call to approve/reject
        await new Promise(res => setTimeout(res, 1500));
        
        toast({
            title: `Event ${action}d!`,
            description: `The event "${event.title}" has been successfully ${action}d.`,
        });

        setActionLoading(null);
        // Maybe redirect or update UI state
    };


    return (
        <div className="flex flex-col min-h-screen bg-secondary/30">
            <Header />
            <main className="flex-1 mt-16 py-12 md:py-20">
                <div className="container">
                    <Card className="max-w-4xl mx-auto">
                        <CardHeader>
                            <CardTitle className="text-3xl font-headline">Admin Event Review</CardTitle>
                            <CardDescription>Review the scraped event data below and choose to approve or reject it.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <h3 className="font-semibold text-lg">Title</h3>
                                <p className="text-muted-foreground">{event.title}</p>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">Description</h3>
                                <p className="text-muted-foreground whitespace-pre-wrap">{event.description}</p>
                            </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <h3 className="font-semibold text-lg">Date & Time</h3>
                                    <p className="text-muted-foreground">{event.event_date ? new Date(event.event_date).toLocaleString() : 'N/A'}</p>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">Location</h3>
                                    <p className="text-muted-foreground">{event.location}</p>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">Category</h3>
                                    <Badge variant="secondary">{event.category}</Badge>
                                </div>
                                 <div>
                                    <h3 className="font-semibold text-lg">Source URL</h3>
                                    <a href={event.originalUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all">{event.originalUrl}</a>
                                </div>
                            </div>
                           
                            <div className="flex justify-end gap-4 pt-6 border-t">
                                <Button 
                                    variant="destructive" 
                                    size="lg" 
                                    onClick={() => handleAction('reject')}
                                    disabled={!!actionLoading}
                                >
                                     {actionLoading === 'reject' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <X className="mr-2 h-4 w-4" />}
                                    Reject
                                </Button>
                                <Button 
                                    variant="default" 
                                    size="lg" 
                                    onClick={() => handleAction('approve')}
                                    disabled={!!actionLoading}
                                    className="bg-green-600 hover:bg-green-700"
                                >
                                    {actionLoading === 'approve' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                                    Approve
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
            <Footer />
        </div>
    );
}

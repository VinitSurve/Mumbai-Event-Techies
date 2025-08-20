// src/app/events/preview/[id]/page.tsx
'use client';
import * as React from 'react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, CheckCircle, Hourglass } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';

// In a real app, this would check Firestore for the event's status
const checkEventStatus = async (id: string): Promise<{status: 'pending' | 'approved', slug?: string}> => {
    console.log(`Checking status for event preview: ${id}`);
    // Simulate checking status
    await new Promise(res => setTimeout(res, 2000));

    // For this prototype, we'll simulate it being approved after a few seconds
    const isApproved = true; // Change to false to test pending state
    
    if (isApproved) {
        return { status: 'approved', slug: 'nextjs-mumbai-meetup' }; // return a mock slug
    }
    
    return { status: 'pending' };
};

export default function EventPreviewPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [status, setStatus] = React.useState<'pending' | 'approved'>('pending');
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        if (!id) return;
        const interval = setInterval(() => {
            checkEventStatus(id).then(result => {
                if (result.status === 'approved') {
                    setStatus('approved');
                    clearInterval(interval);
                    toast({ title: "Event Approved!", description: "Redirecting you to the official event page." });
                    setTimeout(() => {
                        router.push(`/events/${result.slug}`);
                    }, 2000);
                }
            });
        }, 5000); // Check every 5 seconds

        // Initial check
        checkEventStatus(id).then(result => {
             if (result.status === 'approved') {
                setStatus('approved');
                clearInterval(interval);
                router.push(`/events/${result.slug}`);
            }
            setLoading(false);
        });

        return () => clearInterval(interval);
    }, [id, router]);

    return (
        <div className="flex flex-col min-h-screen bg-secondary/30">
            <Header />
            <main className="flex-1 mt-16 py-12 md:py-20 flex items-center justify-center">
                <div className="container">
                    <Card className="max-w-2xl mx-auto text-center">
                        <CardHeader>
                             <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                                {status === 'pending' ? <Hourglass className="w-8 h-8 text-primary" /> : <CheckCircle className="w-8 h-8 text-green-500" />}
                            </div>
                            <CardTitle className="text-3xl font-headline">
                                {status === 'pending' ? 'Event Under Review' : 'Event Approved!'}
                            </CardTitle>
                            <CardDescription className="text-lg">
                                {status === 'pending'
                                    ? "This event has been submitted and is waiting for approval from our admin team. Check back soon!"
                                    : "This event is now live. Redirecting you to the official page..."}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                           <Loader2 className="w-8 h-8 mx-auto animate-spin text-muted-foreground" />
                        </CardContent>
                    </Card>
                </div>
            </main>
            <Footer />
        </div>
    );
}

// Dummy toast for client component
const toast = (props: {title: string, description?: string}) => {
    console.log(`Toast: ${props.title} - ${props.description}`);
}

// src/app/subscribe/page.tsx
'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Bell, CheckCircle, Mail, Sparkles, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

const subscribeSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  categories: z.array(z.string()).optional(),
});

const eventCategories = [
  'Tech Talks',
  'Workshops',
  'Conferences',
  'Meetups',
  'Hackathons',
];

const whySubscribeItems = [
    { text: "Real-time alerts so you never miss an event." },
    { text: "Connect with Mumbai's top tech talent." },
    { text: "Get your questions answered by the community." },
    { text: "The fastest way to stay in the loop." }
]

const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 448 512"
    fill="currentColor"
  >
    <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.8 0-67.6-9.2-97.2-25.7l-6.7-4-69.8 18.3L72 359.2l-4.5-7c-18.9-29.7-28.9-63.3-28.9-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
  </svg>
);


export default function SubscribePage() {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof subscribeSchema>>({
    resolver: zodResolver(subscribeSchema),
    defaultValues: {
      email: '',
      categories: [],
    },
  });

  function onSubmit(data: z.infer<typeof subscribeSchema>) {
    console.log(data);
    toast({
      title: 'Successfully Subscribed!',
      description: 'You will now receive email updates for the selected categories.',
      variant: 'default',
    });
    form.reset();
  }

  return (
    <div className="flex flex-col min-h-screen bg-secondary/30">
      <Header />
      <main className="flex-1 mt-16">
        <div className="container py-12 md:py-20">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
                <Sparkles className="mx-auto h-12 w-12 text-primary mb-4" />
                <h1 className="text-4xl md:text-5xl font-bold font-headline">
                    Never Miss a Beat
                </h1>
                <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
                    Our WhatsApp community is the heart of Mumbai's tech scene. Join us for real-time event updates, networking, and discussions.
                </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-center mb-12">
                <div className="md:col-span-3">
                     <Card className="bg-green-500/10 border-green-500/30 p-8 text-center flex flex-col items-center">
                        <CardHeader className="p-0 mb-4">
                            <WhatsAppIcon className="h-16 w-16 text-green-600 mx-auto" />
                            <CardTitle className="text-3xl font-headline mt-4 text-green-800">Join our WhatsApp Community</CardTitle>
                             <CardDescription className="text-base text-green-700 mt-2">
                                This is the best way to stay updated. Instant notifications, zero spam.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0 w-full">
                            <Button asChild className="w-full font-bold text-lg" variant="default" size="lg">
                                <Link href="https://chat.whatsapp.com/H6NBKxbAMIzHehfIVAjAi1" target="_blank" rel="noopener noreferrer">
                                   <WhatsAppIcon className="h-6 w-6 mr-3" /> Join Now
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
                <div className="md:col-span-2">
                     <ul className="space-y-4">
                        {whySubscribeItems.map((item, index) => (
                            <li key={index} className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                                <span className="text-muted-foreground">{item.text}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <Card className="p-6 md:p-8">
                <h2 className="text-2xl font-bold font-headline mb-2 text-center">Prefer Email?</h2>
                <p className="text-muted-foreground text-center mb-6">Get a weekly digest of all events if WhatsApp isn't your thing.</p>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="sr-only">Your Email</FormLabel>
                          <FormControl>
                            <div className="relative">
                               <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                               <Input
                                type="email"
                                placeholder="you@awesome.com"
                                className="pl-10 h-12 text-base"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="categories"
                      render={() => (
                        <FormItem>
                          <div className="mb-4">
                              <FormLabel>I'm interested in...</FormLabel>
                              <FormDescription>
                                  Select topics to personalize your updates. Leave blank for all.
                              </FormDescription>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                              {eventCategories.map((item) => (
                                  <FormField
                                  key={item}
                                  control={form.control}
                                  name="categories"
                                  render={({ field }) => {
                                      return (
                                      <FormItem
                                          key={item}
                                          className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 hover:bg-secondary/50 transition-colors"
                                      >
                                          <FormControl>
                                          <Checkbox
                                              checked={field.value?.includes(item)}
                                              onCheckedChange={(checked) => {
                                              return checked
                                                  ? field.onChange([...(field.value || []), item])
                                                  : field.onChange(
                                                      field.value?.filter(
                                                      (value) => value !== item
                                                      )
                                                  );
                                              }}
                                          />
                                          </FormControl>
                                          <FormLabel className="font-normal">{item}</FormLabel>
                                      </FormItem>
                                      );
                                  }}
                                  />
                              ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" size="lg" className="w-full font-bold text-lg">
                      <Bell className="mr-2 h-5 w-5" />
                      Subscribe to Weekly Digest
                    </Button>
                  </form>
                </Form>
            </Card>

          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

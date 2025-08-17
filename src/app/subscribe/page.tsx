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
import { Card } from '@/components/ui/card';
import { Bell, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
    { text: "Get weekly updates about tech events in Mumbai" },
    { text: "Customized notifications based on your interests" },
    { text: "No account creation or login required" },
    { text: "Unsubscribe anytime with a single click" }
]

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
      description: 'You will now receive updates for the selected categories.',
    });
    form.reset();
  }

  return (
    <div className="flex flex-col min-h-screen bg-secondary/50">
      <Header />
      <main className="flex-1 mt-16">
        <div className="container py-12 md:py-20">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
                <h1 className="text-3xl md:text-4xl font-bold font-headline">
                Subscribe to Event Updates
                </h1>
                <p className="text-muted-foreground mt-2">
                Get notified about the latest tech events in Mumbai. No spam,
                unsubscribe anytime.
                </p>
            </div>
            
            <Card className="p-6 md:p-8">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="Your email address"
                            {...field}
                          />
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
                            <FormLabel>Event Categories (Optional)</FormLabel>
                            <FormDescription>
                                Select the categories you're interested in. Leave all
                                unchecked to receive updates for all categories.
                            </FormDescription>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {eventCategories.map((item) => (
                                <FormField
                                key={item}
                                control={form.control}
                                name="categories"
                                render={({ field }) => {
                                    return (
                                    <FormItem
                                        key={item}
                                        className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"
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

                  <Button type="submit" size="lg" className="w-full">
                    <Bell className="mr-2 h-5 w-5" />
                    Subscribe Now
                  </Button>
                </form>
              </Form>
            </Card>

            <Card className="mt-8 p-6 md:p-8">
                 <h2 className="text-xl font-bold font-headline mb-4">Why Subscribe?</h2>
                 <ul className="space-y-3">
                    {whySubscribeItems.map((item, index) => (
                        <li key={index} className="flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            <span className="text-muted-foreground">{item.text}</span>
                        </li>
                    ))}
                 </ul>
            </Card>

          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
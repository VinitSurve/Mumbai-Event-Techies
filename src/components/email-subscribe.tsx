'use client'

import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight } from "lucide-react";

export function EmailSubscribe() {
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email');
    
    // In a real app, you would send this to your backend.
    console.log('Subscribing with email:', email);

    toast({
      title: "Subscribed!",
      description: "Thanks for subscribing to our weekly digest.",
    });

    e.currentTarget.reset();
  };

  return (
    <div className="w-full">
      <h3 className="font-headline text-lg font-bold">Stay Updated</h3>
      <p className="text-muted-foreground mb-4 text-sm">
        Get a weekly digest of the best tech events in Mumbai.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
        <Input 
          type="email" 
          name="email" 
          placeholder="your@email.com" 
          required 
          className="flex-grow"
          aria-label="Email for subscription"
        />
        <Button type="submit" variant="default" className="w-full sm:w-auto">
          <span>Subscribe</span>
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}

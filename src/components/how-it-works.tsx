import { UploadCloud, Users, Wand2 } from 'lucide-react';
import { Card } from './ui/card';

const steps = [
  {
    title: 'Submit Event Query',
    description: 'Admins submit a URL from platforms like Meetup, Luma, etc.',
    icon: UploadCloud,
  },
  {
    title: 'Community-Wise',
    description: 'Our AI engine extracts, categorizes and enhances event details.',
    icon: Users,
  },
  {
    title: 'Magically!',
    description: 'The event is now live for the entire Mumbai tech community!',
    icon: Wand2,
  },
];

export function HowItWorks() {
  return (
    <section className="py-12 md:py-24 bg-secondary/50">
      <div className="container">
        <h2 className="text-2xl md:text-3xl font-bold font-headline text-center mb-12">How It Works</h2>
        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="absolute top-1/2 left-0 w-full h-px bg-border -translate-y-1/2 -z-10 hidden md:block" />
            <div className="absolute top-0 left-1/2 w-px h-full bg-border -translate-x-1/2 -z-10 md:hidden" />
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center text-center">
                 <div className="bg-primary/10 text-primary p-4 rounded-full mb-4 relative z-10 bg-background border-4 border-secondary/50">
                    <step.icon className="w-8 h-8" />
                </div>
              <h3 className="text-lg font-bold font-headline mb-2">{step.title}</h3>
              <p className="text-muted-foreground text-sm max-w-xs">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

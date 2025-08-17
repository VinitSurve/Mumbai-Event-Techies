import { Mic2, Code, Presentation, Bot, Users } from 'lucide-react';
import { Card } from './ui/card';
import { cn } from '@/lib/utils';

const categories = [
  { name: 'Tech Talks', description: 'Listen to experts share their knowledge.', icon: Mic2, color: 'blue' },
  { name: 'Workshops', description: 'Hands-on sessions to build your skills.', icon: Code, color: 'green' },
  { name: 'Conferences', description: 'Multi-day events with multiple tracks.', icon: Presentation, color: 'purple' },
  { name: 'Meetups', description: 'Casual get-togethers for networking.', icon: Users, color: 'yellow' },
  { name: 'Hackathons', description: 'Intense coding competitions.', icon: Bot, color: 'red' },
];

const colors = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    purple: "bg-purple-100 text-purple-600",
    yellow: "bg-yellow-100 text-yellow-600",
    red: "bg-red-100 text-red-600",
}

export function EventCategories() {
  return (
    <section className="py-12 md:py-24 bg-background">
      <div className="container">
        <h2 className="text-2xl md:text-3xl font-bold font-headline text-center mb-8">Event Categories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category) => (
            <Card key={category.name} className="p-6 flex items-start space-x-6 hover:shadow-lg transition-shadow rounded-2xl">
              <div className={cn("p-3 rounded-full", colors[category.color as keyof typeof colors])}>
                <category.icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold font-headline mb-1">{category.name}</h3>
                <p className="text-muted-foreground text-sm">{category.description}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

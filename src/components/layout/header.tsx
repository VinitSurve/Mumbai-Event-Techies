import { Logo } from '@/components/logo';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { ThemeToggle } from '../theme-toggle';
import { Button } from '../ui/button';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Logo />
        <div className="hidden md:flex items-center gap-6 ml-10">
            <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Events</a>
            <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Calendar</a>
            <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">About</a>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search events..."
              className="pl-10"
              aria-label="Search events"
            />
          </div>
          <ThemeToggle />
          <Button variant="outline">Submit Event</Button>
        </div>
      </div>
    </header>
  );
}

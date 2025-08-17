
import { Logo } from '@/components/logo';
import { Button } from '../ui/button';
import { Menu, Search } from 'lucide-react';
import { ThemeToggle } from '../theme-toggle';
import { Input } from '../ui/input';
import Link from 'next/link';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Logo />
        <nav className="hidden md:flex items-center gap-6 text-sm">
            <Link href="/" className="font-medium text-foreground/60 transition-colors hover:text-foreground/80">Home</Link>
            <Link href="/events" className="font-medium text-foreground/60 transition-colors hover:text-foreground/80">Events</Link>
            <Link href="/calendar" className="font-medium text-foreground/60 transition-colors hover:text-foreground/80">Calendar</Link>
            <a href="#" className="font-medium text-foreground/60 transition-colors hover:text-foreground/80">About</a>
            <a href="#" className="font-medium text-foreground/60 transition-colors hover:text-foreground/80">Subscribe</a>
        </nav>
        <div className="flex items-center gap-4">
           <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              type="search" 
              placeholder="Search events..."
              className="w-full rounded-md h-9 pl-9"
            />
          </div>
          <ThemeToggle />
          <Button variant="ghost" size="icon" className="md:hidden">
              <Menu />
          </Button>
        </div>
      </div>
    </header>
  );
}

import { Logo } from '@/components/logo';
import { Button } from '../ui/button';
import { Menu } from 'lucide-react';

export function Header() {
  return (
    <header className="absolute top-0 z-50 w-full">
      <div className="container flex h-20 items-center justify-between text-white">
        <Logo />
        <div className="hidden md:flex items-center gap-8">
            <a href="#" className="text-sm font-medium hover:text-primary transition-colors">Events</a>
            <a href="#" className="text-sm font-medium hover:text-primary transition-colors">Categories</a>
            <a href="#" className="text-sm font-medium hover:text-primary transition-colors">About</a>
        </div>
        <Button variant="ghost" size="icon" className="md:hidden">
            <Menu />
        </Button>
      </div>
    </header>
  );
}

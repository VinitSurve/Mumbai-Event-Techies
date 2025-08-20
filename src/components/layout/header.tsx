
import { Logo } from '@/components/logo';
import { Button } from '../ui/button';
import { Menu, PlusCircle } from 'lucide-react';
import { ThemeToggle } from '../theme-toggle';
import Link from 'next/link';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from '../ui/sheet';

const navLinks = [
    { href: "/", label: "Home" },
    { href: "/events", label: "Events" },
    { href: "/calendar", label: "Calendar" },
    { href: "/notifications", label: "Notifications" },
    { href: "/about", label: "About" },
    { href: "/subscribe", label: "Subscribe" },
]

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-4">
            <Logo />
        </div>
        <nav className="hidden md:flex items-center gap-6 text-sm">
            {navLinks.map(link => (
                <Link key={link.href} href={link.href} className="font-medium text-foreground/60 transition-colors hover:text-foreground/80">{link.label}</Link>
            ))}
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu />
                    <span className="sr-only">Open menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="right">
                <SheetHeader className="border-b pb-4 mb-4">
                    <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                    <Logo />
                </SheetHeader>
                <div className="flex flex-col gap-4">
                     {navLinks.map(link => (
                        <SheetClose asChild key={link.href}>
                            <Link href={link.href} className="font-medium text-lg text-foreground/80 transition-colors hover:text-foreground">
                                {link.label}
                            </Link>
                        </SheetClose>
                    ))}
                </div>
            </SheetContent>
           </Sheet>
        </div>
      </div>
    </header>
  );
}

import { Layers } from 'lucide-react';
import Link from 'next/link';

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label="Back to homepage">
      <div className="bg-primary text-primary-foreground p-2 rounded-lg">
        <Layers className="h-6 w-6" />
      </div>
      <span className="hidden sm:inline-block font-headline text-xl font-bold text-foreground">
        मुंबई Event Techies
      </span>
    </Link>
  );
}

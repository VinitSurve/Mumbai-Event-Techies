import { Layers } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label="Back to homepage">
      <span className={cn("font-headline text-xl font-bold", light ? "text-white" : "text-foreground")}>
        मुंबई Event Techies
      </span>
    </Link>
  );
}
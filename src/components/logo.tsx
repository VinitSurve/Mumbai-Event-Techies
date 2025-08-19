import Image from 'next/image';
import Link from 'next/link';

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label="Back to homepage">
       <Image
        src="https://i.postimg.cc/028Qvcsb/Logo.jpg"
        alt="Mumbai Event Techies Logo"
        width={40}
        height={40}
        className="rounded-full"
        priority
      />
      <span className="font-headline text-xl font-bold hidden sm:inline-block">
        Mumbai Event Techies
      </span>
    </Link>
  );
}

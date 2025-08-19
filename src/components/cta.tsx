import { Button } from "./ui/button";
import Link from "next/link";

export function Cta() {
  return (
    <section className="bg-primary text-primary-foreground">
      <div className="container py-16 text-center">
        <h2 className="text-3xl md:text-4xl font-bold font-headline mb-4">Never Miss a Tech Event in Mumbai</h2>
        <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto mb-8">
          Subscribe to our weekly newsletter and get the latest event updates, highlights, and special announcements.
        </p>
        <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold">
          <Link href="/subscribe">
            Subscribe
          </Link>
        </Button>
      </div>
    </section>
  );
}

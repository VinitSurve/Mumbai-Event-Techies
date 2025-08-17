import { EmailSubscribe } from "@/components/email-subscribe";
import { Logo } from "@/components/logo";

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
             <div className="mb-4">
               <Logo />
            </div>
            <p className="text-sm text-muted-foreground">
              The central hub for tech events in Mumbai, curated from the community.
            </p>
          </div>
          <div className="md:col-span-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div>
                    <h3 className="font-headline font-bold mb-4">Navigate</h3>
                    <ul className="space-y-2 text-sm">
                        <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Home</a></li>
                        <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">About</a></li>
                        <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">RSS Feed</a></li>
                    </ul>
                </div>
                <div>
                    <EmailSubscribe />
                </div>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground flex justify-between">
          <p>&copy; {new Date().getFullYear()} Mumbai Event Echo. All rights reserved.</p>
          <p>Admin: Aman & Riya</p>
        </div>
      </div>
    </footer>
  );
}

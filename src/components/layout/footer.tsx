import { Logo } from "@/components/logo";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Github, Twitter, Linkedin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
             <div className="mb-4">
               <Logo light />
            </div>
            <p className="text-sm">
              The central hub for tech events in Mumbai, curated from the community.
            </p>
            <div className="flex space-x-4 mt-4">
              <a href="#" className="hover:text-primary"><Github size={20}/></a>
              <a href="#" className="hover:text-primary"><Twitter size={20}/></a>
              <a href="#" className="hover:text-primary"><Linkedin size={20}/></a>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 col-span-1 md:col-span-3 gap-8">
            <div>
              <h3 className="font-bold text-white mb-4">Navigate</h3>
              <ul className="space-y-2 text-sm">
                  <li><a href="#" className="hover:text-primary transition-colors">Home</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Events</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Categories</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">About</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Submit Event</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-white mb-4">Categories</h3>
              <ul className="space-y-2 text-sm">
                  <li><a href="#" className="hover:text-primary transition-colors">Tech Talks</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Workshops</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Meetups</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Conferences</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Hackathons</a></li>
              </ul>
            </div>
            <div>
                <h3 className="font-bold text-white mb-4">Stay Updated</h3>
                <p className="text-sm mb-4">Get a weekly digest of the best tech events.</p>
                <form className="flex">
                  <Input type="email" placeholder="Your email" className="bg-gray-800 border-gray-700 rounded-r-none" />
                  <Button type="submit" variant="default" className="rounded-l-none">Subscribe</Button>
                </form>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm flex justify-between">
          <p>&copy; {new Date().getFullYear()} मुंबई Event Techies. All rights reserved.</p>
          <p>Admin: Aman & Riya</p>
        </div>
      </div>
    </footer>
  );
}

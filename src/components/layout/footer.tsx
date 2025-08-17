import { Logo } from "@/components/logo";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Github, Twitter, Linkedin, Mail, Phone, MapPin } from "lucide-react";
import Link from 'next/link';

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
              Connecting the Mumbai tech community through automated WhatsApp event updates.
            </p>
            <div className="flex space-x-4 mt-4">
              <a href="#" className="hover:text-primary"><Github size={20}/></a>
              <a href="#" className="hover:text-primary"><Twitter size={20}/></a>
              <a href="#" className="hover:text-primary"><Linkedin size={20}/></a>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 col-span-1 md:col-span-3 gap-8">
            <div>
              <h3 className="font-bold text-white mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                  <li><Link href="/" className="hover:text-primary transition-colors">Home</Link></li>
                  <li><Link href="/events" className="hover:text-primary transition-colors">Events</Link></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Calendar</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">About</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Subscribe</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-white mb-4">Event Categories</h3>
              <ul className="space-y-2 text-sm">
                  <li><a href="#" className="hover:text-primary transition-colors">Tech Talks</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Workshops</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Meetups</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Conferences</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Hackathons</a></li>
              </ul>
            </div>
            <div>
                <h3 className="font-bold text-white mb-4">Contact Us</h3>
                 <ul className="space-y-2 text-sm">
                  <li className="flex items-center"><Mail size={16} className="mr-2"/> contact@mumbaieventechies.com</li>
                  <li className="flex items-center"><Phone size={16} className="mr-2"/> +91 98XXX XXXXX</li>
                  <li className="flex items-center"><MapPin size={16} className="mr-2"/> Mumbai, India</li>
                </ul>
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
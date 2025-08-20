// src/components/submit-event/platform-icons.tsx
import { Globe, VenetianMask } from 'lucide-react';
import React from 'react';

// A more scalable way to handle icons
const SvgIcon = ({ d, color = 'currentColor' }: { d: string; color?: string }) => (
  <svg viewBox="0 0 24 24" className="w-full h-full" fill={color}>
    <path d={d} />
  </svg>
);

export const platformIcons: { [key: string]: React.ReactNode } = {
  meetup: <SvgIcon d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 22C6.486 22 2 17.514 2 12S6.486 2 12 2s10 4.486 10 10-4.486 10-10 10zm-1.5-6.5h3v-7h-3v7zm0-8.5h3v-2h-3v2z" color="#e51937" />,
  eventbrite: <SvgIcon d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-2-9h4v2h-4v-2zm0 4h4v2h-4v-2z" color="#f05537"/>,
  luma: <SvgIcon d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 18a8 8 0 110-16 8 8 0 010 16zm-1-3.5h2V8h-2v8.5z" color="#3b82f6" />,
  facebook: <SvgIcon d="M13.397 20.997v-8.196h2.765l.411-3.209h-3.176V7.548c0-.926.258-1.56 1.587-1.56h1.684V3.127A22.336 22.336 0 0017.063 3c-2.445 0-4.122 1.492-4.122 4.23v2.355H9.332v3.21h3.456v8.196h3.609z" color="#1877f2" />,
  gdg: <Globe className="text-blue-500" />,
  generic: <Globe className="text-slate-400" />,
};

export const detectPlatform = (url: string): string => {
    if (url.includes('meetup.com')) return 'meetup';
    if (url.includes('eventbrite.')) return 'eventbrite';
    if (url.includes('lu.ma') || url.includes('luma.so')) return 'luma';
    if (url.includes('facebook.com')) return 'facebook';
    if (url.includes('gdg.community.dev')) return 'gdg';
    return 'generic';
}

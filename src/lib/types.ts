
export type Event = {
  id: string;
  slug: string; // URL-friendly: "react-meetup-mumbai-oct-2025"

  // Event details
  title: string;
  description: string;
  event_date: string; // ISO string
  eventTime?: string;
  location: string;
  organizer?: string;
  image_url?: string | null;
  price?: string;
  category: 'Tech Talk' | 'Workshop' | 'Conference' | 'Meetup' | 'Hackathon';
  tags?: string[];
  platform?: string; // "Meetup", "Eventbrite", etc.
  registrationUrl?: string; // original URL

  // Meta fields
  isApproved: boolean; // always true for auto-publish
  createdAt: string; // ISO string
  submittedAt: string; // ISO string
  submitterEmail?: string;
  originalUrl: string; // original submitted URL

  // Analytics
  viewCount?: number;
  clickCount?: number;
  status?: 'upcoming' | 'ongoing' | 'completed';
};

export const eventCategories: Event['category'][] = ['Tech Talk', 'Workshop', 'Conference', 'Meetup', 'Hackathon'];

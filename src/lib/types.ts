export type Event = {
  id: string;
  title: string;
  description: string | null;
  event_date: string; // ISO string
  location: string | null;
  category: 'Tech Talk' | 'Workshop' | 'Conference' | 'Meetup' | 'Hackathon';
  urls: string[] | null;
  image_url: string | null;
  status: 'upcoming' | 'ongoing' | 'completed';
  slug?: string; // URL-friendly slug
  organizer?: string;
  price?: string;
  tags?: string[];
  platform?: string;
  registrationUrl?: string;
  isApproved?: boolean;
  createdAt?: string; // ISO string
  approvedAt?: string; // ISO string
  sourceRequestId?: string;
  viewCount?: number;
  clickCount?: number;
  originalUrl?: string;
  submittedAt?: string; // ISO string
};

export const eventCategories: Event['category'][] = ['Tech Talk', 'Workshop', 'Conference', 'Meetup', 'Hackathon'];

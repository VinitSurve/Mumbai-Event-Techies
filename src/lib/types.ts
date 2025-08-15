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
};

export const eventCategories: Event['category'][] = ['Tech Talk', 'Workshop', 'Conference', 'Meetup', 'Hackathon'];

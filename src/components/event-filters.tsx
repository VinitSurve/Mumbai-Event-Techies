// src/components/event-filters.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const categories = ["All Events", "Tech Talks", "Workshops", "Conferences", "Meetups", "Hackathons"];
const dates = ["All Dates", "Today", "Tomorrow", "This Week", "This Month"];

export function EventFilters() {
  return (
    <div className="space-y-6 sticky top-24">
       <Card>
        <CardHeader>
          <CardTitle className="text-lg font-headline">Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {categories.map((category, index) => (
              <li key={category}>
                <Button 
                    variant={index === 0 ? "default" : "ghost"} 
                    className="w-full justify-start"
                >
                    {category}
                </Button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
       <Card>
        <CardHeader>
          <CardTitle className="text-lg font-headline">Date</CardTitle>
        </CardHeader>
        <CardContent>
           <ul className="space-y-2">
            {dates.map((date, index) => (
              <li key={date}>
                <Button 
                    variant={index === 0 ? "default" : "ghost"} 
                    className="w-full justify-start"
                >
                    {date}
                </Button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
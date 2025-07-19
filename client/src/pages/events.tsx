import { useQuery } from "@tanstack/react-query";
import { Event } from "@shared/schema";
import EventCard from "@/components/events/event-card";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export default function EventsPage() {
  const [location, setLocation] = useState("");
  const [date, setDate] = useState<Date>();

  const { data: events, isLoading } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  const filteredEvents = events?.filter((event) => {
    const matchesLocation = location
      ? event.location.toLowerCase().includes(location.toLowerCase())
      : true;

    const matchesDate = date
      ? new Date(event.startDate) <= date && new Date(event.endDate) >= date
      : true;

    return matchesLocation && matchesDate;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-32">
      <div className="mb-16 flex flex-wrap gap-4 justify-center">
        <Input
          placeholder="Filter by location..."
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="max-w-xs rounded-[15px] bg-white"
        />
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-[240px] rounded-[15px] bg-teal-500 text-white">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        {(location || date) && (
          <Button variant="ghost" className="bg-teal-500 text-white py-2 px-6 rounded-[50px] transition duration-300 max-w-full w-fit" onClick={() => {
            setLocation("");
            setDate(undefined);
          }}>
            Clear filters
          </Button>
        )}
      </div>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredEvents?.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
}
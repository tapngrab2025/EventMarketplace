import { useQuery } from "@tanstack/react-query";
import { Event } from "@shared/schema";
import EventCard from "@/components/events/event-card";
import { Loader2, MapPin } from "lucide-react";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

export default function EventsPage() {
  const [location, setLocation] = useState("");
  const [date, setDate] = useState<Date>();
  const [animateItems, setAnimateItems] = useState(false);

  useEffect(() => {
    // Trigger animations after component mounts
    setAnimateItems(true);
  }, []);

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
        <Loader2 className="h-12 w-12 animate-spin text-primaryGreen" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-teal-50 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-64 bg-teal-500 opacity-10 rounded-b-[50%] transform -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-primaryOrange opacity-5 rounded-full transform translate-x-1/3 translate-y-1/3"></div>
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-teal-300 opacity-5 rounded-full"></div>
      
      <div className="container mx-auto px-4 py-32 relative z-10">
        <div className={`text-center mb-12 transition-all duration-700 ${animateItems ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}>
          <h1 className="text-4xl md:text-5xl font-bold text-primaryGreen mb-4">Discover Amazing Events</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">Find the perfect events that match your interests and schedule</p>
        </div>

        <div className={`mb-16 flex flex-wrap gap-4 justify-center items-center bg-white p-6 rounded-xl shadow-lg transition-all duration-700 delay-100 ${animateItems ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="relative flex-grow max-w-xs">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              placeholder="Filter by location..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="pl-10 rounded-[15px] bg-white border-teal-200 focus:border-primaryGreen transition-all duration-300"
            />
          </div>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                className="w-[240px] rounded-[15px] bg-teal-500 text-white hover:bg-primaryOrange hover:text-white transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 rounded-xl shadow-xl border-teal-200" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
                className="rounded-xl"
              />
            </PopoverContent>
          </Popover>

          {(location || date) && (
            <Button 
              variant="ghost" 
              className="bg-teal-500 text-white py-2 px-6 rounded-[50px] transition-all duration-300 hover:bg-primaryOrange hover:scale-105 shadow-md" 
              onClick={() => {
                setLocation("");
                setDate(undefined);
              }}
            >
              Clear filters
            </Button>
          )}
        </div>

        {filteredEvents?.length === 0 ? (
          <div className={`text-center py-16 transition-all duration-500 ${animateItems ? 'opacity-100' : 'opacity-0'}`}>
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-semibold text-gray-700 mb-2">No events found</h3>
            <p className="text-gray-500">Try adjusting your filters to find more events</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredEvents?.map((event, index) => (
              <div 
                key={event.id} 
                className={`transform transition-all duration-500 hover:shadow-xl hover:-translate-y-2 ${animateItems ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                style={{ transitionDelay: `${index * 50}ms` }}
              >
                <EventCard event={event} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
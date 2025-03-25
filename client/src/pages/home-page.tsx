import { useQuery } from "@tanstack/react-query";
import { Product, Event } from "@shared/schema";
import { useState } from "react";
import ProductCard from "@/components/products/product-card";
import EventCard from "@/components/events/event-card";
import { Loader2, CalendarRange, MapPin } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";

interface VendorDashboardProps {
  searchTerm?: string;
}

export default function HomePage(
  { searchTerm = "" }:VendorDashboardProps
) {
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [sortBy, setSortBy] = useState("newest");

  const { data: products, isLoading: loadingProducts } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: events, isLoading: loadingEvents } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  const filteredProducts = products?.filter(
    (product) =>
      product.approved &&
      (product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // const filteredEvents = events?.filter(
  //   (event) =>
  //     event.approved &&
  //     (event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //       event.description.toLowerCase().includes(searchTerm.toLowerCase()))
  // );
  const filteredEvents = events?.filter((event) => {
    const matchesSearch = event.approved &&
      (event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesLocation = !location || 
      event.location.toLowerCase().includes(location.toLowerCase());

    const matchesDateRange = (!startDate || new Date(event.startDate) >= startDate) &&
      (!endDate || new Date(event.endDate) <= endDate);

    return matchesSearch && matchesLocation && matchesDateRange;
  }).sort((a, b) => {
    if (sortBy === "newest") return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
    if (sortBy === "oldest") return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    return 0;
  });

  if (loadingProducts || loadingEvents) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">
            Your One-Stop Event Marketplace
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover unique souvenirs, promotional items, and giveaways for your next event.
            Connect with vendors and event organizers all in one place.
          </p>
        </section>

        <section className="mb-12">
        <div className="flex flex-wrap gap-4 mb-6">
            <Input
              placeholder="Filter by location..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="max-w-xs"
              icon={<MapPin className="h-4 w-4" />}
            />

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-[240px]">
                  <CalendarRange className="mr-2 h-4 w-4" />
                  {startDate && endDate ? (
                    `${format(startDate, "PP")} - ${format(endDate, "PP")}`
                  ) : (
                    "Select date range"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={{
                    from: startDate,
                    to: endDate,
                  }}
                  onSelect={(range) => {
                    setStartDate(range?.from);
                    setEndDate(range?.to);
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
              </SelectContent>
            </Select>

            {(location || startDate || endDate) && (
              <Button
                variant="ghost"
                onClick={() => {
                  setLocation("");
                  setStartDate(undefined);
                  setEndDate(undefined);
                  setSortBy("newest");
                }}
              >
                Clear filters
              </Button>
            )}
          </div>
          <h2 className="text-2xl font-semibold mb-6">Upcoming Events</h2>
          {filteredEvents?.length === 0 ? (
            <p className="text-muted-foreground">No events found</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents?.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-6">Featured Products</h2>
          {filteredProducts?.length === 0 ? (
            <p className="text-muted-foreground">No products found</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProducts?.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
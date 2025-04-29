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
  { searchTerm = "" }: VendorDashboardProps
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
    <main className="py-8 min-h-screen">
      <section className="text-center mb-16 px-4">
        <div className="container mx-auto">
          <h1 className="text-4xl font-bold mb-4">
            Your One-Stop Event Marketplace
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover unique souvenirs, promotional items, and giveaways for your next event.
            Connect with vendors and event organizers all in one place.
          </p>
        </div>
      </section>
      <section className="flex flex-col items-center justify-center bg-gradient-to-r from-pink-200 via-purple-200 to-blue-200 p-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Let's Find Your Grab</h1>
          <p className="text-gray-600">Discover your favorite entertainment right here</p>
        </div>

        <div className="w-full max-w-4xl flex flex-col sm:flex-row gap-4 mb-12">
          <div className="flex-1">
            <div className="relative bg-white rounded-lg w-full">
              <Input
                placeholder="Filter by Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full pl-12 rounded-lg border-none bg-white"
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 bg-white flex items-center justify-center">
                <MapPin className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>
          <div className="flex flex-1">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full bg-white rounded-lg border-none">
                  <CalendarRange className="mr-2 h-4 w-4 text-gray-400" />
                  {startDate && endDate ? (
                    `${format(startDate, "PP")} - ${format(endDate, "PP")}`
                  ) : (
                    "Select Date Range"
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
          </div>
          <div className="flex-1">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="bg-white rounded-lg border-none">
                <SelectValue placeholder="Newest First" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(location || startDate || endDate) && (
            <div className="flex-1">
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
            </div>
          )}
          {/* <button
            className="w-full sm:w-auto bg-blue-500 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-600 transition duration-300"
          >
            Search
          </button> */}

        </div>

        <div className="w-full max-w-4xl">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Popular Cities</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="relative rounded-lg overflow-hidden shadow-lg">
              <img
                src="https://placehold.co/300x200"
                alt="Kandy"
                className="w-full h-48 object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                <h3 className="text-white text-2xl font-bold">KANDY</h3>
              </div>
            </div>

            <div className="relative rounded-lg overflow-hidden shadow-lg">
              <img
                src="https://placehold.co/300x200"
                alt="Colombo"
                className="w-full h-48 object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                <h3 className="text-white text-2xl font-bold">COLOMBO</h3>
              </div>
            </div>


            <div className="relative rounded-lg overflow-hidden shadow-lg">
              <img
                src="https://placehold.co/300x200"
                alt="Galle"
                className="w-full h-48 object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                <h3 className="text-white text-2xl font-bold">GALLE</h3>
              </div>
            </div>


            <div className="relative rounded-lg overflow-hidden shadow-lg">
              <img
                src="https://placehold.co/300x200"
                alt="Matara"
                className="w-full h-48 object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                <h3 className="text-white text-2xl font-bold">MATARA</h3>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-12 px-4">
        <div className="container mx-auto">
          {/* <div className="flex flex-wrap gap-4 mb-6">
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
          </div> */}
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
        </div>
      </section>

      <section className="">
        <div className="container mx-auto">
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
        </div>
      </section>
    </main>
  );
}
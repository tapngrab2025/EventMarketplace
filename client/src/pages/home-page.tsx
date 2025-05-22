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
import { Link } from "wouter";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import { Images } from "@/config/images";

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

  const testimonials = [
    {
      text: "Lorem ipsum is simply dummy text of the printing and typesetting industry. Lorem ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
      author: "Noa Woolloff",
      image: "https://placehold.co/200x200"
    },
    {
      text: "Another testimonial about the amazing service. It has been a great experience using this platform.",
      author: "John Doe",
      image: "https://placehold.co/200x200"
    }
  ];

  const { data: products, isLoading: loadingProducts } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: events, isLoading: loadingEvents } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  const filteredProducts = products
    ?.filter((product) =>
      product.approved &&
      (product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => b.id - a.id) // Sort by newest first
    .slice(0, 8);

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
                src={Images.kandy}
                alt="Kandy"
                className="w-full h-48 object-cover"
              />
              <div className="absolute inset-0 bg-opacity-0 flex items-center justify-center">
                <h3 className="text-white text-2xl font-bold">KANDY</h3>
              </div>
            </div>

            <div className="relative rounded-lg overflow-hidden shadow-lg">
              <img
                src={Images.colombo}
                alt="Colombo"
                className="w-full h-48 object-cover"
              />
              <div className="absolute inset-0 bg-opacity-0 flex items-center justify-center">
                <h3 className="text-white text-2xl font-bold">COLOMBO</h3>
              </div>
            </div>


            <div className="relative rounded-lg overflow-hidden shadow-lg">
              <img
                src={Images.galle}
                alt="Galle"
                className="w-full h-48 object-cover"
              />
              <div className="absolute inset-0 bg-opacity-0 flex items-center justify-center">
                <h3 className="text-white text-2xl font-bold">GALLE</h3>
              </div>
            </div>


            <div className="relative rounded-lg overflow-hidden shadow-lg">
              <img
                src={Images.matara}
                alt="Matara"
                className="w-full h-48 object-cover"
              />
              <div className="absolute inset-0 bg-opacity-0 flex items-center justify-center">
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

      {/* Featured Grabs */}
      <section className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-pink-200 via-purple-200 to-blue-200 p-6">
        <div className="">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Featured Grabs</h1>
            <p className="text-gray-600">Discover more of the activities with our curated event collections</p>
          </div>
        
          <div className="w-full max-w-7xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

                  {filteredProducts?.length === 0 ? (
                  <p className="text-muted-foreground">No products found</p>
                ) : (
                  <>
                    {filteredProducts?.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </>
                )}

            </div>
          </div>
        
          <div className="mt-8 flex justify-center">
          <Link href="/products" className="text-blue-500 font-semibold hover:underline">
              View All Grabs
            </Link>
          </div>
        </div>
      </section>

      <section className="relative bg-cover bg-center text-white min-h-[700px] md:min-h-[500px] overflow-visible" style={{ backgroundImage: `url(${Images.transferBg.src || Images.transferBg})` }}>
        <div className="container mx-auto flex flex-wrap items-center justify-between px-6 gap-8 flex-col lg:flex-row min-h-[600px] md:min-h-[400px] max-w-7xl">
          <div className="max-w-md z-10">
            <h2 className="text-4xl font-bold mb-4">Transfer Your Grabs</h2>
            <p className="text-lg mb-6">Get registered with tapNgrab to transfer and receive E-Ticket(s). Spread the joy by seamlessly transferring tickets to friends and family.</p>
            <Link href="/auth" className="bg-[#F58020] text-white font-medium px-6 py-2 rounded-full hover:bg-orange-600 transition">
            Register
            </Link>
          </div>
          <div className="flex items-center z-10">
            <img src={Images.transferGrabsImg} alt="Transfer Grabs" className="max-w-[400px] w-full"/>
          </div>
        </div>
      </section>

      <section className="relative bg-cover bg-center text-white py-12  min-h-[700px] md:min-h-[500px] overflow-visible" style={{ backgroundImage: `url(${Images.whatMakesImg.src || Images.whatMakesImg})` }}>
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-4">What Makes Us Uncommon</h2>
          <p className="text-lg mb-12">Lorem ipsum is simply dummy text of the printing and typesetting industry.</p>
          <div className="flex justify-center gap-12 lg:gap-[300px] flex-col lg:flex-row">
            <div className="flex flex-col items-center">
              <img src={Images.trustFundTransfer} alt="Trust Fund Transfer Icon" className="mb-4 max-w-135"/>
              <p className="text-lg font-semibold">Trust Fund Transfer</p>
            </div>
            <div className="flex flex-col items-center">
              <img src={Images.moneySaver} alt="Money Saver Icon" className="mb-4 max-w-135"/>
              <p className="text-lg font-semibold">Money Saver</p>
            </div>
            <div className="flex flex-col items-center">
              <img src={Images.userFriendly} alt="User Friendly Icon" className="mb-4 max-w-135"/>
              <p className="text-lg font-semibold">User Friendly</p>
            </div>
          </div>
        </div>
      </section>


      {/* <section className="py-12 testimonial">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-4">What People Say</h2>
          <p className="text-lg mb-12">Lorem Ipsum is simply dummy text of the printing and typesetting industry.</p>
          <div className="carousel max-w-7xl">
            <div className="carousel-slide active">
              <div className="quote-bg mr-6">
                <p className="text-lg mb-4 line-clamp-5 md:line-clamp-none">Lorem ipsum is simply dummy text of the printing and typesetting industry. Lorem ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.</p>
                <p className="font-semibold">- Noa Woolloff</p>
              </div>
              <img src="https://placehold.co/200x200" alt="Person Placeholder" className="rounded-full" />
            </div>
            <div className="carousel-slide">
              <div className="quote-bg mr-6">
                <p className="text-lg mb-4 line-clamp-5 md:line-clamp-none">Another testimonial about the amazing service. It has been a great experience using this platform.</p>
                <p className="font-semibold">- John Doe</p>
              </div>
              <img src="https://placehold.co/200x200" alt="Person Placeholder" className="rounded-full" />
            </div>
          </div>
        </div>
      </section> */}

      <section className="py-12 testimonial">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-4">What People Say</h2>
          <p className="text-lg mb-12">Lorem Ipsum is simply dummy text of the printing and typesetting industry.</p>
          <Slider
            dots={true}
            infinite={true}
            speed={500}
            slidesToShow={1}
            slidesToScroll={1}
            autoplay={true}
            autoplaySpeed={5000}
            className="max-w-5xl mx-auto"
          >
            {testimonials.map((testimonial, index) => (
              <div key={index} className="px-4">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="quote-bg flex-1">
                    <p className="text-lg mb-4 line-clamp-5 md:line-clamp-none text-left">{testimonial.text}</p>
                    <p className="font-semibold text-left">- {testimonial.author}</p>
                  </div>
                  <img src={testimonial.image} alt={testimonial.author} className="rounded-full w-[200px] h-[200px]" />
                </div>
              </div>
            ))}
          </Slider>
        </div>
      </section>

    </main>
  );
}
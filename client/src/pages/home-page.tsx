import { useQuery } from "@tanstack/react-query";
import { Product, Event } from "@shared/schema";
import { useEffect, useState } from "react";
import ProductCard from "@/components/products/product-card";
import SignUp from "@/components/common/signup";
import { Loader2, CalendarRange, MapPin } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { Link } from "wouter";
import Slider from "react-slick";
import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";
import { Images } from "@/config/images";
import BrandHeroCarousel from "@/components/common/BrandHeroCarousel";
import HeroCarousel from "@/components/common/HeroCarousel";

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
  const [animateItems, setAnimateItems] = useState(false);

  useEffect(() => {
    setAnimateItems(true);
  }, []);

  const testimonials = [
    {
      text: "Lorem ipsum is simply dummy text of the printing and typesetting industry. Lorem ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
      author: "Noa Woolloff",
      image: Images.avatar
    },
    {
      text: "Another testimonial about the amazing service. It has been a great experience using this platform.",
      author: "John Doe",
      image: Images.avatar
    }
  ];

  const { data: products, isLoading: loadingProducts } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  // Uncomment this query to fetch events data
  const { data: events, isLoading: loadingEvents } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

    useEffect(() => {
    initMap();
  }, [events]);

  const filteredProducts = products
    ?.filter((product) =>
      product.approved &&
      (product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => b.id - a.id) // Sort by newest first
    .slice(0, 8);

  // Update the loading check to include events
  if (loadingProducts || loadingEvents) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primaryOrange" />
      </div>
    );
  }


  // Replace the current initMap function with this implementation
  async function initMap(): Promise<void> {
    // Default center position (can be set to a central location in your target area)
    const defaultPosition = { lat: 7.8731, lng: 80.7718 }; // Center of Sri Lanka

    // Create the map centered at the default position
    const mapElement = document.getElementById('all_events') as HTMLElement;
    if (!mapElement) return;
    
    const map = new google.maps.Map(mapElement, {
      zoom: 8, // Adjust zoom level as needed
      center: defaultPosition,
      mapTypeControl: true,
      fullscreenControl: true,
      streetViewControl: false
    });

    // Check if events data is available
    if (events && events.length > 0) {
      // Create bounds to fit all markers
      const bounds = new google.maps.LatLngBounds();
      
      // Process each event to create markers
      events.forEach(event => {
        // You need to geocode the location string to get coordinates
        getCoordinatesFromAddress(event.location)
          .then(position => {
            if (position) {
              // For customization, you can set the info window options here
              // https://developers.google.com/maps/documentation/javascript/reference/info-window#InfoWindowOptions
              const infoWindow = new google.maps.InfoWindow({
                // content: `
                //   <div style="max-width: 250px; padding: 10px; background-color:#1B0164">
                //     <h3 style="margin-top: 0; color: #3D0A91;">${event.name}</h3>
                //     <p>${event.description.substring(0, 100)}${event.description.length > 100 ? '...' : ''}</p>
                //     <p><strong>Location:</strong> ${event.location}</p>
                //     <p><strong>Date:</strong> ${new Date(event.startDate).toLocaleDateString()} - ${new Date(event.endDate).toLocaleDateString()}</p>
                //     <a href="/event/${event.id}" style="color: #F58020; text-decoration: none; font-weight: bold;">View Details</a>
                //   </div>
                // `
                content: `
                <div style="min-height:50px;">
                  <h3 style="margin-top: 0; margin-bottom:10px;">${event.name}</h3>
                  <a href="/event/${event.id}" style="padding:5px;background-color: #0296A4; color: #FFFFFF; text-decoration: none; font-weight: bold;border-radius:10px;margin-bottom:10px;">View Details</a>
                </div>
              `,
              disableAutoPan: true,
              minWidth: 250,
              headerDisabled: true
              });

              const mapPin = Images.pin
              // Create the marker
              const marker = new google.maps.Marker({
                map,
                position,
                title: event.name,
                icon: {
                  url: mapPin,
                  scaledSize: new google.maps.Size(30, 30),
                },

                // icon: {
                //   path: google.maps.SymbolPath.CIRCLE,
                //   fillColor: '#1B0164',
                //   fillOpacity: 1,
                //   strokeColor: '#ffffff',
                //   strokeWeight: 2,
                //   scale: 8
                // },
                animation: google.maps.Animation.DROP
              });

              // Add click event to show info window
              marker.addListener('click', () => {
                infoWindow.open({
                  anchor: marker,
                  map,
                });
              });

              // Extend bounds to include this marker
              bounds.extend(position);
            }
          });
      });

      // Fit the map to the bounds after a short delay to ensure all geocoding is complete
      setTimeout(() => {
        if (!bounds.isEmpty()) {
          map.fitBounds(bounds);
        }
      }, 1000);
    }
  }

  // Helper function to get coordinates from address string
  // In a real implementation, you would use the Google Geocoding API
  function getCoordinatesFromAddress(address: string): Promise<google.maps.LatLngLiteral | null> {
    return new Promise((resolve) => {
      // Create a geocoder instance
      const geocoder = new google.maps.Geocoder();
      
      // Geocode the address
      geocoder.geocode({ address }, (results, status) => {
        if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
          const location = results[0].geometry.location;
          resolve({
            lat: location.lat(),
            lng: location.lng()
          });
        } else {
          console.error(`Geocoding failed for address: ${address}`, status);
          resolve(null);
        }
      });
    });
  }


  const testimonialSliderSettings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    arrows: false,
  }
  return (
    <main className="pt-8 min-h-screen">
      <section className="bg-primaryGreen -mt-8 text-white py-8 md:py-12 overflow-hidden">
        <BrandHeroCarousel />
        {/* <HeroCarousel/> */}
      </section>
      {/* Modernized: "Let's Find Your Grab" */}
      <section className="relative py-20 px-6 mb-32 overflow-hidden">
        {/* Decorative shapes */}
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-black/5 rounded-full" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-primaryOrange/10 rounded-full" />

        <div className={`text-center mb-16 transition-all duration-700 ${animateItems ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-6'}`}>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Let's Find Your Grab</h1>
          <p className="text-gray-600">Discover your favorite entertainment right here</p>
        </div>

        <div className={`w-full max-w-6xl mx-auto flex flex-col sm:flex-row gap-4 mb-12 transition-all duration-700 delay-100 ${animateItems ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <div className="flex-1">
            <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl w-full shadow-sm ring-1 ring-gray-200">
              <Input
                id="location"
                placeholder="Filter by Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full pl-12 rounded-2xl bg-transparent border-none focus-visible:ring-2 focus-visible:ring-primaryOrange"
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 flex items-center justify-center">
                <MapPin className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>
          <div className="flex flex-1">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-200 hover:border-gray-300">
                  <CalendarRange className="h-4 w-4 text-gray-400" />
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
              <SelectTrigger className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-200">
                <SelectValue placeholder="Newest First" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <button
            className="bg-primaryOrange text-white text-base py-2 px-16 rounded-full hover:bg-black transition-all duration-300 shadow-md hover:shadow-lg"
            onClick={() => {
              const searchParams = new URLSearchParams();
              if (location) searchParams.set('location', location);
              if (startDate) searchParams.set('startDate', startDate.toISOString());
              if (endDate) searchParams.set('endDate', endDate.toISOString());
              if (sortBy) searchParams.set('sortBy', sortBy);

              window.location.href = `/search?${searchParams.toString()}`;
            }}
          >
            Search
          </button>

        </div>

        <div className="w-full max-w-4xl mx-auto">
          <h2 className="text-h2 font-semibold text-gray-900 mb-6 text-center">Popular Cities</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="relative rounded-lg overflow-hidden shadow-lg">
              <Link href="/event/city/kandy">
                <img
                  src={Images.kandy}
                  alt="Kandy"
                  className="w-full h-48 object-cover transition-transform duration-500 hover:scale-105"
                />
                <div className="absolute inset-0 bg-opacity-0 flex items-center justify-center">
                  <h3 className="text-white text-2xl font-bold drop-shadow-md">KANDY</h3>
                </div>
              </Link>
            </div>

            <div className="relative rounded-lg overflow-hidden shadow-lg">
            <Link href="/event/city/colombo">
              <img
                src={Images.colombo}
                alt="Colombo"
                className="w-full h-48 object-cover transition-transform duration-500 hover:scale-105"
              />
              <div className="absolute inset-0 bg-opacity-0 flex items-center justify-center">
                <h3 className="text-white text-2xl font-bold drop-shadow-md">COLOMBO</h3>
              </div>
              </Link>
            </div>


            <div className="relative rounded-lg overflow-hidden shadow-lg">
            <Link href="/event/city/galle">
              <img
                src={Images.galle}
                alt="Galle"
                className="w-full h-48 object-cover transition-transform duration-500 hover:scale-105"
              />
              <div className="absolute inset-0 bg-opacity-0 flex items-center justify-center">
                <h3 className="text-white text-2xl font-bold drop-shadow-md">GALLE</h3>
              </div>
              </Link>
            </div>


            <div className="relative rounded-lg overflow-hidden shadow-lg">
            <Link href="/event/city/matara">
              <img
                src={Images.matara}
                alt="Matara"
                className="w-full h-48 object-cover transition-transform duration-500 hover:scale-105"
              />
              <div className="absolute inset-0 bg-opacity-0 flex items-center justify-center">
                <h3 className="text-white text-2xl font-bold drop-shadow-md">MATARA</h3>
              </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Grabs */}
      <section className="min-h-screen flex flex-col items-center justify-center p-6 mb-32 relative">
        {/* subtle accent shape */}
        <div className="absolute -top-10 left-10 w-64 h-64 bg-primaryGreen/10 rounded-full" />
        <div className="">
          <div className="text-center mb-20">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Featured Grabs</h1>
            <p className="text-gray-600">Discover more of the activities with our curated event collections</p>
          </div>

          <div className="w-full max-w-7xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

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
            <Link href="/products" className="text-primaryOrange font-semibold hover:underline">
              View All Grabs
            </Link>
          </div>
        </div>
      </section>

      {/* <section className="relative bg-cover bg-center text-white min-h-[700px] md:min-h-[500px] overflow-visible" style={{ backgroundImage: `url(${Images.transferBg.src || Images.transferBg})` }}> */}
      <section className="transferGrabs py-32 relative bg-primaryGreen bg-cover bg-center text-white min-h-[700px] md:min-h-[500px] overflow-visible my-[105px]">
        <div className="container mx-auto flex flex-wrap items-center justify-between px-6 gap-8 flex-col lg:flex-row min-h-[600px] md:min-h-[400px] max-w-7xl relative bg-no-repeat bg-right lg:bg-[image:var(--bg-image)]"
          style={{ '--bg-image': `url(${Images.transferGrabsImg})` } as React.CSSProperties}>
          <div className="lg:max-w-3xl z-10 text-center">
            <h2 className="text-h2 font-bold mb-4 md:mb-11">Transfer Your Grabs</h2>
            <p className="text-h5 mb-6 md:mb-11">Get registered with tapNgrab to transfer and receive E-Ticket(s). Spread the joy by seamlessly transferring tickets to friends and family.</p>
            <Link href="/auth" className="bg-white text-primaryGreen font-medium px-6 py-2 rounded-full hover:bg-primaryOrange hover:text-white transition">

              Register
            </Link>
          </div>
          <div className="lg:hidden flex items-center z-10">
            <img src={Images.transferGrabsImg} alt="Transfer Grabs" className="max-w-[400px] w-full" />
          </div>
        </div>
      </section>

      {/* All Events Map */}
      <section className="py-12 min-h-[400px]">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-h2 font-bold mb-4 text-gray-900">All Events Map</h2>
          <p className="text-gray-600 mb-16">Explore events happening near you</p>
          <div id="all_events" className="w-full h-[500px] rounded-2xl shadow-xl ring-1 ring-gray-200"></div>
        </div>
      </section>

      {/* "What Makes Us Uncommon" remains green as requested */}
      <section className="whatMakes py-32 my-32 bg-primaryGreen relative bg-cover bg-center text-white py-12  min-h-[700px] md:min-h-[500px] overflow-visible my-[105px]">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-h2 font-bold mb-4">What Makes Us Uncommon</h2>
          <p className="text-lg mb-12">Lorem ipsum is simply dummy text of the printing and typesetting industry.</p>
          <div className="flex justify-center gap-12 lg:gap-[300px] flex-col lg:flex-row">
            <div className="flex flex-col items-center">
              <img src={Images.trustFundTransfer} alt="Trust Fund Transfer Icon" className="mb-4 max-w-135" />
              <p className="text-lg font-semibold">Trust Fund Transfer</p>
            </div>
            <div className="flex flex-col items-center">
              <img src={Images.moneySaver} alt="Money Saver Icon" className="mb-4 max-w-135" />
              <p className="text-lg font-semibold">Money Saver</p>
            </div>
            <div className="flex flex-col items-center">
              <img src={Images.userFriendly} alt="User Friendly Icon" className="mb-4 max-w-135" />
              <p className="text-lg font-semibold">User Friendly</p>
            </div>
          </div>
        </div>
      </section>

      {/* What People Say */}
      <section className="py-20 testimonial mt-32 bg-neutral-900 text-white relative overflow-hidden">
        {/* accent divider */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-primaryOrange" />
        <div className="container mx-auto px-6 text-center mb-12">
          <h2 className="text-h2 font-bold mb-4">What People Say</h2>
          <p className="text-lg mb-32 text-white/80">Lorem Ipsum is simply dummy text of the printing and typesetting industry.</p>
          <Slider
            {...testimonialSliderSettings}
            className="w-full max-w-sm sm:max-w-2xl lg:max-w-5xl mx-auto overflow-hidden"
          >
            {testimonials.map((testimonial, index) => (
              <div key={index} className="px-2 sm:px-4 w-full">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8 max-w-full">
                  <div className="quote-bg flex-1 max-w-full">
                    <p className="text-[20px] lg:text-[32px] mb-4 line-clamp-5 md:line-clamp-none text-left text-white/90">{testimonial.text}</p>
                    <p className="text-[20px] lg:text-[32px] font-semibold text-left text-primaryOrange">- {testimonial.author}</p>
                  </div>
                  <img src={testimonial.image} alt={testimonial.author} className="rounded-full w-[150px] h-[150px] md:w-[200px] md:h-[200px] flex-shrink-0 ring-2 ring-primaryOrange/50" />
                </div>
              </div>
            ))}
          </Slider>
        </div>
      </section>

      <SignUp />

    </main>
  );
}
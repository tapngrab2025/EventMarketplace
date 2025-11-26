import { useQuery } from "@tanstack/react-query";
import { Product, Event } from "@shared/schema";
import { useEffect, useState, useRef } from "react";
import ProductCard from "@/components/products/product-card";
import SignUp from "@/components/common/signup";
import { Loader2, CalendarRange, MapPin, Ticket, ShieldCheck, Trophy, BarChart3, Clock, Star, ArrowLeft, ArrowRight } from "lucide-react";
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
import HomeHeroCarousel from "@/components/common/HomeHeroCarousel";

interface VendorDashboardProps {
  searchTerm?: string;
}
function useInViewAnimation(threshold = 0.2) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.unobserve(entry.target); // animate only once
          }
        },
        { threshold }
      );

      if (ref.current) {
        observer.observe(ref.current);
      }

      return () => observer.disconnect();
    }, 1000);
  }, [threshold]);

  return { ref, visible };
}

export default function HomePage(
  { searchTerm = "" }: VendorDashboardProps
) {
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [sortBy, setSortBy] = useState("newest");


  const afterHero = useInViewAnimation();
  const features = useInViewAnimation();
  const whyUs = useInViewAnimation();
  const testimonialsShowcase = useInViewAnimation();
  const testimonialSliderRef = useRef<Slider | null>(null);

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
    <main className="pt-20 min-h-screen">
      <section className="-mt-20">
        {true ? <HomeHeroCarousel /> : <BrandHeroCarousel />}
      </section>
      {/* Modernized: "Let's Find Your Grab" */}
      <section ref={afterHero.ref} className="relative pt-44 pb-20 px-6 mb-32 overflow-hidden -mt-16 bg-white">
        {/* Decorative shapes */}
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-black/5 rounded-full" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-primaryOrange/10 rounded-full" />

        <div className={`text-center mb-16 transition-all duration-700 delay-500 ${afterHero.visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-6'}`}>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Let's Find Your Grab</h1>
          <p className="text-gray-600">Discover your favorite entertainment right here</p>
        </div>

        <div className={`w-full max-w-6xl mx-auto flex flex-col sm:flex-row gap-4 mb-12 transition-all duration-700 delay-100 ${afterHero.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
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

        <div className={`w-full max-w-4xl mx-auto transition-all duration-1000 delay-500 ${afterHero.visible ? 'opacity-100' : 'opacity-0 translate-x-1/3'}`}>
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
      <section ref={features.ref} className="min-h-screen flex flex-col items-center justify-center p-6 mb-32 relative">
        {/* subtle accent shape */}
        <div className="absolute -top-10 left-10 w-64 h-64 bg-primaryGreen/10 rounded-full" />
        <div className="">
          <div className={`text-center mb-20 transition-all duration-700 ${features.visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-6'}`}>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Featured Grabs</h1>
            <p className="text-gray-600">Discover more of the activities with our curated event collections</p>
          </div>

          <div className={`w-full max-w-7xl transition-all duration-1000 delay-500 ${features.visible ? 'opacity-100' : 'opacity-0 translate-y-1/3'}`}>
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
      {/* <section className="whatMakes py-32 my-32 bg-primaryGreen relative bg-cover bg-center text-white py-12  min-h-[700px] md:min-h-[500px] overflow-visible my-[105px]">
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
      </section> */}

      <section ref={whyUs.ref} className="relative whatMakes py-32 my-32 bg-primaryGreen relative bg-cover bg-center text-white py-12  min-h-[700px] md:min-h-[500px] overflow-visible my-[105px]">
        <div className={`container mx-auto px-6 transition-all duration-1000 delay-500 ${whyUs.visible ? 'opacity-100' : 'opacity-0 translate-y-1/3'}`}>
          <div className="text-center mb-12 ">
            <h2 className="text-h2 font-bold mb-4">Why Choose Us</h2>
            <p className="text-lg mb-12">Enjoy Every Moment — No Lines, No Delays, No Stress.</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-stretch">

            {/* LEFT IMAGE — matches height of right side */}
            <div className="lg:col-span-1 h-full">
              <img
                src={Images.groupOfPeople}
                alt="Event"
                className="rounded-xl w-full h-full object-cover min-h-[400px]"
              />
            </div>

            {/* RIGHT FEATURE BOXES — equal height boxes */}
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 h-full">

              <div className="rounded-xl p-6 bg-[#0B242B] text-white flex flex-col justify-top h-full">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primaryOrange/20 text-primaryOrange mb-4">
                  <Ticket className="w-5 h-5" />
                </div>

                <h3 className="font-semibold mb-1">Instant E-Tickets</h3>
                <p className="text-white/80 text-sm">
                  Secure digital tickets delivered instantly with QR verification. No printing, no waiting—your entry pass is always ready on your phone, ensuring a smooth and hassle-free event experience.
                </p>
              </div>

              <div className="rounded-xl p-6 bg-[#0B242B] text-white flex flex-col justify-top h-full">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primaryGreen/20 text-primaryGreen mb-4">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="font-semibold mb-1">Verified Vendors</h3>
                <p className="text-white/80 text-sm">
                  Every stall and organizer is verified for trust and authenticity. We ensure that all event partners meet strict quality standards, so you can purchase with confidence—whether it’s food, merchandise, or exclusive event add-ons. No scams, no uncertainty—only trusted vendors curated for a safe and reliable experience.
                </p>
              </div>

              <div className="rounded-xl p-6 bg-[#0B242B] text-white flex flex-col justify-top h-full">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-teal-500/20 text-teal-500 mb-4">
                  <Clock className="w-5 h-5" />
                </div>
                <h3 className="font-semibold mb-1">Never Miss a Moment</h3>
                <p className="text-white/80 text-sm">
                  No more stepping out during the best part of the event. With our advance ordering and seamless pickup options, you can get what you need without missing a single minute. Stay immersed in the music, the energy, and the excitement—our platform keeps everything running smoothly in the background while you enjoy the show.
                </p>
              </div>

              <div className="rounded-xl p-6 bg-[#0B242B] text-white flex flex-col justify-top h-full">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/15 text-white mb-4">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <h3 className="font-semibold mb-1">Transparent Pricing</h3>
                <p className="text-white/80 text-sm">
                  Clear fees and fair pricing across all events and grabs. No hidden charges, no last-minute surprises—just honest, straightforward pricing so you always know exactly what you're paying for. Enjoy full visibility and make confident decisions every time you purchase.
                </p>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* What People Say */}
      {/* <section className="py-20 testimonial mt-32 bg-neutral-900 text-white relative overflow-hidden">
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
      </section> */}

      <section ref={testimonialsShowcase.ref} className="py-20 bg-white relative">
        <div className={`container mx-auto px-6 transition-all duration-700 ${testimonialsShowcase.visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1/3'}`}>
          <h2 className="text-h2 font-bold mb-4">What People Say</h2>
          <p className="text-lg mb-4">Discover why thousands rely on tapNgrab for seamless ticketing, effortless transfers, and a better event journey.</p>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            <div className="rounded-2xl bg-[#0B242B] text-white p-8 flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-2 text-primaryGreen font-medium mb-4">
                  <span className="inline-block w-2 h-2 rounded-full bg-primaryOrange"></span>
                  <span>Testimonials</span>
                </div>
                <div className="text-5xl font-bold">4.9</div>
                <div className="flex items-center gap-1 mt-2 text-primaryOrange">
                  <Star className="w-5 h-5 fill-current" />
                  <Star className="w-5 h-5 fill-current" />
                  <Star className="w-5 h-5 fill-current" />
                  <Star className="w-5 h-5 fill-current" />
                  <Star className="w-5 h-5 fill-current" />
                </div>
                <p className="text-white/70 mt-2">(40+ Reviews)</p>
                <p className="text-white/70 mt-4">Experiences from live events and on‑site grabs</p>
              </div>
              <div className="mt-6 flex -space-x-2">
                <img src={Images.avatar} alt="reviewer" className="w-9 h-9 rounded-full ring-2 ring-white/20" />
                <img src={Images.avatar} alt="reviewer" className="w-9 h-9 rounded-full ring-2 ring-white/20" />
                <img src={Images.avatar} alt="reviewer" className="w-9 h-9 rounded-full ring-2 ring-white/20" />
                <div className="w-9 h-9 rounded-full bg-primaryOrange text-white flex items-center justify-center text-sm">+</div>
              </div>
            </div>
            <div className="lg:col-span-2">
              <div className="rounded-2xl bg-white ring-1 ring-gray-200 p-6 shadow-sm relative h-full flex items-center">
                <Slider ref={testimonialSliderRef} {...testimonialSliderSettings} className="w-full">
                  {testimonials.map((t, i) => (
                    <div key={i} className="px-2 sm:px-4 w-full">
                      <div className="flex items-start gap-4">
                        <div className="flex items-center gap-1 text-primaryOrange">
                          <Star className="w-4 h-4 fill-current" />
                          <Star className="w-4 h-4 fill-current" />
                          <Star className="w-4 h-4 fill-current" />
                          <Star className="w-4 h-4 fill-current" />
                          <Star className="w-4 h-4 fill-current" />
                        </div>
                      </div>
                      <p className="text-gray-700 mt-3">{t.text}</p>
                      <div className="mt-4 flex items-center gap-3">
                        <img src={t.image} alt={t.author} className="w-10 h-10 rounded-full ring-2 ring-primaryOrange/40" />
                        <div>
                          <p className="font-semibold text-gray-900">{t.author}</p>
                          <p className="text-sm text-gray-500">Event Attendee</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </Slider>
                <div className="absolute bottom-4 right-4 flex gap-2">
                  <button onClick={() => testimonialSliderRef.current?.slickPrev()} className="h-9 w-9 rounded-full bg-primaryGreen text-white hover:bg-primaryOrange grid place-items-center">
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <button onClick={() => testimonialSliderRef.current?.slickNext()} className="h-9 w-9 rounded-full bg-primaryGreen text-white hover:bg-primaryOrange grid place-items-center">
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SignUp />

    </main>
  );
}

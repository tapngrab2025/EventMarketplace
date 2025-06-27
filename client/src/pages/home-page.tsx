import { useQuery } from "@tanstack/react-query";
import { Product, Event } from "@shared/schema";
import { useState } from "react";
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
import CountDown from "@/components/product/count-down";

interface VendorDashboardProps {
  searchTerm?: string;
}

interface CarouselItem {
  id: number;
  title: string;
  category: string;
  promotionalText: string;
  eventName: string;
  eventDate: Date;
  eventEndDate: Date;
  location: string;
  imageUrl: string;
  stallNumber: string;
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

  const { data: products_featured } = useQuery<Product[]>({
    queryKey: ["/api/products/feature"],
  });

  // const { data: events, isLoading: loadingEvents } = useQuery<Event[]>({
  //   queryKey: ["/api/events"],
  // });
  // console.log(products_featured);

  const filteredProducts = products
    ?.filter((product) =>
      product.approved &&
      (product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => b.id - a.id) // Sort by newest first
    .slice(0, 8);

  const productsFeatured = products_featured
    ?.filter((product) => product.products.approved)
    .sort((a, b) => b.id - a.id) // Sort by newest first
    .slice(0, 8);

  // const filteredEvents = events?.filter((event) => {
  //   const matchesSearch = event.approved &&
  //     (event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //       event.description.toLowerCase().includes(searchTerm.toLowerCase()));

  //   const matchesLocation = !location ||
  //     event.location.toLowerCase().includes(location.toLowerCase());

  //   const matchesDateRange = (!startDate || new Date(event.startDate) >= startDate) &&
  //     (!endDate || new Date(event.endDate) <= endDate);

  //   return matchesSearch && matchesLocation && matchesDateRange;
  // }).sort((a, b) => {
  //   if (sortBy === "newest") return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
  //   if (sortBy === "oldest") return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
  //   return 0;
  // });



  // if (loadingProducts || loadingEvents) {
  if (loadingProducts) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  // Add this function inside the HomePage component
  const carouselItems: CarouselItem[] = productsFeatured
    ?.map(product => ({
      id: product.products.id,
      title: product.products.name,
      category: product.products.category,
      promotionalText: `For the 1st 50`,
      eventName: product.events?.name || '',
      eventDate: new Date(product.events?.startDate),
      eventEndDate: new Date(product.events?.endDate),
      location: product.events?.location || '',
      imageUrl: product.products.imageUrl,
      stallNumber: `Stall ${product.stalls?.id || '35'}`
    })) || [];

  const heroSliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: false,
    autoplaySpeed: 5000,
    arrows: false,
    className: "mobile-slider",
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          infinite: true,
          dots: true
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          initialSlide: 1,
          dots: true
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          dots: true
        }
      }
    ]
  };

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
  const carouselStyles = `
  .mobile-slider {
    overflow: hidden;
    width: 100% !important;
  }
  .mobile-slider .slick-list {
    width: 100% !important;
    overflow: hidden !important;
  }
  @media (max-width: 640px) {
    .mobile-slider .slick-slide > div {
      padding: 0;
      margin: 0;
      width: 100%;
    }
  }
`;

  return (
    <main className="pt-8 min-h-screen">
      <section className="bg-[#1B0164] -mt-8 text-white py-8 md:py-12 overflow-hidden">
        <style>{carouselStyles}</style>
        <div className="container mx-auto px-4">
          <Slider
            {...heroSliderSettings}
            className="w-full max-w-sm sm:max-w-2xl lg:max-w-5xl mx-auto featured-carousel"
          >
            {carouselItems.map((item) => (
              // <div key={item.id} className="w-full max-w-6xl px-4 relative lg:pt-[45px]">
              <div key={item.id} className="px-4 relative lg:pt-[45px] w-[300px] md:w-full">
                <div className="flex flex-col md:flex-row items-center justify-between max-w-6xl mx-auto">
                  <div className="flex-1 w-full md:pr-8 mt-0 mb-auto">
                    <div className="flex items-center space-x-2 mb-4 text-2xl">
                      <MapPin className="h-8 w-8" />
                      <span>{item.location}</span>
                    </div>
                    <h2 className="text-4xl font-bold mb-4 text-primaryOrange">
                      {item.eventName} - {item.stallNumber}
                    </h2>
                    <div className="flex space-x-4 mb-8">
                      <CountDown date={item?.eventEndDate} className="event_count_down" />
                    </div>
                    <Button
                      className="bg-teal-500 text-white px-8 py-2 rounded-full hover:bg-teal-600"
                      onClick={() => window.location.href = `/products/${item.id}`}
                    >
                      Grab This
                    </Button>
                  </div>
                  <div className="flex-1 relative w-full mt-8 md:mt-0">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full object-cover mx-auto h-[300px] md:min-h-[500px] md:max-h-[600px]"
                    />
                    <div className="absolute top-0 left-0 w-full h-full bg-stone-700 opacity-50"></div>
                  </div>
                </div>
                <div className="text-3xl md:text-6xl font-bold mb-8 transform -rotate-[20deg] bottom-[2rem] absolute left-[10%] md:left-[15%] text-center">
                  {item.title} {item.category} <br />
                  {item.promotionalText}
                </div>
              </div>
            ))}
          </Slider>
        </div>
      </section>
      {/* <section className="text-center my-16 px-4">
        <div className="container mx-auto">
          <h1 className="text-4xl font-bold mb-4">
            Your One-Stop Event Marketplace
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover unique souvenirs, promotional items, and giveaways for your next event.
            Connect with vendors and event organizers all in one place.
          </p>
        </div>
      </section> */}
      {/* <section className="flex flex-col items-center justify-center bg-gradient-to-r from-pink-200 via-purple-200 to-blue-200 p-6"> */}
      <section className="flex flex-col items-center justify-center py-20 px-6 overflow-hidden relative">
        <div className="absolute inset-0 opacity-80" 
            style={{ 
              background: 'radial-gradient(circle at 0% 37%,rgb(167, 88, 158) 0%, transparent 10%), radial-gradient(circle at 100% 68%, #3d0a91cc 0%, transparent 13%)'
            }}>
        </div>
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Let's Find Your Grab</h1>
          <p className="text-gray-600">Discover your favorite entertainment right here</p>
        </div>

        <div className="w-full max-w-6xl flex flex-col sm:flex-row gap-4 mb-12">
          <div className="flex-1">
            <div className="relative bg-white rounded-lg w-full">
              <Input
                id="location"
                placeholder="Filter by Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full pl-12 rounded-[15px] bg-white border-[#A3A3A3]"
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 bg-white flex items-center justify-center">
                <MapPin className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>
          <div className="flex flex-1">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full bg-white rounded-[15px] border-[#A3A3A3]">
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
              <SelectTrigger className="bg-white rounded-[15px] border-[#A3A3A3]">
                <SelectValue placeholder="Newest First" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <button
            className="bg-teal-500 text-white text-base py-2 px-16 rounded-[50px] hover:bg-teal-600 transition duration-300 max-w-full"
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

        <div className="w-full max-w-4xl">
          <h2 className="text-h2 font-semibold text-gray-800 mb-6 text-center">Popular Cities</h2>
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

      {/* Featured Grabs */}
      {/* <section className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-pink-200 via-purple-200 to-blue-200 p-6"> */}
      <section className="min-h-screen flex flex-col items-center justify-center p-6">
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

      {/* <section className="relative bg-cover bg-center text-white min-h-[700px] md:min-h-[500px] overflow-visible" style={{ backgroundImage: `url(${Images.transferBg.src || Images.transferBg})` }}> */}
      <section className="transferGrabs relative bg-[#1B0164] bg-cover bg-center text-white min-h-[700px] md:min-h-[500px] overflow-visible my-[105px]">
        <div className="container mx-auto flex flex-wrap items-center justify-between px-6 gap-8 flex-col lg:flex-row min-h-[600px] md:min-h-[400px] max-w-7xl relative bg-none bg-no-repeat bg-right lg:bg-[image:var(--bg-image)]"
          style={{ '--bg-image': `url(${Images.transferGrabsImg.src || Images.transferGrabsImg})` } as React.CSSProperties}>
          <div className="lg:max-w-3xl z-10 text-center">
            <h2 className="text-h2 font-bold mb-4 md:mb-11">Transfer Your Grabs</h2>
            <p className="text-h5 mb-6 md:mb-11">Get registered with tapNgrab to transfer and receive E-Ticket(s). Spread the joy by seamlessly transferring tickets to friends and family.</p>
            <Link href="/auth" className="bg-[#F58020] text-white font-medium px-6 py-2 rounded-full hover:bg-orange-600 transition">
              Register
            </Link>
          </div>
          <div className="lg:hidden flex items-center z-10">
            <img src={Images.transferGrabsImg} alt="Transfer Grabs" className="max-w-[400px] w-full" />
          </div>
        </div>
      </section>

      <section className="py-12 min-h-[400px]">
        <div className="container mx-auto px-6 text-center min-h-80">
          <h2 className="text-h2 font-bold mb-4">All Events Map</h2>
        </div>
      </section>

      {/* <section className="whatMakes relative bg-cover bg-center text-white py-12  min-h-[700px] md:min-h-[500px] overflow-visible" style={{ backgroundImage: `url(${Images.whatMakesImg.src || Images.whatMakesImg})` }}> */}
      <section className="whatMakes  bg-[#1B0164] relative bg-cover bg-center text-white py-12  min-h-[700px] md:min-h-[500px] overflow-visible my-[105px]">
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

      <section className="py-12 testimonial">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-h2 font-bold mb-4">What People Say</h2>
          <p className="text-lg mb-12">Lorem Ipsum is simply dummy text of the printing and typesetting industry.</p>
          <Slider
            {...testimonialSliderSettings}
            className="w-full max-w-sm sm:max-w-2xl lg:max-w-5xl mx-auto overflow-hidden"
          >
            {testimonials.map((testimonial, index) => (
              <div key={index} className="px-2 sm:px-4 w-full">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8 max-w-full">
                  <div className="quote-bg flex-1 max-w-full">
                    <p className="text-[20px] lg:text-[32px] mb-4 line-clamp-5 md:line-clamp-none text-left">{testimonial.text}</p>
                    <p className="text-[20px] lg:text-[32px] font-semibold text-left">- {testimonial.author}</p>
                  </div>
                  <img src={testimonial.image} alt={testimonial.author} className="rounded-full w-[150px] h-[150px] md:w-[200px] md:h-[200px] flex-shrink-0" />
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
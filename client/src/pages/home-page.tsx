import { useQuery } from "@tanstack/react-query";
import { Event } from "@shared/schema";
import { useEffect, useRef } from "react";
import { Loader2, Star, ArrowLeft, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import Slider from "react-slick";
import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";
import { Images } from "@/config/images";
import BrandHeroCarousel from "@/components/common/BrandHeroCarousel";
import HomeHeroCarousel from "@/components/common/HomeHeroCarousel";
import SearchSection from "@/components/common/SearchSection";
import ReverseDualSection from "@/components/common/ReverseDualSection";
import DualSection from "@/components/common/DualSection";
import FeaturedGrab from "@/components/common/FeaturedGrab";
import NewsletterComponent from "@/components/common/newsletterComponent";

interface VendorDashboardProps {
  searchTerm?: string;
}
export default function HomePage({ searchTerm = "" }: VendorDashboardProps) {
  const testimonialSliderRef = useRef<Slider | null>(null);

  const testimonials = [
    {
      text: "Using this platform has transformed the way we manage our projects. The interface is intuitive and the support team is always ready to help.",
      author: "Emma Thompson",
      image: Images.emmaThompson,
    },
    {
      text: "The attention to detail and personalized approach made our experience seamless. Highly recommend to anyone looking for quality results.",
      author: "Sophia Lee",
      image: Images.sophiaLee,
    },
    {
      text: "I was impressed with the speed and reliability of the services. It truly exceeded my expectations!",
      author: "David Miller",
      image: Images.davidMiller,
    },
  ];

  const whyChooseCards = [
    {
      image: Images.choose1,
      title: "Instant E-Tickets",
      description:
        "Secure digital tickets delivered instantly with QR verification, ready on your phone whenever you arrive.",
    },
    {
      image: Images.choose2,
      title: "Verified Vendors",
      description:
        "Every stall and organizer is reviewed for trust, quality, and a more confident event experience.",
    },
    {
      image: Images.choose3,
      title: "Never Miss a Moment",
      description:
        "Order ahead and collect smoothly, so you can stay close to the music, energy, and excitement.",
    },
    {
      image: Images.choose4,
      title: "Transparent Pricing",
      description:
        "Clear fees and fair pricing help you know exactly what you are paying for before checkout.",
    },
  ];

  // Uncomment this query to fetch events data
  const { data: events, isLoading: loadingEvents } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  useEffect(() => {
    initMap();
  }, [events]);

  // Update the loading check to include events
  if (loadingEvents) {
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
    const mapElement = document.getElementById("all_events") as HTMLElement;
    if (!mapElement) return;

    const map = new google.maps.Map(mapElement, {
      zoom: 8, // Adjust zoom level as needed
      center: defaultPosition,
      mapTypeControl: true,
      fullscreenControl: true,
      streetViewControl: false,
    });

    // Check if events data is available
    if (events && events.length > 0) {
      // Create bounds to fit all markers
      const bounds = new google.maps.LatLngBounds();

      // Process each event to create markers
      events.forEach((event) => {
        // You need to geocode the location string to get coordinates
        getCoordinatesFromAddress(event.location).then((position) => {
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
              headerDisabled: true,
            });

            const mapPin = Images.pin;
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
              animation: google.maps.Animation.DROP,
            });

            // Add click event to show info window
            marker.addListener("click", () => {
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
  function getCoordinatesFromAddress(
    address: string,
  ): Promise<google.maps.LatLngLiteral | null> {
    return new Promise((resolve) => {
      // Create a geocoder instance
      const geocoder = new google.maps.Geocoder();

      // Geocode the address
      geocoder.geocode({ address }, (results, status) => {
        if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
          const location = results[0].geometry.location;
          resolve({
            lat: location.lat(),
            lng: location.lng(),
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
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    arrows: false,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };
  return (
    <main>
      <section className="hidden">
        {true ? <HomeHeroCarousel /> : <BrandHeroCarousel />}
      </section>
      <SearchSection />
      <DualSection />
      <ReverseDualSection />
      <FeaturedGrab />

      {/* <section className="relative bg-cover bg-center text-white min-h-[700px] md:min-h-[500px] overflow-visible" style={{ backgroundImage: `url(${Images.transferBg.src || Images.transferBg})` }}> */}
      <section className="hidden transferGrabs py-32 relative bg-primaryGreen bg-cover bg-center text-white min-h-[700px] md:min-h-[500px] overflow-visible my-[105px]">
        <div
          className="container mx-auto flex flex-wrap items-center justify-between px-6 gap-8 flex-col lg:flex-row min-h-[600px] md:min-h-[400px] max-w-7xl relative bg-no-repeat bg-right lg:bg-[image:var(--bg-image)]"
          style={
            {
              "--bg-image": `url(${Images.transferGrabsImg})`,
            } as React.CSSProperties
          }
        >
          <div className="lg:max-w-3xl z-10 text-center">
            <h2 className="text-h2 font-bold mb-4 md:mb-11">
              Transfer Your Grabs
            </h2>
            <p className="text-h5 mb-6 md:mb-11">
              Get registered with tapNgrab to transfer and receive E-Ticket(s).
              Spread the joy by seamlessly transferring tickets to friends and
              family.
            </p>
            <Link
              href="/auth"
              className="bg-white text-primaryGreen font-medium px-6 py-2 rounded-full hover:bg-primaryOrange hover:text-white transition"
            >
              Register
            </Link>
          </div>
          <div className="lg:hidden flex items-center z-10">
            <img
              src={Images.transferGrabsImg}
              alt="Transfer Grabs"
              className="max-w-[400px] w-full"
            />
          </div>
        </div>
      </section>

      {/* All Events Map */}
      <section className="hidden py-12 min-h-[400px]">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-h2 font-bold mb-4 text-gray-900">
            All Events Map
          </h2>
          <p className="text-gray-600 mb-16">
            Explore events happening near you
          </p>
          <div
            id="all_events"
            className="w-full h-[500px] rounded-2xl shadow-xl ring-1 ring-gray-200"
          ></div>
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

      <section className="mx-auto max-w-7xl  bg-white py-20">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-2xl text-center mb-12">
            <div className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-600">
              Why Choose Us
            </div>

            <h2 className="mt-4 font-serif text-2xl leading-tight tracking-tight text-zinc-900 sm:text-4xl">
              Enjoy every moment with <br /> no lines, no delays, and no stress.
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyChooseCards.map((card) => (
              <div
                key={card.title}
                className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm"
              >
                <img
                  src={card.image}
                  alt={card.title}
                  className="h-48 mx-auto"
                />
                <div className="p-5">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {card.title}
                  </h3>
                  <p className="text-sm leading-6 text-gray-600">
                    {card.description}
                  </p>
                </div>
              </div>
            ))}
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

      <section className="mx-auto max-w-7xl py-20 bg-white relative">
        <div className="container mx-auto px-6">
          <div className="mx-auto text- mb-12">
            <div className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-600">
              What People Say
            </div>

            <h2 className="mt-4 font-serif text-2xl leading-tight tracking-tight text-zinc-900 sm:text-4xl">
              Discover why thousands rely on tapNgrab
            </h2>
          </div>

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
                <p className="text-white/70 mt-4">
                  Experiences from live events and on‑site grabs
                </p>
              </div>
              <div className="mt-6 flex -space-x-2">
                <img
                  src={Images.emmaThompson}
                  alt="reviewer"
                  className="w-9 h-9 rounded-full ring-2 ring-white/20"
                />
                <img
                  src={Images.davidMiller}
                  alt="reviewer"
                  className="w-9 h-9 rounded-full ring-2 ring-white/20"
                />
                <img
                  src={Images.sophiaLee}
                  alt="reviewer"
                  className="w-9 h-9 rounded-full ring-2 ring-white/20"
                />
                <div className="w-9 h-9 rounded-full bg-primaryOrange text-white flex items-center justify-center text-sm">
                  +
                </div>
              </div>
            </div>
            <div className="lg:col-span-2">
              <div className="bg-white relative h-full flex items-center">
                <Slider
                  ref={testimonialSliderRef}
                  {...testimonialSliderSettings}
                  className="w-full [&_.slick-track]:flex [&_.slick-slide]:h-auto [&_.slick-slide>div]:h-full"
                >
                  {testimonials.map((t, i) => (
                    <div key={i} className="h-full px-2 sm:px-3 w-full">
                      <div className="flex h-full min-h-[260px] flex-col rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
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
                        <div className="mt-auto pt-4 flex items-center gap-3">
                          <img
                            src={t.image}
                            alt={t.author}
                            className="w-10 h-10 rounded-full ring-2 ring-primaryOrange/40"
                          />
                          <div>
                            <p className="font-semibold text-gray-900">
                              {t.author}
                            </p>
                            <p className="text-sm text-gray-500">
                              Event Attendee
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </Slider>
                <div className="absolute -top-6 right-4 flex gap-2">
                  <button
                    onClick={() => testimonialSliderRef.current?.slickPrev()}
                    className="h-9 w-9 rounded-xl bg-primaryGreen text-white hover:bg-primaryOrange grid place-items-center"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => testimonialSliderRef.current?.slickNext()}
                    className="h-9 w-9 rounded-xl bg-primaryGreen text-white hover:bg-primaryOrange grid place-items-center"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <NewsletterComponent />
    </main>
  );
}

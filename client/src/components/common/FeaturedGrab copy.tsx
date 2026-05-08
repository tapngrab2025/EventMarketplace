import { useRef } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import Slider from "react-slick";
import { Link } from "wouter";

import event1 from "@/assets/events/event1.webp";
import event2 from "@/assets/events/event2.webp";
import event3 from "@/assets/events/event3.webp";
import event4 from "@/assets/events/event4.webp";
import event5 from "@/assets/events/event5.webp";

type FeaturedEvent = {
  id: number;
  image: string;
  alt: string;
  badge: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  price: string;
};

const featuredEvents: FeaturedEvent[] = [
  {
    id: 1,
    image: event1,
    alt: "Concert crowd enjoying a featured event",
    badge: "Hot Pick",
    title: "Ready to Eat Kottu Night at Alokawarsha 360",
    date: "26 Apr 2026",
    time: "7:30 PM",
    venue: "Alokawarsha 360, Colombo",
    price: "3,500 LKR",
  },
  {
    id: 2,
    image: event2,
    alt: "Live performance on a featured event stage",
    badge: "Selling Fast",
    title: "Sunset Beats Rooftop Session",
    date: "02 May 2026",
    time: "6:00 PM",
    venue: "Pulse Rooftop, Colombo 02",
    price: "5,000 LKR",
  },
  {
    id: 3,
    image: event3,
    alt: "Guests attending a premium nightlife event",
    badge: "Weekend Drop",
    title: "After Dark Social Club Experience",
    date: "09 May 2026",
    time: "8:30 PM",
    venue: "Velvet Hall, Colombo 05",
    price: "6,200 LKR",
  },
  {
    id: 4,
    image: event4,
    alt: "Audience enjoying a curated featured event",
    badge: "Editor's Choice",
    title: "City Lights Live Showcase",
    date: "16 May 2026",
    time: "7:00 PM",
    venue: "Skyline Arena, Colombo 01",
    price: "4,800 LKR",
  },
  {
    id: 5,
    image: event5,
    alt: "Live performance on a featured event stage",
    badge: "Hot Pick",
    title: "Ready to Eat Kottu Night at Alokawarsha 360",
    date: "26 Apr 2026",
    time: "7:30 PM",
    venue: "Alokawarsha 360, Colombo",
    price: "3,500 LKR",
  },
];

export default function FeaturedGrab() {
  const sliderRef = useRef<Slider | null>(null);

  const sliderSettings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4500,
    arrows: false,
    responsive: [
      {
        breakpoint: 1280,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          centerMode: true,
          centerPadding: "44px",
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          centerMode: true,
          centerPadding: "24px",
        },
      },
    ],
  };

  return (
    <section className="overflow-hidden">
      <div className="relative mx-auto w-full max-w-7xl border border-t-0 border-zinc-200 bg-white px-4 py-16 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <div className="text-xs font-semibold uppercase tracking-[0.25em] text-orange-500">
            Featured Grabs
          </div>

          <h2 className="mt-4 font-serif text-4xl leading-tight tracking-tight text-zinc-900 sm:text-5xl">
            Our curated event collections
          </h2>
        </div>

        <div className="relative mt-12">
          <button
            type="button"
            aria-label="Previous featured event"
            onClick={() => sliderRef.current?.slickPrev()}
            className="absolute left-0 top-1/2 z-10 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-700 shadow-sm transition hover:border-orange-500 hover:text-orange-500"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <button
            type="button"
            aria-label="Next featured event"
            onClick={() => sliderRef.current?.slickNext()}
            className="absolute right-0 top-1/2 z-10 flex h-8 w-8 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-700 shadow-sm transition hover:border-orange-500 hover:text-orange-500"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          <Slider
            ref={sliderRef}
            {...sliderSettings}
            className="featured-grab-slider -mx-3"
          >
            {featuredEvents.map((event) => (
              <div key={event.id} className="px-3">
                <article className="group flex h-full min-h-[390px] flex-col overflow-hidden rounded border border-zinc-200 bg-white transition duration-300">
                  <div className="relative aspect-[1/1] overflow-hidden">
                    <img
                      src={event.image}
                      alt={event.alt}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  </div>

                  <div className="flex flex-1 flex-col px-4 pt-3">
                    <h3 className="line-clamp-1 text-base font-semibold leading-snug text-zinc-900">
                      {event.title}
                    </h3>

                    <div className="mt-4 space-y-1.5">
                      <div className="flex items-start gap-3 text-sm text-zinc-600">
                        <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
                        <span>
                          {event.date} | {event.time}
                        </span>
                      </div>

                      <div className="flex items-start gap-3 text-sm text-zinc-600">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
                        <span>{event.venue}</span>
                      </div>

                      <div className="flex items-start gap-2 text-base font-semibold text-zinc-900">
                        <span>{event.price}</span>
                        <span>Upwards</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto pt-6">
                    <Link
                      href="/events"
                      className="inline-flex w-full items-center justify-center bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-400"
                    >
                      Grab Now
                    </Link>
                  </div>
                </article>
              </div>
            ))}
          </Slider>
        </div>
      </div>
    </section>
  );
}

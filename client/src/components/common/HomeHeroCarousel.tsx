import { useQuery } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import CountDown from "../product/count-down";

interface HeroSlide {
  id: number;
  title: string;
  subtitle?: string;
  location: string;
  imageUrl: string;
  ctaHref: string;
  eventEndDate: Date;
}

export default function HomeHeroCarousel() {
  const { data: products_featured } = useQuery<Product[]>({
    queryKey: ["/api/products/feature"],
  });

  const slides: HeroSlide[] = (products_featured || [])
    .filter((p) => p.products.approved)
    .sort((a, b) => b.id - a.id)
    .slice(0, 6)
    .map((product) => ({
      id: product.products.id,
      title: product.products.name,
      subtitle: product.events?.name || "",
      location: product.events?.location || "",
      imageUrl: product.products.imageUrl,
      eventEndDate: new Date(product.events?.endDate),
      ctaHref: `/products/${product.products.id}`,
    }));

  if (!slides.length) return null;

  return (
    <div className="relative min-h-[620px] sm:min-h-[760px] lg:min-h-[860px] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primaryGreen/15 via-teal-200/30 to-primaryOrange/15" />
      <div className="absolute top-0 right-0 w-[30rem] h-[30rem] bg-primaryOrange/10 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3" />
      <div className="absolute bottom-0 left-0 w-[26rem] h-[26rem] bg-primaryGreen/10 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3" />

      <div className="absolute inset-x-0 bottom-24 text-center select-none pointer-events-none">
        <span className="font-extrabold tracking-wider mix-blend-soft-light drop-shadow-sm">
          <span className="text-6xl sm:text-8xl lg:text-[10rem] uppercase">
            <span className="text-primaryOrange">Tap</span>
            <span className="mx-6 text-white/80">&</span>
            <span className="text-primaryGreen">Grab</span>
          </span>
        </span>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <Carousel className="relative">
          <CarouselContent className="ml-0">
            {slides.map((slide) => (
              <CarouselItem key={slide.id} className="pl-0">
                <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 items-center py-16 lg:py-40 pb-40 lg:pb-40 max-w-[320px] sm:max-w-full  min-h-[620px] sm:min-h-[760px] lg:min-h-[860px]">
                  <div className="order-2 lg:order-1 w-full">
                    {slide.subtitle && (
                      <p className="text-primaryOrange font-semibold tracking-wide uppercase mb-4">
                        {slide.subtitle}
                      </p>
                    )}
                    <h2 className="font-bold leading-tight mb-8 text-3xl sm:text-4xl lg:text-5xl text-primaryGreen capitalize">
                      {slide.title}
                    </h2>
                    <Button
                      size="lg"
                      className="bg-teal-500 text-white hover:bg-primaryOrange"
                      onClick={() => (window.location.href = slide.ctaHref)}
                    >
                      Grab This
                    </Button>
                    <div className="md:flex flex-wrap md:flex-nowrap items-center gap-2 text-sm text-gray-700 my-8">
                      <MapPin className="h-4 w-4" />
                      <span>{slide.location}</span>
                    </div>
                  </div>
                  <div className="order-1 lg:order-2 w-full">
                    <div className="relative rounded-2xl overflow-hidden shadow-xl bg-white/50 backdrop-blur-sm">
                      <img
                        src={slide.imageUrl}
                        alt={slide.title}
                        className="w-full h-[320px] sm:h-[460px] object-cover transition-transform duration-700 hover:scale-105"
                      />
                    </div>
                  </div>
                  <div className="absolute md:left-1/2 md:-translate-x-1/2 bottom-4 w-full max-w-[20rem] sm:max-w-[28rem] lg:max-w-4xl px-4">
                    <CountDown date={slide.eventEndDate} variant="bar" />
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </div>
  );
}
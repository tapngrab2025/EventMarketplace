import { useQuery } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import CountDown from "../product/count-down";

interface BrandSlide {
  id: number;
  title: string;
  subtitle?: string;
  location: string;
  imageUrl: string;
  ctaHref: string;
  ctaText?: string;
  eventDate: Date;
  eventEndDate: Date;
}

export default function BrandHeroCarousel() {
  const { data: products_featured } = useQuery<Product[]>({
    queryKey: ["/api/products/feature"],
  });

  const slides: BrandSlide[] = (products_featured || [])
    .filter((p) => p.products.approved)
    .sort((a, b) => b.id - a.id)
    .slice(0, 6)
    .map((product) => ({
      id: product.products.id,
      title: product.products.name,
      subtitle: product.events?.name || "",
      location: product.events?.location || "",
      imageUrl: product.products.imageUrl,
      eventDate: new Date(product.events?.startDate),
      eventEndDate: new Date(product.events?.endDate),
      ctaHref: `/products/${product.products.id}`,
      ctaText: "Grab This",
    }));

  if (!slides.length) return null;

  return (
    <div className="container mx-auto px-4">
      <Carousel className="relative">
        <CarouselContent>
          {slides.map((slide) => (
            <CarouselItem key={slide.id}>
              <div className="relative w-full overflow-hidden rounded-2xl">
                {/* Background image */}
                <img
                  src={slide.imageUrl}
                  alt={slide.title}
                  className="w-full h-[320px] sm:h-[460px] lg:h-[560px] object-cover"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent" />
                {/* Content */}
                <div className="absolute inset-0 flex items-center">
                  <div className="px-6 sm:px-10 lg:px-16 max-w-3xl text-white">
                    <div className="mb-3 flex items-center gap-2 text-sm sm:text-base opacity-90">
                      <MapPin className="h-4 w-4" />
                      <span>{slide.location}</span>
                    </div>
                    {slide.subtitle && (
                      <p className="text-primaryOrange font-semibold tracking-wide uppercase mb-1 text-sm sm:text-base">
                        {slide.subtitle}
                      </p>
                    )}
                    <h2 className="font-bold leading-tight mb-4 text-2xl sm:text-4xl lg:text-5xl">
                      {slide.title}
                    </h2>
                    <div className="flex space-x-4 mb-8">
                      <CountDown date={slide?.eventEndDate} className="event_count_down" />
                    </div>
                    <Button
                      size="lg"
                      className="bg-white text-primaryGreen hover:bg-primaryOrange hover:text-white"
                      onClick={() => (window.location.href = slide.ctaHref)}
                    >
                      {slide.ctaText || "Grab This"}
                    </Button>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        {/* Navigation */}
        <CarouselPrevious className="-left-6 bg-white/80 hover:bg-white shadow-sm border-none hover:bg-primaryOrange hover:text-white" />
        <CarouselNext className="-right-6 bg-white/80 hover:bg-white shadow-sm border-none hover:bg-primaryOrange hover:text-white" />
      </Carousel>
    </div>
  );
}
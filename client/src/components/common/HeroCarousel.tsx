// import { Slider } from "@radix-ui/react-slider";
import { useQuery } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import { MapPin } from "lucide-react";
import CountDown from "../product/count-down";
import { Button } from "@/components/ui/button";
import Slider from "react-slick";
import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";

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
export default function HeroCarousel() {

    const { data: products_featured } = useQuery<Product[]>({
        queryKey: ["/api/products/feature"],
    });

    const productsFeatured = products_featured
        ?.filter((product) => product.products.approved)
        .sort((a, b) => b.id - a.id) // Sort by newest first
        .slice(0, 8);

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
        speed: 800,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 6000,
        arrows: false,
        className: "mobile-slider",
        fade: false,
        cssEase: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        pauseOnHover: true,
        pauseOnFocus: true,
        swipeToSlide: true,
        touchThreshold: 10,
//           beforeChange: () => {
//     // Reset animations on *all* slides before switching
//     const allAnimated = document.querySelectorAll(
//       '.featured-carousel .slick-slide [class*="animate-"]'
//     );
//     allAnimated.forEach((el) => {
//       el.style.animation = 'none';
//       el.style.opacity = 0;
//     });
//   },

//   afterChange: () => {
//     // Run animation only on ACTIVE slides
//     const activeSlides = document.querySelectorAll('.featured-carousel .slick-active');
//     activeSlides.forEach((slide) => {
//       const animatedEls = slide.querySelectorAll('[class*="animate-"]');
//       animatedEls.forEach((el) => {
//         el.style.animation = 'none';
//         el.offsetHeight; // trigger reflow
//         el.style.animation = ''; // restart animation
//         el.style.opacity = 1;
//       });
//     });
//   },
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    infinite: true,
                    dots: true,
                    speed: 700,
                    autoplaySpeed: 5500
                }
            },
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    initialSlide: 1,
                    dots: true,
                    speed: 600,
                    autoplaySpeed: 5000
                }
            },
            {
                breakpoint: 480,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    dots: true,
                    speed: 500,
                    autoplaySpeed: 4500
                }
            }
        ]
    };

    const carouselStyles = `
  .mobile-slider {
    overflow: hidden;
    width: 100% !important;
  }
  .mobile-slider .slick-list {
    width: 100% !important;
    overflow: hidden !important;
  }
  
  /* Animation Keyframes */
  @keyframes slideInFromLeft {
    0% {
      opacity: 0;
      transform: translateX(-50px);
    }
    100% {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  @keyframes slideInFromBottom {
    0% {
      opacity: 0;
      transform: translateY(30px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes fadeInScale {
    0% {
      opacity: 0;
      transform: scale(1.1);
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
  }
  
  @keyframes slideInFromRight {
    0% {
      opacity: 0;
      transform: translateX(50px) scale(1.05);
    }
    100% {
      opacity: 1;
      transform: translateX(0) scale(1);
    }
  }
  
  @keyframes bounceIn {
    0% {
      opacity: 0;
      transform: scale(0.3);
    }
    50% {
      opacity: 1;
      transform: scale(1.05);
    }
    70% {
      transform: scale(0.9);
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
  }
  
  /* Animation Classes */
  .animate-slide-in-left {
    animation: slideInFromLeft 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
  }
  
  .animate-slide-in-bottom {
    animation: slideInFromBottom 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
  }
  
  .animate-fade-in-scale {
    animation: fadeInScale 1s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
  }
  
  .animate-slide-in-right {
    animation: slideInFromRight 1s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
  }
  
  .animate-bounce-in {
    animation: bounceIn 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
  }
  
  /* Staggered Animation Delays */
  .delay-100 { animation-delay: 0.1s; }
  .delay-200 { animation-delay: 0.2s; }
  .delay-300 { animation-delay: 0.3s; }
  .delay-400 { animation-delay: 0.4s; }
  .delay-500 { animation-delay: 0.5s; }
  
  /* Initial hidden state for animated elements */
  .animate-slide-in-left,
  .animate-slide-in-bottom,
  .animate-fade-in-scale,
  .animate-slide-in-right,
  .animate-bounce-in {
    opacity: 0;
  }
  
  /* Enhanced slider transitions */
  .mobile-slider .slick-slide {
    transition: all 0.3s ease-in-out;
  }
   .featured-carousel .animate-slide-in-left,
  .featured-carousel .animate-slide-in-bottom,
  .featured-carousel .animate-fade-in-scale,
  .featured-carousel .animate-slide-in-right,
  .featured-carousel .animate-bounce-in{
    opacity: 0;
  }

  .featured-carousel .slick-active .animate-slide-in-left,
  .featured-carousel .slick-active .animate-slide-in-bottom,
  .featured-carousel .slick-active .animate-fade-in-scale,
  .featured-carousel .slick-active .animate-slide-in-right,
  .featured-carousel .slick-active .animate-bounce-in,
  .mobile-slider .slick-active .animate-slide-in-left,
  .mobile-slider .slick-active .animate-slide-in-bottom,
  .mobile-slider .slick-active .animate-fade-in-scale,
  .mobile-slider .slick-active .animate-slide-in-right,
  .mobile-slider .slick-active .animate-bounce-in {
    animation-play-state: running;
  }
  
  /* Hover effects */
  .hero-image-container {
    transition: transform 0.3s ease-in-out;
  }
  
  .hero-image-container:hover {
    transform: scale(1.02);
  }
  
  .hero-button {
    transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    transform: translateY(0);
  }
  
  .hero-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
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
        <>
            <style>{carouselStyles}</style>
            <div className="container mx-auto px-4">
                <Slider
                    {...heroSliderSettings}
                    className="w-full max-w-sm sm:max-w-2xl lg:max-w-5xl mx-auto featured-carousel"
                >
                    {carouselItems.map((item) => (
                        // <div key={item.id} className="w-full max-w-6xl px-4 relative lg:pt-[45px]">
                        <div key={item.id} className="py-4 relative lg:pt-[45px] w-[300px] md:w-full">
                            <div className="flex flex-col md:flex-row items-center justify-between max-w-6xl mx-auto">
                                <div className="flex-1 w-full md:pr-8 mt-0 mb-auto">
                                    <div className="flex space-x-2 mb-4 text-md animate-slide-in-left delay-100">
                                        <MapPin className="h-5 w-5" />
                                        <span>{item.location}</span>
                                    </div>
                                    <h2 className="text-4xl font-bold mb-4 text-[#FFCA99] animate-slide-in-left delay-200">
                                        {item.eventName} - {item.stallNumber}
                                    </h2>
                                    <div className="flex space-x-4 mb-8 animate-slide-in-bottom delay-300">
                                        <CountDown date={item?.eventEndDate} className="event_count_down" />
                                    </div>
                                    <Button
                                        className="bg-white text-primaryGreen px-8 py-2 rounded-full hover:bg-primaryOrange hover:text-white hero-button animate-bounce-in delay-400"
                                        onClick={() => window.location.href = `/products/${item.id}`}
                                    >
                                        Grab This
                                    </Button>
                                </div>
                                <div className="flex-1 relative w-full mt-8 md:mt-0 hero-image-container animate-slide-in-right delay-200">
                                    <div className="absolute top-0 left-0 w-full h-full bg-stone-700 opacity-50 animate-fade-in-scale delay-400"></div>
                                    <img
                                        src={item.imageUrl}
                                        alt={item.title}
                                        className="w-full object-cover mx-auto h-[300px] md:min-h-[500px] md:max-h-[600px] animate-fade-in-scale delay-300"
                                    />
                                </div>
                            </div>
                            <div className="font-bold uppercase flex hidden">
                                <p className="font-bold uppercase">Type : </p>
                                <p className="font-bold uppercase text-primaryOrange mx-2"> {item.category} </p> :
                                <p className="font-bold uppercase text-teal-500 mx-2">{item.promotionalText}</p>
                            </div>
                            <div className="font-ribeye capitalize text-3xl md:text-5xl font-bold mb-8 transform bottom-[5rem] absolute w-full animate-slide-in-bottom delay-500">
                                {item.title}
                            </div>

                        </div>
                    ))}
                </Slider>
            </div>
        </>
    );
}
import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Event } from "@shared/schema";
import { Link } from "wouter";
import { Loader2 } from "lucide-react";
import { DEFAULT_IMAGES } from "@/config/constants";

const SPEED = 1;

export default function MarqueeSlider() {
  const { data: events, isLoading } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  const sliderRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const slideOffsetRef = useRef(0);
  const halfTrackWidthRef = useRef(0);
  const dragStateRef = useRef({
    isDragging: false,
    startX: 0,
    startOffset: 0,
  });

  const items = events || [];
  const duplicatedItems = [...items, ...items, ...items, ...items]; // Quadruple the items for smoother scrolling

  const normalizeOffset = (value: number) => {
    const halfWidth = halfTrackWidthRef.current;
    if (!halfWidth) return value;
    return ((value % halfWidth) + halfWidth) % halfWidth;
  };

  const applyTransform = () => {
    const track = trackRef.current;
    if (!track) return;

    track.style.transform = `translate3d(${-slideOffsetRef.current}px, 0, 0)`;
  };

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const measureTrack = () => {
      halfTrackWidthRef.current = track.scrollWidth / 2;
      slideOffsetRef.current = normalizeOffset(slideOffsetRef.current);
      applyTransform();
    };

    const tick = () => {
      if (!dragStateRef.current.isDragging) {
        slideOffsetRef.current = normalizeOffset(slideOffsetRef.current + SPEED);
        applyTransform();
      }

      animationFrameRef.current = requestAnimationFrame(tick);
    };

    measureTrack();
    animationFrameRef.current = requestAnimationFrame(tick);
    window.addEventListener("resize", measureTrack);

    return () => {
      window.removeEventListener("resize", measureTrack);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 && event.pointerType === "mouse") return;
    const slider = sliderRef.current;
    if (!slider) return;

    dragStateRef.current.isDragging = true;
    dragStateRef.current.startX = event.clientX;
    dragStateRef.current.startOffset = slideOffsetRef.current;
    slider.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const slider = sliderRef.current;
    const { isDragging, startX, startOffset } = dragStateRef.current;
    if (!slider || !isDragging) return;

    event.preventDefault();
    const deltaX = event.clientX - startX;
    slideOffsetRef.current = normalizeOffset(startOffset - deltaX);
    applyTransform();
  };

  const stopDragging = (event: React.PointerEvent<HTMLDivElement>) => {
    const slider = sliderRef.current;
    if (!slider) return;

    dragStateRef.current.isDragging = false;
    if (slider.hasPointerCapture(event.pointerId)) {
      slider.releasePointerCapture(event.pointerId);
    }
  };

  if (isLoading) {
    return (
      <div className="relative w-full bg-white py-12 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primaryOrange" />
      </div>
    );
  }

  return (
    <div
      ref={sliderRef}
      className="relative w-full cursor-grab touch-pan-y select-none overflow-hidden bg-white active:cursor-grabbing"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={stopDragging}
      onPointerCancel={stopDragging}
    >
      <div ref={trackRef} className="flex w-max pt-12 will-change-transform">
        {duplicatedItems.map((event, index) => (
          <div className="mx-4 w-56 shrink-0 sm:w-64 lg:w-72" key={`event-${event.id}-${index}`}>
            <Link to={`/event/${event.id}`}>
              <div className="h-72 w-full overflow-hidden rounded bg-zinc-100 sm:h-80 lg:h-96 hover:opacity-90 transition-opacity">
                <img
                  src={event.imageUrl || DEFAULT_IMAGES.EVENT}
                  alt={event.name}
                  draggable={false}
                  className="h-full w-full object-cover"
                />
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

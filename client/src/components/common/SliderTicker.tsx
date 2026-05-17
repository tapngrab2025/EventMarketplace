import { useEffect, useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Event } from "@shared/schema";
import { Link } from "wouter";
import { Loader2 } from "lucide-react";
import { DEFAULT_IMAGES } from "@/config/constants";

const SPEED = 1;
const EMPTY_EVENTS: Event[] = [];

export default function MarqueeSlider() {
  const { data: events, isLoading } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  const sliderRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const slideOffsetRef = useRef(0);
  const loopWidthRef = useRef(0);
  const dragStateRef = useRef({
    isDragging: false,
    isPressed: false,
    wasDragging: false,
    startX: 0,
    startOffset: 0,
  });

  const items = events ?? EMPTY_EVENTS;
  const repeatCount = items.length > 0 && items.length < 4 ? 6 : 4;
  const duplicatedItems = useMemo(
    () => Array.from({ length: repeatCount }).flatMap(() => items),
    [items, repeatCount],
  );

  const normalizeOffset = (value: number) => {
    const loopWidth = loopWidthRef.current;
    if (!loopWidth) return value;
    return ((value % loopWidth) + loopWidth) % loopWidth;
  };

  const applyTransform = () => {
    const track = trackRef.current;
    if (!track) return;

    track.style.transform = `translate3d(${-slideOffsetRef.current}px, 0, 0)`;
  };

  useEffect(() => {
    const track = trackRef.current;
    const slider = sliderRef.current;
    if (!track || !slider || duplicatedItems.length === 0) return;

    const measureTrack = () => {
      loopWidthRef.current = track.scrollWidth / repeatCount;
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

    const resizeObserver =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(measureTrack) : null;

    measureTrack();
    resizeObserver?.observe(slider);
    resizeObserver?.observe(track);
    animationFrameRef.current = requestAnimationFrame(tick);
    window.addEventListener("resize", measureTrack);

    return () => {
      window.removeEventListener("resize", measureTrack);
      resizeObserver?.disconnect();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [duplicatedItems.length, repeatCount]);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 && event.pointerType === "mouse") return;
    
    dragStateRef.current.isPressed = true;
    dragStateRef.current.isDragging = false;
    dragStateRef.current.startX = event.clientX;
    dragStateRef.current.startOffset = slideOffsetRef.current;
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const slider = sliderRef.current;
    if (!slider || !dragStateRef.current.isPressed) return;

    const deltaX = event.clientX - dragStateRef.current.startX;
    
    // Only start dragging if moved more than 5 pixels
    if (!dragStateRef.current.isDragging && Math.abs(deltaX) > 5) {
      dragStateRef.current.isDragging = true;
      slider.setPointerCapture(event.pointerId);
    }

    if (dragStateRef.current.isDragging) {
      event.preventDefault();
      slideOffsetRef.current = normalizeOffset(dragStateRef.current.startOffset - deltaX);
      applyTransform();
    }
  };

  const stopDragging = (event: React.PointerEvent<HTMLDivElement>) => {
    const slider = sliderRef.current;
    if (!slider) return;

    if (dragStateRef.current.isDragging && slider.hasPointerCapture(event.pointerId)) {
      slider.releasePointerCapture(event.pointerId);
    }
    
    dragStateRef.current.wasDragging = dragStateRef.current.isDragging;
    dragStateRef.current.isPressed = false;
    dragStateRef.current.isDragging = false;

    // Reset wasDragging after a short delay so the click handler can see it
    setTimeout(() => {
      dragStateRef.current.wasDragging = false;
    }, 10);
  };

  if (isLoading) {
    return (
      <div className="relative flex w-full items-center justify-center bg-white py-8 sm:py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primaryOrange" />
      </div>
    );
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <div
      ref={sliderRef}
      aria-label="Featured events"
      className="relative w-full cursor-grab touch-pan-y select-none overflow-hidden bg-white active:cursor-grabbing"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={stopDragging}
      onPointerCancel={stopDragging}
    >
      <div
        ref={trackRef}
        className="flex w-full min-w-0 max-w-[100vw] pt-8 will-change-transform sm:pt-10 lg:pt-12"
      >
        {duplicatedItems.map((event, index) => (
          <div
            className="mx-2 w-[clamp(8.75rem,44vw,13rem)] shrink-0 sm:mx-3 sm:w-56 md:w-64 lg:mx-4 lg:w-72"
            key={`event-${event.id}-${index}`}
          >
            <Link 
              to={`/event/${event.id}`}
              onClick={(e) => {
                if (dragStateRef.current.wasDragging) {
                  e.preventDefault();
                }
              }}
            >
              <div className="aspect-[3/4] w-full overflow-hidden rounded bg-zinc-100 transition-opacity hover:opacity-90">
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

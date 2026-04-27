import { useEffect, useRef } from "react";
import event1 from "@/assets/mainslider/event1.webp";
import event2 from "@/assets/mainslider/event2.webp";
import event3 from "@/assets/mainslider/event3.webp";
import event4 from "@/assets/mainslider/event4.webp";
import event5 from "@/assets/mainslider/event5.webp";
import event6 from "@/assets/mainslider/event6.webp";
import event7 from "@/assets/mainslider/event7.webp";

const SPEED = 1;

const items = [event1, event2, event3, event4, event5, event6, event7];
const duplicatedItems = [...items, ...items];

export default function MarqueeSlider() {
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
        {duplicatedItems.map((image, index) => (
          <div className="mx-4 w-56 shrink-0 sm:w-64 lg:w-72" key={`${image}-${index}`}>
            <div className="h-72 w-full overflow-hidden rounded bg-zinc-100 sm:h-80 lg:h-96">
              <img
                src={image}
                alt={`Slider image ${index + 1}`}
                draggable={false}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

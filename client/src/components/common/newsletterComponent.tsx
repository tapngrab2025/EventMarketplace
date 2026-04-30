import { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";

import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const CTA_VIDEO_URL =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260210_031346_d87182fb-b0af-4273-84d1-c6fd17d6bf0f.mp4";

export function NewsletterComponent() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [subscriber, setSubscriber] = useState("");

  const submitSubscriber = useMutation({
    mutationFn: async () => {
      if (!subscriber.trim()) {
        throw new Error("Please enter an email address");
      }

      if (
        !subscriber.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
      ) {
        throw new Error("Please enter a valid email address");
      }

      const res = await apiRequest("POST", "/api/subscribers", {
        email: subscriber.trim().toLowerCase(),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to subscribe");
      }

      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "You have been subscribed successfully!",
        variant: "default",
      });
      setSubscriber("");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      setSubscriber("");
    },
  });

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;

    const playVideo = async () => {
      try {
        await video.play();
      } catch {
        // Some browsers defer autoplay until the media is ready.
      }
    };

    void playVideo();
    video.addEventListener("canplay", playVideo);

    return () => {
      video.removeEventListener("canplay", playVideo);
    };
  }, []);

  return (
    <section className="relative h-[75dvh] max-w-7xl mx-auto flex justify-center overflow-hidden bg-[#2b2344]">
      <video
        ref={videoRef}
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        src={CTA_VIDEO_URL}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-[#050914]/55" aria-hidden="true" />

      <section className="relative z-10 mx-auto flex h-full w-full max-w-7xl flex-col items-center justify-center px-6 text-center">
        <div className="mx-auto max-w-2xl text-center">
          <div className="text-xs font-semibold uppercase tracking-[0.25em] text-orange-500">
            Newsletter
          </div>

          <h2 className="mt-4 font-serif text-4xl leading-tight tracking-tight text-white sm:text-5xl">
            Get the Best Event Drops in Your Inbox
          </h2>
        </div>

        <p className="mt-6 max-w-xl text-base font-normal leading-8 text-white sm:text-lg">
          Be first to hear about new events, featured grabs, vendor updates, and
          limited-time offers curated for your next night out.
        </p>

        <form
          className="mt-9 flex w-full max-w-xl flex-col gap-3 rounded-[10px] border border-white/15 bg-white/10 p-2 backdrop-blur sm:flex-row"
          onSubmit={(event) => {
            event.preventDefault();
            submitSubscriber.mutate();
          }}
        >
          <label htmlFor="newsletter-email" className="sr-only">
            Email address
          </label>
          <Input
            id="newsletter-email"
            type="email"
            placeholder="Enter your email"
            value={subscriber}
            onChange={(event) => setSubscriber(event.target.value)}
            className="h-12 min-w-0 flex-1 rounded-[8px] border border-white/15 bg-white px-4 text-base text-zinc-900 outline-none transition placeholder:text-zinc-500 focus:border-[#7b39fc] focus:ring-2 focus:ring-[#7b39fc]/30"
          />
          <Button
            type="submit"
            variant="outline"
            disabled={submitSubscriber.isPending}
            className="h-12 rounded-[8px] border-none bg-[#7b39fc] px-7 text-base font-medium text-white transition hover:bg-[#8b50ff] hover:text-white disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitSubscriber.isPending ? "Subscribing..." : "Subscribe"}
          </Button>
        </form>
      </section>
    </section>
  );
}

export default NewsletterComponent;

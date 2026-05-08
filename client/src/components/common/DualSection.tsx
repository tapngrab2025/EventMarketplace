import { Link } from "wouter";
import { Images } from "@/config/images";

export default function DualSection() {
  return (
    <section className="overflow-hidden">
      <div className="mx-auto grid w-full max-w-7xl border border-t-0 border-zinc-200 bg-white lg:grid-cols-[1.1fr_0.9fr]">
        <div className="flex items-center px-6 py-12 sm:px-10 lg:px-16 lg:py-20">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-orange-500">
              About Tap & Grab
            </p>

            <h2 className="mt-5 max-w-xl font-serif text-4xl leading-tight tracking-tight text-zinc-900">
              We make discovering events and claiming the best grabs feel easy.
            </h2>

            <p className="mt-4 text-lg text-zinc-500">
              Built for people who want to move fast and never miss out.
            </p>

            <p className="mt-8 max-w-xl text-base leading-8 text-zinc-600">
              Tap & Grab connects people with what&apos;s happening right now,
              from standout events to limited-time offers worth acting on. Our
              goal is simple: help you discover more, book faster, and grab the
              moments that matter without the usual friction.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/about"
                className="inline-flex items-center justify-center rounded border border-orange-500 bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition hover:border-orange-400 hover:bg-orange-400"
              >
                About Us
              </Link>

              <Link
                href="/about#learn-more"
                className="inline-flex items-center justify-center rounded border border-zinc-200 px-6 py-3 text-sm font-semibold text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>

        <div className="relative xl:p-12">
          <img
            src={Images.dualSection}
            alt="Tap and Grab featured section artwork"
            className="w-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}

import { Link } from "wouter";
import { Images } from "@/config/images";

export default function ReverseDualSection() {
  return (
    <section className="overflow-hidden">
      <div className="mx-auto grid w-full max-w-7xl border border-t-0 border-zinc-200 bg-white lg:grid-cols-[0.9fr_1.1fr]">
        <div className="order-2 relative min-h-[320px] overflow-hidden sm:min-h-[420px] lg:order-1">
          <img
            src={Images.dualReverse}
            alt="Tap and Grab community experience artwork"
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>

        <div className="order-1 flex items-center px-6 py-12 sm:px-10 lg:order-2 lg:px-16 lg:py-20">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-orange-500">
              Why Choose Us
            </p>

            <h2 className="mt-5 max-w-xl font-serif text-4xl leading-tight tracking-tight text-zinc-900">
              One place to find what&apos;s trending, useful, and worth
              grabbing.
            </h2>

            <p className="mt-4 text-lg text-zinc-500">
              From fresh events to limited deals, we help people act at the
              right time.
            </p>

            <p className="mt-8 max-w-xl text-base leading-8 text-zinc-600">
              Tap & Grab is built to keep discovery simple. We spotlight
              experiences, offers, and timely opportunities in a way that feels
              quick, clear, and exciting, so users can spend less time searching
              and more time enjoying what they find.
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
      </div>
    </section>
  );
}

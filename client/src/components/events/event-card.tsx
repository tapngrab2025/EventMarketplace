import { Event } from "@shared/schema";
import { CalendarDays, CheckCircle2, MapPin, Tag } from "lucide-react";
import { DEFAULT_IMAGES } from "@/config/constants";
import { Link } from "wouter";

export default function EventCard({ event }: { event: Event }) {
  const dateFormatter = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Link to={`/event/${event.id}`} className="block h-full">
      <article className="group flex h-full min-h-[390px] flex-col overflow-hidden rounded border border-zinc-200 bg-white transition duration-300">
        <div className="relative aspect-[1/1] overflow-hidden">
          <img
            src={event.imageUrl || DEFAULT_IMAGES.EVENT}
            alt={event.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        </div>

        <div className="flex flex-1 flex-col px-4 pt-3">
          <div className="flex items-start justify-between gap-3">
            <h3 className="line-clamp-1 text-base font-semibold leading-snug text-zinc-900">
              {event.name}
            </h3>
            <span className="shrink-0 text-xs font-semibold text-teal-500">
              #{event.id}
            </span>
          </div>

          <p className="my-3 line-clamp-3 text-sm font-medium text-teal-500">
            {event.description}
          </p>

          <div className="space-y-1.5">
            <div className="flex items-start gap-3 text-sm text-zinc-600">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
              <span className="line-clamp-2">{event.location}</span>
            </div>

            <p className="line-clamp-1 pl-7 text-sm text-zinc-600">
              <span className="font-semibold text-zinc-900">City:</span>{" "}
              {event.city || "City not available"}
            </p>

            <div className="flex items-start gap-3 text-sm text-zinc-600">
              <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
              <span>
                {dateFormatter.format(new Date(event.startDate))} -{" "}
                {dateFormatter.format(new Date(event.endDate))}
              </span>
            </div>

            <div className="flex items-start gap-3 text-sm text-zinc-600">
              <Tag className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
              <span>
                <span className="font-semibold text-zinc-900">Vendor:</span>{" "}
                #{event.vendorId}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 px-4 pb-4 pt-4 text-sm">
          <span className="inline-flex items-center gap-1.5 font-medium text-zinc-600">
            <CheckCircle2 className="h-4 w-4 text-orange-500" />
            {event.approved ? "Approved" : "Pending"}
          </span>
          <span className="font-semibold text-zinc-900">
            {event.archived ? "Archived" : "Active"}
          </span>
        </div>
      </article>
    </Link>
  );
}

import { Event } from "@shared/schema";
import { Button } from "@/components/ui/button";
import {
  CalendarDays,
  CheckCircle,
  CheckCircle2,
  Clock3,
  Loader2,
  MapPin,
} from "lucide-react";
import { UseMutationResult } from "@tanstack/react-query";

interface PendingEventsProps {
  pendingEvents?: Event[];
  approveEvent: UseMutationResult<any, Error, number>;
}

export default function PendingEvents({
  pendingEvents,
  approveEvent,
}: PendingEventsProps) {
  const events = pendingEvents ?? [];

  return (
    <section className="rounded-lg border border-[#e4e1da] bg-white p-4 lg:p-5">
      <div className="flex flex-col gap-4 border-b border-[#e4e1da] pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#f3f4f6] text-[#111936]">
            <CalendarDays className="h-[18px] w-[18px]" />
          </div>
          <div>
            <h2 className="text-base font-bold tracking-normal text-[#2f3137]">
              Pending Event Approvals
            </h2>
            <p className="text-[13px] text-[#86827a]">
              Review event submissions before they go live.
            </p>
          </div>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded border border-[#F59E0B]/20 bg-[#F59E0B]/10 px-3 py-1 text-xs font-semibold text-[#B45309]">
          <Clock3 className="h-3.5 w-3.5" />
          {events.length} pending
        </span>
      </div>

      <div className="mt-4 grid gap-3">
        {events.length === 0 ? (
          <div className="rounded-lg border border-dashed border-[#dedbd3] bg-[#fafafa] px-5 py-8 text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-[#22C55E]/10 text-[#15803D]">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-sm font-bold text-[#2f3137]">
              No pending events
            </h3>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-[#86827a]">
              Every submitted event has been reviewed.
            </p>
          </div>
        ) : (
          events.map((event) => (
            <article
              key={event.id}
              className="rounded-lg border border-[#e4e1da] bg-white p-4 shadow-sm transition duration-200 hover:border-[#cbc7bd]"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-bold tracking-normal text-[#2f3137]">
                      {event.name}
                    </h3>
                    <span className="rounded-full bg-[#F59E0B]/10 px-2.5 py-1 text-xs font-semibold text-[#B45309]">
                      Awaiting review
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-[#86827a]">
                    {event.description}
                  </p>
                  <div className="mt-4 grid gap-3 text-[13px] text-[#5f636d] sm:grid-cols-2">
                    <div className="flex items-center gap-2 rounded-lg bg-[#f8f8f6] px-3 py-2">
                      <MapPin className="h-4 w-4 text-[#111936]" />
                      <span className="truncate">{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2 rounded-lg bg-[#f8f8f6] px-3 py-2">
                      <CalendarDays className="h-4 w-4 text-[#111936]" />
                      <span>
                        {formatDate(event.startDate)} to{" "}
                        {formatDate(event.endDate)}
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => approveEvent.mutate(event.id)}
                  disabled={approveEvent.isPending}
                  className="h-10 rounded-lg bg-[#111936] px-4 text-sm font-semibold text-white hover:bg-[#172242]"
                >
                  {approveEvent.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4" />
                  )}
                  Approve
                </Button>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

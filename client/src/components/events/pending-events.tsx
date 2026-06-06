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

export default function PendingEvents({ pendingEvents, approveEvent }: PendingEventsProps) {
  const events = pendingEvents ?? [];

  return (
    <section className="rounded-[20px] border border-slate-200/80 bg-white/85 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)] backdrop-blur-xl lg:p-6">
      <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0EA5A4]/10 text-[#0EA5A4]">
            <CalendarDays className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-normal text-slate-950">Pending Event Approvals</h2>
            <p className="text-sm text-slate-500">Review event submissions before they go live.</p>
          </div>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[#F59E0B]/20 bg-[#F59E0B]/10 px-3 py-1 text-xs font-semibold text-[#B45309]">
          <Clock3 className="h-3.5 w-3.5" />
          {events.length} pending
        </span>
      </div>

      <div className="mt-5 grid gap-4">
        {events.length === 0 ? (
          <div className="rounded-[18px] border border-dashed border-slate-200 bg-slate-50/80 px-6 py-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#22C55E]/10 text-[#15803D]">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-base font-bold text-slate-950">No pending events</h3>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
              Every submitted event has been reviewed.
            </p>
          </div>
        ) : (
          events.map((event) => (
            <article
              key={event.id}
              className="rounded-[18px] border border-slate-200/80 bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(15,23,42,0.08)] sm:p-5"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-bold tracking-normal text-slate-950">{event.name}</h3>
                    <span className="rounded-full bg-[#F59E0B]/10 px-2.5 py-1 text-xs font-semibold text-[#B45309]">
                      Awaiting review
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{event.description}</p>
                  <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
                    <div className="flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2">
                      <MapPin className="h-4 w-4 text-[#0EA5A4]" />
                      <span className="truncate">{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2">
                      <CalendarDays className="h-4 w-4 text-[#0EA5A4]" />
                      <span>
                        {formatDate(event.startDate)} to {formatDate(event.endDate)}
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => approveEvent.mutate(event.id)}
                  disabled={approveEvent.isPending}
                  className="h-11 rounded-2xl bg-[#0EA5A4] px-5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(14,165,164,0.28)] hover:bg-[#0B8F8E]"
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

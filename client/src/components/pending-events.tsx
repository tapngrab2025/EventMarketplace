import { Event } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle } from "lucide-react";
import { UseMutationResult } from "@tanstack/react-query";

interface PendingEventsProps {
  pendingEvents?: Event[];
  approveEvent: UseMutationResult<any, Error, number>;
}

export default function PendingEvents({ pendingEvents, approveEvent }: PendingEventsProps) {
  return (
    <section>
      <h2 className="text-2xl font-semibold mb-6">Pending Events</h2>
      <div className="grid gap-6">
        {pendingEvents?.length === 0 ? (
          <p className="text-muted-foreground">No pending events</p>
        ) : (
          pendingEvents?.map((event) => (
            <Card key={event.id}>
              <CardHeader>
                <CardTitle>{event.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{event.description}</p>
                <div className="flex justify-between items-center">
                  <div>
                    <p>Location: {event.location}</p>
                    <p>Dates: {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}</p>
                  </div>
                  <Button
                    onClick={() => approveEvent.mutate(event.id)}
                    disabled={approveEvent.isPending}
                  >
                    {approveEvent.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    Approve
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </section>
  );
}
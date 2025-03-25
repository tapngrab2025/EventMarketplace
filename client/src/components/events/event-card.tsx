import { Event } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, MapPin } from "lucide-react";
import { Link } from "wouter";

export default function EventCard({ event }: { event: Event }) {
  return (
    <Link to={`/event/${event.id}`}>
      <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="line-clamp-1">{event.name}</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow">
          <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
            {event.description}
          </p>
          <div className="space-y-2">
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 mr-2" />
              <span>{event.location}</span>
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <CalendarDays className="h-4 w-4 mr-2" />
              <span>
                {new Date(event.startDate).toLocaleDateString()} -{" "}
                {new Date(event.endDate).toLocaleDateString()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

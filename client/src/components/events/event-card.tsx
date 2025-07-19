import { Event } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, MapPin } from "lucide-react";
import { Link } from "wouter";

export default function EventCard({ event }: { event: Event }) {
  return (
    <Link to={`/event/${event.id}`}>
      <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="line-clamp-1 text-primaryGreen">{event.name}</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow">
          <p className="text-primaryGreen text-sm line-clamp-2 mb-4 ml-7">
            {event.description}
          </p>
          <div className="space-y-2">
            <div className="flex text-sm text-muted-foreground">
              <MapPin className="h-6 w-6 mr-2 text-teal-500" />
              <span>{event.location}</span>
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <CalendarDays className="h-5 w-5 mr-2 text-teal-500" />
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

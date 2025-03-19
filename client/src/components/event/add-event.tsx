import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { EventForm } from "./event-form";

interface AddEventProps {
  eventDialogOpen: boolean;
  setEventDialogOpen: (open: boolean) => void;
}

export function AddEvent({ eventDialogOpen, setEventDialogOpen }: AddEventProps) {
  return (
    <Dialog open={eventDialogOpen} onOpenChange={setEventDialogOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Event
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Event</DialogTitle>
        </DialogHeader>
        <EventForm onSuccess={() => setEventDialogOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
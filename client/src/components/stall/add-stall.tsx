import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { StallForm } from "./stall-form"
import { Event } from "@shared/schema";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AddStallProps {
  stallDialogOpen: boolean;
  setStallDialogOpen: (open: boolean) => void;
  event: Event | null;
  setSelectedEvent: (event: Event | null) => void;
  selectedEvent: Event | null;
}

export function AddStall({ stallDialogOpen, setStallDialogOpen, event, setSelectedEvent, selectedEvent }: AddStallProps) {
  return (
    <Dialog
    open={stallDialogOpen && selectedEvent?.id === event.id}
    onOpenChange={(open) => {
      setStallDialogOpen(open);
      if (open) setSelectedEvent(event);
      if (!open) setSelectedEvent(null);
    }}
    >
        <DialogTrigger asChild>
            <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Stall
            </Button>
        </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Stall to {selectedEvent?.name}</DialogTitle>
          <DialogDescription>
            Create a new stall for this event.
          </DialogDescription>
        </DialogHeader>
        {selectedEvent && (
          <StallForm
            event={selectedEvent}
            onSuccess={() => {
              setStallDialogOpen(false);
              setSelectedEvent(null);
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
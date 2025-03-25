import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { EditEventForm } from "./event-edit-form";

interface EditEventProps {
  eventDialogOpen: boolean;
  setEventDialogOpen: (open: boolean) => void;
  eventId: number;
  setEventId: (id: number | null) => void;
}

export function EditEvent({ eventDialogOpen, setEventDialogOpen, eventId, setEventId }: EditEventProps) {
  return (
    <Dialog open={eventDialogOpen} onOpenChange={setEventDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Event</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <EditEventForm
          eventId={eventId}
          onClose={() => {
            setEventDialogOpen(false);
            setEventId(null)
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
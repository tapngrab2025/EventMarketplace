import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { StallEditForm } from "./stall-edit-form";

interface EditStallProps {
  stallDialogOpen: boolean;
  setStallDialogOpen: (open: boolean) => void;
  stallId: number;
  setStallId: (id: number | null) => void;
}

export function EditStall({ stallDialogOpen, setStallDialogOpen, stallId, setStallId }: EditStallProps) {
  return (
    <Dialog open={stallDialogOpen} onOpenChange={setStallDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Stall</DialogTitle>
          <DialogDescription>
            Make changes to your stall details below.
          </DialogDescription>
        </DialogHeader>
        <StallEditForm
          stallId={stallId}
          onClose={() => {
            setStallDialogOpen(false);
            setStallId(null);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
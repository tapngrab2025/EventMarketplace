import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

interface EditDialogProps<T extends z.ZodType> {
  title: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schema: T;
  defaultValues: z.infer<T>;
  onSubmit: (values: z.infer<T>) => void;
  children: React.ReactNode;
}

export function EditDialog<T extends z.ZodType>({
  title,
  open,
  onOpenChange,
  schema,
  defaultValues,
  onSubmit,
  children,
}: EditDialogProps<T>) {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {children}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
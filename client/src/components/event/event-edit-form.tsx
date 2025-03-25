import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { FileDropzone } from "@/components/ui/file-dropzone";
import { Event, Stall, Product, insertEventSchema, insertStallSchema, insertProductSchema } from "@shared/schema";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";

interface EditDialogProps {
  eventId: number;
  onClose: () => void;
}

export function EditEventForm({ eventId, onClose }: EditDialogProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const { data: event } = useQuery<Event>({
    queryKey: [`/api/events/${eventId}`],
    enabled: !!eventId,
  });

  const form = useForm({
    resolver: zodResolver(insertEventSchema),
    defaultValues: {
      name: "",
      description: "",
      location: "",
      imageUrl: "",
      startDate: "",
      endDate: "",
    },
  });

  useEffect(() => {
    if (event) {
      // Format dates to YYYY-MM-DD for input type="date"
      const startDate = new Date(event.startDate).toISOString().split('T')[0];
      const endDate = new Date(event.endDate).toISOString().split('T')[0];

      form.reset({
        ...event,
        startDate,
        endDate,
      });
    }
  }, [event, form]);

  const editEvent = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("PUT", `/api/events/${eventId}`, data);
      return res.json();
    },
    onSuccess() {
      toast({
        title: "Event updated",
        description: "The event has been updated successfully",
        // variant: "success",
      });
      onClose();
      queryClient.invalidateQueries({ queryKey: [`/api/events/${eventId}`] });
    },
  });

  const onSubmit = form.handleSubmit((data) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create an event",
        variant: "destructive",
      });
      return;
    }
    editEvent.mutate(data);
  });

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Image</FormLabel>
              <FormControl>
                <FileDropzone
                  onUploadComplete={field.onChange}
                  accept={{
                    'image/*': ['.png', '.jpg', '.jpeg', '.gif']
                  }}
                />
              </FormControl>
              {field.value && (
                <div className="mt-2">
                  <img
                    src={field.value}
                    alt="Preview"
                    className="w-full h-32 object-cover rounded-md"
                  />
                </div>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="startDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Start Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="endDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>End Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="w-full"
          disabled={editEvent.isPending}
        >
          {editEvent.isPending && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Update Event
        </Button>
      </form>
    </Form>
  );
}
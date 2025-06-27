import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertEventSchema } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { FileDropzone } from "@/components/ui/file-dropzone";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { LocationPicker } from "@/components/location-picker";

interface EventFormProps {
  onSuccess: () => void;
}

export function EventForm({ onSuccess }: { onSuccess: () => void }) {
    const { toast } = useToast();
    const { user } = useAuth();
  
    const form = useForm({
      resolver: zodResolver(insertEventSchema),
      defaultValues: {
        name: "",
        description: "",
        location: "",
        imageUrl: "",
        startDate: new Date().toISOString().split("T")[0],
        endDate: new Date().toISOString().split("T")[0],
        vendorId: user?.id,
      },
    });
  
    const createEvent = useMutation({
      mutationFn: async (values: any) => {
        if (!user?.id) {
          throw new Error("You must be logged in to create an event");
        }
  
        const formattedValues = {
          ...values,
          vendorId: user.id,
          startDate: new Date(values.startDate).toISOString(),
          endDate: new Date(values.endDate).toISOString(),
        };
  
        // console.log('Submitting event:', formattedValues);
        const res = await apiRequest("POST", "/api/events", formattedValues);
  
        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.message || "Failed to create event");
        }
  
        return res.json();
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/events"] });
        toast({
          title: "Success",
          description: "Event created successfully",
        });
        form.reset();
        onSuccess();
      },
      onError: (error: any) => {
        console.error('Event creation error:', error);
        toast({
          title: "Error",
          description: error.message || "Failed to create event",
          variant: "destructive",
        });
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
      const missingFields = [];
      if (!data.name) missingFields.push("Event Name");
      if (!data.description) missingFields.push("Description");
      if (!data.location) missingFields.push("Location");
      if (!data.startDate) missingFields.push("Start Date");
      if (!data.endDate) missingFields.push("End Date");

      if (missingFields.length > 0) {
        toast({
          title: "Error",
          description: `Please fill in the following fields: ${missingFields.join(", ")}`,
          variant: "destructive",
        });
        return;
      }
      createEvent.mutate(data);
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
                {/* <Input {...field} /> */}
                  <LocationPicker
                    defaultValue={field.value}
                    onLocationSelect={(location) => {
                      field.onChange(location.address);
                    }}
                  />
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
            disabled={createEvent.isPending}
          >
            {createEvent.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Create Event
          </Button>
        </form>
      </Form>
    );
  }
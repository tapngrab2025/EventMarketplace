// Move the StallForm component hereimport { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
import { LocationPicker } from "@/components/location-picker";

interface AddStallDialogProps {
    event: Event;
    onSuccess: () => void;
}

export function  StallForm({ event, onSuccess }: AddStallDialogProps ) {
    const { user } = useAuth();
    const { toast } = useToast();
  
    const form = useForm({
      resolver: zodResolver(insertStallSchema),
      defaultValues: {
        name: "",
        description: "",
        location: "",
        imageUrl: "",
        eventId: event.id,
        vendorId: user?.id,
      },
    });
  
    const createStall = useMutation({
      mutationFn: async (data: any) => {
        if (!user?.id) {
          throw new Error("You must be logged in to create a stall");
        }
  
        const formattedValues = {
          ...data,
          eventId: event.id,
          vendorId: user.id,
          approved: false,
        };
  
        // console.log('Submitting stall:', formattedValues);
        const res = await apiRequest("POST", "/api/stalls", formattedValues);
  
        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.message || "Failed to create stall");
        }
  
        return res.json();
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/stalls"] });
        toast({
          title: "Success",
          description: "Stall created successfully",
        });
        form.reset();
        onSuccess();
      },
      onError: (error: any) => {
        console.error('Stall creation error:', error);
        toast({
          title: "Error",
          description: error.message || "Failed to create stall",
          variant: "destructive",
        });
      },
    });
  
    const onSubmit = form.handleSubmit((data) => {
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to create a stall",
          variant: "destructive",
        });
        return;
      }
      createStall.mutate(data);
    });
  
    return (
      <Form {...form}>
        <form onSubmit={onSubmit} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stall Name</FormLabel>
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
                <FormLabel>Location in Venue</FormLabel>
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
                <FormLabel>Image</FormLabel>
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
          <Button type="submit" className="w-full" disabled={createStall.isPending}>
            {createStall.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Create Stall
          </Button>
        </form>
      </Form>
    );
  }
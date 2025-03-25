import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FileDropzone } from "@/components/ui/file-dropzone";
import { Stall, insertStallSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

interface EditStallFormProps {
  stallId: number;
  onClose: () => void;
}

export function StallEditForm({ stallId, onClose }: EditStallFormProps) {
  const { toast } = useToast();
  const { data: stall } = useQuery<Stall>({
    queryKey: [`/api/stalls/${stallId}`],
    enabled: !!stallId,
  });

  const form = useForm({
    resolver: zodResolver(insertStallSchema),
    defaultValues: {
      name: "",
      description: "",
      location: "",
      imageUrl: "",
    },
  });

  useEffect(() => {
    if (stall) {
      form.reset(stall);
    }
    console.log(stall);
  }, [stall, form]);

  const editStall = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("PUT", `/api/stalls/${stallId}`, data);
      return res.json();
    },
    onSuccess() {
      toast({
        title: "Stall updated",
        description: "The stall has been updated successfully",
      });
      onClose();
      // Invalidate both the specific stall and the stalls list
      queryClient.invalidateQueries({ queryKey: [`/api/stalls/${stallId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/stalls"] });
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => editStall.mutate(data))} className="space-y-4">
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
              <FormLabel>Stall Image</FormLabel>
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
        <Button
          type="submit"
          className="w-full"
          disabled={editStall.isPending}
        >
          {editStall.isPending && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Update Stall
        </Button>
      </form>
    </Form>
  );
}
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Event,
  Stall,
  Product,
  insertEventSchema,
  insertStallSchema,
  insertProductSchema,
} from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function VendorDashboard() {
  const { user } = useAuth();
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [stallDialogOpen, setStallDialogOpen] = useState(false);
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedStall, setSelectedStall] = useState<Stall | null>(null);
  const { toast } = useToast();

  const { data: events, isLoading: loadingEvents } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  const { data: stalls, isLoading: loadingStalls } = useQuery<Stall[]>({
    queryKey: ["/api/stalls"],
  });

  const { data: products, isLoading: loadingProducts } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const myEvents = events?.filter((event) => event.vendorId === user?.id);
  const myStalls = stalls?.filter((stall) => stall.vendorId === user?.id);
  const myProducts = products?.filter((product) =>
    myStalls?.some((stall) => stall.id === product.stallId)
  );

  if (loadingEvents || loadingStalls || loadingProducts) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">Vendor Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your events, stalls, and products
          </p>
        </header>

        <div className="grid gap-8">
          {/* Events Section */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">My Events</h2>
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
            </div>
            <div className="grid gap-6">
              {myEvents?.length === 0 ? (
                <p className="text-muted-foreground">No events created yet</p>
              ) : (
                myEvents?.map((event) => (
                  <Card key={event.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        {event.name}
                        <span
                          className={`text-sm px-2 py-1 rounded-full ${
                            event.approved
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {event.approved ? "Approved" : "Pending"}
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <img
                            src={event.imageUrl}
                            alt={event.name}
                            className="w-full h-48 object-cover rounded-md mb-4"
                          />
                          <p className="text-muted-foreground">
                            {event.description}
                          </p>
                          <p className="mt-2">Location: {event.location}</p>
                          <p>
                            Dates: {new Date(event.startDate).toLocaleDateString()}{" "}
                            - {new Date(event.endDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">Stalls</h3>
                            <Dialog
                              open={stallDialogOpen && selectedEvent?.id === event.id}
                              onOpenChange={(open) => {
                                setStallDialogOpen(open);
                                if (open) setSelectedEvent(event);
                                if (!open) setSelectedEvent(null);
                              }}
                            >
                              <DialogTrigger asChild>
                                <Button size="sm">
                                  <Plus className="h-4 w-4 mr-2" />
                                  Add Stall
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>
                                    Add Stall to {event.name}
                                  </DialogTitle>
                                </DialogHeader>
                                <StallForm
                                  event={event}
                                  onSuccess={() => {
                                    setStallDialogOpen(false);
                                    setSelectedEvent(null);
                                  }}
                                />
                              </DialogContent>
                            </Dialog>
                          </div>
                          {myStalls
                            ?.filter((stall) => stall.eventId === event.id)
                            .map((stall) => (
                              <Card key={stall.id} className="mb-4">
                                <CardHeader>
                                  <CardTitle className="text-base flex items-center justify-between">
                                    {stall.name}
                                    <Dialog
                                      open={productDialogOpen}
                                      onOpenChange={(open) => {
                                        setProductDialogOpen(open);
                                        if (open) setSelectedStall(stall);
                                      }}
                                    >
                                      <DialogTrigger asChild>
                                        <Button size="sm" variant="outline">
                                          <Plus className="h-4 w-4 mr-2" />
                                          Add Product
                                        </Button>
                                      </DialogTrigger>
                                      <DialogContent>
                                        <DialogHeader>
                                          <DialogTitle>
                                            Add Product to {stall.name}
                                          </DialogTitle>
                                        </DialogHeader>
                                        <ProductForm
                                          stall={stall}
                                          onSuccess={() =>
                                            setProductDialogOpen(false)
                                          }
                                        />
                                      </DialogContent>
                                    </Dialog>
                                  </CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="grid grid-cols-2 gap-2">
                                    {products
                                      ?.filter(
                                        (product) => product.stallId === stall.id
                                      )
                                      .map((product) => (
                                        <Card
                                          key={product.id}
                                          className="bg-muted"
                                        >
                                          <CardContent className="p-4">
                                            <img
                                              src={product.imageUrl}
                                              alt={product.name}
                                              className="w-full h-24 object-cover rounded-md mb-2"
                                            />
                                            <h4 className="font-medium">
                                              {product.name}
                                            </h4>
                                            <p className="text-sm text-muted-foreground">
                                              ${(product.price / 100).toFixed(2)} -{" "}
                                              {product.stock} left
                                            </p>
                                          </CardContent>
                                        </Card>
                                      ))}
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function EventForm({ onSuccess }: { onSuccess: () => void }) {
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
      
      console.log('Submitting event:', formattedValues);
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
              <FormLabel>Image URL</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
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

function StallForm({ event, onSuccess }: { event: Event; onSuccess: () => void }) {
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
      
      console.log('Submitting stall:', formattedValues);
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
              <FormLabel>Image URL</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
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

function ProductForm({ stall, onSuccess }: { stall: Stall; onSuccess: () => void }) {
  const { toast } = useToast();
  
  const form = useForm({
    resolver: zodResolver(insertProductSchema),
    defaultValues: {
      name: "",
      description: "",
      imageUrl: "",
      category: "souvenir",
      price: 0,
      stock: 0,
      stallId: stall.id,
    },
  });

  const createProduct = useMutation({
    mutationFn: async (data: any) => {
      const formattedData = {
        ...data,
        price: Math.round(Number(data.price) * 100), // Convert dollars to cents
        stock: Math.round(Number(data.stock)),
        stallId: stall.id,
      };
      
      console.log('Submitting product:', formattedData);
      const res = await apiRequest("POST", "/api/products", formattedData);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create product");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Success",
        description: "Product created successfully",
      });
      form.reset();
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create product",
        variant: "destructive",
      });
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => createProduct.mutate(data))}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Name</FormLabel>
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
          name="price"
          render={({ field: { onChange, ...field } }) => (
            <FormItem>
              <FormLabel>Price (in dollars)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  step="0.01"
                  onChange={(e) => onChange(Number(e.target.value))}
                  {...field}
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
              <FormLabel>Image URL</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <FormControl>
                <select
                  {...field}
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                >
                  <option value="souvenir">Souvenir</option>
                  <option value="giveaway">Giveaway</option>
                  <option value="promotional">Promotional</option>
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="stock"
          render={({ field: { onChange, ...field } }) => (
            <FormItem>
              <FormLabel>Stock</FormLabel>
              <FormControl>
                <Input 
                  type="number"
                  onChange={(e) => onChange(Number(e.target.value))}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="w-full"
          disabled={createProduct.isPending}
        >
          {createProduct.isPending && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Create Product
        </Button>
      </form>
    </Form>
  );
}
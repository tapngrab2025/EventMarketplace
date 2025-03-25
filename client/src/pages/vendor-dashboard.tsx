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
import { AddEvent } from "@/components/event/add-event";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Plus, Pencil } from "lucide-react";
import { useState } from "react";
import { DEFAULT_IMAGES } from "@/config/constants";
import { EditEvent } from "@/components/event/edit-event";
import { AddStall } from "@/components/stall/add-stall";
import { AddProduct } from "@/components/product/add-product";
import { EditStall } from "@/components/stall/edit-stall";
import { EditProduct } from "@/components/product/edit-product";

interface VendorDashboardProps {
  searchTerm?: string;
}

export default function VendorDashboard(
  { searchTerm = "" }: VendorDashboardProps
) {
  const { user } = useAuth();
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [stallDialogOpen, setStallDialogOpen] = useState(false);
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedStall, setSelectedStall] = useState<Stall | null>(null);
  const [eventEditDialogOpen, setEventEditDialogOpen] = useState(false);
  const [editEventId, setEditEventId] = useState<number | null>(null);
  const [editStallId, setEditStallId] = useState<number | null>(null);
  const [editProductId, setEditProductId] = useState<number | null>(null);

  const { data: events, isLoading: loadingEvents } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  const { data: stalls, isLoading: loadingStalls } = useQuery<Stall[]>({
    queryKey: ["/api/stalls"],
  });

  const { data: products, isLoading: loadingProducts } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  // First, filter products based on search term
  const matchedProducts = products?.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get stalls that either match the search term or contain matching products
  const matchedStalls = stalls?.filter((stall) => {
    const stallMatches = stall.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stall.description.toLowerCase().includes(searchTerm.toLowerCase());

    const hasMatchingProduct = matchedProducts?.some(
      (product) => product.stallId === stall.id
    );

    return (stallMatches || hasMatchingProduct) && stall.vendorId === user?.id;
  });

  // Get events that either match the search term or contain matching stalls
  const myEvents = events?.filter((event) => {
    const eventMatches = event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase());

    const hasMatchingStall = matchedStalls?.some(
      (stall) => stall.eventId === event.id
    );

    return (eventMatches || hasMatchingStall) && event.vendorId === user?.id;
  });

  // Filter stalls for display based on matched events
  const myStalls = matchedStalls?.filter((stall) =>
    myEvents?.some((event) => event.id === stall.eventId)
  );

  // Filter products for display based on matched stalls
  const myProducts = products?.filter((product) =>
    myStalls?.some((stall) => stall.id === product.stallId)
  );

  const otherEvents = events?.filter((event) => {
    const eventMatches = event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase());

    const hasMatchingStall = matchedStalls?.some(
      (stall) => stall.eventId != event.id
    );

    return (eventMatches || hasMatchingStall) && event.vendorId != user?.id;
  });

  // Filter products for display based on matched stalls
  const otherProducts = products?.filter((product) =>
    myStalls?.some((stall) => stall.id != product.stallId)
  );

  const otherStalls = matchedStalls?.filter((stall) =>
    myEvents?.some((event) => event.id != stall.eventId)
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
              <AddEvent
                eventDialogOpen={eventDialogOpen}
                setEventDialogOpen={setEventDialogOpen}
              />
            </div>
            <div className="grid gap-6">
              {myEvents?.length === 0 ? (
                <p className="text-muted-foreground">No events created yet</p>
              ) : (
                myEvents?.map((event) => (
                  <Card key={event.id}>
                    <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {event.name}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditEventId(event.id);
                            setEventEditDialogOpen(true);
                          }}
                        >
                          <Pencil/>
                          Edit
                        </Button>
                        <EditEvent
                          eventId={editEventId}
                          setEventId={setEditEventId}
                          eventDialogOpen={eventEditDialogOpen}
                          setEventDialogOpen={setEventEditDialogOpen}
                        />
                      </div>
                      <span className={`text-sm px-2 py-1 rounded-full ${event.approved ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                        {event.approved ? "Approved" : "Pending"}
                      </span>
                    </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <img
                            src={event.imageUrl || DEFAULT_IMAGES.EVENT}
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
                            <AddStall 
                              stallDialogOpen={stallDialogOpen}
                              setStallDialogOpen={setStallDialogOpen}
                              event={event}
                              selectedEvent={selectedEvent}
                              setSelectedEvent={setSelectedEvent}
                            />
                          </div>
                          {myStalls
                            ?.filter((stall) => stall.eventId === event.id)
                            .map((stall) => (
                              <Card key={stall.id} className="mb-4">
                                <CardHeader>
                                <CardTitle className="text-base flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    {stall.name}
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        setEditStallId(stall.id);
                                        setStallDialogOpen(true);
                                      }}
                                    >
                                      Edit
                                    </Button>
                                    <EditStall
                                      stallId={editStallId}
                                      setStallId={setEditStallId}
                                      stallDialogOpen={stallDialogOpen}
                                      setStallDialogOpen={setStallDialogOpen}
                                    />
                                  </div>
                                    <AddProduct
                                      productDialogOpen={productDialogOpen}
                                      setProductDialogOpen={setProductDialogOpen}
                                      stall={stall}
                                      selectedStall={selectedStall}
                                      setSelectedStall={setSelectedStall}
                                    />
                                  </CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="grid grid-cols-2 gap-2">
                                    {matchedProducts
                                      ?.filter(
                                        (product) => product.stallId === stall.id
                                      )
                                      .map((product) => (
                                        <Card
                                          key={product.id}
                                          className="bg-muted"
                                        >
                                          <CardContent className="p-4">
                                          <div className="flex items-center justify-between mb-2">
                                            <h4 className="font-medium">{product.name}</h4>
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              onClick={() => {
                                                setEditProductId(product.id);
                                                setProductDialogOpen(true);
                                              }}
                                            >
                                              Edit
                                            </Button>
                                            <EditProduct
                                              productId={editProductId}
                                              setProductId={setEditProductId}
                                              productDialogOpen={productDialogOpen}
                                              setProductDialogOpen={setProductDialogOpen}
                                            />
                                          </div>
                                            <img
                                              src={product.imageUrl || DEFAULT_IMAGES.PRODUCT}
                                              alt={product.name}
                                              className="w-full h-24 object-cover rounded-md mb-2"
                                            />
                                            <h4 className="font-medium">
                                              {product.name}
                                            </h4>
                                            <span
                                              className={`text-sm px-2 py-1 rounded-full ${product.approved
                                                ? "bg-green-100 text-green-700"
                                                : "bg-yellow-100 text-yellow-700"
                                                }`}
                                            >
                                              {product.approved ? "Approved" : "Pending"}
                                            </span>
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
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">Others Events</h2>
            </div>
            <div className="grid gap-6">
              {otherEvents?.length === 0 ? (
                <p className="text-muted-foreground">No events created yet</p>
              ) : (
                otherEvents?.map((event) => (
                  <Card key={event.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        {event.name}
                        <span
                          className={`text-sm px-2 py-1 rounded-full ${event.approved
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
                            src={event.imageUrl || DEFAULT_IMAGES.EVENT}
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
                            <AddStall 
                              stallDialogOpen={stallDialogOpen}
                              setStallDialogOpen={setStallDialogOpen}
                              event={event}
                              selectedEvent={selectedEvent}
                              setSelectedEvent={setSelectedEvent}
                            />
                          </div>
                          {otherStalls
                            ?.filter((stall) => stall.eventId === event.id)
                            .map((stall) => (
                              <Card key={stall.id} className="mb-4">
                                <CardHeader>
                                  <CardTitle className="text-base flex items-center justify-between">
                                    {stall.name}
                                    <AddProduct
                                      productDialogOpen={productDialogOpen}
                                      setProductDialogOpen={setProductDialogOpen}
                                      stall={stall}
                                      selectedStall={selectedStall}
                                      setSelectedStall={setSelectedStall}
                                    />
                                  </CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="grid grid-cols-2 gap-2">
                                    {otherProducts
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
                                              src={product.imageUrl || DEFAULT_IMAGES.PRODUCT}
                                              alt={product.name}
                                              className="w-full h-24 object-cover rounded-md mb-2"
                                            />
                                            <h4 className="font-medium">
                                              {product.name}
                                            </h4>
                                            <span
                                              className={`text-sm px-2 py-1 rounded-full ${product.approved
                                                ? "bg-green-100 text-green-700"
                                                : "bg-yellow-100 text-yellow-700"
                                                }`}
                                            >
                                              {product.approved ? "Approved" : "Pending"}
                                            </span>
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
import { Event, Stall, Product } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DEFAULT_IMAGES } from "@/config/constants";
import { AddStall } from "@/components/stall/add-stall";
import { AddProduct } from "@/components/product/add-product";

interface OtherEventsSectionProps {
  events?: Event[];
  stalls?: Stall[];
  products?: Product[];
  stallDialogOpen: boolean;
  setStallDialogOpen: (open: boolean) => void;
  selectedEvent: Event | null;
  setSelectedEvent: (event: Event | null) => void;
  productDialogOpen: boolean;
  setProductDialogOpen: (open: boolean) => void;
  selectedStall: Stall | null;
  setSelectedStall: (stall: Stall | null) => void;
}

export function OtherEventsSection({
  events = [],
  stalls = [],
  products = [],
  stallDialogOpen,
  setStallDialogOpen,
  selectedEvent,
  setSelectedEvent,
  productDialogOpen,
  setProductDialogOpen,
  selectedStall,
  setSelectedStall,
}: OtherEventsSectionProps) {
  return (
    <div className="grid gap-6">
      {events?.length === 0 ? (
        <p className="text-muted-foreground">No events created yet</p>
      ) : (
        events?.map((event) => (
          <Card key={event.id}>
            <CardHeader>
              <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <span className="text-xl">{event.name}</span>
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
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <img
                    src={event.imageUrl || DEFAULT_IMAGES.EVENT}
                    alt={event.name}
                    className="w-full h-48 md:h-64 object-cover rounded-md mb-4"
                  />
                  <p className="text-muted-foreground">{event.description}</p>
                  <p className="mt-2">Location: {event.location}</p>
                  <p>
                    Dates: {new Date(event.startDate).toLocaleDateString()} -{" "}
                    {new Date(event.endDate).toLocaleDateString()}
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
                  {stalls
                    ?.filter((stall) => stall.eventId === event.id)
                    .map((stall) => (
                      <Card key={stall.id} className="mb-4">
                        <CardHeader>
                          <CardTitle className="text-base flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                            <span>{stall.name}</span>
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
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-3">
                            {products
                              ?.filter((product) => product.stallId === stall.id)
                              .map((product) => (
                                <Card key={product.id} className="bg-muted">
                                  <CardContent className="p-4">
                                    <img
                                      src={product.imageUrl || DEFAULT_IMAGES.PRODUCT}
                                      alt={product.name}
                                      className="w-full h-32 sm:h-24 object-cover rounded-md mb-2"
                                    />
                                    <h4 className="font-medium">{product.name}</h4>
                                    <div className="flex flex-wrap items-center gap-2 mt-2">
                                      <span
                                        className={`text-sm px-2 py-1 rounded-full ${
                                          product.approved
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
                                    </div>
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
  );
}
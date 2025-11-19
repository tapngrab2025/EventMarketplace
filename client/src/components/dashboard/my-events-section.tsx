import { Event, Stall, Product } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pencil, Plus } from "lucide-react";
import { DEFAULT_IMAGES } from "@/config/constants";
import { Link } from "wouter";
import { EventCoupons } from "@/components/coupon/event-coupons";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";

interface MyEventsSectionProps {
  events?: Event[];
  stalls?: Stall[];
  products?: Product[];
  enableButton: boolean | false;
}

export function MyEventsSection({
  events = [],
  stalls = [],
  products = [],
  enableButton,
}: MyEventsSectionProps) {
  
  const { user } = useAuth();

  return (
    <div className="grid gap-6">
      {events?.length === 0 ? (
        <p className="text-muted-foreground">No events created yet</p>
      ) : (
        events?.map((event) => (
          <Card key={event.id} >
            <CardHeader>
              <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  {event.name}
                  {enableButton && (
                    <Link to={`/vendor/events/${event.id}/edit`}>
                      <Button><Pencil className="h-4 w-4 mr-2" />Edit Event</Button>
                    </Link>
                  )}
                </div>
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
                  
                  {/* Display coupons for this event */}
                  <div className="mt-4">
                    <EventCoupons eventId={event.id} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Stalls</h3>
                    {enableButton && (
                      <Link to={`/vendor/stalls/new/${event.id}`}>
                        <Button><Plus className="h-4 w-4 mr-2" />Add Stall</Button>
                      </Link>
                    )}
                  </div>
                  {stalls
                    ?.filter((stall) => stall.eventId === event.id)
                    .map((stall) => (
                      <Card key={stall.id} className="mb-4">
                        <CardHeader>
                          <CardTitle className="text-base flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                            <div className="flex flex-wrap items-center gap-2">
                              {stall.name}
                              {stall.vendorId === user?.id && (
                                <Link to={`/vendor/stalls/${stall.id}/edit`}>
                                  <Button><Pencil className="h-4 w-4 mr-2" />Edit Stall</Button>
                                </Link>
                              )}
                            </div>
                            {stall.vendorId === user?.id  && (
                              <Link to={`/vendor/products/new/${stall.id}`}>
                                <Button><Plus className="h-4 w-4 mr-2" />Add Product</Button>
                              </Link>
                            )}
                            {/* <pre className="text-xs overflow-auto max-h-32">
                              {JSON.stringify(stall, null, 2)}
                            </pre> */}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-3">
                            {products
                              ?.filter((product) => product.stallId === stall.id)
                              .map((product) => (
                                <Card key={product.id} className="bg-muted">
                                  <CardContent className="p-4">
                                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                                      <h4 className="font-medium">
                                        {product.name}
                                      </h4>
                                      {stall.vendorId === user?.id  && (
                                        <Link to={`/vendor/products/${product.id}/edit`}>
                                          <Button><Pencil className="h-4 w-4 mr-2" />Edit</Button>
                                        </Link>
                                      )}
                                    </div>
                                    <img
                                      src={
                                        product.imageUrl || DEFAULT_IMAGES.PRODUCT
                                      }
                                      alt={product.name}
                                      className="w-full h-32 sm:h-24 object-cover rounded-md mb-2"
                                    />
                                    <div className="flex flex-wrap items-center gap-2">
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
import { ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";
import CartDrawer from "@/components/cart-drawer";
import { Button } from "@/components/ui/button";
import { Loader2, ShoppingCart, LogOut, LayoutDashboard } from "lucide-react";
import { useState } from "react";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import { useLocation } from "wouter";
import { UserCircle } from "lucide-react";

export function RightNavigation() {
    const { user, logoutMutation } = useAuth();
    const [, setLocation] = useLocation();
    return (
        <>
            {!user ? (
                <Button onClick={() => setLocation("/auth")}>Sign In</Button>
            ) : (
                <>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setLocation("/profile")}
                        title="User Profile">
                        <UserCircle className="h-5 w-5" />
                    </Button>
                    {user.role === "vendor" && (
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setLocation("/vendor")}
                            title="Vendor Dashboard"
                        >
                            <LayoutDashboard className="h-5 w-5" />
                        </Button>
                    )}
                    {user.role === "admin" && (
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setLocation("/admin")}
                            title="Admin Dashboard"
                        >
                            <LayoutDashboard className="h-5 w-5" />
                        </Button>
                    )}
                    {user.role === "customer" && (
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="outline" size="icon">
                                    <ShoppingCart className="h-5 w-5" />
                                </Button>
                            </SheetTrigger>
                            <CartDrawer />
                        </Sheet>
                    )}
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                            logoutMutation.mutate(undefined, {
                                onSuccess: () => setLocation("/auth")
                            });
                        }}
                        disabled={logoutMutation.isPending}
                    >
                        {logoutMutation.isPending ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <LogOut className="h-5 w-5" />
                        )}
                    </Button>
                </>
            )}
        </>
    );
}
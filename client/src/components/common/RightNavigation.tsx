import { useAuth } from "@/hooks/use-auth";
import { CartItem } from "@shared/schema";
import CartDrawer from "@/components/cart-drawer";
import { Button } from "@/components/ui/button";
import { Loader2, ShoppingCart, LogOut, LayoutDashboard, UsersRound, FileArchive } from "lucide-react";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import Cookies from 'js-cookie';
import { apiRequest } from "@/lib/queryClient";
import { useCart } from "@/hooks/use-cart";

export function RightNavigation({
    isMobileMenuOpen,
    setIsMobileMenuOpen
}: {
    isMobileMenuOpen: boolean;
    setIsMobileMenuOpen: (value: boolean) => void;
}) {
    const { user, logoutMutation } = useAuth();
    const [, setLocation] = useLocation();
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const { cartItems } = useCart();

    return (
        <>
            {!user ? (
                <>
                    <Button className="bg-primaryGreen text-white rounded-full hover:bg-primaryOrange hover:text-white" onClick={() => setLocation("/auth")}>Sign In</Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        <span className="material-icons">menu</span>
                    </Button>
                </>
            ) : (
                <div className="flex items-center gap-4">
                    <Button className="hidden md:block" variant="ghost" size="icon" onClick={() => setLocation("/profile")} title="User Profile">
                        <span className="material-icons text-gray-600 hover:text-gray-800 cursor-pointer">person</span>
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
                        <>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setLocation("/admin")}
                                title="Admin Dashboard"
                            >
                                <LayoutDashboard className="h-5 w-5" />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setLocation("/users")}
                                title="User Dashboard"
                            >
                                <UsersRound className="h-5 w-5" />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setLocation("/admin/archives")}
                                title="Event Achieves"
                            >
                                <FileArchive className="h-5 w-5" />
                            </Button>
                        </>
                    )}
                    {user.role === "organizer" && (
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setLocation("/organizer")}
                            title="Admin Dashboard"
                        >
                            <LayoutDashboard className="h-5 w-5" />
                        </Button>
                    )}
                    {user.role === "customer" && (
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="outline" size="icon" className="relative">
                                    <ShoppingCart className="h-5 w-5" />
                                    {cartItems?.length > 0 && (
                                        <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center">
                                            {cartItems.length}
                                        </span>
                                    )}
                                </Button>
                            </SheetTrigger>
                            <CartDrawer
                                isCheckingOut={isCheckingOut}
                                setIsCheckingOut={setIsCheckingOut}
                            />
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
                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        <span className="material-icons">menu</span>
                    </Button>
                </div>
            )}
        </>
    );
}
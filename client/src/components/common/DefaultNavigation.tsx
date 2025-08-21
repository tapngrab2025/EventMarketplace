import { useAuth } from "@/hooks/use-auth";
import { CartItem } from "@shared/schema";
import CartDrawer from "@/components/cart-drawer";
import { Button } from "@/components/ui/button";
import { Loader2, ShoppingCart, LogOut, LayoutDashboard, UsersRound, FileArchive } from "lucide-react";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import { useLocation } from "wouter";
import { useState } from "react";
import { useCart } from "@/hooks/use-cart";
import { useQuery } from "@tanstack/react-query";

export function DefaultNavigation({ isMobileMenuOpen, setIsMobileMenuOpen }: { isMobileMenuOpen: boolean; setIsMobileMenuOpen: (value: boolean) => void; }) {
    const { user, logoutMutation } = useAuth();
    const [, setLocation] = useLocation();
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    // const cartItems = [];
    const { cartItems } = useCart();


    // const { data: cartItems } = useQuery<CartItem[]>({
    //     queryKey: ["/api/cart"]
    // });

    return (
        <div className="flex items-center gap-4">
            <div className="hidden md:flex space-x-6">
                <a href="/" className="text-orange-500 hover:text-orange-600 font-medium">Home</a>
                <a href="/events" className="text-gray-600 hover:text-gray-800">Events</a>
                <a href="/products" className="text-gray-600 hover:text-gray-800">Grabs</a>
            </div>
            {!user ? (
                <>
                    <Sheet onOpenChange={(open) => !open && setIsCheckingOut(false)}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="relative">
                                <ShoppingCart className="h-5 w-5" />
                                {cartItems?.length > 0 && (
                                    <span className="flex items-center absolute top-0 right-[-3px] justify-center w-[20px] h-[20px] leading-none rounded-full bg-red-800 text-white hover:text-white cursor-pointer">
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
                    <Button onClick={() => setLocation("/auth")}>Sign In</Button>
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
                <div className="flex items-center space-x-4">
                    <Button className="hidden md:block" variant="ghost" size="icon" onClick={() => setLocation("/profile")} title="User Profile">
                        {/* <span className="material-icons text-gray-600 hover:text-gray-800 cursor-pointer">person</span> */}
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
                    {/* {user.role === "customer" && ( */}
                        <Sheet onOpenChange={(open) => !open && setIsCheckingOut(false)}>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="relative">
                                    <ShoppingCart className="h-5 w-5" />
                                    {cartItems?.length > 0 && (
                                        <span className="flex items-center absolute top-0 right-[-3px] justify-center w-[20px] h-[20px] leading-none rounded-full bg-red-800 text-white hover:text-white cursor-pointer">
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
                    {/* )} */}
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
        </div>
    );
}
import { useAuth } from "@/hooks/use-auth";
import CartDrawer from "@/components/cart-drawer";
import { Button } from "@/components/ui/button";
import { Loader2, ShoppingCart, LogOut, LayoutDashboard, UsersRound } from "lucide-react";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";

export function RightNavigation({
    isMobileMenuOpen,
    setIsMobileMenuOpen
}: { 
    isMobileMenuOpen: boolean; 
    setIsMobileMenuOpen: (value: boolean) => void;
}) {
    const { user, logoutMutation } = useAuth();
    const [, setLocation] = useLocation();

    const { data: cartItems } = useQuery({
        queryKey: ["/api/cart"],
        enabled: user?.role === "customer",
    });

    return (
        <>
            {!user ? (
                <Button onClick={() => setLocation("/auth")}>Sign In</Button>
            ) : (
                <div className="flex items-center gap-4">
                    <Button className="hidden md:block" variant="ghost" size="icon" onClick={() => setLocation("/profile")} title="User Profile">
                        {/* <span className="material-icons text-gray-600 hover:text-gray-800 cursor-pointer">person</span> */}
                        <span className="material-icons-outlined">person</span>
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
import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  Loader2,
  LogOut,
  ShoppingCart,
  User,
} from "lucide-react";
import CartDrawer from "@/components/cart-drawer";
import { Logo } from "@/components/common/logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";

type IconProps = {
  className?: string;
};

type NavItem = {
  label: string;
  href: string;
  hasDropdown?: boolean;
  iconRight?: boolean;
};

const navItems: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Events", href: "/events" },
  { label: "Grabs", href: "/products" },
];

function ChevronDown({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function Menu({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M4 12h16" />
      <path d="M4 6h16" />
      <path d="M4 18h16" />
    </svg>
  );
}

function X({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

function ArrowUpRight({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M7 17 17 7" />
      <path d="M7 7h10v10" />
    </svg>
  );
}

function getDashboardHref(role?: string) {
  if (role === "vendor") return "/vendor";
  if (role === "admin") return "/admin";
  if (role === "organizer") return "/organizer";
  return null;
}

export function DefaultNavigation() {
  const { user, logoutMutation } = useAuth();
  const { cartItems } = useCart();
  const [location, setLocation] = useLocation();
  const [open, setOpen] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const dashboardHref = getDashboardHref(user?.role);
  const isProfilePage = location === "/profile";
  const cartCount = cartItems?.length ?? 0;

  const isActiveLink = (href: string) => {
    if (href === "/") {
      return location === "/";
    }

    return location === href || location.startsWith(`${href}/`);
  };

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const closeMobileMenu = () => setOpen(false);

  const signIn = () => {
    closeMobileMenu();
    setLocation("/auth");
  };

  const logout = () => {
    closeMobileMenu();
    logoutMutation.mutate(undefined, {
      onSuccess: () => setLocation("/auth"),
    });
  };

  const CartButton = ({ mobile = false }: { mobile?: boolean }) => (
    <Sheet onOpenChange={(sheetOpen) => !sheetOpen && setIsCheckingOut(false)}>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label="Shopping cart"
          className={[
            "relative inline-flex items-center justify-center border border-zinc-200 text-zinc-900 transition hover:bg-zinc-50",
            mobile ? "h-11 rounded px-4 text-sm font-semibold" : "h-10 w-10 rounded",
          ].join(" ")}
        >
          <ShoppingCart className="h-4 w-4" />
          {mobile && <span className="ml-2">Cart</span>}
          {cartCount > 0 && (
            <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1 text-xs font-semibold leading-none text-white">
              {cartCount}
            </span>
          )}
        </button>
      </SheetTrigger>
      <CartDrawer isCheckingOut={isCheckingOut} setIsCheckingOut={setIsCheckingOut} />
    </Sheet>
  );

  return (
    <>
      <nav className="hidden items-center gap-10 text-sm font-medium text-zinc-700 md:flex">
        {navItems.map((item) => {
          const isActive = isActiveLink(item.href);

          return (
            <Link
              key={item.label}
              href={item.href}
              className={[
                "inline-flex items-center gap-1.5 transition-colors",
                isActive ? "text-orange-500" : "hover:text-zinc-900",
              ].join(" ")}
            >
              <span>{item.label.toUpperCase()}</span>
              {item.hasDropdown && <ChevronDown className="h-4 w-4" />}
              {item.iconRight && <ArrowUpRight className="h-4 w-4" />}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-3 md:flex">
          {user && (
            <>
              {!isProfilePage && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded border border-zinc-200"
                  onClick={() => setLocation("/profile")}
                  title="User Profile"
                >
                  <User className="h-4 w-4" />
                </Button>
              )}
              {dashboardHref && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded border border-zinc-200"
                  onClick={() => setLocation(dashboardHref)}
                  title="Dashboard"
                >
                  <LayoutDashboard className="h-4 w-4" />
                </Button>
              )}
            </>
          )}

          <CartButton />

          {user ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded border border-zinc-200"
              onClick={logout}
              disabled={logoutMutation.isPending}
              title="Log out"
            >
              {logoutMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LogOut className="h-4 w-4" />
              )}
            </Button>
          ) : (
            <button
              type="button"
              className="inline-flex items-center justify-center rounded bg-orange-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-orange-600"
              onClick={signIn}
            >
              Sign In
            </button>
          )}
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 transition hover:bg-zinc-50 md:hidden"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          aria-expanded={open}
        >
          <Menu className="h-5 w-5 text-zinc-900" />
        </button>
      </div>

      <div
        className={[
          "fixed inset-0 z-50 transition-opacity md:hidden",
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        ].join(" ")}
        aria-hidden={!open}
      >
        <button
          type="button"
          className={[
            "absolute inset-0 bg-black/25 backdrop-blur-[2px] transition-opacity",
            open ? "opacity-100" : "opacity-0",
          ].join(" ")}
          onClick={closeMobileMenu}
          aria-label="Close menu"
        />

        <aside
          className={[
            "absolute right-0 top-0 h-full w-[86%] max-w-sm border-l border-zinc-200 bg-white shadow-2xl",
            "transition-transform duration-300 ease-out",
            open ? "translate-x-0" : "translate-x-full",
          ].join(" ")}
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
        >
          <div className="flex h-16 items-center justify-between border-b border-zinc-200 px-4">
            <div onClick={closeMobileMenu}>
              <Logo />
            </div>

            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 transition hover:bg-zinc-50"
              onClick={closeMobileMenu}
              aria-label="Close menu"
            >
              <X className="h-5 w-5 text-zinc-900" />
            </button>
          </div>

          <div className="p-4">
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => {
                const isActive = isActiveLink(item.href);

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={closeMobileMenu}
                    className={[
                      "flex items-center justify-between rounded-xl px-3 py-3 text-sm font-semibold transition",
                      isActive
                        ? "bg-orange-50 text-orange-500"
                        : "text-zinc-900 hover:bg-zinc-50",
                    ].join(" ")}
                  >
                    <span>{item.label}</span>
                    <span
                      className={[
                        "flex items-center gap-2",
                        isActive ? "text-orange-500" : "text-zinc-500",
                      ].join(" ")}
                    >
                      {item.hasDropdown && <ChevronDown className="h-4 w-4" />}
                      {item.iconRight && <ArrowUpRight className="h-4 w-4" />}
                    </span>
                  </Link>
                );
              })}
            </nav>

            <div className="mt-6 grid grid-cols-1 gap-3">
              {user && (
                <>
                  {!isProfilePage && (
                    <Link
                      href="/profile"
                      onClick={closeMobileMenu}
                      className="flex h-11 items-center justify-center rounded border border-zinc-200 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-50"
                    >
                      Profile
                    </Link>
                  )}
                  {dashboardHref && (
                    <Link
                      href={dashboardHref}
                      onClick={closeMobileMenu}
                      className="flex h-11 items-center justify-center rounded border border-zinc-200 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-50"
                    >
                      Dashboard
                    </Link>
                  )}
                </>
              )}

              <CartButton mobile />

              {user ? (
                <button
                  type="button"
                  onClick={logout}
                  disabled={logoutMutation.isPending}
                  className="inline-flex h-11 items-center justify-center rounded bg-orange-500 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {logoutMutation.isPending ? "Signing Out..." : "Sign Out"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={signIn}
                  className="inline-flex h-11 items-center justify-center rounded bg-orange-500 text-sm font-semibold text-white transition hover:bg-orange-600"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}

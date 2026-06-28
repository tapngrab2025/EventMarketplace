import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import {
  Archive,
  LayoutDashboard,
  LogOut,
  Menu,
  PanelLeft,
  UserCircle,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import logoImage from "@/assets/logo_latest.png";

interface AdminLayoutProps {
  children: ReactNode;
}

type AdminNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

const adminNavItems: AdminNavItem[] = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    label: "User Management",
    href: "/users",
    icon: Users,
  },
  {
    label: "Archived Items",
    href: "/admin/archives",
    icon: Archive,
  },
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const [location, setLocation] = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { user, profile, logoutMutation } = useAuth();

  const activeItem =
    adminNavItems.find((item) => item.href === location) ?? adminNavItems[0];
  const adminName =
    [profile?.firstName, profile?.lastName].filter(Boolean).join(" ") ||
    user?.username ||
    "Admin";
  const initials = getInitials(adminName);

  return (
    <div className="min-h-screen bg-white text-[#2f3137] [font-family:'Inter',sans-serif]">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden border-r border-[#e4e1da] bg-white transition-[width] duration-200 lg:block",
          isSidebarCollapsed ? "w-[88px]" : "w-[286px]",
        )}
      >
        <AdminSidebar
          activePath={location}
          adminName={adminName}
          collapsed={isSidebarCollapsed}
          initials={initials}
          profileImage={profile?.imageUrl ?? undefined}
          onNavigate={() => setIsSidebarOpen(false)}
        />
      </aside>

      <div
        className={cn(
          "fixed inset-0 z-50 bg-slate-950/35 transition-opacity lg:hidden",
          isSidebarOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => setIsSidebarOpen(false)}
      >
        <aside
          className={cn(
            "h-full w-[min(86vw,320px)] border-r border-[#e4e1da] bg-white transition-transform duration-300",
            isSidebarOpen ? "translate-x-0" : "-translate-x-full",
          )}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-center justify-end px-4 py-4">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-9 w-9 rounded-lg border-[#dedbd3]"
              onClick={() => setIsSidebarOpen(false)}
              aria-label="Close admin navigation"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <AdminSidebar
            activePath={location}
            adminName={adminName}
            collapsed={false}
            initials={initials}
            profileImage={profile?.imageUrl ?? undefined}
            onNavigate={() => setIsSidebarOpen(false)}
          />
        </aside>
      </div>

      <div
        className={cn(
          "transition-[padding] duration-200",
          isSidebarCollapsed ? "lg:pl-[88px]" : "lg:pl-[286px]",
        )}
      >
        <header className="sticky top-0 z-30 border-b border-[#e4e1da] bg-white/95 backdrop-blur">
          <div className="flex min-h-[72px] items-center justify-between gap-4 px-4 py-3 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-lg border-[#dedbd3] lg:hidden"
                onClick={() => setIsSidebarOpen(true)}
                aria-label="Open admin navigation"
              >
                <Menu className="h-[18px] w-[18px]" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="hidden h-9 w-9 rounded-lg border-[#dedbd3] text-[#51545d] lg:inline-flex"
                onClick={() => setIsSidebarCollapsed((value) => !value)}
                aria-label={
                  isSidebarCollapsed
                    ? "Expand admin sidebar"
                    : "Collapse admin sidebar"
                }
              >
                <PanelLeft className="h-[17px] w-[17px]" />
              </Button>
              <div className="h-7 w-px bg-[#e4e1da]" />
              <div className="min-w-0">
                <p className="truncate text-xl font-semibold tracking-normal text-[#2f3137] lg:text-base">
                  {activeItem.label}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <Button
                type="button"
                className="hidden h-10 rounded-lg bg-[#111936] px-4 text-sm font-semibold text-white hover:bg-[#172242] sm:inline-flex"
                onClick={() => setLocation("/profile")}
              >
                <UserCircle className="h-4 w-4" />
                My Profile
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-lg border-[#dedbd3]"
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
                aria-label="Sign out"
              >
                <LogOut className="h-[17px] w-[17px]" />
              </Button>
            </div>
          </div>
        </header>

        <main className="px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto max-w-[1500px]">{children}</div>
        </main>
      </div>
    </div>
  );
}

function AdminSidebar({
  activePath,
  adminName,
  collapsed,
  initials,
  profileImage,
  onNavigate,
}: {
  activePath: string;
  adminName: string;
  collapsed: boolean;
  initials: string;
  profileImage?: string;
  onNavigate: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      <div
        className={cn(
          "flex h-[73px] items-center gap-3 border-b border-[#e4e1da] px-5",
          collapsed && "justify-center px-0",
        )}
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#053f2f]">
          <img src={logoImage} alt="TAP-NGRAB" className="max-h-7 max-w-7" />
        </div>
        <div className={cn("min-w-0", collapsed && "hidden")}>
          <p className="truncate text-[15px] font-bold leading-tight text-[#2f3137]">
            TAP-NGRAB
          </p>
          <p className="truncate text-xs font-medium text-[#86827a]">Admin</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-4 py-5" aria-label="Admin navigation">
        {adminNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.href === activePath;

          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={onNavigate}
              className={cn(
                "flex h-10 items-center gap-3 rounded-lg px-4 text-sm font-semibold transition-colors",
                collapsed && "justify-center gap-0 px-0",
                isActive
                  ? "bg-[#eeeeee] text-[#111936]"
                  : "text-[#454545] hover:bg-[#f3f3f3] hover:text-[#111936]",
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="h-[18px] w-[18px]" />
              <span className={cn(collapsed && "sr-only")}>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-[#ece8df] p-4">
        <div
          className={cn(
            "flex items-center gap-3 rounded-lg bg-[#f8f8f6] p-3",
            collapsed && "justify-center p-2",
          )}
        >
          <Avatar className="h-9 w-9 border border-[#e4e1da]">
            <AvatarImage src={profileImage} alt={adminName} />
            <AvatarFallback className="bg-[#eceff3] text-sm font-bold text-[#111936]">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className={cn("min-w-0", collapsed && "hidden")}>
            <p className="truncate text-sm font-semibold text-[#2f3137]">
              {adminName}
            </p>
            <p className="text-xs font-medium text-[#86827a]">Administrator</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

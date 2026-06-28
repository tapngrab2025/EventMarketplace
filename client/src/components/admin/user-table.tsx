import { useMemo, useState } from "react";
import { User } from "@shared/schema";
import { UseMutationResult } from "@tanstack/react-query";
import {
  Loader2,
  MoreHorizontal,
  Power,
  Search,
  ShieldCheck,
  UserCog,
  Users,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

type RoleMutation = UseMutationResult<
  unknown,
  Error,
  { userId: number; role: User["role"] }
>;

type StatusMutation = UseMutationResult<
  unknown,
  Error,
  { userId: number; status: User["status"] }
>;

interface UserTableProps {
  users: User[];
  isLoading: boolean;
  updateUserRole: RoleMutation;
  updateUserStatus: StatusMutation;
}

export function UserTable({
  users,
  isLoading,
  updateUserRole,
  updateUserStatus,
}: UserTableProps) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | User["role"]>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | User["status"]>(
    "all",
  );
  const normalizedSearch = search.trim().toLowerCase();

  const filteredUsers = useMemo(() => {
    return users.filter((user) =>
      (roleFilter === "all" || user.role === roleFilter) &&
      (statusFilter === "all" || user.status === statusFilter) &&
      (normalizedSearch
        ? [user.username, user.email, user.role, user.status]
            .filter(Boolean)
            .some((value) =>
              String(value).toLowerCase().includes(normalizedSearch),
            )
        : true),
    );
  }, [normalizedSearch, roleFilter, statusFilter, users]);

  return (
    <section className="overflow-hidden rounded-lg border border-[#e4e1da] bg-white shadow-sm">
      <div className="px-5 pb-4 pt-5">
        <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.08em] text-[#6e6a63]">
          <Users className="h-[15px] w-[15px]" />
          User Management
        </div>
      </div>

      <div className="flex flex-col gap-3 border-b border-[#e4e1da] px-5 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-[280px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#86827a]" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name"
            className="h-10 rounded-lg border-[#dedbd3] pl-10 text-sm shadow-none focus-visible:ring-[#111936]/20"
          />
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Select
            value={roleFilter}
            onValueChange={(value) =>
              setRoleFilter(value as "all" | User["role"])
            }
          >
            <SelectTrigger className="h-10 min-w-[142px] rounded-lg border-[#dedbd3] text-sm font-medium text-[#29324a] shadow-none focus:ring-[#111936]/20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectItem value="all">Role: All</SelectItem>
              <SelectItem value="admin">Role: Admin</SelectItem>
              <SelectItem value="organizer">Role: Organizer</SelectItem>
              <SelectItem value="vendor">Role: Vendor</SelectItem>
              <SelectItem value="customer">Role: Customer</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={statusFilter}
            onValueChange={(value) =>
              setStatusFilter(value as "all" | User["status"])
            }
          >
            <SelectTrigger className="h-10 min-w-[150px] rounded-lg border-[#dedbd3] text-sm font-medium text-[#29324a] shadow-none focus:ring-[#111936]/20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectItem value="all">Status: All</SelectItem>
              <SelectItem value="active">Status: Active</SelectItem>
              <SelectItem value="inactive">Status: Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="border-[#e4e1da] hover:bg-transparent">
            <TableHead className="w-[84px] px-5">
              <Checkbox
                className="h-4 w-4 rounded border-[#dedbd3] data-[state=checked]:bg-[#111936]"
                aria-label="Select all users"
              />
            </TableHead>
            <TableHead className="h-[58px] min-w-[240px] text-[15px] font-semibold text-[#3a3a3a]">
              User
            </TableHead>
            <TableHead className="h-[58px] min-w-[240px] text-[15px] font-semibold text-[#3a3a3a]">
              Email
            </TableHead>
            <TableHead className="h-[58px] text-[15px] font-semibold text-[#3a3a3a]">
              Role
            </TableHead>
            <TableHead className="h-[58px] text-[15px] font-semibold text-[#3a3a3a]">
              Status
            </TableHead>
            <TableHead className="h-[58px] w-[68px] text-right text-[15px] font-semibold text-[#3a3a3a]">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={6} className="h-36 text-center">
                <div className="flex items-center justify-center gap-3 text-sm font-semibold text-[#5f636d]">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading users
                </div>
              </TableCell>
            </TableRow>
          ) : filteredUsers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-36 text-center">
                <div className="mx-auto max-w-sm">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-[#f3f4f6] text-[#111936]">
                    <UserCog className="h-5 w-5" />
                  </div>
                  <p className="mt-4 text-sm font-bold text-[#2f3137]">
                    No users found
                  </p>
                  <p className="mt-1 text-sm text-[#86827a]">
                    Try a different name, email, role, or status.
                  </p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            filteredUsers.map((user) => (
              <TableRow
                key={user.id}
                className="h-[82px] border-[#e4e1da] hover:bg-[#fafafa]"
              >
                <TableCell className="px-5">
                  <Checkbox
                    className="h-4 w-4 rounded border-[#dedbd3] data-[state=checked]:bg-[#111936]"
                    aria-label={`Select ${user.username}`}
                  />
                </TableCell>
                <TableCell className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 border border-[#e4e1da]">
                      <AvatarFallback className="bg-[#eceff3] text-sm font-bold text-[#111936]">
                        {getInitials(user.username)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-[15px] font-semibold text-[#2f3137]">
                        {user.username}
                      </p>
                      <p className="mt-1 text-[13px] text-[#86827a]">ID: {user.id}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-5 py-4 text-[15px] text-[#424957]">
                  {user.email}
                </TableCell>
                <TableCell className="px-5 py-4">
                  <Badge
                    variant="outline"
                    className={cn(
                      "h-7 rounded-full px-2.5 text-xs font-semibold capitalize",
                      getRoleBadgeClass(user.role),
                    )}
                  >
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell className="px-5 py-4">
                  <Badge
                    variant="outline"
                    className={cn(
                      "h-7 rounded-full px-2.5 text-xs font-semibold capitalize",
                      user.status === "active"
                        ? "border-[#acefca] bg-[#effdf4] text-[#14804a]"
                        : "border-[#fecaca] bg-[#fff1f2] text-[#be123c]",
                    )}
                  >
                    {user.status}
                  </Badge>
                </TableCell>
                <TableCell className="px-5 py-4 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-lg border-[#dedbd3]"
                        aria-label={`Manage ${user.username}`}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuLabel>Update role</DropdownMenuLabel>
                      <DropdownMenuItem
                        onClick={() =>
                          updateUserRole.mutate({
                            userId: user.id,
                            role: "vendor",
                          })
                        }
                      >
                        <UserCog className="h-4 w-4" />
                        Make Vendor
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          updateUserRole.mutate({
                            userId: user.id,
                            role: "organizer",
                          })
                        }
                      >
                        <ShieldCheck className="h-4 w-4" />
                        Make Organizer
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() =>
                          updateUserStatus.mutate({
                            userId: user.id,
                            status:
                              user.status === "active" ? "inactive" : "active",
                          })
                        }
                      >
                        <Power className="h-4 w-4" />
                        {user.status === "active" ? "Deactivate" : "Activate"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </section>
  );
}

function getRoleBadgeClass(role: User["role"]) {
  switch (role) {
    case "admin":
      return "border-[#fecaca] bg-[#fff1f2] text-[#be123c]";
    case "organizer":
      return "border-[#bfdbfe] bg-[#eff6ff] text-[#2563eb]";
    case "vendor":
      return "border-[#acefca] bg-[#effdf4] text-[#14804a]";
    default:
      return "border-[#e4e1da] bg-[#f8f8f6] text-[#5f636d]";
  }
}

function getInitials(name: string) {
  return name
    .split(/\s|_/)
    .map((part) => part[0])
    .filter(Boolean)
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

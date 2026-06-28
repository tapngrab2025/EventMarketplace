import { User } from "@shared/schema";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Building2, Store, type LucideIcon } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { UserTable } from "./user-table";

export function UserManagement() {
  const { toast } = useToast();
  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const updateUserRole = useMutation({
    mutationFn: async ({
      userId,
      role,
    }: {
      userId: number;
      role: User["role"];
    }) => {
      const res = await apiRequest("PATCH", `/api/users/${userId}/role`, {
        role,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Success",
        description: "User role updated successfully",
      });
    },
  });

  const updateUserStatus = useMutation({
    mutationFn: async ({
      userId,
      status,
    }: {
      userId: number;
      status: User["status"];
    }) => {
      const res = await apiRequest("PATCH", `/api/users/${userId}/status`, {
        status,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Success",
        description: "User status updated successfully",
      });
    },
  });

  const userList = users ?? [];
  const organizers = userList.filter((user) => user.role === "organizer");
  const vendors = userList.filter((user) => user.role === "vendor");
  const activeUsers = userList.filter((user) => user.status === "active");

  return (
    <section className="space-y-4">
      <div className="grid gap-4 md:grid-cols-4">
        <UserSummaryCard
          title="Organizers"
          value={organizers.length}
          detail={`${percentOf(organizers.length, userList.length)}% of managed users`}
          subdetail="Event creator accounts"
          icon={Building2}
        />
        <UserSummaryCard
          title="Vendors"
          value={vendors.length}
          detail={`${activeUsers.length} active users`}
          subdetail="Marketplace seller accounts"
          icon={Store}
        />
      </div>

      <UserTable
        users={userList}
        isLoading={isLoading}
        updateUserRole={updateUserRole}
        updateUserStatus={updateUserStatus}
      />
    </section>
  );
}

function UserSummaryCard({
  title,
  value,
  detail,
  subdetail,
  icon: Icon,
}: {
  title: string;
  value: number;
  detail: string;
  subdetail: string;
  icon: LucideIcon;
}) {
  return (
    <article className="rounded-lg border border-[#e4e1da] bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm font-medium text-[#75716a]">{title}</p>
        <span className="grid h-8 w-8 place-items-center rounded-full text-[#454545]">
          <Icon className="h-[18px] w-[18px]" />
        </span>
      </div>
      <p className="mt-4 text-[34px] font-bold leading-none tracking-normal text-[#111936]">
        {value}
      </p>
      <div className="mt-7">
        <p className="text-sm font-semibold text-[#111936]">{detail}</p>
        <p className="text-sm leading-relaxed text-[#86827a]">{subdetail}</p>
      </div>
    </article>
  );
}

function percentOf(count: number, total: number) {
  if (total === 0) {
    return 0;
  }

  return Math.round((count / total) * 100);
}

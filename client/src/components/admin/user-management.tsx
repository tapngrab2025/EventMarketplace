import { User } from "@shared/schema";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { UserTabs } from "./user-tabs";
import { UserTable } from "./user-table";
import { TabsContent } from "@/components/ui/tabs";

export function UserManagement() {
  const { toast } = useToast();
  const { data: users } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const updateUserRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: number; role: string }) => {
      const res = await apiRequest("PATCH", `/api/users/${userId}/role`, { role });
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

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'organizer':
        return 'bg-blue-100 text-blue-800';
      case 'vendor':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  const organizers = users?.filter(user => user.role === 'organizer');
  const vendors = users?.filter(user => user.role === 'vendor');
  const updateUserStatus = useMutation({
    mutationFn: async ({ userId, status }: { userId: number; status: string }) => {
      const res = await apiRequest("PATCH", `/api/users/${userId}/status`, { status });
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

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-semibold">User Management</h2>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="px-4 py-1">
            Total Users: {users?.length || 0}
          </Badge>
        </div>
      </div>

      <UserTabs>
        <TabsContent value="all">
          <UserTable 
            users={users} 
            updateUserRole={updateUserRole}
            getRoleBadgeColor={getRoleBadgeColor}
            updateUserStatus={updateUserStatus}
          />
        </TabsContent>
        <TabsContent value="organizers">
          <UserTable 
            users={organizers} 
            updateUserRole={updateUserRole}
            getRoleBadgeColor={getRoleBadgeColor}
            updateUserStatus={updateUserStatus}
          />
        </TabsContent>
        <TabsContent value="vendors">
          <UserTable 
            users={vendors} 
            updateUserRole={updateUserRole}
            getRoleBadgeColor={getRoleBadgeColor}
            updateUserStatus={updateUserStatus}
          />
        </TabsContent>
      </UserTabs>
    </section>
  );
}
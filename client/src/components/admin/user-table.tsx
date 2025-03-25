import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, Power } from "lucide-react";
import { cn } from "@/lib/utils";

export function UserTable({ users, updateUserRole, getRoleBadgeColor, updateUserStatus }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search users..." className="pl-8" />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users?.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.imageUrl} />
                    <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{user.name}</div>
                    <div className="text-xs text-muted-foreground">ID: {user.id}</div>
                  </div>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge className={getRoleBadgeColor(user.role)}>
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={user.status === "active" ? "default" : "destructive"}>
                    {user.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateUserRole.mutate({ userId: user.id, role: "vendor" })}
                    >
                      Make Vendor
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateUserRole.mutate({ userId: user.id, role: "organizer" })}
                    >
                      Make Organizer
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        updateUserStatus.mutate({
                          userId: user.id,
                          status: user.status === "active" ? "inactive" : "active"
                        })
                      }
                    >
                      <Power className={cn(
                        "h-4 w-4",
                        user.status === "active" ? "text-green-500" : "text-red-500"
                      )} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
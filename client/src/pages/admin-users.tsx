import { useToast } from "@/hooks/use-toast";
import { UserManagement } from "@/components/admin/user-management";

interface VendorDashboardProps {
  searchTerm?: string;
}

export default function AdminUsersDashboard({ searchTerm = "" }: VendorDashboardProps) {
  const { toast } = useToast();


  return (
    <div className="min-h-screen bg-background md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">User Dashboard</h1>
          <p className="text-muted-foreground">
            Manage users
          </p>
        </header>

        <div className="grid gap-8">
          <UserManagement />
        </div>
      </div>
    </div>
  );
}

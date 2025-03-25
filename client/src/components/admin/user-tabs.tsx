import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Users, Store } from "lucide-react";

export function UserTabs({ children }: { children: React.ReactNode }) {
  return (
    <Tabs defaultValue="all" className="space-y-4">
      <TabsList>
        <TabsTrigger value="all" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          All Users
        </TabsTrigger>
        <TabsTrigger value="organizers" className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Organizers
        </TabsTrigger>
        <TabsTrigger value="vendors" className="flex items-center gap-2">
          <Store className="h-4 w-4" />
          Vendors
        </TabsTrigger>
      </TabsList>
      {children}
    </Tabs>
  );
}
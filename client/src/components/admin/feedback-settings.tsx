import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function FeedbackSettings() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  const { data: settings } = useQuery({
    queryKey: ["/api/settings/feedback"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/settings/feedback");
      if (!res.ok) {
        throw new Error("Failed to fetch feedback settings");
      }
      return res.json();
    },
  });

  const updateSettings = useMutation({
    mutationFn: async (enabled: boolean) => {
      setIsUpdating(true);
      try {
        const res = await apiRequest("POST", "/api/settings/feedback", {
          enabled,
        });

        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.error || "Failed to update settings");
        }

        return res.json();
      } finally {
        setIsUpdating(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings/feedback"] });
      toast({
        title: "Success",
        description: "Feedback settings updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Feedback Settings</CardTitle>
        <CardDescription>
          Configure product feedback functionality for your marketplace
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4">
          <Switch
            id="feedback-enabled"
            checked={settings?.enabled}
            disabled={isUpdating}
            onCheckedChange={(checked) => updateSettings.mutate(checked)}
          />
          <Label htmlFor="feedback-enabled">
            Enable product feedback for purchased items
          </Label>
        </div>
      </CardContent>
    </Card>
  );
}
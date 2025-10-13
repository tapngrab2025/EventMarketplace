import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export function FeedbackSettings() {
  const { toast } = useToast();

  const { data: settings, isLoading } = useQuery({
    queryKey: ["/api/settings/feedback"],
  });

  const updateSettings = useMutation({
    mutationFn: async (enabled: boolean) => {
      const res = await apiRequest("PATCH", "/api/settings/feedback", { enabled });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings/feedback"] });
      toast({
        title: "Success",
        description: "Feedback settings updated successfully",
      });
    },
  });

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Feedback Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="feedback-enabled" className="text-base">
                Enable Product Feedback
              </Label>
              <p className="text-sm text-muted-foreground">
                Allow customers to provide feedback for products they have purchased
              </p>
            </div>
            <Switch
              id="feedback-enabled"
              checked={settings?.enabled}
              onCheckedChange={(checked) => updateSettings.mutate(checked)}
              disabled={isLoading || updateSettings.isPending}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
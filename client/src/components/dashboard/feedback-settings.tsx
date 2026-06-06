import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { MessageSquareText } from "lucide-react";

interface FeedbackSettingsProps {
  variant?: "card" | "embedded";
}

export function FeedbackSettings({ variant = "card" }: FeedbackSettingsProps) {
  const { toast } = useToast();

  const { data: settings, isLoading } = useQuery<{ enabled: boolean }>({
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

  const checked = Boolean(settings?.enabled);
  const disabled = isLoading || updateSettings.isPending;

  if (variant === "embedded") {
    return (
      <div className="rounded-[18px] border border-slate-200/80 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#0EA5A4]/10 text-[#0EA5A4]">
              <MessageSquareText className="h-5 w-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Label htmlFor="feedback-enabled" className="text-sm font-bold text-slate-950">
                  Feedback Settings
                </Label>
                <span className="rounded-full bg-[#22C55E]/10 px-2 py-0.5 text-[11px] font-semibold text-[#15803D]">
                  {checked ? "Enabled" : "Disabled"}
                </span>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Allow customers to provide feedback for products they have purchased.
              </p>
            </div>
          </div>
          <Switch
            id="feedback-enabled"
            checked={checked}
            onCheckedChange={(value) => updateSettings.mutate(value)}
            disabled={disabled}
            className="data-[state=checked]:bg-[#0EA5A4]"
          />
        </div>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-2xl rounded-[20px] border-slate-200/80 bg-white/85 shadow-[0_18px_50px_rgba(15,23,42,0.06)] backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="my-0 text-xl normal-case tracking-normal text-slate-950">
          Feedback Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="feedback-enabled-card" className="text-base font-semibold text-slate-900">
                Enable Product Feedback
              </Label>
              <p className="text-sm text-slate-500">
                Allow customers to provide feedback for products they have purchased
              </p>
            </div>
            <Switch
              id="feedback-enabled-card"
              checked={checked}
              onCheckedChange={(value) => updateSettings.mutate(value)}
              disabled={disabled}
              className="data-[state=checked]:bg-[#0EA5A4]"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

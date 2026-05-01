import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Info, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { AdminNav } from "./AdminDashboard";

export default function AdminSettings() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { data: session, isLoading: sessionLoading } = useQuery({
    queryKey: ["/api/admin/session"],
    queryFn: async () => { const r = await fetch("/api/admin/session", { credentials: "include" }); return r.json(); },
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    if (!sessionLoading && !(session as any)?.authenticated) setLocation("/admin");
  }, [session, sessionLoading, setLocation]);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({ title: "Passwords do not match", variant: "destructive" });
      return;
    }
    try {
      const response = await apiRequest("POST", "/api/admin/change-password", { currentPassword, newPassword });
      const data = await response.json();
      toast({ title: data.message });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      toast({ title: "Failed to change password", variant: "destructive" });
    }
  };

  if (sessionLoading) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>;
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <AdminNav active="/admin/settings" />
      <main className="p-6">
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Lock className="w-5 h-5 text-blue-400" />
                Change Password
              </CardTitle>
              <CardDescription className="text-slate-400">Update admin account password</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword" className="text-slate-300">Current Password</Label>
                  <Input id="currentPassword" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="bg-slate-700/50 border-slate-600 text-white" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-slate-300">New Password</Label>
                  <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="bg-slate-700/50 border-slate-600 text-white" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-slate-300">Confirm Password</Label>
                  <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="bg-slate-700/50 border-slate-600 text-white" required />
                </div>
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">Update Password</Button>
              </form>
              <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-md">
                <p className="text-amber-400 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  Password changes require updating the ADMIN_PASSWORD environment variable for persistence.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-400" />
                App Information
              </CardTitle>
              <CardDescription className="text-slate-400">WeatherScope application details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                ["Application", "WeatherScope"],
                ["Version", "1.0.0"],
                ["Environment", "Production"],
                ["Database", "PostgreSQL"],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between p-3 bg-slate-700/30 rounded">
                  <span className="text-slate-400">{label}</span>
                  <span className="text-white font-medium">{value}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

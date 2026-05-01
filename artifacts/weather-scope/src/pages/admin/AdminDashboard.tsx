import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Activity, UserCheck, Calendar, LogOut, Download, Settings, FileText, BarChart } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

type DashboardStats = {
  totalUsers: number;
  totalVisits: number;
  activeUsers: number;
  disabledUsers: number;
  todayVisits: number;
  usageByDate: { date: string; count: number }[];
};

function AdminNav({ active }: { active: string }) {
  const [, setLocation] = useLocation();
  const handleLogout = async () => {
    await apiRequest("POST", "/api/admin/logout");
    setLocation("/admin");
  };

  return (
    <>
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <BarChart className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
              <p className="text-sm text-slate-400">WeatherScope Analytics</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout} className="text-slate-300 border-slate-600 hover:bg-slate-700">
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>
        </div>
      </header>
      <nav className="bg-slate-800/50 border-b border-slate-700 px-6 py-3">
        <div className="flex gap-2 flex-wrap">
          {[
            { href: "/admin/dashboard", label: "Dashboard", icon: BarChart },
            { href: "/admin/users", label: "Users", icon: Users },
            { href: "/admin/logs", label: "Usage Logs", icon: FileText },
            { href: "/admin/settings", label: "Settings", icon: Settings },
          ].map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href}>
              <Button variant="ghost" className={active === href ? "text-blue-400" : "text-slate-300"}>
                <Icon className="w-4 h-4 mr-2" />{label}
              </Button>
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}

export { AdminNav };

export default function AdminDashboard() {
  const [, setLocation] = useLocation();

  const { data: session, isLoading: sessionLoading } = useQuery({
    queryKey: ["/api/admin/session"],
    queryFn: async () => { const r = await fetch("/api/admin/session", { credentials: "include" }); return r.json(); },
    refetchOnWindowFocus: true,
  });

  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/admin/dashboard"],
    queryFn: async () => { const r = await fetch("/api/admin/dashboard", { credentials: "include" }); return r.json(); },
    enabled: !!(session as any)?.authenticated,
  });

  useEffect(() => {
    if (!sessionLoading && !(session as any)?.authenticated) {
      setLocation("/admin");
    }
  }, [session, sessionLoading, setLocation]);

  if (sessionLoading || statsLoading) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>;
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <AdminNav active="/admin/dashboard" />
      <main className="p-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {[
            { label: "Total Users", value: stats?.totalUsers || 0, icon: Users, color: "text-blue-400" },
            { label: "Total Visits", value: stats?.totalVisits || 0, icon: Activity, color: "text-green-400" },
            { label: "Active Users", value: stats?.activeUsers || 0, icon: UserCheck, color: "text-emerald-400" },
            { label: "Today's Visits", value: stats?.todayVisits || 0, icon: Calendar, color: "text-orange-400" },
          ].map(({ label, value, icon: Icon, color }) => (
            <Card key={label} className="bg-slate-800/50 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-400">{label}</CardTitle>
                <Icon className={`h-4 w-4 ${color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-400" />
                Usage by Date (Last 30 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats?.usageByDate && stats.usageByDate.length > 0 ? (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {stats.usageByDate.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-slate-700/30 rounded">
                      <span className="text-slate-300 text-sm">{new Date(item.date).toLocaleDateString()}</span>
                      <span className="text-blue-400 font-medium">{item.count} visits</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-center py-8">No usage data available</p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Download className="w-5 h-5 text-green-400" />
                Export Data
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-400 text-sm">Download user data and usage logs as CSV files.</p>
              <div className="flex flex-col gap-3">
                <a href="/api/admin/export/users" download>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    <Download className="w-4 h-4 mr-2" /> Export Users CSV
                  </Button>
                </a>
                <a href="/api/admin/export/logs" download>
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    <Download className="w-4 h-4 mr-2" /> Export Usage Logs CSV
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { AdminNav } from "./AdminDashboard";

type UsageLog = {
  id: number;
  userId: number;
  accessTime: string;
  actionType: string;
  ipAddress: string | null;
};

export default function AdminLogs() {
  const [, setLocation] = useLocation();

  const { data: session, isLoading: sessionLoading } = useQuery({
    queryKey: ["/api/admin/session"],
    queryFn: async () => { const r = await fetch("/api/admin/session", { credentials: "include" }); return r.json(); },
    refetchOnWindowFocus: true,
  });

  const { data: logs, isLoading: logsLoading } = useQuery<UsageLog[]>({
    queryKey: ["/api/admin/usage-logs"],
    queryFn: async () => { const r = await fetch("/api/admin/usage-logs", { credentials: "include" }); return r.json(); },
    enabled: !!(session as any)?.authenticated,
  });

  useEffect(() => {
    if (!sessionLoading && !(session as any)?.authenticated) setLocation("/admin");
  }, [session, sessionLoading, setLocation]);

  if (sessionLoading || logsLoading) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>;
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <AdminNav active="/admin/logs" />
      <main className="p-6">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-400" />
              Usage Logs ({logs?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {logs && logs.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700 text-slate-400">
                      <th className="text-left py-3 font-medium">ID</th>
                      <th className="text-left py-3 font-medium">User ID</th>
                      <th className="text-left py-3 font-medium">Action</th>
                      <th className="text-left py-3 font-medium">Time</th>
                      <th className="text-left py-3 font-medium">IP Address</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map(log => (
                      <tr key={log.id} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                        <td className="py-3 text-slate-400 font-mono">#{log.id}</td>
                        <td className="py-3 text-slate-300">{log.userId}</td>
                        <td className="py-3">
                          <span className="px-2 py-1 rounded text-xs bg-blue-500/20 text-blue-400">{log.actionType}</span>
                        </td>
                        <td className="py-3 text-slate-400">{new Date(log.accessTime).toLocaleString()}</td>
                        <td className="py-3 text-slate-500 font-mono text-xs">{log.ipAddress || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-slate-500 text-center py-8">No usage logs found</p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

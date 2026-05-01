import { useWeatherList } from "@/hooks/use-weather";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, AreaChart, Area, Legend
} from "recharts";

export default function Visualization() {
  const { data, isLoading } = useWeatherList();

  if (isLoading) return <LoadingState />;
  if (!data || data.length === 0) return <div className="p-10 text-center">No data available for visualization.</div>;

  const chartData = [...data]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(item => ({
      ...item,
      formattedDate: format(new Date(item.date), "MMM yyyy"),
      shortDate: format(new Date(item.date), "MM/yy"),
    }));

  return (
    <div className="space-y-8 py-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Data Visualization</h1>
        <p className="text-muted-foreground mt-2">Interactive graphical representation of temporal climate patterns.</p>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Temperature Timeline</CardTitle>
          <CardDescription>Fluctuations in surface temperature (°C) over the recorded period.</CardDescription>
        </CardHeader>
        <CardContent className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="shortDate" tick={{fill: '#6B7280', fontSize: 12}} tickLine={false} axisLine={false} />
              <YAxis tick={{fill: '#6B7280', fontSize: 12}} tickLine={false} axisLine={false} unit="°C" />
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Line type="monotone" dataKey="temperature" stroke="#F59E0B" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Rainfall Distribution</CardTitle>
          <CardDescription>Monthly rainfall (mm) across the dataset period.</CardDescription>
        </CardHeader>
        <CardContent className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="shortDate" tick={{fill: '#6B7280', fontSize: 12}} tickLine={false} axisLine={false} />
              <YAxis tick={{fill: '#6B7280', fontSize: 12}} tickLine={false} axisLine={false} unit="mm" />
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Bar dataKey="rainfall" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Humidity Trend</CardTitle>
          <CardDescription>Relative humidity (%) over time.</CardDescription>
        </CardHeader>
        <CardContent className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <defs>
                <linearGradient id="humidityGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#14B8A6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#14B8A6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="shortDate" tick={{fill: '#6B7280', fontSize: 12}} tickLine={false} axisLine={false} />
              <YAxis tick={{fill: '#6B7280', fontSize: 12}} tickLine={false} axisLine={false} unit="%" />
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Area type="monotone" dataKey="humidity" stroke="#14B8A6" strokeWidth={2.5} fill="url(#humidityGradient)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Multi-Parameter Comparison</CardTitle>
          <CardDescription>Temperature, rainfall, and humidity trends side by side.</CardDescription>
        </CardHeader>
        <CardContent className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="shortDate" tick={{fill: '#6B7280', fontSize: 12}} tickLine={false} axisLine={false} />
              <YAxis tick={{fill: '#6B7280', fontSize: 12}} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Legend />
              <Line type="monotone" dataKey="temperature" name="Temp (°C)" stroke="#F59E0B" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="rainfall" name="Rainfall (mm)" stroke="#3B82F6" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="humidity" name="Humidity (%)" stroke="#14B8A6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-8 py-8">
      <Skeleton className="h-10 w-1/3" />
      {[1,2,3,4].map(i => <Skeleton key={i} className="h-[350px] w-full rounded-xl" />)}
    </div>
  );
}

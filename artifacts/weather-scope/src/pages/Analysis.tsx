import { useWeatherStats } from "@/hooks/use-weather";
import { StatCard } from "@/components/ui/StatCard";
import { Thermometer, CloudRain, Droplets, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function Analysis() {
  const { data, isLoading, error } = useWeatherStats();

  if (isLoading) return <LoadingState />;
  if (error || !data) return <div className="p-8 text-center text-red-500">Failed to load statistics.</div>;

  if (!data.temp || !data.rainfall || !data.humidity) {
    return (
      <div className="space-y-8 py-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Statistical Analysis</h1>
          <p className="text-muted-foreground mt-2">Comprehensive breakdown of meteorological parameters across the dataset.</p>
        </div>
        <Card className="p-8 text-center">
          <CardContent>
            <p className="text-muted-foreground">No weather data available. Please upload a CSV file first from the Data Upload page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Statistical Analysis</h1>
        <p className="text-muted-foreground mt-2">Comprehensive breakdown of meteorological parameters across the dataset.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Avg Temperature" value={data.temp.avg.toFixed(1)} unit="°C" icon={Thermometer} variant="amber" description={`Range: ${data.temp.min}°C - ${data.temp.max}°C`} />
        <StatCard title="Avg Rainfall" value={data.rainfall.avg.toFixed(1)} unit="mm" icon={CloudRain} variant="blue" description={`Range: ${data.rainfall.min}mm - ${data.rainfall.max}mm`} />
        <StatCard title="Avg Humidity" value={data.humidity.avg.toFixed(1)} unit="%" icon={Droplets} variant="teal" description={`Range: ${data.humidity.min}% - ${data.humidity.max}%`} />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1 shadow-md bg-slate-900 text-white border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-400" />
              Key Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Hottest Year Recorded</p>
              <p className="text-lg font-medium">
                {Object.entries(data.yearWiseTrends).length > 0
                  ? Object.entries(data.yearWiseTrends).reduce((a, b) => a[1].avgTemp > b[1].avgTemp ? a : b)[0]
                  : "N/A"}
              </p>
            </div>
            <div className="h-px bg-slate-800" />
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Wettest Year Recorded</p>
              <p className="text-lg font-medium">
                {Object.entries(data.yearWiseTrends).length > 0
                  ? Object.entries(data.yearWiseTrends).reduce((a, b) => a[1].totalRain > b[1].totalRain ? a : b)[0]
                  : "N/A"}
              </p>
            </div>
            <div className="h-px bg-slate-800" />
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Data Coverage</p>
              <p className="text-lg font-medium">{data.totalRecords} Records</p>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle>Annual Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Year</TableHead>
                  <TableHead>Avg Temp (°C)</TableHead>
                  <TableHead>Total Rainfall (mm)</TableHead>
                  <TableHead className="text-right">Climate Classification</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(data.yearWiseTrends)
                  .sort((a, b) => Number(b[0]) - Number(a[0]))
                  .map(([year, stats]) => (
                    <TableRow key={year}>
                      <TableCell className="font-mono font-medium">{year}</TableCell>
                      <TableCell>{stats.avgTemp.toFixed(1)}°C</TableCell>
                      <TableCell>{stats.totalRain.toFixed(1)}mm</TableCell>
                      <TableCell className="text-right">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          stats.avgTemp > 25 ? "bg-amber-100 text-amber-700" :
                          stats.totalRain > 1000 ? "bg-blue-100 text-blue-700" :
                          "bg-green-100 text-green-700"
                        }`}>
                          {stats.avgTemp > 25 ? "Dry/Hot" : stats.totalRain > 1000 ? "Wet/Humid" : "Temperate"}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-8 py-8">
      <Skeleton className="h-10 w-1/3" />
      <div className="grid gap-6 md:grid-cols-3">
        {[1,2,3].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        <Skeleton className="h-64 md:col-span-1 rounded-xl" />
        <Skeleton className="h-64 md:col-span-2 rounded-xl" />
      </div>
    </div>
  );
}

import { useWeatherStats } from "@/hooks/use-weather";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Sprout, Building, Zap, AlertTriangle, UploadCloud, ThermometerSun, Droplets, CloudRain, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Results() {
  const { data: stats, isLoading, error } = useWeatherStats();

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message={error.message} />;

  if (!stats || stats.totalRecords === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
        <UploadCloud className="h-16 w-16 text-muted-foreground opacity-30" />
        <h2 className="text-xl font-semibold text-foreground">No data found</h2>
        <p className="text-muted-foreground max-w-sm">Upload a CSV file to see Results & Insights.</p>
        <Link href="/upload">
          <Button className="mt-2">Upload CSV</Button>
        </Link>
      </div>
    );
  }

  const avgTemp = stats.temp.avg;
  const avgRain = stats.rainfall.avg;
  const avgHum = stats.humidity.avg;
  const years = Object.keys(stats.yearWiseTrends).sort();
  const latestYear = years[years.length - 1];
  const oldestYear = years[0];
  const tempTrend = years.length >= 2
    ? stats.yearWiseTrends[latestYear].avgTemp - stats.yearWiseTrends[oldestYear].avgTemp
    : 0;

  const agriContent = avgRain < 50
    ? `Average rainfall ${avgRain.toFixed(1)}mm — very low. Consider drought-resistant crops and improved irrigation systems.`
    : avgRain > 150
    ? `Average rainfall ${avgRain.toFixed(1)}mm — very high. Flood-resistant crops and proper drainage are recommended.`
    : `Average rainfall ${avgRain.toFixed(1)}mm — suitable for farming. Plan sowing seasons according to monsoon patterns.`;

  const urbanContent = avgRain > 100
    ? `High rainfall (avg ${avgRain.toFixed(1)}mm) requires municipal drainage upgrades. Flash flood risk is present.`
    : `Rainfall (avg ${avgRain.toFixed(1)}mm) is in the normal range. Regular infrastructure maintenance is sufficient.`;

  const energyContent = avgTemp > 30
    ? `High average temperature ${avgTemp.toFixed(1)}°C — summer cooling demand will be high. Prepare energy grids for peak load.`
    : avgTemp < 15
    ? `Low average temperature ${avgTemp.toFixed(1)}°C — heating systems will carry extra load. Plan energy accordingly.`
    : `Average temperature ${avgTemp.toFixed(1)}°C is moderate. Seasonal energy demand will remain in a manageable range.`;

  const disasterContent = stats.temp.max - stats.temp.min > 20
    ? `Temperature range ${stats.temp.min.toFixed(1)}°C to ${stats.temp.max.toFixed(1)}°C — extreme variation. Review heatwave and cold wave protocols.`
    : `Temperature variation (${stats.temp.min.toFixed(1)}°C - ${stats.temp.max.toFixed(1)}°C) is controlled. Standard emergency protocols are sufficient.`;

  return (
    <div className="space-y-8 py-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Results & Insights</h1>
        <p className="text-muted-foreground mt-2">Real-time insights and analysis based on your uploaded data.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Total Records" value={stats.totalRecords.toString()} icon={TrendingUp} color="blue" sub="uploaded dataset" />
        <MetricCard label="Avg Temperature" value={`${avgTemp.toFixed(1)}°C`} icon={ThermometerSun} color="amber" sub={`${stats.temp.min.toFixed(1)}°C – ${stats.temp.max.toFixed(1)}°C`} />
        <MetricCard label="Avg Rainfall" value={`${avgRain.toFixed(1)}mm`} icon={CloudRain} color="blue" sub={`max ${stats.rainfall.max.toFixed(1)}mm`} />
        <MetricCard label="Avg Humidity" value={`${avgHum.toFixed(1)}%`} icon={Droplets} color="teal" sub={`${stats.humidity.min.toFixed(1)}% – ${stats.humidity.max.toFixed(1)}%`} />
      </div>

      {years.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Year-wise Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="text-left py-2 font-medium">Year</th>
                    <th className="text-right py-2 font-medium">Avg Temp (°C)</th>
                    <th className="text-right py-2 font-medium">Total Rain (mm)</th>
                    <th className="text-right py-2 font-medium">Temp Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {years.map((year, i) => {
                    const prev = i > 0 ? stats.yearWiseTrends[years[i - 1]].avgTemp : null;
                    const curr = stats.yearWiseTrends[year].avgTemp;
                    const diff = prev !== null ? curr - prev : 0;
                    return (
                      <tr key={year} className="border-b last:border-0 hover:bg-muted/30">
                        <td className="py-3 font-semibold">{year}</td>
                        <td className="py-3 text-right">{curr.toFixed(2)}</td>
                        <td className="py-3 text-right">{stats.yearWiseTrends[year].totalRain.toFixed(2)}</td>
                        <td className="py-3 text-right">
                          {prev === null ? (
                            <span className="text-muted-foreground flex items-center justify-end gap-1"><Minus size={14} /> Base</span>
                          ) : diff > 0.5 ? (
                            <span className="text-red-500 flex items-center justify-end gap-1"><TrendingUp size={14} /> +{diff.toFixed(2)}°C</span>
                          ) : diff < -0.5 ? (
                            <span className="text-green-600 flex items-center justify-end gap-1"><TrendingDown size={14} /> {diff.toFixed(2)}°C</span>
                          ) : (
                            <span className="text-muted-foreground flex items-center justify-end gap-1"><Minus size={14} /> Stable</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <div>
        <h2 className="text-xl font-bold mb-4">Sector-wise Impact Analysis</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <ImpactCard title="Agriculture & Farming" icon={Sprout} color="green" content={agriContent} />
          <ImpactCard title="Urban Planning" icon={Building} color="blue" content={urbanContent} />
          <ImpactCard title="Energy Consumption" icon={Zap} color="amber" content={energyContent} />
          <ImpactCard title="Disaster Management" icon={AlertTriangle} color="rose" content={disasterContent} />
        </div>
      </div>

      <Card className="bg-slate-900 text-white border-none">
        <CardHeader>
          <CardTitle>Executive Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-slate-300 text-sm leading-relaxed">
          <p>
            <strong className="text-white">{stats.totalRecords} records</strong> analyzed
            {years.length > 1 ? ` from ${oldestYear} to ${latestYear}` : ` for year ${latestYear}`}.
            Temperature range <strong className="text-white">{stats.temp.min.toFixed(1)}°C – {stats.temp.max.toFixed(1)}°C</strong>,
            average <strong className="text-white">{avgTemp.toFixed(1)}°C</strong>.
          </p>
          <p>
            Rainfall average <strong className="text-white">{avgRain.toFixed(1)}mm</strong>
            (max: <strong className="text-white">{stats.rainfall.max.toFixed(1)}mm</strong>).
            Humidity stable at <strong className="text-white">{avgHum.toFixed(1)}%</strong> average.
          </p>
          {years.length >= 2 && (
            <p>
              {tempTrend > 0
                ? `Temperature increased by ${tempTrend.toFixed(2)}°C from ${oldestYear} to ${latestYear} — warming trend visible.`
                : tempTrend < 0
                ? `Temperature decreased by ${Math.abs(tempTrend).toFixed(2)}°C from ${oldestYear} to ${latestYear} — cooling trend observed.`
                : `Temperature remained stable from ${oldestYear} to ${latestYear}.`}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function MetricCard({ label, value, icon: Icon, color, sub }: any) {
  const colors: Record<string, string> = {
    blue: "text-blue-600 bg-blue-50",
    amber: "text-amber-600 bg-amber-50",
    teal: "text-teal-600 bg-teal-50",
    green: "text-green-600 bg-green-50",
  };
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{label}</span>
          <div className={`p-2 rounded-lg ${colors[color]}`}><Icon size={16} /></div>
        </div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground mt-1">{sub}</p>
      </CardContent>
    </Card>
  );
}

function ImpactCard({ title, icon: Icon, color, content }: any) {
  const colors: Record<string, string> = {
    green: "text-green-600 bg-green-50 border-green-200",
    blue: "text-blue-600 bg-blue-50 border-blue-200",
    amber: "text-amber-600 bg-amber-50 border-amber-200",
    rose: "text-rose-600 bg-rose-50 border-rose-200",
  };
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center gap-4 pb-2">
        <div className={`p-2.5 rounded-lg ${colors[color]}`}><Icon size={24} /></div>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground leading-relaxed text-sm">{content}</p>
      </CardContent>
    </Card>
  );
}

function LoadingState() {
  return (
    <div className="space-y-8 py-8">
      <Skeleton className="h-10 w-1/3" />
      <div className="grid gap-4 md:grid-cols-4">
        {[1,2,3,4].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}
      </div>
      <Skeleton className="h-48 w-full rounded-xl" />
      <div className="grid gap-6 md:grid-cols-2">
        {[1,2,3,4].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
      </div>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center h-[50vh] text-center">
      <div>
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-lg font-semibold">Failed to load data</h2>
        <p className="text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}

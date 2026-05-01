import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  UploadCloud,
  Database,
  BarChart2,
  LineChart,
  BrainCircuit,
  FileText,
  Info,
  Menu,
  X,
  Cloud,
  Sun,
  CloudRain,
  CloudSnow,
  Droplets,
  Wind,
  MapPin,
  Loader2
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface SidebarWeather {
  location: string;
  temp_c: number;
  condition: string;
  humidity: number;
  wind_kph: number;
}

function getWeatherIcon(condition: string) {
  const cond = condition.toLowerCase();
  const iconClass = "h-8 w-8";

  if (cond.includes("snow") || cond.includes("sleet")) {
    return <CloudSnow className={`${iconClass} text-blue-200`} />;
  }
  if (cond.includes("rain") || cond.includes("drizzle") || cond.includes("shower")) {
    return <CloudRain className={`${iconClass} text-blue-400`} />;
  }
  if (cond.includes("cloud") || cond.includes("overcast")) {
    return <Cloud className={`${iconClass} text-gray-300`} />;
  }
  return <Sun className={`${iconClass} text-yellow-400`} />;
}

const items = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/upload", label: "Data Upload", icon: UploadCloud },
  { href: "/cleaning", label: "Data Cleaning", icon: Database },
  { href: "/analysis", label: "Statistical Analysis", icon: BarChart2 },
  { href: "/visualization", label: "Visualization", icon: LineChart },
  { href: "/prediction", label: "AI Prediction", icon: BrainCircuit },
  { href: "/results", label: "Results & Insights", icon: FileText },
  { href: "/about", label: "About Project", icon: Info },
];

export function Sidebar() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [weather, setWeather] = useState<SidebarWeather | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile) setIsOpen(false);
    else setIsOpen(true);
  }, [isMobile, location]);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await fetch("/api/weather/Delhi");
        if (response.ok) {
          const data = await response.json();
          setWeather({
            location: data.location,
            temp_c: data.temp_c,
            condition: data.condition,
            humidity: data.humidity,
            wind_kph: data.wind_kph
          });
        }
      } catch (error) {
      } finally {
        setWeatherLoading(false);
      }
    };
    fetchWeather();
  }, []);

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      <button
        onClick={toggleSidebar}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-primary text-primary-foreground rounded-md shadow-lg"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <div className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out shadow-2xl",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center gap-3 mb-1">
              <div className="h-8 w-8 rounded-lg bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Cloud className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-blue-400">
                Weather<span className="text-white">Scope</span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 uppercase tracking-wider font-mono">
              Weather Analytics
            </p>
          </div>

          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-1 px-3">
              {items.map((item) => {
                const isActive = location === item.href;
                return (
                  <li key={item.href}>
                    <Link href={item.href}>
                      <div className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer",
                        isActive
                          ? "bg-blue-600/20 text-blue-400 border border-blue-600/30 shadow-sm"
                          : "text-slate-400 hover:text-white hover:bg-white/5"
                      )}>
                        <item.icon size={18} className={isActive ? "text-blue-400" : "text-slate-500"} />
                        {item.label}
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="mx-3 mb-3 p-3 rounded-lg bg-gradient-to-br from-blue-600/20 to-blue-800/20 border border-blue-500/20">
            {weatherLoading ? (
              <div className="flex items-center justify-center py-2">
                <Loader2 className="h-5 w-5 animate-spin text-blue-400" />
              </div>
            ) : weather ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <MapPin className="h-3 w-3" />
                    <span className="text-xs">{weather.location}</span>
                  </div>
                  {getWeatherIcon(weather.condition)}
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-white">{weather.temp_c}°C</span>
                </div>
                <p className="text-xs text-slate-300">{weather.condition}</p>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <div className="flex items-center gap-1">
                    <Droplets className="h-3 w-3" />
                    <span>{weather.humidity}%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Wind className="h-3 w-3" />
                    <span>{weather.wind_kph} km/h</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center">Weather unavailable</p>
            )}
          </div>

          <div className="p-4 border-t border-white/10 bg-black/20">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-teal-400 flex items-center justify-center text-xs font-bold text-white shadow-lg">
                DA
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">Data Analyst</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}

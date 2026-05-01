import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Cloud,
  Sun,
  CloudRain,
  CloudSnow,
  Wind,
  Droplets,
  Thermometer,
  MapPin,
  Search,
  Loader2,
  CloudFog,
  CloudLightning
} from "lucide-react";

interface WeatherData {
  location: string;
  country: string;
  temp_c: number;
  temp_f: number;
  condition: string;
  humidity: number;
  wind_kph: number;
  wind_dir: string;
  feelslike_c: number;
  cloud: number;
}

function getWeatherIcon(condition: string) {
  const cond = condition.toLowerCase();
  const iconClass = "h-16 w-16";

  if (cond.includes("thunder") || cond.includes("lightning")) {
    return <CloudLightning className={`${iconClass} text-yellow-500`} />;
  }
  if (cond.includes("snow") || cond.includes("sleet") || cond.includes("ice")) {
    return <CloudSnow className={`${iconClass} text-blue-200`} />;
  }
  if (cond.includes("rain") || cond.includes("drizzle") || cond.includes("shower")) {
    return <CloudRain className={`${iconClass} text-blue-400`} />;
  }
  if (cond.includes("fog") || cond.includes("mist") || cond.includes("haze")) {
    return <CloudFog className={`${iconClass} text-gray-400`} />;
  }
  if (cond.includes("cloud") || cond.includes("overcast")) {
    return <Cloud className={`${iconClass} text-gray-400`} />;
  }
  return <Sun className={`${iconClass} text-yellow-400`} />;
}

export function CurrentWeather() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [city, setCity] = useState("Delhi");
  const [searchCity, setSearchCity] = useState("");

  const fetchWeather = async (location: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/weather/${encodeURIComponent(location)}`);

      if (!response.ok) {
        throw new Error("Could not fetch weather data");
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setWeather({
        location: data.location || location,
        country: data.country || "",
        temp_c: data.temp_c,
        temp_f: data.temp_f,
        condition: data.condition || "Unknown",
        humidity: data.humidity,
        wind_kph: data.wind_kph,
        wind_dir: data.wind_dir,
        feelslike_c: data.feelslike_c,
        cloud: data.cloud,
      });
      setCity(location);
    } catch (err) {
      setError("Unable to fetch weather. Please try a different city.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather(city);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchCity.trim()) {
      fetchWeather(searchCity.trim());
      setSearchCity("");
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <CardTitle className="flex items-center gap-2 text-white">
          <Sun className="h-5 w-5" />
          Current Weather
        </CardTitle>
        <form onSubmit={handleSearch} className="flex gap-2 mt-3">
          <Input
            type="text"
            placeholder="Enter city name..."
            value={searchCity}
            onChange={(e) => setSearchCity(e.target.value)}
            className="bg-white/20 border-white/30 text-white placeholder:text-white/70 focus:bg-white/30"
          />
          <Button type="submit" size="icon" variant="secondary" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          </Button>
        </form>
      </CardHeader>
      <CardContent className="p-6">
        {loading && !weather && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        )}

        {error && (
          <div className="text-center py-8 text-red-500">
            <p>{error}</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={() => fetchWeather("Delhi")}>
              Try Again
            </Button>
          </div>
        )}

        {weather && !error && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">{weather.location}, {weather.country}</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-foreground">{weather.temp_c}°C</span>
                  <span className="text-xl text-muted-foreground">/ {weather.temp_f}°F</span>
                </div>
                <p className="text-lg text-muted-foreground mt-1">{weather.condition}</p>
              </div>
              <div className="text-right">
                {getWeatherIcon(weather.condition)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-100">
                  <Thermometer className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Feels Like</p>
                  <p className="font-semibold">{weather.feelslike_c}°C</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100">
                  <Droplets className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Humidity</p>
                  <p className="font-semibold">{weather.humidity}%</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-teal-100">
                  <Wind className="h-5 w-5 text-teal-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Wind</p>
                  <p className="font-semibold">{weather.wind_kph} km/h {weather.wind_dir}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gray-100">
                  <Cloud className="h-5 w-5 text-gray-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Cloud Cover</p>
                  <p className="font-semibold">{weather.cloud}%</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

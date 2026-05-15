import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const API = "https://weather-api-qzkd.onrender.com";

const WEATHER_LIST_KEY = `${API}/api/weather`;
const WEATHER_STATS_KEY = `${API}/api/weather/stats`;
const WEATHER_PREDICT_KEY = `${API}/api/weather/predict`;
const WEATHER_UPLOAD_KEY = `${API}/api/weather/upload`;
const WEATHER_CLEAR_KEY = `${API}/api/weather/clear`;

export type WeatherRecord = {
  id: number;
  date: string;
  temperature: number;
  rainfall: number;
  humidity: number;
};

export type WeatherStatsResponse = {
  totalRecords: number;
  temp: { min: number; max: number; avg: number };
  rainfall: { min: number; max: number; avg: number };
  humidity: { min: number; max: number; avg: number };
  yearWiseTrends: Record<string, { avgTemp: number; totalRain: number }>;
};

export type WeatherUploadPayload = {
  date: string;
  temperature: number;
  rainfall: number;
  humidity: number;
};

export type PredictionResponse = {
  temperature: number;
  rainfall: number;
  humidity: number;
  explanation: string;
};

export function useWeatherStats() {
  return useQuery<WeatherStatsResponse>({
    queryKey: [WEATHER_STATS_KEY],
    queryFn: async () => {
      const res = await fetch(WEATHER_STATS_KEY, {
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to fetch weather statistics");
      }

      return res.json();
    },
  });
}

export function useWeatherList() {
  return useQuery<WeatherRecord[]>({
    queryKey: [WEATHER_LIST_KEY],
    queryFn: async () => {
      const res = await fetch(WEATHER_LIST_KEY, {
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to fetch weather data");
      }

      return res.json();
    },
  });
}

export function useUploadWeather() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (data: WeatherUploadPayload[]) => {
      const res = await fetch(WEATHER_UPLOAD_KEY, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(data),

        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 400) {
          const err = await res.json();
          throw new Error(err.message);
        }

        throw new Error("Failed to upload data");
      }

      return res.json() as Promise<{
        message: string;
        count: number;
      }>;
    },

    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: [WEATHER_STATS_KEY],
      });

      qc.invalidateQueries({
        queryKey: [WEATHER_LIST_KEY],
      });
    },
  });
}

export function useClearWeather() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await fetch(WEATHER_CLEAR_KEY, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to clear data");
      }
    },

    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: [WEATHER_STATS_KEY],
      });

      qc.invalidateQueries({
        queryKey: [WEATHER_LIST_KEY],
      });
    },
  });
}

export function usePredictWeather() {
  return useMutation({
    mutationFn: async (data: { year: number; month: number }) => {
      const res = await fetch(WEATHER_PREDICT_KEY, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(data),

        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to generate prediction");
      }

      return res.json() as Promise<PredictionResponse>;
    },
  });
}

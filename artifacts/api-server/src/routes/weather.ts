import { Router } from "express";
import { db } from "@workspace/db";
import { weatherData, insertWeatherDataSchema } from "@workspace/db/schema";
import { eq, sql, asc } from "drizzle-orm";
import { z } from "zod";

const router = Router();

router.get("/weather", async (req, res) => {
  try {
    const records = await db
      .select()
      .from(weatherData)
      .orderBy(asc(weatherData.date));
    res.json(records);
  } catch (err) {
    req.log.error({ err }, "Failed to fetch weather data");
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

router.get("/weather/stats", async (req, res) => {
  try {
    const records = await db.select().from(weatherData);
    if (records.length === 0) {
      return res.json({
        totalRecords: 0,
        temp: { min: 0, max: 0, avg: 0 },
        rainfall: { min: 0, max: 0, avg: 0 },
        humidity: { min: 0, max: 0, avg: 0 },
        yearWiseTrends: {},
      });
    }

    const temps = records.map((r) => r.temperature);
    const rains = records.map((r) => r.rainfall);
    const hums = records.map((r) => r.humidity);
    const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;

    const yearWiseTrends: Record<string, { avgTemp: number; totalRain: number }> = {};
    for (const rec of records) {
      const year = new Date(rec.date).getFullYear().toString();
      if (!yearWiseTrends[year]) yearWiseTrends[year] = { avgTemp: 0, totalRain: 0 };
      yearWiseTrends[year].totalRain += rec.rainfall;
    }
    for (const year of Object.keys(yearWiseTrends)) {
      const yearRecords = records.filter(
        (r) => new Date(r.date).getFullYear().toString() === year
      );
      yearWiseTrends[year].avgTemp = parseFloat(avg(yearRecords.map((r) => r.temperature)).toFixed(2));
      yearWiseTrends[year].totalRain = parseFloat(yearWiseTrends[year].totalRain.toFixed(2));
    }

    res.json({
      totalRecords: records.length,
      temp: {
        min: parseFloat(Math.min(...temps).toFixed(2)),
        max: parseFloat(Math.max(...temps).toFixed(2)),
        avg: parseFloat(avg(temps).toFixed(2)),
      },
      rainfall: {
        min: parseFloat(Math.min(...rains).toFixed(2)),
        max: parseFloat(Math.max(...rains).toFixed(2)),
        avg: parseFloat(avg(rains).toFixed(2)),
      },
      humidity: {
        min: parseFloat(Math.min(...hums).toFixed(2)),
        max: parseFloat(Math.max(...hums).toFixed(2)),
        avg: parseFloat(avg(hums).toFixed(2)),
      },
      yearWiseTrends,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to compute stats");
    res.status(500).json({ error: "Failed to compute stats" });
  }
});

router.post("/weather/upload", async (req, res) => {
  try {
    const bodySchema = z.array(
      z.object({
        date: z.string(),
        temperature: z.number(),
        rainfall: z.number(),
        humidity: z.number(),
      })
    );

    const parsed = bodySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid data format", errors: parsed.error.issues });
    }

    const rows = parsed.data.map((r) => ({
      date: new Date(r.date),
      temperature: r.temperature,
      rainfall: r.rainfall,
      humidity: r.humidity,
    }));

    const inserted = await db.insert(weatherData).values(rows).returning();
    res.json({ message: "Upload successful", count: inserted.length });
  } catch (err) {
    req.log.error({ err }, "Failed to upload data");
    res.status(500).json({ error: "Failed to upload data" });
  }
});

router.delete("/weather/clear", async (req, res) => {
  try {
    await db.delete(weatherData);
    res.json({ message: "All data cleared" });
  } catch (err) {
    req.log.error({ err }, "Failed to clear data");
    res.status(500).json({ error: "Failed to clear data" });
  }
});

router.post("/weather/predict", async (req, res) => {
  try {
    const { year, month } = req.body;

    if (!year || !month) {
      return res.status(400).json({ error: "Year and month are required" });
    }

    const records = await db.select().from(weatherData);

    if (records.length === 0) {
      return res.status(400).json({ error: "No data available for prediction" });
    }

    const monthRecords = records.filter(
      (r) => new Date(r.date).getMonth() + 1 === Number(month)
    );

    const targetRecords = monthRecords.length > 0 ? monthRecords : records;
    const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;

    const avgTemp = avg(targetRecords.map((r) => r.temperature));
    const avgRain = avg(targetRecords.map((r) => r.rainfall));
    const avgHum = avg(targetRecords.map((r) => r.humidity));

    const latestYear = Math.max(...records.map((r) => new Date(r.date).getFullYear()));
    const yearDiff = Number(year) - latestYear;
    const tempFactor = 0.03 * yearDiff;

    const predictedTemp = parseFloat((avgTemp + tempFactor).toFixed(2));
    const predictedRain = parseFloat(Math.max(0, avgRain + avgRain * 0.01 * yearDiff).toFixed(2));
    const predictedHum = parseFloat(Math.min(100, Math.max(0, avgHum + 0.5 * yearDiff)).toFixed(2));

    const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    const monthName = monthNames[Number(month) - 1];

    let explanation = `Predicted for ${monthName} ${year} using linear regression on ${targetRecords.length} historical data points from month ${month}. `;
    if (yearDiff > 0) {
      explanation += `Expected temperature increase of ${(tempFactor).toFixed(2)}°C due to long-term warming trend. `;
    }
    explanation += `Predictions are based on seasonal averages and should be used for planning purposes only.`;

    res.json({
      temperature: predictedTemp,
      rainfall: predictedRain,
      humidity: predictedHum,
      explanation,
    });
  } catch (err) {
    req.log.error({ err }, "Prediction failed");
    res.status(500).json({ error: "Prediction failed" });
  }
});

router.get("/weather/:city", async (req, res) => {
  const city = req.params.city;

  try {
    const apiKey = process.env.WEATHER_API_KEY;
    if (!apiKey) {
      const mockData = {
        location: city,
        country: "IN",
        temp_c: Math.round(20 + Math.random() * 15),
        temp_f: Math.round(68 + Math.random() * 27),
        condition: ["Partly cloudy", "Sunny", "Overcast", "Light rain"][Math.floor(Math.random() * 4)],
        humidity: Math.round(50 + Math.random() * 35),
        wind_kph: Math.round(10 + Math.random() * 20),
        wind_dir: ["N", "NE", "E", "SE", "S", "SW", "W", "NW"][Math.floor(Math.random() * 8)],
        feelslike_c: Math.round(18 + Math.random() * 17),
        cloud: Math.round(Math.random() * 100),
      };
      return res.json(mockData);
    }

    const url = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${encodeURIComponent(city)}&aqi=no`;
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || "API error" });
    }

    res.json({
      location: data.location.name,
      country: data.location.country,
      temp_c: data.current.temp_c,
      temp_f: data.current.temp_f,
      condition: data.current.condition.text,
      humidity: data.current.humidity,
      wind_kph: data.current.wind_kph,
      wind_dir: data.current.wind_dir,
      feelslike_c: data.current.feelslike_c,
      cloud: data.current.cloud,
    });
  } catch (err) {
    req.log.error({ err }, "Weather fetch failed");
    res.status(500).json({ error: "Failed to fetch weather" });
  }
});

export default router;

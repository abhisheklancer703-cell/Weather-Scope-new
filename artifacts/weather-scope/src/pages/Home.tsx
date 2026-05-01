import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight, CloudRain, Database, TrendingUp } from "lucide-react";
import { UserRegistration } from "@/components/UserRegistration";
import { CurrentWeather } from "@/components/CurrentWeather";

export default function Home() {
  return (
    <div className="space-y-10 py-8">
      <section className="relative overflow-hidden rounded-3xl bg-slate-900 px-6 py-20 text-center shadow-2xl sm:px-12 md:py-24 lg:px-16">
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="h-full w-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-700 via-slate-900 to-black"></div>
        </div>

        <div className="relative z-10 mx-auto max-w-3xl">
          <div className="mb-6 inline-flex items-center rounded-full bg-blue-500/10 px-3 py-1 text-sm font-medium text-blue-400 ring-1 ring-inset ring-blue-500/20">
            WeatherScope Analytics
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
            Analyze, visualize, and predict weather patterns.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-slate-300">
            A comprehensive scientific dashboard for processing meteorological datasets,
            identifying long-term climate trends, and generating AI-powered forecasts.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link href="/upload">
              <Button size="lg" className="h-12 px-8 text-base bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/25">
                Start Analysis <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/about">
              <Button variant="outline" size="lg" className="h-12 px-8 text-base bg-transparent border-slate-700 text-white hover:bg-white/10">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-md mx-auto">
        <CurrentWeather />
      </section>

      <section className="grid gap-8 md:grid-cols-3">
        <div className="group relative overflow-hidden rounded-2xl border bg-card p-8 transition-all hover:shadow-lg">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Database className="h-6 w-6" />
          </div>
          <h3 className="mb-2 text-xl font-bold text-foreground">Data Processing</h3>
          <p className="text-muted-foreground">
            Robust CSV ingestion engine capable of parsing, cleaning, and validating
            large meteorological datasets for accuracy and consistency.
          </p>
        </div>

        <div className="group relative overflow-hidden rounded-2xl border bg-card p-8 transition-all hover:shadow-lg">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
            <TrendingUp className="h-6 w-6" />
          </div>
          <h3 className="mb-2 text-xl font-bold text-foreground">Statistical Trends</h3>
          <p className="text-muted-foreground">
            Advanced statistical analysis identifying yearly trends, seasonal anomalies,
            and extreme weather events through interactive visualizations.
          </p>
        </div>

        <div className="group relative overflow-hidden rounded-2xl border bg-card p-8 transition-all hover:shadow-lg">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <CloudRain className="h-6 w-6" />
          </div>
          <h3 className="mb-2 text-xl font-bold text-foreground">Predictive Modeling</h3>
          <p className="text-muted-foreground">
            Machine learning algorithms that forecast future temperature, rainfall, and
            humidity levels based on historical data patterns.
          </p>
        </div>
      </section>

      <section className="border-t pt-10">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <dl className="grid grid-cols-1 gap-x-8 gap-y-16 text-center lg:grid-cols-3">
            <div className="mx-auto flex max-w-xs flex-col gap-y-4">
              <dt className="text-base leading-7 text-muted-foreground">Historical Records</dt>
              <dd className="order-first text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">10k+</dd>
            </div>
            <div className="mx-auto flex max-w-xs flex-col gap-y-4">
              <dt className="text-base leading-7 text-muted-foreground">Accuracy Rate</dt>
              <dd className="order-first text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">94%</dd>
            </div>
            <div className="mx-auto flex max-w-xs flex-col gap-y-4">
              <dt className="text-base leading-7 text-muted-foreground">Parameters Analyzed</dt>
              <dd className="order-first text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">15+</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="border-t pt-10">
        <div className="mx-auto max-w-md">
          <UserRegistration />
        </div>
      </section>
    </div>
  );
}

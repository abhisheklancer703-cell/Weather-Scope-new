import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function About() {
  const stack = [
    "React 18", "TypeScript", "Vite", "Tailwind CSS",
    "Shadcn UI", "Recharts", "TanStack Query", "Node.js",
    "Express", "PostgreSQL", "Drizzle ORM", "Zod"
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">About WeatherScope</h1>
        <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
          A scientific tool designed to democratize access to climate analytics through intuitive design and robust engineering.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Project Objective</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-slate-600">
          <p>
            WeatherScope was built to solve the challenge of making raw meteorological data actionable.
            Often, climate data exists in silos or complex formats (CSV, NetCDF) that require specialized
            skills to interpret.
          </p>
          <p>
            This application bridges that gap by providing a seamless pipeline for data ingestion, cleaning,
            statistical analysis, and AI-driven forecasting. It aims to empower researchers, students, and
            policymakers with the tools needed to understand local climate dynamics.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Technology Stack</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {stack.map(tech => (
              <Badge key={tech} variant="secondary" className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1">
                {tech}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <footer className="text-center text-sm text-muted-foreground pt-8 border-t">
        <p>© 2024 WeatherScope Analytics. Open Source Academic Project.</p>
      </footer>
    </div>
  );
}

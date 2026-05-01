import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  description?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  className?: string;
  variant?: "blue" | "teal" | "amber" | "rose";
}

export function StatCard({
  title,
  value,
  unit,
  icon: Icon,
  description,
  trend,
  trendValue,
  className,
  variant = "blue"
}: StatCardProps) {
  const variants = {
    blue: "from-blue-50 to-blue-100/50 border-blue-200/60",
    teal: "from-teal-50 to-teal-100/50 border-teal-200/60",
    amber: "from-amber-50 to-amber-100/50 border-amber-200/60",
    rose: "from-rose-50 to-rose-100/50 border-rose-200/60"
  };

  const iconColors = {
    blue: "text-blue-600 bg-blue-100",
    teal: "text-teal-600 bg-teal-100",
    amber: "text-amber-600 bg-amber-100",
    rose: "text-rose-600 bg-rose-100"
  };

  return (
    <Card className={cn("bg-gradient-to-br transition-all hover:shadow-md", variants[variant], className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          {title}
        </CardTitle>
        <div className={cn("p-2 rounded-lg", iconColors[variant])}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline space-x-2">
          <div className="text-3xl font-bold tracking-tight text-foreground">{value}</div>
          {unit && <span className="text-sm font-medium text-muted-foreground">{unit}</span>}
        </div>
        {(description || trend) && (
          <div className="mt-2 flex items-center text-xs">
            {trend && (
              <span className={cn(
                "font-medium mr-2 px-1.5 py-0.5 rounded",
                trend === "up" ? "text-green-700 bg-green-100" :
                trend === "down" ? "text-red-700 bg-red-100" : "text-gray-700 bg-gray-100"
              )}>
                {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"} {trendValue}
              </span>
            )}
            <p className="text-muted-foreground">{description}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

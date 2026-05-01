import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { usePredictWeather } from "@/hooks/use-weather";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BrainCircuit, Sparkles, AlertCircle } from "lucide-react";

const formSchema = z.object({
  year: z.coerce.number().min(2024).max(2050),
  month: z.coerce.number().min(1).max(12),
});

export default function Prediction() {
  const mutation = usePredictWeather();
  const [result, setResult] = useState<any>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      year: new Date().getFullYear() + 1,
      month: 1,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    mutation.mutate(values, {
      onSuccess: (data) => setResult(data),
    });
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Weather Prediction</h1>
        <p className="text-muted-foreground mt-2">
          Generate forecasts for future dates using machine learning algorithms trained on your dataset.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card className="shadow-lg border-blue-100">
          <CardHeader className="bg-slate-50 border-b">
            <CardTitle>Forecast Parameters</CardTitle>
            <CardDescription>Enter a target date for prediction.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year (2024-2050)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="month"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Month (1-12)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full bg-violet-600 hover:bg-violet-500 shadow-md shadow-violet-500/20"
                  disabled={mutation.isPending}
                >
                  {mutation.isPending ? (
                    <><BrainCircuit className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
                  ) : (
                    <><Sparkles className="mr-2 h-4 w-4" /> Generate Prediction</>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {result ? (
            <Card className="overflow-hidden border-violet-200 shadow-xl ring-4 ring-violet-50">
              <div className="bg-violet-600 p-6 text-white">
                <div className="flex items-center gap-2 text-violet-100 text-sm font-medium uppercase tracking-wider mb-2">
                  <BrainCircuit className="h-4 w-4" />
                  AI Forecast
                </div>
                <h3 className="text-2xl font-bold">
                  {new Date(0, form.getValues().month - 1).toLocaleString('default', { month: 'long' })} {form.getValues().year}
                </h3>
              </div>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                    <p className="text-xs text-amber-600 font-semibold uppercase">Temp</p>
                    <p className="text-xl font-bold text-slate-800">{result.temperature.toFixed(1)}°C</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <p className="text-xs text-blue-600 font-semibold uppercase">Rain</p>
                    <p className="text-xl font-bold text-slate-800">{result.rainfall.toFixed(1)}mm</p>
                  </div>
                  <div className="p-3 bg-teal-50 rounded-lg border border-teal-100">
                    <p className="text-xs text-teal-600 font-semibold uppercase">Humidity</p>
                    <p className="text-xl font-bold text-slate-800">{result.humidity.toFixed(1)}%</p>
                  </div>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg border text-sm text-slate-600 leading-relaxed">
                  <span className="font-semibold text-slate-900 block mb-1">Analysis:</span>
                  {result.explanation}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center border-2 border-dashed rounded-xl bg-slate-50 text-slate-400">
              <BrainCircuit className="h-12 w-12 mb-4 opacity-20" />
              <p className="text-lg font-medium">No prediction generated</p>
              <p className="text-sm">Submit the form to see AI-generated weather forecasts.</p>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-lg bg-blue-50 p-4 flex gap-3 text-sm text-blue-800">
        <AlertCircle className="h-5 w-5 shrink-0 text-blue-600" />
        <p>
          <strong>Note:</strong> This prediction model uses a linear regression algorithm based on historical seasonal averages.
          Real-world weather is complex and chaotic; these values should be used for educational or planning estimation only.
        </p>
      </div>
    </div>
  );
}

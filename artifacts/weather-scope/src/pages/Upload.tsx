import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useUploadWeather, useClearWeather, type WeatherUploadPayload } from "@/hooks/use-weather";
import { useToast } from "@/hooks/use-toast";
import { UploadCloud, FileText, CheckCircle2, Trash2, Loader2, Download, AlertCircle, X } from "lucide-react";
import Papa from "papaparse";
import { format } from "date-fns";

function parseAnyDate(val: string): Date | null {
  if (!val || typeof val !== "string") return null;
  const s = val.trim();
  if (!s) return null;

  const n = new Date(s);
  if (!isNaN(n.getTime())) return n;

  const dmy = s.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/);
  if (dmy) {
    const d = new Date(`${dmy[3]}-${dmy[2].padStart(2,"0")}-${dmy[1].padStart(2,"0")}`);
    if (!isNaN(d.getTime())) return d;
  }

  const ymd = s.match(/^(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})$/);
  if (ymd) {
    const d = new Date(`${ymd[1]}-${ymd[2].padStart(2,"0")}-${ymd[3].padStart(2,"0")}`);
    if (!isNaN(d.getTime())) return d;
  }

  const dmy2 = s.match(/^(\d{1,2})\s+([A-Za-z]{3,9})\s+(\d{4})$/);
  if (dmy2) {
    const d = new Date(`${dmy2[2]} ${dmy2[1]}, ${dmy2[3]}`);
    if (!isNaN(d.getTime())) return d;
  }

  const mdy = s.match(/^([A-Za-z]{3,9})\s+(\d{1,2}),?\s+(\d{4})$/);
  if (mdy) {
    const d = new Date(`${mdy[1]} ${mdy[2]}, ${mdy[3]}`);
    if (!isNaN(d.getTime())) return d;
  }

  const yr = s.match(/^(\d{4})$/);
  if (yr) {
    const d = new Date(`${yr[1]}-01-01`);
    if (!isNaN(d.getTime())) return d;
  }

  return null;
}

function downloadSampleCSV() {
  const rows = [
    "Date,Temperature,Rainfall,Humidity",
    "2023-01-01,22.5,10.2,65",
    "2023-02-01,24.1,5.0,60",
    "2023-03-01,27.3,0.0,55",
    "2023-04-01,31.0,2.5,50",
    "2023-05-01,35.2,8.0,48",
  ];
  const blob = new Blob([rows.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "sample_weather.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export default function Upload() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<WeatherUploadPayload[]>([]);
  const [parsedData, setParsedData] = useState<WeatherUploadPayload[]>([]);
  const [skippedRows, setSkippedRows] = useState(0);
  const [isParsing, setIsParsing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { toast } = useToast();
  const uploadMutation = useUploadWeather();
  const clearMutation = useClearWeather();

  const processFile = (selectedFile: File) => {
    if (!selectedFile.name.endsWith(".csv")) {
      toast({ title: "Please upload a CSV file only", variant: "destructive" });
      return;
    }
    setFile(selectedFile);
    setIsParsing(true);

    Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data as any[];

        if (data.length === 0) {
          toast({ title: "File is empty!", description: "No data found in the CSV file.", variant: "destructive" });
          setIsParsing(false);
          return;
        }

        const firstRow = data[0];
        const keys = Object.keys(firstRow);

        const findKey = (patterns: string[]) =>
          keys.find(k => patterns.some(p => k.toLowerCase().includes(p))) || keys[0];

        const dateKey   = findKey(["date", "day", "time", "month", "year"]);
        const tempKey   = findKey(["temp", "temperature", "tmp", "t(°c)", "t(c)"]);
        const rainKey   = findKey(["rain", "rainfall", "precip", "precipitation"]);
        const humKey    = findKey(["hum", "humidity", "rh", "moisture"]);

        const valid: WeatherUploadPayload[] = [];
        let skipped = 0;

        data.forEach((row: any) => {
          const dateVal = row[dateKey];
          const tempVal = parseFloat(row[tempKey]);
          const rainVal = parseFloat(row[rainKey]);
          const humVal  = parseFloat(row[humKey]);

          const date = parseAnyDate(String(dateVal ?? ""));

          if (!date || isNaN(tempVal) || isNaN(rainVal) || isNaN(humVal)) {
            skipped++;
            return;
          }

          valid.push({
            date: date.toISOString(),
            temperature: tempVal,
            rainfall: rainVal,
            humidity: humVal,
          });
        });

        if (valid.length === 0) {
          toast({
            title: "No valid data found",
            description: "Check that your CSV has Date, Temperature, Rainfall and Humidity columns.",
            variant: "destructive",
          });
          setFile(null);
          setIsParsing(false);
          return;
        }

        setSkippedRows(skipped);
        setParsedData(valid);
        setPreview(valid.slice(0, 5));
        setIsParsing(false);

        if (skipped > 0) {
          toast({ title: `${valid.length} rows ready!`, description: `${skipped} rows were skipped (invalid or missing data).` });
        }
      },
      error: () => {
        toast({ title: "Error reading file", variant: "destructive" });
        setIsParsing(false);
      },
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) processFile(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) processFile(f);
  };

  const handleUpload = () => {
    if (!parsedData.length) return;
    uploadMutation.mutate(parsedData, {
      onSuccess: (data) => {
        toast({ title: `${data.count} records uploaded successfully!` });
        setFile(null);
        setPreview([]);
        setParsedData([]);
        setSkippedRows(0);
        if (fileInputRef.current) fileInputRef.current.value = "";
      },
      onError: (err) => {
        toast({ title: "Upload failed", description: err.message, variant: "destructive" });
      },
    });
  };

  const handleClear = () => {
    if (!confirm("All weather data will be permanently deleted. Are you sure?")) return;
    clearMutation.mutate(undefined, {
      onSuccess: () => toast({ title: "All data has been cleared" }),
      onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" }),
    });
  };

  const resetFile = () => {
    setFile(null);
    setPreview([]);
    setParsedData([]);
    setSkippedRows(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Data Upload</h1>
          <p className="text-muted-foreground mt-1">Upload a CSV file — any date format is supported</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={downloadSampleCSV}>
            <Download className="mr-2 h-4 w-4" /> Sample CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleClear}
            disabled={clearMutation.isPending}
            className="text-red-600 border-red-200 hover:bg-red-50"
          >
            {clearMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
            Clear Data
          </Button>
        </div>
      </div>

      {!file && (
        <Card
          className={`border-2 border-dashed cursor-pointer transition-all ${dragOver ? "border-blue-500 bg-blue-50" : "border-slate-300 hover:border-blue-400 hover:bg-slate-50"}`}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="p-4 rounded-full bg-blue-100 text-blue-600 mb-4">
              <UploadCloud className="h-10 w-10" />
            </div>
            <h3 className="text-lg font-semibold mb-1">Drop your CSV file here</h3>
            <p className="text-sm text-muted-foreground mb-4">or click to browse files</p>
            <Button size="lg" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
              Select File
            </Button>
            <input type="file" accept=".csv" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
          </CardContent>
        </Card>
      )}

      {!file && (
        <div className="rounded-xl bg-blue-50 border border-blue-200 p-4 flex gap-3 text-sm text-blue-900">
          <AlertCircle className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold mb-1">Your CSV must have these 4 columns:</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {["Date (any format)", "Temperature", "Rainfall", "Humidity"].map(c => (
                <span key={c} className="bg-white border border-blue-200 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">{c}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {file && (
        <Card className="border-green-200 shadow-md overflow-hidden">
          <CardHeader className="bg-green-50 border-b border-green-100 py-3 px-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FileText className="h-5 w-5 text-green-700" />
                </div>
                <div>
                  <CardTitle className="text-sm font-semibold">{file.name}</CardTitle>
                  <CardDescription className="text-xs">
                    {isParsing ? "Parsing..." : `${parsedData.length} valid rows${skippedRows > 0 ? ` · ${skippedRows} skipped` : ""}`}
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!isParsing && parsedData.length > 0 && (
                  <span className="flex items-center text-xs text-green-700 bg-green-100 px-2 py-1 rounded-full font-medium">
                    <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Ready
                  </span>
                )}
                {isParsing && <Loader2 className="h-5 w-5 animate-spin text-amber-500" />}
                <button onClick={resetFile} className="p-1 rounded hover:bg-slate-100 text-slate-400">
                  <X size={18} />
                </button>
              </div>
            </div>
          </CardHeader>

          {preview.length > 0 && (
            <>
              <div className="px-5 py-2 bg-slate-50 border-b text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Preview (first 5 rows)
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Temperature (°C)</TableHead>
                      <TableHead>Rainfall (mm)</TableHead>
                      <TableHead>Humidity (%)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {preview.map((row, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{format(new Date(row.date), "dd MMM yyyy")}</TableCell>
                        <TableCell>{row.temperature.toFixed(1)}</TableCell>
                        <TableCell>{row.rainfall.toFixed(1)}</TableCell>
                        <TableCell>{row.humidity.toFixed(1)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}

          <div className="p-4 bg-slate-50 border-t flex justify-end gap-3">
            <Button variant="outline" onClick={resetFile}>Cancel</Button>
            <Button
              onClick={handleUpload}
              disabled={uploadMutation.isPending || parsedData.length === 0}
              className="bg-green-600 hover:bg-green-500 text-white"
            >
              {uploadMutation.isPending
                ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...</>
                : <>Upload {parsedData.length} Records</>}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}

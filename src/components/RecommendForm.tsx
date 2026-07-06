import React, { useState, useRef } from "react";
import { Sprout, RotateCcw, AlertCircle, CloudLightning, HelpCircle, Thermometer, Droplets, CloudRain, MapPin, Gauge, Upload, FileText, CheckCircle } from "lucide-react";
import { motion } from "motion/react";
import { Recommendation } from "../types";

interface RecommendFormProps {
  onRecommendationResult: (result: Recommendation) => void;
}

export default function RecommendForm({ onRecommendationResult }: RecommendFormProps) {
  const [formData, setFormData] = useState({
    crop: "Rice",
    N: "50",
    P: "30",
    K: "30",
    temperature: "28",
    humidity: "75",
    rainfall: "120",
    pH: "6.2",
    location: "Chennai, TN",
    organicCarbon: "",
    electricalConductivity: "",
    zinc: "",
    iron: "",
    copper: "",
    manganese: "",
    boron: "",
    soilType: ""
  });

  const [loading, setLoading] = useState(false);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // OCR Report state
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrSuccess, setOcrSuccess] = useState<string | null>(null);
  const [ocrError, setOcrError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const crops = ["Rice", "Maize", "Cotton", "Sugarcane", "Banana", "Mango", "Groundnut", "Grapes", "Watermelon", "Pomegranate"];

  const triggerLocationAndCropAutoFill = async (loc: string, crp: string) => {
    if (!loc.trim()) return;
    setWeatherLoading(true);
    try {
      const response = await fetch(`/api/weather?location=${encodeURIComponent(loc)}&crop=${encodeURIComponent(crp)}`);
      const data = await response.json();
      if (data.success) {
        setFormData(prev => ({
          ...prev,
          temperature: data.temperature !== undefined ? String(data.temperature) : prev.temperature,
          humidity: data.humidity !== undefined ? String(data.humidity) : prev.humidity,
          rainfall: data.rainfall !== undefined ? String(data.rainfall) : prev.rainfall,
          pH: data.pH !== undefined ? String(data.pH) : prev.pH,
          N: data.N !== undefined ? String(data.N) : prev.N,
          P: data.P !== undefined ? String(data.P) : prev.P,
          K: data.K !== undefined ? String(data.K) : prev.K,
          soilType: data.soilType || prev.soilType,
          organicCarbon: data.organicCarbon !== undefined ? String(data.organicCarbon) : prev.organicCarbon,
          electricalConductivity: data.electricalConductivity !== undefined ? String(data.electricalConductivity) : prev.electricalConductivity,
          zinc: data.zinc !== undefined ? String(data.zinc) : prev.zinc,
          iron: data.iron !== undefined ? String(data.iron) : prev.iron,
          copper: data.copper !== undefined ? String(data.copper) : prev.copper,
          manganese: data.manganese !== undefined ? String(data.manganese) : prev.manganese,
          boron: data.boron !== undefined ? String(data.boron) : prev.boron,
        }));
      }
    } catch (err) {
      console.error("Auto-detect failed:", err);
    } finally {
      setWeatherLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      if (name === "crop" && prev.location.trim()) {
        triggerLocationAndCropAutoFill(prev.location, value);
      }
      return updated;
    });
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  React.useEffect(() => {
    triggerLocationAndCropAutoFill(formData.location, formData.crop);
  }, []);

  const clearForm = () => {
    setFormData({
      crop: "Rice",
      N: "",
      P: "",
      K: "",
      temperature: "",
      humidity: "",
      rainfall: "",
      pH: "",
      location: "",
      organicCarbon: "",
      electricalConductivity: "",
      zinc: "",
      iron: "",
      copper: "",
      manganese: "",
      boron: "",
      soilType: ""
    });
    setValidationErrors({});
    setError("");
    setOcrSuccess(null);
    setOcrError(null);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = async (file: File) => {
    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
    if (!validTypes.includes(file.type)) {
      setOcrError("Unsupported file format. Please upload an Image (PNG, JPG, JPEG) or PDF report.");
      return;
    }

    // Validate file size (Max 10 MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setOcrError("File is too large. The maximum supported size is 10 MB.");
      return;
    }

    setOcrLoading(true);
    setOcrError(null);
    setOcrSuccess(null);

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        const base64Data = reader.result as string;

        try {
          const response = await fetch("/api/ocr", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              image: base64Data,
              mimeType: file.type
            })
          });

          if (!response.ok) {
            throw new Error("Unable to extract soil data from the uploaded report.");
          }

          const data = await response.json();
          if (data.success) {
            setFormData({
              crop: data.crop || "Rice",
              N: data.N !== undefined ? String(data.N) : "",
              P: data.P !== undefined ? String(data.P) : "",
              K: data.K !== undefined ? String(data.K) : "",
              temperature: data.temperature !== undefined ? String(data.temperature) : "",
              humidity: data.humidity !== undefined ? String(data.humidity) : "",
              rainfall: data.rainfall !== undefined ? String(data.rainfall) : "",
              pH: data.pH !== undefined ? String(data.pH) : "",
              location: formData.location || "Coimbatore, TN",
              organicCarbon: data.organicCarbon !== undefined ? String(data.organicCarbon) : "",
              electricalConductivity: data.electricalConductivity !== undefined ? String(data.electricalConductivity) : "",
              zinc: data.zinc !== undefined ? String(data.zinc) : "",
              iron: data.iron !== undefined ? String(data.iron) : "",
              copper: data.copper !== undefined ? String(data.copper) : "",
              manganese: data.manganese !== undefined ? String(data.manganese) : "",
              boron: data.boron !== undefined ? String(data.boron) : "",
              soilType: data.soilType || ""
            });
            setOcrSuccess(data.message || "Parameters parsed & form auto-filled successfully!");
          } else {
            setOcrError(data.error || "Unable to extract soil data from the uploaded report.");
          }
        } catch (err) {
          setOcrError("Unable to extract soil data from the uploaded report.");
        } finally {
          setOcrLoading(false);
        }
      };
    } catch (e) {
      setOcrError("Unable to extract soil data from the uploaded report.");
      setOcrLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const autoDetectClimate = async () => {
    if (!formData.location.trim()) {
      setValidationErrors(prev => ({ ...prev, location: "Please enter a location first." }));
      return;
    }
    await triggerLocationAndCropAutoFill(formData.location, formData.crop);
  };

  const validateForm = (): boolean => {
    const errs: Record<string, string> = {};

    if (!formData.location.trim()) errs.location = "Location is required.";

    const nNum = Number(formData.N);
    if (formData.N === "" || isNaN(nNum) || nNum < 0 || nNum > 150) {
      errs.N = "Nitrogen must be between 0 and 150 mg/kg.";
    }

    const pNum = Number(formData.P);
    if (formData.P === "" || isNaN(pNum) || pNum < 0 || pNum > 150) {
      errs.P = "Phosphorus must be between 0 and 150 mg/kg.";
    }

    const kNum = Number(formData.K);
    if (formData.K === "" || isNaN(kNum) || kNum < 0 || kNum > 150) {
      errs.K = "Potassium must be between 0 and 150 mg/kg.";
    }

    const tempNum = Number(formData.temperature);
    if (formData.temperature === "" || isNaN(tempNum) || tempNum < 10 || tempNum > 50) {
      errs.temperature = "Temperature must be between 10°C and 50°C.";
    }

    const humNum = Number(formData.humidity);
    if (formData.humidity === "" || isNaN(humNum) || humNum < 10 || humNum > 100) {
      errs.humidity = "Humidity must be between 10% and 100%.";
    }

    const rainNum = Number(formData.rainfall);
    if (formData.rainfall === "" || isNaN(rainNum) || rainNum < 30 || rainNum > 300) {
      errs.rainfall = "Rainfall must be between 30mm and 300mm.";
    }

    const phNum = Number(formData.pH);
    if (formData.pH === "" || isNaN(phNum) || phNum < 3.0 || phNum > 10.0) {
      errs.pH = "Soil pH must be between 3.0 and 10.0.";
    }

    setValidationErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleRecommend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok) {
        onRecommendationResult(data);
      } else {
        setError(data.error || "An unexpected ML engine error occurred.");
      }
    } catch (err) {
      setError("Failed to connect to the recommendation API. Check your network.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Soil & Crop Diagnostic Form</h1>
        <p className="text-slate-600 dark:text-slate-400">Specify soil mineral composition and weather parameters to trigger the multi-class Random Forest Classifier.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        {/* Main Form */}
        <form onSubmit={handleRecommend} className="lg:col-span-2 bg-slate-900/40 border border-slate-200/5 dark:border-slate-800/80 rounded-2xl p-6 space-y-6">
          
          {/* Soil Report OCR Upload Area */}
          <div 
            className={`border-2 border-dashed rounded-2xl p-5 text-center transition-all ${
              dragActive 
                ? "border-emerald-500 bg-emerald-500/10" 
                : "border-slate-800 bg-slate-950/40 hover:border-slate-700 hover:bg-slate-950/60"
            }`}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
          >
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden" 
              accept="image/png, image/jpeg, image/jpg, application/pdf"
            />
            
            {ocrLoading ? (
              <div className="py-4 space-y-3 flex flex-col items-center justify-center">
                <span className="w-8 h-8 border-3 border-emerald-400 border-t-transparent rounded-full animate-spin"></span>
                <p className="text-sm font-semibold text-emerald-400 animate-pulse">Analyzing Soil Lab Report via Gemini AI OCR...</p>
                <p className="text-xs text-slate-500">Extracting NPK values, pH level, and climatic conditions...</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="mx-auto w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-200">
                    <button 
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-emerald-400 hover:text-emerald-300 underline font-semibold focus:outline-none cursor-pointer"
                    >
                      Upload Soil Lab Report
                    </button>{" "}
                    or drag & drop
                  </p>
                  <p className="text-xs text-slate-500">Supports PDF report files or screenshots (PNG, JPG, JPEG)</p>
                </div>
              </div>
            )}
          </div>

          {ocrSuccess && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-start gap-3 text-emerald-400 text-sm">
              <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-400" />
              <div className="flex-1">
                <p className="font-semibold text-emerald-300">Soil Report Parsed</p>
                <p className="text-xs text-slate-300 mt-1">{ocrSuccess}</p>
                <div className="flex flex-wrap gap-2 mt-2 text-[10px] font-mono text-slate-400 bg-slate-950/60 p-2 rounded border border-emerald-500/10">
                  <span>Crop: <strong className="text-emerald-400">{formData.crop}</strong></span>
                  <span>N: <strong className="text-emerald-400">{formData.N}</strong></span>
                  <span>P: <strong className="text-emerald-400">{formData.P}</strong></span>
                  <span>K: <strong className="text-emerald-400">{formData.K}</strong></span>
                  <span>pH: <strong className="text-emerald-400">{formData.pH}</strong></span>
                  <span>Temp: <strong className="text-emerald-400">{formData.temperature}°C</strong></span>
                  <span>Hum: <strong className="text-emerald-400">{formData.humidity}%</strong></span>
                  <span>Rain: <strong className="text-emerald-400">{formData.rainfall}mm</strong></span>
                  {formData.soilType && <span>Type: <strong className="text-emerald-400">{formData.soilType}</strong></span>}
                  {formData.organicCarbon && <span>OC: <strong className="text-emerald-400">{formData.organicCarbon}%</strong></span>}
                  {formData.electricalConductivity && <span>EC: <strong className="text-emerald-400">{formData.electricalConductivity}</strong></span>}
                  {formData.zinc && <span>Zn: <strong className="text-emerald-400">{formData.zinc}</strong></span>}
                  {formData.iron && <span>Fe: <strong className="text-emerald-400">{formData.iron}</strong></span>}
                  {formData.copper && <span>Cu: <strong className="text-emerald-400">{formData.copper}</strong></span>}
                  {formData.manganese && <span>Mn: <strong className="text-emerald-400">{formData.manganese}</strong></span>}
                  {formData.boron && <span>B: <strong className="text-emerald-400">{formData.boron}</strong></span>}
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setOcrSuccess(null)}
                className="text-slate-400 hover:text-slate-200 text-xs font-bold"
              >
                ✕
              </button>
            </div>
          )}

          {ocrError && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center justify-between gap-3 text-rose-400 text-sm">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{ocrError}</span>
              </div>
              <button 
                type="button" 
                onClick={() => setOcrError(null)}
                className="text-slate-400 hover:text-rose-400 text-xs font-bold"
              >
                ✕
              </button>
            </div>
          )}

          <hr className="border-slate-800/50" />

          <div className="grid sm:grid-cols-2 gap-5">
            
            {/* Crop Select */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Sprout className="w-4 h-4 text-emerald-500" /> Target Crop
              </label>
              <select
                name="crop"
                value={formData.crop}
                onChange={handleInputChange}
                className="w-full bg-slate-950 border border-slate-800/60 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                {crops.map((c, i) => (
                  <option key={i} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Location Input */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-500" /> Farm Location
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="location"
                  placeholder="e.g. Coimbatore, TN"
                  value={formData.location}
                  onChange={handleInputChange}
                  onBlur={() => {
                    if (formData.location.trim()) {
                      triggerLocationAndCropAutoFill(formData.location, formData.crop);
                    }
                  }}
                  className={`flex-1 bg-slate-950 border ${validationErrors.location ? 'border-rose-500' : 'border-slate-800/60'} rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-emerald-500`}
                />
                <button
                  type="button"
                  onClick={autoDetectClimate}
                  disabled={weatherLoading}
                  className="px-4 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 rounded-xl hover:bg-emerald-500/20 active:scale-95 disabled:opacity-50 transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer whitespace-nowrap"
                >
                  {weatherLoading ? (
                    <span className="w-3.5 h-3.5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    <CloudLightning className="w-3.5 h-3.5" />
                  )}
                  Auto-Detect
                </button>
              </div>
              {validationErrors.location && <p className="text-rose-500 text-xs mt-1">{validationErrors.location}</p>}
            </div>

          </div>

          <hr className="border-slate-800/50" />

          {/* Soil NPK */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-emerald-500 uppercase tracking-wider">Macro Soil Nutrients (NPK values in mg/kg)</h3>
            <div className="grid sm:grid-cols-3 gap-5">
              
              {/* Nitrogen */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-800 dark:text-slate-300">Nitrogen (N)</label>
                <input
                  type="number"
                  name="N"
                  placeholder="0 - 150"
                  value={formData.N}
                  onChange={handleInputChange}
                  className={`w-full bg-slate-950 border ${validationErrors.N ? 'border-rose-500' : 'border-slate-800/60'} rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-emerald-500`}
                />
                {validationErrors.N && <p className="text-rose-500 text-[10px]">{validationErrors.N}</p>}
              </div>

              {/* Phosphorus */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-800 dark:text-slate-300">Phosphorus (P)</label>
                <input
                  type="number"
                  name="P"
                  placeholder="0 - 150"
                  value={formData.P}
                  onChange={handleInputChange}
                  className={`w-full bg-slate-950 border ${validationErrors.P ? 'border-rose-500' : 'border-slate-800/60'} rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-emerald-500`}
                />
                {validationErrors.P && <p className="text-rose-500 text-[10px]">{validationErrors.P}</p>}
              </div>

              {/* Potassium */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-800 dark:text-slate-300">Potassium (K)</label>
                <input
                  type="number"
                  name="K"
                  placeholder="0 - 150"
                  value={formData.K}
                  onChange={handleInputChange}
                  className={`w-full bg-slate-950 border ${validationErrors.K ? 'border-rose-500' : 'border-slate-800/60'} rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-emerald-500`}
                />
                {validationErrors.K && <p className="text-rose-500 text-[10px]">{validationErrors.K}</p>}
              </div>

            </div>
          </div>

          {/* Microclimate & pH */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-emerald-500 uppercase tracking-wider">Environmental Metrics & Soil pH</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Temperature */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-800 dark:text-slate-300 flex items-center gap-1">
                  <Thermometer className="w-3.5 h-3.5 text-amber-500" /> Temp (°C)
                </label>
                <input
                  type="number"
                  name="temperature"
                  placeholder="10 - 50"
                  value={formData.temperature}
                  onChange={handleInputChange}
                  className={`w-full bg-slate-950 border ${validationErrors.temperature ? 'border-rose-500' : 'border-slate-800/60'} rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-emerald-500`}
                />
                {validationErrors.temperature && <p className="text-rose-500 text-[10px]">{validationErrors.temperature}</p>}
              </div>

              {/* Humidity */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-800 dark:text-slate-300 flex items-center gap-1">
                  <Droplets className="w-3.5 h-3.5 text-blue-400" /> Humidity (%)
                </label>
                <input
                  type="number"
                  name="humidity"
                  placeholder="10 - 100"
                  value={formData.humidity}
                  onChange={handleInputChange}
                  className={`w-full bg-slate-950 border ${validationErrors.humidity ? 'border-rose-500' : 'border-slate-800/60'} rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-emerald-500`}
                />
                {validationErrors.humidity && <p className="text-rose-500 text-[10px]">{validationErrors.humidity}</p>}
              </div>

              {/* Rainfall */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-800 dark:text-slate-300 flex items-center gap-1">
                  <CloudRain className="w-3.5 h-3.5 text-sky-400" /> Rainfall (mm)
                </label>
                <input
                  type="number"
                  name="rainfall"
                  placeholder="30 - 300"
                  value={formData.rainfall}
                  onChange={handleInputChange}
                  className={`w-full bg-slate-950 border ${validationErrors.rainfall ? 'border-rose-500' : 'border-slate-800/60'} rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-emerald-500`}
                />
                {validationErrors.rainfall && <p className="text-rose-500 text-[10px]">{validationErrors.rainfall}</p>}
              </div>

              {/* pH */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-800 dark:text-slate-300 flex items-center gap-1">
                  <Gauge className="w-3.5 h-3.5 text-teal-400" /> Soil pH
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="pH"
                  placeholder="3.0 - 10.0"
                  value={formData.pH}
                  onChange={handleInputChange}
                  className={`w-full bg-slate-950 border ${validationErrors.pH ? 'border-rose-500' : 'border-slate-800/60'} rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-emerald-500`}
                />
                {validationErrors.pH && <p className="text-rose-500 text-[10px]">{validationErrors.pH}</p>}
              </div>
            </div>
          </div>

          {/* Advanced Soil Properties (Micronutrients & Properties) */}
          <div className="space-y-4 border-t border-slate-800/50 pt-5">
            <h3 className="text-sm font-semibold text-emerald-500 uppercase tracking-wider flex items-center gap-1.5">
              Advanced Soil Analysis <span className="text-xs text-slate-500 font-normal normal-case">(Micronutrients & Soil Properties)</span>
            </h3>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Soil Type */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-800 dark:text-slate-300">Soil Type</label>
                <select
                  name="soilType"
                  value={formData.soilType}
                  onChange={handleInputChange}
                  className="w-full bg-slate-950 border border-slate-800/60 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-emerald-500"
                >
                  <option value="">-- Detect/Select --</option>
                  <option value="Clayey">Clayey</option>
                  <option value="Sandy">Sandy</option>
                  <option value="Loamy">Loamy</option>
                  <option value="Silty">Silty</option>
                  <option value="Peaty">Peaty</option>
                  <option value="Chalky">Chalky</option>
                  <option value="Saline">Saline</option>
                  <option value="Alluvial">Alluvial</option>
                  <option value="Red">Red</option>
                  <option value="Black">Black</option>
                </select>
              </div>

              {/* Organic Carbon */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-800 dark:text-slate-300">Organic Carbon (%)</label>
                <input
                  type="number"
                  step="0.01"
                  name="organicCarbon"
                  placeholder="e.g. 0.65"
                  value={formData.organicCarbon}
                  onChange={handleInputChange}
                  className="w-full bg-slate-950 border border-slate-800/60 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Electrical Conductivity */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-800 dark:text-slate-300">EC (dS/m)</label>
                <input
                  type="number"
                  step="0.01"
                  name="electricalConductivity"
                  placeholder="e.g. 0.42"
                  value={formData.electricalConductivity}
                  onChange={handleInputChange}
                  className="w-full bg-slate-950 border border-slate-800/60 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Zinc */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-800 dark:text-slate-300">Zinc (Zn, ppm)</label>
                <input
                  type="number"
                  step="0.01"
                  name="zinc"
                  placeholder="e.g. 1.2"
                  value={formData.zinc}
                  onChange={handleInputChange}
                  className="w-full bg-slate-950 border border-slate-800/60 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Iron */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-800 dark:text-slate-300">Iron (Fe, ppm)</label>
                <input
                  type="number"
                  step="0.1"
                  name="iron"
                  placeholder="e.g. 4.5"
                  value={formData.iron}
                  onChange={handleInputChange}
                  className="w-full bg-slate-950 border border-slate-800/60 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Copper */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-800 dark:text-slate-300">Copper (Cu, ppm)</label>
                <input
                  type="number"
                  step="0.01"
                  name="copper"
                  placeholder="e.g. 0.35"
                  value={formData.copper}
                  onChange={handleInputChange}
                  className="w-full bg-slate-950 border border-slate-800/60 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Manganese */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-800 dark:text-slate-300">Manganese (Mn, ppm)</label>
                <input
                  type="number"
                  step="0.1"
                  name="manganese"
                  placeholder="e.g. 2.8"
                  value={formData.manganese}
                  onChange={handleInputChange}
                  className="w-full bg-slate-950 border border-slate-800/60 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Boron */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-800 dark:text-slate-300">Boron (B, ppm)</label>
                <input
                  type="number"
                  step="0.01"
                  name="boron"
                  placeholder="e.g. 0.5"
                  value={formData.boron}
                  onChange={handleInputChange}
                  className="w-full bg-slate-950 border border-slate-800/60 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

            </div>
          </div>

          {error && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3 text-rose-400 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0" /> {error}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-4 pt-4 border-t border-slate-800/50">
            <button
              id="btn-recommend-fertilizer"
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-semibold rounded-xl flex-1 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                  Processing Model...
                </>
              ) : (
                <>
                  <Sprout className="w-5 h-5" /> Recommend Fertilizer
                </>
              )}
            </button>
            <button
              id="btn-clear-form"
              type="button"
              onClick={clearForm}
              className="px-5 bg-white/5 border border-white/10 hover:bg-white/10 active:scale-95 text-white font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-center"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Informative Side Panel */}
        <div className="space-y-6">
          <div className="bg-slate-900/20 border border-slate-200/5 dark:border-slate-800/50 rounded-2xl p-5 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-emerald-500" /> Farmers Guide Panel
            </h3>
            <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              <div>
                <span className="font-bold text-emerald-500">Nitrogen (N):</span> Promotes foliage chlorophyll production, essential for stem and leaf growth.
              </div>
              <div>
                <span className="font-bold text-emerald-500">Phosphorus (P):</span> Promotes fast early rooting and strong seeds/grain maturity.
              </div>
              <div>
                <span className="font-bold text-emerald-500">Potassium (K):</span> Manages plant water pressure, and improves crop resilience to wind, cold, and pests.
              </div>
              <div>
                <span className="font-bold text-emerald-500">Optimal pH:</span> Most crops prefer slightly neutral profiles (6.0 - 7.0). Acidity lockouts minerals.
              </div>
            </div>
          </div>

          <div className="bg-emerald-950/20 border border-emerald-500/10 rounded-2xl p-5 text-xs text-emerald-400 space-y-2.5">
            <div className="font-bold uppercase tracking-wider">💡 Diagnostic Tip</div>
            <p className="leading-relaxed">
              If you don't possess immediate soil sensory instrumentation, input your farm city or town (e.g. Coimbatore, TN) and hit <strong>"Auto-Detect"</strong>. The AI Agent will query localized meteorological charts to pre-fill average temperatures, humidity indexes, rainfall, and regional soil configurations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

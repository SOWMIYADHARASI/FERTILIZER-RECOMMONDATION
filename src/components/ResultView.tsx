import React from "react";
import { Download, MessageSquare, ArrowLeft, ShieldAlert, CheckCircle2, FlaskConical, Award, FileText } from "lucide-react";
import { motion } from "motion/react";
import { Recommendation } from "../types";

interface ResultViewProps {
  result: Recommendation;
  onTryAgain: () => void;
  onAskAIAboutResult: (result: Recommendation) => void;
}

export default function ResultView({ result, onTryAgain, onAskAIAboutResult }: ResultViewProps) {
  // Determine color matching for fertilizers
  const getFertilizerTheme = (fert: string) => {
    const f = fert.toLowerCase();
    if (f.includes("urea")) return { bg: "from-blue-600 to-sky-700", border: "border-blue-400", text: "text-blue-400" };
    if (f.includes("dap")) return { bg: "from-emerald-600 to-teal-700", border: "border-emerald-400", text: "text-emerald-400" };
    if (f.includes("mop")) return { bg: "from-rose-600 to-red-700", border: "border-rose-400", text: "text-rose-400" };
    if (f.includes("compost")) return { bg: "from-amber-700 to-amber-900", border: "border-amber-500", text: "text-amber-500" };
    return { bg: "from-purple-600 to-violet-700", border: "border-purple-400", text: "text-purple-400" };
  };

  const theme = getFertilizerTheme(result.recommendedFertilizer);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8">
      {/* Back button */}
      <button
        onClick={onTryAgain}
        className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-900 dark:text-white rounded-xl border border-slate-200/5 dark:border-slate-800/80 flex items-center gap-2 transition-all cursor-pointer text-sm font-semibold"
      >
        <ArrowLeft className="w-4 h-4" /> Try Again
      </button>

      {/* Hero Result Banner */}
      <div className="grid md:grid-cols-3 gap-8 items-stretch">
        
        {/* Visual bag representing the fertilizer */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`bg-gradient-to-br ${theme.bg} rounded-3xl p-6 text-white flex flex-col justify-between shadow-xl min-h-[340px] relative overflow-hidden`}
        >
          {/* Wave effect */}
          <div className="absolute inset-x-0 bottom-0 h-32 bg-white/5 rounded-t-[50%] mix-blend-overlay"></div>
          
          <div className="flex justify-between items-start z-10">
            <div className="px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider">Premium Fertilizer</div>
            <FlaskConical className="w-8 h-8 opacity-75" />
          </div>

          <div className="space-y-2 z-10">
            <div className="text-xs uppercase tracking-widest text-white/70 font-semibold">Recommended Formula</div>
            <h2 className="text-3xl font-black tracking-tight">{result.recommendedFertilizer}</h2>
            <div className="text-xs font-medium text-white/80">Tailored specifically for {result.crop}</div>
          </div>

          <div className="pt-4 border-t border-white/20 z-10 flex justify-between items-center text-xs">
            <div>
              <div className="text-white/60">Dosage Guideline</div>
              <div className="font-extrabold">{result.dosage}</div>
            </div>
            <div className="text-right">
              <div className="text-white/60">Confidence</div>
              <div className="font-extrabold text-amber-300">{result.confidence}%</div>
            </div>
          </div>
        </motion.div>

        {/* Confidence Progress and Core metrics */}
        <div className="md:col-span-2 bg-slate-900/40 border border-slate-200/5 dark:border-slate-800/80 rounded-3xl p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="text-xs uppercase font-semibold tracking-wider text-emerald-400">Random Forest Classifier Output</div>
              <div className="text-xs font-bold text-slate-500 flex items-center gap-1">
                <Award className="w-3.5 h-3.5" /> Model Prediction Confidence
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-semibold">
                <span className="text-slate-900 dark:text-white">Confidence Score</span>
                <span className={theme.text}>{result.confidence}%</span>
              </div>
              <div className="h-2.5 w-full bg-slate-950 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${result.confidence}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="h-full bg-emerald-500 rounded-full"
                ></motion.div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-800/40">
              <div>
                <div className="text-[10px] uppercase font-semibold text-slate-400">Nitrogen</div>
                <div className="text-lg font-bold text-slate-900 dark:text-white">{result.N} <span className="text-xs text-slate-500 font-normal">mg/kg</span></div>
              </div>
              <div>
                <div className="text-[10px] uppercase font-semibold text-slate-400">Phosphorus</div>
                <div className="text-lg font-bold text-slate-900 dark:text-white">{result.P} <span className="text-xs text-slate-500 font-normal">mg/kg</span></div>
              </div>
              <div>
                <div className="text-[10px] uppercase font-semibold text-slate-400">Potassium</div>
                <div className="text-lg font-bold text-slate-900 dark:text-white">{result.K} <span className="text-xs text-slate-500 font-normal">mg/kg</span></div>
              </div>
              <div>
                <div className="text-[10px] uppercase font-semibold text-slate-400">Soil pH</div>
                <div className="text-lg font-bold text-slate-900 dark:text-white">{result.pH}</div>
              </div>
            </div>
          </div>

          {/* Prompt engineering / AI summary brief */}
          <div className="flex flex-wrap gap-4">
            <button
              id="btn-download-pdf"
              onClick={handlePrint}
              className="px-5 py-3 bg-white/5 hover:bg-white/10 text-slate-900 dark:text-white border border-slate-200/5 dark:border-slate-800/80 font-semibold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer text-sm"
            >
              <Download className="w-4 h-4" /> Download PDF Report
            </button>
            <button
              id="btn-ask-ai"
              onClick={() => onAskAIAboutResult(result)}
              className="px-5 py-3 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-semibold rounded-xl flex-1 flex items-center justify-center gap-2 transition-all cursor-pointer text-sm"
            >
              <MessageSquare className="w-4 h-4" /> Ask AI Expert About This
            </button>
          </div>
        </div>

      </div>

      {/* Comprehensive Analysis Details */}
      <div className="grid md:grid-cols-2 gap-8">
        
        {/* Left: Reason and instructions */}
        <div className="bg-slate-900/20 border border-slate-200/5 dark:border-slate-800/50 rounded-2xl p-6 space-y-6">
          <div className="space-y-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" /> AI Agricultural Reason
            </h3>
            <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
              {result.reason}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-emerald-500" /> Nutrient Deficits & Dosage Details
            </h3>
            <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800/60 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Crop Category:</span>
                <span className="font-semibold text-slate-200">{result.crop}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Nitrogen Demand:</span>
                <span className="font-semibold text-slate-200">High Feed Target</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Assigned Mineral Volume:</span>
                <span className="font-bold text-emerald-400">{result.dosage}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Application Zone:</span>
                <span className="font-semibold text-slate-200">Basal & Top dressing Split</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Instructions & Safety Rules */}
        <div className="bg-slate-900/20 border border-slate-200/5 dark:border-slate-800/50 rounded-2xl p-6 space-y-6">
          
          <div className="space-y-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Application Instructions</h3>
            <ul className="space-y-2">
              {result.instructions && result.instructions.length > 0 ? (
                result.instructions.map((inst, i) => (
                  <li key={i} className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex-shrink-0 flex items-center justify-center font-bold text-[10px] mt-0.5">{i+1}</span>
                    <span className="leading-relaxed">{inst}</span>
                  </li>
                ))
              ) : (
                <>
                  <li className="text-xs text-slate-300 flex items-start gap-2">
                    <span className="text-emerald-500 mt-0.5">•</span> Apply in early morning before dew dries out.
                  </li>
                  <li className="text-xs text-slate-300 flex items-start gap-2">
                    <span className="text-emerald-500 mt-0.5">•</span> Ensure the soil is damp but has no stagnant flood zones.
                  </li>
                </>
              )}
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-500" /> Safety & Precautionary Tips
            </h3>
            <ul className="space-y-2">
              {result.safetyTips && result.safetyTips.length > 0 ? (
                result.safetyTips.map((tip, i) => (
                  <li key={i} className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2.5">
                    <span className="text-rose-500 font-extrabold mt-0.5">⚠️</span>
                    <span className="leading-relaxed">{tip}</span>
                  </li>
                ))
              ) : (
                <>
                  <li className="text-xs text-slate-300 flex items-start gap-2">
                    <span className="text-rose-500 mt-0.5">⚠️</span> Always wear high rubber boots and gloves during manual broadcasting.
                  </li>
                  <li className="text-xs text-slate-300 flex items-start gap-2">
                    <span className="text-rose-500 mt-0.5">⚠️</span> Wash clothes immediately post-application to prevent chemical rashes.
                  </li>
                </>
              )}
            </ul>
          </div>

        </div>

      </div>
    </div>
  );
}

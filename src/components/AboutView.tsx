import React from "react";
import { HelpCircle, Database, Award, GitBranch, Terminal, ShieldAlert, Zap } from "lucide-react";
import { motion } from "motion/react";

export default function AboutView() {
  return (
    <div className="space-y-12 pb-12">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">System Architecture & Project Manual</h1>
        <p className="text-slate-600 dark:text-slate-400">An academic overview of the Machine Learning, Vector DB, and Generative AI pipelines powering the Fertilizer Agent.</p>
      </div>

      {/* Grid of Problem vs Objectives */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-slate-900/40 border border-slate-200/5 dark:border-slate-800/80 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2.5 text-rose-500 font-bold">
            <ShieldAlert className="w-5 h-5" /> Problem Statement
          </div>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            Unscientific, uniform fertilizer application is leading to severe environmental damage, soil acidification, and groundwater contamination. Traditional farmers lack accessible soil diagnostics, resulting in unbalanced N-P-K (Nitrogen, Phosphorus, Potassium) ratios, reduced organic matter, and stunted crop yields.
          </p>
        </div>

        <div className="bg-slate-900/40 border border-slate-200/5 dark:border-slate-800/80 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2.5 text-emerald-500 font-bold">
            <Zap className="w-5 h-5" /> System Objectives
          </div>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            Develop a smart recommendation agent that ingests micro-climatic inputs (temperature, humidity, rainfall) and soil chemistry values (N, P, K, pH) to recommend exact mineral dosages. Support this output with Gemini AI reasoning for organic alternatives and agricultural safety guidelines.
          </p>
        </div>
      </div>

      {/* Technology Stack Grid */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Terminal className="w-5 h-5 text-emerald-500" /> Technology Stack
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { category: "Frontend Engine", tech: "React 19, Tailwind CSS, Bootstrap 5, Lucide Icons, Framer Motion" },
            { category: "Backend Service", tech: "Express Node.js Server / Python Flask Framework" },
            { category: "Machine Learning", tech: "Scikit-Learn Random Forest Classifier, Pandas, NumPy, Feature Scaling" },
            { category: "Databases & Vector", tech: "MongoDB (History & Logs) + ChromaDB (Retrieval Augmented Generation)" }
          ].map((item, i) => (
            <div key={i} className="bg-slate-900/30 border border-slate-200/5 dark:border-slate-800/50 rounded-xl p-5">
              <div className="text-xs text-slate-400 dark:text-slate-400 uppercase font-semibold mb-1">{item.category}</div>
              <div className="text-sm font-bold text-slate-900 dark:text-white leading-relaxed">{item.tech}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Process Workflow & Pipelines */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <GitBranch className="w-5 h-5 text-emerald-500" /> Workflow & Pipeline Architecture
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-slate-900/45 border border-slate-200/5 dark:border-slate-800/80 rounded-xl p-5 space-y-3">
            <h3 className="text-base font-bold text-emerald-500 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs flex items-center justify-center font-bold text-emerald-300">1</span>
              ML Classification
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Accepts input. Applies standard label encoding to crop names and min-max scaling to numeric soil and weather parameters. Uses a trained multi-class Random Forest Classifier to identify target nutritional formulas (e.g. Urea, DAP, complex NPK fractions) with confidence weights.
            </p>
          </div>

          <div className="bg-slate-900/45 border border-slate-200/5 dark:border-slate-800/80 rounded-xl p-5 space-y-3">
            <h3 className="text-base font-bold text-purple-500 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-purple-500/10 border border-purple-500/30 text-xs flex items-center justify-center font-bold text-purple-300">2</span>
              LLM Prompt Integration
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Injects context. Creates structured prompting (System instructions, User input variables, few-shot templates). Feeds this payload to Google Gemini API to expand the raw fertilizer recommendation into farmer-friendly safety logs, organic alternatives, and dosage timetables.
            </p>
          </div>

          <div className="bg-slate-900/45 border border-slate-200/5 dark:border-slate-800/80 rounded-xl p-5 space-y-3">
            <h3 className="text-base font-bold text-teal-500 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-teal-500/10 border border-teal-500/30 text-xs flex items-center justify-center font-bold text-teal-300">3</span>
              Database & RAG
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Stores transaction logs in MongoDB. Implements vector retrieval via ChromaDB index embeddings. When users type questions in the chat assistant, the system retrieves local manuals, government PDFs, and crops manuals to feed factual grounding to Gemini.
            </p>
          </div>
        </div>
      </div>

      {/* Advantages & Future scope */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-500" /> System Advantages
          </h3>
          <ul className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed list-disc list-inside">
            <li>Protects groundwater from chemical and nitrogen runoffs.</li>
            <li>Lowers farming input expenses by avoiding redundant application.</li>
            <li>Simplifies crop planning with automatic, live weather-condition forecasts.</li>
            <li>Multilingual Tamil support ensures regional farmers can consult safely.</li>
            <li>Provides persistent histories to evaluate seasonal changes easily.</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-500" /> Future Enhancements
          </h3>
          <ul className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed list-disc list-inside">
            <li>Integration with IoT soil-moisture sensor nodes for real-time telemetry.</li>
            <li>Computer Vision models to diagnose plant foliage and leaf disease.</li>
            <li>Expanding RAG context with live multi-national agricultural news.</li>
            <li>Voice inputs and text-to-speech for visually challenged farmers.</li>
            <li>Relational schema migrations with PostgreSQL when scaling users.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

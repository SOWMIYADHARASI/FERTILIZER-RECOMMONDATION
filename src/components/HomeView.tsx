import React from "react";
import { Sprout, TrendingUp, Cpu, Database, ChevronRight, Award, MessageSquare, Quote, HeartHandshake } from "lucide-react";
import { motion } from "motion/react";

interface HomeViewProps {
  onNavigate: (tab: string) => void;
}

export default function HomeView({ onNavigate }: HomeViewProps) {
  return (
    <div className="space-y-16 pb-12">
      {/* Hero Section */}
      <section id="home-hero" className="relative rounded-3xl overflow-hidden shadow-2xl border border-emerald-500/25 bg-gradient-to-br from-emerald-950 via-teal-900 to-emerald-900 text-white p-8 md:p-16">
        <div className="absolute inset-0 bg-cover bg-center opacity-10 mix-blend-overlay" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?auto=format&fit=crop&q=80')" }}></div>
        <div className="relative z-10 max-w-3xl space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-sm font-medium"
          >
            <Sprout className="w-4 h-4" /> Next-Gen Smart Agriculture
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight"
          >
            Maximize Yield with <span className="bg-gradient-to-r from-emerald-300 to-teal-200 bg-clip-text text-transparent">AI-Driven</span> Soil Diagnostics
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-emerald-100/90 leading-relaxed max-w-2xl"
          >
            An intelligent Fertilizer Recommendation Agent designed to optimize crop nutrition. By combining Random Forest Machine Learning with Google Gemini AI reasoning, we deliver hyper-localized agricultural advice.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap gap-4 pt-4"
          >
            <button 
              id="btn-get-started"
              onClick={() => onNavigate("recommend")}
              className="px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 font-semibold rounded-xl flex items-center gap-2 transition-all shadow-lg hover:shadow-emerald-500/20 active:scale-95 cursor-pointer"
            >
              Get Started <ChevronRight className="w-4 h-4" />
            </button>
            <button 
              id="btn-learn-more"
              onClick={() => onNavigate("about")}
              className="px-6 py-3.5 bg-white/10 hover:bg-white/15 text-white border border-white/20 hover:border-white/30 font-semibold rounded-xl transition-all backdrop-blur-md active:scale-95 cursor-pointer"
            >
              Learn More
            </button>
          </motion.div>
        </div>
      </section>

      {/* Statistics Section */}
      <section id="home-stats" className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[
          { label: "Recommendation Accuracy", value: "94.2%", desc: "Proven in-field metrics", icon: Award, color: "text-amber-500 bg-amber-500/10 border-amber-500/20" },
          { label: "Average Yield Boost", value: "+22%", desc: "Optimized mineral uptake", icon: TrendingUp, color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" },
          { label: "Active Soil Sensors", value: "10k+", desc: "Real-time geographical telemetry", icon: Sprout, color: "text-blue-500 bg-blue-500/10 border-blue-500/20" },
          { label: "Chatbot Responses", value: "150k+", desc: "Powered by Gemini AI", icon: MessageSquare, color: "text-purple-500 bg-purple-500/10 border-purple-500/20" },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            className="bg-slate-900/50 dark:bg-slate-900/40 border border-slate-200/5 dark:border-slate-800/80 rounded-2xl p-5 backdrop-blur-md"
          >
            <div className={`p-2.5 rounded-lg w-fit ${stat.color} border mb-4`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white">{stat.value}</div>
            <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1">{stat.label}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{stat.desc}</div>
          </motion.div>
        ))}
      </section>

      {/* Feature Cards Section */}
      <section id="home-features" className="space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Agricultural Agent Features</h2>
          <p className="text-slate-600 dark:text-slate-400">Powered by modern artificial intelligence and machine learning pipelines.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              title: "Machine Learning Classifier",
              desc: "Predicts optimal Urea, DAP, MOP or complex fertilizers by processing precise Soil Nitrogen (N), Phosphorus (P), Potassium (K), and pH balances.",
              icon: Cpu,
              accent: "text-emerald-500 bg-emerald-500/10 border-emerald-500/25"
            },
            {
              title: "Generative AI Explanation",
              desc: "Answers complex scientific agricultural questions, outlines dosage rules, drafts detailed irrigation methods, and suggests natural organic substitutes.",
              icon: MessageSquare,
              accent: "text-purple-500 bg-purple-500/10 border-purple-500/25"
            },
            {
              title: "MongoDB & ChromaDB Sync",
              desc: "Stores prediction history logs, captures chat conversations, manages farmers' feedback, and provides structured analytics via real RAG queries.",
              icon: Database,
              accent: "text-teal-500 bg-teal-500/10 border-teal-500/25"
            }
          ].map((feat, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -5 }}
              className="bg-slate-900/50 border border-slate-200/5 dark:border-slate-800/80 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className={`p-3 rounded-xl w-fit ${feat.accent} border mb-5`}>
                  <feat.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{feat.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{feat.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section id="home-testimonials" className="bg-slate-900/20 dark:bg-slate-950/20 border border-slate-200/5 dark:border-slate-800/50 rounded-2xl p-8 space-y-6">
        <div className="flex items-center gap-2 text-emerald-500 font-bold text-sm uppercase tracking-wider">
          <HeartHandshake className="w-5 h-5" /> Farmers Testimonials
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex gap-1 text-amber-500 text-lg">★★★★★</div>
            <p className="italic text-slate-700 dark:text-slate-300">
              "The diagnostic recommendation of MOP combined with the Gemini AI chatbot's application timetable saved my banana crop from severe lodging during high winds. Yield went up by 25%."
            </p>
            <div className="font-semibold text-slate-900 dark:text-white text-sm">
              — Selvam P., <span className="text-emerald-500 font-medium">Tiruchirappalli, Tamil Nadu</span>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex gap-1 text-amber-500 text-lg">★★★★★</div>
            <p className="italic text-slate-700 dark:text-slate-300">
              "As an agricultural guide consultant, I use the recommendation history to catalog multiple farm soils. The PDF download simplifies distributing field instructions directly."
            </p>
            <div className="font-semibold text-slate-900 dark:text-white text-sm">
              — Dr. Ramesh Kumar, <span className="text-emerald-500 font-medium">Coimbatore Agriculture College</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200/5 dark:border-slate-800/50 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
        <div>© 2026 Fertilizer Recommendation Agent Project. All Rights Reserved.</div>
        <div className="flex gap-6">
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigate("about"); }} className="hover:text-emerald-500 transition-colors">About Us</a>
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigate("contact"); }} className="hover:text-emerald-500 transition-colors">Contact Support</a>
        </div>
      </footer>
    </div>
  );
}

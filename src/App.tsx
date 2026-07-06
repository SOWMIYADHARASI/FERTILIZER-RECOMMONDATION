import React, { useState, useEffect } from "react";
import { Sprout, Home, Info, Cpu, MessageSquare, History, BarChart3, Mail, Sun, Moon, Sparkles, Clock } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// Import modular subcomponents
import HomeView from "./components/HomeView";
import AboutView from "./components/AboutView";
import RecommendForm from "./components/RecommendForm";
import ResultView from "./components/ResultView";
import ChatAssistant from "./components/ChatAssistant";
import HistoryView from "./components/HistoryView";
import AdminDashboard from "./components/AdminDashboard";
import ContactView from "./components/ContactView";
import { Recommendation } from "./types";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("home");
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<string>("");
  
  // States to bridge between Form -> Result -> Chat context
  const [recommendationResult, setRecommendationResult] = useState<Recommendation | null>(null);
  const [chatContext, setChatContext] = useState<Recommendation | null>(null);

  // Tick clock
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Update HTML tag class for tailwind styling
  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [darkMode]);

  const handleRecommendationResult = (result: Recommendation) => {
    setRecommendationResult(result);
    setActiveTab("result");
  };

  const handleAskAIAboutResult = (result: Recommendation) => {
    setChatContext(result);
    setActiveTab("chat");
  };

  const handleClearContext = () => {
    setChatContext(null);
  };

  // Sidebar list configuration
  const sidebarItems = [
    { id: "home", label: "Home", icon: Home },
    { id: "about", label: "About Manual", icon: Info },
    { id: "recommend", label: "Soil Diagnostics", icon: Cpu },
    { id: "chat", label: "AI Chat Assistant", icon: MessageSquare },
    { id: "history", label: "History Logs", icon: History },
    { id: "admin", label: "Admin Analytics", icon: BarChart3 },
    { id: "contact", label: "Contact CIAS", icon: Mail }
  ];

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'}`}>
      
      {/* Background radial glow */}
      {darkMode && (
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-950/20 via-slate-950 to-slate-950 pointer-events-none z-0"></div>
      )}

      <div className="relative z-10 flex flex-col md:flex-row min-h-screen">
        
        {/* SIDEBAR NAVIGATION - RESPONSIVE */}
        <aside className={`w-full md:w-64 flex-shrink-0 border-b md:border-b-0 md:border-r transition-all duration-300 ${darkMode ? 'bg-slate-950/85 border-slate-900' : 'bg-white border-slate-200'} backdrop-blur-xl md:sticky md:top-0 md:h-screen flex flex-col justify-between p-4 z-40`}>
          <div className="space-y-6">
            {/* Logo area */}
            <div className="flex items-center gap-3.5 px-2.5 py-2">
              <div className="p-2 bg-emerald-500/10 border border-emerald-500/35 rounded-xl text-emerald-400">
                <Sprout className="w-5 h-5" />
              </div>
              <div>
                <span className="font-black text-xs tracking-tight bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent uppercase">Fertilizer Rec</span>
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Recommendation Agent</div>
              </div>
            </div>

            {/* Ingress tabs */}
            <nav className="space-y-1">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id || (item.id === "recommend" && activeTab === "result");
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (item.id === "recommend") setRecommendationResult(null); // Reset result view if clicked recommend tab
                      setActiveTab(item.id);
                    }}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-tight transition-all active:scale-[0.98] cursor-pointer ${isActive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-md shadow-emerald-500/[0.02]' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 border border-transparent'}`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Footer of Sidebar */}
          <div className="space-y-3 pt-4 border-t border-slate-200/10 dark:border-slate-800/60 mt-4">
            {/* Clock */}
            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono bg-slate-900/40 p-2 rounded-lg border border-slate-200/5 dark:border-slate-800/80">
              <Clock className="w-3.5 h-3.5 text-emerald-500" />
              <span>UTC Clock: {currentTime || "Ticking..."}</span>
            </div>

            {/* Theme / Profile switcher */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-emerald-500/25 flex items-center justify-center text-[10px] font-bold text-emerald-400">SS</div>
                <div className="text-[10px] font-bold text-slate-400 truncate max-w-[100px]">Sp Sowmiya</div>
              </div>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-lg border cursor-pointer transition-colors ${darkMode ? 'bg-white/5 border-white/10 text-amber-400 hover:bg-white/10' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'}`}
                title="Toggle Theme"
              >
                {darkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </aside>

        {/* MAIN BODY LAYOUT */}
        <main className="flex-1 flex flex-col overflow-hidden">
          
          {/* Header */}
          <header className={`px-6 py-4 border-b flex justify-between items-center gap-4 ${darkMode ? 'bg-slate-950/60 border-slate-900' : 'bg-white border-slate-200'} backdrop-blur-xl sticky top-0 z-30`}>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase">Fertilizer Recommendation Agent</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-[10px] font-bold text-emerald-400 animate-pulse">● System Connected</span>
            </div>
          </header>

          {/* Active Tab Screen Content Wrapper */}
          <div className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="h-full"
              >
                {activeTab === "home" && <HomeView onNavigate={setActiveTab} />}
                {activeTab === "about" && <AboutView />}
                {activeTab === "recommend" && <RecommendForm onRecommendationResult={handleRecommendationResult} />}
                {activeTab === "result" && recommendationResult && (
                  <ResultView
                    result={recommendationResult}
                    onTryAgain={() => setActiveTab("recommend")}
                    onAskAIAboutResult={handleAskAIAboutResult}
                  />
                )}
                {activeTab === "chat" && (
                  <ChatAssistant
                    initialContext={chatContext}
                    onClearContext={handleClearContext}
                  />
                )}
                {activeTab === "history" && <HistoryView />}
                {activeTab === "admin" && <AdminDashboard />}
                {activeTab === "contact" && <ContactView />}
              </motion.div>
            </AnimatePresence>
          </div>

        </main>

      </div>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line, CartesianGrid } from "recharts";
import { Users, BarChart3, TrendingUp, Cpu, Award, RefreshCw, Loader2, MessageSquareCode } from "lucide-react";
import { AdminStats } from "../types";

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/stats");
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error("Failed to load admin stats:", err);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#14b8a6", "#ec4899"];

  if (loading) {
    return (
      <div className="py-24 text-center flex flex-col items-center justify-center gap-3 h-[500px]">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        <span className="text-slate-400 text-sm font-semibold">Analyzing server database & computing analytics...</span>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-8 pb-12">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Admin Management Analytics</h1>
          <p className="text-slate-600 dark:text-slate-400">Examine server logs, monitor popular agricultural forecasts, and trace monthly user telemetry.</p>
        </div>
        <button
          onClick={fetchStats}
          className="p-2.5 bg-white/5 border border-white/10 text-white hover:bg-white/10 active:scale-95 transition-all rounded-xl cursor-pointer"
          title="Recalculate Stats"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Numerical Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[
          { label: "Total Recommendations", value: stats.totalRecommendations, icon: Cpu, desc: "Run in current DB node", color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/25" },
          { label: "Popular Fertilizer", value: stats.popularFertilizer, icon: Award, desc: "Highest soil deficiency match", color: "text-blue-500 bg-blue-500/10 border-blue-500/25" },
          { label: "Most Inundated Crop", value: stats.popularCrop, icon: BarChart3, desc: "Highest frequency selection", color: "text-amber-500 bg-amber-500/10 border-amber-500/25" },
          { label: "Feedback Forms Logged", value: stats.totalFeedback, icon: Users, desc: "Direct farmer surveys received", color: "text-purple-500 bg-purple-500/10 border-purple-500/25" }
        ].map((card, i) => (
          <div key={i} className="bg-slate-900/40 border border-slate-200/5 dark:border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">{card.label}</span>
              <div className={`p-2 rounded-lg border ${card.color}`}>
                <card.icon className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-lg md:text-2xl font-black text-slate-900 dark:text-white truncate">{card.value}</div>
              <div className="text-[10px] text-slate-500 mt-1">{card.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Average soil metrics banner */}
      <div className="p-4 bg-slate-900/30 border border-slate-200/5 dark:border-slate-800/50 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs">
        <div className="text-slate-400 font-medium">🔬 Computed Diagnostic Soil Averages across Farmers:</div>
        <div className="flex gap-6 font-mono text-slate-200">
          <div>Avg N: <span className="font-bold text-emerald-400">{stats.averages.avgN} mg/kg</span></div>
          <div>Avg P: <span className="font-bold text-blue-400">{stats.averages.avgP} mg/kg</span></div>
          <div>Avg K: <span className="font-bold text-amber-400">{stats.averages.avgK} mg/kg</span></div>
          <div>Avg pH: <span className="font-bold text-purple-400">{stats.averages.avgPH}</span></div>
        </div>
      </div>

      {/* Visual Charts section */}
      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Fertilizer Popularity Pie Chart */}
        <div className="bg-slate-900/40 border border-slate-200/5 dark:border-slate-800/80 rounded-2xl p-5 space-y-4 flex flex-col justify-between h-[360px]">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Fertilizer Popularity Ratio</h3>
            <p className="text-[11px] text-slate-500">Distribution of model recommendation categories.</p>
          </div>
          <div className="flex-1 min-h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.charts.fertilizers}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.charts.fertilizers.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: "#020617", borderColor: "#1e293b", borderRadius: "10px", fontSize: "11px" }}
                  itemStyle={{ color: "#f8fafc" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Legend */}
          <div className="flex flex-wrap gap-2 text-[10px] justify-center text-slate-400 font-medium">
            {stats.charts.fertilizers.map((item, index) => (
              <div key={index} className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                {item.name} ({item.value})
              </div>
            ))}
          </div>
        </div>

        {/* Crops Bar Chart */}
        <div className="bg-slate-900/40 border border-slate-200/5 dark:border-slate-800/80 rounded-2xl p-5 space-y-4 flex flex-col justify-between h-[360px]">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Crop Ingestion Distribution</h3>
            <p className="text-[11px] text-slate-500">Soil diagnostic counts cataloged per target crop.</p>
          </div>
          <div className="flex-1 min-h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.charts.crops}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#020617", borderColor: "#1e293b", borderRadius: "10px", fontSize: "11px" }}
                  itemStyle={{ color: "#f8fafc" }}
                  cursor={{ fill: "rgba(255,255,255,0.05)" }}
                />
                <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Prediction trend line chart */}
        <div className="bg-slate-900/40 border border-slate-200/5 dark:border-slate-800/80 rounded-2xl p-5 space-y-4 flex flex-col justify-between h-[360px]">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Monthly Diagnostic Volumes</h3>
            <p className="text-[11px] text-slate-500">Timeline monitoring farmer diagnostics runs.</p>
          </div>
          <div className="flex-1 min-h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.charts.monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.3} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#020617", borderColor: "#1e293b", borderRadius: "10px", fontSize: "11px" }}
                  itemStyle={{ color: "#f8fafc" }}
                />
                <Line type="monotone" dataKey="predictions" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Recent Predictions Stream logs */}
      <div className="bg-slate-900/40 border border-slate-200/5 dark:border-slate-800/80 rounded-2xl p-5 space-y-4">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Recent User Diagnostics Stream</h3>
          <p className="text-[11px] text-slate-500">Live operational log tracking recent predictions in real-time.</p>
        </div>
        <div className="space-y-2">
          {stats.recentPredictions.map((rec, i) => (
            <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-slate-950/40 rounded-xl border border-slate-800/60 text-xs gap-3">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <div>
                  <span className="font-extrabold text-slate-900 dark:text-white">Farmer recommended {rec.recommendedFertilizer}</span>
                  <span className="text-slate-500"> for </span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{rec.crop}</span>
                </div>
              </div>
              <div className="flex items-center gap-4 text-slate-500 font-mono text-[10px]">
                <span>N-P-K: {rec.N}-{rec.P}-{rec.K}</span>
                <span>{new Date(rec.date).toLocaleDateString()} {new Date(rec.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { Search, ArrowUpDown, Trash2, Download, AlertCircle, RefreshCw, Loader2, Calendar } from "lucide-react";
import { Recommendation } from "../types";

export default function HistoryView() {
  const [history, setHistory] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Filtering states
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [cropFilter, setCropFilter] = useState("");

  useEffect(() => {
    fetchHistory();
  }, [search, sortOrder, cropFilter]);

  const fetchHistory = async () => {
    setLoading(true);
    setError("");
    try {
      let url = `/api/history?sort=${sortOrder}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (cropFilter) url += `&crop=${encodeURIComponent(cropFilter)}`;

      const res = await fetch(url);
      const data = await res.json();
      if (res.ok) {
        setHistory(data);
      } else {
        setError("Failed to fetch historical database.");
      }
    } catch (err) {
      setError("Network error fetching diagnostics history.");
    } finally {
      setLoading(false);
    }
  };

  const deleteRecord = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this prediction from history?")) return;
    
    try {
      const res = await fetch(`/api/history/${id}`, { method: "DELETE" });
      if (res.ok) {
        setHistory(prev => prev.filter(item => item.id !== id));
      } else {
        alert("Failed to delete record.");
      }
    } catch (err) {
      alert("Error deleting record.");
    }
  };

  const uniqueCrops = Array.from(new Set(history.map(item => item.crop)));

  return (
    <div className="space-y-6 pb-12">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Diagnostics History Logs</h1>
          <p className="text-slate-600 dark:text-slate-400">Audit previous predictions, trace chemical deficits across farming seasons, and export raw logs.</p>
        </div>
        <a
          id="btn-export-csv"
          href="/api/download-csv"
          download="fertilizer_history.csv"
          className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg active:scale-95 whitespace-nowrap"
        >
          <Download className="w-4 h-4" /> Export CSV Log
        </a>
      </div>

      {/* Filters bar */}
      <div className="flex flex-col md:flex-row gap-4 bg-slate-900/40 border border-slate-200/5 dark:border-slate-800/80 rounded-2xl p-4">
        {/* Search Input */}
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search crop, fertilizer, location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800/60 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Crop filter */}
        <select
          value={cropFilter}
          onChange={(e) => setCropFilter(e.target.value)}
          className="bg-slate-950 border border-slate-800/60 rounded-xl px-4 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
        >
          <option value="">All Crops</option>
          {uniqueCrops.map((c, i) => (
            <option key={i} value={c}>{c}</option>
          ))}
        </select>

        {/* Sort */}
        <button
          onClick={() => setSortOrder(prev => prev === "newest" ? "oldest" : "newest")}
          className="px-4 py-2.5 bg-white/5 border border-white/10 text-white hover:bg-white/10 active:scale-95 transition-all text-xs rounded-xl flex items-center justify-center gap-2 font-semibold cursor-pointer"
        >
          <ArrowUpDown className="w-3.5 h-3.5" /> Sort: {sortOrder === "newest" ? "Newest First" : "Oldest First"}
        </button>

        {/* Refresh */}
        <button
          onClick={fetchHistory}
          className="p-2.5 bg-white/5 border border-white/10 text-white hover:bg-white/10 active:scale-95 transition-all rounded-xl cursor-pointer"
          title="Refresh History"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Table Section */}
      <div className="bg-slate-900/40 border border-slate-200/5 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-lg">
        {loading ? (
          <div className="py-24 text-center flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
            <span className="text-slate-400 text-sm font-medium">Connecting database history logs...</span>
          </div>
        ) : error ? (
          <div className="py-16 text-center text-rose-400 flex flex-col items-center justify-center gap-3">
            <AlertCircle className="w-8 h-8 text-rose-500" />
            <span className="text-sm font-semibold">{error}</span>
          </div>
        ) : history.length === 0 ? (
          <div className="py-24 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
            <Calendar className="w-8 h-8 text-slate-600" />
            <span className="text-sm font-semibold">No recommendations found in history database.</span>
            <span className="text-xs text-slate-600">Run the soil diagnostic form to populate history logs.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950/80 border-b border-slate-800/80 text-slate-400 uppercase tracking-wider font-bold">
                  <th className="p-4">Date</th>
                  <th className="p-4">Crop</th>
                  <th className="p-4">N-P-K</th>
                  <th className="p-4">pH</th>
                  <th className="p-4">Climate Params</th>
                  <th className="p-4">Recommended Fertilizer</th>
                  <th className="p-4 text-center">Confidence</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {history.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-950/40 transition-colors text-slate-800 dark:text-slate-200 font-medium">
                    <td className="p-4 whitespace-nowrap text-slate-500">
                      {new Date(item.date).toLocaleDateString()}
                    </td>
                    <td className="p-4 font-bold text-slate-900 dark:text-white">
                      {item.crop}
                    </td>
                    <td className="p-4 font-mono text-emerald-400 whitespace-nowrap">
                      {item.N}-{item.P}-{item.K}
                    </td>
                    <td className="p-4 font-bold">
                      {item.pH}
                    </td>
                    <td className="p-4 text-slate-500 space-y-0.5">
                      <div>Temp: {item.temperature}°C</div>
                      <div>Rain: {item.rainfall}mm</div>
                    </td>
                    <td className="p-4 font-extrabold text-slate-900 dark:text-white">
                      {item.recommendedFertilizer}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-extrabold ${item.confidence > 88 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                        {item.confidence}%
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => deleteRecord(item.id)}
                        className="p-1.5 hover:bg-rose-500/10 hover:text-rose-400 text-slate-500 rounded transition-all cursor-pointer"
                        title="Delete record from database"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

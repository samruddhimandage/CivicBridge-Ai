import React, { useState } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area 
} from "recharts";
import { 
  TrendingUp, AlertTriangle, CheckCircle2, Clock, Users, MapPin, 
  Search, Filter, SlidersHorizontal, ArrowUpRight, HelpCircle, AlertOctagon, 
  ExternalLink, Sparkles, AlertCircle 
} from "lucide-react";
import { Issue, NeighborhoodScore } from "../types";
import { Language } from "../translations";

interface CivicDashboardProps {
  issues: Issue[];
  neighborhoods: NeighborhoodScore[];
  currentLanguage: Language;
  t: (key: string) => string;
  onSelectIssue: (id: string) => void;
  onNavigate: (view: string) => void;
  predictiveInsights: string[];
}

export default function CivicDashboardView({ 
  issues, 
  neighborhoods, 
  currentLanguage, 
  t, 
  onSelectIssue, 
  onNavigate,
  predictiveInsights 
}: CivicDashboardProps) {
  
  // Filtering & Sorting State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedNeighborhood, setSelectedNeighborhood] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [sortBy, setSortBy] = useState<"priority" | "date">("priority");

  // Chart Data Calculations
  const categoryCounts = issues.reduce((acc, issue) => {
    acc[issue.category] = (acc[issue.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieChartData = Object.keys(categoryCounts).map(cat => ({
    name: t(cat === "Pothole" ? "pothole" : 
            cat === "Garbage Dump" ? "garbage" : 
            cat === "Water Leakage" ? "waterLeak" : 
            cat === "Broken Streetlight" ? "streetlight" : 
            cat === "Road Damage" ? "roadDamage" : 
            cat === "Drainage Problem" ? "drainage" : 
            cat === "Public Safety Issue" ? "safety" : 
            cat === "Illegal Dumping" ? "dumping" : "other"),
    value: categoryCounts[cat]
  }));

  const COLORS = ["#1E3A8A", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#14B8A6"];

  const trendData = [
    { month: "Jan", Potholes: 12, WaterLeaks: 18, Sanitation: 22 },
    { month: "Feb", Potholes: 8, WaterLeaks: 14, Sanitation: 19 },
    { month: "Mar", Potholes: 15, WaterLeaks: 25, Sanitation: 12 },
    { month: "Apr", Potholes: 22, WaterLeaks: 38, Sanitation: 15 },
    { month: "May", Potholes: 34, WaterLeaks: 42, Sanitation: 28 },
    { month: "Jun", Potholes: issues.filter(i => i.category === "Pothole").length + 20, WaterLeaks: issues.filter(i => i.category === "Water Leakage").length + 30, Sanitation: issues.filter(i => i.category === "Garbage Dump").length + 25 }
  ];

  // Map Pins Plotting coordinates logic
  // Map dimensions will be visual percentage coordinates inside Pune district grid bounds
  // Baner lat: 18.5594, Wakad lat: 18.5987, Kothrud lat: 18.5074
  const mapWidth = 600;
  const mapHeight = 350;

  // Simple min-max projection for map pins inside grid container
  const getCoordinates = (lat: number, lng: number) => {
    const minLat = 18.4800;
    const maxLat = 18.6200;
    const minLng = 73.7400;
    const maxLng = 73.8800;

    const x = ((lng - minLng) / (maxLng - minLng)) * 100;
    const y = 100 - ((lat - minLat) / (maxLat - minLat)) * 100; // invert y

    return { x: `${Math.max(5, Math.min(95, x))}%`, y: `${Math.max(5, Math.min(95, y))}%` };
  };

  // Filtered Issues computed list
  const filteredIssues = issues.filter(issue => {
    const matchesSearch = issue.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          issue.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          issue.location.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || issue.category === selectedCategory;
    const matchesNeighborhood = selectedNeighborhood === "All" || issue.location.neighborhood === selectedNeighborhood;
    const matchesStatus = selectedStatus === "All" || issue.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesNeighborhood && matchesStatus;
  }).sort((a, b) => {
    if (sortBy === "priority") {
      return b.priorityScore - a.priorityScore;
    } else {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  return (
    <div className="space-y-8" id="civic-dashboard-root">
      
      {/* Dynamic AI Predictive Insights Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <Sparkles className="h-44 w-44 text-white" />
        </div>
        
        <div className="flex items-center gap-2 mb-4">
          <span className="p-1 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
            <Sparkles className="h-4 w-4 animate-spin" />
          </span>
          <h3 className="text-sm font-bold uppercase tracking-wider text-blue-400">
            {t("predictiveTitle")}
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" id="predictive-ticker-grid">
          {predictiveInsights.map((insight, idx) => (
            <div 
              key={idx} 
              className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800 transition-colors flex items-start gap-2.5"
            >
              <AlertCircle className="h-4 w-4 text-orange-400 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                {insight}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Main Stats Counter Row */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4" id="statistics-counters-row">
        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex flex-col justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t("totalIssues")}</span>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-2xl font-extrabold text-slate-900">{issues.length}</span>
            <span className="text-[10px] text-emerald-500 font-semibold">+4 today</span>
          </div>
        </div>

        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex flex-col justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t("resolvedIssues")}</span>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-2xl font-extrabold text-emerald-600">{issues.filter(i => i.status === "Resolved").length}</span>
            <span className="text-[10px] text-slate-400">92% rate</span>
          </div>
        </div>

        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex flex-col justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t("pendingIssues")}</span>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-2xl font-extrabold text-amber-600">{issues.filter(i => i.status !== "Resolved" && i.status !== "Escalated").length}</span>
            <span className="text-[10px] text-amber-500 font-medium">In action</span>
          </div>
        </div>

        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex flex-col justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t("criticalIssues")}</span>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-2xl font-extrabold text-red-600">{issues.filter(i => i.severity === "Critical").length}</span>
            <span className="text-[10px] text-red-500 font-bold uppercase tracking-wider">Urgent</span>
          </div>
        </div>

        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex flex-col justify-between col-span-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t("avgResTime")}</span>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-2xl font-extrabold text-slate-900">4.2</span>
            <span className="text-[10px] text-slate-400">Days</span>
          </div>
        </div>

        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex flex-col justify-between col-span-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t("participationRate")}</span>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-2xl font-extrabold text-slate-900">88.4%</span>
            <span className="text-[10px] text-emerald-500 font-medium">Active</span>
          </div>
        </div>
      </div>

      {/* Interactive Charts and Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="dashboard-charts-grid">
        
        {/* Category breakdown (Pie chart) */}
        <div className="lg:col-span-4 bg-white border border-slate-100 p-6 rounded-2xl shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider flex items-center gap-1.5">
            <Filter className="h-4 w-4 text-blue-600" />
            {t("activeCategory")}
          </h3>
          <div className="h-64 flex items-center justify-center">
            {pieChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} incidents`, 'Reports']} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <span className="text-xs text-slate-400">No category breakdown data.</span>
            )}
          </div>

          {/* Simple custom legends */}
          <div className="grid grid-cols-2 gap-2 mt-4 text-[11px] text-slate-600">
            {pieChartData.map((entry, index) => (
              <div key={index} className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full inline-block" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="truncate">{entry.name} ({entry.value})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Temporal Trends */}
        <div className="lg:col-span-8 bg-white border border-slate-100 p-6 rounded-2xl shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            {t("Civic Resolution Vector Trends")}
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94A3B8" }} />
                <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11, pt: 10 }} />
                <Bar dataKey="Potholes" fill="#1E3A8A" radius={[4, 4, 0, 0]} />
                <Bar dataKey="WaterLeaks" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Sanitation" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Interactive Geolocation Heatmap Preview */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="h-4.5 w-4.5 text-blue-600 animate-bounce" />
              {t("Civic Incident Geospatial Dispatch Map")}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {t("pins show active incidents. color intensity indicates civic priority score (critical / high / medium).")}
            </p>
          </div>
          <span className="px-2.5 py-1 bg-emerald-50 rounded-full border border-emerald-100 text-emerald-700 text-xs font-semibold uppercase tracking-wide">
            {t("Live Ward Sync")}
          </span>
        </div>

        {/* Map stage container */}
        <div className="relative border border-slate-200 rounded-2xl overflow-hidden bg-slate-950 h-96 flex items-center justify-center">
          
          {/* Mock Satellite / Abstract Pune street outline canvas map */}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
          
          {/* Render map outlines visually */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" opacity="0.15">
            <path d="M50,100 Q150,250 300,100 T550,200" fill="none" stroke="white" strokeWidth="4" />
            <path d="M100,50 Q200,350 400,200 T600,400" fill="none" stroke="white" strokeWidth="3" />
            <path d="M300,50 L450,450" fill="none" stroke="white" strokeWidth="2" strokeDasharray="5,5" />
          </svg>

          {/* Render active pins dynamically */}
          {issues.map((issue) => {
            const { x, y } = getCoordinates(issue.location.lat, issue.location.lng);
            const isCritical = issue.severity === "Critical";
            const isHigh = issue.severity === "High";
            
            return (
              <button
                key={issue.id}
                id={`map-pin-btn-${issue.id}`}
                onClick={() => onSelectIssue(issue.id)}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer focus:outline-none z-20"
                style={{ left: x, top: y }}
              >
                {/* Glowing Heat Ring */}
                <div className={`absolute -inset-3.5 rounded-full animate-ping opacity-25 pointer-events-none ${
                  isCritical ? "bg-red-500" : isHigh ? "bg-orange-500" : "bg-blue-500"
                }`} />

                {/* Pin Head */}
                <div className={`relative h-7 w-7 rounded-full flex items-center justify-center shadow-lg border-2 border-white transition-all group-hover:scale-125 ${
                  isCritical ? "bg-red-600 text-white" : isHigh ? "bg-orange-500 text-white" : "bg-blue-600 text-white"
                }`}>
                  <MapPin className="h-3.5 w-3.5" />
                </div>

                {/* Tooltip on hover */}
                <div className="absolute left-1/2 -translate-x-1/2 bottom-8 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-slate-900 border border-slate-800 text-white p-2.5 rounded-xl shadow-2xl w-44 pointer-events-none z-30">
                  <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                    {issue.id} • Score: {issue.priorityScore}
                  </div>
                  <div className="font-semibold text-xs mt-0.5 text-white truncate">
                    {issue.category}
                  </div>
                  <div className="text-[10px] text-slate-300 truncate mt-0.5">
                    📍 {issue.location.address}
                  </div>
                </div>
              </button>
            );
          })}

          <div className="absolute top-3 left-3 bg-slate-900/90 border border-slate-800 text-white p-3 rounded-xl shadow-lg text-[10px] space-y-1.5 z-10">
            <span className="font-bold uppercase text-slate-400 tracking-wider">{t("Map Legend")}</span>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-red-600 inline-block" />
              <span>{t("critical severity (90+ priority)")}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-orange-500 inline-block" />
              <span>{t("high severity (60-89 priority)")}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-blue-600 inline-block" />
              <span>{t("standard (low / medium)")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Issue Listing */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
        
        {/* Filters Header block */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-5">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              id="search-issues-dashboard"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            
            {/* Category Filter */}
            <div className="flex items-center gap-1.5">
              <Filter className="h-3.5 w-3.5 text-slate-400" />
              <select
                id="filter-category-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none"
              >
                <option value="All">{t("All Categories")}</option>
                <option value="Pothole">{t("Pothole")}</option>
                <option value="Garbage Dump">{t("Garbage Dump")}</option>
                <option value="Water Leakage">{t("Water Leakage")}</option>
                <option value="Broken Streetlight">{t("Broken Streetlight")}</option>
                <option value="Road Damage">{t("Road Damage")}</option>
                <option value="Drainage Problem">{t("Drainage Problem")}</option>
                <option value="Public Safety Issue">{t("Public Safety Issue")}</option>
                <option value="Illegal Dumping">{t("Illegal Dumping")}</option>
              </select>
            </div>

            {/* Neighborhood Filter */}
            <select
              id="filter-neighborhood-select"
              value={selectedNeighborhood}
              onChange={(e) => setSelectedNeighborhood(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none"
            >
              <option value="All">{t("All Neighborhoods")}</option>
              <option value="Baner">{t("Baner")}</option>
              <option value="Kothrud">{t("Kothrud")}</option>
              <option value="Wakad">{t("Wakad")}</option>
              <option value="Aundh">{t("Aundh")}</option>
            </select>

            {/* Sort Filter */}
            <div className="flex items-center gap-1.5">
              <SlidersHorizontal className="h-3.5 w-3.5 text-slate-400" />
              <select
                id="sort-by-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none"
              >
                <option value="priority">{t("priority score (high-low)")}</option>
                <option value="date">{t("reporting date (newest)")}</option>
              </select>
            </div>

          </div>
        </div>

        {/* Issue list cards wrapper */}
        <div className="space-y-4" id="issues-list-wrapper">
          {filteredIssues.length > 0 ? (
            filteredIssues.map((issue) => {
              const isCritical = issue.severity === "Critical";
              const isHigh = issue.severity === "High";
              const isResolved = issue.status === "Resolved";
              
              return (
                <div
                  key={issue.id}
                  id={`issue-card-item-${issue.id}`}
                  onClick={() => onSelectIssue(issue.id)}
                  className="group p-5 rounded-2xl border border-slate-100 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/[0.02] cursor-pointer transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    {/* Urgency Color Badge */}
                    <div className={`h-11 w-11 rounded-full flex items-center justify-center shrink-0 ${
                      isResolved ? "bg-emerald-50 text-emerald-600" :
                      isCritical ? "bg-red-50 text-red-600" :
                      isHigh ? "bg-orange-50 text-orange-600" : "bg-blue-50 text-blue-600"
                    }`}>
                      {isResolved ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        <AlertTriangle className="h-5 w-5" />
                      )}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm tracking-tight group-hover:text-blue-700 transition-colors">
                          {t(issue.category)}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400 font-mono">
                          {issue.id}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          issue.status === "Resolved" ? "bg-emerald-50 text-emerald-700" :
                          issue.status === "Escalated" ? "bg-red-50 text-red-700" :
                          issue.status === "In Progress" ? "bg-blue-50 text-blue-700" : "bg-slate-100 text-slate-700"
                        }`}>
                          {t(issue.status)}
                        </span>
                      </div>

                      <p className="text-slate-500 text-xs mt-1.5 line-clamp-2 max-w-2xl leading-relaxed">
                        {issue.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 text-[10px] text-slate-400 font-medium">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-slate-400" />
                          {t(issue.location.address)}
                        </span>
                        <span>•</span>
                        <span>{new Date(issue.createdAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5 text-slate-400" />
                          {issue.verificationCount} {t("citizens confirmed")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Priority Gauge Side Panel */}
                  <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 border-slate-50 pt-3 md:pt-0 shrink-0">
                    <div className="text-left md:text-right">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                        {t("Priority Score")}
                      </span>
                      <span className={`text-xl font-black ${
                        isResolved ? "text-slate-400" :
                        isCritical ? "text-red-600 animate-pulse" :
                        isHigh ? "text-orange-500" : "text-blue-600"
                      }`}>
                        {issue.priorityScore}
                      </span>
                    </div>

                    <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <ArrowUpRight className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 text-slate-400 flex flex-col items-center justify-center">
              <HelpCircle className="h-8 w-8 text-slate-300 mb-2" />
              <span className="text-xs font-semibold">{t("no issues matching active filter criteria.")}</span>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}

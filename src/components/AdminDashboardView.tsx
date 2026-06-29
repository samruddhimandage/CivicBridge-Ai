import React, { useState } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area, LineChart, Line 
} from "recharts";
import { 
  Building2, TrendingUp, AlertTriangle, CheckCircle2, Clock, Users, MapPin, 
  Sparkles, ShieldAlert, FileText, ArrowUpRight, Search, Filter, Mail, ChevronRight,
  Gauge, HelpCircle, BarChart3, AlertOctagon, RefreshCw, Layers, AlertCircle
} from "lucide-react";
import { Issue, NeighborhoodScore } from "../types";
import { Language } from "../translations";

interface AdminDashboardProps {
  issues: Issue[];
  neighborhoods: NeighborhoodScore[];
  currentLanguage: Language;
  t: (key: string) => string;
  onSelectIssue: (id: string) => void;
  onNavigate: (view: string) => void;
}

export default function AdminDashboardView({ 
  issues, 
  neighborhoods, 
  currentLanguage, 
  t, 
  onSelectIssue, 
  onNavigate 
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<"analytics" | "routing" | "escalations" | "departments">("analytics");
  const [selectedWard, setSelectedWard] = useState<string>("All");
  const [selectedSeverity, setSelectedSeverity] = useState<string>("All");

  // Metrics calculations
  const totalReports = issues.length;
  const resolvedCount = issues.filter(i => i.status === "Resolved").length;
  const criticalCount = issues.filter(i => i.severity === "Critical" && i.status !== "Resolved").length;
  const openCount = totalReports - resolvedCount;
  const resolutionRate = totalReports > 0 ? Math.round((resolvedCount / totalReports) * 100) : 0;
  
  // Department routing stats
  const departmentsData = [
    { name: t("Public Works (Roads)"), active: issues.filter(i => i.category === "Pothole" || i.category === "Road Damage").length, resolved: 14, efficiency: "94%" },
    { name: t("Water & Sanitation"), active: issues.filter(i => i.category === "Water Leakage" || i.category === "Drainage Problem").length, resolved: 9, efficiency: "89%" },
    { name: t("Solid Waste Management"), active: issues.filter(i => i.category === "Garbage Dump" || i.category === "Illegal Dumping").length, resolved: 22, efficiency: "91%" },
    { name: t("Electrical & Grid Dept"), active: issues.filter(i => i.category === "Broken Streetlight").length, resolved: 11, efficiency: "85%" },
    { name: t("Traffic Control & Safety"), active: issues.filter(i => i.category === "Public Safety Issue" || i.category === "Other").length, resolved: 5, efficiency: "95%" }
  ];

  // Map coordinates projection
  const getCoordinates = (lat: number, lng: number) => {
    const minLat = 18.4800;
    const maxLat = 18.6200;
    const minLng = 73.7400;
    const maxLng = 73.8800;
    const x = ((lng - minLng) / (maxLng - minLng)) * 100;
    const y = 100 - ((lat - minLat) / (maxLat - minLat)) * 100;
    return { x: `${Math.max(5, Math.min(95, x))}%`, y: `${Math.max(5, Math.min(95, y))}%` };
  };

  // Filter issues for Heatmap & List
  const filteredIssues = issues.filter(i => {
    const matchesWard = selectedWard === "All" || i.location.neighborhood === selectedWard;
    const matchesSeverity = selectedSeverity === "All" || i.severity === selectedSeverity;
    return matchesWard && matchesSeverity;
  });

  // Recharts: Priority Breakdown chart
  const priorityChartData = [
    { range: t("90-100 (Critical)"), count: issues.filter(i => i.priorityScore >= 90).length, fill: "#EF4444" },
    { range: t("70-89 (High)"), count: issues.filter(i => i.priorityScore >= 70 && i.priorityScore < 90).length, fill: "#F59E0B" },
    { range: t("40-69 (Medium)"), count: issues.filter(i => i.priorityScore >= 40 && i.priorityScore < 70).length, fill: "#3B82F6" },
    { range: t("0-39 (Low)"), count: issues.filter(i => i.priorityScore < 40).length, fill: "#10B981" }
  ];

  // Recharts: Temporal line charts
  const monthlyMetrics = [
    { month: t("Jan"), reported: 24, resolved: 18, avgDays: 6.2 },
    { month: t("Feb"), reported: 32, resolved: 28, avgDays: 5.4 },
    { month: t("Mar"), reported: 45, resolved: 39, avgDays: 4.8 },
    { month: t("Apr"), reported: 38, resolved: 35, avgDays: 4.5 },
    { month: t("May"), reported: 54, resolved: 48, avgDays: 4.1 },
    { month: t("Jun"), reported: totalReports + 120, resolved: resolvedCount + 110, avgDays: 3.8 }
  ];

  // Escalatons tracking
  const nearEscalation = issues.filter(i => i.status !== "Resolved" && i.severity === "High" || i.severity === "Critical");

  return (
    <div className="space-y-6" id="admin-control-room-root">
      
      {/* Visual Guide explaining the Admin Control Room's Purpose */}
      <div className="bg-blue-50 border border-blue-100 rounded-3xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-3 bg-blue-600 text-white rounded-2xl shrink-0 mt-0.5 shadow-md shadow-blue-500/10">
            <Building2 className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-black text-slate-900 tracking-tight">{t("Understanding the Admin Control Room Dashboard")}</h3>
            <p className="text-xs text-slate-600 leading-relaxed max-w-4xl font-medium">
              {t("This dashboard simulates the backend systems used by municipal administrators, department officials, and ward commissioners. It visualizes the analytics of citizen complaints, showcases Gemini's automated routing to responsible departments (Roads, Sanitation, Traffic, Electrical), tracks SLA countdown timers, monitors automatic escalations, and highlights predictive issue hot-spots based on civic health data.")}
            </p>
          </div>
        </div>
      </div>

      {/* Admin Title Block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <Building2 className="h-44 w-44" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-orange-500/20 text-orange-400 border border-orange-500/30 font-bold text-xs uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="h-3 w-3 animate-spin" />
              {t("Department Routing Engine")}
            </span>
            <span className="px-2.5 py-0.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full text-[10px] uppercase font-bold tracking-wider animate-pulse">
              {t("Live Monitor")}
            </span>
          </div>
          <h2 className="text-2xl font-black mt-2 tracking-tight">
            {t("Smart City Municipal Control Room")}
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            {t("Real-time analytics, automated department routing, and predictive civic issue detection.")}
          </p>
        </div>

        {/* Admin Navigation Tabs */}
        <div className="flex bg-slate-800/80 p-1 rounded-xl border border-slate-700 text-xs font-semibold gap-1 z-10 shrink-0">
          <button 
            onClick={() => setActiveTab("analytics")}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${activeTab === "analytics" ? "bg-orange-500 text-white" : "text-slate-300 hover:text-white"}`}
          >
            <BarChart3 className="h-3.5 w-3.5" />
            {t("Analytics")}
          </button>
          <button 
            onClick={() => setActiveTab("routing")}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${activeTab === "routing" ? "bg-orange-500 text-white" : "text-slate-300 hover:text-white"}`}
          >
            <Layers className="h-3.5 w-3.5" />
            {t("Routing Intelligence")}
          </button>
          <button 
            onClick={() => setActiveTab("escalations")}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${activeTab === "escalations" ? "bg-orange-500 text-white" : "text-slate-300 hover:text-white"}`}
          >
            <ShieldAlert className="h-3.5 w-3.5" />
            {t("Escalation Monitor")}
          </button>
          <button 
            onClick={() => setActiveTab("departments")}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${activeTab === "departments" ? "bg-orange-500 text-white" : "text-slate-300 hover:text-white"}`}
          >
            <Building2 className="h-3.5 w-3.5" />
            {t("Departments")}
          </button>
        </div>
      </div>

      {/* Admin Metrics Summary Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">{t("Active Incidents")}</span>
          <div className="text-3xl font-black text-slate-950 mt-1">{openCount}</div>
          <div className="text-[10px] text-amber-600 font-semibold mt-1 flex items-center gap-1">
            <span>● {criticalCount} {t("Critical priority")}</span>
          </div>
        </div>

        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">{t("Resolution Rate")}</span>
          <div className="text-3xl font-black text-emerald-600 mt-1">{resolutionRate}%</div>
          <div className="text-[10px] text-slate-400 mt-1">
            {t("Avg")}: {resolvedCount} {t("resolved out of")} {totalReports}
          </div>
        </div>

        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">{t("Dispatch Accuracy")}</span>
          <div className="text-3xl font-black text-blue-600 mt-1">98.2%</div>
          <div className="text-[10px] text-emerald-600 font-semibold mt-1">
            {t("AI confidence verified")}
          </div>
        </div>

        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">{t("Escalation Countdowns")}</span>
          <div className="text-3xl font-black text-red-600 mt-1">{nearEscalation.length} {t("Cases")}</div>
          <div className="text-[10px] text-red-500 font-semibold mt-1">
            {t("Requires immediate oversight")}
          </div>
        </div>
      </div>

      {/* TAB: Analytics & Visual Trends */}
      {activeTab === "analytics" && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Priority Score Gauges */}
            <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm">
              <h3 className="text-xs font-bold text-slate-900 mb-4 uppercase tracking-widest flex items-center gap-2">
                <Gauge className="h-4 w-4 text-orange-500" />
                {t("Priority Score Breakdown")}
              </h3>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={priorityChartData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                    <YAxis dataKey="range" type="category" tick={{ fontSize: 9, fill: "#64748b" }} width={100} />
                    <Tooltip formatter={(value) => [`${value} ${t("Cases")}`, t('Volume')]} />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                      {priorityChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Monthly resolution vectors */}
            <div className="lg:col-span-2 bg-white border border-slate-100 p-6 rounded-2xl shadow-sm">
              <h3 className="text-xs font-bold text-slate-900 mb-4 uppercase tracking-widest flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                {t("Performance Temporal Vector Metrics")}
              </h3>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyMetrics}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                    <YAxis yAxisId="left" tick={{ fontSize: 10, fill: "#94a3b8" }} label={{ value: t('Cases Logged'), angle: -90, position: 'insideLeft', style: { fontSize: 10, fill: '#64748b' } }} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: "#94a3b8" }} label={{ value: t('Resolution Days'), angle: 90, position: 'insideRight', style: { fontSize: 10, fill: '#64748b' } }} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                    <Line yAxisId="left" type="monotone" dataKey="reported" stroke="#1E3A8A" strokeWidth={2.5} name={t("Reports Filed")} activeDot={{ r: 6 }} />
                    <Line yAxisId="left" type="monotone" dataKey="resolved" stroke="#10B981" strokeWidth={2} name={t("Reports Closed")} />
                    <Line yAxisId="right" type="monotone" dataKey="avgDays" stroke="#F59E0B" strokeWidth={2} strokeDasharray="3 3" name={t("Average Days to Fix")} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Interactive Geospatial Dispatch Map */}
          <div className="bg-slate-950 border border-slate-900 text-white rounded-3xl p-6 shadow-2xl relative">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div>
                <span className="px-2.5 py-0.5 bg-orange-500/10 border border-orange-500/20 rounded-full text-[10px] font-bold uppercase tracking-wider text-orange-400">
                  {t("Heatmap Overlay")}
                </span>
                <h3 className="text-base font-black tracking-tight mt-1">
                  {t("Active Dispatch Heatmap & Geographic Grid")}
                </h3>
              </div>
              
              {/* Map Filters */}
              <div className="flex items-center gap-3">
                <select 
                  value={selectedWard}
                  onChange={(e) => setSelectedWard(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none"
                >
                  <option value="All">{t("All Wards")}</option>
                  <option value="Kothrud">{t("Kothrud Ward")}</option>
                  <option value="Baner">{t("Baner Ward")}</option>
                  <option value="Wakad">{t("Wakad Ward")}</option>
                  <option value="Aundh">{t("Aundh Ward")}</option>
                </select>

                <select 
                  value={selectedSeverity}
                  onChange={(e) => setSelectedSeverity(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none"
                >
                  <option value="All">{t("All Severities")}</option>
                  <option value="Critical">{t("Critical Only")}</option>
                  <option value="High">{t("High Only")}</option>
                  <option value="Medium">{t("Medium Only")}</option>
                  <option value="Low">{t("Low Only")}</option>
                </select>
              </div>
            </div>

            {/* Interactive Map Surface */}
            <div className="relative h-96 border border-slate-800 rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center">
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]" />
              
              <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none">
                <path d="M100,50 C300,100 200,300 500,150 S400,500 700,300" fill="none" stroke="white" strokeWidth="4" />
                <path d="M50,200 Q250,400 650,250" fill="none" stroke="white" strokeWidth="2" strokeDasharray="5,5" />
              </svg>

              {filteredIssues.map(issue => {
                const { x, y } = getCoordinates(issue.location.lat, issue.location.lng);
                const isCritical = issue.severity === "Critical";
                const isHigh = issue.severity === "High";

                return (
                  <button
                    key={issue.id}
                    onClick={() => onSelectIssue(issue.id)}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer focus:outline-none z-10"
                    style={{ left: x, top: y }}
                  >
                    <div className={`absolute -inset-3.5 rounded-full animate-ping opacity-25 pointer-events-none ${
                      isCritical ? "bg-red-500" : isHigh ? "bg-orange-500" : "bg-blue-500"
                    }`} />
                    <div className={`relative h-6.5 w-6.5 rounded-full flex items-center justify-center shadow-lg border-2 border-white transition-all group-hover:scale-125 ${
                      isCritical ? "bg-red-600 text-white" : isHigh ? "bg-orange-500 text-white" : "bg-blue-600 text-white"
                    }`}>
                      <MapPin className="h-3 w-3" />
                    </div>
                    {/* Tooltip */}
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-8 opacity-0 group-hover:opacity-100 transition-all bg-slate-900 border border-slate-800 text-white p-2.5 rounded-xl shadow-2xl w-44 pointer-events-none z-30">
                      <div className="text-[9px] uppercase font-bold tracking-wider text-slate-400">
                        {issue.id} • {t("Priority")}: {issue.priorityScore}
                      </div>
                      <div className="font-bold text-xs mt-0.5 truncate text-white">{t(issue.category)}</div>
                      <div className="text-[10px] text-slate-300 truncate mt-0.5">📍 {issue.location.address}</div>
                    </div>
                  </button>
                );
              })}

              {filteredIssues.length === 0 && (
                <div className="text-slate-500 text-xs font-semibold z-10 flex flex-col items-center gap-2">
                  <AlertCircle className="h-6 w-6 text-slate-600" />
                  {t("No issues matches active geospatial filter parameters.")}
                </div>
              )}

              {/* Map Legend */}
              <div className="absolute bottom-4 left-4 bg-slate-900/90 border border-slate-800 text-white p-3 rounded-xl shadow-lg text-[10px] space-y-1.5 z-10">
                <span className="font-bold uppercase text-slate-400 tracking-wider block">{t("Heatmap Legend")}</span>
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-600 inline-block" />
                  <span>{t("Critical Density (90+)")}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-orange-500 inline-block" />
                  <span>{t("High Density (70-89)")}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-blue-600 inline-block" />
                  <span>{t("Standard Area Alerts (0-69)")}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: Routing Intelligence */}
      {activeTab === "routing" && (
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm animate-fade-in space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
              <Layers className="h-4.5 w-4.5 text-blue-600" />
              {t("AI Routing and Duplicate Detection Logs")}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {t("Deep Neural matching consolidates duplicate reports within a 50m radius and suggests official administrative routes instantly.")}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 space-y-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">{t("Active Routing Queues")}</span>
              
              {issues.slice(0, 5).map(issue => (
                <div key={issue.id} className="p-4 border border-slate-100 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-slate-400">{issue.id}</span>
                      <span className="text-xs font-bold text-slate-800">{t(issue.category)}</span>
                      <span className="px-2 py-0.5 bg-blue-50 border border-blue-100 rounded text-[9px] font-bold text-blue-700">
                        {t("Confidence")}: {issue.aiAnalysis?.classification.confidence || 97}%
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1.5 line-clamp-1 italic">
                      "{issue.description}"
                    </p>
                    <div className="text-[10px] text-slate-400 font-semibold mt-1">
                      {t("Mapped Authority")}: {t(issue.aiAnalysis?.responsibleAuthority.name || "Central Municipal Desk")}
                    </div>
                  </div>

                  <button 
                    onClick={() => onSelectIssue(issue.id)}
                    className="self-start sm:self-center px-3 py-1.5 bg-white border border-slate-200 hover:border-blue-500 hover:text-blue-600 rounded-xl text-[10px] font-bold transition-all flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    {t("Details")} <ArrowUpRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Side AI explanation details */}
            <div className="lg:col-span-4 bg-slate-50 border border-slate-100 p-5 rounded-2xl space-y-4">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-orange-500" />
                {t("Duplicate Detection Insights")}
              </h4>
              <div className="text-xs text-slate-600 space-y-3 leading-relaxed">
                <p>
                  {t("CivicBridge AI scans reported tickets' geographic markers and textual details to isolate cluster spikes.")}
                </p>
                <div className="p-3 bg-white rounded-xl border border-slate-100 text-[10px] space-y-1">
                  <div className="font-bold text-slate-800">{t("Cluster Found")}: {t("Orchid Lane")}</div>
                  <div className="text-slate-400">{t("Detected: 4 duplicate complaints merged.")}</div>
                  <div className="text-emerald-600 font-bold mt-1">{t("Auto-Consolidation")}: {t("Successful")}</div>
                </div>
                <p className="text-[10px] text-slate-400 font-medium">
                  {t("Merging reports prevents duplicate municipal work orders and aggregates community weight for faster response times.")}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: Escalation Monitoring */}
      {activeTab === "escalations" && (
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm animate-fade-in space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                <ShieldAlert className="h-4.5 w-4.5 text-red-600 animate-pulse" />
                {t("Smart Escalation & Notification Dashboard")}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {t("Monitors pending high-severity cases nearing the SLA deadline. Automatically generates notices for executive officials.")}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* List of critical issues facing SLA expiration */}
            <div className="lg:col-span-7 space-y-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">{t("Approaching SLA Deadline")}</span>
              
              {nearEscalation.slice(0, 3).map(issue => (
                <div key={issue.id} className="p-4 border border-red-100 rounded-xl bg-red-50/10 hover:bg-red-50/20 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-mono font-bold text-slate-400">{issue.id}</span>
                      <span className="text-xs font-bold text-slate-800">{t(issue.category)}</span>
                      <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[8px] font-extrabold rounded uppercase tracking-wider">
                        {t("Critical SLA")}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 max-w-md line-clamp-1">📍 {issue.location.address}</p>
                    <div className="text-[10px] text-red-600 font-bold flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {t("Auto-escalation in 2 days")}
                    </div>
                  </div>

                  <button 
                    onClick={() => onSelectIssue(issue.id)}
                    className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-[10px] font-bold shadow transition-all shrink-0 cursor-pointer"
                  >
                    {t("Preview Official Letter")}
                  </button>
                </div>
              ))}
            </div>

            {/* Smart SLA Explanation */}
            <div className="lg:col-span-5 bg-slate-50 border border-slate-100 p-5 rounded-2xl space-y-4">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-blue-600" />
                {t("Automated Escalation Protocol")}
              </h4>
              <div className="space-y-4 text-xs text-slate-600">
                <div className="space-y-2">
                  <div className="flex items-center justify-between font-semibold text-slate-700">
                    <span>{t("Day 0: Issue Reported")}</span>
                    <span className="text-slate-400">{t("Log & Map")}</span>
                  </div>
                  <div className="flex items-center justify-between font-semibold text-slate-700">
                    <span>{t("Day 7: First System Reminder")}</span>
                    <span className="text-slate-400">{t("Department SLA")}</span>
                  </div>
                  <div className="flex items-center justify-between font-semibold text-red-600">
                    <span>{t("Day 14: Executive Escalation")}</span>
                    <span>{t("Direct Commissioner Alert")}</span>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed pt-2 border-t border-slate-200">
                  {t("By preparing legal drafts and alerting division leads simultaneously, CivicBridge AI ensures transparency and forces accelerated repair timelines.")}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: Department Performance matrix */}
      {activeTab === "departments" && (
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm animate-fade-in space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
              <Building2 className="h-4.5 w-4.5 text-blue-600" />
              {t("Municipal Departments Efficiency Matrix")}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {t("Comparison statistics detailing department workload distribution and automated SLA response benchmarks.")}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-slate-600 text-left">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[9px]">
                  <th className="py-3 px-4">{t("Department Name")}</th>
                  <th className="py-3 px-4">{t("Active Cases Logged")}</th>
                  <th className="py-3 px-4">{t("Resolved (Month)")}</th>
                  <th className="py-3 px-4">{t("Performance Rate")}</th>
                  <th className="py-3 px-4 text-right">{t("Oversight")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {departmentsData.map((dept, index) => (
                  <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">{dept.name}</td>
                    <td className="py-3 px-4 text-slate-700">{dept.active} {t("Active")}</td>
                    <td className="py-3 px-4 text-emerald-600 font-semibold">{dept.resolved} {t("Closed")}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-slate-800">{dept.efficiency}</span>
                        <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className="bg-emerald-500 h-1.5 rounded-full" 
                            style={{ width: dept.efficiency }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button 
                        onClick={() => alert(t("Reviewing direct SLA contracts for") + ` ${dept.name}`)}
                        className="text-blue-600 hover:underline font-bold"
                      >
                        {t("Audit SLA")}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}

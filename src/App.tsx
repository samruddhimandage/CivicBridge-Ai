import React, { useState, useEffect } from "react";
import { 
  Building2, PlusCircle, LayoutDashboard, Trophy, Home, HelpCircle, 
  Sparkles, Globe, ArrowRight, ChevronRight, MessageSquare, AlertOctagon, 
  MapPin, CheckCircle2, Navigation, Loader2, ArrowUpRight, ShieldCheck, 
  Check, FileText, Info, Award, BarChart3, Clock, Flame, ShieldAlert,
  Terminal, ShieldCheck as VerifiedIcon, Camera, Users
} from "lucide-react";
import { collection, getDocs, doc, setDoc, writeBatch } from "firebase/firestore";
import { db } from "./firebase";
import { Language, UI_TRANSLATIONS, CUSTOM_DICTIONARY } from "./translations";
import { Issue, NeighborhoodScore, Contributor } from "./types";
import { STARTING_ISSUES, NEIGHBORHOODS, CONTRIBUTORS } from "./mockData";

// Views components imports
import LanguageSelector from "./components/LanguageSelector";
import ReportIssueView from "./components/ReportIssueView";
import CivicDashboardView from "./components/CivicDashboardView";
import LeaderboardView from "./components/LeaderboardView";
import IssueDetailView from "./components/IssueDetailView";
import AdminDashboardView from "./components/AdminDashboardView";

export default function App() {
  // Global States
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem("civic_lang") as Language) || "English";
  });
  
  const [experienceMode, setExperienceMode] = useState<"citizen" | "admin">("citizen");
  const [view, setView] = useState<string>("home"); // "home" | "report" | "dashboard" | "leaderboard" | "issue-detail" | "admin-dashboard"
  
  const [issues, setIssues] = useState<Issue[]>(() => {
    try {
      const localIssuesStr = localStorage.getItem("civic_issues");
      if (localIssuesStr) {
        const parsed = JSON.parse(localIssuesStr) as Issue[];
        if (parsed && parsed.length > 0) {
          return parsed.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }
      }
    } catch (e) {
      console.warn("Failed to parse initial issues from localStorage", e);
    }
    const initial = [...STARTING_ISSUES].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    try {
      localStorage.setItem("civic_issues", JSON.stringify(initial));
    } catch (e) {}
    return initial;
  });

  const [neighborhoods, setNeighborhoods] = useState<NeighborhoodScore[]>(() => {
    const initialIssues = (() => {
      try {
        const localIssuesStr = localStorage.getItem("civic_issues");
        if (localIssuesStr) {
          const parsed = JSON.parse(localIssuesStr) as Issue[];
          if (parsed && parsed.length > 0) {
            return parsed;
          }
        }
      } catch (e) {}
      return STARTING_ISSUES;
    })();
    const baseList = [...NEIGHBORHOODS];
    const computed = baseList.map(neigh => {
      const related = initialIssues.filter(i => i.location.neighborhood === neigh.name);
      if (related.length === 0) return neigh;
      const resolved = related.filter(i => i.status === "Resolved").length;
      const reported = related.length;
      const pendingCritical = related.filter(i => i.severity === "Critical" && i.status !== "Resolved").length;
      const pendingHigh = related.filter(i => i.severity === "High" && i.status !== "Resolved").length;
      const totalPending = related.filter(i => i.status !== "Resolved").length;
      let score = 90 - (pendingCritical * 12) - (pendingHigh * 6) - (totalPending * 2) + (resolved * 3);
      score = Math.max(35, Math.min(100, Math.round(score)));
      let grade: "A+" | "A" | "B" | "C" | "D" = "B";
      if (score >= 90) grade = "A+";
      else if (score >= 80) grade = "A";
      else if (score >= 70) grade = "B";
      else if (score >= 55) grade = "C";
      else grade = "D";
      return { name: neigh.name, score, reported, resolved, grade };
    });
    return computed.sort((a, b) => b.score - a.score);
  });

  const [contributors, setContributors] = useState<Contributor[]>(CONTRIBUTORS);
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  
  // Dynamic AI Predictive insights
  const [predictiveInsights, setPredictiveInsights] = useState<string[]>([
    "Ward 3: Water pipeline stress elevated. 42% spike in leakage reports near sector junctions.",
    "Road Department: Monsoon season potholes detected ahead of historical curve in South zone.",
    "Electricity: Broken streetlights are correlating with 18% higher nighttime public safety flags.",
    "Sanitation: Drainage blockage reports tend to cluster 2 days after rainfall (>20mm)."
  ]);

  const [loading, setLoading] = useState<boolean>(false);

  // SLA Demonstration States (30-second Demo mode)
  const [showDemoModal, setShowDemoModal] = useState<boolean>(false);
  const [showHowItWorks, setShowHowItWorks] = useState<boolean>(false);
  const [demoStep, setDemoStep] = useState<number>(0);
  const [demoProgress, setDemoProgress] = useState<number>(0);
  const [demoStatus, setDemoStatus] = useState<string>("");

  // Dynamic Translations Dictionary Helper
  const t = (key: string) => {
    if (!key) return "";
    const cleanKey = key.trim();
    // 1. Direct translation key match
    if (UI_TRANSLATIONS[language]?.[cleanKey]) {
      return UI_TRANSLATIONS[language][cleanKey];
    }
    // 2. Reverse match from English key in UI_TRANSLATIONS
    const engUI = UI_TRANSLATIONS["English"] || {};
    const foundUIKey = Object.keys(engUI).find(k => engUI[k]?.toLowerCase() === cleanKey.toLowerCase());
    if (foundUIKey && UI_TRANSLATIONS[language]?.[foundUIKey]) {
      return UI_TRANSLATIONS[language][foundUIKey];
    }
    // 3. Custom dictionary exact or lowercase match
    const lowerKey = cleanKey.toLowerCase();
    const customDict = CUSTOM_DICTIONARY[language] || {};
    const foundCustomVal = customDict[cleanKey] || customDict[lowerKey];
    if (foundCustomVal) {
      return foundCustomVal;
    }
    // 4. Case-insensitive lookup in CUSTOM_DICTIONARY
    const foundCustomKey = Object.keys(customDict).find(k => k.toLowerCase() === lowerKey);
    if (foundCustomKey && customDict[foundCustomKey]) {
      return customDict[foundCustomKey];
    }
    // Fallback
    return UI_TRANSLATIONS["English"]?.[cleanKey] || key;
  };

  // URL Hash Router Hook to align Citizen and Admin Experiences
  useEffect(() => {
    const handleHashRouter = () => {
      if (window.location.hash === "#admin") {
        setExperienceMode("admin");
        setView("admin-dashboard");
      } else {
        setExperienceMode("citizen");
        if (view === "admin-dashboard") {
          setView("home");
        }
      }
    };
    handleHashRouter();
    window.addEventListener("hashchange", handleHashRouter);
    return () => window.removeEventListener("hashchange", handleHashRouter);
  }, [view]);

  // Sync Issues from Firestore & Local Storage in the background
  useEffect(() => {
    const syncWithFirestore = async () => {
      try {
        const issuesCol = collection(db, "issues");
        const snapshot = await getDocs(issuesCol);
        
        let fetched: Issue[] = [];
        snapshot.forEach((docSnap) => {
          fetched.push({ id: docSnap.id, ...docSnap.data() } as Issue);
        });

        // If cloud database is empty, seed starting data in a fast atomic batch write
        if (fetched.length === 0) {
          console.log("Firestore empty. Seeding starting data...");
          const batch = writeBatch(db);
          STARTING_ISSUES.forEach((starter) => {
            const docRef = doc(db, "issues", starter.id);
            batch.set(docRef, starter);
          });
          await batch.commit();
          fetched = [...STARTING_ISSUES];
        }

        // Merge with any unsynced local storage issues
        const localIssuesStr = localStorage.getItem("civic_issues") || "[]";
        const localIssues = JSON.parse(localIssuesStr) as Issue[];
        
        // Match lists and find missing local/remote entries
        const merged = [...fetched];
        const missingInCloud: Issue[] = [];
        
        localIssues.forEach(local => {
          if (!merged.some(m => m.id === local.id)) {
            merged.unshift(local);
            missingInCloud.push(local);
          }
        });

        // Sort by date newest
        merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setIssues(merged);
        localStorage.setItem("civic_issues", JSON.stringify(merged));
        
        // Compute Area Civic Health scores based on current live issues
        recomputeNeighborhoodScores(merged);

        // Upload any local-only tickets to Firestore asynchronously in an atomic batch
        if (missingInCloud.length > 0) {
          const batch = writeBatch(db);
          missingInCloud.forEach(local => {
            const docRef = doc(db, "issues", local.id);
            batch.set(docRef, local);
          });
          await batch.commit().catch(e => console.error("Auto batch sync backup fail:", e));
        }

      } catch (err) {
        console.warn("Firestore background synchronization pending/failed:", err);
      }
    };

    syncWithFirestore();
  }, []);

  // Fetch dynamic AI predictive insights ticker whenever issues update or language changes
  useEffect(() => {
    if (issues.length === 0) return;
    
    const fetchInsights = async () => {
      try {
        const response = await fetch("/api/predictive-insights", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ currentIssues: issues.slice(0, 5), language })
        });
        const data = await response.json();
        if (data.insights && data.insights.length > 0) {
          setPredictiveInsights(data.insights);
        }
      } catch (e) {
        console.warn("Could not generate AI insights, using baseline predictions.");
      }
    };

    fetchInsights();
  }, [issues, language]);

  const recomputeNeighborhoodScores = (allIssues: Issue[]) => {
    const baseList = [...NEIGHBORHOODS];
    const computed = baseList.map(neigh => {
      const related = allIssues.filter(i => i.location.neighborhood === neigh.name);
      if (related.length === 0) return neigh;
      
      const resolved = related.filter(i => i.status === "Resolved").length;
      const reported = related.length;
      
      const pendingCritical = related.filter(i => i.severity === "Critical" && i.status !== "Resolved").length;
      const pendingHigh = related.filter(i => i.severity === "High" && i.status !== "Resolved").length;
      const totalPending = related.filter(i => i.status !== "Resolved").length;
      
      let score = 90 - (pendingCritical * 12) - (pendingHigh * 6) - (totalPending * 2) + (resolved * 3);
      score = Math.max(35, Math.min(100, Math.round(score)));
      
      let grade: "A+" | "A" | "B" | "C" | "D" = "B";
      if (score >= 90) grade = "A+";
      else if (score >= 80) grade = "A";
      else if (score >= 70) grade = "B";
      else if (score >= 55) grade = "C";
      else grade = "D";

      return {
        name: neigh.name,
        score,
        reported,
        resolved,
        grade
      };
    });

    computed.sort((a, b) => b.score - a.score);
    setNeighborhoods(computed);
  };

  const handleLanguageChange = (newLang: Language) => {
    setLanguage(newLang);
    localStorage.setItem("civic_lang", newLang);
  };

  const handleIssueCreated = async (newIssueId: string) => {
    const localIssuesStr = localStorage.getItem("civic_issues") || "[]";
    const localIssues = JSON.parse(localIssuesStr) as Issue[];
    setIssues(localIssues);
    recomputeNeighborhoodScores(localIssues);

    setSelectedIssueId(newIssueId);
    setView("issue-detail");

    // Persist to Cloud Firestore immediately to secure the AI Analysis details
    const createdIssue = localIssues.find(i => i.id === newIssueId);
    if (createdIssue) {
      try {
        await setDoc(doc(db, "issues", newIssueId), createdIssue);
      } catch (e) {
        console.warn("Cloud write pending for new issue, saved locally:", e);
      }
    }
  };

  const handleUpdateIssue = async (updated: Issue) => {
    const storedIssuesStr = localStorage.getItem("civic_issues") || "[]";
    const storedIssues = JSON.parse(storedIssuesStr) as Issue[];
    const index = storedIssues.findIndex(i => i.id === updated.id);
    if (index !== -1) {
      storedIssues[index] = updated;
    } else {
      storedIssues.unshift(updated);
    }
    localStorage.setItem("civic_issues", JSON.stringify(storedIssues));
    setIssues(storedIssues);
    recomputeNeighborhoodScores(storedIssues);

    try {
      await setDoc(doc(db, "issues", updated.id), updated);
    } catch (e) {
      console.warn("Cloud write pending, saved locally:", e);
    }
  };

  const handleSelectIssue = (id: string) => {
    setSelectedIssueId(id);
    setView("issue-detail");
  };

  const selectedIssue = issues.find(i => i.id === selectedIssueId) || (() => {
    if (!selectedIssueId) return undefined;
    try {
      const localIssuesStr = localStorage.getItem("civic_issues") || "[]";
      const localIssues = JSON.parse(localIssuesStr) as Issue[];
      return localIssues.find(i => i.id === selectedIssueId);
    } catch (e) {
      return undefined;
    }
  })();

  // 30-Second AI Demo Execution Strategy
  const runAiDemoWorkflow = () => {
    setShowDemoModal(true);
    setDemoStep(1);
    setDemoProgress(10);
    setDemoStatus("Locking mock photographic evidence of road displacement hazard...");

    setTimeout(() => {
      setDemoStep(2);
      setDemoProgress(35);
      setDemoStatus("Running Gemini visual pixel classification for category match...");
    }, 1500);

    setTimeout(() => {
      setDemoStep(3);
      setDemoProgress(60);
      setDemoStatus("Mapping GPS proximity overlaps. Triggered risk matrix (School Zone = true)...");
    }, 3000);

    setTimeout(() => {
      setDemoStep(4);
      setDemoProgress(85);
      setDemoStatus("Compiling formal grievance letter addressed to Public Works Roads Department...");
    }, 4500);

    setTimeout(() => {
      setDemoStep(5);
      setDemoProgress(100);
      setDemoStatus("SLA Routing Secure! Dynamic resolution milestones mapped to calendar registry.");
    }, 6000);
  };

  const finalizeDemoTicketAndRedirect = () => {
    const ticketId = `CB-DEMO-${Math.floor(1000 + Math.random() * 9000)}`;
    const mockDemoIssue: Issue = {
      id: ticketId,
      category: "Pothole",
      description: "Huge unstable crater located directly adjacent to a primary nursery entrance. Represents an urgent risk to pedestrians and turning vehicles.",
      location: {
        address: "Lane 4, Opposite DAV Public School, Baner",
        lat: 18.5594,
        lng: 73.7915,
        neighborhood: "Baner"
      },
      status: "Verified",
      severity: "Critical",
      priorityScore: 94,
      verificationCount: 8,
      votedUserIds: [],
      createdAt: new Date().toISOString(),
      comments: [
        {
          id: "demo-system",
          author: "CivicBridge AI Autopilot",
          text: "Demo diagnostic initialized. Safety risk isolated: School Zone Proximity. Priority score computed: 94/100. Formal demand routing applied.",
          createdAt: new Date().toISOString(),
          badge: "AI Agent"
        }
      ],
      aiAnalysis: {
        classification: {
          detectedCategory: "Pothole / Road Disruption",
          confidence: 99,
          reasoning: "Visual pixel data indicates heavy surface abrasion matching a deep pothole. Spatial coordinate overlap verifies proximity to a school zone."
        },
        severity: {
          level: "Critical",
          reasoning: "High traffic density paired with school bus drop points elevates safety risk significantly."
        },
        priorityScore: {
          score: 94,
          breakdown: {
            safetyRisk: "Critical Hazard Proximity",
            populationAffected: "Moderate Zonal Congestion",
            schoolZone: "Critical Proximity (+40 Pts)",
            hospitalZone: "Standard (+0 Pts)",
            trafficImpact: "Extremely High Congestion Zone (+30 Pts)"
          }
        },
        responsibleAuthority: {
          name: "Public Works Road Engineering",
          address: "Zonal Ward Office, Central Division",
          contact: "+91-11-25501104",
          email: "road-grievances@authority.gov.in",
          website: "https://authority.gov.in"
        },
        professionalComplaint: `To,\nThe Zonal Commissioner,\nMunicipal Authority Department,\n\nSubject: Formal Notice under SLA Protocols - Urgent road hazard repair opposite DAV School.\n\nDear Sir/Madam,\n\nWe hereby bring to your immediate attention a severe crater pothole located at the coordinates opposite DAV School. This represents an active safety threat. Under Service Level Agreements, road infrastructure damage must be addressed within 3-5 business days. Please dispatch field crew immediately.\n\nSincerely,\nLocal Residents & CivicBridge AI`,
        escalationTimeline: {
          escDay7: "Escalated automatically to Deputy Chief Zonal Commissioner.",
          escDay14: "Escalated automatically to Zonal Chief Commissioner, Central Office.",
          timelineDesc: "Active SLA Protection Countdown Timer triggered"
        },
        escalationLetter: `Subject: SECOND NOTICE - EXPIRED SLA DEADLINE - DAV School road hazard\n\nTo,\nThe Chief Commissioner, Central Office.\n\nThis is an official escalation regarding the unresolved road hazard opposite DAV School. The initial Day 3 SLA has passed with no remedial works registered on site. We demand immediate intervention.\n\nSincerely,\nCivicBridge AI SLA Autopilot`,
        resolutionPlan: [
          { step: 1, title: "Register", desc: "Ticket dispatched to Baner Road Engineering registry.", status: "completed" },
          { step: 2, title: "SLA Countdown", desc: "Initiating 3-day resolution timer.", status: "completed" },
          { step: 3, title: "Crew Dispatch", desc: "Allocating on-site repair team.", status: "pending" },
          { step: 4, title: "Close Loop", desc: "Sourcing citizen validation photos.", status: "pending" }
        ],
        communityActions: [
          "Maintain speed under 20km/h near DAV entrance.",
          "Coordinate upvotes to force direct executive scheduling."
        ],
        predictiveInsights: "Pothole frequency in school zone during pre-monsoon increases risk by 35%"
      }
    };

    // Save locally
    const stored = [mockDemoIssue, ...issues];
    setIssues(stored);
    localStorage.setItem("civic_issues", JSON.stringify(stored));
    recomputeNeighborhoodScores(stored);

    setSelectedIssueId(ticketId);
    setShowDemoModal(false);
    setView("issue-detail");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col font-sans selection:bg-blue-600/10 selection:text-blue-700" id="civicbridge-app-root">
      
      {/* 1. Global Navigation Header */}
      <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-8 shrink-0 z-40 sticky top-0 shadow-sm" id="global-navigation-header">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView("home")}>
          <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black shadow shadow-blue-500/20">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-black text-slate-900 text-sm tracking-tight flex items-center gap-1">
              CivicBridge AI
              <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 text-[8px] font-black uppercase rounded tracking-wider border border-blue-100">PRO</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              India Civic Network
            </p>
          </div>
        </div>

        {/* Dynamic Mode Switcher & Tab Toggles */}
        <div className="hidden lg:flex items-center gap-1 bg-slate-50 border border-slate-100 p-1 rounded-xl">
          <button
            onClick={() => {
              setExperienceMode("citizen");
              window.location.hash = "";
              if (view === "admin-dashboard") setView("home");
            }}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              experienceMode === "citizen" 
                ? "bg-white text-blue-600 shadow-sm border border-slate-100" 
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Citizen Terminal
          </button>
          <button
            onClick={() => {
              setExperienceMode("admin");
              window.location.hash = "admin";
              setView("admin-dashboard");
            }}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              experienceMode === "admin" 
                ? "bg-slate-900 text-white shadow-sm" 
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Terminal className="h-3.5 w-3.5" />
            Admin Control Room
          </button>
        </div>

        {/* Navigation Actions */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              if (experienceMode === "admin") {
                setView("admin-dashboard");
              } else {
                setView("home");
              }
            }}
            className="text-xs font-bold text-slate-500 hover:text-slate-800 hidden sm:inline cursor-pointer"
          >
            {t("Search Directory")}
          </button>

          <button
            onClick={() => setShowHowItWorks(true)}
            className="flex items-center gap-1 px-2 py-1 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer shadow-xs shrink-0"
            id="how-it-works-trigger-button"
            title={t("How it Works")}
          >
            <HelpCircle className="h-3.5 w-3.5" />
            <span>{t("How it Works")}</span>
          </button>

          <LanguageSelector currentLanguage={language} onLanguageChange={handleLanguageChange} />

          {/* Header has no duplicate button now, keeping reporting exclusive to the overview homepage */}
        </div>
      </header>

      {/* 3. Main Container Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8" id="application-main-view-box">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
              Connecting Ward Databases...
            </p>
          </div>
        ) : (
          <>
            {/* VIEW: CITIZEN LANDING / HOMEPAGE */}
            {view === "home" && experienceMode === "citizen" && (
              <div className="space-y-12 animate-fade-in" id="citizen-landing-view">
                
                {/* A. Redeshed Hero Section */}
                <div className="bg-white border border-slate-100 rounded-3xl p-8 md:p-12 shadow-sm text-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Building2 className="h-72 w-72" />
                  </div>
                  
                  <span className="px-3.5 py-1 bg-blue-50 border border-blue-100 rounded-full text-blue-700 text-xs font-extrabold uppercase tracking-widest inline-flex items-center gap-1.5 shadow-sm">
                    <Sparkles className="h-3.5 w-3.5 text-blue-600 animate-pulse" />
                    {t("Civic Auditing Re-imagined")}
                  </span>

                  <h2 className="text-4xl md:text-5xl font-black text-slate-900 mt-4 tracking-tight leading-none max-w-3xl mx-auto">
                    {t("One Report. Right Authority.")}<br />
                    <span className="text-blue-600">{t("Faster Resolution.")}</span>
                  </h2>

                  <p className="text-slate-500 text-sm mt-4 max-w-2xl mx-auto leading-relaxed font-medium">
                    {t("heroDesc")}
                  </p>

                  <div className="mt-8 flex flex-wrap justify-center gap-3.5">
                    <button
                      onClick={() => setView("report")}
                      className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-extrabold flex items-center gap-2 shadow-lg shadow-blue-500/10 cursor-pointer transition-all hover:-translate-y-0.5"
                    >
                      <PlusCircle className="h-5 w-5" />
                      {t("File Instant Report")}
                    </button>
                  </div>

                  {/* High-density Impact Stats Bar */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 pt-10 border-t border-slate-50 max-w-4xl mx-auto">
                    <div className="text-center">
                      <span className="text-2xl font-black text-slate-900 block">1420+</span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1 block">{t("Resolved Cases")}</span>
                    </div>
                    <div className="text-center">
                      <span className="text-2xl font-black text-slate-900 block">100%</span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1 block">{t("SLA Precision")}</span>
                    </div>
                    <div className="text-center">
                      <span className="text-2xl font-black text-slate-900 block">3-5 Days</span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1 block">{t("Average Resolution")}</span>
                    </div>
                    <div className="text-center">
                      <span className="text-2xl font-black text-slate-900 block">30 Secs</span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1 block">{t("Instant AI Routing")}</span>
                    </div>
                  </div>
                </div>



                {/* B. Centerpiece: AI Explainability Core Panel - 5-Step Intelligent Resolution Journey */}
                <div className="bg-slate-900 border border-slate-800 text-white p-8 rounded-3xl shadow-xl space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 gap-2">
                    <div>
                      <span className="px-2.5 py-0.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full text-[10px] font-bold uppercase tracking-wider">
                        {t("Intelligent Resolution Path")}
                      </span>
                      <h3 className="text-lg font-black tracking-tight mt-1">{t("5-Step Citizen Issue Lifecycle")}</h3>
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                      {t("heroSubtitle")}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {[
                      {
                        step: t("STEP 1"),
                        title: t("Report Issue"),
                        desc: t("Normal citizen snaps photo & provides brief description."),
                        icon: Camera,
                        color: "text-blue-400 bg-blue-500/10 border-blue-500/20"
                      },
                      {
                        step: t("STEP 2"),
                        title: t("AI Understands"),
                        desc: t("Gemini extracts severity, priority, & drafts a letter."),
                        icon: Sparkles,
                        color: "text-orange-400 bg-orange-500/10 border-orange-500/20"
                      },
                      {
                        step: t("STEP 3"),
                        title: t("Routing Authority"),
                        desc: t("Auto-routes directly to the correct municipal ward desk."),
                        icon: Building2,
                        color: "text-purple-400 bg-purple-500/10 border-purple-500/20"
                      },
                      {
                        step: t("STEP 4"),
                        title: t("Community Verifies"),
                        desc: t("Upvotes & status voting prevent administrative lag."),
                        icon: Users,
                        color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                      },
                      {
                        step: t("STEP 5"),
                        title: t("Issue Resolved"),
                        desc: t("Track transparently until final verification on-site."),
                        icon: CheckCircle2,
                        color: "text-teal-400 bg-teal-500/10 border-teal-500/20"
                      }
                    ].map((item, idx) => (
                      <div key={idx} className="relative space-y-3 p-4 bg-slate-950/40 border border-slate-800 rounded-2xl flex flex-col justify-between min-h-[145px]">
                        {/* Connecting line for desktop */}
                        {idx < 4 && (
                          <div className="hidden md:block absolute top-1/2 -right-2.5 w-5 h-[1px] bg-slate-800 z-10" />
                        )}
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-bold tracking-widest text-slate-500 font-mono">
                              {item.step}
                            </span>
                            <div className={`p-1.5 rounded-lg border ${item.color}`}>
                              <item.icon className="h-3.5 w-3.5" />
                            </div>
                          </div>
                          <h4 className="text-xs font-bold text-slate-200 mt-2 tracking-tight">
                            {item.title}
                          </h4>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                 {/* C. Unified Civic Tracking Board and Map */}
                <div className="space-y-6 pt-6 border-t border-slate-100">
                  <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-black text-slate-900 tracking-tight">{t("Active Neighborhood Incident Tracking Board")}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">{t("Use search, filters, or the interactive map below to explore all live reports in real-time.")}</p>
                    </div>
                  </div>

                  <CivicDashboardView 
                    issues={issues}
                    neighborhoods={neighborhoods}
                    currentLanguage={language}
                    t={t}
                    onSelectIssue={handleSelectIssue}
                    onNavigate={setView}
                    predictiveInsights={predictiveInsights}
                  />
                </div>

                {/* D. Community Contributions Scoreboard & Leaderboard */}
                <div className="space-y-6 pt-10 border-t border-slate-100">
                  <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6">
                    <h3 className="text-lg font-black text-slate-900 tracking-tight">{t("Community Leadership and Contributions")}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{t("Citizens verification and leaderboard scores help speed up public service resolutions.")}</p>
                  </div>

                  <LeaderboardView 
                    neighborhoods={neighborhoods}
                    contributors={contributors}
                    currentLanguage={language}
                    t={t}
                  />
                </div>

              </div>
            )}
 
            {/* View: Report Issue Form */}
            {view === "report" && (
              <ReportIssueView 
                currentLanguage={language} 
                t={t} 
                onIssueCreated={handleIssueCreated}
                onNavigate={setView}
              />
            )}
 
            {/* View: Issue Detail Deep-Dive */}
            {view === "issue-detail" && selectedIssue && (
              <IssueDetailView 
                issue={selectedIssue}
                currentLanguage={language}
                t={t}
                onBack={() => setView("home")}
                onUpdateIssue={handleUpdateIssue}
              />
            )}

            {/* View: Admin Control Room (Dashboard) */}
            {view === "admin-dashboard" && (
              <AdminDashboardView 
                issues={issues}
                neighborhoods={neighborhoods}
                currentLanguage={language}
                t={t}
                onSelectIssue={handleSelectIssue}
                onNavigate={setView}
              />
            )}
          </>
        )}
      </main>

      {/* Sleek Government-Grade Trust Status Bar */}
      <footer className="h-10 bg-slate-900 flex items-center justify-between px-8 text-[10px] text-slate-400 shrink-0 mt-auto select-none font-mono">
        <div className="flex items-center space-x-4">
          <span className="flex items-center">
            <div className="w-2 h-2 rounded-full bg-[#10B981] mr-2 animate-pulse"></div> 
            {t("Gemini Engine: Operational")}
          </span>
          <span className="hidden sm:inline">Node: MH-PUNE-01</span>
          <span className="hidden md:inline">• Protocol: v2.4.0-Production</span>
        </div>
        <div className="flex items-center space-x-4 uppercase tracking-tight">
          <span className="hidden sm:inline">{t("Open Sourcing Civic Tech")}</span>
          <span className="text-slate-700 hidden sm:inline">|</span>
          <span className="text-white opacity-85 font-semibold">{t("Live Reports")}: {issues.length + 1420} {t("Today")}</span>
        </div>
      </footer>

      {/* 4. 30-Second AI Demo Simulation Modal */}
      {showDemoModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-slate-100 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-6">
            
            <div className="text-center space-y-2">
              <span className="px-3 py-1 bg-orange-50 border border-orange-100 rounded-full text-orange-700 text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-1.5 animate-pulse">
                <Sparkles className="h-3.5 w-3.5" />
                {t("Interactive SLA Demonstration")}
              </span>
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                {t("30-Second CivicBridge AI Simulation")}
              </h3>
              <p className="text-xs text-slate-500">
                {t("Witness how our AI pipeline classifies, scores, and registers a critical incident in real-time.")}
              </p>
            </div>

            {/* Simulated progress step list */}
            <div className="space-y-4">
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  <span>{t("Demo Pipeline Progress")}</span>
                  <span className="text-blue-600 font-bold">{demoProgress}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${demoProgress}%` }}
                  />
                </div>
              </div>

              {/* Step indicator panels */}
              <div className="space-y-2.5">
                {[
                  { id: 1, label: t("Evidence Isolation"), desc: t("Lock photodata variables") },
                  { id: 2, label: t("Neural Scan"), desc: t("Recognize hazard dimensions") },
                  { id: 3, label: t("Proximity Mapping"), desc: t("Identify school & hospital buffers") },
                  { id: 4, label: t("Authority Assignment"), desc: t("Pre-compile grievance letter") },
                  { id: 5, label: t("SLA Activation"), desc: t("Secure tracking timeline") }
                ].map((stepItem) => {
                  const isActive = demoStep === stepItem.id;
                  const isDone = demoStep > stepItem.id;
                  
                  return (
                    <div 
                      key={stepItem.id}
                      className={`flex items-center justify-between p-3 rounded-xl border text-xs transition-colors duration-200 ${
                        isActive 
                          ? "bg-blue-50/50 border-blue-200 text-slate-800" 
                          : isDone 
                            ? "bg-slate-50/50 border-slate-100 text-slate-400" 
                            : "border-slate-50 text-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`h-6 w-6 rounded-full flex items-center justify-center font-bold text-[10px] ${
                          isDone 
                            ? "bg-emerald-100 text-emerald-700" 
                            : isActive 
                              ? "bg-blue-600 text-white" 
                              : "bg-slate-100 text-slate-400"
                        }`}>
                          {isDone ? "✓" : stepItem.id}
                        </div>
                        <div>
                          <span className="font-bold block">{stepItem.label}</span>
                          <span className={`text-[10px] ${isActive ? "text-blue-600 font-medium" : "text-slate-400"}`}>
                            {stepItem.desc}
                          </span>
                        </div>
                      </div>

                      {isActive && <Loader2 className="h-4 w-4 animate-spin text-blue-600" />}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Actions for modal */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-50">
              <span className="text-[10px] text-slate-400 font-mono">
                {t(demoStatus)}
              </span>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowDemoModal(false)}
                  className="px-3.5 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  {t("Cancel")}
                </button>
                {demoProgress === 100 && (
                  <button
                    onClick={finalizeDemoTicketAndRedirect}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-all animate-bounce"
                  >
                    {t("Load Mock Ticket")}
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 4. Trust & Transparency Modal: How CivicBridge Works */}
      {showHowItWorks && (
        <div className="fixed inset-0 bg-slate-900/65 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200" id="how-it-works-modal-overlay">
          <div className="bg-white border border-slate-100 rounded-3xl shadow-2xl max-w-2xl w-full p-6 md:p-8 space-y-6 relative animate-in zoom-in-95 duration-200" id="how-it-works-modal-container">
            
            {/* Close Button */}
            <button 
              onClick={() => setShowHowItWorks(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-50 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <span className="text-xl font-bold font-mono">×</span>
            </button>

            {/* Header */}
            <div className="text-center space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-widest rounded-full border border-blue-100">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>{t("Trust & Transparency Core")}</span>
              </div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">{t("How CivicBridge Works")}</h3>
              <p className="text-xs text-slate-500 font-medium">{t("A clear, automated, and tamper-proof pipeline from reporting to resolution.")}</p>
            </div>

            {/* Diagrammatic Flow */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative py-4" id="how-it-works-diagram">
              
              {/* Connector lines for desktop screen */}
              <div className="hidden md:block absolute top-[44px] left-[15%] right-[15%] h-[2px] bg-slate-100 z-0">
                <div className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500 opacity-60" />
              </div>

              {[
                {
                  step: 1,
                  title: t("User submits query"),
                  desc: t("Describe issue via text, record voice transcripts, or snap/upload photo evidence."),
                  icon: MessageSquare,
                  color: "bg-blue-50 border-blue-100 text-blue-600",
                  badge: t("Input Stage")
                },
                {
                  step: 2,
                  title: t("System analyzes eligibility"),
                  desc: t("AI classifies category, determines department, and maps school/hospital buffer zones."),
                  icon: Sparkles,
                  color: "bg-purple-50 border-purple-100 text-purple-600",
                  badge: t("AI Eligibility")
                },
                {
                  step: 3,
                  title: t("Policy & SLA Analysis"),
                  desc: t("System cross-references relevant civic codes, municipal laws, and SLA policies."),
                  icon: Building2,
                  color: "bg-indigo-50 border-indigo-100 text-indigo-600",
                  badge: t("Policy Match")
                },
                {
                  step: 4,
                  title: t("Resolution Plan Generated"),
                  desc: t("Get tailored dynamic resolution milestones, escalation timelines, and formal draft files."),
                  icon: CheckCircle2,
                  color: "bg-emerald-50 border-emerald-100 text-emerald-600",
                  badge: t("Resolution")
                }
              ].map((stepObj, index) => (
                <div key={stepObj.step} className="flex flex-col items-center text-center space-y-3 p-4 bg-slate-50/50 hover:bg-slate-50 border border-slate-100 rounded-2xl transition-all duration-200 shadow-xs z-10 relative group">
                  
                  {/* Step bubble with Icon */}
                  <div className={`h-14 w-14 rounded-2xl flex items-center justify-center border-2 shadow-sm relative transition-transform duration-300 group-hover:scale-105 ${stepObj.color}`}>
                    {React.createElement(stepObj.icon, { className: "h-6 w-6" })}
                    
                    {/* Step number badge */}
                    <div className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-slate-900 border-2 border-white text-white flex items-center justify-center font-bold text-[9px]">
                      {stepObj.step}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 block">{stepObj.badge}</span>
                    <h4 className="font-extrabold text-slate-900 text-xs tracking-tight leading-snug">{stepObj.title}</h4>
                    <p className="text-[10px] text-slate-500 leading-normal">{stepObj.desc}</p>
                  </div>

                  {/* Connecting arrow for mobile vertical flow */}
                  {index < 3 && (
                    <div className="md:hidden text-slate-300 font-bold text-lg animate-bounce">
                      ↓
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Verification Footer Panel */}
            <div className="p-4 bg-slate-900 text-slate-100 rounded-2xl flex flex-col sm:flex-row items-center gap-4 text-xs">
              <div className="h-10 w-10 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center shrink-0">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div className="space-y-0.5 text-center sm:text-left flex-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">{t("TRANSPARENCY & ACCOUNTABILITY")}</span>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  {t("Every reported grievance is fully integrated into public municipal guidelines to calculate high-accuracy SLA timers. We make civic resolutions transparent and accountable.")}
                </p>
              </div>
              <button 
                onClick={() => setShowHowItWorks(false)}
                className="w-full sm:w-auto px-4 py-2 bg-white text-slate-900 font-black rounded-xl hover:bg-slate-100 transition-colors cursor-pointer text-[11px] uppercase tracking-wider shrink-0 text-center"
              >
                {t("Got It")}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

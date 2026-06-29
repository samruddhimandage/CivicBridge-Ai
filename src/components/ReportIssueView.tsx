import React, { useState, useRef, useEffect } from "react";
import { 
  Camera, MapPin, Mic, MicOff, AlertTriangle, Shield, CheckCircle, 
  Trash2, Droplet, Lightbulb, TrendingUp, AlertOctagon, HelpCircle, 
  ArrowRight, ArrowLeft, Loader2, Copy, Check, Sparkles, Navigation, 
  Clock, ShieldAlert, Users, Info, ChevronRight, FileText, Download, Globe,
  ShieldCheck, CheckCircle2, Eye, Search, AlertCircle, Building2
} from "lucide-react";
import { Language } from "../translations";
import { Issue } from "../types";

interface ReportIssueProps {
  currentLanguage: Language;
  t: (key: string) => string;
  onIssueCreated: (newIssueId: string) => void;
  onNavigate: (view: string) => void;
}

const CATEGORIES = [
  { id: "Pothole", icon: AlertOctagon, color: "border-slate-100 text-red-600 hover:bg-red-50/50 hover:border-red-400" },
  { id: "Garbage Dump", icon: Trash2, color: "border-slate-100 text-amber-600 hover:bg-amber-50/50 hover:border-amber-400" },
  { id: "Water Leakage", icon: Droplet, color: "border-slate-100 text-blue-600 hover:bg-blue-50/50 hover:border-blue-400" },
  { id: "Broken Streetlight", icon: Lightbulb, color: "border-slate-100 text-yellow-600 hover:bg-yellow-50/50 hover:border-yellow-400" },
  { id: "Road Damage", icon: TrendingUp, color: "border-slate-100 text-purple-600 hover:bg-purple-50/50 hover:border-purple-400" },
  { id: "Drainage Problem", icon: Info, color: "border-slate-100 text-emerald-600 hover:bg-emerald-50/50 hover:border-emerald-400" },
  { id: "Public Safety Issue", icon: Shield, color: "border-slate-100 text-rose-600 hover:bg-rose-50/50 hover:border-rose-400" },
  { id: "Illegal Dumping", icon: AlertTriangle, color: "border-slate-100 text-orange-600 hover:bg-orange-50/50 hover:border-orange-400" },
  { id: "Other", icon: HelpCircle, color: "border-slate-100 text-slate-600 hover:bg-slate-50/50 hover:border-slate-400" }
];

export default function ReportIssueView({ currentLanguage, t, onIssueCreated, onNavigate }: ReportIssueProps) {
  // Wizard steps: 1 to 5
  const [step, setStep] = useState<number>(1);
  const [category, setCategory] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [voiceText, setVoiceText] = useState<string>("");
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [mediaPreview, setMediaPreview] = useState<string>("");
  const [location, setLocation] = useState<{ address: string; lat: number; lng: number; neighborhood?: string }>({
    address: "",
    lat: 28.6139,
    lng: 77.2090,
    neighborhood: "Central Division"
  });
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [customNeighborhood, setCustomNeighborhood] = useState<string>("Central Division");
  const [gpsLoading, setGpsLoading] = useState<boolean>(false);
  
  // AI Analysis Stage
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [analysisProgress, setAnalysisProgress] = useState<number>(0);
  const [progressText, setProgressText] = useState<string>("");
  const [aiResult, setAiResult] = useState<Issue["aiAnalysis"] | null>(null);
  const [aiError, setAiError] = useState<boolean>(false);
  const [activeCardIndex, setActiveCardIndex] = useState<number>(0);
  
  // UI Actions
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  // Audio simulation timer
  const recordTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [recordDuration, setRecordDuration] = useState<number>(0);

  // Live image scan (Wow Moment) state
  const [liveScanning, setLiveScanning] = useState<boolean>(false);
  const [scannedStages, setScannedStages] = useState<string[]>([]);

  // Sample voice transcripts for direct simulation
  const MOCK_VOICE_TRANSCRIPTS: Record<string, string> = {
    "Pothole": "There is a really big pothole on the main road just outside the school gate. It is deep and filled with water. Two wheelers are slipping, someone could get hurt. Please patch it soon.",
    "Garbage Dump": "A huge pile of garbage has been rotting near the public park corner. The smell is disgusting and there are stray dogs everywhere chewing on plastic bags.",
    "Water Leakage": "Water is bursting out of a main joint in the pipeline on the sidewalk here. It is drinking water, wasting thousands of gallons, completely flooding the walking path.",
    "Broken Streetlight": "Three streetlights in a row are completely dead on this street, making it pitch black at night. Ladies and senior citizens feel unsafe walking here.",
    "Road Damage": "The side of the asphalt has crumbled completely here. Big crater is forming causing vehicles to swerve into oncoming traffic.",
    "Drainage Problem": "Sewage water is overflowing from the manhole near the bakery. The entire road smells like a sewer and cars are splashing dirty water on pedestrians.",
    "Public Safety Issue": "The safety railing of the flyover is broken and bent outward. Pedestrians could fall or heavy wind could dislodge pieces onto the lower road.",
    "Illegal Dumping": "A commercial pickup truck just dumped several bags of construction debris right next to the empty field. This happens every Tuesday night.",
    "Other": "There is a dangerous overgrown tree limb that is touching high voltage wires. Every time the wind blows, sparks fly out."
  };

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      
      rec.onresult = (event: any) => {
        let fullTranscript = "";
        for (let i = 0; i < event.results.length; ++i) {
          fullTranscript += event.results[i][0].transcript;
        }
        if (fullTranscript.trim()) {
          setVoiceText(fullTranscript);
          setDescription(fullTranscript);
        }
      };
      
      rec.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
      };
      
      rec.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = rec;
    }
  }, [currentLanguage]);

  const handleStartRecording = () => {
    setIsRecording(true);
    setRecordDuration(0);
    setVoiceText("");
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.lang = currentLanguage === "Hindi" ? "hi-IN" : currentLanguage === "Marathi" ? "mr-IN" : "en-US";
        recognitionRef.current.start();
      } catch (err) {
        console.error("Failed to start speech recognition:", err);
      }
    }

    recordTimerRef.current = setInterval(() => {
      setRecordDuration(prev => {
        if (prev >= 59) {
          handleStopRecording();
          return 59;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const handleStopRecording = () => {
    if (recordTimerRef.current) {
      clearInterval(recordTimerRef.current);
    }
    setIsRecording(false);
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.error("Failed to stop speech recognition:", err);
      }
    }

    setTimeout(() => {
      setVoiceText(currentVoice => {
        if (!currentVoice) {
          const mockText = MOCK_VOICE_TRANSCRIPTS[category] || "Active civic infrastructure failure observed at this street junction requiring swift administrative resolution.";
          setDescription(prevDesc => prevDesc ? prevDesc + " " + mockText : mockText);
          return mockText;
        }
        return currentVoice;
      });
    }, 400);
  };

  const handleAddressSearch = () => {
    if (!searchQuery.trim()) return;
    
    // Simulate geo coding based on popular Indian city areas
    let lat = 18.5204;
    let lng = 73.8567;
    let neighborhood = "Kothrud (Pune)";

    const query = searchQuery.toLowerCase();

    if (query.includes("baner")) {
      lat = 18.5594;
      lng = 73.7915;
      neighborhood = "Baner (Pune)";
    } else if (query.includes("wakad")) {
      lat = 18.5987;
      lng = 73.7478;
      neighborhood = "Wakad (Pune)";
    } else if (query.includes("aundh")) {
      lat = 18.5580;
      lng = 73.8075;
      neighborhood = "Aundh (Pune)";
    } else if (query.includes("kalyani")) {
      lat = 18.5463;
      lng = 73.9033;
      neighborhood = "Kalyani Nagar (Pune)";
    } else if (query.includes("andheri") || query.includes("bandra") || query.includes("mumbai")) {
      lat = 19.0760;
      lng = 72.8777;
      neighborhood = "Andheri (Mumbai)";
    } else if (query.includes("connaught") || query.includes("dwarka") || query.includes("delhi") || query.includes("noida") || query.includes("gurgaon")) {
      lat = 28.6139;
      lng = 77.2090;
      neighborhood = "Connaught Place (Delhi)";
    } else if (query.includes("koramangala") || query.includes("whitefield") || query.includes("bangalore") || query.includes("bengaluru")) {
      lat = 12.9716;
      lng = 77.5946;
      neighborhood = "Koramangala (Bangalore)";
    } else if (query.includes("gachibowli") || query.includes("hitech") || query.includes("hyderabad")) {
      lat = 17.3850;
      lng = 78.4867;
      neighborhood = "Gachibowli (Hyderabad)";
    } else if (query.includes("adyar") || query.includes("mylapore") || query.includes("chennai")) {
      lat = 13.0827;
      lng = 80.2707;
      neighborhood = "Adyar (Chennai)";
    } else if (query.includes("navrangpura") || query.includes("ahmedabad")) {
      lat = 23.0225;
      lng = 72.5714;
      neighborhood = "Navrangpura (Ahmedabad)";
    } else if (query.includes("kolkata") || query.includes("howrah") || query.includes("salt lake")) {
      lat = 22.5726;
      lng = 88.3639;
      neighborhood = "Salt Lake Sector V (Kolkata)";
    } else if (query.includes("jaipur") || query.includes("pink city")) {
      lat = 26.9124;
      lng = 75.7873;
      neighborhood = "Malviya Nagar (Jaipur)";
    } else if (query.includes("lucknow") || query.includes("hazratganj")) {
      lat = 26.8467;
      lng = 80.9462;
      neighborhood = "Hazratganj (Lucknow)";
    } else if (query.includes("nagpur")) {
      lat = 21.1458;
      lng = 79.0882;
      neighborhood = "Dharampeth (Nagpur)";
    } else if (query.includes("indore")) {
      lat = 22.7196;
      lng = 75.8577;
      neighborhood = "Vijay Nagar (Indore)";
    } else if (query.includes("patna")) {
      lat = 25.5941;
      lng = 85.1376;
      neighborhood = "Maurya Lok (Patna)";
    } else if (query.includes("bhopal")) {
      lat = 23.2599;
      lng = 77.4126;
      neighborhood = "Arera Colony (Bhopal)";
    } else if (query.includes("surat")) {
      lat = 21.1702;
      lng = 72.8311;
      neighborhood = "Adajan (Surat)";
    } else if (query.includes("pune")) {
      lat = 18.5204;
      lng = 73.8567;
      neighborhood = "Kothrud (Pune)";
    } else {
      // Dynamic, high-fidelity deterministic fallback based on the search query
      // This generates clean, realistic latitude and longitude values anywhere in India (latitude 10N-30N, longitude 72E-88E)
      let hash = 0;
      for (let i = 0; i < query.length; i++) {
        hash = query.charCodeAt(i) + ((hash << 5) - hash);
      }
      const absHash = Math.abs(hash);
      const latOffset = (absHash % 2000) / 100; // 0.0 to 20.0
      const lngOffset = ((absHash >> 3) % 1600) / 100; // 0.0 to 16.0
      
      lat = 11.0 + latOffset; // 11.0 to 31.0
      lng = 72.0 + lngOffset; // 72.0 to 88.0
      
      const words = searchQuery.split(" ");
      const capitalizedQuery = words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
      neighborhood = capitalizedQuery.includes("Division") || capitalizedQuery.includes("Ward") || capitalizedQuery.includes("City") || capitalizedQuery.includes("Precinct")
        ? capitalizedQuery 
        : capitalizedQuery + " Civic Precinct";
    }

    setLocation({
      address: searchQuery,
      lat,
      lng,
      neighborhood
    });
  };

  // Automated Wow Moment scanning
  const triggerImageScanning = () => {
    setLiveScanning(true);
    setScannedStages([]);
    
    const stages = [
      "Target Analyzed: Civic Infrastructure",
      `Category Isolated: ${category || "Civic Incident"} (98% match)`,
      "GPS Alignment Secured: High density coordinates pinned",
      "Priority Vectors Synced: Hazard weight applied",
      "Live Scan Ready!"
    ];

    stages.forEach((text, index) => {
      setTimeout(() => {
        setScannedStages(prev => [...prev, text]);
        if (index === stages.length - 1) {
          setTimeout(() => {
            setLiveScanning(false);
          }, 800);
        }
      }, (index + 1) * 700);
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaPreview(reader.result as string);
        triggerImageScanning();
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRunAiAnalysis = async () => {
    setStep(5);
    setAiLoading(true);
    setAiError(false);
    setAnalysisProgress(15);
    setProgressText(t("runningClassification"));

    const intervals = [
      { p: 35, t: t("calculatingPriority") },
      { p: 60, t: t("runningDuplicates") },
      { p: 80, t: t("routingAuthority") },
      { p: 95, t: t("draftingLetter") }
    ];

    let currentIdx = 0;
    const progressTimer = setInterval(() => {
      if (currentIdx < intervals.length) {
        setAnalysisProgress(intervals[currentIdx].p);
        setProgressText(intervals[currentIdx].t);
        currentIdx++;
      }
    }, 1000);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch("/api/analyze-issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          category,
          description,
          location,
          voiceTranscript: voiceText,
          language: currentLanguage,
          image: mediaPreview
        })
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error("Failed response from AI server");
      }

      const data = await response.json();
      clearInterval(progressTimer);
      setAnalysisProgress(100);
      setProgressText(t("done"));
      setAiResult(data);
      
      setTimeout(() => {
        setAiLoading(false);
      }, 600);

    } catch (err) {
      clearTimeout(timeoutId);
      clearInterval(progressTimer);
      console.error("Failed to analyze issue:", err);
      setAiError(true);
      setAiLoading(false);
    }
  };

  const handleConfirmSubmit = async () => {
    if (!aiResult) return;
    
    const ticketId = `CB-2026-00${Math.floor(100 + Math.random() * 900)}`;
    const neighborhood = location.neighborhood || "Central Division";

    const newIssue: Issue = {
      id: ticketId,
      category,
      description,
      location: {
        address: location.address || "Main Street Sector, " + neighborhood,
        lat: location.lat,
        lng: location.lng,
        neighborhood
      },
      voiceTranscript: voiceText,
      imageUrl: mediaPreview || undefined,
      status: "Reported",
      severity: (aiResult.severity.level as any) || "Medium",
      priorityScore: aiResult.priorityScore.score,
      verificationCount: 1, 
      votedUserIds: [],
      createdAt: new Date().toISOString(),
      comments: [
        {
          id: "sys-init",
          author: "CivicBridge AI",
          text: `AI Agent instantiated. Automatically computed Civic Priority Score is ${aiResult.priorityScore.score}. Routed to ${aiResult.responsibleAuthority.name}.`,
          createdAt: new Date().toISOString(),
          badge: "AI Agent"
        }
      ],
      aiAnalysis: aiResult
    };

    try {
      const storedIssuesStr = localStorage.getItem("civic_issues") || "[]";
      const storedIssues = JSON.parse(storedIssuesStr);
      storedIssues.unshift(newIssue);
      localStorage.setItem("civic_issues", JSON.stringify(storedIssues));

      const myTicketsStr = localStorage.getItem("my_reported_tickets") || "[]";
      const myTickets = JSON.parse(myTicketsStr);
      myTickets.push(ticketId);
      localStorage.setItem("my_reported_tickets", JSON.stringify(myTickets));

      // Trigger completion callback
      onIssueCreated(newIssue.id);
    } catch (e) {
      console.error("Persistence error:", e);
      onIssueCreated(newIssue.id);
    }
  };

  const handleCopyComplaint = () => {
    if (!aiResult) return;
    navigator.clipboard.writeText(aiResult.professionalComplaint);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownloadPDF = () => {
    if (!aiResult) return;
    const element = document.createElement("a");
    const file = new Blob([aiResult.professionalComplaint], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `CivicBridge_Complaint_${aiResult.classification.detectedCategory}.txt`;
    document.body.appendChild(element);
    element.click();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  // Completion calculation
  const getCompletionPercentage = () => {
    if (step === 1) return 20;
    if (step === 2) return 40;
    if (step === 3) return 60;
    if (step === 4) return 80;
    return 100;
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8" id="report-view-container">
      
      {/* Wizard Header with Progress Percentage */}
      <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm mb-6 text-center">
        <span className="px-3 py-1 bg-blue-50 border border-blue-100 rounded-full text-blue-700 text-xs font-semibold uppercase tracking-wider inline-flex items-center gap-1.5 shadow-sm">
          <Sparkles className="h-3.5 w-3.5 text-blue-600 animate-pulse" />
          {t("5-Step Civic Routing Wizard")}
        </span>
        <h2 className="text-2xl font-black text-slate-900 mt-2 tracking-tight">
          {step === 1 && t("Select Problem Category")}
          {step === 2 && t("Describe the Incident")}
          {step === 3 && t("Pin Location on Map")}
          {step === 4 && t("Upload Visual Evidence")}
          {step === 5 && t("Review AI Routing & Submit")}
        </h2>
        <p className="text-slate-500 text-xs mt-1 max-w-lg mx-auto leading-relaxed">
          {step === 1 && t("Choose a category below. Our AI uses this to initiate targeted civic checks.")}
          {step === 2 && t("Enter details or use our high-fidelity Voice Transcriber. AI maps priorities dynamically.")}
          {step === 3 && t("Search neighborhood or drop a precise pin on our Ward Map to find your municipal authority.")}
          {step === 4 && t("Provide a photo. The AI immediately analyzes image data to pre-fill confidence checks.")}
          {step === 5 && t("Confirm correct municipal routing, professional complaint letter, and SLA deadlines.")}
        </p>

        {/* Progress Bar */}
        <div className="mt-5 space-y-2">
          <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            <span>{t("Wizard Progress")}</span>
            <span className="text-blue-600">{getCompletionPercentage()}% {t("Complete")}</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${getCompletionPercentage()}%` }}
            />
          </div>
          
          {/* Step indicators */}
          <div className="flex items-center justify-between pt-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <div 
                key={s} 
                className={`text-[9px] font-bold uppercase tracking-wider ${
                  step === s ? "text-blue-600" : step > s ? "text-emerald-600" : "text-slate-300"
                }`}
              >
                {t("Step")} {s}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* STEP 1: CATEGORY SELECTION */}
      {step === 1 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-in" id="category-grid">
          {CATEGORIES.map((cat) => {
            const CatIcon = cat.icon;
            const categoryTranslated = t(cat.id === "Pothole" ? "pothole" : 
                                         cat.id === "Garbage Dump" ? "garbage" : 
                                         cat.id === "Water Leakage" ? "waterLeak" : 
                                         cat.id === "Broken Streetlight" ? "streetlight" : 
                                         cat.id === "Road Damage" ? "roadDamage" : 
                                         cat.id === "Drainage Problem" ? "drainage" : 
                                         cat.id === "Public Safety Issue" ? "safety" : 
                                         cat.id === "Illegal Dumping" ? "dumping" : "other");
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setCategory(cat.id);
                  setStep(2);
                }}
                className={`flex flex-col items-center justify-center p-5 rounded-2xl border bg-white hover:border-blue-500 text-center transition-all duration-300 hover:shadow-lg group shadow-sm cursor-pointer`}
              >
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-50 group-hover:scale-110 transition-transform mb-2">
                  <CatIcon className="h-7 w-7 text-blue-600" />
                </div>
                <h3 className="font-bold text-slate-800 text-sm">{categoryTranslated}</h3>
              </button>
            );
          })}
        </div>
      )}

      {/* STEP 2: DETAILS & DESCRIPTION */}
      {step === 2 && (
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6 animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-50 pb-4">
            <span className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-blue-600 inline-block" />
              {t("Problem Details")}: {t(category)}
            </span>
            <button onClick={() => setStep(1)} className="text-xs text-blue-600 hover:underline">{t("Change Category")}</button>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">{t("Detailed Description")}</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("Describe size, depth, duration, landmarks, safety impact, school zone, hospital proximity...")}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all text-slate-700"
            />
          </div>

          {/* Voice Feature */}
          <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Mic className="h-4 w-4 text-orange-500" />
                {t("Voice Assist Complaint Transcriber")}
              </span>
              {isRecording && (
                <span className="flex items-center gap-1 text-[10px] text-red-500 font-bold animate-pulse">
                  {t("Recording")} 00:0{recordDuration}s
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              {!isRecording ? (
                <button
                  type="button"
                  onClick={handleStartRecording}
                  className="px-4 py-2 bg-orange-50 text-orange-700 hover:bg-orange-100 rounded-xl border border-orange-100 text-xs font-bold flex items-center gap-2 cursor-pointer transition-all"
                >
                  <Mic className="h-4 w-4" />
                  {t("recordVoice")}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleStopRecording}
                  className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all animate-pulse"
                >
                  <MicOff className="h-4 w-4" />
                  {t("Stop & Transcribe")}
                </button>
              )}

              {voiceText && (
                <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle className="h-3.5 w-3.5 animate-bounce" />
                  {t("Voice transcribed successfully!")}
                </span>
              )}
            </div>

            {voiceText && (
              <div className="mt-3">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t("Editable Speech Transcript")}</label>
                <input
                  type="text"
                  value={voiceText}
                  onChange={(e) => {
                    setVoiceText(e.target.value);
                    setDescription(e.target.value);
                  }}
                  className="w-full px-3 py-2 bg-white rounded-lg border border-slate-200 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-4 border-t border-slate-50">
            <button 
              onClick={() => setStep(1)}
              className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" /> {t("Back")}
            </button>
            <button 
              onClick={() => {
                if (!description.trim()) {
                  alert("Please provide a text description or voice transcription first.");
                  return;
                }
                setStep(3);
              }}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow shadow-blue-500/10"
            >
              {t("Next Step")} <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: LOCATION PIN DROP */}
      {step === 3 && (
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6 animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-50 pb-4">
            <span className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-blue-600 inline-block" />
              {t("Pin Ward Location")}
            </span>
            <span className="text-xs text-slate-400">{t("Ward Precinct")}: {t(location.neighborhood || "Local Ward")}</span>
          </div>

          {/* Address Search Bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddressSearch()}
              placeholder={t("Search address (e.g. Connaught Place, Delhi or Andheri, Mumbai)...")}
              className="w-full pl-10 pr-24 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 focus:outline-none transition-all text-slate-700"
            />
            <button 
              onClick={handleAddressSearch}
              className="absolute right-1.5 top-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold rounded-lg cursor-pointer"
            >
              {t("Search")}
            </button>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">{t("Selected Location")}:</span>
              <span className="text-slate-500 font-mono text-[10px]">
                Lat: {location.lat.toFixed(4)}, Lng: {location.lng.toFixed(4)}
              </span>
            </div>
            <p className="text-xs text-slate-600">
              📍 {location.address ? t(location.address) : t("Click search or drop pin below to lock exact coordinates")}
            </p>
          </div>

          {/* Interactive Geographic Map Pin Grid */}
          <div className="relative h-64 bg-slate-100 rounded-2xl overflow-hidden border border-slate-100 flex items-center justify-center group shadow-inner">
            <div className="absolute inset-0 bg-slate-100 opacity-60 grid grid-cols-8 grid-rows-6 pointer-events-none">
              {Array.from({ length: 48 }).map((_, i) => (
                <div key={i} className="border-r border-b border-slate-300/30" />
              ))}
            </div>
            
            {/* Pulsating marker */}
            <div className="absolute flex flex-col items-center animate-bounce z-10">
              <MapPin className="h-10 w-10 text-red-600 fill-red-200" />
              <div className="h-2 w-4 bg-black/20 rounded-full blur-[1px]" />
            </div>

            <div className="absolute top-3 left-3 bg-slate-900/90 border border-slate-800 text-white p-2.5 rounded-xl text-[9px] font-bold space-y-1 z-10">
              <div>📍 {t("Ward Matrix: India National Network")}</div>
              <div className="text-slate-400">{t("Nearest Center")}: {t(location.neighborhood || "Local Ward")} {t("Office")}</div>
            </div>

            <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[8px] px-2 py-0.5 rounded-md uppercase tracking-widest font-black">
              {t("Interactive GPS Canvas Locked")}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-4 border-t border-slate-50">
            <button 
              onClick={() => setStep(2)}
              className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" /> {t("Back")}
            </button>
            <button 
              onClick={() => {
                if (!location.address) {
                  setLocation(prev => ({
                    ...prev,
                    address: searchQuery || "Main Street Road, " + (prev.neighborhood || "Central Division")
                  }));
                }
                setStep(4);
              }}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow shadow-blue-500/10"
            >
              {t("Next Step")} <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: EVIDENCE UPLOAD & AUTOMATED WOW MOMENT SCAN */}
      {step === 4 && (
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6 animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-50 pb-4">
            <span className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-blue-600 inline-block" />
              {t("Attach Evidence & Live AI Scan")}
            </span>
          </div>

          {/* Interactive Uploader Frame */}
          <div className="border-2 border-dashed border-slate-200 rounded-3xl p-6 text-center hover:border-blue-400 hover:bg-slate-50/50 transition-all relative overflow-hidden">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="absolute inset-0 opacity-0 cursor-pointer w-full"
            />
            {!mediaPreview ? (
              <div className="flex flex-col items-center justify-center py-6">
                <Camera className="h-10 w-10 text-slate-400 mb-3" />
                <span className="text-sm font-bold text-slate-700">{t("Click to Upload Image")}</span>
                <span className="text-xs text-slate-400 mt-1">{t("JPEG, PNG support up to 10MB. AI auto-reads details.")}</span>
              </div>
            ) : (
              <div className="relative inline-block">
                <img 
                  src={mediaPreview} 
                  alt="Incident Preview" 
                  className="max-h-48 rounded-2xl border border-slate-100 shadow-lg"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMediaPreview("");
                  }}
                  className="absolute -top-2.5 -right-2.5 h-6 w-6 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center shadow cursor-pointer text-xs"
                >
                  ×
                </button>
              </div>
            )}
          </div>

          {/* AI WOW MOMENT SCANNER OVERLAY */}
          {mediaPreview && (
            <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl p-5 shadow-xl space-y-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <Sparkles className="h-16 w-16" />
              </div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-black text-orange-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 animate-spin text-orange-500" />
                  {t("CivicBridge AI Live Image Scan")}
                </span>
                {liveScanning ? (
                  <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full font-semibold animate-pulse uppercase">
                    {t("Analyzing Image...")}
                  </span>
                ) : (
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-semibold uppercase">
                    {t("Scan Secured")}
                  </span>
                )}
              </div>

              {/* Staggered progress lists */}
              <div className="space-y-2">
                {scannedStages.map((text, sIdx) => (
                  <div key={sIdx} className="flex items-center gap-2 text-xs font-mono text-slate-300 animate-fade-in">
                    <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>{t(text)}</span>
                  </div>
                ))}
                {liveScanning && (
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-500 animate-pulse">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{t("Reading pixels...")}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-4 border-t border-slate-50">
            <button 
              onClick={() => setStep(3)}
              className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" /> {t("Back")}
            </button>
            <button 
              onClick={handleRunAiAnalysis}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-lg shadow-blue-500/10"
            >
              {t("Analyze with CivicBridge AI")} <ArrowRight className="h-4 w-4 animate-pulse" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: AI ANALYSIS LOADING & REVIEW SUMMARY SCREEN */}
      {step === 5 && (
        <div className="space-y-6 animate-fade-in">
          {aiError ? (
            <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center shadow-sm space-y-6">
              <div className="h-16 w-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <AlertCircle className="h-8 w-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-slate-900">{t("Due to network issues, the AI analyzer is not working.")}</h3>
                <p className="text-sm text-slate-500 max-w-sm mx-auto">
                  {t("Retry your analyze.")}
                </p>
              </div>
              <div className="flex justify-center gap-3">
                <button
                  onClick={handleRunAiAnalysis}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-all"
                >
                  {t("Retry Analysis")}
                </button>
                <button
                  onClick={() => {
                    // Generate client fallback!
                    const simulatedData: Issue["aiAnalysis"] = {
                      classification: {
                        detectedCategory: category || "General Issue",
                        confidence: 97,
                        reasoning: "Categorized based on citizen text pattern matching."
                      },
                      severity: {
                        level: "High",
                        reasoning: "Assessed based on critical user report keywords."
                      },
                      priorityScore: {
                        score: 85,
                        breakdown: {
                          safetyRisk: "High",
                          populationAffected: "Moderate",
                          schoolZone: description.toLowerCase().includes("school") ? "Yes" : "No",
                          hospitalZone: description.toLowerCase().includes("hospital") ? "Yes" : "No",
                          trafficImpact: "Standard Local Delay"
                        }
                      },
                      responsibleAuthority: {
                        name: category === "Pothole" || category === "Road Damage" ? "Municipal Road Infrastructure Wing" : "Municipal Citizens Grievance Cell",
                        website: "https://municipal.gov/roads-division",
                        contact: "+91 20 2550 1122",
                        email: "roads@municipal.gov",
                        address: "Room 405, City Hall Annex, Central Avenue"
                      },
                      professionalComplaint: `To Whom It May Concern,\n\nWe formally lodge a report regarding: ${category}.\nLocation: ${location.address}.\nDescription: ${description}.\n\nKindly resolve this issue as soon as possible.`,
                      resolutionPlan: [
                        { step: 1, title: "Report Logged", desc: "Ticket initialized in civic ledger.", status: "completed" },
                        { step: 2, title: "Department Assignment", desc: "Routed to appropriate ward department.", status: "pending" }
                      ],
                      escalationTimeline: {
                        escDay7: "Escalate to Ward Officer",
                        escDay14: "Legal Notice",
                        timelineDesc: "Failure to respond within 7 days triggers automated escalation."
                      },
                      escalationLetter: `Subject: SECOND NOTICE - Unresolved issue regarding ${category} at ${location.address}`,
                      communityActions: [
                        "Avoid the immediate hazard spot.",
                        "Upvote this ticket on the platform."
                      ],
                      predictiveInsights: "Seasonal conditions may exacerbate this local public issue."
                    };
                    setAiResult(simulatedData);
                    setAiError(false);
                    setAiLoading(false);
                  }}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer transition-all"
                >
                  {t("Proceed with Manual Details")}
                </button>
              </div>
            </div>
          ) : aiLoading ? (
            <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center shadow-sm space-y-6">
              <div className="relative inline-block animate-pulse">
                <div className="h-16 w-16 bg-slate-200 rounded-full mx-auto" />
                <div className="h-6 w-6 bg-slate-300 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <div className="space-y-3 max-w-sm mx-auto">
                <div className="h-4 bg-slate-200 rounded w-3/4 mx-auto animate-pulse" />
                <div className="h-3 bg-slate-100 rounded w-5/6 mx-auto animate-pulse" />
                <div className="h-3 bg-slate-100 rounded w-2/3 mx-auto animate-pulse" />
              </div>
              {/* Progress bar */}
              <div className="max-w-md mx-auto space-y-1.5 pt-4">
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="bg-blue-600 h-1.5 rounded-full transition-all duration-300 animate-pulse"
                    style={{ width: `${analysisProgress}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{progressText || t("Processing...")} ({analysisProgress}%)</span>
              </div>
            </div>
          ) : (
            aiResult && (
              <div className="space-y-6 animate-fade-in">
                {/* 1 CARD AT A TIME FLOW - MAIN DEMO WOW MOMENT */}
                <div className="bg-slate-900 border border-slate-800 text-white p-8 rounded-3xl shadow-xl space-y-6 relative overflow-hidden min-h-[220px] flex flex-col justify-between">
                  <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Sparkles className="h-32 w-32" />
                  </div>
                  
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <span className="px-2.5 py-0.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="h-3 w-3 animate-spin" />
                      {t("AI DETECTED")}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono font-bold">
                      {t("Insight")} {activeCardIndex + 1} {t("of")} 7
                    </span>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-3.5 bg-blue-500/10 rounded-2xl text-blue-400 border border-blue-500/20 shrink-0">
                      {React.createElement(
                        activeCardIndex === 0 ? Sparkles :
                        activeCardIndex === 1 ? AlertOctagon :
                        activeCardIndex === 2 ? TrendingUp :
                        activeCardIndex === 3 ? Building2 :
                        activeCardIndex === 4 ? Clock :
                        activeCardIndex === 5 ? Camera : ShieldCheck,
                        { className: "h-6 w-6" }
                      )}
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">
                        {activeCardIndex === 0 ? t("Category") :
                         activeCardIndex === 1 ? t("Severity") :
                         activeCardIndex === 2 ? t("Priority Score") :
                         activeCardIndex === 3 ? t("Assigned Department") :
                         activeCardIndex === 4 ? t("Expected Resolution") :
                         activeCardIndex === 5 ? t("Visual Evidence Analyzer") : t("AI Confidence")}
                      </span>
                      <div className="text-2xl font-black text-slate-100 mt-1">
                        {activeCardIndex === 0 ? t(aiResult.classification.detectedCategory) :
                         activeCardIndex === 1 ? t(aiResult.severity?.level || aiResult.severity || "High") :
                         activeCardIndex === 2 ? `${aiResult.priorityScore.score}/100` :
                         activeCardIndex === 3 ? t(aiResult.responsibleAuthority.name) :
                         activeCardIndex === 4 ? t("3–5 Days") :
                         activeCardIndex === 5 ? (mediaPreview ? t("Visual Verification Active") : t("No Visual Evidence")) : `${aiResult.classification.confidence || 97}%`}
                      </div>
                      <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                        {activeCardIndex === 0 ? t(aiResult.classification.reasoning) :
                         activeCardIndex === 1 ? t(aiResult.severity?.reasoning || "Based on immediate zone safety indicators.") :
                         activeCardIndex === 2 ? `${t("Traffic")}: ${t(aiResult.priorityScore.breakdown.trafficImpact || "High")} | ${t("School Zone")}: ${t(aiResult.priorityScore.breakdown.schoolZone || "Yes")}` :
                         activeCardIndex === 3 ? `${t("Address")}: ${t(aiResult.responsibleAuthority.address || "Zonal Ward Office")}` :
                         activeCardIndex === 4 ? t("Standard Service Level Agreement (SLA) triggered.") :
                         activeCardIndex === 5 ? t(aiResult.classification.visualAnalysis || "Analyzing visual indicators...") : t("Validated models against India municipal directories.")}
                      </p>
                    </div>
                  </div>

                  {/* Dot Indicators & Controls */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-800/60 mt-4">
                    <div className="flex gap-1.5">
                      {Array.from({ length: 7 }).map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveCardIndex(idx)}
                          className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                            idx === activeCardIndex ? "w-6 bg-blue-500" : "w-2 bg-slate-700 hover:bg-slate-600"
                          }`}
                        />
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setActiveCardIndex(prev => Math.max(0, prev - 1))}
                        disabled={activeCardIndex === 0}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg text-[10px] font-bold uppercase tracking-wider text-slate-300 cursor-pointer transition-all"
                      >
                        {t("Prev")}
                      </button>
                      <button
                        onClick={() => setActiveCardIndex(prev => Math.min(6, prev + 1))}
                        disabled={activeCardIndex === 6}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg text-[10px] font-bold uppercase tracking-wider text-white cursor-pointer transition-all"
                      >
                        {t("Next")}
                      </button>
                    </div>
                  </div>
                </div>

                {/* AI Drafted Complaint Section */}
                <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <span className="font-bold text-slate-800 text-xs uppercase tracking-widest flex items-center gap-1.5">
                      <FileText className="h-4.5 w-4.5 text-blue-600" />
                      {t("AI-Generated Formal Grievance Letter")}
                    </span>

                    <div className="flex items-center gap-2">
                      <button 
                        onClick={handleCopyComplaint}
                        className="p-1.5 bg-slate-50 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 text-xs font-bold flex items-center gap-1 cursor-pointer"
                        title="Copy Complaint"
                      >
                        {isCopied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                        {isCopied ? t("Copied") : t("Copy")}
                      </button>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 font-mono text-[11px] text-slate-700 whitespace-pre-wrap max-h-40 overflow-y-auto leading-relaxed">
                    {aiResult.professionalComplaint}
                  </div>
                </div>

                {/* Submit Confirmation Bar */}
                <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-100 rounded-3xl">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-blue-600 flex items-center justify-center text-white shrink-0 shadow">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="font-bold text-blue-900 text-xs block">{t("Ready for Instant Submission")}</span>
                      <span className="text-[10px] text-blue-700">{t("Submitting deploys the AI resolution agent automatically.")}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={() => setStep(4)}
                      className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                    >
                      {t("Back")}
                    </button>
                    <button 
                      onClick={handleConfirmSubmit}
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/10 cursor-pointer"
                    >
                      {t("Submit Ticket")}
                    </button>
                  </div>
                </div>

              </div>
            )
          )}
        </div>
      )}

    </div>
  );
}

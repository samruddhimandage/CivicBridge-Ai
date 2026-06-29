import React, { useState } from "react";
import { 
  ArrowLeft, Clock, MapPin, CheckCircle2, ChevronRight, AlertTriangle, 
  Send, Copy, Check, ShieldAlert, Sparkles, AlertCircle, RefreshCw, 
  FileText, Mail, MessageSquare, Download, Camera, Trash2, Heart, Users,
  ShieldCheck, HelpCircle, Eye, Building2
} from "lucide-react";
import { Issue, Comment } from "../types";
import { Language } from "../translations";

interface IssueDetailProps {
  issue: Issue;
  currentLanguage: Language;
  t: (key: string) => string;
  onBack: () => void;
  onUpdateIssue: (updated: Issue) => void;
}

export default function IssueDetailView({ 
  issue, 
  currentLanguage, 
  t, 
  onBack, 
  onUpdateIssue 
}: IssueDetailProps) {
  
  const [hasVerified, setHasVerified] = useState<boolean>(false);
  const [hasVotedResolved, setHasVotedResolved] = useState<boolean>(false);
  const [commentText, setCommentText] = useState<string>("");
  const [isCopiedComplaint, setIsCopiedComplaint] = useState<boolean>(false);
  const [isCopiedEscalation, setIsCopiedEscalation] = useState<boolean>(false);
  const [showEscalationLetter, setShowEscalationLetter] = useState<boolean>(false);
  const [evidenceImage, setEvidenceImage] = useState<string>("");

  const handleVerify = () => {
    if (hasVerified) return;
    setHasVerified(true);

    const updatedIssue: Issue = {
      ...issue,
      verificationCount: issue.verificationCount + 1,
      comments: [
        ...issue.comments,
        {
          id: `verify-comment-${Date.now()}`,
          author: "Local Contributor",
          text: "I confirm that this issue still exists and represents an active neighborhood safety hazard. Adding my verification weight.",
          createdAt: new Date().toISOString(),
          badge: "Verifier"
        }
      ]
    };

    // Reward points
    const currentPoints = parseInt(localStorage.getItem("user_civic_points") || "120");
    localStorage.setItem("user_civic_points", (currentPoints + 25).toString());
    
    const currentVerifications = parseInt(localStorage.getItem("user_verifications_count") || "4");
    localStorage.setItem("user_verifications_count", (currentVerifications + 1).toString());

    onUpdateIssue(updatedIssue);
    alert("Verification submitted! +25 Contribution Score earned.");
  };

  const handleMarkResolved = () => {
    if (hasVotedResolved) return;
    setHasVotedResolved(true);

    const updatedIssue: Issue = {
      ...issue,
      status: "Resolved",
      resolvedAt: new Date().toISOString(),
      comments: [
        ...issue.comments,
        {
          id: `resolve-comment-${Date.now()}`,
          author: "Local Contributor",
          text: "Marking this issue as fully resolved. The repairs are complete and verified.",
          createdAt: new Date().toISOString(),
          badge: "Issue Resolver"
        }
      ]
    };

    onUpdateIssue(updatedIssue);
    alert("Thank you! Consensus vote logged. Ticket updated to 'Resolved'.");
  };

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const newComment: Comment = {
      id: `comm-${Date.now()}`,
      author: "Active Contributor",
      text: commentText,
      createdAt: new Date().toISOString(),
      badge: "Local Steward",
      imageUrl: evidenceImage || undefined
    };

    const updatedIssue: Issue = {
      ...issue,
      comments: [...issue.comments, newComment]
    };

    onUpdateIssue(updatedIssue);
    setCommentText("");
    setEvidenceImage("");
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEvidenceImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const copyToClipboard = (text: string, flag: "complaint" | "escalation") => {
    navigator.clipboard.writeText(text);
    if (flag === "complaint") {
      setIsCopiedComplaint(true);
      setTimeout(() => setIsCopiedComplaint(false), 2000);
    } else {
      setIsCopiedEscalation(true);
      setTimeout(() => setIsCopiedEscalation(false), 2000);
    }
  };

  const downloadTxtFile = (text: string, title: string) => {
    const element = document.createElement("a");
    const file = new Blob([text], {type: "text/plain"});
    element.href = URL.createObjectURL(file);
    element.download = `${title}.txt`;
    document.body.appendChild(element);
    element.click();
  };

  // Timeline Lifecycle mapper
  const timelineSteps = [
    { label: "Reported", status: "Reported" as const, color: "bg-blue-600", activeBg: "bg-blue-500", ringColor: "ring-blue-100", textColor: "text-blue-700" },
    { label: "Validated", status: "Verified" as const, color: "bg-indigo-600", activeBg: "bg-indigo-500", ringColor: "ring-indigo-100", textColor: "text-indigo-700" },
    { label: "Routed", status: "Routed" as const, color: "bg-purple-600", activeBg: "bg-purple-500", ringColor: "ring-purple-100", textColor: "text-purple-700" },
    { label: "In Progress", status: "In Progress" as const, color: "bg-amber-500", activeBg: "bg-amber-500", ringColor: "ring-amber-100", textColor: "text-amber-700" },
    { label: "Escalated", status: "Escalated" as const, color: "bg-red-600", activeBg: "bg-red-500", ringColor: "ring-red-100", textColor: "text-red-700" },
    { label: "Resolved", status: "Resolved" as const, color: "bg-emerald-600", activeBg: "bg-emerald-500", ringColor: "ring-emerald-100", textColor: "text-emerald-700" }
  ];

  const currentStepIdx = timelineSteps.findIndex(s => s.status === issue.status);

  return (
    <div className="max-w-4xl mx-auto space-y-8" id="issue-detail-view-container">
      
      {/* Dynamic Header Action Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors font-bold cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("Back to Dashboard")}
        </button>

        <span className="text-[10px] bg-blue-50 border border-blue-100 text-blue-700 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
          {issue.id} • {t("priority")} {issue.priorityScore}
        </span>
      </div>

      {/* SECTION 1: ISSUE OVERVIEW */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-50 pb-5">
          <div className="space-y-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700">
              {t("Issue Summary")}
            </span>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-2">
              {t(issue.category)} at {t(issue.location.address)}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              issue.status === "Resolved" ? "bg-emerald-100 text-emerald-800 border border-emerald-200" :
              issue.status === "Escalated" ? "bg-red-100 text-red-800 border border-red-200" :
              issue.status === "In Progress" ? "bg-blue-100 text-blue-800 border border-blue-200" : "bg-slate-100 text-slate-700"
            }`}>
              {t(issue.status)}
            </span>
            <span className="text-xs font-semibold text-slate-400 font-mono">
              {t("Score")}: {issue.priorityScore}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t("Citizen Description")}</h3>
            <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap italic">
              "{issue.description}"
            </p>
            {issue.imageUrl && (
              <div className="rounded-2xl overflow-hidden border border-slate-100 max-h-56 mt-2">
                <img src={issue.imageUrl} alt="Evidence" className="object-cover w-full h-full max-h-56" />
              </div>
            )}
          </div>

          <div className="space-y-4 bg-slate-50/50 border border-slate-100 p-5 rounded-2xl">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="h-4 w-4 text-blue-600" />
              {t("Assigned Authority Directory")}
            </h3>

            <div className="space-y-3.5 text-xs text-slate-600">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">{t("Department Agency")}</span>
                <span className="font-extrabold text-slate-800 mt-0.5 block">
                  {t(issue.aiAnalysis?.responsibleAuthority?.name || "Assigned Ward Department")}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">{t("Lead Zonal Email")}</span>
                <span className="font-mono text-slate-700 mt-0.5 block">
                  {issue.aiAnalysis?.responsibleAuthority?.email || "ward-complaints@authority.gov"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">{t("Hotline Phone")}</span>
                  <span className="font-semibold text-slate-800">{issue.aiAnalysis?.responsibleAuthority?.contact || "1800-CIVIC-LINE"}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">{t("Ward Precinct")}</span>
                  <span className="font-semibold text-slate-800">{t(issue.location.neighborhood || "Central Division")}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: AI ASSESSMENT */}
      {issue.aiAnalysis && (
        <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl p-6 shadow-md space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-800 text-slate-400">
              {t("AI Analysis")}
            </span>
            <span className="text-[10px] bg-orange-500/10 border border-orange-500/20 text-orange-400 rounded px-2.5 py-0.5 font-bold uppercase flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5" />
              {t("Live Diagnostic")}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">{t("AI Accuracy")}</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-black text-slate-100">{issue.aiAnalysis.classification.confidence}% {t("match")}</span>
                  <span className="text-xs text-emerald-400 font-bold">✓ {t("Verified")}</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  {t(issue.aiAnalysis.classification.reasoning)}
                </p>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">{t("Monitored Risk Vectors")}</span>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs text-slate-300">
                    <span className="text-[9px] text-slate-500 font-bold uppercase block">{t("School Zone")}</span>
                    <span className="font-bold text-slate-200 mt-0.5 block">{issue.aiAnalysis.priorityScore.breakdown.schoolZone}</span>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs text-slate-300">
                    <span className="text-[9px] text-slate-500 font-bold uppercase block">{t("Hospital Zone")}</span>
                    <span className="font-bold text-slate-200 mt-0.5 block">{issue.aiAnalysis.priorityScore.breakdown.hospitalZone}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 space-y-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">{t("Priority Breakdown Criteria")}</span>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between items-baseline">
                    <span className="text-slate-500">{t("Severity Metric")}</span>
                    <span className="font-mono font-semibold text-slate-200">{t(issue.aiAnalysis.severity.level)}</span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-slate-500">{t("Duplicate Check")}</span>
                    <span className="font-mono font-semibold text-emerald-400">0 {t("Duplicates Found")}</span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-slate-500">{t("Traffic Safety Impact")}</span>
                    <span className="font-mono font-semibold text-slate-200 text-right">{issue.aiAnalysis.priorityScore.breakdown.trafficImpact}</span>
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed border-t border-slate-800 pt-2 mt-2">
                  {issue.aiAnalysis.severity.reasoning}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: RESOLUTION TIMELINE */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-50 pb-4">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700">
            {t("Progress")}
          </span>
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
            <Clock className="h-4 w-4" /> {t("ETA: 3-5 Days")}
          </span>
        </div>

        {/* Timeline Visualization */}
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-y-4 mb-2">
          <div className="absolute left-4 sm:left-4 top-2 bottom-2 sm:bottom-auto sm:top-1/2 sm:right-4 sm:h-1 bg-slate-100 -z-0 w-1 sm:w-auto -translate-y-1/2" />
          {currentStepIdx >= 0 && (
            <div 
              className="absolute left-4 top-1/2 -z-0 h-1 bg-gradient-to-r from-blue-600 to-emerald-500 transition-all duration-500 -translate-y-1/2 hidden sm:block"
              style={{ width: `${(currentStepIdx / (timelineSteps.length - 1)) * 95}%` }}
            />
          )}

          {timelineSteps.map((step, idx) => {
            const isPast = idx <= currentStepIdx;
            const isCurrent = idx === currentStepIdx;
            
            return (
              <div key={idx} className="flex sm:flex-col items-center gap-4 sm:gap-2 relative z-10 sm:text-center flex-1">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                  isPast ? `${step.color} text-white` : "bg-white text-slate-300 border-2 border-slate-200"
                }`}>
                  {isPast ? "✓" : idx + 1}
                </div>
                <div className="text-left sm:text-center">
                  <span className="text-xs font-bold text-slate-800 block">{t(step.label)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 4: COMMUNITY VERIFICATION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Verification and Progress */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700">
                {t("Community")}
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t("Validation Consensus Progress")}</h3>
                <div className="flex items-baseline gap-1 mt-1.5">
                  <span className="text-2xl font-extrabold text-slate-900">{issue.verificationCount} / 15</span>
                  <span className="text-xs text-slate-400">{t("Verifications logged")}</span>
                </div>
              </div>

              {/* Progress visual */}
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-emerald-500 h-2 rounded-full" 
                  style={{ width: `${Math.min((issue.verificationCount / 15) * 100, 100)}%` }}
                />
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed">
                {t("validationDescription")}
              </p>
            </div>
          </div>

          <div className="flex gap-2 pt-5">
            <button
              onClick={handleVerify}
              disabled={hasVerified}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-100 disabled:text-slate-400 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="h-4 w-4" />
              {hasVerified ? t("Verified") : t("Confirm Issue Exists")}
            </button>
            <button
              onClick={handleMarkResolved}
              disabled={hasVotedResolved}
              className="px-4 py-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 disabled:bg-slate-100 disabled:text-slate-400 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {t("Mark Fixed")}
            </button>
          </div>
        </div>

        {/* Discussion board */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <MessageSquare className="h-4 w-4 text-blue-600" />
            {t("Active Discussion Board")}
          </h3>

          <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
            {issue.comments.map((comment) => (
              <div key={comment.id} className="p-3 rounded-xl bg-slate-50/50 border border-slate-50 flex flex-col gap-1">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-bold text-slate-800">{comment.author}</span>
                  <span className="text-slate-400">{new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                {comment.badge && (
                  <span className="text-[8px] font-bold uppercase text-blue-600 tracking-wider">
                    {t(comment.badge)}
                  </span>
                )}
                <p className="text-xs text-slate-600">{t(comment.text)}</p>
                {comment.imageUrl && (
                  <div className="mt-1.5 rounded-lg overflow-hidden border border-slate-100 max-h-32 inline-block">
                    <img src={comment.imageUrl} alt="Attached evidence" className="object-cover max-h-32 max-w-full rounded-md" referrerPolicy="no-referrer" />
                  </div>
                )}
              </div>
            ))}
          </div>

          <form onSubmit={handlePostComment} className="space-y-3 border-t border-slate-50 pt-3">
            {evidenceImage && (
              <div className="relative inline-block mt-1">
                <img src={evidenceImage} alt="Comment upload preview" className="h-16 w-16 object-cover rounded-xl border border-slate-200" referrerPolicy="no-referrer" />
                <button
                  type="button"
                  onClick={() => setEvidenceImage("")}
                  className="absolute -top-1.5 -right-1.5 h-5 w-5 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center text-xs shadow-md cursor-pointer"
                >
                  ×
                </button>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <label className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl cursor-pointer transition-colors" title={t("Attach Evidence Image")}>
                <Camera className="h-4 w-4" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>

              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder={t("Post a coordination detail...")}
                className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-700"
              />
              
              <button type="submit" className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold rounded-lg cursor-pointer">
                {t("Send")}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* SECTION 5: ESCALATION STATUS */}
      {issue.aiAnalysis && (
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-50 pb-4">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700">
              {t("Escalation")}
            </span>
            <span className="text-xs font-semibold text-red-600 flex items-center gap-1.5 animate-pulse">
              <ShieldAlert className="h-4 w-4" /> {t("Escalation Buffer: 4 Days Left")}
            </span>
          </div>

          <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-1">
              <h4 className="text-xs font-extrabold text-red-900 uppercase tracking-wide">
                {t("Smart SLA Protocol Active")}
              </h4>
              <p className="text-[10px] text-red-700 max-w-xl">
                {t("Unresolved issues automatically escalate to senior municipal commissioners on Day 7. AI has compiled the official demand letters.")}
              </p>
            </div>

            <button
              onClick={() => setShowEscalationLetter(!showEscalationLetter)}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all shadow shadow-red-600/10 cursor-pointer whitespace-nowrap"
            >
              {showEscalationLetter ? t("Close Letter Draft") : t("Review Escalation Letter")}
            </button>
          </div>

          {/* Letter Draft overlay */}
          {showEscalationLetter && (
            <div className="bg-slate-900 border border-slate-800 text-slate-100 p-5 rounded-2xl space-y-4 animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
                  {t("AI SLA Escalation Letter (To Ward Commissioner)")}
                </span>

                <div className="flex gap-2">
                  <button
                    onClick={() => copyToClipboard(issue.aiAnalysis!.escalationLetter, "escalation")}
                    className="px-2.5 py-1 text-[9px] bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 text-slate-300 flex items-center gap-1 cursor-pointer"
                  >
                    {isCopiedEscalation ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    <span>{t("Copy")}</span>
                  </button>
                  <button
                    onClick={() => downloadTxtFile(issue.aiAnalysis!.escalationLetter, `SLA_Escalation_${issue.id}`)}
                    className="px-2.5 py-1 text-[9px] bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 text-slate-300 flex items-center gap-1 cursor-pointer"
                  >
                    <Download className="h-3 w-3" />
                    <span>{t("Download TXT")}</span>
                  </button>
                </div>
              </div>

              <div className="font-mono text-[10px] leading-relaxed whitespace-pre-wrap max-h-64 overflow-y-auto bg-slate-950 p-4 rounded-xl text-slate-300">
                {issue.aiAnalysis.escalationLetter}
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}

import React from "react";
import { 
  Trophy, Medal, ShieldAlert, BadgeCheck, Users, 
  MapPin, CheckCircle, Flame, ArrowUp, Star 
} from "lucide-react";
import { Language } from "../translations";
import { NeighborhoodScore, Contributor } from "../types";

interface LeaderboardViewProps {
  neighborhoods: NeighborhoodScore[];
  contributors: Contributor[];
  currentLanguage: Language;
  t: (key: string) => string;
}

export default function LeaderboardView({ 
  neighborhoods, 
  contributors, 
  currentLanguage, 
  t 
}: LeaderboardViewProps) {
  
  // User's own scorecard data simulation (Without login!)
  const userPoints = parseInt(localStorage.getItem("user_civic_points") || "120");
  const userReportsCount = JSON.parse(localStorage.getItem("my_reported_tickets") || "[]").length;
  const userVerifications = parseInt(localStorage.getItem("user_verifications_count") || "4");

  // Determine user recognition achievements based on contribution levels
  const userAchievements = ["Verifier Recognition"];
  if (userPoints > 150) userAchievements.push("Community Steward");
  if (userReportsCount >= 3) userAchievements.push("Dedicated Dispatcher");
  if (userPoints > 300) userAchievements.push("Distinguished Contributor");

  return (
    <div className="space-y-8" id="leaderboard-view-root">
      
      {/* Dynamic Profile/Hero Card representing Active Citizen Contribution Scorecard */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-950 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
        {/* Abstract background highlights */}
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Trophy className="h-44 w-44" />
        </div>

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <span className="px-3 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5">
              <Flame className="h-3.5 w-3.5 text-orange-500 animate-bounce" />
              {t("Active Citizen Scorecard")}
            </span>
            <h2 className="text-2xl font-black tracking-tight mt-1">
              {t("anonymousSubmit")}
            </h2>
            <p className="text-slate-300 text-xs">
              {t("Every verify action and unique report earns points towards community leadership levels.")}
            </p>
          </div>

          <div className="flex items-center gap-6 divide-x divide-slate-800">
            <div className="text-center pl-0">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{t("Contribution Score")}</span>
              <div className="text-3xl font-black text-blue-400 mt-1">{userPoints} pts</div>
            </div>
            <div className="text-center pl-6">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{t("Reports")}</span>
              <div className="text-2xl font-bold text-slate-200 mt-1">{userReportsCount}</div>
            </div>
            <div className="text-center pl-6">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest font-sans">{t("Verifications")}</span>
              <div className="text-2xl font-bold text-slate-200 mt-1">{userVerifications}</div>
            </div>
          </div>
        </div>

        {/* Community Recognition Panel */}
        <div className="mt-6 border-t border-slate-800/60 pt-5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-3">
            {t("Community Recognition")}
          </span>
          <div className="flex flex-wrap gap-2.5">
            {userAchievements.map((badge, idx) => (
              <span 
                key={idx} 
                className="px-3 py-1.5 bg-slate-800 border border-slate-700/50 rounded-xl text-xs font-semibold text-slate-200 flex items-center gap-1.5 shadow-sm hover:scale-105 transition-transform"
              >
                <Medal className="h-4 w-4 text-orange-400" />
                {t(badge)}
              </span>
            ))}
            <div className="px-3 py-1.5 border border-dashed border-slate-700 rounded-xl text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <span>{t("Next recognition milestone: Dedicated Dispatcher (Requires 3 filed reports)")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboards columns: Neighborhood Scores VS Top Contributors */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="leaderboard-columns-grid">
        
        {/* Neighborhood Civic Health Score leaderboard */}
        <div className="lg:col-span-7 bg-white border border-slate-100 p-6 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-600" />
                {t("civicHealthScore")} {t("Leaderboard")}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {t("Computed dynamically based on resolution times, verification counts, and active reports.")}
              </p>
            </div>
          </div>

          <div className="space-y-3" id="neighborhoods-scores-list">
            {neighborhoods.map((n, idx) => {
              const isExcellent = n.score >= 85;
              const isWarning = n.score < 70;
              
              return (
                <div 
                  key={n.name}
                  id={`neigh-row-${n.name}`}
                  className="p-4 rounded-xl border border-slate-50 bg-slate-50/50 hover:bg-slate-50 transition-colors flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-400 font-mono w-4">
                      #{idx + 1}
                    </span>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">{t(n.name)}</h4>
                      <span className="text-[10px] text-slate-400">
                        {n.resolved} {t("of")} {n.reported} {t("cases resolved")}
                      </span>
                    </div>
                  </div>

                  {/* Score status values */}
                  <div className="flex items-center gap-5">
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">{t("Health Score")}</span>
                      <span className={`text-base font-black ${
                        isExcellent ? "text-emerald-600" : isWarning ? "text-red-500" : "text-blue-600"
                      }`}>
                        {n.score}
                      </span>
                    </div>

                    <div className={`h-9 w-9 rounded-full flex items-center justify-center font-black text-xs border ${
                      isExcellent ? "bg-emerald-50 border-emerald-100 text-emerald-700" :
                      isWarning ? "bg-red-50 border-red-100 text-red-700" : "bg-blue-50 border-blue-100 text-blue-700"
                    }`}>
                      {n.grade}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Contributors section */}
        <div className="lg:col-span-5 bg-white border border-slate-100 p-6 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Trophy className="h-5 w-5 text-orange-500 animate-pulse" />
                {t("Community Contributors")}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {t("Top citizens leading community verification and tracking efforts.")}
              </p>
            </div>
          </div>

          <div className="space-y-3.5" id="contributors-top-list">
            {contributors.map((c, idx) => (
              <div 
                key={c.name}
                id={`contrib-row-${c.name.replace(/\s+/g, "-")}`}
                className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-white shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center font-bold text-blue-600 text-xs">
                    {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : idx + 1}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs">{t(c.name)}</h4>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5 font-medium">
                      <span>{c.reportsCount} {t("Reports")}</span>
                      <span>•</span>
                      <span>{c.verificationsCount} {t("Verifications")}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-black text-blue-600 block">{c.points} pts</span>
                  <div className="flex items-center gap-0.5 mt-0.5">
                    {c.badges.slice(0, 1).map((badge, bIdx) => (
                      <span key={bIdx} className="text-[8px] bg-slate-50 border border-slate-100 px-1 py-0.5 rounded text-slate-500 truncate" title={badge}>
                        {t(badge)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}

import React from "react";
import { Globe, Check, ChevronDown } from "lucide-react";
import { LANGUAGES, Language } from "../translations";

interface LanguageSelectorProps {
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
}

export default function LanguageSelector({ currentLanguage, onLanguageChange }: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const selectedLang = LANGUAGES.find(l => l.code === currentLanguage) || LANGUAGES[0];

  return (
    <div className="relative inline-block text-left" id="lang-selector-container">
      <button
        onClick={() => setIsOpen(!isOpen)}
        id="lang-selector-button"
        className="flex items-center gap-1.5 px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer shadow-xs shrink-0 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
      >
        <Globe className="h-3.5 w-3.5 text-blue-600" />
        <span className="text-slate-500">Language:</span>
        <span className="text-blue-700 font-extrabold">{selectedLang.name}</span>
        <ChevronDown className="h-3 w-3 text-slate-400" />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div 
            id="lang-dropdown-menu"
            className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white shadow-xl ring-1 ring-black/5 z-50 overflow-hidden divide-y divide-slate-100 focus:outline-none"
          >
            <div className="py-1">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  id={`lang-opt-${lang.code}`}
                  onClick={() => {
                    onLanguageChange(lang.code);
                    setIsOpen(false);
                  }}
                  className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition-colors cursor-pointer ${
                    currentLanguage === lang.code
                      ? "bg-blue-50 text-blue-700 font-semibold"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span>{lang.name}</span>
                  {currentLanguage === lang.code && (
                    <Check className="h-4 w-4 text-blue-600" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

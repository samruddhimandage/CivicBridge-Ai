export interface Issue {
  id: string; // Ticket ID e.g. CB-2026-00124
  category: string;
  description: string;
  location: {
    address: string;
    lat: number;
    lng: number;
    neighborhood: string;
  };
  voiceTranscript?: string;
  imageUrl?: string;
  status: "Reported" | "Verified" | "Routed" | "In Progress" | "Escalated" | "Resolved";
  severity: "Low" | "Medium" | "High" | "Critical";
  priorityScore: number;
  verificationCount: number;
  votedUserIds: string[]; // local mock to track if user has already verified/upvoted
  createdAt: string;
  resolvedAt?: string;
  comments: Comment[];
  aiAnalysis?: {
    classification: {
      detectedCategory: string;
      confidence: number;
      reasoning: string;
      visualAnalysis?: string;
    };
    severity: {
      level: string;
      reasoning: string;
    };
    priorityScore: {
      score: number;
      breakdown: {
        safetyRisk: string;
        populationAffected: string;
        schoolZone: string;
        hospitalZone: string;
        trafficImpact: string;
      };
    };
    responsibleAuthority: {
      name: string;
      website: string;
      contact: string;
      email: string;
      address: string;
    };
    professionalComplaint: string;
    resolutionPlan: Array<{
      step: number;
      title: string;
      desc: string;
      status: "completed" | "pending";
    }>;
    escalationTimeline: {
      escDay7: string;
      escDay14: string;
      timelineDesc: string;
    };
    escalationLetter: string;
    communityActions: string[];
    predictiveInsights: string;
  };
}

export interface Comment {
  id: string;
  author: string;
  text: string;
  createdAt: string;
  badge?: string;
  imageUrl?: string;
}

export interface NeighborhoodScore {
  name: string;
  score: number;
  reported: number;
  resolved: number;
  grade: "A+" | "A" | "B" | "C" | "D";
}

export interface Contributor {
  name: string;
  points: number;
  reportsCount: number;
  verificationsCount: number;
  badges: string[];
}

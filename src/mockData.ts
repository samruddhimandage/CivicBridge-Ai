import { Issue, NeighborhoodScore, Contributor } from "./types";

export const STARTING_ISSUES: Issue[] = [
  {
    id: "CB-2026-00101",
    category: "Pothole",
    description: "Deep pothole right in front of Orchid School main gate. Vehicles are sudden braking to avoid it, creating extreme danger for school children during drop-off hours.",
    location: {
      address: "Orchid School Lane, Baner Road, Baner",
      lat: 18.5594,
      lng: 73.7915,
      neighborhood: "Baner"
    },
    status: "In Progress",
    severity: "Critical",
    priorityScore: 95,
    verificationCount: 28,
    votedUserIds: [],
    createdAt: "2026-06-15T08:30:00Z",
    comments: [
      { id: "c1", author: "Rajesh Kumar", text: "Almost slipped from my scooter here. Extremely dangerous!", createdAt: "2026-06-15T09:12:00Z", badge: "Community Hero" },
      { id: "c2", author: "Sneha Patil", text: "Reported to school admin too. Glad it is routed here with 95 priority.", createdAt: "2026-06-15T11:45:00Z", badge: "Verifier" }
    ],
    aiAnalysis: {
      classification: {
        detectedCategory: "Pothole",
        confidence: 98,
        reasoning: "Image and description highlight a physical cavity in the paved road surface in a high-pedestrian area."
      },
      severity: {
        level: "Critical",
        reasoning: "Located directly in a school zone with active collision risk during drop-off/pick-up cycles."
      },
      priorityScore: {
        score: 95,
        breakdown: {
          safetyRisk: "High",
          populationAffected: "Significant (School Parents & Commuters)",
          schoolZone: "Yes (Within 20 meters)",
          hospitalZone: "No",
          trafficImpact: "Severe Peak Delay"
        }
      },
      responsibleAuthority: {
        name: "Municipal Corporation Road Infrastructure Division",
        website: "https://municipal.gov/roads-division",
        contact: "+91 20 2550 1122",
        email: "roads@municipal.gov",
        address: "Room 405, City Hall Annex, Central Avenue"
      },
      professionalComplaint: "To,\nThe Executive Engineer,\nMunicipal Corporation Road Infrastructure Division\n\nSubject: Urgent repair of critical pothole opposite Orchid School gate (Baner)\n\nSir/Madam,\n\nI am reporting a highly critical pothole located directly opposite the main gate of Orchid School, Baner. Vehicles, particularly school buses and two-wheelers, are being forced to brake suddenly to negotiate the crater, leading to chaotic near-miss collisions. \n\nGiven the dense presence of children and parents, this represents an immediate public safety hazard. Please dispatch a road restoration crew to carry out repair works on an emergency basis.\n\nThank you.",
      resolutionPlan: [
        { step: 1, title: "Report Registered", desc: "Ticket CB-2026-00101 locked in system ledger.", status: "completed" },
        { step: 2, title: "Authority Routed", desc: "Transmitted to National Roads Division under Priority Code RED-Zone.", status: "completed" },
        { step: 3, title: "Materials Dispatched", desc: "Standard asphalt patching compound allocated to Ward 3 depot.", status: "completed" },
        { step: 4, title: "On-Site Restoration", desc: "Scheduled for repair within 48 hours. Awaiting crew dispatch.", status: "pending" }
      ],
      escalationTimeline: {
        escDay7: "Escalate to Assistant Municipal Commissioner (Zone 4)",
        escDay14: "Legal Escalation & Media Disclosure to Urban Grievance Directorate",
        timelineDesc: "Automatic alert sent to regional road chief at 120 hours. Direct commissioner notification at 240 hours."
      },
      escalationLetter: "To,\nThe Municipal Commissioner,\nMunicipal Corporation HQ\n\nSubject: ESCALATION - Unresolved Critical School Zone Pothole at Baner (CB-2026-00101)\n\nSir/Madam,\n\nThis is an official escalation regarding the critical safety hazard opposite Orchid School, Baner (Ticket CB-2026-00101). Despite being registered 7 days ago and rated 95 Priority, no field repairs have started.\n\nWe urge you to intervene immediately before a child is injured. Citizen verification remains active with 28 verified community votes.",
      communityActions: [
        "Use the secondary bypass gate if school security permits.",
        "Maintain a speed limit of under 10 km/h on this stretch.",
        "Share this ticket on local neighborhood WhatsApp groups to keep pressure active."
      ],
      predictiveInsights: "Pothole clusters in Baner show a 24% year-over-year rise during heavy rains due to localized stormwater runoff failure."
    }
  },
  {
    id: "CB-2026-00102",
    category: "Water Leakage",
    description: "Main water supply line fractured near Kothrud Depot. Gallons of clean drinking water are wasting into the open sewer for the last 12 hours. Water pressure in nearby buildings has completely dropped.",
    location: {
      address: "Opposite Kothrud Bus Depot, Karve Road, Kothrud",
      lat: 18.5074,
      lng: 73.8077,
      neighborhood: "Kothrud"
    },
    status: "Verified",
    severity: "High",
    priorityScore: 80,
    verificationCount: 19,
    votedUserIds: [],
    createdAt: "2026-06-21T10:15:00Z",
    comments: [
      { id: "c3", author: "Anil Deshmukh", text: "No water in our apartment block since morning. Disgraceful wastage!", createdAt: "2026-06-21T11:00:00Z", badge: "Verifier" }
    ],
    aiAnalysis: {
      classification: {
        detectedCategory: "Water Leakage",
        confidence: 99,
        reasoning: "High-volume drinking water pipeline fracture leading to active resource waste and utility pressure drops."
      },
      severity: {
        level: "High",
        reasoning: "Critical drinking water wastage with immediate secondary impact on residential utility supply across Kothrud ward."
      },
      priorityScore: {
        score: 80,
        breakdown: {
          safetyRisk: "Medium",
          populationAffected: "High (Over 1,200 households affected)",
          schoolZone: "No",
          hospitalZone: "Yes (Within 100 meters - Sahyadri Hospital)",
          trafficImpact: "Moderate Street Waterlogging"
        }
      },
      responsibleAuthority: {
        name: "Municipal Water Supply and Sewerage Board",
        website: "https://pmc.gov.in/water-supply",
        contact: "+91 20 2550 3344",
        email: "waterops@municipal.gov",
        address: "Jal Bhavan, Pump House Road, Ward 4"
      },
      professionalComplaint: "To,\nThe Executive Engineer,\nMunicipal Water Supply and Sewerage Board\n\nSubject: Severe main pipeline fracture and water wastage at Kothrud Depot\n\nSir/Madam,\n\nThis is to bring to your immediate notice a massive fracture in the main municipal water supply pipeline opposite Kothrud Bus Depot on Karve Road. Drinking water has been spilling at high pressure for over 12 hours, flooding nearby lanes and dropping tap water pressure to zero in neighboring housing societies.\n\nPlease order an emergency shutdown of this line section and carry out immediate joint-welding works to save water and restore residential supply.\n\nThank you.",
      resolutionPlan: [
        { step: 1, title: "Report Registered", desc: "Ticket CB-2026-00102 successfully opened.", status: "completed" },
        { step: 2, title: "Citizen Verification", desc: "Verified by 19 unique residents. Urgency upvoted.", status: "completed" },
        { step: 3, title: "Gate Valve Shutdown", desc: "Technician dispatched to shut line valve to isolate leak.", status: "pending" },
        { step: 4, title: "Excavation & Repair", desc: "Excavating roadbed to weld pipeline fracture. Scheduled within 12 hours.", status: "pending" }
      ],
      escalationTimeline: {
        escDay7: "Escalate to Chief Engineer (Water Works), Municipal HQ",
        escDay14: "Grievance filing with State Public Utilities Regulatory Panel",
        timelineDesc: "Failure to isolate main leak within 24 hours triggers automatic supervisor warning."
      },
      escalationLetter: "To,\nThe Chief Engineer,\nMunicipal Water Works Division\n\nSubject: ESCALATION - Unresolved main pipeline rupture at Kothrud Depot (CB-2026-00102)\n\nSir/Madam,\n\nI am escalating the unresolved primary water pipeline burst opposite Kothrud Depot. Despite multiple notifications, thousands of liters of clean water continue to flood the streets while Sahyadri Hospital and nearby areas face acute water scarcity.\n\nWe demand immediate field team mobilization to repair this supply line.",
      communityActions: [
        "Store backup water as major supply interruptions will continue during repair.",
        "Report pressure anomalies in neighboring buildings to help isolate pressure drops.",
        "Avoid wading through water pooled near electrical poles."
      ],
      predictiveInsights: "Kothrud water network is experiencing stress spikes. Aging cast-iron pipes are highly vulnerable to joint failure under summer temperature expansion."
    }
  },
  {
    id: "CB-2026-00103",
    category: "Garbage Dump",
    description: "Illegal garbage dumping in Wakad near the open plots. Dog pack has gathered around the pile, attacking pedestrians and making it impossible to walk. Extreme smell and hygiene hazard.",
    location: {
      address: "Near Datta Mandir Road, Wakad",
      lat: 18.5987,
      lng: 73.7651,
      neighborhood: "Wakad"
    },
    status: "Reported",
    severity: "Medium",
    priorityScore: 65,
    verificationCount: 8,
    votedUserIds: [],
    createdAt: "2026-06-22T14:40:00Z",
    comments: [
      { id: "c4", author: "Mahendra Singh", text: "Stray dogs chased my kid yesterday. This garbage dump must go!", createdAt: "2026-06-22T16:10:00Z", badge: "Verifier" }
    ],
    aiAnalysis: {
      classification: {
        detectedCategory: "Garbage Dump",
        confidence: 96,
        reasoning: "Concentration of solid organic and inorganic waste on public plot leading to vector breeding."
      },
      severity: {
        level: "Medium",
        reasoning: "Hygiene risk and animal congregation causing safety threats for pedestrians."
      },
      priorityScore: {
        score: 65,
        breakdown: {
          safetyRisk: "High (Stray dogs)",
          populationAffected: "Moderate",
          schoolZone: "No",
          hospitalZone: "No",
          trafficImpact: "None"
        }
      },
      responsibleAuthority: {
        name: "Solid Waste Management Division",
        website: "https://pmc.gov.in/sanitation",
        contact: "+91 20 2550 4488",
        email: "cleanliness@municipal.gov",
        address: "SWM Depot Block B, Industrial Estate Road"
      },
      professionalComplaint: "To,\nThe Ward Officer,\nSolid Waste Management Division\n\nSubject: Illegal garbage dumping and stray dog menace on Datta Mandir Road, Wakad\n\nSir/Madam,\n\nI wish to report an illegal garbage dumping ground that has formed on Datta Mandir Road, Wakad. The pile of decomposing waste has attracted a pack of aggressive stray dogs that are attacking pedestrians and school children.\n\nThe stench is unbearable and poses severe health and sanitary risks. I request you to clear this waste heap immediately and put up 'No Dumping' boards with cameras to prevent future violations.\n\nSincerely,\nLocal Wakad Residents",
      resolutionPlan: [
        { step: 1, title: "Report Logged", desc: "Ticket opened and classified.", status: "completed" },
        { step: 2, title: "Site Inspection", desc: "Sanitation inspector scheduled to visit and verify dump size.", status: "pending" },
        { step: 3, title: "Waste Clearance", desc: "Dump truck and loading shovel scheduled for spot clearance.", status: "pending" },
        { step: 4, title: "Enforcement", desc: "Deploy penalty warning signage and neighborhood alerts.", status: "pending" }
      ],
      escalationTimeline: {
        escDay7: "Escalate to Chief Sanitary Inspector (Wakad Ward)",
        escDay14: "Escalate to Deputy Commissioner (Solid Waste Management)",
        timelineDesc: "If waste clearance is not scheduled within 5 days, a notice is triggered to the Ward Sanitary Officer."
      },
      escalationLetter: "To,\nThe Deputy Commissioner (SWM),\nMunicipal Sanitation Board\n\nSubject: ESCALATION - Neglected hazardous garbage dump at Wakad (CB-2026-00103)\n\nSir/Madam,\n\nThis is an escalation of the garbage dump on Datta Mandir Road, Wakad. It has remained uncleared for over a week, leading to public safety risks due to aggressive stray animals.\n\nWe request your immediate intervention to order clean-up trucks.",
      communityActions: [
        "Avoid disposing food waste in plastic bags in open areas.",
        "Take alternate routes during evening hours to avoid stray dogs.",
        "Report any commercial waste trucks dumping illegally here."
      ],
      predictiveInsights: "Illegal waste dumps in Wakad spike near construction zones. Increased surveillance is recommended at raw land boundaries."
    }
  }
];

export const NEIGHBORHOODS: NeighborhoodScore[] = [
  { name: "Kothrud", score: 91, reported: 45, resolved: 41, grade: "A+" },
  { name: "Baner", score: 88, reported: 38, resolved: 33, grade: "A" },
  { name: "Kalyani Nagar", score: 82, reported: 29, resolved: 24, grade: "B" },
  { name: "Aundh", score: 79, reported: 32, resolved: 25, grade: "B" },
  { name: "Wakad", score: 65, reported: 55, resolved: 36, grade: "C" },
  { name: "Hinjawadi", score: 58, reported: 72, resolved: 42, grade: "D" }
];

export const CONTRIBUTORS: Contributor[] = [
  { name: "Amit Sharma", points: 840, reportsCount: 14, verificationsCount: 42, badges: ["Community Hero", "Verifier Badge", "Issue Resolver"] },
  { name: "Priya Nair", points: 620, reportsCount: 9, verificationsCount: 31, badges: ["Verifier Badge", "Top Contributor"] },
  { name: "Siddharth Rao", points: 490, reportsCount: 7, verificationsCount: 25, badges: ["Verifier Badge"] },
  { name: "Deepa Patil", points: 310, reportsCount: 5, verificationsCount: 16, badges: ["Verifier Badge"] }
];

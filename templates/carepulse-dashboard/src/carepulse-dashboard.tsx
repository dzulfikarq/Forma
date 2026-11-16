import * as React from "react";
import {
  Activity,
  AlertTriangle,
  ArrowDownToLine,
  ArrowRight,
  Bell,
  BookOpen,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  ClipboardList,
  CreditCard,
  FileBarChart,
  FileText,
  Heart,
  HeartPulse,
  LayoutGrid,
  Menu,
  Plus,
  Search,
  Settings,
  Shield,
  Smartphone,
  Stethoscope,
  Users,
  UserRound,
  UserRoundPlus,
  Wifi,
} from "lucide-react";
import {
  Badge,
  Button,
  Card,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  ResponsiveNavigation,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Toast,
  ToastProvider
} from "@design-templates/ui";
import "./carepulse-dashboard.css";

type Page = "Overview" | "Patients" | "Readings" | "Alerts" | "Care plans" | "Billing" | "Patient roster" | "Devices" | "Care teams" | "Integrations" | "Reports" | "Protocols" | "Learn" | "Help center" | "Settings";
type ChartScale = "Daily" | "Weekly";
type Patient = { id: string; name: string; initials: string; clinic: string; program: string; status: string; lastReading: string };
type RecordItem = { id: string; title: string; detail: string; status: string; metric?: string };
type PageInfo = { eyebrow: string; description: string; stats: Array<{ label: string; value: string; note: string }>; action: string; items: RecordItem[] };

const navGroups: Array<{ label: string; items: Array<{ id: Page; icon: React.ReactNode; badge?: string }> }> = [
  { label: "Main menu", items: [
    { id: "Overview", icon: <LayoutGrid /> }, { id: "Patients", icon: <UserRound /> }, { id: "Readings", icon: <HeartPulse /> }, { id: "Alerts", icon: <AlertTriangle />, badge: "14" }, { id: "Care plans", icon: <CalendarDays /> }, { id: "Billing", icon: <CreditCard /> }
  ] },
  { label: "Manage", items: [
    { id: "Patient roster", icon: <Users />, badge: "6.3k" }, { id: "Devices", icon: <Smartphone /> }, { id: "Care teams", icon: <Stethoscope /> }, { id: "Integrations", icon: <Wifi /> }
  ] },
  { label: "Resources", items: [
    { id: "Reports", icon: <FileBarChart /> }, { id: "Protocols", icon: <ClipboardList /> }, { id: "Learn", icon: <BookOpen /> }
  ] },
  { label: "Settings", items: [
    { id: "Help center", icon: <CircleHelp /> }, { id: "Settings", icon: <Settings /> }
  ] }
];

const patientSeed: Patient[] = [
  { id: "pt-1042", name: "Maya Bennett", initials: "MB", clinic: "Northside Family Health", program: "Blood pressure", status: "On track", lastReading: "Today · 8:42 AM" },
  { id: "pt-1028", name: "Andre Collins", initials: "AC", clinic: "Riverside Medical Group", program: "Glucose care", status: "Near target", lastReading: "Today · 7:16 AM" },
  { id: "pt-1019", name: "Nina Patel", initials: "NP", clinic: "Harbor Cardiology", program: "Heart health", status: "At risk", lastReading: "Yesterday · 5:31 PM" },
  { id: "pt-1007", name: "Owen Brooks", initials: "OB", clinic: "Lakeview Primary Care", program: "Blood pressure", status: "On track", lastReading: "Today · 9:04 AM" },
  { id: "pt-0996", name: "Rosa Kim", initials: "RK", clinic: "Elm Street Internal Med", program: "Weight management", status: "No readings", lastReading: "12 days ago" }
];

const referrals = [
  { id: "primary", label: "Primary care referrals", count: 173, percent: 42, icon: <Stethoscope /> },
  { id: "hospital", label: "Hospital discharge", count: 87, percent: 21, icon: <Building2 /> },
  { id: "cardiology", label: "Cardiology clinics", count: 66, percent: 16, icon: <Heart /> },
  { id: "payer", label: "Payer outreach", count: 49, percent: 12, icon: <Shield /> },
  { id: "app", label: "Self-enrolled via app", count: 37, percent: 9, icon: <Smartphone /> }
];

const clinicRows = [
  { code: "NSH", name: "Northside Family Health", count: "1,948", share: "31%" },
  { code: "RVM", name: "Riverside Medical Group", count: "1,131", share: "18%" },
  { code: "HCC", name: "Harbor Cardiology", count: "817", share: "13%" },
  { code: "LKP", name: "Lakeview Primary Care", count: "566", share: "9%" },
  { code: "ELM", name: "Elm Street Internal Med", count: "377", share: "6%" }
];

const dailyEnrollment = [4, 3, 4, 4, 3, 2, 2, 2, 5, 3, 3, 5, 3, 2, 4, 3, 3, 4, 4, 4, 2, 4, 4, 4, 4, 3, 2, 2, 6, 6];

const pageInfo: Partial<Record<Page, PageInfo>> = {
  Overview: {
    eyebrow: "CARE PROGRAMS",
    description: "A clear view of enrollment, adherence, and today's care work.",
    stats: [{ label: "Enrolled patients", value: "6,284", note: "+5.0% this month" }, { label: "On-track", value: "72.0%", note: "Target is 75%" }, { label: "Open alerts", value: "14", note: "3 need review today" }],
    action: "Review alerts",
    items: [
      { id: "overview-risk", title: "Patients near their adherence target", detail: "817 patients are 12–15 reading days into their 30-day period.", status: "Opportunity", metric: "817" },
      { id: "overview-alerts", title: "High-priority readings need review", detail: "Blood pressure readings are outside each patient's care threshold.", status: "Needs review", metric: "3" },
      { id: "overview-enrollment", title: "Enrollment is ahead of last month", detail: "Primary care and hospital referrals led this month's growth.", status: "Trending up", metric: "+5.0%" }
    ]
  },
  Readings: {
    eyebrow: "REMOTE MONITORING",
    description: "Review recent home readings and follow-up status.",
    stats: [{ label: "Readings received", value: "126.7k", note: "Last 30 days" }, { label: "Reviewed today", value: "1,842", note: "Across all programs" }, { label: "Outside threshold", value: "28", note: "7 need clinician review" }],
    action: "Export readings",
    items: [
      { id: "read-1", title: "Maya Bennett · Blood pressure", detail: "128/82 mmHg · Northside Family Health · 8:42 AM", status: "In range", metric: "128/82" },
      { id: "read-2", title: "Andre Collins · Glucose", detail: "164 mg/dL · Riverside Medical Group · 7:16 AM", status: "Review", metric: "164" },
      { id: "read-3", title: "Nina Patel · Blood pressure", detail: "158/96 mmHg · Harbor Cardiology · Yesterday", status: "High", metric: "158/96" },
      { id: "read-4", title: "Owen Brooks · Blood pressure", detail: "122/78 mmHg · Lakeview Primary Care · 9:04 AM", status: "In range", metric: "122/78" }
    ]
  },
  Alerts: {
    eyebrow: "CARE TEAM INBOX",
    description: "Prioritize readings and patients who need timely follow-up.",
    stats: [{ label: "Open alerts", value: "14", note: "Across active programs" }, { label: "High priority", value: "3", note: "Review today" }, { label: "Median response", value: "18 min", note: "This week" }],
    action: "Export queue",
    items: [
      { id: "alert-1", title: "Blood pressure above care threshold", detail: "Nina Patel · Harbor Cardiology · 158/96 mmHg · 22 min ago", status: "High", metric: "22 min" },
      { id: "alert-2", title: "No readings in 9 days", detail: "Rosa Kim · Elm Street Internal Med · Blood pressure program", status: "Follow up", metric: "9 days" },
      { id: "alert-3", title: "Glucose reading needs clinician review", detail: "Andre Collins · Riverside Medical Group · 164 mg/dL · 1 hour ago", status: "Review", metric: "1 hr" },
      { id: "alert-4", title: "Weight change outside expected range", detail: "Eli Morgan · Northside Family Health · 3.2 lb in 24 hours", status: "Medium", metric: "2 hr" }
    ]
  },
  "Care plans": {
    eyebrow: "PROGRAM DESIGN",
    description: "Care pathways and adherence goals used across enrolled cohorts.",
    stats: [{ label: "Active plans", value: "12", note: "4 programs" }, { label: "Patients assigned", value: "6,284", note: "Across all clinics" }, { label: "In review", value: "3", note: "Updated this quarter" }],
    action: "Create care plan",
    items: [
      { id: "plan-1", title: "Blood pressure essentials", detail: "16 reading days / 30 · nurse review for repeated elevated readings", status: "Active", metric: "2,840 patients" },
      { id: "plan-2", title: "Daily glucose check-in", detail: "Morning and evening readings · weekly care-team review", status: "Active", metric: "1,930 patients" },
      { id: "plan-3", title: "Heart health after discharge", detail: "Weight and blood pressure monitoring for 60 days", status: "In review", metric: "684 patients" }
    ]
  },
  Billing: {
    eyebrow: "PROGRAM FINANCE",
    description: "Review monitoring claims and reimbursement readiness.",
    stats: [{ label: "Ready to submit", value: "1,284", note: "$48,320 estimated" }, { label: "In review", value: "86", note: "Across 9 clinics" }, { label: "Needs documentation", value: "23", note: "Follow-up requested" }],
    action: "Export claims",
    items: [
      { id: "claim-1", title: "Northside Family Health · October", detail: "99457 · 30-day monitoring and care management", status: "Ready", metric: "$8,420" },
      { id: "claim-2", title: "Riverside Medical Group · October", detail: "99454 · Device supply and transmission", status: "In review", metric: "$6,180" },
      { id: "claim-3", title: "Harbor Cardiology · October", detail: "99458 · Additional care management time", status: "Needs info", metric: "$2,040" }
    ]
  },
  Devices: {
    eyebrow: "DEVICE OPERATIONS",
    description: "Pairing and transmission health for patient monitoring devices.",
    stats: [{ label: "Active devices", value: "8,412", note: "Across 3 device types" }, { label: "Transmitting", value: "97.4%", note: "Last 24 hours" }, { label: "Need attention", value: "38", note: "Pairing or battery" }],
    action: "Add device",
    items: [
      { id: "device-1", title: "Blood pressure cuff · BP-40218", detail: "Assigned to Maya Bennett · Last sync 8:42 AM", status: "Connected", metric: "68,412 readings" },
      { id: "device-2", title: "Glucose meter · GM-18502", detail: "Assigned to Andre Collins · Last sync 7:16 AM", status: "Connected", metric: "41,826 readings" },
      { id: "device-3", title: "Weight scale · WS-09127", detail: "Assigned to Nina Patel · Last sync 2 days ago", status: "Check sync", metric: "16,470 readings" }
    ]
  },
  "Care teams": {
    eyebrow: "TEAM WORKSPACE",
    description: "Care coordinators and clinicians supporting monitored patients.",
    stats: [{ label: "Care teams", value: "18", note: "Across 9 clinics" }, { label: "Care coordinators", value: "42", note: "31 active today" }, { label: "Patients per team", value: "149", note: "Average assignment" }],
    action: "Add care team",
    items: [
      { id: "team-1", title: "Northside Cardio Care", detail: "Amara Lewis, RN · Julian Reed, CMA · 418 enrolled patients", status: "Active", metric: "2 members" },
      { id: "team-2", title: "Riverside Primary Care", detail: "Noah Patel, RN · Kira Jones, NP · 536 enrolled patients", status: "Active", metric: "4 members" },
      { id: "team-3", title: "Harbor Transitions", detail: "Tessa Young, RN · Hospital discharge program", status: "Staffing", metric: "3 members" }
    ]
  },
  Integrations: {
    eyebrow: "CONNECTED SYSTEMS",
    description: "Manage sample connections with EHR and device partners. No accounts connect in this preview.",
    stats: [{ label: "Available", value: "6", note: "Sample connectors" }, { label: "Enabled", value: "2", note: "Local preview state" }, { label: "Last sync", value: "8:45 AM", note: "Simulated" }],
    action: "Refresh connections",
    items: [
      { id: "integration-1", title: "Northstar EHR", detail: "Patient roster and care-plan sync", status: "Connected", metric: "Last sync 8:45 AM" },
      { id: "integration-2", title: "PulseLink Devices", detail: "Blood pressure, glucose, and weight readings", status: "Connected", metric: "Last sync 8:42 AM" },
      { id: "integration-3", title: "Atlas Claims", detail: "Monthly monitoring-claim export", status: "Available", metric: "Not connected" }
    ]
  },
  Reports: {
    eyebrow: "ANALYTICS LIBRARY",
    description: "Build a clear snapshot for clinic, program, or reporting period.",
    stats: [{ label: "Saved reports", value: "8", note: "Shared with care teams" }, { label: "Scheduled", value: "3", note: "Next run Monday" }, { label: "Generated", value: "24", note: "This month" }],
    action: "Generate report",
    items: [
      { id: "report-1", title: "Monthly adherence by clinic", detail: "Enrollment, reading days, and on-track rate · Updated Nov 10", status: "Ready", metric: "30 days" },
      { id: "report-2", title: "Referral conversion", detail: "Sources, enrollment starts, and first reading completion", status: "Ready", metric: "30 days" },
      { id: "report-3", title: "Device transmission health", detail: "Sync rates, low battery, and device follow-up queue", status: "Scheduled", metric: "Weekly" }
    ]
  },
  Protocols: {
    eyebrow: "CARE GUIDANCE",
    description: "Reference protocols for consistent follow-up and escalation.",
    stats: [{ label: "Published", value: "24", note: "Current versions" }, { label: "In review", value: "3", note: "Clinical approval" }, { label: "Viewed this week", value: "186", note: "Across care teams" }],
    action: "Add protocol",
    items: [
      { id: "protocol-1", title: "Elevated blood pressure follow-up", detail: "Repeat reading, symptom screen, then clinician escalation", status: "Published", metric: "v2.4" },
      { id: "protocol-2", title: "No reading outreach", detail: "Friendly check-in after 3 missed days; device check after 7", status: "Published", metric: "v1.8" },
      { id: "protocol-3", title: "Post-discharge weight changes", detail: "Daily check-in and same-day care team review for rapid gain", status: "In review", metric: "v1.2" }
    ]
  },
  Learn: {
    eyebrow: "TEAM LEARNING",
    description: "Short guides for care teams using remote monitoring workflows.",
    stats: [{ label: "Learning paths", value: "6", note: "Role-based" }, { label: "Completed", value: "82%", note: "This quarter" }, { label: "New lessons", value: "3", note: "Added this month" }],
    action: "Mark all complete",
    items: [
      { id: "learn-1", title: "Reading-day adherence explained", detail: "How qualifying days count toward a monthly care goal · 6 min", status: "New", metric: "6 min" },
      { id: "learn-2", title: "Responding to an elevated reading", detail: "Using patient-specific thresholds and escalation protocols · 8 min", status: "In progress", metric: "8 min" },
      { id: "learn-3", title: "Device pairing basics", detail: "Help patients reconnect a cuff, scale, or glucose meter · 5 min", status: "Complete", metric: "5 min" }
    ]
  },
  "Help center": {
    eyebrow: "SUPPORT RESOURCES",
    description: "Answers for common workflow, device, and program questions.",
    stats: [{ label: "Guides", value: "32", note: "Updated monthly" }, { label: "Support hours", value: "Mon–Fri", note: "8 AM–6 PM local" }, { label: "Typical response", value: "2 hrs", note: "Business hours" }],
    action: "Request support",
    items: [
      { id: "help-1", title: "How is an on-track day counted?", detail: "A patient needs at least one qualifying reading on a calendar day.", status: "Adherence" },
      { id: "help-2", title: "What should I do when a device stops syncing?", detail: "Check pairing, battery, and the last successful transmission first.", status: "Devices" },
      { id: "help-3", title: "Where can I find patient-specific thresholds?", detail: "Open the patient record and review the active care plan.", status: "Care plans" }
    ]
  },
  Settings: {
    eyebrow: "WORKSPACE PREFERENCES",
    description: "Adjust sample notifications and display preferences for this session.",
    stats: [{ label: "Workspace", value: "Northside", note: "Care operations" }, { label: "Time zone", value: "Pacific", note: "UTC−08:00" }, { label: "Session", value: "Preview", note: "Changes are local" }],
    action: "Save preferences",
    items: [
      { id: "setting-1", title: "Daily care-team digest", detail: "A summary of new alerts and patients near their goal.", status: "On" },
      { id: "setting-2", title: "High-priority alert notifications", detail: "Notify team members when a reading needs immediate review.", status: "On" },
      { id: "setting-3", title: "Weekly enrollment summary", detail: "Share program enrollment and referral trends each Monday.", status: "Off" }
    ]
  }
};

function Sparkline({ points }: { points: string }) {
  return <svg className="cp-sparkline" viewBox="0 0 100 32" aria-hidden="true"><polyline points={points} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><circle cx="95" cy="7" r="2.8" fill="currentColor" /></svg>;
}

function initialsFor(name: string) {
  return name.split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase();
}

function exportCsv(page: Page) {
  const rows = page === "Patients"
    ? "Patient,Program,Clinic,Adherence\nMaya Bennett,Blood pressure,Northside Family Health,On track\nAndre Collins,Glucose care,Riverside Medical Group,Near target"
    : `${page} summary\nGenerated,Local preview only\nReporting period,Last 30 days`;
  const url = URL.createObjectURL(new Blob([rows], { type: "text/csv" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `carepulse-${page.toLowerCase().replaceAll(" ", "-")}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function CarepulseDashboard() {
  return <ToastProvider><CareWorkspace /></ToastProvider>;
}

function CareWorkspace() {
  const [page, setPage] = React.useState<Page>("Patients");
  const [range, setRange] = React.useState("30 days");
  const [chartScale, setChartScale] = React.useState<ChartScale>("Daily");
  const [selectedDay, setSelectedDay] = React.useState(17);
  const [selectedReferral, setSelectedReferral] = React.useState("");
  const [patients, setPatients] = React.useState(patientSeed);
  const [query, setQuery] = React.useState("");
  const [enrollOpen, setEnrollOpen] = React.useState(false);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [createName, setCreateName] = React.useState("");
  const [detail, setDetail] = React.useState<{ title: string; description: string } | null>(null);
  const [profileOpen, setProfileOpen] = React.useState(false);
  const [toast, setToast] = React.useState({ open: false, title: "" });
  const [resolved, setResolved] = React.useState<Record<string, boolean>>({});
  const [connected, setConnected] = React.useState<Record<string, boolean>>({ "integration-1": true, "integration-2": true });
  const [extraRows, setExtraRows] = React.useState<Record<string, RecordItem[]>>({});
  const [learningDone, setLearningDone] = React.useState(false);
  const [settingValues, setSettingValues] = React.useState<Record<string, boolean>>({ "setting-1": true, "setting-2": true, "setting-3": false });
  const searchInput = React.useRef<HTMLInputElement>(null);
  const searchResults = query.trim() ? patients.filter((patient) => `${patient.name} ${patient.clinic} ${patient.program}`.toLowerCase().includes(query.trim().toLowerCase())).slice(0, 4) : [];
  const allNavigation = navGroups.flatMap((group) => group.items.map((item) => ({ id: item.id, label: item.id, icon: item.icon })));
  const info = pageInfo[page];

  function showToast(title: string) {
    setToast({ open: true, title });
  }

  function selectPage(next: string) {
    if (allNavigation.some((item) => item.id === next)) {
      setPage(next as Page);
      setQuery("");
    }
  }

  function openPatient(patient: Patient) {
    setPage("Patient roster");
    setQuery("");
    setDetail({ title: patient.name, description: `${patient.program} · ${patient.clinic} · ${patient.status} · Last reading ${patient.lastReading}. Fictional sample record; no protected health information is connected.` });
  }

  function enrollPatient(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("patient-name") ?? "").trim();
    const clinic = String(form.get("clinic") ?? "").trim();
    const program = String(form.get("program") ?? "").trim();
    if (!name || !clinic || !program) return;
    const patient: Patient = { id: `pt-${Date.now()}`, name, initials: initialsFor(name), clinic, program, status: "New", lastReading: "Awaiting first reading" };
    setPatients((current) => [patient, ...current]);
    setEnrollOpen(false);
    showToast("Patient enrolled in local sample workspace");
  }

  function createRecord(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = createName.trim();
    if (!name) return;
    const record: RecordItem = { id: `local-${Date.now()}`, title: name, detail: "Added in this preview session; not saved to a care system.", status: "Draft" };
    setExtraRows((current) => ({ ...current, [page]: [...(current[page] ?? []), record] }));
    setCreateName("");
    setCreateOpen(false);
    showToast(`${name} added locally`);
  }

  function activatePrimary() {
    if (page === "Patients" || page === "Patient roster") {
      setEnrollOpen(true);
    } else if (["Care plans", "Devices", "Care teams", "Protocols"].includes(page)) {
      setCreateName("");
      setCreateOpen(true);
    } else if (page === "Overview") {
      setPage("Alerts");
    } else if (page === "Integrations") {
      showToast("Sample connections refreshed · no external system contacted");
    } else if (page === "Reports") {
      showToast("Sample report generated locally");
    } else if (page === "Learn") {
      setLearningDone(true);
      showToast("Learning checklist marked complete locally");
    } else if (page === "Help center") {
      setCreateName("");
      setCreateOpen(true);
    } else if (page === "Settings") {
      showToast("Preferences saved for this preview session");
    } else {
      exportCsv(page);
      showToast(`${page} sample export downloaded`);
    }
  }

  function onRowAction(item: RecordItem) {
    if (page === "Alerts") {
      setResolved((current) => ({ ...current, [item.id]: !current[item.id] }));
      showToast(resolved[item.id] ? "Alert returned to the open queue" : "Alert resolved locally");
    } else if (page === "Integrations") {
      setConnected((current) => ({ ...current, [item.id]: !current[item.id] }));
      showToast(`${item.title} ${connected[item.id] ? "disconnected" : "connected"} in preview only`);
    } else if (page === "Learn") {
      setLearningDone((current) => !current);
      showToast("Learning progress updated locally");
    } else if (page === "Settings") {
      setSettingValues((current) => ({ ...current, [item.id]: !current[item.id] }));
    } else {
      setDetail({ title: item.title, description: `${item.detail} This is fictional sample data. No clinical system or patient device is connected.` });
    }
  }

  function pageActionLabel() {
    if (page === "Patients" || page === "Patient roster") return "Enroll patient";
    return info?.action ?? "Open";
  }

  const pageDescription = page === "Patients"
    ? "Who’s enrolled in remote monitoring and how they were referred."
    : info?.description ?? "Care program operations and sample data.";

  React.useEffect(() => {
    function focusSearch(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchInput.current?.focus();
      }
    }
    window.addEventListener("keydown", focusSearch);
    return () => window.removeEventListener("keydown", focusSearch);
  }, []);

  return <main className="carepulse" aria-label="CarePulse sample workspace">
    <div className="cp-shell">
      <aside className="cp-sidebar" aria-label="Care program navigation">
        <a href="#patients" className="cp-brand" onClick={(event) => { event.preventDefault(); selectPage("Patients"); }} aria-label="CarePulse home"><span className="cp-brand-mark"><HeartPulse size={20} aria-hidden="true" /></span><span>CarePulse</span></a>
        <nav className="cp-side-nav" aria-label="Main menu">
          {navGroups.map((group) => <section className="cp-nav-group" key={group.label} aria-label={group.label}><p>{group.label}</p>{group.items.map((item) => <button type="button" key={item.id} aria-current={page === item.id ? "page" : undefined} className={`cp-nav-item${page === item.id ? " is-active" : ""}`} onClick={() => selectPage(item.id)}>{item.icon}<span>{item.id}</span>{item.badge && <span className="cp-nav-badge">{item.id === "Alerts" ? 14 - Object.values(resolved).filter(Boolean).length : item.badge}</span>}</button>)}</section>)}
        </nav>
        <p className="cp-sidebar-foot">Sample workspace · local preview</p>
      </aside>

      <div className="cp-workspace">
        <header className="cp-topbar">
          <div className="cp-topbar-context"><ResponsiveNavigation items={allNavigation} activeId={page} onSelect={selectPage} label="Open care navigation" trigger={<Menu size={19} aria-hidden="true" />} /><a href="#patients" className="cp-mobile-brand" onClick={(event) => { event.preventDefault(); selectPage("Patients"); }} aria-label="CarePulse home"><span className="cp-brand-mark"><HeartPulse size={20} aria-hidden="true" /></span><span>CarePulse</span></a><button type="button" className="cp-breadcrumb" onClick={() => selectPage("Overview")}><LayoutGrid size={16} aria-hidden="true" /><span>Care programs</span><ChevronRight size={14} aria-hidden="true" /></button><span className="cp-current-page">{page}</span></div>
          <div className="cp-topbar-actions"><div className="cp-global-search"><Search size={16} aria-hidden="true" /><Input ref={searchInput} value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Search patients" placeholder="Search patients" /><kbd>⌘K</kbd>{query.trim() && <div className="cp-search-results" role="listbox" aria-label="Patient search results">{searchResults.length ? searchResults.map((patient) => <button type="button" key={patient.id} role="option" onClick={() => openPatient(patient)}><span className="cp-avatar">{patient.initials}</span><span><strong>{patient.name}</strong><small>{patient.clinic}</small></span></button>) : <p>No sample patients match “{query}”.</p>}</div>}</div><Button variant="outline" size="icon" className="cp-top-icon" aria-label="Open patient alerts" onClick={() => selectPage("Alerts")}><Bell size={18} aria-hidden="true" /><i aria-hidden="true" /></Button><Button variant="ghost" className="cp-profile-trigger" aria-label="Open team profile" onClick={() => setProfileOpen(true)}><span className="cp-avatar cp-avatar-photo" aria-hidden="true">DR</span></Button></div>
        </header>

        <section className="cp-content" aria-labelledby="cp-page-title">
          <div className="cp-page-heading"><div><p className="cp-eyebrow">{page === "Patients" ? "CARE PROGRAMS" : info?.eyebrow ?? "CARE PROGRAMS"}</p><h1 id="cp-page-title">{page}</h1><p>{pageDescription}</p></div><div className="cp-page-actions">{page === "Patients" && <Select value={range} onValueChange={setRange}><SelectTrigger className="cp-range-select" aria-label="Date range"><CalendarDays size={15} aria-hidden="true" /><SelectValue /></SelectTrigger><SelectContent><SelectItem value="7 days">Last 7 days</SelectItem><SelectItem value="30 days">Last 30 days</SelectItem><SelectItem value="90 days">Last 90 days</SelectItem></SelectContent></Select>}{page === "Patients" && <Button variant="outline" className="cp-export-button" onClick={() => { exportCsv(page); showToast("Patient sample export downloaded"); }}><ArrowDownToLine size={16} aria-hidden="true" />Export</Button>}<Button className="cp-primary-action" onClick={activatePrimary}>{["Patients", "Patient roster", "Care plans", "Devices", "Care teams", "Protocols"].includes(page) ? <UserRoundPlus size={16} aria-hidden="true" /> : page === "Overview" ? <AlertTriangle size={16} aria-hidden="true" /> : page === "Help center" ? <CircleHelp size={16} aria-hidden="true" /> : page === "Settings" ? <Check size={16} aria-hidden="true" /> : page === "Reports" ? <FileBarChart size={16} aria-hidden="true" /> : page === "Integrations" ? <Wifi size={16} aria-hidden="true" /> : page === "Learn" ? <CheckCircle2 size={16} aria-hidden="true" /> : <ArrowDownToLine size={16} aria-hidden="true" />}{pageActionLabel()}</Button></div></div>

          {page === "Patients" ? <PatientsDashboard range={range} chartScale={chartScale} setChartScale={setChartScale} selectedDay={selectedDay} setSelectedDay={setSelectedDay} selectedReferral={selectedReferral} setSelectedReferral={setSelectedReferral} onReview={() => selectPage("Alerts")} onClinic={() => selectPage("Patient roster")} onDevices={() => selectPage("Devices")} onRoster={() => selectPage("Patient roster")} /> : <SecondaryPage page={page} info={info} patients={patients} extraRows={extraRows[page] ?? []} resolved={resolved} connected={connected} learningDone={learningDone} settingValues={settingValues} onRowAction={onRowAction} onOpenPatient={openPatient} onToast={showToast} />}
          <footer className="cp-footer"><span>Fictional sample data · changes stay in this session</span><span><i aria-hidden="true" />Not connected to a clinical system</span></footer>
        </section>
      </div>
    </div>

    <Dialog open={enrollOpen} onOpenChange={setEnrollOpen}><DialogContent className="cp-dialog" aria-describedby="cp-enroll-help"><DialogHeader><DialogTitle>Enroll patient</DialogTitle><DialogDescription id="cp-enroll-help">Add a fictional patient record to this local preview. No health system is updated.</DialogDescription></DialogHeader><form className="cp-dialog-form" onSubmit={enrollPatient}><Label htmlFor="cp-patient-name">Patient name</Label><Input id="cp-patient-name" name="patient-name" required placeholder="e.g. Alex Morgan" /><Label htmlFor="cp-clinic">Clinic</Label><Input id="cp-clinic" name="clinic" required placeholder="Clinic name" /><Label htmlFor="cp-program">Monitoring program</Label><Input id="cp-program" name="program" required placeholder="e.g. Blood pressure" /><DialogFooter><Button type="button" variant="outline" onClick={() => setEnrollOpen(false)}>Cancel</Button><Button type="submit"><UserRoundPlus size={15} aria-hidden="true" />Enroll patient</Button></DialogFooter></form></DialogContent></Dialog>

    <Dialog open={createOpen} onOpenChange={setCreateOpen}><DialogContent className="cp-dialog" aria-describedby="cp-create-help"><DialogHeader><DialogTitle>{page === "Help center" ? "Request support" : page === "Care plans" ? "Create care plan" : page === "Care teams" ? "Add care team" : page === "Devices" ? "Add device" : "Add protocol"}</DialogTitle><DialogDescription id="cp-create-help">Create sample content for this session only. No external service is contacted.</DialogDescription></DialogHeader><form className="cp-dialog-form" onSubmit={createRecord}><Label htmlFor="cp-create-name">{page === "Help center" ? "Request title" : "Name"}</Label><Input id="cp-create-name" value={createName} onChange={(event) => setCreateName(event.target.value)} required placeholder="Enter a name" /><DialogFooter><Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button><Button type="submit"><Plus size={15} aria-hidden="true" />Add to preview</Button></DialogFooter></form></DialogContent></Dialog>

    <Dialog open={Boolean(detail)} onOpenChange={(open) => { if (!open) setDetail(null); }}><DialogContent className="cp-dialog" aria-describedby="cp-detail-help"><DialogHeader><DialogTitle>{detail?.title}</DialogTitle><DialogDescription id="cp-detail-help">{detail?.description}</DialogDescription></DialogHeader><div className="cp-detail-note"><Shield size={17} aria-hidden="true" /><p>Sample workspace only. No real patient information, clinical recommendation, or care-system action is represented.</p></div><DialogFooter><Button onClick={() => setDetail(null)}>Done</Button></DialogFooter></DialogContent></Dialog>

    <Dialog open={profileOpen} onOpenChange={setProfileOpen}><DialogContent className="cp-dialog" aria-describedby="cp-profile-help"><DialogHeader><DialogTitle>Care team profile</DialogTitle><DialogDescription id="cp-profile-help">Northside care operations · fictional preview workspace.</DialogDescription></DialogHeader><div className="cp-profile-detail"><span className="cp-avatar">DR</span><div><strong>Dr. Rowan Ellis</strong><span>Clinical program lead</span></div></div><DialogFooter><Button onClick={() => setProfileOpen(false)}>Done</Button></DialogFooter></DialogContent></Dialog>
    <Toast open={toast.open} title={toast.title} onOpenChange={(open) => setToast((current) => ({ ...current, open }))} />
  </main>;
}

function PatientsDashboard({ range, chartScale, setChartScale, selectedDay, setSelectedDay, selectedReferral, setSelectedReferral, onReview, onClinic, onDevices, onRoster }: {
  range: string;
  chartScale: ChartScale;
  setChartScale: (scale: ChartScale) => void;
  selectedDay: number;
  setSelectedDay: (day: number) => void;
  selectedReferral: string;
  setSelectedReferral: (id: string) => void;
  onReview: () => void;
  onClinic: () => void;
  onDevices: () => void;
  onRoster: () => void;
}) {
  const chartValues = chartScale === "Daily" ? dailyEnrollment : Array.from({ length: 5 }, (_, week) => Math.round(dailyEnrollment.slice(week * 6, week * 6 + 6).reduce((sum, value) => sum + value, 0) / 6));
  const chartDates = chartScale === "Daily" ? dailyEnrollment.map((_, index) => new Date(2026, 9, 12 + index).toLocaleDateString("en-US", { month: "short", day: "numeric" })) : ["Oct 12", "Oct 18", "Oct 24", "Oct 30", "Nov 5"];
  const enrolledPeriod = range === "30 days" ? "Better than prior 30d" : `Compared with prior ${range}`;
  return <div className="cp-dashboard">
    <div className="cp-analytics-row">
      <Card className="cp-adherence-card"><div className="cp-card-heading"><div><h2>On-track rate</h2><span>16+ reading days in the last {range}</span></div><Badge className="cp-warning-badge"><i aria-hidden="true" />Below target</Badge></div><div className="cp-adherence-metric"><strong>72.0%</strong><span><b>0.6 pts ↓</b><span>vs previous {range}</span><small>4,526 of 6,284 patients</small></span></div><div className="cp-target-track" role="img" aria-label="On-track rate 72 percent, target 75 percent"><span className="cp-track-fill" /><i className="cp-target-marker" /><i className="cp-current-marker" /></div><div className="cp-target-labels"><span>Target 75%</span></div><div className="cp-adherence-footer"><span><i aria-hidden="true" />817 near target · 187 more at 16+ days reaches 75%</span><Button variant="ghost" size="sm" onClick={onReview}>Review <ChevronRight size={15} aria-hidden="true" /></Button></div></Card>

      <Card className="cp-metric-list" aria-label="Enrollment summary"><MetricRow icon={<Users />} title="Enrolled patients" detail="Active in a monitoring program" value="6,284" change="5.0%" positive note={enrolledPeriod} points="2,28 15,26 27,22 39,20 51,17 63,13 76,10 95,5" /><MetricRow icon={<UserRoundPlus />} title="New enrollments" detail="Avg 13.7 a day, weekdays peak" value="412" change="11.6%" positive note={enrolledPeriod} points="2,14 10,15 18,24 26,18 35,21 44,17 53,16 62,13 71,16 80,10 95,6" /><MetricRow icon={<UserRound />} title="Disenrollment rate" detail="113 left the program this month" value="1.8%" change="0.3 pts" note="Worse than prior 30d" points="2,25 12,23 20,19 28,22 36,15 44,16 53,12 62,15 71,9 80,11 95,7" /></Card>
    </div>

    <div className="cp-middle-grid">
      <Card className="cp-trend-card"><div className="cp-section-heading"><div><h2>Enrollment trend</h2><p>New enrollments per day, compared with the previous {range}.</p></div><Select value={chartScale} onValueChange={(value) => { setChartScale(value as ChartScale); setSelectedDay(0); }}><SelectTrigger className="cp-chart-select" aria-label="Enrollment trend interval"><CalendarDays size={14} aria-hidden="true" /><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Daily">Daily</SelectItem><SelectItem value="Weekly">Weekly</SelectItem></SelectContent></Select></div><div className="cp-chart-legend"><span><i className="is-current" />This period</span><span><i className="is-previous" />Previous period</span></div><div className="cp-heatmap-scroll"><div className="cp-heatmap-y"><span>24</span><span>18</span><span>12</span><span>6</span><span>0</span></div><div className={`cp-heatmap cp-heatmap-${chartScale.toLowerCase()}`} role="group" aria-label={`${chartScale} enrollment trend`}>
          {chartValues.map((value, index) => <button type="button" key={`${chartScale}-${index}`} className={`cp-heat-day${selectedDay === index ? " is-selected" : ""}${index < 2 ? " is-previous" : ""}`} aria-label={`${chartScale === "Daily" ? chartDates[index] : `Week of ${chartDates[index]}`}: ${value} enrollments`} aria-pressed={selectedDay === index} onClick={() => setSelectedDay(index)}><span className="cp-heat-stack" aria-hidden="true">{Array.from({ length: Math.min(value, 6) }, (_, cell) => <i key={cell} />)}</span></button>)}
        </div></div><div className="cp-chart-x-labels">{(chartScale === "Daily" ? ["Oct 12", "Oct 17", "Oct 22", "Oct 27", "Nov 1", "Nov 6", "Nov 10"] : chartDates).map((label, index) => <span key={`${label}-${index}`}>{label}</span>)}</div><p className="cp-chart-selection" role="status">Selected {chartScale === "Daily" ? chartDates[selectedDay] ?? chartDates[0] : chartDates[selectedDay] ?? chartDates[0]} · {chartValues[selectedDay] ?? chartValues[0]} new enrollments</p></Card>

      <Card className="cp-referral-card"><div className="cp-section-heading"><div><h2>Referral sources</h2><p>Where this month’s 412 enrollments came from.</p></div></div><div className="cp-referral-list">{referrals.map((referral) => <button type="button" key={referral.id} className={`cp-referral-row${selectedReferral === referral.id ? " is-selected" : ""}`} onClick={() => setSelectedReferral(selectedReferral === referral.id ? "" : referral.id)} aria-pressed={selectedReferral === referral.id}><span className="cp-referral-icon">{referral.icon}</span><span className="cp-referral-name">{referral.label}</span><span className="cp-referral-count">{referral.count}</span><strong>{referral.percent}%</strong><span className="cp-referral-track"><i style={{ width: `${referral.percent * 100 / 42}%` }} /></span></button>)}</div>{selectedReferral && <p className="cp-referral-selection" role="status">{referrals.find((item) => item.id === selectedReferral)?.label} selected · 412 total referrals</p>}</Card>
    </div>

    <div className="cp-bottom-grid">
      <Card className="cp-lower-card"><div className="cp-section-heading"><div><h2>Top clinics</h2><p>Share of enrolled patients</p></div><Button variant="ghost" size="icon" aria-label="View all clinics" onClick={onClinic}><ArrowRight size={16} aria-hidden="true" /></Button></div><div className="cp-clinic-list">{clinicRows.map((clinic) => <button type="button" key={clinic.code} onClick={onClinic}><Badge>{clinic.code}</Badge><span>{clinic.name}</span><strong>{clinic.count}</strong><small>{clinic.share}</small></button>)}</div></Card>
      <Card className="cp-lower-card cp-device-card"><div className="cp-section-heading"><div><h2>Monitoring devices</h2><p>Readings received this cycle</p></div><Button variant="ghost" size="icon" aria-label="View devices" onClick={onDevices}><ArrowRight size={16} aria-hidden="true" /></Button></div><button type="button" className="cp-device-stack" aria-label="View device monitoring status" onClick={onDevices}><i /><i /><i /></button><div className="cp-device-list"><button type="button" onClick={onDevices}><HeartPulse size={17} aria-hidden="true" /><span>Blood pressure cuff</span><small>68,412 readings</small><strong>54%</strong></button><button type="button" onClick={onDevices}><Activity size={17} aria-hidden="true" /><span>Glucose meter</span><small>41,826 readings</small><strong>33%</strong></button><button type="button" onClick={onDevices}><Smartphone size={17} aria-hidden="true" /><span>Weight scale</span><small>16,470 readings</small><strong>13%</strong></button></div></Card>
      <Card className="cp-lower-card cp-adherence-tiers"><div className="cp-section-heading"><div><h2>Adherence tiers</h2><p>Reading days in the last 30 days</p></div><Button variant="ghost" size="icon" aria-label="View patient roster" onClick={onRoster}><ArrowRight size={16} aria-hidden="true" /></Button></div><button type="button" className="cp-tier-stack" aria-label="View adherence tiers" onClick={onRoster}><i /><i /><i /><i /></button><div className="cp-tier-list"><button type="button" onClick={onRoster}><i className="is-on-track" /><strong>On track</strong><span>16+ days</span><b>4,526</b><small>72%</small></button><button type="button" onClick={onRoster}><i className="is-near" /><strong>Near target</strong><span>12–15 days</span><b>817</b><small>13%</small></button><button type="button" onClick={onRoster}><i className="is-risk" /><strong>At risk</strong><span>1–11 days</span><b>628</b><small>10%</small></button><button type="button" onClick={onRoster}><i className="is-none" /><strong>No readings</strong><span>0 days</span><b>313</b><small>5%</small></button></div></Card>
    </div>
    <p className="cp-data-note">Fictional, aggregated sample metrics · no patient data connected</p>
  </div>;
}

function MetricRow({ icon, title, detail, value, change, positive, note, points }: { icon: React.ReactNode; title: string; detail: string; value: string; change: string; positive?: boolean; note: string; points: string }) {
  return <div className="cp-metric-row"><span className="cp-metric-icon">{icon}</span><span className="cp-metric-copy"><strong>{title}</strong><small>{detail}</small></span><Sparkline points={points} /><strong className="cp-metric-value">{value}</strong><span className={`cp-metric-change${positive ? " is-positive" : " is-negative"}`}><b>{positive ? "↗" : "↘"} {change}</b><small>{note}</small></span></div>;
}

function SecondaryPage({ page, info, patients, extraRows, resolved, connected, learningDone, settingValues, onRowAction, onOpenPatient, onToast }: {
  page: Page;
  info?: PageInfo;
  patients: Patient[];
  extraRows: RecordItem[];
  resolved: Record<string, boolean>;
  connected: Record<string, boolean>;
  learningDone: boolean;
  settingValues: Record<string, boolean>;
  onRowAction: (item: RecordItem) => void;
  onOpenPatient: (patient: Patient) => void;
  onToast: (title: string) => void;
}) {
  const [patientFilter, setPatientFilter] = React.useState("All patients");
  const patientsForView = patients.filter((patient) => patientFilter === "All patients" || patient.status === patientFilter);
  if (page === "Patient roster") return <div className="cp-secondary-page"><div className="cp-stat-grid">{[{ label: "Enrolled patients", value: "6,284", note: "Across 9 clinics" }, { label: "On track", value: "4,526", note: "72% of enrolled" }, { label: "Need outreach", value: "1,445", note: "Near target or at risk" }].map((stat) => <StatCard key={stat.label} {...stat} />)}</div><Card className="cp-list-card"><div className="cp-list-heading"><div><h2>Patient roster</h2><p>{patientsForView.length} sample records · aggregate totals shown above</p></div><Select value={patientFilter} onValueChange={setPatientFilter}><SelectTrigger className="cp-filter-select" aria-label="Filter patient roster"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="All patients">All patients</SelectItem><SelectItem value="On track">On track</SelectItem><SelectItem value="Near target">Near target</SelectItem><SelectItem value="At risk">At risk</SelectItem><SelectItem value="No readings">No readings</SelectItem></SelectContent></Select></div><div className="cp-record-list">{patientsForView.map((patient) => <button type="button" key={patient.id} className="cp-record-row" onClick={() => onOpenPatient(patient)}><span className="cp-avatar">{patient.initials}</span><span className="cp-record-copy"><strong>{patient.name}</strong><small>{patient.clinic} · {patient.program}</small></span><Badge className={statusClass(patient.status)}>{patient.status}</Badge><span className="cp-record-meta">{patient.lastReading}</span><ChevronRight size={16} aria-hidden="true" /></button>)}</div></Card></div>;

  const records = [...(info?.items ?? []), ...extraRows];
  const rowActionLabel = page === "Alerts" ? "Resolve" : page === "Integrations" ? "Connect" : page === "Learn" ? "Open lesson" : "Open";
  return <div className={`cp-secondary-page cp-page-${page.toLowerCase().replaceAll(" ", "-")}`}>
    <div className="cp-stat-grid">{(info?.stats ?? []).map((stat) => <StatCard key={stat.label} {...stat} />)}</div>
    {page === "Settings" && <Card className="cp-preferences-card"><div className="cp-list-heading"><div><h2>Notifications</h2><p>Preferences only apply to this local preview.</p></div><Badge>Preview</Badge></div>{(info?.items ?? []).map((item) => <label key={item.id} className="cp-preference-row"><span><strong>{item.title}</strong><small>{item.detail}</small></span><Switch checked={settingValues[item.id] ?? false} onCheckedChange={() => onRowAction(item)} aria-label={item.title} /></label>)}</Card>}
    {page !== "Settings" && <Card className="cp-list-card"><div className="cp-list-heading"><div><h2>{page === "Alerts" ? "Needs review" : page === "Readings" ? "Recent readings" : page === "Care plans" ? "Care pathways" : page === "Billing" ? "Claims activity" : page === "Devices" ? "Device inventory" : page === "Care teams" ? "Care teams" : page === "Integrations" ? "Available connections" : page === "Reports" ? "Saved reports" : page === "Protocols" ? "Clinical protocols" : page === "Learn" ? "Recommended learning" : page === "Help center" ? "Common questions" : "Care program overview"}</h2><p>{page === "Alerts" ? `${14 - Object.values(resolved).filter(Boolean).length} open alerts · sample priority queue` : "Sample workspace records · local preview only"}</p></div>{page === "Alerts" && <Badge className="cp-warning-badge">{14 - Object.values(resolved).filter(Boolean).length} open</Badge>}</div><div className="cp-record-list">{records.map((item) => {
          const isResolved = resolved[item.id] ?? false;
          const isConnected = connected[item.id] ?? false;
          const status = page === "Alerts" && isResolved ? "Resolved" : page === "Integrations" ? isConnected ? "Connected" : item.status : page === "Learn" && learningDone ? "Complete" : item.status;
          return <div className="cp-record-row" key={item.id}><span className={`cp-record-icon${page === "Alerts" ? " is-alert" : ""}`}>{page === "Alerts" ? <AlertTriangle size={17} aria-hidden="true" /> : page === "Readings" ? <HeartPulse size={17} aria-hidden="true" /> : page === "Care plans" ? <CalendarDays size={17} aria-hidden="true" /> : page === "Billing" ? <CreditCard size={17} aria-hidden="true" /> : page === "Devices" ? <Smartphone size={17} aria-hidden="true" /> : page === "Care teams" ? <Users size={17} aria-hidden="true" /> : page === "Integrations" ? <Wifi size={17} aria-hidden="true" /> : page === "Reports" ? <FileText size={17} aria-hidden="true" /> : page === "Protocols" ? <ClipboardList size={17} aria-hidden="true" /> : page === "Learn" ? <BookOpen size={17} aria-hidden="true" /> : page === "Help center" ? <CircleHelp size={17} aria-hidden="true" /> : <Activity size={17} aria-hidden="true" />}</span><span className="cp-record-copy"><strong>{item.title}</strong><small>{item.detail}</small></span>{item.metric && <span className="cp-record-metric">{item.metric}</span>}<Badge className={statusClass(status)}>{status}</Badge><Button variant="outline" size="sm" onClick={() => onRowAction(item)}>{page === "Alerts" && isResolved ? "Undo" : page === "Alerts" ? "Resolve" : page === "Integrations" ? isConnected ? "Disconnect" : rowActionLabel : page === "Learn" && learningDone ? "Reopen" : rowActionLabel}</Button></div>;
        })}</div>{page === "Alerts" && <p className="cp-inline-note">Resolve updates sample queue only. No clinician is notified.</p>}</Card>}
    {page === "Overview" && <Card className="cp-overview-callout"><span className="cp-feature-icon"><HeartPulse size={19} aria-hidden="true" /></span><div><strong>Care teams are keeping patients connected</strong><p>Review reading trends and outreach needs across your sample programs.</p></div><Button variant="outline" onClick={() => onToast("Overview report opened in local preview")}>View summary <ArrowRight size={15} aria-hidden="true" /></Button></Card>}
    {page === "Billing" && <p className="cp-inline-note">Estimated sample reimbursements only. Not a billing claim or financial advice.</p>}
    {page === "Integrations" && <p className="cp-inline-note">Connector changes are simulated locally. No EHR, device network, or payer is contacted.</p>}
  </div>;
}

function StatCard({ label, value, note }: { label: string; value: string; note: string }) {
  return <Card className="cp-stat-card"><span>{label}</span><strong>{value}</strong><small>{note}</small></Card>;
}

function statusClass(status: string) {
  if (["On track", "Connected", "Ready", "Complete", "Published", "Resolved", "Trending up"].includes(status)) return "cp-status-positive";
  if (["High", "At risk", "Needs info", "Follow up", "Review", "Staffing", "Near target"].includes(status)) return "cp-status-warning";
  return "";
}

export default CarepulseDashboard;

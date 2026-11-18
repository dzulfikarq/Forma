import * as React from "react";
import {
  Activity, AlertTriangle, ArrowDown, ArrowRight, ArrowUpRight, Bell, Building2, CalendarDays, CalendarPlus,
  Check, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, Clock3, ClipboardList, CreditCard,
  Download, FileBarChart, FileCheck2, FileText, FlaskConical, HeartPulse, LayoutGrid, Menu,
  MessageSquare, Pill, Plus, Search, ShieldCheck, Stethoscope, Thermometer, UserRound, Users,
  UserRoundPlus, Wind
} from "lucide-react";
import {
  Badge, Button, Card, CardContent, CardHeader, CardTitle, Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle, Input, Label, ResponsiveNavigation, Select, SelectContent,
  SelectItem, SelectTrigger, SelectValue, Sidebar, Textarea, Toast, ToastProvider
} from "@design-templates/ui";
import "./pulih-clinic-workspace.css";

type Page = "Today" | "Appointments" | "Patients" | "Lab results" | "Pharmacy" | "Billing & claims" | "Reports";
type DialogKind = "appointment" | "check-in" | "prescription" | "past-visits" | "directory" | "labs" | "messages" | "notifications" | "team" | null;
type Patient = {
  id: string; name: string; initials: string; gender: string; age: number; birth: string; mrn: string;
  program: string; lastVisit: string; conditions: string[]; allergy: string; bp: string; pulse: string;
  temperature: string; oxygen: string; bmi: string; a1c: string;
};
type Appointment = { id: number; patient: string; provider: string; time: string; reason: string; status: "Confirmed" | "Waiting" | "Completed" };
type Medication = { name: string; dose: string; schedule: string; tone: "teal" | "violet" | "amber"; refill?: string };
type Claim = { id: string; patient: string; service: string; amount: string; status: "Ready" | "Submitted" | "Paid" };
type SoapNote = { subjective: string; objective: string; assessment: string; plan: string };

const patients: Patient[] = [
  { id: "rina", name: "Rina Kartika", initials: "RK", gender: "Female", age: 46, birth: "Mar 12, 1980", mrn: "PL-00873", program: "Teduh Life", lastVisit: "Jul 14, 2026", conditions: ["Type 2 diabetes · E11.9", "Hypertension · I10"], allergy: "Penicillin · hives, reported 2019", bp: "138/86", pulse: "82", temperature: "36.8", oxygen: "98", bmi: "26.7", a1c: "7.2" },
  { id: "budi", name: "Budi Santoso", initials: "BS", gender: "Male", age: 51, birth: "Jun 08, 1975", mrn: "PL-00641", program: "Primary care", lastVisit: "Oct 02, 2026", conditions: ["Type 2 diabetes · E11.9", "Seasonal allergies · J30.2"], allergy: "No known allergies", bp: "126/80", pulse: "76", temperature: "36.6", oxygen: "99", bmi: "24.8", a1c: "6.8" },
  { id: "ayu", name: "Ayu Lestari", initials: "AL", gender: "Female", age: 33, birth: "Feb 23, 1993", mrn: "PL-00912", program: "Family care", lastVisit: "Sep 26, 2026", conditions: ["Iron deficiency · D50.9"], allergy: "Latex · contact rash", bp: "118/74", pulse: "72", temperature: "36.7", oxygen: "99", bmi: "22.1", a1c: "5.6" },
  { id: "michael", name: "Michael Tan", initials: "MT", gender: "Male", age: 42, birth: "Jan 17, 1984", mrn: "PL-00748", program: "Cardiometabolic", lastVisit: "Aug 30, 2026", conditions: ["High cholesterol · E78.5"], allergy: "No known allergies", bp: "132/84", pulse: "79", temperature: "36.5", oxygen: "98", bmi: "25.9", a1c: "6.1" }
];

const navGroups: Array<{ label: string; items: Array<{ id: Page; icon: React.ReactNode; badge?: string }> }> = [
  { label: "Clinic", items: [
    { id: "Today", icon: <LayoutGrid /> }, { id: "Appointments", icon: <CalendarDays /> },
    { id: "Patients", icon: <UserRound /> }, { id: "Lab results", icon: <FlaskConical />, badge: "4" },
    { id: "Pharmacy", icon: <Pill /> }
  ] },
  { label: "Admin", items: [
    { id: "Billing & claims", icon: <FileCheck2 /> }, { id: "Reports", icon: <FileBarChart /> }
  ] }
];

const navItems = navGroups.flatMap((group) => group.items.map((item) => ({ id: item.id, label: item.id, icon: item.icon })));
const initialAppointments: Appointment[] = [
  { id: 1, patient: "Budi Santoso", provider: "dr. Sarah Wibowo", time: "08:00", reason: "Annual check-up", status: "Completed" },
  { id: 2, patient: "Ayu Lestari", provider: "dr. Sarah Wibowo", time: "08:30", reason: "Follow-up", status: "Completed" },
  { id: 3, patient: "Michael Tan", provider: "dr. Sarah Wibowo", time: "09:00", reason: "Annual check-up", status: "Completed" },
  { id: 4, patient: "Rina Kartika", provider: "dr. Sarah Wibowo", time: "10:15", reason: "Diabetes follow-up", status: "Waiting" },
  { id: 5, patient: "Joko Susilo", provider: "dr. Sarah Wibowo", time: "10:30", reason: "Blood pressure review", status: "Confirmed" },
  { id: 6, patient: "Kenzo Alvaro, 4 y", provider: "dr. Arif Nugroho", time: "08:15", reason: "Vaccination", status: "Completed" },
  { id: 7, patient: "Alya Ramadhani, 7 y", provider: "dr. Arif Nugroho", time: "09:00", reason: "Growth check", status: "Completed" },
  { id: 8, patient: "Nayla Putri, 5 y", provider: "dr. Arif Nugroho", time: "10:30", reason: "Immunisation", status: "Confirmed" },
  { id: 9, patient: "Clara Wong", provider: "dr. Mei Lin", time: "09:00", reason: "Acne follow-up", status: "Completed" },
  { id: 10, patient: "Putri Andini", provider: "dr. Mei Lin", time: "10:30", reason: "Mole check", status: "Confirmed" }
];
const initialMedications: Medication[] = [
  { name: "Metformin", dose: "500 mg", schedule: "2× daily, after meals", tone: "teal", refill: "Refill in 12 days" },
  { name: "Amlodipine", dose: "5 mg", schedule: "1× daily, morning", tone: "violet", refill: "Refill in 18 days" },
  { name: "Atorvastatin", dose: "10 mg", schedule: "1× daily, night", tone: "amber", refill: "Refill in 24 days" }
];
const initialClaims: Claim[] = [
  { id: "CL-2084", patient: "Rina Kartika", service: "Diabetes follow-up", amount: "Rp 425.000", status: "Ready" },
  { id: "CL-2083", patient: "Budi Santoso", service: "Annual check-up", amount: "Rp 310.000", status: "Submitted" },
  { id: "CL-2082", patient: "Ayu Lestari", service: "Iron panel", amount: "Rp 185.000", status: "Paid" }
];
const initialSoap: SoapNote = {
  subjective: "Feels well. Some tingling in both feet at night. Misses evening Metformin ~2×/week.",
  objective: "BP 138/86, BMI 26.7. HbA1c 7.2% (7.8% in July). Monofilament test normal.",
  assessment: "T2DM improving, not yet at target. Hypertension, borderline control.",
  plan: "Amlodipine up to 10 mg. Evening dose reminder. Recheck HbA1c in January."
};
const labRows = [
  { name: "Fasting glucose", range: "70–99 mg/dL", value: "142", tone: "high", position: "82%" },
  { name: "HbA1c", range: "under 7.0%", value: "7.2%", tone: "high", position: "71%" },
  { name: "LDL", range: "under 100 mg/dL", value: "118", tone: "watch", position: "65%" },
  { name: "Creatinine", range: "0.5–1.1 mg/dL", value: "0.9", tone: "normal", position: "34%" }
];

export function PulihClinicWorkspace() {
  const [toast, setToast] = React.useState({ open: false, title: "", description: "" });
  const notify = (title: string, description = "Sample workspace · changes stay in this session.") => setToast({ open: true, title, description });
  return <ToastProvider><PulihWorkspace notify={notify} /><Toast {...toast} onOpenChange={(open) => setToast((current) => ({ ...current, open }))} /></ToastProvider>;
}

function PulihWorkspace({ notify }: { notify: (title: string, description?: string) => void }) {
  const [page, setPage] = React.useState<Page>("Patients");
  const [collapsed, setCollapsed] = React.useState(false);
  const [dialog, setDialog] = React.useState<DialogKind>(null);
  const [clinic, setClinic] = React.useState("Kemang Clinic");
  const [activePatientId, setActivePatientId] = React.useState("rina");
  const [appointments, setAppointments] = React.useState(initialAppointments);
  const [medications, setMedications] = React.useState(initialMedications);
  const [claims, setClaims] = React.useState(initialClaims);
  const [queue, setQueue] = React.useState(["Joko Susilo", "Nayla Putri, 5 y", "Putri Andini", "Fajar Hidayat", "Bima Saputra, 9 mo"]);
  const [note, setNote] = React.useState(initialSoap);
  const [noteSaved, setNoteSaved] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [directoryQuery, setDirectoryQuery] = React.useState("");
  const [appointmentPatient, setAppointmentPatient] = React.useState("Dewi Putri");
  const [appointmentProvider, setAppointmentProvider] = React.useState("dr. Sarah Wibowo");
  const [appointmentTime, setAppointmentTime] = React.useState("13:30");
  const [appointmentReason, setAppointmentReason] = React.useState("Consultation");
  const [checkInName, setCheckInName] = React.useState("");
  const [prescriptionName, setPrescriptionName] = React.useState("");
  const [prescriptionDose, setPrescriptionDose] = React.useState("");
  const [weekView, setWeekView] = React.useState(false);
  const [labFilter, setLabFilter] = React.useState("All results");
  const [reportRange, setReportRange] = React.useState("This month");
  const searchRef = React.useRef<HTMLInputElement>(null);
  const noteSnapshot = React.useRef(JSON.stringify(initialSoap));
  const patient = patients.find((item) => item.id === activePatientId) ?? patients[0]!;
  const searchMatches = patients.filter((item) => `${item.name} ${item.mrn}`.toLowerCase().includes(search.toLowerCase()));
  const directoryMatches = patients.filter((item) => `${item.name} ${item.mrn}`.toLowerCase().includes(directoryQuery.toLowerCase()));

  React.useEffect(() => {
    function focusSearch(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault(); searchRef.current?.focus(); }
    }
    document.addEventListener("keydown", focusSearch);
    return () => document.removeEventListener("keydown", focusSearch);
  }, []);

  React.useEffect(() => {
    const snapshot = JSON.stringify(note);
    if (snapshot === noteSnapshot.current) return;
    noteSnapshot.current = snapshot;
    setNoteSaved(false);
    const timer = window.setTimeout(() => setNoteSaved(true), 650);
    return () => window.clearTimeout(timer);
  }, [note]);

  function choosePatient(id: string) {
    setActivePatientId(id);
    setPage("Patients");
    setDialog(null);
    setSearch("");
    setDirectoryQuery("");
  }

  function createAppointment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = appointmentPatient.trim();
    if (!name) return;
    setAppointments((current) => [{ id: Date.now(), patient: name, provider: appointmentProvider, time: appointmentTime, reason: appointmentReason, status: "Confirmed" }, ...current]);
    setDialog(null);
    notify("Appointment added", `${name} · ${appointmentTime} · saved locally.`);
  }

  function checkInPatient(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = checkInName.trim();
    if (!name) return;
    setQueue((current) => [name, ...current]);
    setCheckInName("");
    setDialog(null);
    notify("Patient checked in", `${name} added to the waiting queue.`);
  }

  function createPrescription(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = prescriptionName.trim();
    const dose = prescriptionDose.trim();
    if (!name || !dose) return;
    setMedications((current) => [...current, { name, dose, schedule: "1× daily · new prescription", tone: "teal", refill: "Added today" }]);
    setPrescriptionName("");
    setPrescriptionDose("");
    setDialog(null);
    notify("Prescription saved", `${name} ${dose} added to ${patient.name}’s local medication list.`);
  }

  function updateClaim(id: string, status: Claim["status"]) {
    setClaims((current) => current.map((claim) => claim.id === id ? { ...claim, status } : claim));
    notify(`Claim ${status.toLowerCase()}`, `${id} updated in this sample session.`);
  }

  function requestRefill(name: string) {
    setMedications((current) => current.map((medication) => medication.name === name ? { ...medication, refill: "Refill requested" } : medication));
    notify("Refill requested", `${name} · request is local to this preview.`);
  }

  return <main className="pulih-workspace" aria-label="Pulih sample clinic workspace">
    <div className={`pulih-frame${collapsed ? " is-collapsed" : ""}`}>
      <Sidebar className="pulih-sidebar" aria-label="Clinic sidebar">
        <div className="pulih-brand-row"><a className="pulih-brand" href="#today" onClick={(event) => { event.preventDefault(); setPage("Today"); }} aria-label="Pulih clinic home"><span className="pulih-brand-mark"><Plus size={24} strokeWidth={3} aria-hidden="true" /></span><span>Pulih</span></a><Button className="pulih-collapse" variant="ghost" size="icon" aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} aria-expanded={!collapsed} onClick={() => setCollapsed((value) => !value)}>{collapsed ? <ChevronRight size={17} aria-hidden="true" /> : <ChevronLeft size={17} aria-hidden="true" />}</Button></div>
        <div className="pulih-clinic-select"><Building2 size={19} aria-hidden="true" /><Select value={clinic} onValueChange={setClinic}><SelectTrigger aria-label="Choose clinic"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Kemang Clinic">Kemang Clinic · Jakarta Selatan</SelectItem><SelectItem value="Menteng Clinic">Menteng Clinic · Jakarta Pusat</SelectItem></SelectContent></Select><ChevronDown className="pulih-clinic-chevron" size={15} aria-hidden="true" /></div>
        <nav className="pulih-side-nav" aria-label="Primary navigation">
          {navGroups.map((group) => <section className="pulih-nav-group" key={group.label}><p>{group.label}</p>{group.items.map(({ id, icon, badge }) => <Button key={id} type="button" variant="ghost" className={`pulih-nav-button${page === id ? " is-active" : ""}`} aria-label={id} aria-current={page === id ? "page" : undefined} onClick={() => setPage(id)}><span className="pulih-nav-icon">{icon}</span><span className="pulih-nav-label">{id}</span>{badge && <span className="pulih-nav-badge">{badge}</span>}</Button>)}</section>)}
        </nav>
        <div className="pulih-sidebar-bottom"><Button type="button" className="pulih-on-duty" variant="ghost" onClick={() => setDialog("team")} aria-label="View on-duty team"><span className="pulih-duty-label">On duty now</span><span className="pulih-avatar-stack"><i>SW</i><i>AN</i><i>ML</i></span><strong>3 doctors · 2 nurses</strong><span>Rooms 1–3 open until 21:00</span></Button><Button type="button" className="pulih-user" variant="ghost" onClick={() => setDialog("team")}><span className="pulih-avatar is-user">SW</span><span><strong>dr. Sarah Wibowo</strong><small>General practitioner</small></span></Button></div>
      </Sidebar>

      <section className="pulih-main-shell">
        <header className="pulih-topbar">
          <ResponsiveNavigation items={navItems} activeId={page} onSelect={(id) => setPage(id as Page)} label="Open clinic navigation" trigger={<Menu size={19} aria-hidden="true" />} />
          <div className="pulih-global-search"><Search size={18} aria-hidden="true" /><Input ref={searchRef} value={search} onChange={(event) => setSearch(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && searchMatches[0]) choosePatient(searchMatches[0].id); }} placeholder="Search patient or MRN" aria-label="Search patient or MRN" /><kbd>⌘K</kbd>{search.length > 0 && <div className="pulih-search-results" role="listbox" aria-label="Patient search results">{searchMatches.map((item) => <button type="button" role="option" aria-selected="false" key={item.id} onClick={() => choosePatient(item.id)}><span className="pulih-avatar">{item.initials}</span><span><strong>{item.name}</strong><small>{item.mrn} · {item.program}</small></span></button>)}{searchMatches.length === 0 && <p>No matching patient in sample records.</p>}</div>}</div>
          <div className="pulih-top-date"><CalendarDays size={17} aria-hidden="true" /><strong>Mon, Oct 19</strong><span>· 10:24</span></div>
          <div className="pulih-top-actions"><Button type="button" variant="outline" size="icon" className="pulih-icon-action" aria-label="Open messages" onClick={() => setDialog("messages")}><MessageSquare size={18} aria-hidden="true" /></Button><Button type="button" variant="outline" size="icon" className="pulih-icon-action pulih-notification" aria-label="Open notifications" onClick={() => setDialog("notifications")}><Bell size={18} aria-hidden="true" /><i /></Button><Button type="button" className="pulih-appointment-button" aria-label="Create new appointment" onClick={() => setDialog("appointment")}><CalendarPlus size={17} aria-hidden="true" /><span>New appointment</span></Button></div>
        </header>

        <div className="pulih-content">
          {page === "Today" && <TodayPage appointments={appointments} queue={queue} weekView={weekView} onWeekChange={() => setWeekView((value) => !value)} onAppointment={() => setDialog("appointment")} onCheckIn={() => setDialog("check-in")} onOpenAppointment={(item) => notify("Appointment details", `${item.patient} · ${item.time} with ${item.provider}.`)} />}
          {page === "Appointments" && <AppointmentsPage appointments={appointments} weekView={weekView} onWeekChange={() => setWeekView((value) => !value)} onAppointment={() => setDialog("appointment")} onOpenAppointment={(item) => notify("Appointment details", `${item.patient} · ${item.time} with ${item.provider}.`)} />}
          {page === "Patients" && <PatientRecordPage patient={patient} medications={medications} note={note} noteSaved={noteSaved} onNoteChange={setNote} onUseTemplate={() => { setNote({ subjective: "Feels well. Add patient-reported symptoms.", objective: "Vitals reviewed. Add exam findings and lab values.", assessment: "Add clinical assessment and working diagnosis.", plan: "Add medication changes, advice, and follow-up." }); notify("SOAP template inserted", "Draft remains local to this session."); }} onPastVisits={() => setDialog("past-visits")} onPrescription={() => setDialog("prescription")} onFullReport={() => setDialog("labs")} onOpenDirectory={() => setDialog("directory")} onRefill={requestRefill} />}
          {page === "Lab results" && <LabResultsPage filter={labFilter} onFilterChange={setLabFilter} onFullReport={() => setDialog("labs")} onOpenPatient={() => setPage("Patients")} />}
          {page === "Pharmacy" && <PharmacyPage medications={medications} onPrescription={() => setDialog("prescription")} onRefill={requestRefill} />}
          {page === "Billing & claims" && <BillingPage claims={claims} onUpdate={updateClaim} />}
          {page === "Reports" && <ReportsPage range={reportRange} onRangeChange={setReportRange} onDownload={() => downloadReport(notify)} />}
        </div>
      </section>
    </div>

    <Dialog open={dialog !== null} onOpenChange={(open) => { if (!open) setDialog(null); }}>
      <DialogContent className="pulih-dialog" aria-describedby="pulih-dialog-description">
        {dialog === "appointment" && <><DialogHeader><DialogTitle>New appointment</DialogTitle><DialogDescription id="pulih-dialog-description">Add a fictional visit to this local clinic schedule.</DialogDescription></DialogHeader><form className="pulih-form" onSubmit={createAppointment}><div className="pulih-form-field"><Label htmlFor="appointment-patient">Patient name</Label><Input id="appointment-patient" value={appointmentPatient} onChange={(event) => setAppointmentPatient(event.target.value)} required /></div><div className="pulih-form-grid"><div className="pulih-form-field"><Label htmlFor="appointment-time">Time</Label><Input id="appointment-time" type="time" value={appointmentTime} onChange={(event) => setAppointmentTime(event.target.value)} required /></div><div className="pulih-form-field"><Label htmlFor="appointment-reason">Visit type</Label><Input id="appointment-reason" value={appointmentReason} onChange={(event) => setAppointmentReason(event.target.value)} required /></div></div><div className="pulih-form-field"><Label htmlFor="appointment-provider">Provider</Label><Select value={appointmentProvider} onValueChange={setAppointmentProvider}><SelectTrigger id="appointment-provider"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="dr. Sarah Wibowo">dr. Sarah Wibowo · General</SelectItem><SelectItem value="dr. Arif Nugroho">dr. Arif Nugroho · Paediatrics</SelectItem><SelectItem value="dr. Mei Lin">dr. Mei Lin · Dermatology</SelectItem></SelectContent></Select></div><DialogFooter><Button type="button" variant="outline" onClick={() => setDialog(null)}>Cancel</Button><Button type="submit"><CalendarPlus size={16} aria-hidden="true" />Add appointment</Button></DialogFooter></form></>}
        {dialog === "check-in" && <><DialogHeader><DialogTitle>Check in patient</DialogTitle><DialogDescription id="pulih-dialog-description">Add a walk-in to the sample waiting queue.</DialogDescription></DialogHeader><form className="pulih-form" onSubmit={checkInPatient}><div className="pulih-form-field"><Label htmlFor="checkin-name">Patient name</Label><Input id="checkin-name" value={checkInName} onChange={(event) => setCheckInName(event.target.value)} placeholder="Enter patient name" required /></div><div className="pulih-form-field"><Label htmlFor="checkin-reason">Visit reason</Label><Input id="checkin-reason" defaultValue="Walk-in consultation" /></div><DialogFooter><Button type="button" variant="outline" onClick={() => setDialog(null)}>Cancel</Button><Button type="submit"><Check size={16} aria-hidden="true" />Check in</Button></DialogFooter></form></>}
        {dialog === "prescription" && <><DialogHeader><DialogTitle>Write prescription</DialogTitle><DialogDescription id="pulih-dialog-description">Prescription for {patient.name} · local sample only.</DialogDescription></DialogHeader><form className="pulih-form" onSubmit={createPrescription}><div className="pulih-form-field"><Label htmlFor="prescription-medication">Medication</Label><Input id="prescription-medication" value={prescriptionName} onChange={(event) => setPrescriptionName(event.target.value)} placeholder="e.g. Metformin" required /></div><div className="pulih-form-field"><Label htmlFor="prescription-dose">Dose and instructions</Label><Input id="prescription-dose" value={prescriptionDose} onChange={(event) => setPrescriptionDose(event.target.value)} placeholder="e.g. 500 mg · twice daily" required /></div><div className="pulih-form-field"><Label htmlFor="prescription-note">Pharmacy note</Label><Input id="prescription-note" defaultValue="Take after meals · sample instruction" /></div><DialogFooter><Button type="button" variant="outline" onClick={() => setDialog(null)}>Cancel</Button><Button type="submit"><Pill size={16} aria-hidden="true" />Save prescription</Button></DialogFooter></form></>}
        {dialog === "past-visits" && <><DialogHeader><DialogTitle>Past visits · {patient.name}</DialogTitle><DialogDescription id="pulih-dialog-description">Recent sample visit history. No clinical system is connected.</DialogDescription></DialogHeader><div className="pulih-dialog-list"><VisitRow date="Jul 14, 2026" title="Diabetes follow-up" note="HbA1c 7.8% · medication review" /><VisitRow date="Apr 09, 2026" title="Quarterly review" note="Blood pressure stable · foot exam completed" /><VisitRow date="Jan 12, 2026" title="Annual wellness visit" note="Labs ordered · follow-up in three months" /></div><DialogFooter><Button onClick={() => { setDialog(null); notify("Visit history viewed", "Sample history only; no record was changed."); }}>Done</Button></DialogFooter></>}
        {dialog === "directory" && <><DialogHeader><DialogTitle>Patient directory</DialogTitle><DialogDescription id="pulih-dialog-description">Search fictional patient records and open a chart.</DialogDescription></DialogHeader><div className="pulih-form-field"><Label htmlFor="directory-search">Search patients</Label><Input id="directory-search" value={directoryQuery} onChange={(event) => setDirectoryQuery(event.target.value)} placeholder="Name or medical record number" /></div><div className="pulih-directory-list">{directoryMatches.map((item) => <button type="button" key={item.id} onClick={() => choosePatient(item.id)}><span className="pulih-avatar">{item.initials}</span><span><strong>{item.name}</strong><small>{item.mrn} · {item.age} years · {item.program}</small></span><ArrowRight size={16} aria-hidden="true" /></button>)}{directoryMatches.length === 0 && <p>No sample patients match that search.</p>}</div></>}
        {dialog === "labs" && <><DialogHeader><DialogTitle>Lab report · {patient.name}</DialogTitle><DialogDescription id="pulih-dialog-description">Collected Oct 19, 2026 · fictional sample results.</DialogDescription></DialogHeader><div className="pulih-dialog-list">{labRows.map((row) => <div className="pulih-report-row" key={row.name}><span><strong>{row.name}</strong><small>{row.range}</small></span><strong className={`is-${row.tone}`}>{row.value}</strong><RangeBar position={row.position} label={`${row.name} reference range`} /></div>)}</div><DialogFooter><Button variant="outline" onClick={() => { setDialog(null); notify("Report downloaded", "Sample lab report exported for this session."); }}><Download size={16} aria-hidden="true" />Download report</Button><Button onClick={() => setDialog(null)}>Close</Button></DialogFooter></>}
        {dialog === "messages" && <><DialogHeader><DialogTitle>Clinic messages</DialogTitle><DialogDescription id="pulih-dialog-description">Local sample inbox · 2 unread messages.</DialogDescription></DialogHeader><div className="pulih-dialog-list"><VisitRow date="10:12 · Today" title="Lab team · Rina Kartika" note="HbA1c result is ready for review." /><VisitRow date="09:46 · Today" title="Front desk · Room 1" note="Patient has checked in for the 10:15 visit." /></div><DialogFooter><Button onClick={() => { setDialog(null); notify("Messages marked read", "Read state remains local to this session."); }}>Mark all read</Button></DialogFooter></>}
        {dialog === "notifications" && <><DialogHeader><DialogTitle>Notifications</DialogTitle><DialogDescription id="pulih-dialog-description">Updates from this sample clinic.</DialogDescription></DialogHeader><div className="pulih-dialog-list"><VisitRow date="Just now" title="Lab result needs review" note="Rina Kartika · Fasting glucose 142 mg/dL" /><VisitRow date="08:30" title="Room 2 is ready" note="Next appointment starts at 08:45." /></div><DialogFooter><Button onClick={() => { setDialog(null); notify("Notifications cleared", "Sample notifications cleared locally."); }}>Clear updates</Button></DialogFooter></>}
        {dialog === "team" && <><DialogHeader><DialogTitle>On-duty team</DialogTitle><DialogDescription id="pulih-dialog-description">Kemang Clinic · Rooms 1–3 open until 21:00.</DialogDescription></DialogHeader><div className="pulih-team-list"><TeamMember initials="SW" name="dr. Sarah Wibowo" role="General practitioner · Room 1" color="peach" /><TeamMember initials="AN" name="dr. Arif Nugroho" role="Paediatrician · Room 2" color="mint" /><TeamMember initials="ML" name="dr. Mei Lin" role="Dermatologist · Room 3" color="violet" /><TeamMember initials="DS" name="Dina Sari" role="Registered nurse" color="amber" /></div><DialogFooter><Button onClick={() => setDialog(null)}>Close</Button></DialogFooter></>}
      </DialogContent>
    </Dialog>
  </main>;
}

function TodayPage({ appointments, queue, weekView, onWeekChange, onAppointment, onCheckIn, onOpenAppointment }: { appointments: Appointment[]; queue: string[]; weekView: boolean; onWeekChange: () => void; onAppointment: () => void; onCheckIn: () => void; onOpenAppointment: (item: Appointment) => void }) {
  return <><PageHeading eyebrow="Monday, October 19, 2026" title="Good morning, dr. Sarah" description="38 patients booked today · 6 waiting in the lobby" action={<Button variant="outline" onClick={onCheckIn}><UserRoundPlus size={17} aria-hidden="true" />Check in patient</Button>} />
    <section className="pulih-stat-grid" aria-label="Today's clinic summary"><MetricCard icon={<CalendarDays />} label="Booked" value={String(38 + Math.max(0, appointments.length - initialAppointments.length))} note="+4 walk-ins" tone="teal" /><MetricCard icon={<CheckCircle2 />} label="Seen" value="17" note="45% of the day" tone="mint" /><MetricCard icon={<Users />} label="Waiting" value={String(6 + Math.max(0, queue.length - 5))} note="in the lobby now" tone="amber" /><MetricCard icon={<Clock3 />} label="Avg. wait" value="14 min" note="target under 20" tone="violet" /><MetricCard icon={<AlertTriangle />} label="No-shows" value="2" note="SMS reminder sent" tone="rose" /></section>
    <div className="pulih-dashboard-grid"><ScheduleBoard appointments={appointments} weekView={weekView} onWeekChange={onWeekChange} onOpenAppointment={onOpenAppointment} /><QueueCard queue={queue} /></div>
  </>;
}

function AppointmentsPage({ appointments, weekView, onWeekChange, onAppointment, onOpenAppointment }: { appointments: Appointment[]; weekView: boolean; onWeekChange: () => void; onAppointment: () => void; onOpenAppointment: (item: Appointment) => void }) {
  return <><PageHeading eyebrow="Clinic schedule" title="Appointments" description="Manage today's visits across all clinic rooms." action={<Button onClick={onAppointment}><CalendarPlus size={17} aria-hidden="true" />New appointment</Button>} />
    <ScheduleBoard appointments={appointments} weekView={weekView} onWeekChange={onWeekChange} onOpenAppointment={onOpenAppointment} />
    <Card className="pulih-list-card"><CardHeader className="pulih-section-heading"><div><CardTitle>Upcoming visits</CardTitle><p>Fictional schedule · updated locally</p></div><Badge>{appointments.filter((item) => item.status !== "Completed").length} upcoming</Badge></CardHeader><CardContent className="pulih-table-content"><div className="pulih-appointment-list">{appointments.map((item) => <button className="pulih-appointment-row" key={item.id} onClick={() => onOpenAppointment(item)}><span className="pulih-time-label">{item.time}</span><span className="pulih-avatar">{initials(item.patient)}</span><span className="pulih-row-copy"><strong>{item.patient}</strong><small>{item.reason} · {item.provider}</small></span><StatusPill tone={item.status === "Completed" ? "mint" : item.status === "Waiting" ? "amber" : "teal"}>{item.status}</StatusPill><ChevronRight size={16} aria-hidden="true" /></button>)}</div></CardContent></Card>
  </>;
}

function PatientRecordPage({ patient, medications, note, noteSaved, onNoteChange, onUseTemplate, onPastVisits, onPrescription, onFullReport, onOpenDirectory, onRefill }: { patient: Patient; medications: Medication[]; note: SoapNote; noteSaved: boolean; onNoteChange: React.Dispatch<React.SetStateAction<SoapNote>>; onUseTemplate: () => void; onPastVisits: () => void; onPrescription: () => void; onFullReport: () => void; onOpenDirectory: () => void; onRefill: (name: string) => void }) {
  const vitals = [
    { label: "BP", value: patient.bp, unit: "mmHg", status: "Slightly high", tone: "amber" as const, icon: <HeartPulse /> },
    { label: "Heart rate", value: patient.pulse, unit: "bpm", status: "Normal", tone: "mint" as const, icon: <Activity /> },
    { label: "Temperature", value: patient.temperature, unit: "°C", status: "Normal", tone: "mint" as const, icon: <Thermometer /> },
    { label: "SpO₂", value: patient.oxygen, unit: "%", status: "Normal", tone: "mint" as const, icon: <Wind /> },
    { label: "BMI", value: patient.bmi, unit: "", status: "68.4 kg", tone: "amber" as const, icon: <Activity /> }
  ];
  return <><PageHeading eyebrow={`Visit #7 · started 10:15 · Room 1`} title="Patient record" description={`${patient.name} · ${patient.mrn} · fictional sample record`} action={<><Button variant="outline" onClick={onOpenDirectory}><Search size={16} aria-hidden="true" />All patients</Button><Button variant="outline" onClick={onPastVisits}><Clock3 size={16} aria-hidden="true" />Past visits</Button><Button className="pulih-navy-button" onClick={onPrescription}><FileText size={16} aria-hidden="true" />Write prescription</Button></>} />
    <div className="pulih-patient-layout">
      <div className="pulih-patient-side"><PatientProfile patient={patient} /><MedicationCard medications={medications} onRefill={onRefill} /></div>
      <div className="pulih-patient-main"><section className="pulih-vitals-grid" aria-label="Current patient vitals">{vitals.map((vital) => <Card className="pulih-vital-card" key={vital.label}><CardContent><div className="pulih-vital-label">{vital.icon}<span>{vital.label}</span></div><p><strong>{vital.value}</strong> <span>{vital.unit}</span></p><StatusPill tone={vital.tone}>{vital.status}</StatusPill></CardContent></Card>)}</section>
        <div className="pulih-clinical-grid"><A1cCard patient={patient} /><LabSummary onFullReport={onFullReport} patient={patient} /></div>
        <ConsultationNote note={note} saved={noteSaved} onChange={onNoteChange} onUseTemplate={onUseTemplate} />
      </div>
    </div>
  </>;
}

function PatientProfile({ patient }: { patient: Patient }) {
  return <Card className="pulih-profile-card"><CardContent><div className="pulih-profile-top"><span className="pulih-avatar pulih-avatar-large is-peach">{patient.initials}<i /></span><h2>{patient.name}</h2><p>{patient.gender} · {patient.age} years · born {patient.birth}</p><div className="pulih-chip-row"><Badge className="pulih-chip is-teal">MRN {patient.mrn}</Badge><Badge className="pulih-chip is-violet">{patient.program}</Badge><Badge className="pulih-chip is-muted">O+</Badge></div></div><div className="pulih-profile-details"><div><span>Conditions</span><strong>{patient.conditions.map((condition) => <span key={condition}>{condition}</span>)}</strong></div><div><span>Last visit</span><strong>{patient.lastVisit}</strong></div></div><div className="pulih-allergy"><AlertTriangle size={18} aria-hidden="true" /><span><strong>Allergy: {patient.allergy.split(" · ")[0]}</strong><small>{patient.allergy.split(" · ").slice(1).join(" · ") || "No known allergies"}</small></span></div></CardContent></Card>;
}

function MedicationCard({ medications, onRefill }: { medications: Medication[]; onRefill: (name: string) => void }) {
  return <Card className="pulih-medication-card"><CardHeader className="pulih-section-heading"><div><CardTitle>Current medication</CardTitle><p>Patient-reported and clinic prescriptions</p></div><Pill size={18} aria-hidden="true" /></CardHeader><CardContent>{medications.map((item) => <div className="pulih-medication-row" key={`${item.name}-${item.dose}`}><span className={`pulih-med-icon is-${item.tone}`}><Pill size={17} aria-hidden="true" /></span><span className="pulih-row-copy"><strong>{item.name} {item.dose}</strong><small>{item.schedule}</small><small className="pulih-refill-note">{item.refill}</small></span><Button type="button" variant="ghost" size="icon" aria-label={`Request refill for ${item.name}`} onClick={() => onRefill(item.name)}><ArrowRight size={16} aria-hidden="true" /></Button></div>)}</CardContent></Card>;
}

function A1cCard({ patient }: { patient: Patient }) {
  return <Card className="pulih-chart-card"><CardHeader className="pulih-section-heading"><div><CardTitle>HbA1c trend</CardTitle><p>Progress across the past 10 months</p></div><StatusPill tone="mint">−1.7 since Jan</StatusPill></CardHeader><CardContent><svg className="pulih-a1c-chart" viewBox="0 0 360 220" role="img" aria-label={`HbA1c improved from 8.9 percent in January to ${patient.a1c} percent in October. Target 7 percent.`}><defs><linearGradient id="pulih-chart-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity=".16" /><stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0" /></linearGradient></defs><line x1="42" y1="35" x2="338" y2="35" className="pulih-chart-gridline" /><line x1="42" y1="105" x2="338" y2="105" className="pulih-chart-gridline" /><line x1="42" y1="175" x2="338" y2="175" className="pulih-chart-gridline" /><line x1="42" y1="140" x2="338" y2="140" className="pulih-chart-target" /><path d="M42 67 L116 84 L190 105 L264 127 L338 141 L338 175 L42 175 Z" className="pulih-chart-area" /><path d="M42 67 L116 84 L190 105 L264 127 L338 141" className="pulih-chart-line" /><circle cx="338" cy="141" r="7" className="pulih-chart-point" /><text x="7" y="39">10%</text><text x="12" y="109">8%</text><text x="12" y="179">6%</text><text x="42" y="204">Jan</text><text x="137" y="204">Apr</text><text x="230" y="204">Jul</text><text x="318" y="204">Oct</text><rect x="228" y="125" width="77" height="22" rx="11" className="pulih-target-label" /><text x="237" y="140" className="pulih-target-text">Target 7.0%</text></svg><div className="pulih-chart-footer"><span>October result</span><strong>{patient.a1c}%</strong><span className="pulih-chart-good"><ArrowDown size={14} aria-hidden="true" />Improving</span></div></CardContent></Card>;
}

function LabSummary({ onFullReport, patient }: { onFullReport: () => void; patient: Patient }) {
  return <Card className="pulih-lab-card"><CardHeader className="pulih-section-heading"><div><CardTitle>Lab results · today</CardTitle><p>{patient.name} · collected 09:42</p></div><Button type="button" variant="ghost" size="sm" onClick={onFullReport}>Full report <ArrowRight size={14} aria-hidden="true" /></Button></CardHeader><CardContent>{labRows.map((row) => <div className="pulih-lab-row" key={row.name}><span><strong>{row.name}</strong><small>{row.range}</small></span><strong className={`is-${row.tone}`}>{row.name === "HbA1c" ? `${patient.a1c}%` : row.value}</strong><RangeBar position={row.position} label={`${row.name} result on reference range`} /></div>)}</CardContent></Card>;
}

function RangeBar({ position, label }: { position: string; label: string }) {
  return <div className="pulih-range" role="img" aria-label={label}><span className="is-low" /><span className="is-normal" /><span className="is-high" /><i style={{ left: position }} /></div>;
}

function ConsultationNote({ note, saved, onChange, onUseTemplate }: { note: SoapNote; saved: boolean; onChange: React.Dispatch<React.SetStateAction<SoapNote>>; onUseTemplate: () => void }) {
  const fields: Array<{ id: keyof SoapNote; label: string; initial: string }> = [
    { id: "subjective", label: "S", initial: "Subjective" }, { id: "objective", label: "O", initial: "Objective" },
    { id: "assessment", label: "A", initial: "Assessment" }, { id: "plan", label: "P", initial: "Plan" }
  ];
  return <Card className="pulih-note-card"><CardHeader className="pulih-section-heading"><div><CardTitle>Consultation note</CardTitle><p>SOAP note · saved locally in this session</p></div><StatusPill tone={saved ? "mint" : "teal"}>{saved ? "Draft · autosaved" : "Saving…"}</StatusPill><Button type="button" variant="ghost" size="sm" onClick={onUseTemplate}>Use template</Button></CardHeader><CardContent><div className="pulih-soap-fields">{fields.map((field) => <label className="pulih-soap-row" key={field.id}><span aria-hidden="true">{field.label}</span><span className="sr-only">{field.initial}</span><Textarea aria-label={field.initial} value={note[field.id]} rows={field.id === "plan" ? 2 : 1} onChange={(event) => onChange((current) => ({ ...current, [field.id]: event.target.value }))} /></label>)}</div><div className="pulih-note-footer"><Badge className="pulih-chip is-teal">E11.9 · I10</Badge><Badge className="pulih-chip is-muted">Follow-up Jan 18, 2027</Badge><Badge className="pulih-chip is-mint">Foot exam done</Badge></div></CardContent></Card>;
}

function ScheduleBoard({ appointments, weekView, onWeekChange, onOpenAppointment }: { appointments: Appointment[]; weekView: boolean; onWeekChange: () => void; onOpenAppointment: (item: Appointment) => void }) {
  const doctors = ["dr. Sarah Wibowo", "dr. Arif Nugroho", "dr. Mei Lin"];
  const doctorsMeta = [{ initials: "SW", specialty: "General · Room 1", tone: "peach" }, { initials: "AN", specialty: "Paediatrics · Room 2", tone: "mint" }, { initials: "ML", specialty: "Dermatology · Room 3", tone: "violet" }];
  const hours = ["08:00", "09:00", "10:00", "11:00", "12:00"];
  const weekDays = [
    { day: "Mon", date: "19", count: 38, load: 78, note: "Today · 6 waiting" },
    { day: "Tue", date: "20", count: 42, load: 88, note: "First visit · 08:15" },
    { day: "Wed", date: "21", count: 35, load: 69, note: "First visit · 08:30" },
    { day: "Thu", date: "22", count: 41, load: 84, note: "First visit · 08:00" },
    { day: "Fri", date: "23", count: 29, load: 58, note: "First visit · 09:00" }
  ];
  return <Card className="pulih-schedule-card">
    <CardHeader className="pulih-section-heading">
      <div className="pulih-schedule-title"><CardTitle>Schedule</CardTitle><Badge className="pulih-chip is-muted">{weekView ? "Week of Oct 19" : "Mon, Oct 19"}</Badge></div>
      <Button type="button" variant="ghost" size="sm" aria-pressed={weekView} onClick={onWeekChange}>{weekView ? "Day view" : "Week view"}</Button>
    </CardHeader>
    <CardContent>
      {weekView ? <div className="pulih-week-view" aria-label="Weekly clinic overview">
        <h4>Weekly clinic overview</h4>
        <div className="pulih-week-days">{weekDays.map((item) => <article className="pulih-week-day" key={item.day}>
          <div><strong>{item.day}</strong><span>Oct {item.date}</span></div>
          <strong className="pulih-week-count">{item.count}<small>visits</small></strong>
          <span className="pulih-week-track"><i style={{ width: `${item.load}%` }} /></span>
          <small>{item.note}</small>
        </article>)}</div>
      </div> : <div className="pulih-schedule-scroll"><div className="pulih-schedule-grid">
        <div className="pulih-time-column"><span className="pulih-time-spacer" />{hours.map((hour) => <span key={hour}>{hour}</span>)}</div>
        {doctors.map((doctor, index) => <section className="pulih-doctor-lane" key={doctor}>
          <div className="pulih-doctor-heading"><span className={`pulih-avatar is-${doctorsMeta[index]!.tone}`}>{doctorsMeta[index]!.initials}</span><span><strong>{doctor}</strong><small>{doctorsMeta[index]!.specialty}</small></span></div>
          <div className="pulih-lane-events">{appointments.filter((item) => item.provider === doctor).slice(0, 5).map((item) => <button type="button" key={item.id} className={`pulih-schedule-event is-${index}`} onClick={() => onOpenAppointment(item)}><strong>{item.patient}</strong><small>{item.time} · {item.reason}</small></button>)}{index === 0 && <div className="pulih-now-line"><span>10:24</span></div>}{index === 1 && <div className="pulih-break-event">Lunch break · 12:15–13:00</div>}</div>
        </section>)}
      </div></div>}
      <div className="pulih-schedule-legend"><span><i className="is-teal" />General</span><span><i className="is-mint" />Paediatrics</span><span><i className="is-violet" />Dermatology</span><span className="pulih-sample-label">Fictional schedule data</span></div>
    </CardContent>
  </Card>;
}

function QueueCard({ queue }: { queue: string[] }) {
  return <Card className="pulih-queue-card"><CardHeader className="pulih-section-heading"><div><CardTitle>Queue</CardTitle><p>Live sample queue</p></div><StatusPill tone="amber">{queue.length + 1} waiting</StatusPill></CardHeader><CardContent><div className="pulih-now-serving"><span>Now serving · Room 1</span><strong>A-014</strong><span>Rina Kartika <small>since 10:15</small></span></div><div className="pulih-queue-list">{queue.slice(0, 6).map((name, index) => <div className="pulih-queue-row" key={`${name}-${index}`}><span className="pulih-queue-code">{index === 2 ? "C-004" : `A-${String(index + 15).padStart(3, "0")}`}</span><span><strong>{name}</strong><small>{["Cough, 3 days · BPJS", "Skin rash · Paediatrics", "Mole check · Derm", "Teleconsult · 11:15", "Immunisation · Paediatrics"][index % 5]}</small></span><strong className="pulih-wait-time">{12 - index * 2 > 0 ? `${12 - index * 2} min` : "Online"}<small>waiting</small></strong></div>)}</div></CardContent></Card>;
}

function LabResultsPage({ filter, onFilterChange, onFullReport, onOpenPatient }: { filter: string; onFilterChange: (filter: string) => void; onFullReport: () => void; onOpenPatient: () => void }) {
  const rows = filter === "Needs review" ? labRows.filter((row) => row.tone !== "normal") : labRows;
  return <><PageHeading eyebrow="Clinical workspace" title="Lab results" description="Review incoming results and flag anything that needs follow-up." action={<Button onClick={onFullReport}><FileText size={16} aria-hidden="true" />Open full report</Button>} /><div className="pulih-filter-row" role="group" aria-label="Filter lab results">{["All results", "Needs review", "Normal"].map((item) => <Button key={item} type="button" variant={filter === item ? "secondary" : "ghost"} aria-pressed={filter === item} onClick={() => onFilterChange(item)}>{item}</Button>)}</div><Card className="pulih-list-card"><CardHeader className="pulih-section-heading"><div><CardTitle>Today · Oct 19</CardTitle><p>Fictional sample results from Kemang Clinic</p></div><StatusPill tone="amber">{labRows.filter((row) => row.tone !== "normal").length} needs review</StatusPill></CardHeader><CardContent className="pulih-table-content"><div className="pulih-lab-page-list">{rows.filter((row) => filter !== "Normal" || row.tone === "normal").map((row) => <div className="pulih-lab-page-row" key={row.name}><span className="pulih-lab-kind"><FlaskConical size={17} aria-hidden="true" /></span><span className="pulih-row-copy"><strong>{row.name}</strong><small>Rina Kartika · {row.range}</small></span><strong className={`is-${row.tone}`}>{row.name === "HbA1c" ? "7.2%" : row.value}</strong><StatusPill tone={row.tone === "normal" ? "mint" : "amber"}>{row.tone === "normal" ? "Normal" : "Review"}</StatusPill><Button type="button" variant="outline" size="sm" onClick={onOpenPatient}>Open chart</Button></div>)}</div></CardContent></Card></>;
}

function PharmacyPage({ medications, onPrescription, onRefill }: { medications: Medication[]; onPrescription: () => void; onRefill: (name: string) => void }) {
  return <><PageHeading eyebrow="Medication management" title="Pharmacy" description="Review current prescriptions and local refill requests." action={<Button onClick={onPrescription}><Plus size={16} aria-hidden="true" />Write prescription</Button>} /><section className="pulih-stat-grid is-three"><MetricCard icon={<Pill />} label="Active prescriptions" value={String(medications.length)} note="Across 4 patients" tone="teal" /><MetricCard icon={<Clock3 />} label="Refills due soon" value="3" note="Next 7 days" tone="amber" /><MetricCard icon={<CheckCircle2 />} label="Fulfilled today" value="12" note="Local sample count" tone="mint" /></section><Card className="pulih-list-card"><CardHeader className="pulih-section-heading"><div><CardTitle>Patient medications</CardTitle><p>Medication records are fictional and session-only.</p></div><Badge className="pulih-chip is-muted">Kemang Clinic</Badge></CardHeader><CardContent className="pulih-table-content"><div className="pulih-appointment-list">{medications.map((item) => <div className="pulih-appointment-row" key={`${item.name}-${item.dose}`}><span className={`pulih-med-icon is-${item.tone}`}><Pill size={17} aria-hidden="true" /></span><span className="pulih-row-copy"><strong>{item.name} {item.dose}</strong><small>{item.schedule} · Rina Kartika · {item.refill}</small></span><Button variant="outline" size="sm" onClick={() => onRefill(item.name)}>{item.refill === "Refill requested" ? "Requested" : "Request refill"}</Button></div>)}</div></CardContent></Card></>;
}

function BillingPage({ claims, onUpdate }: { claims: Claim[]; onUpdate: (id: string, status: Claim["status"]) => void }) {
  return <><PageHeading eyebrow="Clinic administration" title="Billing & claims" description="Track fictional payer claims and local payment status." action={<Button variant="outline" onClick={() => downloadReport(() => undefined)}><Download size={16} aria-hidden="true" />Export claims</Button>} /><section className="pulih-stat-grid is-three"><MetricCard icon={<FileCheck2 />} label="Ready to submit" value={String(claims.filter((claim) => claim.status === "Ready").length)} note="Requires clinic review" tone="amber" /><MetricCard icon={<Clock3 />} label="In review" value={String(claims.filter((claim) => claim.status === "Submitted").length)} note="Payer response pending" tone="violet" /><MetricCard icon={<CheckCircle2 />} label="Paid this month" value="Rp 8.4 jt" note="Illustrative total" tone="mint" /></section><Card className="pulih-list-card"><CardHeader className="pulih-section-heading"><div><CardTitle>Recent claims</CardTitle><p>Sample billing activity · no payer integration</p></div><StatusPill tone="teal">{claims.length} claims</StatusPill></CardHeader><CardContent className="pulih-table-content"><div className="pulih-claim-list">{claims.map((claim) => <div className="pulih-claim-row" key={claim.id}><span className="pulih-claim-icon"><CreditCard size={18} aria-hidden="true" /></span><span className="pulih-row-copy"><strong>{claim.patient} · {claim.service}</strong><small>{claim.id} · {claim.amount}</small></span><StatusPill tone={claim.status === "Paid" ? "mint" : claim.status === "Submitted" ? "violet" : "amber"}>{claim.status}</StatusPill>{claim.status === "Ready" ? <Button size="sm" onClick={() => onUpdate(claim.id, "Submitted")}>Submit</Button> : claim.status === "Submitted" ? <Button size="sm" variant="outline" onClick={() => onUpdate(claim.id, "Paid")}>Mark paid</Button> : <CheckCircle2 className="pulih-paid-icon" size={19} aria-label="Paid" />}</div>)}</div></CardContent></Card></>;
}

function ReportsPage({ range, onRangeChange, onDownload }: { range: string; onRangeChange: (range: string) => void; onDownload: () => void }) {
  const visits = range === "Last 30 days" ? [64, 76, 83, 71, 93, 88, 104] : range === "This quarter" ? [56, 72, 79, 90, 102, 111, 118] : [72, 86, 79, 98, 91, 112, 118];
  return <><PageHeading eyebrow="Clinic analytics" title="Reports" description="A quick view of clinic activity. All values are illustrative." action={<Button onClick={onDownload}><Download size={16} aria-hidden="true" />Download report</Button>} /><div className="pulih-report-controls"><span>Reporting period</span><Select value={range} onValueChange={onRangeChange}><SelectTrigger aria-label="Reporting period"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="This month">This month</SelectItem><SelectItem value="Last 30 days">Last 30 days</SelectItem><SelectItem value="This quarter">This quarter</SelectItem></SelectContent></Select></div><section className="pulih-stat-grid is-three"><MetricCard icon={<Users />} label="Patients seen" value="426" note="+8.4% vs last month" tone="teal" /><MetricCard icon={<CalendarDays />} label="Appointments" value="512" note="86% attendance" tone="violet" /><MetricCard icon={<Clock3 />} label="Average wait" value="14 min" note="6 min below target" tone="mint" /></section><Card className="pulih-report-chart-card"><CardHeader className="pulih-section-heading"><div><CardTitle>Visit volume</CardTitle><p>{range} · sample activity by week</p></div><StatusPill tone="mint"><ArrowUpRight size={14} aria-hidden="true" />8.4%</StatusPill></CardHeader><CardContent><div className="pulih-bar-chart" role="img" aria-label={`Weekly clinic visits: ${visits.join(", ")}`}><div className="pulih-bar-y-axis"><span>120</span><span>80</span><span>40</span><span>0</span></div>{visits.map((value, index) => <div className="pulih-bar-column" key={index}><span style={{ height: `${value / 1.2}%` }} /><small>{["Sep 28", "Oct 5", "Oct 12", "Oct 19", "Oct 26", "Nov 2", "Nov 9"][index]}</small></div>)}</div></CardContent></Card></>;
}

function MetricCard({ icon, label, value, note, tone }: { icon: React.ReactNode; label: string; value: string; note: string; tone: string }) {
  return <Card className="pulih-metric-card"><CardContent><span className={`pulih-metric-icon is-${tone}`}>{icon}</span><span className="pulih-metric-label">{label}</span><strong>{value}</strong><small>{note}</small></CardContent></Card>;
}

function PageHeading({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: React.ReactNode }) {
  return <div className="pulih-page-heading"><div><p className="pulih-eyebrow">{eyebrow}</p><h1>{title}</h1><p>{description}</p></div>{action && <div className="pulih-heading-actions">{action}</div>}</div>;
}

function StatusPill({ tone, children }: { tone: string; children: React.ReactNode }) {
  return <span className={`pulih-status is-${tone}`}>{children}</span>;
}

function VisitRow({ date, title, note: detail }: { date: string; title: string; note: string }) {
  return <div className="pulih-visit-row"><span><strong>{title}</strong><small>{detail}</small></span><time>{date}</time></div>;
}

function TeamMember({ initials: letters, name, role, color }: { initials: string; name: string; role: string; color: string }) {
  return <div className="pulih-team-member"><span className={`pulih-avatar is-${color}`}>{letters}</span><span><strong>{name}</strong><small>{role}</small></span><StatusPill tone="mint">On duty</StatusPill></div>;
}

function initials(name: string) { return name.split(/[ ,]+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase(); }

function downloadReport(notify: (title: string, description?: string) => void) {
  const content = `Patient,Visit,Status\r\nRina Kartika,Diabetes follow-up,Sample\r\nBudi Santoso,Annual check-up,Sample`;
  const url = URL.createObjectURL(new Blob([`\uFEFF${content}`], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "pulih-sample-clinic-report.csv";
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  notify("Report downloaded", "CSV contains fictional sample data only.");
}

export default PulihClinicWorkspace;

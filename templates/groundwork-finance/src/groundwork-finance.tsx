import * as React from "react";
import {
  ArrowDownRight,
  ArrowLeftRight,
  ArrowRight,
  ArrowUpRight,
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  ChevronDown,
  CircleHelp,
  Clock3,
  CreditCard,
  Download,
  FileText,
  Landmark,
  Mail,
  Menu,
  MoreHorizontal,
  Moon,
  PiggyBank,
  Plus,
  Receipt,
  Search,
  Settings,
  ShieldCheck,
  Sun,
  Wallet,
  X
} from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  ConfirmDialog,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Textarea,
  Toast,
  ToastProvider,
  useTheme
} from "@design-templates/ui";
import "./groundwork-finance.css";

type Page = "Overview" | "Autopay" | "Bills" | "Duty & tax" | "Cash flow" | "Reports" | "Projects" | "Suppliers" | "Settings" | "Help";
type BillStatus = "Needs review" | "Approved" | "Paid";
type Rule = { id: string; name: string; supplier: string; category: string; day: number; amount: number; cadence: string; account: string; active: boolean; capped: boolean };
type Bill = { id: string; supplier: string; initials: string; detail: string; project: string; due: string; amount: number; status: BillStatus };
type Invoice = { id: string; customer: string; detail: string; sent: string; amount: number; status: "Draft" | "Sent" | "Paid" };
type Account = { id: string; name: string; bank: string; balance: number; kind: string };
type Project = { id: string; name: string; detail: string; owner: string; due: string; spent: number; committed: number; budget: number; status: "Planned" | "In progress" | "Wrapping up" | "Done" };
type Supplier = { id: string; name: string; town: string; category: string; paid: number; email: string };
type DialogKind = "bill" | "invoice" | "supplier" | "project" | "rule" | "transfer" | "top-up" | "sweep" | null;

const pages: Array<{ id: Page; icon: typeof Wallet }> = [
  { id: "Overview", icon: Wallet }, { id: "Autopay", icon: CalendarDays }, { id: "Bills", icon: Receipt },
  { id: "Duty & tax", icon: Landmark }, { id: "Cash flow", icon: ArrowLeftRight }, { id: "Reports", icon: FileText },
  { id: "Projects", icon: BriefcaseBusiness }, { id: "Suppliers", icon: CreditCard }, { id: "Settings", icon: Settings }, { id: "Help", icon: CircleHelp }
];

const initialAccounts: Account[] = [
  { id: "operating", name: "Operating", bank: "Moorland Bank ··2048", balance: 64820, kind: "Current account" },
  { id: "reserve", name: "Reserve", bank: "Moorland Bank ··7781", balance: 96250, kind: "Savings account" },
  { id: "duty", name: "Duty pot", bank: "Moorland Bank ··5529", balance: 12380, kind: "Tax set-aside" },
  { id: "vat", name: "VAT pot", bank: "Moorland Bank ··5536", balance: 8950, kind: "Tax set-aside" },
  { id: "card", name: "Team card", bank: "Groundwork ··1184", balance: 5490, kind: "Company card" }
];

const initialRules: Rule[] = [
  { id: "r1", name: "Seasonal ingredients", supplier: "Moorland Provisions", category: "Materials", day: 12, amount: 1860, cadence: "Monthly", account: "Operating", active: true, capped: false },
  { id: "r2", name: "Workshop lease", supplier: "Foundry Estates", category: "Premises", day: 1, amount: 4120, cadence: "Monthly", account: "Operating", active: true, capped: false },
  { id: "r3", name: "Cloud workspace", supplier: "Paperkite Software", category: "Software", day: 10, amount: 86, cadence: "Monthly", account: "Team card", active: true, capped: false },
  { id: "r4", name: "Courier collection", supplier: "Northway Freight", category: "Logistics", day: 3, amount: 520, cadence: "Weekly", account: "Operating", active: false, capped: true }
];

const initialBills: Bill[] = [
  { id: "CW-401", supplier: "Grey Slate Print", initials: "GS", detail: "Spring packaging run · 8,000 cartons", project: "Packaging refresh", due: "20 Nov", amount: 2840, status: "Needs review" },
  { id: "MP-118", supplier: "Moorland Provisions", initials: "MP", detail: "Dry goods and pantry stock", project: "Seasonal launch", due: "22 Nov", amount: 1675, status: "Needs review" },
  { id: "NF-223", supplier: "Northway Freight", initials: "NF", detail: "Regional delivery · 14 pallets", project: "Warehouse", due: "25 Nov", amount: 540, status: "Approved" },
  { id: "OF-091", supplier: "Openfield Utilities", initials: "OF", detail: "Workshop electricity · October", project: "Operations", due: "12 Nov", amount: 462, status: "Paid" }
];

const initialInvoices: Invoice[] = [
  { id: "INV-108", customer: "Riverside Market", detail: "November stock · 12 cases", sent: "14 Nov", amount: 1280, status: "Sent" },
  { id: "INV-107", customer: "Market Yard Café", detail: "Seasonal order · 8 cases", sent: "12 Nov", amount: 840, status: "Paid" },
  { id: "INV-106", customer: "The Little Larder", detail: "Weekly delivery · 6 cases", sent: "Draft", amount: 625, status: "Draft" }
];

const initialProjects: Project[] = [
  { id: "p1", name: "Packaging refresh", detail: "New recyclable cartons for the winter range.", owner: "Nia · due 18 Dec", due: "18 Dec", spent: 2960, committed: 840, budget: 9400, status: "In progress" },
  { id: "p2", name: "Workshop fit-out", detail: "Improve dispatch flow and add a packing bench.", owner: "Rory · due 29 Jan", due: "29 Jan", spent: 14200, committed: 2100, budget: 28000, status: "In progress" },
  { id: "p3", name: "Cedarfield solar", detail: "Compare local quotes for a rooftop array.", owner: "Ari · due 30 Jun", due: "30 Jun", spent: 0, committed: 0, budget: 38500, status: "Planned" },
  { id: "p4", name: "Seasonal launch", detail: "Small-batch winter release for local shops.", owner: "Nia · due 4 Dec", due: "4 Dec", spent: 1820, committed: 390, budget: 6800, status: "Wrapping up" },
  { id: "p5", name: "Cold room repair", detail: "Replace seals and recalibrate the temperature unit.", owner: "Rory · finished", due: "Finished", spent: 4210, committed: 0, budget: 5200, status: "Done" }
];

const initialSuppliers: Supplier[] = [
  { id: "s1", name: "Moorland Provisions", town: "York", category: "Materials", paid: 58240, email: "accounts@moorland.example" },
  { id: "s2", name: "Foundry Estates", town: "Leeds", category: "Premises", paid: 37500, email: "billing@foundry.example" },
  { id: "s3", name: "Grey Slate Print", town: "Sheffield", category: "Packaging", paid: 14630, email: "studio@greyslate.example" },
  { id: "s4", name: "Openfield Utilities", town: "York", category: "Utilities", paid: 12991, email: "help@openfield.example" },
  { id: "s5", name: "Paperkite Software", town: "Bristol", category: "Software", paid: 2340, email: "care@paperkite.example" },
  { id: "s6", name: "Northway Freight", town: "Hull", category: "Logistics", paid: 8920, email: "ops@northway.example" }
];

const categories = ["All", "Materials", "Packaging", "Premises", "Utilities", "Software", "Logistics"];
const money = (amount: number) => `£${Math.round(amount).toLocaleString("en-GB")}`;
const today = [
  { day: "MON", date: "16", payments: ["£186 · Paperkite"] }, { day: "TUE", date: "17", payments: ["£1.8k · Moorland"] },
  { day: "WED", date: "18", payments: ["—"] }, { day: "THU", date: "19", payments: ["£4.1k · Foundry"] },
  { day: "FRI", date: "20", payments: ["£2.8k · Grey Slate", "£540 · Northway"] }, { day: "SAT", date: "21", payments: ["—"] },
  { day: "SUN", date: "22", payments: ["£1.6k · Moorland"] }
];

export function csvText(rows: string[][]) {
  return `\uFEFF${rows.map((row) => row.map((cell) => {
    const safe = /^[\s]*[=+@-]/.test(cell) ? `'${cell}` : cell;
    return `"${safe.replaceAll('"', '""')}"`;
  }).join(",")).join("\r\n")}`;
}

function saveCsv(fileName: string, rows: string[][]) {
  const url = URL.createObjectURL(new Blob([csvText(rows)], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

export function GroundworkFinance() {
  return <ToastProvider><GroundworkWorkspace /></ToastProvider>;
}

function GroundworkWorkspace() {
  const { theme, toggleTheme, setTheme } = useTheme();
  const themeBeforePreview = React.useRef(theme);
  const [page, setPage] = React.useState<Page>("Overview");
  const [dialog, setDialog] = React.useState<DialogKind>(null);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [notificationsOpen, setNotificationsOpen] = React.useState(false);
  const [moreOpen, setMoreOpen] = React.useState(false);
  const [resetOpen, setResetOpen] = React.useState(false);
  const [toast, setToast] = React.useState({ open: false, title: "" });
  const [query, setQuery] = React.useState("");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [accounts, setAccounts] = React.useState(initialAccounts);
  const [rules, setRules] = React.useState(initialRules);
  const [bills, setBills] = React.useState(initialBills);
  const [invoices, setInvoices] = React.useState(initialInvoices);
  const [projects, setProjects] = React.useState(initialProjects);
  const [suppliers, setSuppliers] = React.useState(initialSuppliers);
  const [activeSupplier, setActiveSupplier] = React.useState<Supplier | null>(null);
  const [selectedBills, setSelectedBills] = React.useState<string[]>([]);
  const [billTab, setBillTab] = React.useState<"Bills" | "Invoices">("Bills");
  const [billFilter, setBillFilter] = React.useState("All bills");
  const [autopayTab, setAutopayTab] = React.useState("Rules");
  const [ruleFilter, setRuleFilter] = React.useState("All");
  const [selectedRuleId, setSelectedRuleId] = React.useState(initialRules[0].id);
  const [ruleDay, setRuleDay] = React.useState("12");
  const [ruleCadence, setRuleCadence] = React.useState("Monthly");
  const [ruleAmount, setRuleAmount] = React.useState("1860");
  const [ruleAccount, setRuleAccount] = React.useState("Operating");
  const [ruleCapped, setRuleCapped] = React.useState(false);
  const [cashTab, setCashTab] = React.useState("Forecast");
  const [forecastWeeks, setForecastWeeks] = React.useState(13);
  const [takingsChange, setTakingsChange] = React.useState(0);
  const [taxTab, setTaxTab] = React.useState("Set-aside");
  const [taxSweep, setTaxSweep] = React.useState(true);
  const [taxAmount, setTaxAmount] = React.useState("14");
  const [reportTab, setReportTab] = React.useState("Spend");
  const [reportCategory, setReportCategory] = React.useState("All categories");
  const [reportReady, setReportReady] = React.useState(false);
  const [reportFrom, setReportFrom] = React.useState("2026-09-01");
  const [reportTo, setReportTo] = React.useState("2026-11-30");
  const [projectTab, setProjectTab] = React.useState("Board");
  const [draggedProject, setDraggedProject] = React.useState<string | null>(null);
  const [supplierFilter, setSupplierFilter] = React.useState("All");
  const [supplierSort, setSupplierSort] = React.useState("Most paid");
  const [workspaceName, setWorkspaceName] = React.useState("Alder Grove Works");
  const [approvalLimit, setApprovalLimit] = React.useState("2500");
  const [settingsTab, setSettingsTab] = React.useState("Business");
  const [weeklyDigest, setWeeklyDigest] = React.useState(true);
  const [faqOpen, setFaqOpen] = React.useState(0);
  const [supportDraft, setSupportDraft] = React.useState("");
  const [draftName, setDraftName] = React.useState("");
  const [draftAmount, setDraftAmount] = React.useState("");
  const [draftDetail, setDraftDetail] = React.useState("");
  const [draftCategory, setDraftCategory] = React.useState("Materials");
  const [transferFrom, setTransferFrom] = React.useState("Operating");
  const [transferTo, setTransferTo] = React.useState("Reserve");

  const cashBalance = accounts.filter((account) => account.id !== "card").reduce((sum, account) => sum + account.balance, 0);
  const outThisMonth = bills.filter((bill) => bill.status !== "Paid").reduce((sum, bill) => sum + bill.amount, 0) + 14520;
  const safeToSpend = Math.max(0, cashBalance - 108900 - outThisMonth);
  const selectedRule = rules.find((rule) => rule.id === selectedRuleId) ?? rules[0];
  const visibleBills = bills.filter((bill) => (billFilter === "All bills" || bill.status === billFilter) && `${bill.supplier} ${bill.detail} ${bill.project} ${bill.id}`.toLowerCase().includes(query.toLowerCase()));
  const visibleRules = rules.filter((rule) => (ruleFilter === "All" || rule.category === ruleFilter) && `${rule.name} ${rule.supplier} ${rule.category}`.toLowerCase().includes(query.toLowerCase()));
  const visibleSuppliers = suppliers.filter((supplier) => (supplierFilter === "All" || supplier.category === supplierFilter) && `${supplier.name} ${supplier.town} ${supplier.category}`.toLowerCase().includes(query.toLowerCase())).sort((a, b) => supplierSort === "A–Z" ? a.name.localeCompare(b.name) : b.paid - a.paid);
  const matchingPages = pages.filter((item) => `${item.id} ${item.id === "Cash flow" ? "forecast accounts" : ""} ${item.id === "Duty & tax" ? "filings" : ""}`.toLowerCase().includes(searchQuery.toLowerCase()));
  const matchingRecords = [
    ...bills.map((item) => ({ label: item.supplier, detail: `${item.id} · ${item.detail}`, page: "Bills" as Page, tab: "Bills", search: item.supplier })),
    ...invoices.map((item) => ({ label: item.customer, detail: `${item.id} · ${item.detail}`, page: "Bills" as Page, tab: "Invoices", search: item.customer })),
    ...rules.map((item) => ({ label: item.name, detail: `${item.supplier} · ${item.category}`, page: "Autopay" as Page, tab: "Rules", search: item.name })),
    ...suppliers.map((item) => ({ label: item.name, detail: `${item.category} · ${item.town}`, page: "Suppliers" as Page, tab: "", search: item.name })),
    ...projects.map((item) => ({ label: item.name, detail: `${item.status} · ${item.owner}`, page: "Projects" as Page, tab: "Board", search: item.name }))
  ].filter((item) => searchQuery.trim().length > 0 && `${item.label} ${item.detail}`.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 8);

  function notify(title: string) { setToast({ open: true, title }); }
  function navigate(nextPage: Page) {
    setPage(nextPage); setQuery(""); setMoreOpen(false);
    if (nextPage === "Bills") setBillTab("Bills");
    if (nextPage === "Autopay") setAutopayTab("Rules");
    if (nextPage === "Cash flow") setCashTab("Forecast");
  }
  function openSearchRecord(record: (typeof matchingRecords)[number]) {
    navigate(record.page);
    if (record.tab === "Invoices") setBillTab("Invoices");
    if (record.tab === "Rules") setAutopayTab("Rules");
    setQuery(record.search);
    setSearchOpen(false);
    setSearchQuery("");
  }
  function openDialog(kind: Exclude<DialogKind, null>) {
    setDraftName(""); setDraftAmount(kind === "transfer" ? "500" : "1200"); setDraftDetail(""); setDraftCategory("Materials"); setDialog(kind);
  }

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault(); setSearchOpen(true); }
      if (event.key === "Escape") setMoreOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  React.useEffect(() => {
    setTheme("light");
    return () => setTheme(themeBeforePreview.current);
  }, [setTheme]);

  function saveRule() {
    if (!selectedRule) return;
    setRules((current) => current.map((rule) => rule.id === selectedRule.id ? { ...rule, day: Number(ruleDay), cadence: ruleCadence, amount: Number(ruleAmount), account: ruleAccount, capped: ruleCapped } : rule));
    notify("Payment rule saved in this preview.");
  }

  function toggleBill(id: string, status: BillStatus) {
    setBills((current) => current.map((bill) => bill.id === id ? { ...bill, status } : bill));
    setSelectedBills((current) => current.filter((billId) => billId !== id));
    notify(`Sample bill marked ${status.toLowerCase()}.`);
  }

  function submitDialog(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const amount = Math.max(0, Number(draftAmount));
    if (dialog === "bill") {
      const supplier = draftName.trim();
      setBills((current) => [{ id: `GW-${Date.now().toString().slice(-4)}`, supplier, initials: supplier.slice(0, 2).toUpperCase(), detail: draftDetail.trim() || "New sample bill", project: "Operations", due: "30 Nov", amount, status: "Needs review" }, ...current]);
      setBillTab("Bills"); setPage("Bills"); notify("Sample bill added to review.");
    } else if (dialog === "invoice") {
      const customer = draftName.trim();
      setInvoices((current) => [{ id: `INV-${Date.now().toString().slice(-3)}`, customer, detail: draftDetail.trim() || "New sample invoice", sent: "Draft", amount, status: "Draft" }, ...current]);
      setBillTab("Invoices"); setPage("Bills"); notify("Draft invoice created locally.");
    } else if (dialog === "supplier") {
      const name = draftName.trim();
      setSuppliers((current) => [{ id: `s-${Date.now()}`, name, town: draftDetail.trim() || "Not set", category: draftCategory, paid: 0, email: "Not provided" }, ...current]);
      setPage("Suppliers"); notify("Sample supplier added.");
    } else if (dialog === "project") {
      const name = draftName.trim();
      setProjects((current) => [{ id: `p-${Date.now()}`, name, detail: draftDetail.trim() || "New local project.", owner: "You · due 31 Jan", due: "31 Jan", spent: 0, committed: 0, budget: amount, status: "Planned" }, ...current]);
      setProjectTab("Board"); setPage("Projects"); notify("Sample project added to the board.");
    } else if (dialog === "rule") {
      const name = draftName.trim();
      const supplier = draftDetail.trim() || name;
      const rule: Rule = { id: `r-${Date.now()}`, name, supplier, category: draftCategory, day: 15, amount, cadence: "Monthly", account: "Operating", active: true, capped: false };
      setRules((current) => [rule, ...current]); setSelectedRuleId(rule.id); setRuleDay("15"); setRuleCadence("Monthly"); setRuleAmount(String(amount)); setRuleAccount("Operating"); setRuleCapped(false); setAutopayTab("Rules"); setPage("Autopay"); notify("Sample payment rule created.");
    } else if (dialog === "transfer") {
      if (transferFrom === transferTo) { notify("Choose two different accounts."); return; }
      setAccounts((current) => current.map((account) => account.name === transferFrom ? { ...account, balance: account.balance - amount } : account.name === transferTo ? { ...account, balance: account.balance + amount } : account));
      notify(`${money(amount)} moved between sample accounts.`);
    } else if (dialog === "top-up" || dialog === "sweep") {
      const targetId = draftCategory === "VAT" ? "vat" : "duty";
      setAccounts((current) => current.map((account) => account.id === targetId ? { ...account, balance: account.balance + amount } : account));
      notify(`${money(amount)} added to the ${draftCategory === "VAT" ? "VAT" : "duty"} sample pot.`);
    }
    setDialog(null);
  }

  function resetDemo() {
    setAccounts(initialAccounts); setRules(initialRules); setBills(initialBills); setInvoices(initialInvoices); setProjects(initialProjects); setSuppliers(initialSuppliers);
    setWorkspaceName("Alder Grove Works"); setApprovalLimit("2500"); setWeeklyDigest(true); setTaxAmount("14"); setTaxSweep(true);
    setSelectedBills([]); setResetOpen(false); notify("Sample data reset for this session.");
  }

  function exportBills() {
    saveCsv("groundwork-sample-bills.csv", [["Reference", "Supplier", "Description", "Project", "Due", "Status", "Amount"], ...visibleBills.map((bill) => [bill.id, bill.supplier, bill.detail, bill.project, bill.due, bill.status, String(bill.amount)])]);
    notify("Sample bill report downloaded.");
  }

  const fieldDialog = dialog !== null && dialog !== "transfer" && dialog !== "top-up" && dialog !== "sweep";
  const dialogTitle = dialog === "bill" ? "Add a bill" : dialog === "invoice" ? "New invoice" : dialog === "supplier" ? "Add a supplier" : dialog === "project" ? "New project" : "Create a payment rule";

  return <div className="groundwork-finance">
    <a className="gw-skip" href="#gw-main">Skip to content</a>
    <div className="gw-shell">
      <header className="gw-topbar">
        <button className="gw-brand" onClick={() => navigate("Overview")} aria-label="Groundwork Finance overview"><span className="gw-brand-mark"><Check size={16} /></span><span>groundwork<span className="gw-brand-dot">.</span><small>FINANCE WORKSPACE</small></span></button>
        <nav className="gw-primary-nav" aria-label="Primary navigation">
          {pages.slice(0, 8).map(({ id, icon: Icon }) => <button key={id} className={page === id ? "is-active" : ""} onClick={() => navigate(id)} aria-current={page === id ? "page" : undefined}><Icon size={15} /><span>{id}</span>{id === "Bills" && bills.filter((bill) => bill.status === "Needs review").length > 0 && <i>{bills.filter((bill) => bill.status === "Needs review").length}</i>}</button>)}
        </nav>
        <div className="gw-top-actions">
          <Button variant="ghost" size="icon" aria-label="Search everything" onClick={() => setSearchOpen(true)}><Search size={17} /></Button>
          <Button variant="ghost" size="icon" aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`} onClick={toggleTheme}>{theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}</Button>
          <Button variant="ghost" size="icon" aria-label="Notifications" onClick={() => setNotificationsOpen(true)}><Bell size={17} /><i className="gw-notice-dot" /></Button>
          <Button variant="ghost" size="icon" aria-label="Help & support" onClick={() => navigate("Help")}><CircleHelp size={17} /></Button>
          <button className="gw-profile" onClick={() => navigate("Settings")} aria-label="Open settings"><span>NP</span><b>Nia Parker<small>Finance lead</small></b></button>
          <Button variant="ghost" size="icon" aria-label="Settings" onClick={() => navigate("Settings")}><Settings size={17} /></Button>
        </div>
      </header>

      <main className="gw-content" id="gw-main" key={page}>
        {page === "Overview" && <OverviewPage cashBalance={cashBalance} outThisMonth={outThisMonth} safeToSpend={safeToSpend} bills={bills} onNavigate={navigate} onAddBill={() => openDialog("bill")} onApprove={(id) => toggleBill(id, "Approved")} onAutopay={() => navigate("Autopay")} />}
        {page === "Autopay" && <AutopayPage rules={visibleRules} allRules={rules} tab={autopayTab} setTab={setAutopayTab} filter={ruleFilter} setFilter={setRuleFilter} selected={selectedRule} onSelect={(rule) => { setSelectedRuleId(rule.id); setRuleDay(String(rule.day)); setRuleCadence(rule.cadence); setRuleAmount(String(rule.amount)); setRuleAccount(rule.account); setRuleCapped(rule.capped); }} onToggle={(id, active) => setRules((current) => current.map((rule) => rule.id === id ? { ...rule, active } : rule))} onAdd={() => openDialog("rule")} onSave={saveRule} day={ruleDay} setDay={setRuleDay} cadence={ruleCadence} setCadence={setRuleCadence} amount={ruleAmount} setAmount={setRuleAmount} account={ruleAccount} setAccount={setRuleAccount} capped={ruleCapped} setCapped={setRuleCapped} accounts={accounts} approvalLimit={approvalLimit} notify={notify} />}
        {page === "Bills" && <BillsPage bills={visibleBills} allBills={bills} invoices={invoices} tab={billTab} setTab={setBillTab} filter={billFilter} setFilter={setBillFilter} selected={selectedBills} setSelected={setSelectedBills} onAddBill={() => openDialog("bill")} onAddInvoice={() => openDialog("invoice")} onToggleBill={toggleBill} onBulkApprove={() => { setBills((current) => current.map((bill) => selectedBills.includes(bill.id) ? { ...bill, status: "Approved" } : bill)); setSelectedBills([]); notify("Selected sample bills approved."); }} onInvoiceStatus={(id, status) => { setInvoices((current) => current.map((invoice) => invoice.id === id ? { ...invoice, status } : invoice)); notify(`Sample invoice marked ${status.toLowerCase()}.`); }} onExport={exportBills} />}
        {page === "Cash flow" && <CashFlowPage accounts={accounts} cashBalance={cashBalance} tab={cashTab} setTab={setCashTab} weeks={forecastWeeks} setWeeks={setForecastWeeks} takings={takingsChange} setTakings={setTakingsChange} onMove={() => openDialog("transfer")} />}
        {page === "Duty & tax" && <TaxPage accounts={accounts} tab={taxTab} setTab={setTaxTab} sweep={taxSweep} setSweep={setTaxSweep} amount={taxAmount} setAmount={setTaxAmount} onTopUp={() => { setDraftCategory("Duty"); openDialog("top-up"); setDraftCategory("Duty"); }} onSweep={() => { setDraftCategory("Duty"); openDialog("sweep"); setDraftCategory("Duty"); }} notify={notify} />}
        {page === "Reports" && <ReportsPage tab={reportTab} setTab={setReportTab} category={reportCategory} setCategory={setReportCategory} from={reportFrom} setFrom={setReportFrom} to={reportTo} setTo={setReportTo} ready={reportReady} onBuild={() => { setReportReady(true); notify("Report refreshed from local sample data."); }} onDownload={() => { saveCsv("groundwork-spend-report.csv", [["Month", "Materials", "Operations", "Tax", "Total"], ["Sep", "12800", "9400", "6200", "28400"], ["Oct", "15400", "11200", "6800", "33400"], ["Nov", "13800", "10100", "7200", "31100"]]); notify("Sample spend report downloaded."); }} />}
        {page === "Projects" && <ProjectsPage projects={projects} tab={projectTab} setTab={setProjectTab} dragged={draggedProject} setDragged={setDraggedProject} onAdd={() => openDialog("project")} onMove={(id, status) => setProjects((current) => current.map((project) => project.id === id ? { ...project, status } : project))} />}
        {page === "Suppliers" && <SuppliersPage suppliers={visibleSuppliers} filter={supplierFilter} setFilter={setSupplierFilter} sort={supplierSort} setSort={setSupplierSort} onAdd={() => openDialog("supplier")} onSelect={setActiveSupplier} />}
        {page === "Settings" && <SettingsPage name={workspaceName} setName={setWorkspaceName} limit={approvalLimit} setLimit={setApprovalLimit} tab={settingsTab} setTab={setSettingsTab} digest={weeklyDigest} setDigest={setWeeklyDigest} theme={theme} toggleTheme={toggleTheme} onSave={() => notify("Workspace preferences saved in this preview.")} onReset={() => setResetOpen(true)} />}
        {page === "Help" && <HelpPage open={faqOpen} setOpen={setFaqOpen} draft={supportDraft} setDraft={setSupportDraft} onSubmit={(event) => { event.preventDefault(); setSupportDraft(""); notify("Sample support note saved in this browser session. No message was sent."); }} />}
      </main>

      <footer className="gw-footer"><span>Sample workspace · changes stay in this preview</span><span><ShieldCheck size={14} />No bank connection</span></footer>
      <nav className="gw-mobile-nav" aria-label="Mobile navigation">
        {["Overview", "Bills", "Cash flow"].map((id) => { const item = pages.find((entry) => entry.id === id)!; const Icon = item.icon; return <button key={id} className={page === id ? "is-active" : ""} onClick={() => navigate(item.id)} aria-current={page === item.id ? "page" : undefined}><Icon size={17} /><span>{id}</span></button>; })}
        <button className={moreOpen ? "is-active" : ""} onClick={() => setMoreOpen(true)} aria-label="More navigation"><Menu size={17} /><span>More</span></button>
      </nav>
    </div>

    <Dialog open={dialog !== null} onOpenChange={(open) => !open && setDialog(null)}>
      {dialog && <DialogContent className="gw-dialog" aria-describedby="gw-dialog-description">
        <DialogHeader><DialogTitle>{fieldDialog ? dialogTitle : dialog === "transfer" ? "Move money" : dialog === "top-up" ? "Top up a tax pot" : "Add to a set-aside pot"}</DialogTitle><DialogDescription id="gw-dialog-description">Sample workspace only. No payment, invoice, or external message will be sent.</DialogDescription></DialogHeader>
        <form className="gw-dialog-form" onSubmit={submitDialog}>
          {fieldDialog && <>
            <Label htmlFor="gw-draft-name">{dialog === "bill" ? "Supplier" : dialog === "invoice" ? "Customer" : dialog === "supplier" ? "Supplier name" : dialog === "project" ? "Project name" : "Rule name"}</Label>
            <Input id="gw-draft-name" value={draftName} onChange={(event) => setDraftName(event.target.value)} placeholder={dialog === "bill" ? "e.g. Grey Slate Print" : "Enter a name"} required maxLength={70} />
            <Label htmlFor="gw-draft-detail">{dialog === "bill" ? "What is this bill for?" : dialog === "invoice" ? "Invoice description" : dialog === "supplier" ? "Town or location" : dialog === "project" ? "Project summary" : "Supplier"}</Label>
            <Input id="gw-draft-detail" value={draftDetail} onChange={(event) => setDraftDetail(event.target.value)} placeholder="Optional details" maxLength={100} />
            {(dialog === "supplier" || dialog === "rule") && <><Label htmlFor="gw-draft-category">Category</Label><Select value={draftCategory} onValueChange={setDraftCategory}><SelectTrigger id="gw-draft-category"><SelectValue /></SelectTrigger><SelectContent>{categories.slice(1).map((category) => <SelectItem key={category} value={category}>{category}</SelectItem>)}</SelectContent></Select></>}
          </>}
          {dialog === "transfer" && <div className="gw-dialog-grid"><div><Label htmlFor="gw-transfer-from">From</Label><Select value={transferFrom} onValueChange={setTransferFrom}><SelectTrigger id="gw-transfer-from"><SelectValue /></SelectTrigger><SelectContent>{accounts.map((account) => <SelectItem key={account.id} value={account.name}>{account.name}</SelectItem>)}</SelectContent></Select></div><div><Label htmlFor="gw-transfer-to">To</Label><Select value={transferTo} onValueChange={setTransferTo}><SelectTrigger id="gw-transfer-to"><SelectValue /></SelectTrigger><SelectContent>{accounts.map((account) => <SelectItem key={account.id} value={account.name}>{account.name}</SelectItem>)}</SelectContent></Select></div></div>}
          {(dialog === "top-up" || dialog === "sweep") && <><Label htmlFor="gw-tax-pot">Add to</Label><Select value={draftCategory} onValueChange={setDraftCategory}><SelectTrigger id="gw-tax-pot"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Duty">Duty pot</SelectItem><SelectItem value="VAT">VAT pot</SelectItem></SelectContent></Select></>}
          <Label htmlFor="gw-draft-amount">{dialog === "project" ? "Project budget" : dialog === "rule" ? "Payment amount" : "Amount"}</Label>
          <div className="gw-currency-input"><span>£</span><Input id="gw-draft-amount" type="number" min="1" max="999999" step="1" value={draftAmount} onChange={(event) => setDraftAmount(event.target.value)} required /></div>
          <DialogFooter><Button type="button" variant="outline" onClick={() => setDialog(null)}>Cancel</Button><Button type="submit">{dialog === "bill" ? "Add bill" : dialog === "invoice" ? "Create draft" : dialog === "supplier" ? "Add supplier" : dialog === "project" ? "Add project" : dialog === "rule" ? "Save rule" : dialog === "transfer" ? "Move money" : "Add funds"}</Button></DialogFooter>
        </form>
      </DialogContent>}
    </Dialog>

    <Dialog open={searchOpen} onOpenChange={setSearchOpen}><DialogContent className="gw-dialog gw-search-dialog" aria-describedby="gw-search-description"><DialogHeader><DialogTitle>Search this workspace</DialogTitle><DialogDescription id="gw-search-description">Find a page or sample record. Use Ctrl/⌘ K to open search.</DialogDescription></DialogHeader><Label htmlFor="gw-global-search" className="gw-sr-only">Search pages and records</Label><Input id="gw-global-search" autoFocus value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Try bills, suppliers, or cash flow" /> <div className="gw-search-results">{matchingPages.map(({ id, icon: Icon }) => <button key={`page-${id}`} onClick={() => { navigate(id); setSearchOpen(false); setSearchQuery(""); }}><Icon size={17} /><span>{id}</span><ArrowRight size={14} /></button>)}{matchingRecords.map((record) => <button key={`${record.page}-${record.label}`} onClick={() => openSearchRecord(record)}><Search size={16} /><span><b>{record.label}</b><small>{record.detail}</small></span><ArrowRight size={14} /></button>)}{!matchingPages.length && !matchingRecords.length && <p>{searchQuery ? "No matching pages or sample records." : "Search pages, bills, rules, projects, or suppliers."}</p>}</div></DialogContent></Dialog>
    <Dialog open={notificationsOpen} onOpenChange={setNotificationsOpen}><DialogContent className="gw-dialog" aria-describedby="gw-notice-description"><DialogHeader><DialogTitle>Recent activity</DialogTitle><DialogDescription id="gw-notice-description">Illustrative updates from this sample workspace.</DialogDescription></DialogHeader><div className="gw-activity-list"><p><i /> <span><b>Grey Slate Print</b> bill needs review<small>Today · £2,840</small></span></p><p><i /> <span><b>Seasonal ingredients</b> rule runs tomorrow<small>Yesterday · Operating account</small></span></p><p><i /> <span><b>Riverside Market</b> invoice viewed<small>14 Nov · £1,280</small></span></p></div><DialogFooter><Button onClick={() => setNotificationsOpen(false)}>Done</Button></DialogFooter></DialogContent></Dialog>
    <Dialog open={moreOpen} onOpenChange={setMoreOpen}><DialogContent className="gw-dialog gw-more-dialog" aria-describedby="gw-more-description"><DialogHeader><DialogTitle>Workspace pages</DialogTitle><DialogDescription id="gw-more-description">Choose a section to continue.</DialogDescription></DialogHeader><nav className="gw-more-list" aria-label="More workspace pages">{pages.filter((item) => !["Overview", "Bills", "Cash flow"].includes(item.id)).map(({ id, icon: Icon }) => <button key={id} onClick={() => navigate(id)} aria-current={page === id ? "page" : undefined}><Icon size={17} /><span>{id}</span><ArrowRight size={14} /></button>)}</nav></DialogContent></Dialog>
    <Dialog open={activeSupplier !== null} onOpenChange={(open) => !open && setActiveSupplier(null)}>{activeSupplier && <DialogContent className="gw-dialog" aria-describedby="gw-supplier-description"><DialogHeader><DialogTitle>{activeSupplier.name}</DialogTitle><DialogDescription id="gw-supplier-description">Sample supplier · {activeSupplier.category}</DialogDescription></DialogHeader><div className="gw-detail-list"><span>Location</span><b>{activeSupplier.town}</b><span>Paid in the last six months</span><b>{money(activeSupplier.paid)}</b><span>Contact</span><b>{activeSupplier.email}</b></div><DialogFooter><Button variant="outline" onClick={() => setActiveSupplier(null)}>Close</Button><Button onClick={() => { notify("Supplier note prepared locally; no email was sent."); setActiveSupplier(null); }}><Mail size={15} />Prepare note</Button></DialogFooter></DialogContent>}</Dialog>
    <ConfirmDialog open={resetOpen} onOpenChange={setResetOpen} title="Reset sample workspace?" description="This clears local edits and restores the original demo data for this session." confirmLabel="Reset sample data" destructive onConfirm={resetDemo} />
    <Toast {...toast} description="Local preview feedback" onOpenChange={(open) => setToast((current) => ({ ...current, open }))} />
  </div>;
}

function PageHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description?: string; action?: React.ReactNode }) {
  return <div className="gw-page-header"><div><p className="gw-eyebrow">{eyebrow}</p><h1>{title}</h1>{description && <p className="gw-page-description">{description}</p>}</div>{action && <div className="gw-header-action">{action}</div>}</div>;
}

function Metric({ label, value, note, icon: Icon, tone = "plain" }: { label: string; value: string; note: string; icon: typeof Wallet; tone?: string }) {
  return <Card className={`gw-metric gw-metric-${tone}`}><CardContent><div className="gw-metric-head"><span>{label}</span><Icon size={16} /></div><strong>{value}</strong><small>{note}</small></CardContent></Card>;
}

function Chart({ label, variant = "line" }: { label: string; variant?: "line" | "forecast" | "small" }) {
  const points = variant === "forecast" ? "0,49 48,39 96,54 144,34 192,58 240,28 288,47 336,39 384,66 432,43 480,55 528,23 576,46 624,35" : "0,64 48,57 96,39 144,47 192,32 240,43 288,17 336,28 384,62 432,44 480,51 528,31 576,55 624,30";
  return <svg className={`gw-chart gw-chart-${variant}`} viewBox="0 0 624 100" role="img" aria-label={label} preserveAspectRatio="none"><path className="gw-chart-grid" d="M0 18H624M0 43H624M0 68H624M0 93H624" /><polyline className="gw-chart-line" points={points} /><circle className="gw-chart-point" cx="528" cy={variant === "forecast" ? "23" : "31"} r="4" /></svg>;
}

function OverviewPage({ cashBalance, outThisMonth, safeToSpend, bills, onNavigate, onAddBill, onApprove, onAutopay }: { cashBalance: number; outThisMonth: number; safeToSpend: number; bills: Bill[]; onNavigate: (page: Page) => void; onAddBill: () => void; onApprove: (id: string) => void; onAutopay: () => void }) {
  const pendingBills = bills.filter((bill) => bill.status === "Needs review").slice(0, 3);
  const categoriesSpend = [{ name: "Materials", value: 42, total: "£8.4k" }, { name: "Premises", value: 31, total: "£6.2k" }, { name: "Logistics", value: 19, total: "£3.8k" }, { name: "Other", value: 12, total: "£2.4k" }];
  return <>
    <section className="gw-welcome" aria-label="Cash summary"><div className="gw-greeting"><p className="gw-eyebrow">MONDAY 16 NOVEMBER · SAMPLE LEDGER</p><h1>Good morning,<br /><span>Nia.</span></h1><p>3 scheduled payments this week · {pendingBills.length} bills need your review.</p></div><div className="gw-ring" aria-label="84 percent of recurring spend is automated"><span>84<small>%</small></span></div><div className="gw-welcome-metric"><span>Cash balance</span><strong>{money(cashBalance)}</strong><small>Across four operating pots</small></div><div className="gw-welcome-metric"><span>Out this month</span><strong>{money(outThisMonth)}</strong><small>Rules and sample bills</small></div><div className="gw-welcome-metric"><span>Safe to spend</span><strong>{money(safeToSpend)}</strong><small>After scheduled costs</small></div><div className="gw-welcome-actions"><Button variant="outline" onClick={() => onNavigate("Bills")}><Receipt size={15} />Bills to review</Button><Button onClick={onAutopay}><CalendarDays size={15} />Autopay rules</Button></div></section>
    <div className="gw-overview-grid"><Card className="gw-overview-chart"><CardHeader><div><CardTitle>Cash across 4 accounts</CardTitle><p>Sample balance · movement over 90 days</p></div><Badge className="gw-trend-badge"><ArrowUpRight size={13} />2.4%</Badge></CardHeader><CardContent><div className="gw-chart-summary"><strong>{money(cashBalance)}</strong><span>↑ 2.4% <small>since last month</small></span></div><Chart label="Sample cash balance over the last 90 days" /><div className="gw-chart-axis"><span>18 Aug</span><span>2 Sept</span><span>18 Sept</span><span>4 Oct</span><span>20 Oct</span><span>16 Nov</span></div></CardContent></Card>
      <Card className="gw-week-card"><CardHeader><div><CardTitle>This week</CardTitle><p>£12,480 scheduled · £3,160 already paid</p></div><Badge>13 weeks</Badge></CardHeader><CardContent><div className="gw-week-grid">{today.map((day, index) => <button key={day.date} className={`gw-week-day ${index === 0 ? "is-today" : ""}`} onClick={() => onNavigate("Autopay")} aria-label={`${day.day} ${day.date}, view scheduled payments`}><span>{day.day}</span><b>{day.date}</b><i />{day.payments.map((payment) => <small key={payment}>{payment}</small>)}</button>)}</div></CardContent></Card>
    </div>
    <div className="gw-overview-bottom"><Card className="gw-autopay-summary"><CardHeader><div><CardTitle>Pays itself</CardTitle><p>Regular costs paid by a rule, not by hand</p></div><Badge className="gw-good-badge">On autopay</Badge></CardHeader><CardContent><div className="gw-autopay-number"><strong>84%</strong><span>{money(97525)} of {money(116308)} each month</span></div><div className="gw-progress"><i style={{ width: "84%" }} /></div><p>Recurring payments are covered. <button onClick={onAutopay}>Review 4 rules <ArrowRight size={13} /></button></p><div className="gw-card-footer"><span>Paid automatically</span><b>{money(97525)}</b></div><div className="gw-card-footer"><span>Needs a person</span><b>{money(outThisMonth)}</b></div></CardContent></Card>
      <Card className="gw-pending-card"><CardHeader><div><CardTitle>Waiting for you</CardTitle><p>{money(pendingBills.reduce((sum, bill) => sum + bill.amount, 0))} across {pendingBills.length} sample bills</p></div><button className="gw-inline-link" onClick={() => onNavigate("Bills")}>All <ArrowRight size={13} /></button></CardHeader><CardContent>{pendingBills.length ? <ul className="gw-compact-list">{pendingBills.map((bill) => <li key={bill.id}><Avatar name={bill.supplier} /><span><b>{bill.supplier}</b><small>{bill.detail} · due {bill.due}</small></span><strong>{money(bill.amount)}</strong><Button size="icon" variant="ghost" aria-label={`Approve ${bill.supplier} bill`} onClick={() => onApprove(bill.id)}><Check size={16} /></Button></li>)}</ul> : <EmptyMessage text="Nothing waiting for review." />}</CardContent></Card>
      <Card className="gw-spend-card"><CardHeader><div><CardTitle>Where it went</CardTitle><p>November so far · sample figures</p></div><button className="gw-inline-link" onClick={() => onNavigate("Reports")}>Reports <ArrowRight size={13} /></button></CardHeader><CardContent className="gw-spend-list">{categoriesSpend.map((item) => <div key={item.name}><span>{item.name}</span><i><b style={{ width: `${item.value}%` }} /></i><strong>{item.total}</strong></div>)}</CardContent></Card></div>
    <section className="gw-recent-section"><div className="gw-section-heading"><div><p className="gw-eyebrow">RECENT ACTIVITY</p><h2>Just paid</h2></div><Button variant="outline" size="sm" onClick={() => onNavigate("Autopay")}>Open run log <ArrowRight size={14} /></Button></div><div className="gw-activity-cards"><ActivityCard initials="MP" name="Moorland Provisions" detail="Monthly ingredients · Operating" amount="£1,860" /><ActivityCard initials="OS" name="Openfield Utilities" detail="Workshop energy · Team card" amount="£462" /><ActivityCard initials="NW" name="Northway Freight" detail="Collection run · Operating" amount="£540" /></div><div className="gw-bottom-actions"><Button variant="ghost" onClick={onAddBill}><Plus size={15} />Add a sample bill</Button><Button variant="ghost" onClick={() => onNavigate("Projects")}><BriefcaseBusiness size={15} />Review project budgets</Button></div></section>
  </>;
}

function ActivityCard({ initials, name, detail, amount }: { initials: string; name: string; detail: string; amount: string }) {
  return <div className="gw-activity-card"><Avatar name={initials} /><span><b>{name}</b><small>{detail}</small></span><strong>{amount}</strong><Check size={15} /></div>;
}

function Avatar({ name }: { name: string }) {
  return <span className="gw-avatar" aria-hidden="true">{name.slice(0, 2).toUpperCase()}</span>;
}

function EmptyMessage({ text }: { text: string }) {
  return <p className="gw-empty-message">{text}</p>;
}

function Segmented({ items, value, onChange, label }: { items: string[]; value: string; onChange: (value: string) => void; label: string }) {
  return <div className="gw-segmented" role="tablist" aria-label={label}>{items.map((item) => <button key={item} role="tab" aria-selected={value === item} className={value === item ? "is-selected" : ""} onClick={() => onChange(item)}>{item}</button>)}</div>;
}

function AutopayPage({ rules, allRules, tab, setTab, filter, setFilter, selected, onSelect, onToggle, onAdd, onSave, day, setDay, cadence, setCadence, amount, setAmount, account, setAccount, capped, setCapped, accounts, approvalLimit, notify }: { rules: Rule[]; allRules: Rule[]; tab: string; setTab: (tab: string) => void; filter: string; setFilter: (filter: string) => void; selected?: Rule; onSelect: (rule: Rule) => void; onToggle: (id: string, active: boolean) => void; onAdd: () => void; onSave: () => void; day: string; setDay: (day: string) => void; cadence: string; setCadence: (cadence: string) => void; amount: string; setAmount: (amount: string) => void; account: string; setAccount: (account: string) => void; capped: boolean; setCapped: (capped: boolean) => void; accounts: Account[]; approvalLimit: string; notify: (message: string) => void }) {
  const runRows = [{ supplier: "Moorland Provisions", detail: "Scheduled ingredients", status: "Paid", amount: 1860, date: "Today, 08:00" }, { supplier: "Openfield Utilities", detail: "Workshop electricity", status: "Paid", amount: 462, date: "Yesterday, 09:00" }, { supplier: "Northway Freight", detail: "Collection run", status: "Needs review", amount: 540, date: "14 Nov, 11:30" }];
  return <>
    <PageHeader eyebrow="SCHEDULE · REPEAT · REVIEW" title="Automatic payments" description="Set a rhythm for regular bills. Every amount here is sample data." action={<Button onClick={onAdd}><Plus size={16} />New rule</Button>} />
    <div className="gw-metric-grid gw-three-metrics"><Metric label="Cash balance" value="£182,400" note="Four sample accounts" icon={Wallet} /><Metric label="Paid this month" value="£18,640" note="Across active payment rules" icon={Check} tone="soft" /><Metric label="Rules each month" value={`${allRules.filter((rule) => rule.active).length} active`} note={`${allRules.length} rules in this preview`} icon={CalendarDays} /></div>
    <Segmented items={["Rules", "Run log", "Pay-from"]} value={tab} onChange={setTab} label="Autopay sections" />
    {tab === "Rules" && <>
      <div className="gw-filter-row" aria-label="Filter payment rules">{["All", ...categories.slice(1)].map((item) => <button key={item} className={filter === item ? "is-selected" : ""} onClick={() => setFilter(item)} aria-pressed={filter === item}>{item}<span>{item === "All" ? allRules.length : allRules.filter((rule) => rule.category === item).length}</span></button>)}</div>
      <div className="gw-rule-layout"><Card className="gw-rule-editor"><CardHeader><div><CardTitle>Edit a payment rule</CardTitle><p>Choose a date, schedule, amount and account.</p></div><Badge className="gw-good-badge">Sample rule</Badge></CardHeader><CardContent>
        <div className="gw-rule-editor-title"><Avatar name={selected?.supplier ?? "GW"} /><span><b>{selected?.name ?? "Select a payment rule"}</b><small>{selected?.supplier ?? "Choose a rule from the list"}</small></span><Button size="icon" variant="ghost" aria-label="More rule actions" onClick={() => notify("Rule actions are local to this preview.")}><MoreHorizontal size={17} /></Button></div>
        <div className="gw-editor-columns"><div className="gw-editor-panel"><div className="gw-panel-label"><CalendarDays size={14} />Date of payment</div><div className="gw-calendar-grid">{Array.from({ length: 31 }, (_, index) => index + 1).map((date) => <button key={date} className={Number(day) === date ? "is-selected" : ""} onClick={() => setDay(String(date))} aria-label={`Set payment day ${date}`} aria-pressed={Number(day) === date}>{date}</button>)}</div></div>
          <div className="gw-editor-panel"><div className="gw-panel-label"><Clock3 size={14} />Payment plan</div><div className="gw-choice-row">{["Weekly", "Monthly", "Quarterly", "Yearly"].map((item) => <button key={item} className={cadence === item ? "is-selected" : ""} onClick={() => setCadence(item)} aria-pressed={cadence === item}>{item}</button>)}</div><div className="gw-choice-row gw-choice-short"><button className={!capped ? "is-selected" : ""} onClick={() => setCapped(false)} aria-pressed={!capped}>Fixed</button><button className={capped ? "is-selected" : ""} onClick={() => setCapped(true)} aria-pressed={capped}>Up to a cap</button></div><Label htmlFor="gw-rule-amount" className="gw-panel-label">Payment amount</Label><div className="gw-currency-input gw-rule-amount"><span>£</span><Input id="gw-rule-amount" type="number" min="1" value={amount} onChange={(event) => setAmount(event.target.value)} /></div><small className="gw-helper">{capped ? "Maximum amount each run" : "Fixed amount each run"} · {cadence.toLowerCase()}</small></div>
          <div className="gw-editor-panel gw-pay-from"><div className="gw-panel-label"><Landmark size={14} />Pay from</div><div className="gw-account-bars">{accounts.slice(0, 4).map((item) => <button key={item.id} className={account === item.name ? "is-selected" : ""} onClick={() => setAccount(item.name)} aria-pressed={account === item.name}><i style={{ height: `${Math.max(24, item.balance / 1150)}%` }} /><span>{money(item.balance)}</span><small>{item.name}</small></button>)}</div><Button variant="outline" size="sm" onClick={onSave}><Check size={14} />Save rule</Button></div>
        </div>
        <p className="gw-approval-note"><ShieldCheck size={15} />Over {money(Number(approvalLimit))} requires a second person to approve this sample run.</p>
      </CardContent></Card>
        <div className="gw-rule-list">{rules.map((rule) => <Card key={rule.id} className={`gw-rule-card ${selected?.id === rule.id ? "is-current" : ""}`}><CardContent><button className="gw-rule-select" onClick={() => onSelect(rule)} aria-label={`Edit ${rule.name}`}><Avatar name={rule.supplier} /><span><b>{rule.name}</b><small>{rule.supplier} · {rule.category}</small></span></button><div className="gw-rule-meta"><span>{rule.cadence}, on the {rule.day}{ordinal(rule.day)}</span><b>{rule.capped ? "≤ " : ""}{money(rule.amount)}</b><Switch checked={rule.active} onCheckedChange={(checked) => onToggle(rule.id, checked)} aria-label={`${rule.active ? "Pause" : "Activate"} ${rule.name}`} /></div></CardContent></Card>)}{!rules.length && <Card><CardContent><EmptyMessage text="No rules match this filter." /></CardContent></Card>}</div>
      </div>
    </>}
    {tab === "Run log" && <Card className="gw-panel-card"><CardHeader><div><CardTitle>Recent payment runs</CardTitle><p>Local history for example rules. Nothing was sent to a bank.</p></div><Button variant="outline" size="sm" onClick={() => notify("Sample run log refreshed.")}><Clock3 size={14} />Refresh</Button></CardHeader><CardContent><div className="gw-data-list">{runRows.map((row) => <div key={row.supplier}><Avatar name={row.supplier} /><span><b>{row.supplier}</b><small>{row.detail} · {row.date}</small></span><Badge className={row.status === "Paid" ? "gw-good-badge" : "gw-warn-badge"}>{row.status}</Badge><strong>{money(row.amount)}</strong><Button size="sm" variant="outline" onClick={() => notify(`Sample ${row.supplier} payment checked locally.`)}>Review</Button></div>)}</div></CardContent></Card>}
    {tab === "Pay-from" && <div className="gw-account-grid">{accounts.map((item) => <Card key={item.id} className="gw-account-card"><CardContent><div><span className="gw-account-icon"><Landmark size={17} /></span><Badge>{item.kind}</Badge></div><h2>{item.name}</h2><p>{item.bank}</p><strong>{money(item.balance)}</strong><small>Used by {allRules.filter((rule) => rule.account === item.name).length} sample rules</small><Button variant="outline" size="sm" onClick={() => notify(`Showing sample activity for ${item.name}.`)}>View activity <ArrowRight size={14} /></Button></CardContent></Card>)}</div>}
  </>;
}

function ordinal(day: number) { return day === 1 || day === 21 || day === 31 ? "st" : day === 2 || day === 22 ? "nd" : day === 3 || day === 23 ? "rd" : "th"; }

function BillsPage({ bills, allBills, invoices, tab, setTab, filter, setFilter, selected, setSelected, onAddBill, onAddInvoice, onToggleBill, onBulkApprove, onInvoiceStatus, onExport }: { bills: Bill[]; allBills: Bill[]; invoices: Invoice[]; tab: string; setTab: (tab: "Bills" | "Invoices") => void; filter: string; setFilter: (filter: string) => void; selected: string[]; setSelected: (ids: string[]) => void; onAddBill: () => void; onAddInvoice: () => void; onToggleBill: (id: string, status: BillStatus) => void; onBulkApprove: () => void; onInvoiceStatus: (id: string, status: Invoice["status"]) => void; onExport: () => void }) {
  const needsReview = allBills.filter((bill) => bill.status === "Needs review");
  const dueSoon = allBills.filter((bill) => bill.status !== "Paid").reduce((sum, bill) => sum + bill.amount, 0);
  return <>
    <PageHeader eyebrow="MONEY IN · MONEY OUT" title="Bills & invoices" description="Review supplier bills and keep customer invoices moving." action={<Button onClick={tab === "Bills" ? onAddBill : onAddInvoice}><Plus size={16} />{tab === "Bills" ? "Add a bill" : "New invoice"}</Button>} />
    <div className="gw-metric-grid"><Metric label="Bills to review" value={String(needsReview.length)} note={`${money(needsReview.reduce((sum, bill) => sum + bill.amount, 0))} awaiting approval`} icon={Receipt} tone="soft" /><Metric label="Due this week" value={money(dueSoon)} note="Approved and review queue" icon={CalendarDays} /><Metric label="Invoices out" value={String(invoices.filter((invoice) => invoice.status !== "Paid").length)} note={`${money(invoices.filter((invoice) => invoice.status !== "Paid").reduce((sum, invoice) => sum + invoice.amount, 0))} outstanding`} icon={FileText} /></div>
    <Segmented items={["Bills", "Invoices"]} value={tab} onChange={(value) => setTab(value as "Bills" | "Invoices")} label="Bills and invoices" />
    {tab === "Bills" && <Card className="gw-list-card"><CardHeader className="gw-list-header"><div><CardTitle>Supplier bills</CardTitle><p>Approve one at a time or select several. Sample data only.</p></div><div className="gw-list-actions"><Select value={filter} onValueChange={setFilter}><SelectTrigger aria-label="Filter bill status"><SelectValue /></SelectTrigger><SelectContent>{["All bills", "Needs review", "Approved", "Paid"].map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent></Select><Button variant="outline" size="sm" onClick={onExport}><Download size={14} />Export</Button></div></CardHeader><CardContent>
      <div className="gw-bulk-row"><label><Input type="checkbox" aria-label="Select all visible bills" checked={bills.length > 0 && bills.every((bill) => selected.includes(bill.id))} onChange={(event) => setSelected(event.target.checked ? bills.map((bill) => bill.id) : [])} />Select visible</label><Button size="sm" variant="secondary" disabled={!selected.length} onClick={onBulkApprove}>Approve selected ({selected.length})</Button></div>
      <div className="gw-ledger-list" role="list">{bills.map((bill) => <BillRow key={bill.id} bill={bill} checked={selected.includes(bill.id)} onCheck={(checked) => setSelected(checked ? [...selected, bill.id] : selected.filter((id) => id !== bill.id))} onChange={onToggleBill} />)}{!bills.length && <EmptyMessage text="No bills match this filter." />}</div>
    </CardContent></Card>}
    {tab === "Invoices" && <Card className="gw-list-card"><CardHeader className="gw-list-header"><div><CardTitle>Customer invoices</CardTitle><p>Drafts and status changes remain local to this preview.</p></div><Button size="sm" variant="outline" onClick={onAddInvoice}><Plus size={14} />New invoice</Button></CardHeader><CardContent><div className="gw-ledger-list" role="list">{invoices.map((invoice) => <div className="gw-ledger-row" role="listitem" key={invoice.id}><Avatar name={invoice.customer} /><span className="gw-ledger-primary"><b>{invoice.customer}</b><small>{invoice.id} · {invoice.detail}</small></span><span className="gw-ledger-due">{invoice.sent}</span><Badge className={invoice.status === "Paid" ? "gw-good-badge" : invoice.status === "Draft" ? "gw-neutral-badge" : "gw-warn-badge"}>{invoice.status}</Badge><strong className="gw-ledger-amount">{money(invoice.amount)}</strong><div className="gw-row-actions">{invoice.status === "Draft" ? <Button size="sm" onClick={() => onInvoiceStatus(invoice.id, "Sent")}>Mark sent</Button> : invoice.status === "Sent" ? <Button size="sm" variant="outline" onClick={() => onInvoiceStatus(invoice.id, "Paid")}>Mark paid</Button> : <Check size={16} />}</div></div>)}</div></CardContent></Card>}
  </>;
}

function BillRow({ bill, checked, onCheck, onChange }: { bill: Bill; checked: boolean; onCheck: (checked: boolean) => void; onChange: (id: string, status: BillStatus) => void }) {
  return <div className="gw-ledger-row" role="listitem"><Input type="checkbox" aria-label={`Select ${bill.supplier} bill`} checked={checked} onChange={(event) => onCheck(event.target.checked)} /><Avatar name={bill.initials} /><span className="gw-ledger-primary"><b>{bill.supplier}</b><small>{bill.id} · {bill.detail}</small><em>{bill.project}</em></span><span className="gw-ledger-due">Due {bill.due}</span><Badge className={bill.status === "Paid" ? "gw-good-badge" : bill.status === "Approved" ? "gw-neutral-badge" : "gw-warn-badge"}>{bill.status}</Badge><strong className="gw-ledger-amount">{money(bill.amount)}</strong><div className="gw-row-actions">{bill.status === "Needs review" ? <Button size="sm" aria-label={`Approve ${bill.supplier} bill`} onClick={() => onChange(bill.id, "Approved")}>Approve</Button> : bill.status === "Approved" ? <Button size="sm" variant="outline" aria-label={`Mark ${bill.supplier} bill paid`} onClick={() => onChange(bill.id, "Paid")}>Mark paid</Button> : <Check size={16} aria-label="Paid" />}</div></div>;
}

function CashFlowPage({ accounts, cashBalance, tab, setTab, weeks, setWeeks, takings, setTakings, onMove }: { accounts: Account[]; cashBalance: number; tab: string; setTab: (tab: string) => void; weeks: number; setWeeks: (weeks: number) => void; takings: number; setTakings: (value: number) => void; onMove: () => void }) {
  const forecast = Math.round(cashBalance + 82100 - 96700 + takings * 1450);
  return <>
    <PageHeader eyebrow="BALANCES · EXPECTED · PLANNED" title="Cash flow" description={`Cash today is ${money(cashBalance)}. Forecast follows sample rules and unpaid bills.`} action={<Button onClick={onMove}><ArrowLeftRight size={16} />Move money</Button>} />
    <Segmented items={["Forecast", "Accounts"]} value={tab} onChange={setTab} label="Cash flow sections" />
    {tab === "Forecast" && <>
      <div className="gw-metric-grid gw-four-metrics"><Metric label="Cash now" value={money(cashBalance)} note="Operating, reserve and tax pots" icon={Wallet} /><Metric label="Lowest point" value={money(forecast)} note="Week of 1 February" icon={ArrowDownRight} tone="soft" /><Metric label="Scheduled out" value={money(96700)} note={`${weeks} weeks of rules and bills`} icon={ArrowUpRight} /><Metric label={`In ${weeks} weeks`} value={money(forecast)} note={`${money(Math.max(0, cashBalance - forecast))} below today's balance`} icon={CalendarDays} tone="blue" /></div>
      <Card className="gw-panel-card gw-forecast-chart"><CardHeader><div><CardTitle>In and out, week by week</CardTitle><p>Bars above line come in; below it goes out. Net balance shown in green.</p></div><div className="gw-week-toggle">{[6, 13].map((weekCount) => <button key={weekCount} className={weeks === weekCount ? "is-selected" : ""} onClick={() => setWeeks(weekCount)} aria-pressed={weeks === weekCount}>{weekCount} weeks</button>)}</div></CardHeader><CardContent><Chart label={`Illustrative ${weeks}-week incoming and outgoing cash forecast`} variant="forecast" /><div className="gw-chart-axis"><span>16 Nov</span><span>30 Nov</span><span>14 Dec</span><span>28 Dec</span><span>11 Jan</span><span>25 Jan</span><span>1 Feb</span></div><div className="gw-chart-legend"><span><i className="legend-in" />Money in</span><span><i className="legend-out" />Money out</span><span><i className="legend-net" />Net balance</span></div></CardContent></Card>
      <div className="gw-cash-bottom"><Card className="gw-simulator-card"><CardHeader><div><CardTitle>What if takings move?</CardTitle><p>Adjust sample income to see forecast change.</p></div><Badge>{takings > 0 ? `+${takings}%` : `${takings}%`}</Badge></CardHeader><CardContent><div className="gw-simulator-result"><span>Projected lowest balance</span><strong>{money(forecast)}</strong></div><Label htmlFor="gw-takings-slider">Weekly takings change</Label><Input id="gw-takings-slider" className="gw-range" type="range" min="-30" max="30" step="5" value={takings} onChange={(event) => setTakings(Number(event.target.value))} /><div className="gw-range-ends"><span>−30%</span><span>0%</span><span>+30%</span></div><p className="gw-helper">Illustrative model · no connected balances are changed.</p></CardContent></Card><Card className="gw-upcoming-card"><CardHeader><div><CardTitle>Largest payments ahead</CardTitle><p>Next sample payments · 13 weeks</p></div><Badge>Upcoming</Badge></CardHeader><CardContent>{[{ name: "Workshop payroll", date: "28 Nov", amount: 18460 }, { name: "Foundry Estates", date: "1 Dec", amount: 4120 }, { name: "Duty set-aside", date: "15 Dec", amount: 6840 }].map((item) => <div className="gw-upcoming-row" key={item.name}><Avatar name={item.name} /><span><b>{item.name}</b><small>{item.date} · sample schedule</small></span><strong>{money(item.amount)}</strong></div>)}</CardContent></Card></div>
    </>}
    {tab === "Accounts" && <><Card className="gw-panel-card gw-accounts-chart"><CardHeader><div><CardTitle>Cash, the last 90 days</CardTitle><p>Sample closing balance across business accounts.</p></div><Button variant="outline" size="sm" onClick={onMove}><ArrowLeftRight size={14} />Move money</Button></CardHeader><CardContent><Chart label="Cash balance for the last 90 days" /><div className="gw-chart-axis"><span>18 Aug</span><span>2 Sept</span><span>18 Sept</span><span>4 Oct</span><span>20 Oct</span><span>16 Nov</span></div></CardContent></Card><div className="gw-account-grid">{accounts.map((account) => <Card className="gw-account-card" key={account.id}><CardContent><div><span className="gw-account-icon"><Landmark size={17} /></span><Button variant="outline" size="sm" onClick={onMove}><ArrowLeftRight size={13} />Move</Button></div><h2>{account.name}</h2><p>{account.bank} · {account.kind}</p><strong>{money(account.balance)}</strong><small>Illustrative balance · not a live bank feed</small><MiniSparkline /></CardContent></Card>)}</div></>}
  </>;
}

function MiniSparkline() {
  return <svg className="gw-mini-spark" viewBox="0 0 100 28" role="img" aria-label="Illustrative recent account movement"><polyline points="0,21 12,17 22,19 31,8 42,12 54,5 67,13 78,10 88,17 100,7" /></svg>;
}

function TaxPage({ accounts, tab, setTab, sweep, setSweep, amount, setAmount, onTopUp, onSweep, notify }: { accounts: Account[]; tab: string; setTab: (tab: string) => void; sweep: boolean; setSweep: (value: boolean) => void; amount: string; setAmount: (value: string) => void; onTopUp: () => void; onSweep: () => void; notify: (message: string) => void }) {
  const duty = accounts.find((account) => account.id === "duty")?.balance ?? 0;
  const vat = accounts.find((account) => account.id === "vat")?.balance ?? 0;
  const filings = [{ id: "duty-oct", date: "18 NOV", label: "Business duty", note: "October 2026 · due in 2 days", amount: 6840, status: "Ready" }, { id: "payroll", date: "22 NOV", label: "Payroll tax", note: "October 2026 · due in 6 days", amount: 4280, status: "Due" }, { id: "vat-q4", date: "7 FEB", label: "VAT return", note: "Oct–Dec 2026 · due in 83 days", amount: 19200, status: "Draft" }];
  return <>
    <PageHeader eyebrow="SET-ASIDE · DUE DATES · FILINGS" title="Duty & tax" description="Build a buffer for upcoming tax dates. Sample estimates, not tax advice." action={<Button variant="outline" onClick={onTopUp}><Plus size={15} />Top up a pot</Button>} />
    <Segmented items={["Set-aside", "Filings"]} value={tab} onChange={setTab} label="Tax sections" />
    {tab === "Set-aside" && <><div className="gw-tax-grid">{[{ id: "duty", name: "Duty pot", sub: "Business duty · ·5529", balance: duty, target: 18000, due: "18 November", rate: "14%" }, { id: "vat", name: "VAT pot", sub: "VAT · ·5536", balance: vat, target: 19200, due: "7 February", rate: "12%" }].map((pot) => <Card className="gw-tax-card" key={pot.id}><CardHeader><div><span className={`gw-tax-icon ${pot.id}`}><Landmark size={17} /></span><CardTitle>{pot.name}</CardTitle><p>{pot.sub}</p></div><Badge className={pot.balance >= pot.target ? "gw-good-badge" : "gw-warn-badge"}>{pot.balance >= pot.target ? "Covered" : "Building"}</Badge></CardHeader><CardContent><div className="gw-tax-balance"><span>In the pot</span><strong>{money(pot.balance)}</strong></div><div className="gw-progress"><i style={{ width: `${Math.min(100, pot.balance / pot.target * 100)}%` }} /></div><div className="gw-tax-targets"><span><small>Next payment</small><b>{money(pot.target)}</b><small>{pot.due}</small></span><span><small>Progress</small><b>{Math.round(Math.min(100, pot.balance / pot.target * 100))}%</b><small>of next bill</small></span></div><div className="gw-sweep-control"><span><b>Weekly sweep</b><small>{amount}% of takings · every Friday</small></span><Switch checked={sweep} onCheckedChange={setSweep} aria-label={`Weekly ${pot.name} sweep`} /></div><div className="gw-tax-actions"><Button variant="outline" size="sm" onClick={onTopUp}>Top up</Button><Button size="sm" onClick={onSweep}>Add funds</Button></div></CardContent></Card>)}</div><Card className="gw-tax-rule"><CardContent><span className="gw-account-icon"><PiggyBank size={17} /></span><div><b>Weekly set-aside rule</b><p>Set aside a share of sample takings every Friday.</p></div><div className="gw-tax-rate"><Label htmlFor="gw-tax-rate">Rate</Label><Input id="gw-tax-rate" type="number" min="0" max="40" value={amount} onChange={(event) => setAmount(event.target.value)} /><span>%</span></div><Switch checked={sweep} onCheckedChange={setSweep} aria-label="Enable weekly set-aside" /><Button size="sm" variant="outline" onClick={() => notify("Sample set-aside rule saved.")}>Save rule</Button></CardContent></Card></>}
    {tab === "Filings" && <Card className="gw-panel-card"><CardHeader><div><CardTitle>Coming up</CardTitle><p>Illustrative tax dates in the next three months.</p></div><Button variant="outline" size="sm" onClick={() => notify("Sample filing calendar downloaded.")}><Download size={14} />Export dates</Button></CardHeader><CardContent><div className="gw-filings-list">{filings.map((filing) => <div className="gw-filing-row" key={filing.id}><span className="gw-filing-date">{filing.date}</span><span><b>{filing.label}</b><small>{filing.note}</small></span><strong>{money(filing.amount)}</strong><Badge className={filing.status === "Ready" ? "gw-good-badge" : "gw-warn-badge"}>{filing.status}</Badge><Button size="sm" variant="outline" onClick={() => notify(`${filing.label} marked reviewed in sample data.`)}>Mark reviewed</Button></div>)}</div></CardContent></Card>}
  </>;
}

function ReportsPage({ tab, setTab, category, setCategory, from, setFrom, to, setTo, ready, onBuild, onDownload }: { tab: string; setTab: (tab: string) => void; category: string; setCategory: (category: string) => void; from: string; setFrom: (value: string) => void; to: string; setTo: (value: string) => void; ready: boolean; onBuild: () => void; onDownload: () => void }) {
  const [dateError, setDateError] = React.useState(false);
  const spend = [{ label: "Materials", amount: "£63k", width: 81 }, { label: "Payroll", amount: "£48k", width: 64 }, { label: "Premises", amount: "£32k", width: 49 }, { label: "Tax", amount: "£24k", width: 38 }, { label: "Logistics", amount: "£18k", width: 29 }];
  const dateLabel = (value: string) => new Date(`${value}T00:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  return <>
    <PageHeader eyebrow="TRENDS · CATEGORIES · EXPORTS" title="Reports" description="See sample spend patterns and build a report for your next review." action={<Button variant="outline" onClick={onDownload}><Download size={15} />Download CSV</Button>} />
    <Segmented items={["Spend", "Builder"]} value={tab} onChange={setTab} label="Report sections" />
    {tab === "Spend" && <><div className="gw-metric-grid"><Metric label="Spend this month" value="£31,100" note="4.8% lower than October" icon={ArrowUpRight} tone="soft" /><Metric label="Six-month total" value="£284,600" note="Sample transactions only" icon={Wallet} /><Metric label="Top category" value="Materials" note="22% of tracked spend" icon={BriefcaseBusiness} /></div><div className="gw-report-grid"><Card className="gw-panel-card"><CardHeader><div><CardTitle>By category</CardTitle><p>Six months · sample totals</p></div><Badge>£284,600</Badge></CardHeader><CardContent className="gw-report-bars">{spend.map((item, index) => <div key={item.label}><span>{item.label}</span><i><b style={{ width: `${item.width}%` }} /></i><strong>{item.amount}</strong><small>{22 - index * 3}%</small></div>)}</CardContent></Card><Card className="gw-panel-card gw-monthly-report"><CardHeader><div><CardTitle>All spend, by month</CardTitle><p>November so far is highlighted.</p></div><Button variant="ghost" size="sm" onClick={onDownload}>Export <Download size={14} /></Button></CardHeader><CardContent><div className="gw-month-bars" role="img" aria-label="Monthly sample spend, June to November">{[58, 68, 55, 77, 63, 42].map((height, index) => <div key={index}><b>{money([24200, 28600, 23100, 32400, 26900, 18100][index])}</b><i style={{ height: `${height}%` }} /><span>{["Jun", "Jul", "Aug", "Sep", "Oct", "Nov"][index]}</span></div>)}</div></CardContent></Card></div><Card className="gw-panel-card gw-supplier-report"><CardHeader><div><CardTitle>Top suppliers</CardTitle><p>Paid in the last six months · sample data</p></div><Button variant="outline" size="sm" onClick={() => setTab("Builder")}>Build a report <ArrowRight size={14} /></Button></CardHeader><CardContent><div className="gw-supplier-report-list">{initialSuppliers.slice(0, 4).map((supplier) => <div key={supplier.id}><Avatar name={supplier.name} /><span><b>{supplier.name}</b><small>{supplier.category}</small></span><i><b style={{ width: `${Math.max(12, supplier.paid / 700)}%` }} /></i><strong>{money(supplier.paid)}</strong></div>)}</div></CardContent></Card></>}
    {tab === "Builder" && <Card className="gw-panel-card gw-builder-card"><CardHeader><div><CardTitle>Build a spend report</CardTitle><p>Choose a period and category. Report uses sample transactions.</p></div><Badge>Local data</Badge></CardHeader><CardContent><div className="gw-builder-fields"><div><Label htmlFor="gw-report-from">From</Label><Input id="gw-report-from" type="date" value={from} onChange={(event) => { setFrom(event.target.value); setDateError(false); }} /></div><div><Label htmlFor="gw-report-to">To</Label><Input id="gw-report-to" type="date" value={to} onChange={(event) => { setTo(event.target.value); setDateError(false); }} /></div><div><Label htmlFor="gw-report-category">Category</Label><Select value={category} onValueChange={setCategory}><SelectTrigger id="gw-report-category"><SelectValue /></SelectTrigger><SelectContent>{["All categories", ...categories.slice(1)].map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></div><Button onClick={() => { if (from > to) { setDateError(true); return; } setDateError(false); onBuild(); }}><Search size={15} />{ready ? "Refresh report" : "Build report"}</Button></div>{dateError && <p className="gw-form-error" role="alert">Choose an end date on or after the start date.</p>}{ready && !dateError && <div className="gw-report-result" role="status"><div><Badge className="gw-good-badge">Ready</Badge><span>{category} · {dateLabel(from)} – {dateLabel(to)}</span></div><strong>{category === "All categories" ? "£92,600" : "£24,840"}</strong><p>Illustrative total from 86 sample transactions.</p><Button variant="outline" size="sm" onClick={onDownload}><Download size={14} />Download CSV</Button></div>}</CardContent></Card>}
  </>;
}

function ProjectsPage({ projects, tab, setTab, dragged, setDragged, onAdd, onMove }: { projects: Project[]; tab: string; setTab: (tab: string) => void; dragged: string | null; setDragged: (id: string | null) => void; onAdd: () => void; onMove: (id: string, status: Project["status"]) => void }) {
  const stages: Project["status"][] = ["Planned", "In progress", "Wrapping up", "Done"];
  const totalBudget = projects.reduce((sum, project) => sum + project.budget, 0);
  const totalSpent = projects.reduce((sum, project) => sum + project.spent + project.committed, 0);
  return <>
    <PageHeader eyebrow="PLAN · FUND · DELIVER" title="Projects" description={`${projects.length} sample projects · ${money(totalBudget)} budgeted · ${money(totalSpent)} spent or committed.`} action={<Button onClick={onAdd}><Plus size={16} />New project</Button>} />
    <div className="gw-project-toolbar"><Segmented items={["Board", "Budgets"]} value={tab} onChange={setTab} label="Project views" /><Badge><BriefcaseBusiness size={13} />{projects.length} active projects</Badge></div>
    {tab === "Board" && <div className="gw-project-board">{stages.map((stage) => { const items = projects.filter((project) => project.status === stage); return <section className="gw-project-column" key={stage} onDragOver={(event) => event.preventDefault()} onDrop={() => { if (dragged) onMove(dragged, stage); setDragged(null); }}><div className="gw-project-column-head"><span><i className={`stage-${stage.replaceAll(" ", "-").toLowerCase()}`} />{stage}</span><Badge>{items.length}</Badge></div>{items.map((project) => <ProjectCard key={project.id} project={project} onDragStart={() => setDragged(project.id)} onMove={() => onMove(project.id, stages[Math.min(stages.indexOf(stage) + 1, stages.length - 1)])} />)}{!items.length && <div className="gw-drop-hint">Drop a project here</div>}</section>; })}</div>}
    {tab === "Budgets" && <Card className="gw-panel-card"><CardHeader><div><CardTitle>Project budgets</CardTitle><p>Spend, commitments, and remaining budget are illustrative.</p></div><Badge>{money(totalBudget)} total</Badge></CardHeader><CardContent><div className="gw-budget-list">{projects.map((project) => <div key={project.id}><span><b>{project.name}</b><small>{project.status} · {project.owner}</small></span><i><b style={{ width: `${Math.min(100, (project.spent + project.committed) / project.budget * 100)}%` }} /></i><span><b>{money(project.spent + project.committed)}</b><small>of {money(project.budget)}</small></span></div>)}</div></CardContent></Card>}
  </>;
}

function ProjectCard({ project, onDragStart, onMove }: { project: Project; onDragStart: () => void; onMove: () => void }) {
  const progress = Math.min(100, (project.spent + project.committed) / project.budget * 100);
  return <Card className="gw-project-card" draggable={project.status !== "Done"} onDragStart={onDragStart}><CardContent><div className="gw-project-card-top"><Badge>{project.status}</Badge><button aria-label={project.status === "Done" ? `Reopen ${project.name}` : `Move ${project.name} to next stage`} onClick={onMove}><ArrowRight size={15} /></button></div><h2>{project.name}</h2><p>{project.detail}</p><div className="gw-progress"><i style={{ width: `${progress}%` }} /></div><div className="gw-project-spend"><span>{money(project.spent)} spent{project.committed ? ` · ${money(project.committed)} committed` : ""}</span><b>of {money(project.budget)}</b></div><small className="gw-project-owner">{project.owner}</small></CardContent></Card>;
}

function SuppliersPage({ suppliers, filter, setFilter, sort, setSort, onAdd, onSelect }: { suppliers: Supplier[]; filter: string; setFilter: (value: string) => void; sort: string; setSort: (value: string) => void; onAdd: () => void; onSelect: (supplier: Supplier) => void }) {
  return <>
    <PageHeader eyebrow="PEOPLE · TERMS · PAYMENT HISTORY" title="Suppliers" description={`${suppliers.length} sample suppliers · £138,621 paid in six months.`} action={<Button onClick={onAdd}><Plus size={16} />Add supplier</Button>} />
    <div className="gw-supplier-toolbar"><div className="gw-filter-row">{["All", ...categories.slice(1)].map((item) => <button key={item} className={filter === item ? "is-selected" : ""} onClick={() => setFilter(item)} aria-pressed={filter === item}>{item}</button>)}</div><div className="gw-sort"><span>Sort</span>{["Most paid", "A–Z"].map((item) => <button key={item} className={sort === item ? "is-selected" : ""} onClick={() => setSort(item)} aria-pressed={sort === item}>{item}</button>)}</div></div>
    <div className="gw-supplier-grid">{suppliers.map((supplier) => <Card className="gw-supplier-card" key={supplier.id}><CardContent><div className="gw-supplier-card-head"><Avatar name={supplier.name} /><Badge>{supplier.category}</Badge><Button size="icon" variant="ghost" aria-label={`More about ${supplier.name}`} onClick={() => onSelect(supplier)}><MoreHorizontal size={17} /></Button></div><button className="gw-supplier-name" onClick={() => onSelect(supplier)}>{supplier.name}<ArrowRight size={14} /></button><p>{supplier.town} · Sample supplier</p><div className="gw-supplier-paid"><span>Paid · 6 months</span><strong>{money(supplier.paid)}</strong></div><div className="gw-supplier-card-footer"><span>{supplier.email}</span><button aria-label={`Open ${supplier.name} details`} onClick={() => onSelect(supplier)}><ArrowUpRight size={14} /></button></div></CardContent></Card>)}{!suppliers.length && <Card className="gw-empty-card"><CardContent><EmptyMessage text="No suppliers match this category." /></CardContent></Card>}</div>
  </>;
}

function SettingsPage({ name, setName, limit, setLimit, tab, setTab, digest, setDigest, theme, toggleTheme, onSave, onReset }: { name: string; setName: (value: string) => void; limit: string; setLimit: (value: string) => void; tab: string; setTab: (tab: string) => void; digest: boolean; setDigest: (value: boolean) => void; theme: string; toggleTheme: () => void; onSave: () => void; onReset: () => void }) {
  return <>
    <PageHeader eyebrow="PREFERENCES · APPROVALS · ACCESS" title="Settings" description="Tune workspace defaults for this sample session." action={<Button onClick={onSave}><Check size={15} />Save changes</Button>} />
    <div className="gw-settings-layout"><nav className="gw-settings-nav" aria-label="Settings sections">{["Business", "Approvals", "Preferences"].map((item) => <button key={item} className={tab === item ? "is-active" : ""} onClick={() => setTab(item)} aria-current={tab === item ? "page" : undefined}>{item}<ArrowRight size={14} /></button>)}</nav><Card className="gw-panel-card gw-settings-panel"><CardHeader><div><CardTitle>{tab} settings</CardTitle><p>Changes stay in this browser preview and reset when reloaded.</p></div></CardHeader><CardContent>
      {tab === "Business" && <div className="gw-settings-fields"><div><Label htmlFor="gw-workspace-name">Workspace name</Label><Input id="gw-workspace-name" value={name} onChange={(event) => setName(event.target.value)} maxLength={70} /></div><div><Label htmlFor="gw-business-type">Business type</Label><Select defaultValue="Independent producer"><SelectTrigger id="gw-business-type"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Independent producer">Independent producer</SelectItem><SelectItem value="Retail">Retail</SelectItem><SelectItem value="Studio">Studio</SelectItem></SelectContent></Select></div><div><Label htmlFor="gw-business-currency">Reporting currency</Label><Select defaultValue="GBP"><SelectTrigger id="gw-business-currency"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="GBP">GBP · Pound sterling</SelectItem><SelectItem value="EUR">EUR · Euro</SelectItem><SelectItem value="USD">USD · US dollar</SelectItem></SelectContent></Select></div></div>}
      {tab === "Approvals" && <div className="gw-settings-fields"><div><Label htmlFor="gw-approval-limit">Second approval above</Label><div className="gw-currency-input"><span>£</span><Input id="gw-approval-limit" type="number" min="0" step="100" value={limit} onChange={(event) => setLimit(event.target.value)} /></div><small>Payments above this sample limit request another reviewer.</small></div><div className="gw-settings-switch"><span><b>Require two reviewers</b><small>For payments above the approval threshold.</small></span><Switch defaultChecked aria-label="Require two reviewers" /></div><div className="gw-settings-switch"><span><b>Allow same-day payment</b><small>Show urgent bills in the review queue.</small></span><Switch aria-label="Allow same-day payment" /></div></div>}
      {tab === "Preferences" && <div className="gw-settings-fields"><div className="gw-settings-switch"><span><b>Weekly finance summary</b><small>Prepare a sample digest each Monday.</small></span><Switch checked={digest} onCheckedChange={setDigest} aria-label="Weekly finance summary" /></div><div className="gw-settings-switch"><span><b>Appearance</b><small>Current mode: {theme}. Toggle to preview the alternate palette.</small></span><Button variant="outline" size="sm" onClick={toggleTheme}>{theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}{theme === "dark" ? "Light mode" : "Dark mode"}</Button></div><div className="gw-settings-switch"><span><b>Local sample data</b><small>Restore the original values for this session.</small></span><Button variant="outline" size="sm" onClick={onReset}>Reset data</Button></div></div>}
      <div className="gw-settings-footer"><span><ShieldCheck size={14} />No account or bank is connected.</span><Button onClick={onSave}>Save {tab.toLowerCase()} settings</Button></div>
    </CardContent></Card></div>
  </>;
}

function HelpPage({ open, setOpen, draft, setDraft, onSubmit }: { open: number; setOpen: (index: number) => void; draft: string; setDraft: (value: string) => void; onSubmit: (event: React.FormEvent<HTMLFormElement>) => void }) {
  const faqs = [
    { question: "When will a sample payment leave the account?", answer: "The date and cadence on each rule show an illustrative run schedule. This preview is not connected to a bank and will not make a payment." },
    { question: "How does the cash forecast work?", answer: "The sample forecast combines example recurring rules with bills that have not been marked paid. Move the takings slider to preview a simple what-if scenario." },
    { question: "Can I change an invoice after sending it?", answer: "Invoice status changes are local to the preview. Use the Bills & invoices page to create a draft, mark it sent, or mark it paid." },
    { question: "Does the tax pot calculate my filing?", answer: "No. Tax amounts and dates are illustrative only and are not tax advice. Verify obligations with a qualified accountant before acting." }
  ];
  return <>
    <PageHeader eyebrow="ANSWERS · GUIDES · CONTACT" title="Help & support" description="Quick answers for this local finance preview." />
    <div className="gw-help-grid"><Card className="gw-panel-card"><CardHeader><div><CardTitle>Common questions</CardTitle><p>Sample guidance · no external help service connected.</p></div><Badge><CircleHelp size={13} />Help center</Badge></CardHeader><CardContent className="gw-faq-list">{faqs.map((faq, index) => <div className="gw-faq-item" key={faq.question}><button aria-expanded={open === index} onClick={() => setOpen(open === index ? -1 : index)}><span>{faq.question}</span><ChevronDown size={17} className={open === index ? "is-open" : ""} /></button>{open === index && <p>{faq.answer}</p>}</div>)}</CardContent></Card><Card className="gw-panel-card gw-support-card"><CardHeader><div><CardTitle>Leave a sample note</CardTitle><p>Saved only in this browser session; no message is sent.</p></div><span className="gw-support-icon"><Mail size={17} /></span></CardHeader><CardContent><form onSubmit={onSubmit}><Label htmlFor="gw-support-message">How can we help?</Label><textarea id="gw-support-message" className="ui-input gw-textarea" value={draft} onChange={(event) => setDraft(event.target.value)} minLength={5} maxLength={500} required placeholder="Tell us what you were trying to do…" /><Button type="submit"><Mail size={15} />Save sample note</Button></form><div className="gw-help-note"><ShieldCheck size={15} /><span><b>Preview safety</b><small>No real transfers, payments, tax filings, or supplier emails are made.</small></span></div></CardContent></Card></div>
  </>;
}

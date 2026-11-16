import * as React from "react";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  Banknote,
  BarChart3,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  CircleHelp,
  CreditCard,
  Download,
  FileText,
  Filter,
  Home,
  Landmark,
  Menu,
  MoreHorizontal,
  PiggyBank,
  Plus,
  Receipt,
  Search,
  Settings,
  Share2,
  ShieldCheck,
  ShoppingBag,
  SlidersHorizontal,
  TrendingUp,
  Wallet,
  X,
  type LucideIcon
} from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
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
import "./ledgerline-finance.css";

type Page = "Dashboard" | "Analytics" | "All Transactions" | "Income" | "Expenses" | "Pending" | "Recurring Bills" | "Cards & Bank" | "Savings" | "Investments" | "Savings Goals" | "Budget Limits" | "Help Center" | "Settings";
type Lane = "bills" | "spending" | "goals" | "income";
type EntryStatus = "Paid" | "Cleared" | "Pending" | "Overdue" | "Deposited" | "In Progress" | "On Track" | "Almost There";
type BoardEntry = { id: string; lane: Lane; category: string; title: string; amount: number; status: EntryStatus; date: string; note: string; target?: number; targetDate?: string; local?: boolean };
type BoardTab = "Summary" | "Budget Board" | "Transactions" | "Goals";
type DialogKind = "transaction" | "goal" | "filter" | "share" | "entry" | null;

const initialEntries: BoardEntry[] = [
  { id: "b1", lane: "bills", category: "Housing", title: "Rent of April", amount: 1250, status: "Paid", date: "Due Apr 1, 2026", note: "Paid Apr 1" },
  { id: "b2", lane: "bills", category: "Utilities", title: "Electric bill", amount: 128, status: "Overdue", date: "Due Apr 20, 2026", note: "6 days late" },
  { id: "b3", lane: "bills", category: "Utilities", title: "Internet service", amount: 69.99, status: "Overdue", date: "Due Apr 30, 2026", note: "In 4 days" },
  { id: "s1", lane: "spending", category: "Groceries", title: "Whole Foods Market", amount: 94.3, status: "Cleared", date: "Apr 23, 2026", note: "Weekly groceries" },
  { id: "s2", lane: "spending", category: "Transport", title: "Metro card top-up", amount: 52, status: "Pending", date: "Apr 23, 2026", note: "Transit" },
  { id: "s3", lane: "spending", category: "Coffee", title: "Blue Bottle Coffee", amount: 8.5, status: "Cleared", date: "Apr 23, 2026", note: "Coffee" },
  { id: "g1", lane: "goals", category: "Safety", title: "Emergency fund", amount: 8400, target: 10000, status: "On Track", date: "Target Jun ’27", note: "$1,600 left" },
  { id: "g2", lane: "goals", category: "Travel", title: "Vacation · Japan", amount: 2100, target: 5000, status: "In Progress", date: "Target Dec ’26", note: "$2,900 left" },
  { id: "g3", lane: "goals", category: "Purchase", title: "New laptop", amount: 1820, target: 2000, status: "Almost There", date: "Target May ’26", note: "$180 left" },
  { id: "i1", lane: "income", category: "Salary", title: "Payroll (2 deposits)", amount: 6450, status: "Deposited", date: "Apr 10 & Apr 24", note: "Biweekly" },
  { id: "i2", lane: "income", category: "Freelance", title: "Freelance payment", amount: 750, status: "Deposited", date: "Apr 18, 2026", note: "Wire transfer" },
  { id: "i3", lane: "income", category: "Invoice", title: "Design invoice #12", amount: 1200, status: "In Progress", date: "Due Apr 28", note: "Awaiting payment" }
];

const lanes: Array<{ id: Lane; title: string; icon: LucideIcon; action: string }> = [
  { id: "bills", title: "Bills & Fixed", icon: Receipt, action: "Add bill" },
  { id: "spending", title: "Daily Spending", icon: ShoppingBag, action: "Add expense" },
  { id: "goals", title: "Savings Goals", icon: PiggyBank, action: "Add goal" },
  { id: "income", title: "Income", icon: Banknote, action: "Log income" }
];

const allPages: Array<{ id: Page; icon: LucideIcon }> = [
  { id: "Dashboard", icon: Home }, { id: "Analytics", icon: BarChart3 }, { id: "All Transactions", icon: Activity },
  { id: "Income", icon: ArrowUpRight }, { id: "Expenses", icon: CreditCard }, { id: "Pending", icon: CalendarDays },
  { id: "Recurring Bills", icon: Receipt }, { id: "Cards & Bank", icon: Wallet }, { id: "Savings", icon: PiggyBank },
  { id: "Investments", icon: TrendingUp }, { id: "Savings Goals", icon: BriefcaseBusiness }, { id: "Budget Limits", icon: SlidersHorizontal },
  { id: "Help Center", icon: CircleHelp }, { id: "Settings", icon: Settings }
];

const accounts = [
  { name: "Everyday account", bank: "Northstar Bank ··8426", amount: 17840, type: "Cards & Bank" },
  { name: "Rainy day savings", bank: "Northstar Bank ··1193", amount: 4260, type: "Savings" },
  { name: "Index portfolio", bank: "Cedar Investments ··5380", amount: 12950, type: "Investments" }
];

const money = (amount: number) => `$${amount.toLocaleString("en-US", { minimumFractionDigits: amount % 1 ? 2 : 0, maximumFractionDigits: 2 })}`;

export function csvText(rows: string[][]) {
  return `\uFEFF${rows.map((row) => row.map((cell) => {
    const safe = /^[\s]*[=+\-@]/.test(cell) ? `'${cell}` : cell;
    return `"${safe.replaceAll('"', '""')}"`;
  }).join(",")).join("\r\n")}`;
}

function downloadCsv(fileName: string, rows: string[][]) {
  const url = URL.createObjectURL(new Blob([csvText(rows)], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

export function LedgerlineFinance() {
  return <ToastProvider><LedgerlineWorkspace /></ToastProvider>;
}

function LedgerlineWorkspace() {
  const { theme, setTheme } = useTheme();
  const themeBeforePreview = React.useRef(theme);
  const searchRef = React.useRef<HTMLInputElement>(null);
  const [page, setPage] = React.useState<Page>("Dashboard");
  const [entries, setEntries] = React.useState(initialEntries);
  const [boardTab, setBoardTab] = React.useState<BoardTab>("Budget Board");
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const [transactionsOpen, setTransactionsOpen] = React.useState(true);
  const [accountsOpen, setAccountsOpen] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [mobileSearchOpen, setMobileSearchOpen] = React.useState(false);
  const [mobileMoreOpen, setMobileMoreOpen] = React.useState(false);
  const [dialog, setDialog] = React.useState<DialogKind>(null);
  const [toast, setToast] = React.useState({ open: false, title: "", description: "" });
  const [selectedEntryId, setSelectedEntryId] = React.useState<string | null>(null);
  const [detailStatus, setDetailStatus] = React.useState<EntryStatus>("Pending");
  const [year, setYear] = React.useState("2026");
  const [filterStatus, setFilterStatus] = React.useState("All statuses");
  const [filterLane, setFilterLane] = React.useState("All categories");
  const [draftStatus, setDraftStatus] = React.useState(filterStatus);
  const [draftLaneFilter, setDraftLaneFilter] = React.useState(filterLane);
  const [draftTitle, setDraftTitle] = React.useState("");
  const [draftAmount, setDraftAmount] = React.useState("");
  const [draftLane, setDraftLane] = React.useState<Lane>("spending");
  const [draftCategory, setDraftCategory] = React.useState("Groceries");
  const [draftDate, setDraftDate] = React.useState("2026-04-24");
  const [goalName, setGoalName] = React.useState("");
  const [goalTarget, setGoalTarget] = React.useState("");
  const [goalDate, setGoalDate] = React.useState("2026-12-31");
  const [copied, setCopied] = React.useState(false);
  const [budgetLimit, setBudgetLimit] = React.useState("4200");
  const [alertsEnabled, setAlertsEnabled] = React.useState(true);
  const [weeklyEmail, setWeeklyEmail] = React.useState(false);
  const [supportDraft, setSupportDraft] = React.useState("");
  const [faqOpen, setFaqOpen] = React.useState(0);

  React.useEffect(() => {
    setTheme("light");
    return () => setTheme(themeBeforePreview.current);
  }, [setTheme]);

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setMobileSearchOpen(true);
        requestAnimationFrame(() => searchRef.current?.focus());
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const selectedEntry = entries.find((entry) => entry.id === selectedEntryId) ?? null;
  const localEntries = entries.filter((entry) => entry.local);
  const addedIncome = localEntries.filter((entry) => entry.lane === "income").reduce((sum, entry) => sum + entry.amount, 0);
  const addedExpense = localEntries.filter((entry) => entry.lane === "bills" || entry.lane === "spending").reduce((sum, entry) => sum + entry.amount, 0);
  const balance = 24580 + addedIncome - addedExpense;
  const monthlyIncome = 6450 + addedIncome;
  const monthlySpend = 3920 + addedExpense;
  const spendPercent = Math.min(100, Math.round(monthlySpend / monthlyIncome * 100));
  const monthLabel = `April ${year}`;
  const searchFilteredEntries = entries.filter((entry) => `${entry.title} ${entry.category} ${entry.status} ${entry.date} ${entry.note}`.toLowerCase().includes(search.toLowerCase()));
  const visibleTransactions = searchFilteredEntries.filter((entry) => {
    if (entry.lane === "goals") return false;
    if (filterStatus !== "All statuses" && entry.status !== filterStatus) return false;
    if (filterLane !== "All categories" && lanes.find((lane) => lane.id === entry.lane)?.title !== filterLane) return false;
    if (page === "Income" && entry.lane !== "income") return false;
    if (page === "Expenses" && entry.lane === "income") return false;
    if (page === "Pending" && !["Pending", "Overdue", "In Progress"].includes(entry.status)) return false;
    if (page === "Recurring Bills" && entry.lane !== "bills") return false;
    return true;
  });
  const goals = searchFilteredEntries.filter((entry) => entry.lane === "goals");

  function notify(title: string, description = "Sample workspace · changes stay in this preview.") {
    setToast({ open: true, title, description });
  }

  function navigate(nextPage: Page) {
    setPage(nextPage);
    setSearch("");
    setMobileMoreOpen(false);
  }

  function openTransaction(lane: Lane = "spending") {
    setDraftTitle("");
    setDraftAmount("");
    setDraftLane(lane === "goals" ? "spending" : lane);
    setDraftCategory(lane === "bills" ? "Housing" : lane === "income" ? "Salary" : "Groceries");
    setDraftDate("2026-04-24");
    setDialog("transaction");
  }

  function openGoal() {
    setGoalName("");
    setGoalTarget("");
    setGoalDate("2026-12-31");
    setDialog("goal");
  }

  function addTransaction(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const amount = Number(draftAmount);
    const title = draftTitle.trim();
    if (!title || !Number.isFinite(amount) || amount <= 0) return;
    const date = new Date(`${draftDate}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const entry: BoardEntry = {
      id: `local-${Date.now()}`, lane: draftLane, category: draftCategory.trim() || "Other", title, amount,
      status: draftLane === "income" ? "Deposited" : "Pending", date, note: "Added in this preview", local: true
    };
    setEntries((current) => [entry, ...current]);
    setBoardTab("Budget Board");
    setPage("Dashboard");
    setDialog(null);
    notify("Sample transaction added.");
  }

  function addGoal(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const target = Number(goalTarget);
    const title = goalName.trim();
    if (!title || !Number.isFinite(target) || target <= 0) return;
    const targetDate = new Date(`${goalDate}T00:00:00`).toLocaleDateString("en-US", { month: "short", year: "2-digit" });
    setEntries((current) => [{
      id: `local-${Date.now()}`, lane: "goals", category: "Personal", title, amount: 0, target, status: "In Progress",
      date: `Target ${targetDate}`, note: `${money(target)} to go`, targetDate, local: true
    }, ...current]);
    setBoardTab("Goals");
    setPage("Dashboard");
    setDialog(null);
    notify("Sample savings goal created.");
  }

  function openEntry(entry: BoardEntry) {
    setSelectedEntryId(entry.id);
    setDetailStatus(entry.status);
    setDialog("entry");
  }

  function saveEntryStatus() {
    if (selectedEntryId) setEntries((current) => current.map((entry) => entry.id === selectedEntryId ? { ...entry, status: detailStatus } : entry));
    setDialog(null);
    notify("Sample status updated.");
  }

  function exportEntries() {
    downloadCsv("ledgerline-sample-transactions.csv", [
      ["Type", "Category", "Description", "Status", "Date", "Amount"],
      ...visibleTransactions.map((entry) => [entry.lane === "income" ? "Income" : "Expense", entry.category, entry.title, entry.status, entry.date, String(entry.amount)])
    ]);
    notify("Sample transactions downloaded as CSV.");
  }

  async function copyShareLink() {
    try {
      await navigator.clipboard.writeText("https://ledgerline.example/sample-workspace");
      setCopied(true);
      notify("Preview link copied.", "This demo link does not contain account or financial data.");
    } catch {
      notify("Copy was blocked by this browser.", "Select the sample link and copy it manually.");
    }
  }

  const isTransactionsPage = ["All Transactions", "Income", "Expenses", "Pending", "Recurring Bills"].includes(page);
  const pageTitle: Record<Page, string> = {
    Dashboard: "Financial overview", Analytics: "Analytics", "All Transactions": "All Transactions", Income: "Income",
    Expenses: "Expenses", Pending: "Pending transactions", "Recurring Bills": "Recurring bills", "Cards & Bank": "Cards & Bank",
    Savings: "Savings", Investments: "Investments", "Savings Goals": "Savings goals", "Budget Limits": "Budget limits",
    "Help Center": "Help center", Settings: "Settings"
  };

  return <div className="ledgerline-finance">
    <div className={`ll-app-shell ${sidebarCollapsed ? "is-collapsed" : ""}`}>
      <aside className="ll-sidebar" aria-label="Finance workspace">
        <div className="ll-brand-row">
          <button className="ll-brand" onClick={() => navigate("Dashboard")} aria-label="Ledgerline home"><span className="ll-brand-mark"><Activity size={19} /></span><span>ledgerline</span></button>
          <Button variant="outline" size="icon" className="ll-collapse" aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"} onClick={() => setSidebarCollapsed((value) => !value)}>{sidebarCollapsed ? <ChevronRight size={17} /> : <ChevronLeft size={17} />}</Button>
        </div>
        <nav className="ll-side-nav" aria-label="Primary navigation">
          <NavButton page="Dashboard" current={page} icon={Home} onClick={navigate} />
          <NavButton page="Analytics" current={page} icon={BarChart3} onClick={navigate} />
          <button className="ll-nav-group" aria-expanded={transactionsOpen} onClick={() => setTransactionsOpen((value) => !value)}><span>Transactions</span><ChevronDown size={16} className={transactionsOpen ? "is-open" : ""} /></button>
          {transactionsOpen && <div className="ll-nav-subgroup">
            <NavButton page="All Transactions" current={page} icon={Activity} onClick={navigate} />
            <NavButton page="Income" current={page} icon={ArrowUpRight} count={entries.filter((entry) => entry.lane === "income").length} onClick={navigate} />
            <NavButton page="Expenses" current={page} icon={CreditCard} count={entries.filter((entry) => entry.lane === "bills" || entry.lane === "spending").length} onClick={navigate} />
            <NavButton page="Pending" current={page} icon={CalendarDays} count={entries.filter((entry) => ["Pending", "Overdue", "In Progress"].includes(entry.status)).length} onClick={navigate} />
            <NavButton page="Recurring Bills" current={page} icon={Receipt} onClick={navigate} />
          </div>}
          <button className="ll-nav-group" aria-expanded={accountsOpen} onClick={() => setAccountsOpen((value) => !value)}><span>Accounts</span><ChevronDown size={16} className={accountsOpen ? "is-open" : ""} /></button>
          {accountsOpen && <div className="ll-nav-subgroup">
            <NavButton page="Cards & Bank" current={page} icon={Wallet} onClick={navigate} />
            <NavButton page="Savings" current={page} icon={PiggyBank} onClick={navigate} />
            <NavButton page="Investments" current={page} icon={TrendingUp} onClick={navigate} />
            <NavButton page="Savings Goals" current={page} icon={BriefcaseBusiness} onClick={navigate} />
            <NavButton page="Budget Limits" current={page} icon={SlidersHorizontal} onClick={navigate} />
          </div>}
        </nav>
        <div className="ll-sidebar-bottom">
          <NavButton page="Help Center" current={page} icon={CircleHelp} onClick={navigate} />
          <NavButton page="Settings" current={page} icon={Settings} onClick={navigate} />
          <button className="ll-profile" onClick={() => navigate("Settings")} aria-label="Open Riley Morgan settings"><span className="ll-avatar">RM</span><span><b>Riley Morgan</b><small>riley@ledgerline.example</small></span></button>
        </div>
      </aside>

      <div className="ll-main-area">
        <header className="ll-topbar">
          <div className="ll-mobile-brand"><span className="ll-brand-mark"><Activity size={18} /></span><b>ledgerline</b></div>
          <div className="ll-breadcrumb"><span>Finance</span><ChevronRight size={15} /><b>{page === "Dashboard" ? "Overview" : pageTitle[page]}</b></div>
          <div className="ll-search-wrap">
            <Label htmlFor="ll-search" className="ll-sr-only">Search transactions</Label>
            <Search size={16} />
            <Input id="ll-search" ref={searchRef} value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search transactions..." />
            <kbd>⌘K</kbd>
            {search && <button className="ll-search-clear" aria-label="Clear search" onClick={() => setSearch("")}><X size={14} /></button>}
          </div>
          <div className="ll-top-actions">
            <Button variant="outline" size="sm" className="ll-mobile-search-toggle" aria-label={mobileSearchOpen ? "Close search" : "Search transactions"} onClick={() => { setMobileSearchOpen((open) => !open); requestAnimationFrame(() => searchRef.current?.focus()); }}><Search size={16} /></Button>
            <Button variant="ghost" size="sm" onClick={exportEntries}><Download size={16} /><span>Export</span></Button>
            <Button variant="ghost" size="sm" onClick={() => { setCopied(false); setDialog("share"); }}><Share2 size={16} /><span>Share</span></Button>
            <Button onClick={() => openTransaction()}><Plus size={16} /><span>Add transaction</span></Button>
          </div>
          {mobileSearchOpen && <div className="ll-mobile-search"><Search size={16} /><Input aria-label="Search transactions" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search transactions..." /></div>}
        </header>

        <main className="ll-main" id="ll-main">
          {page === "Dashboard" && <>
            <PageHeading title={pageTitle[page]} description={`${monthLabel} income, expenses, savings and goals`} />
            <div className="ll-collaborators" aria-label="Five sample workspace members"><span>RM</span><span>JW</span><span>AK</span><i>+2</i></div>
            <div className="ll-kpi-grid">
              <MetricCard title="Balance overview" value={money(balance)} icon={Wallet} tone="orange" badge="8.2%" onClick={() => navigate("Cards & Bank")}>
                <DotChart />
              </MetricCard>
              <MetricCard title="Monthly income" value={money(monthlyIncome)} icon={CalendarDays} tone="blue" subtitle="+3.1%  vs last month" onClick={() => navigate("Income")}>
                <BarChart />
              </MetricCard>
              <MetricCard title="Spending" value={money(monthlySpend)} icon={CreditCard} tone="green" subtitle={`${spendPercent}% of income spent`} onClick={() => navigate("Analytics")}>
                <div className="ll-progress"><i style={{ width: `${spendPercent}%` }} /><b /></div>
              </MetricCard>
            </div>

            <div className="ll-board-toolbar">
              <div className="ll-board-label"><h2>My Finances</h2><span />
                <div className="ll-board-tabs" aria-label="Finance views">{(["Summary", "Budget Board", "Transactions", "Goals"] as BoardTab[]).map((tab) => <button key={tab} className={boardTab === tab ? "is-active" : ""} aria-pressed={boardTab === tab} onClick={() => setBoardTab(tab)}>{tab === "Summary" ? <FileText size={16} /> : tab === "Budget Board" ? <SlidersHorizontal size={16} /> : tab === "Transactions" ? <Activity size={16} /> : <BriefcaseBusiness size={16} />}{tab}</button>)}</div>
              </div>
              <div className="ll-board-actions">
                <Button variant="outline" size="sm" onClick={() => { setDraftStatus(filterStatus); setDraftLaneFilter(filterLane); setDialog("filter"); }}><Filter size={15} />Filter{filterStatus !== "All statuses" || filterLane !== "All categories" ? <i className="ll-filter-dot" /> : null}</Button>
                <Select value={year} onValueChange={setYear}><SelectTrigger className="ll-year-select" aria-label="Financial year"><CalendarDays size={16} /><SelectValue /></SelectTrigger><SelectContent>{["2026", "2025", "2024"].map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent></Select>
              </div>
            </div>

            {boardTab === "Budget Board" && <BudgetBoard entries={searchFilteredEntries} filterStatus={filterStatus} filterLane={filterLane} onOpen={openEntry} onAdd={(lane) => lane === "goals" ? openGoal() : openTransaction(lane)} />}
            {boardTab === "Summary" && <SummaryView entries={searchFilteredEntries} onOpen={openEntry} onNavigate={navigate} />}
            {boardTab === "Transactions" && <TransactionsList entries={visibleTransactions} onOpen={openEntry} emptyLabel="No transactions match this view." />}
            {boardTab === "Goals" && <GoalsView entries={goals} onOpen={openEntry} onAdd={openGoal} />}
          </>}

          {page === "Analytics" && <><PageHeading title="Analytics" description={`A monthly view of your sample finances · ${monthLabel}`} action={<Button variant="outline" onClick={exportEntries}><Download size={15} />Download report</Button>} /><AnalyticsView income={monthlyIncome} spend={monthlySpend} onNavigate={navigate} /></>}
          {isTransactionsPage && <><PageHeading title={pageTitle[page]} description="Review income, bills and everyday spending. Sample data only." action={<Button onClick={() => openTransaction(page === "Income" ? "income" : page === "Recurring Bills" ? "bills" : "spending")}><Plus size={15} />Add transaction</Button>} /><div className="ll-list-toolbar"><span>{visibleTransactions.length} sample records</span><Button variant="outline" size="sm" onClick={() => { setDraftStatus(filterStatus); setDraftLaneFilter(filterLane); setDialog("filter"); }}><Filter size={15} />Filter</Button></div><TransactionsList entries={visibleTransactions} onOpen={openEntry} emptyLabel="No sample transactions match your filters." /></>}
          {["Cards & Bank", "Savings", "Investments"].includes(page) && <><PageHeading title={pageTitle[page]} description="Illustrative account balances · no bank connection" action={<Button variant="outline" onClick={() => navigate("All Transactions")}><Activity size={15} />View transactions</Button>} /><AccountsView page={page as "Cards & Bank" | "Savings" | "Investments"} onOpen={() => navigate("All Transactions")} /></>}
          {["Savings Goals"].includes(page) && <><PageHeading title="Savings goals" description="Track progress toward things that matter." action={<Button onClick={openGoal}><Plus size={15} />Add goal</Button>} /><GoalsView entries={goals} onOpen={openEntry} onAdd={openGoal} /></>}
          {page === "Budget Limits" && <><PageHeading title="Budget limits" description="Set a monthly spending guide. Changes stay in this preview." /><BudgetLimits spend={monthlySpend} limit={budgetLimit} setLimit={setBudgetLimit} onSave={() => notify("Budget limit saved in this preview.")} /></>}
          {page === "Help Center" && <><PageHeading title="Help center" description="Answers for your personal finance workspace." /><HelpCenter open={faqOpen} setOpen={setFaqOpen} draft={supportDraft} setDraft={setSupportDraft} onSubmit={(event) => { event.preventDefault(); setSupportDraft(""); notify("Support note saved in this browser session.", "No message was sent."); }} /></>}
          {page === "Settings" && <><PageHeading title="Settings" description="Manage your sample workspace preferences." /><SettingsView alerts={alertsEnabled} setAlerts={setAlertsEnabled} weeklyEmail={weeklyEmail} setWeeklyEmail={setWeeklyEmail} onSave={() => notify("Preferences saved in this preview.")} /></>}
        </main>

        <footer className="ll-footer"><span>Sample workspace · changes stay in this preview</span><span><ShieldCheck size={14} />No bank connection</span></footer>
      </div>
    </div>

    <nav className="ll-mobile-nav" aria-label="Mobile navigation">
      {([{ page: "Dashboard" as Page, icon: Home, label: "Overview" }, { page: "All Transactions" as Page, icon: Activity, label: "Activity" }, { page: "Savings Goals" as Page, icon: PiggyBank, label: "Goals" }]).map(({ page: target, icon: Icon, label }) => <button key={target} className={page === target ? "is-active" : ""} aria-current={page === target ? "page" : undefined} onClick={() => navigate(target)}><Icon size={18} /><span>{label}</span></button>)}
      <button onClick={() => setMobileMoreOpen(true)}><Menu size={18} /><span>More</span></button>
    </nav>

    <Dialog open={dialog !== null} onOpenChange={(open) => !open && setDialog(null)}>
      {dialog === "transaction" && <DialogContent className="ll-dialog" aria-describedby="ll-transaction-description">
        <DialogHeader><DialogTitle>Add a transaction</DialogTitle><DialogDescription id="ll-transaction-description">Add illustrative data to this local preview. No account will be changed.</DialogDescription></DialogHeader>
        <form className="ll-dialog-form" onSubmit={addTransaction}>
          <div className="ll-form-field"><Label htmlFor="ll-entry-title">Description</Label><Input id="ll-entry-title" value={draftTitle} onChange={(event) => setDraftTitle(event.target.value)} placeholder="e.g. Market groceries" required maxLength={70} /></div>
          <div className="ll-form-grid"><div className="ll-form-field"><Label htmlFor="ll-entry-lane">Type</Label><Select value={draftLane} onValueChange={(value) => { const lane = value as Lane; setDraftLane(lane); setDraftCategory(lane === "bills" ? "Housing" : lane === "income" ? "Salary" : "Groceries"); }}><SelectTrigger id="ll-entry-lane"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="bills">Bills & fixed</SelectItem><SelectItem value="spending">Daily spending</SelectItem><SelectItem value="income">Income</SelectItem></SelectContent></Select></div><div className="ll-form-field"><Label htmlFor="ll-entry-category">Category</Label><Input id="ll-entry-category" value={draftCategory} onChange={(event) => setDraftCategory(event.target.value)} required maxLength={32} /></div></div>
          <div className="ll-form-grid"><div className="ll-form-field"><Label htmlFor="ll-entry-amount">Amount</Label><div className="ll-money-input"><span>$</span><Input id="ll-entry-amount" type="number" min="0.01" max="9999999" step="0.01" value={draftAmount} onChange={(event) => setDraftAmount(event.target.value)} required /></div></div><div className="ll-form-field"><Label htmlFor="ll-entry-date">Date</Label><Input id="ll-entry-date" type="date" value={draftDate} onChange={(event) => setDraftDate(event.target.value)} required /></div></div>
          <DialogFooter><Button type="button" variant="outline" onClick={() => setDialog(null)}>Cancel</Button><Button type="submit">Add transaction</Button></DialogFooter>
        </form>
      </DialogContent>}
      {dialog === "goal" && <DialogContent className="ll-dialog" aria-describedby="ll-goal-description">
        <DialogHeader><DialogTitle>Create a savings goal</DialogTitle><DialogDescription id="ll-goal-description">Goal progress is sample data stored only in this preview.</DialogDescription></DialogHeader>
        <form className="ll-dialog-form" onSubmit={addGoal}>
          <div className="ll-form-field"><Label htmlFor="ll-goal-name">Goal name</Label><Input id="ll-goal-name" value={goalName} onChange={(event) => setGoalName(event.target.value)} placeholder="e.g. Weekend away" required maxLength={60} /></div>
          <div className="ll-form-grid"><div className="ll-form-field"><Label htmlFor="ll-goal-target">Target amount</Label><div className="ll-money-input"><span>$</span><Input id="ll-goal-target" type="number" min="1" max="9999999" value={goalTarget} onChange={(event) => setGoalTarget(event.target.value)} required /></div></div><div className="ll-form-field"><Label htmlFor="ll-goal-date">Target date</Label><Input id="ll-goal-date" type="date" value={goalDate} onChange={(event) => setGoalDate(event.target.value)} required /></div></div>
          <DialogFooter><Button type="button" variant="outline" onClick={() => setDialog(null)}>Cancel</Button><Button type="submit">Create goal</Button></DialogFooter>
        </form>
      </DialogContent>}
      {dialog === "filter" && <DialogContent className="ll-dialog" aria-describedby="ll-filter-description">
        <DialogHeader><DialogTitle>Filter your finances</DialogTitle><DialogDescription id="ll-filter-description">Choose which sample records appear in the board and transaction list.</DialogDescription></DialogHeader>
        <div className="ll-dialog-form"><div className="ll-form-field"><Label htmlFor="ll-filter-status">Status</Label><Select value={draftStatus} onValueChange={setDraftStatus}><SelectTrigger id="ll-filter-status"><SelectValue /></SelectTrigger><SelectContent>{["All statuses", "Paid", "Cleared", "Pending", "Overdue", "Deposited", "In Progress", "On Track", "Almost There"].map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent></Select></div>
          <div className="ll-form-field"><Label htmlFor="ll-filter-category">Category</Label><Select value={draftLaneFilter} onValueChange={setDraftLaneFilter}><SelectTrigger id="ll-filter-category"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="All categories">All categories</SelectItem>{lanes.map((lane) => <SelectItem key={lane.id} value={lane.title}>{lane.title}</SelectItem>)}</SelectContent></Select></div>
          <DialogFooter><Button variant="outline" onClick={() => { setFilterStatus("All statuses"); setFilterLane("All categories"); setDialog(null); }}>Clear filters</Button><Button onClick={() => { setFilterStatus(draftStatus); setFilterLane(draftLaneFilter); setDialog(null); }}>Apply filters</Button></DialogFooter>
        </div>
      </DialogContent>}
      {dialog === "share" && <DialogContent className="ll-dialog" aria-describedby="ll-share-description">
        <DialogHeader><DialogTitle>Share this workspace</DialogTitle><DialogDescription id="ll-share-description">This sample link contains no account or financial data.</DialogDescription></DialogHeader>
        <div className="ll-share-row"><Input aria-label="Sample workspace link" value="https://ledgerline.example/sample-workspace" readOnly /><Button onClick={copyShareLink}>{copied ? <Check size={15} /> : <Share2 size={15} />}{copied ? "Copied" : "Copy link"}</Button></div>
        <p className="ll-dialog-note">Demo only · no external workspace is created.</p>
      </DialogContent>}
      {dialog === "entry" && selectedEntry && <DialogContent className="ll-dialog" aria-describedby="ll-entry-description">
        <DialogHeader><DialogTitle>{selectedEntry.title}</DialogTitle><DialogDescription id="ll-entry-description">Sample {selectedEntry.lane === "goals" ? "savings goal" : selectedEntry.lane === "income" ? "income record" : "transaction"} · {selectedEntry.category}</DialogDescription></DialogHeader>
        <div className="ll-entry-details"><span>Amount</span><b>{selectedEntry.lane === "goals" ? `${money(selectedEntry.amount)} of ${money(selectedEntry.target ?? 0)}` : money(selectedEntry.amount)}</b><span>Date</span><b>{selectedEntry.date}</b><span>Note</span><b>{selectedEntry.note}</b></div>
        <div className="ll-form-field"><Label htmlFor="ll-entry-status">Status</Label><Select value={detailStatus} onValueChange={(value) => setDetailStatus(value as EntryStatus)}><SelectTrigger id="ll-entry-status"><SelectValue /></SelectTrigger><SelectContent>{(selectedEntry.lane === "goals" ? ["On Track", "In Progress", "Almost There"] : selectedEntry.lane === "income" ? ["Deposited", "In Progress", "Pending"] : ["Paid", "Cleared", "Pending", "Overdue"]).map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent></Select></div>
        <DialogFooter><Button variant="outline" onClick={() => setDialog(null)}>Cancel</Button><Button onClick={saveEntryStatus}>Save status</Button></DialogFooter>
      </DialogContent>}
    </Dialog>

    <Dialog open={mobileMoreOpen} onOpenChange={setMobileMoreOpen}><DialogContent className="ll-dialog ll-mobile-pages" aria-describedby="ll-mobile-pages-description"><DialogHeader><DialogTitle>Finance pages</DialogTitle><DialogDescription id="ll-mobile-pages-description">Choose a workspace section.</DialogDescription></DialogHeader><nav className="ll-mobile-page-list" aria-label="More finance pages">{allPages.filter((item) => !["Dashboard", "All Transactions", "Savings Goals"].includes(item.id)).map(({ id, icon: Icon }) => <button key={id} onClick={() => navigate(id)}><Icon size={17} /><span>{id}</span><ArrowRight size={14} /></button>)}</nav></DialogContent></Dialog>
    <Toast {...toast} onOpenChange={(open) => setToast((current) => ({ ...current, open }))} />
  </div>;
}

function NavButton({ page, current, icon: Icon, count, onClick }: { page: Page; current: Page; icon: LucideIcon; count?: number; onClick: (page: Page) => void }) {
  return <button className={`ll-nav-link ${current === page ? "is-active" : ""}`} aria-current={current === page ? "page" : undefined} onClick={() => onClick(page)}><Icon size={18} /><span>{page}</span>{count !== undefined && <i>{count}</i>}</button>;
}

function PageHeading({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) {
  return <div className="ll-page-heading"><div><h1>{title}</h1><p>{description}</p></div>{action && <div className="ll-page-heading-action">{action}</div>}</div>;
}

function MetricCard({ title, value, icon: Icon, tone, subtitle, badge, onClick, children }: { title: string; value: string; icon: LucideIcon; tone: string; subtitle?: string; badge?: string; onClick: () => void; children: React.ReactNode }) {
  return <Card className="ll-metric-card"><CardContent>
    <div className="ll-metric-heading"><span className={`ll-metric-icon tone-${tone}`}><Icon size={17} /></span><span>{title}</span>{badge && <Badge className="ll-growth-badge"><TrendingUp size={13} />{badge}</Badge>}{!badge && title === "Monthly income" && <Button variant="ghost" size="icon" aria-label="Monthly income details" onClick={onClick}><MoreHorizontal size={18} /></Button>}{title === "Spending" && <Button variant="ghost" size="icon" aria-label="Open spending analytics" onClick={onClick}><ArrowUpRight size={17} /></Button>}</div>
    <strong className="ll-metric-value">{value}</strong>{subtitle && <p className={title === "Monthly income" ? "ll-income-change" : "ll-metric-subtitle"}>{title === "Monthly income" && <b>+3.1%</b>}{subtitle.replace("+3.1%  ", "")}</p>}
    <div className="ll-metric-chart">{children}</div>
  </CardContent></Card>;
}

function DotChart() {
  return <div className="ll-dot-chart" aria-hidden="true">{Array.from({ length: 64 }, (_, index) => <i key={index} className={index > 25 && index < 40 && index % 4 !== 0 ? "is-highlight" : ""} />)}</div>;
}

function BarChart() {
  const values = [15, 23, 17, 30, 23, 40, 32, 55, 43, 63, 51, 82, 68, 47, 75, 59, 39, 56, 31, 43, 25, 36, 20, 29];
  return <div className="ll-mini-bars" aria-label="Illustrative monthly income trend" role="img">{values.map((value, index) => <i key={index} style={{ height: `${value}%` }} className={index > 12 && index < 20 ? "is-blue" : ""} />)}</div>;
}

function BudgetBoard({ entries, filterStatus, filterLane, onOpen, onAdd }: { entries: BoardEntry[]; filterStatus: string; filterLane: string; onOpen: (entry: BoardEntry) => void; onAdd: (lane: Lane) => void }) {
  const visibleLanes = lanes.filter((lane) => filterLane === "All categories" || lane.title === filterLane);
  return <div className="ll-board-grid">{visibleLanes.map(({ id, title, icon: Icon, action }) => {
    const items = entries.filter((entry) => entry.lane === id && (filterStatus === "All statuses" || entry.status === filterStatus));
    return <section className="ll-board-lane" key={id} aria-label={title}>
      <header className="ll-lane-heading"><span className="ll-lane-icon"><Icon size={17} /></span><h3>{title}</h3><Badge>{items.length}</Badge><Button variant="ghost" size="icon" aria-label={`Add item to ${title}`} onClick={() => onAdd(id)}><MoreHorizontal size={18} /></Button></header>
      <div className="ll-lane-cards">{items.map((entry) => <EntryCard key={entry.id} entry={entry} onOpen={onOpen} />)}{!items.length && <p className="ll-empty">No sample items in this view.</p>}</div>
      <Button variant="ghost" className="ll-add-lane-item" onClick={() => onAdd(id)}><Plus size={15} />{action}</Button>
    </section>;
  })}</div>;
}

function EntryCard({ entry, onOpen }: { entry: BoardEntry; onOpen: (entry: BoardEntry) => void }) {
  const isGoal = entry.lane === "goals";
  const progress = isGoal ? Math.min(100, Math.round(entry.amount / (entry.target || 1) * 100)) : 0;
  return <article className="ll-entry-card">
    <div className="ll-entry-top"><span className="ll-entry-category">{entry.lane === "goals" ? <ShieldCheck size={14} /> : entry.lane === "income" ? <CircleDollarSign size={14} /> : <CreditCard size={14} />}{entry.category}</span><StatusBadge status={entry.status} /></div>
    <button className="ll-entry-open" onClick={() => onOpen(entry)} aria-label={`Open ${entry.title} details`}><span>{entry.title}</span><strong>{money(entry.amount)}{isGoal && <small> of {money(entry.target ?? 0)}</small>}</strong></button>
    {isGoal && <div className={`ll-goal-progress tone-${progress > 80 ? "green" : entry.category === "Travel" ? "orange" : "purple"}`}><i style={{ width: `${progress}%` }} /></div>}
    <div className="ll-entry-footer"><span><CalendarDays size={13} />{entry.date}</span><small>{entry.note}</small></div>
  </article>;
}

function StatusBadge({ status }: { status: EntryStatus }) {
  return <Badge className={`ll-status ll-status-${status.toLowerCase().replaceAll(" ", "-")}`}>{status}</Badge>;
}

function SummaryView({ entries, onOpen, onNavigate }: { entries: BoardEntry[]; onOpen: (entry: BoardEntry) => void; onNavigate: (page: Page) => void }) {
  const recent = entries.filter((entry) => entry.lane !== "goals").slice(0, 4);
  return <div className="ll-summary-grid"><Card><CardHeader><div><CardTitle>Monthly cash flow</CardTitle><p>Sample income and spending · April</p></div><Badge className="ll-growth-badge"><TrendingUp size={13} />8.2%</Badge></CardHeader><CardContent><WideChart /><div className="ll-chart-legend"><span><i className="legend-income" />Income</span><span><i className="legend-spend" />Spending</span></div></CardContent></Card><Card><CardHeader><div><CardTitle>Spending by category</CardTitle><p>Illustrative month-to-date breakdown</p></div><Button variant="ghost" size="sm" onClick={() => onNavigate("Analytics")}>Details <ArrowRight size={14} /></Button></CardHeader><CardContent><CategoryBars /></CardContent></Card><Card className="ll-summary-recent"><CardHeader><div><CardTitle>Recent transactions</CardTitle><p>Latest sample activity</p></div><Button variant="ghost" size="sm" onClick={() => onNavigate("All Transactions")}>View all <ArrowRight size={14} /></Button></CardHeader><CardContent><TransactionsList entries={recent} onOpen={onOpen} emptyLabel="No recent activity." /></CardContent></Card></div>;
}

function TransactionsList({ entries, onOpen, emptyLabel }: { entries: BoardEntry[]; onOpen: (entry: BoardEntry) => void; emptyLabel: string }) {
  if (!entries.length) return <div className="ll-empty-state"><Search size={20} /><p>{emptyLabel}</p></div>;
  return <div className="ll-transactions-list" role="list">{entries.map((entry) => <div className="ll-transaction-row" role="listitem" key={entry.id}>
    <span className={`ll-row-icon lane-${entry.lane}`}>{entry.lane === "income" ? <ArrowUpRight size={17} /> : <CreditCard size={17} />}</span>
    <button className="ll-transaction-name" onClick={() => onOpen(entry)}><b>{entry.title}</b><small>{entry.category} · {entry.date}</small></button>
    <StatusBadge status={entry.status} /><strong className={entry.lane === "income" ? "is-income" : ""}>{entry.lane === "income" ? "+" : "−"}{money(entry.amount)}</strong>
    <Button variant="ghost" size="icon" aria-label={`Open ${entry.title} details`} onClick={() => onOpen(entry)}><ArrowRight size={16} /></Button>
  </div>)}</div>;
}

function GoalsView({ entries, onOpen, onAdd }: { entries: BoardEntry[]; onOpen: (entry: BoardEntry) => void; onAdd: () => void }) {
  return <div className="ll-goals-grid">{entries.map((entry) => <Card className="ll-goal-card" key={entry.id}><CardHeader><div><span className="ll-lane-icon"><PiggyBank size={17} /></span><CardTitle>{entry.category}</CardTitle></div><StatusBadge status={entry.status} /></CardHeader><CardContent><button className="ll-entry-open" onClick={() => onOpen(entry)}><span>{entry.title}</span><strong>{money(entry.amount)} <small>of {money(entry.target ?? 0)}</small></strong></button><div className="ll-goal-progress tone-blue"><i style={{ width: `${Math.min(100, Math.round(entry.amount / (entry.target || 1) * 100))}%` }} /></div><div className="ll-entry-footer"><span><CalendarDays size={13} />{entry.date}</span><small>{entry.note}</small></div></CardContent></Card>)}<button className="ll-goal-add" onClick={onAdd}><Plus size={18} />Add a savings goal</button></div>;
}

function WideChart() {
  return <svg className="ll-wide-chart" viewBox="0 0 620 190" role="img" aria-label="Illustrative monthly income and spending chart" preserveAspectRatio="none"><path className="ll-chart-gridline" d="M0 30H620M0 75H620M0 120H620M0 165H620" /><path className="ll-chart-area" d="M0 145 52 132 104 141 156 98 208 117 260 78 312 91 364 48 416 67 468 35 520 57 572 27 620 42V190H0Z" /><polyline className="ll-chart-line" points="0,145 52,132 104,141 156,98 208,117 260,78 312,91 364,48 416,67 468,35 520,57 572,27 620,42" /><polyline className="ll-chart-line ll-chart-secondary" points="0,165 52,156 104,160 156,143 208,152 260,126 312,138 364,115 416,124 468,100 520,113 572,96 620,105" /></svg>;
}

function CategoryBars() {
  return <div className="ll-category-bars">{[{ name: "Housing", value: "$1,250", width: 78 }, { name: "Groceries", value: "$684", width: 53 }, { name: "Transport", value: "$412", width: 34 }, { name: "Utilities", value: "$296", width: 23 }].map((item) => <div key={item.name}><span>{item.name}</span><i><b style={{ width: `${item.width}%` }} /></i><strong>{item.value}</strong></div>)}</div>;
}

function AnalyticsView({ income, spend, onNavigate }: { income: number; spend: number; onNavigate: (page: Page) => void }) {
  return <><div className="ll-analytics-metrics"><MetricCard title="Income this month" value={money(income)} icon={Banknote} tone="blue" subtitle="Deposited and expected" onClick={() => onNavigate("Income")}><BarChart /></MetricCard><MetricCard title="Spending this month" value={money(spend)} icon={CreditCard} tone="green" subtitle="Across bills and daily spending" onClick={() => onNavigate("Expenses")}><div className="ll-progress"><i style={{ width: `${Math.min(100, Math.round(spend / income * 100))}%` }} /><b /></div></MetricCard></div><div className="ll-summary-grid"><Card><CardHeader><div><CardTitle>Income and spending</CardTitle><p>Six-month illustrative trend</p></div><Badge>2026</Badge></CardHeader><CardContent><WideChart /><div className="ll-chart-legend"><span><i className="legend-income" />Income</span><span><i className="legend-spend" />Spending</span></div></CardContent></Card><Card><CardHeader><div><CardTitle>Where your money goes</CardTitle><p>Sample category totals</p></div></CardHeader><CardContent><CategoryBars /></CardContent></Card></div><Card className="ll-insight-card"><CardContent><span className="ll-insight-icon"><TrendingUp size={18} /></span><div><b>Spending is within your sample plan</b><p>Housing is your largest category this month. Review transactions to adjust any status.</p></div><Button variant="outline" onClick={() => onNavigate("All Transactions")}>Review activity <ArrowRight size={15} /></Button></CardContent></Card></>;
}

function AccountsView({ page, onOpen }: { page: "Cards & Bank" | "Savings" | "Investments"; onOpen: () => void }) {
  const visible = accounts.filter((account) => page === "Cards & Bank" || account.type === page);
  return <div className="ll-accounts-grid">{visible.map((account) => <Card className="ll-account-card" key={account.name}><CardHeader><span className={`ll-account-icon tone-${account.type === "Investments" ? "orange" : account.type === "Savings" ? "green" : "blue"}`}>{account.type === "Investments" ? <TrendingUp size={18} /> : account.type === "Savings" ? <PiggyBank size={18} /> : <Landmark size={18} />}</span><Badge>{account.type}</Badge></CardHeader><CardContent><h2>{account.name}</h2><p>{account.bank}</p><strong>{money(account.amount)}</strong><small>Illustrative balance · not a live bank feed</small><Button variant="outline" size="sm" onClick={onOpen}>View activity <ArrowRight size={14} /></Button></CardContent></Card>)}</div>;
}

function BudgetLimits({ spend, limit, setLimit, onSave }: { spend: number; limit: string; setLimit: (value: string) => void; onSave: () => void }) {
  const categories = [{ name: "Monthly spending", amount: spend, target: Number(limit) || 1 }, { name: "Housing", amount: 1250, target: 1600 }, { name: "Food & groceries", amount: 684, target: 900 }, { name: "Transport", amount: 412, target: 600 }];
  return <Card className="ll-budget-card"><CardHeader><div><CardTitle>Monthly budget</CardTitle><p>Set a sample spending limit and review category progress.</p></div><Badge className="ll-status ll-status-on-track">Local preview</Badge></CardHeader><CardContent><div className="ll-budget-limit"><div className="ll-form-field"><Label htmlFor="ll-budget-limit">Monthly limit</Label><div className="ll-money-input"><span>$</span><Input id="ll-budget-limit" type="number" min="1" value={limit} onChange={(event) => setLimit(event.target.value)} /></div></div><Button onClick={onSave}>Save limit</Button></div><div className="ll-budget-list">{categories.map((item) => <div key={item.name}><span><b>{item.name}</b><small>{money(item.amount)} of {money(item.target)}</small></span><i><b style={{ width: `${Math.min(100, Math.round(item.amount / item.target * 100))}%` }} /></i><strong>{Math.round(item.amount / item.target * 100)}%</strong></div>)}</div></CardContent></Card>;
}

function HelpCenter({ open, setOpen, draft, setDraft, onSubmit }: { open: number; setOpen: (value: number) => void; draft: string; setDraft: (value: string) => void; onSubmit: (event: React.FormEvent<HTMLFormElement>) => void }) {
  const questions = ["How does sample data work?", "Can I connect a bank account?", "Are budget changes saved?"];
  const answers = ["Entries are illustrative and stay in this preview session only.", "No. This template has no bank connection or external financial service.", "Changes update the local preview; nothing is sent to an account or server."];
  return <div className="ll-help-grid"><Card><CardHeader><div><CardTitle>Frequently asked</CardTitle><p>About this sample workspace</p></div></CardHeader><CardContent className="ll-faq-list">{questions.map((question, index) => <section key={question}><button aria-expanded={open === index} onClick={() => setOpen(open === index ? -1 : index)}>{question}<ChevronDown size={16} className={open === index ? "is-open" : ""} /></button>{open === index && <p>{answers[index]}</p>}</section>)}</CardContent></Card><Card><CardHeader><div><CardTitle>Contact support</CardTitle><p>Save a local note. No message will be sent.</p></div></CardHeader><CardContent><form className="ll-support-form" onSubmit={onSubmit}><Label htmlFor="ll-support-note">What do you need help with?</Label><Textarea id="ll-support-note" value={draft} onChange={(event) => setDraft(event.target.value)} required maxLength={500} placeholder="Write a short note..." /><Button type="submit">Save note</Button></form></CardContent></Card></div>;
}

function SettingsView({ alerts, setAlerts, weeklyEmail, setWeeklyEmail, onSave }: { alerts: boolean; setAlerts: (value: boolean) => void; weeklyEmail: boolean; setWeeklyEmail: (value: boolean) => void; onSave: () => void }) {
  return <Card className="ll-settings-card"><CardHeader><div><CardTitle>Workspace preferences</CardTitle><p>These settings affect only this local preview.</p></div><Settings size={18} /></CardHeader><CardContent><div className="ll-settings-row"><span><b>Transaction reminders</b><small>Show sample reminders for upcoming bills.</small></span><Switch checked={alerts} onCheckedChange={setAlerts} aria-label="Transaction reminders" /></div><div className="ll-settings-row"><span><b>Weekly summary</b><small>Preview a weekly finance summary preference.</small></span><Switch checked={weeklyEmail} onCheckedChange={setWeeklyEmail} aria-label="Weekly summary" /></div><div className="ll-settings-footer"><span><ShieldCheck size={15} />No external account is connected.</span><Button onClick={onSave}>Save preferences</Button></div></CardContent></Card>;
}

export default LedgerlineFinance;

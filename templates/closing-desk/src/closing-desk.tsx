import * as React from "react";
import {
  ArrowRight,
  Bell,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Clock3,
  Eye,
  FileText,
  Home,
  Inbox as InboxIcon,
  Menu,
  Search,
  Send,
  Undo2,
  Users
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
  Sidebar,
  Textarea,
  Toast,
  ToastProvider
} from "@design-templates/ui";
import "./closing-desk.css";

type Page = "Home" | "Inbox";
type InboxFilter = "All" | "Approvals" | "Conflicts" | "Quiet parties" | "Unclear reads";
type InboxItem = {
  id: string;
  title: string;
  property: string;
  detail: string;
  age: string;
  filter: Exclude<InboxFilter, "All">;
  icon: typeof FileText;
};

const navigation: Array<{ id: Page; label: string; icon: React.ReactNode }> = [
  { id: "Home", label: "Home", icon: <Home size={20} aria-hidden="true" /> },
  { id: "Inbox", label: "Inbox", icon: <InboxIcon size={20} aria-hidden="true" /> }
];

const inboxItems: InboxItem[] = [
  { id: "addendum", title: "Addendum 2 moves closing to Dec 23", property: "1482 Alder Way", detail: "11 changes ready from Clock", age: "Today", filter: "Approvals", icon: FileText },
  { id: "rate-lock", title: "Rate lock ends before the new closing", property: "1482 Alder Way", detail: "Lender flagged a date conflict", age: "8 min", filter: "Unclear reads", icon: CircleAlert },
  { id: "seller-credit", title: "Seller credit does not match", property: "905 Mesa Verde Rd", detail: "Asked Sophia Williams · waiting on her reply", age: "2 h", filter: "Conflicts", icon: FileText },
  { id: "appraiser", title: "Appraiser quiet for 2 days", property: "2310 Harbor View Dr", detail: "Collector followed up twice", age: "1 h", filter: "Quiet parties", icon: Clock3 },
  { id: "weekly-update", title: "Weekly update ready for Emma and Matthew", property: "1482 Alder Way", detail: "Review before it goes out", age: "3 h", filter: "Quiet parties", icon: Users },
  { id: "counter-offer", title: "Counter offer 2 is missing an initial", property: "41 Larkspur Ln", detail: "Page 2 · buyer initials", age: "Yesterday", filter: "Approvals", icon: CheckCircle2 }
];

const filterOrder: InboxFilter[] = ["All", "Approvals", "Conflicts", "Quiet parties", "Unclear reads"];
const initialDraft = "Hi Sophia, quick check on Counter offer 2 for 905 Mesa Verde Rd: page 3 shows an $8,500 seller credit and the signature page shows $8,000. Which amount did your sellers agree to?";
const genericDraft = "Hi, could you share an update on this closing item when you have a moment?";

function draftFor(id: string) {
  return id === "seller-credit" ? initialDraft : genericDraft;
}

export function ClosingDesk() {
  return <ToastProvider><ClosingWorkspace /></ToastProvider>;
}

function ClosingWorkspace() {
  const [page, setPage] = React.useState<Page>("Home");
  const [selectedDay, setSelectedDay] = React.useState(16);
  const [selectedId, setSelectedId] = React.useState("seller-credit");
  const [filter, setFilter] = React.useState<InboxFilter>("All");
  const [inboxQuery, setInboxQuery] = React.useState("");
  const [draft, setDraft] = React.useState(initialDraft);
  const [sentMessages, setSentMessages] = React.useState<Record<string, string>>({});
  const [undoMessage, setUndoMessage] = React.useState<{ id: string; text: string } | null>(null);
  const [decision, setDecision] = React.useState<string | null>(null);
  const [toast, setToast] = React.useState({ open: false, title: "" });
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [activityOpen, setActivityOpen] = React.useState(false);
  const [profileOpen, setProfileOpen] = React.useState(false);
  const [searchText, setSearchText] = React.useState("");
  const [searchNotice, setSearchNotice] = React.useState("");
  const messageInput = React.useRef<HTMLTextAreaElement>(null);

  const activeItem = inboxItems.find((item) => item.id === selectedId) ?? inboxItems[2];
  const sentMessage = sentMessages[selectedId] ?? null;
  const needsAttention = 6 - Object.keys(sentMessages).length;
  const visibleItems = inboxItems.filter((item) => {
    const matchesFilter = filter === "All" || item.filter === filter;
    const searchable = `${item.title} ${item.property} ${item.detail}`.toLowerCase();
    return matchesFilter && searchable.includes(inboxQuery.trim().toLowerCase());
  });

  function showToast(title: string) {
    setToast({ open: true, title });
  }

  function selectItem(item: InboxItem) {
    setSelectedId(item.id);
    setDraft(sentMessages[item.id] ?? draftFor(item.id));
    setDecision(null);
  }

  function openInbox(itemId?: string) {
    setPage("Inbox");
    setFilter("All");
    setInboxQuery("");
    const item = inboxItems.find((candidate) => candidate.id === itemId);
    if (item) selectItem(item);
  }

  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = searchText.trim();
    if (!query) {
      setSearchNotice("Enter a name, property, or closing issue to search.");
      return;
    }
    const match = inboxItems.find((item) => `${item.title} ${item.property} ${item.detail}`.toLowerCase().includes(query.toLowerCase()));
    setPage("Inbox");
    setFilter("All");
    setInboxQuery(query);
    if (match) {
      selectItem(match);
      setSearchNotice("");
      setSearchOpen(false);
    } else {
      setSearchNotice(`No inbox item matched “${query}”.`);
    }
  }

  function sendMessage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = draft.trim();
    if (!message || sentMessages[selectedId]) return;
    setSentMessages((current) => ({ ...current, [selectedId]: message }));
    setUndoMessage({ id: selectedId, text: message });
    showToast(selectedId === "seller-credit" ? "Message sent to Sophia · local demo only" : "Follow-up marked sent · local demo only");
  }

  function undoSend() {
    if (!undoMessage) return;
    setSentMessages((current) => {
      const next = { ...current };
      delete next[undoMessage.id];
      return next;
    });
    setSelectedId(undoMessage.id);
    setDraft(undoMessage.text);
    setDecision(null);
    setUndoMessage(null);
    setToast({ open: false, title: "" });
  }

  function changePage(nextPage: string) {
    if (nextPage === "Home" || nextPage === "Inbox") {
      setPage(nextPage);
      if (nextPage === "Inbox") setInboxQuery("");
    }
  }

  const countFor = (filterName: InboxFilter) => filterName === "All"
    ? needsAttention
    : inboxItems.filter((item) => item.filter === filterName).length;

  return <main className="closing-desk" aria-label="Closing Desk sample workspace">
    <div className="closing-app">
      <header className="closing-topbar">
        <a className="closing-brand" href="#home" onClick={(event) => { event.preventDefault(); setPage("Home"); }} aria-label="Closing Desk home">
          <span className="closing-brand-mark"><Building2 size={20} aria-hidden="true" /></span>
          <span>Closing Desk</span>
        </a>
        <nav className="closing-desktop-nav" aria-label="Primary navigation">
          {navigation.map((item) => <Button key={item.id} variant={page === item.id ? "secondary" : "ghost"} className={`closing-nav-button${page === item.id ? " is-current" : ""}`} aria-current={page === item.id ? "page" : undefined} onClick={() => changePage(item.id)}>
            {item.icon}{item.label}{item.id === "Inbox" && <span className="closing-nav-count">{needsAttention}</span>}
          </Button>)}
        </nav>
        <div className="closing-top-actions">
          <ResponsiveNavigation items={navigation} activeId={page} onSelect={changePage} label="Open workspace navigation" trigger={<Menu size={18} aria-hidden="true" />} />
          <Button variant="ghost" size="icon" className="closing-icon-button closing-search-trigger" aria-label="Search workspace" onClick={() => { setSearchNotice(""); setSearchOpen(true); }}><Search size={18} aria-hidden="true" /></Button>
          <Button variant="ghost" size="icon" className="closing-icon-button closing-bell" aria-label={`Open inbox notifications, ${needsAttention} items`} onClick={() => openInbox()}>
            <Bell size={18} aria-hidden="true" /><span className="closing-bell-dot" aria-hidden="true" />
          </Button>
          <Button variant="ghost" className="closing-profile" aria-label="Open account details" onClick={() => setProfileOpen(true)}>
            <span className="closing-avatar" aria-hidden="true">LP</span><span className="closing-profile-copy"><strong>Laura Perez</strong><span>Transaction coordinator</span></span>
          </Button>
        </div>
      </header>

      {page === "Home" ? <Dashboard selectedDay={selectedDay} setSelectedDay={setSelectedDay} onReview={openInbox} /> : <InboxPage
        filter={filter}
        setFilter={setFilter}
        selectedId={selectedId}
        selectItem={selectItem}
        visibleItems={visibleItems}
        inboxQuery={inboxQuery}
        setInboxQuery={setInboxQuery}
        needsAttention={needsAttention}
        countFor={countFor}
        activeItem={activeItem}
        draft={draft}
        setDraft={setDraft}
        sentMessage={sentMessage}
        sendMessage={sendMessage}
        decision={decision}
        setDecision={(value) => { setDecision(value); showToast(`Draft decision: use ${value}. Not saved.`); }}
        messageInput={messageInput}
        undoMessage={undoMessage}
        undoSend={undoSend}
        onOpenActivity={() => setActivityOpen(true)}
      />}

      <footer className="closing-footer"><span>Sample workspace · changes stay in this session</span><span>Local preview · not connected <i aria-hidden="true" /></span></footer>
    </div>

    <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
      <DialogContent className="closing-dialog" aria-describedby="closing-search-help">
        <DialogHeader><DialogTitle>Search closings</DialogTitle><DialogDescription id="closing-search-help">Search sample inbox issues and property names. Results stay in this preview.</DialogDescription></DialogHeader>
        <form className="closing-search-form" onSubmit={submitSearch}>
          <Label htmlFor="closing-search-input">Name, property, or issue</Label>
          <Input id="closing-search-input" autoFocus value={searchText} onChange={(event) => setSearchText(event.target.value)} placeholder="Try “Mesa Verde”" />
          {searchNotice && <p className="closing-search-notice" role="status">{searchNotice}</p>}
          <DialogFooter><Button type="button" variant="outline" onClick={() => setSearchOpen(false)}>Cancel</Button><Button type="submit"><Search size={16} aria-hidden="true" />Search</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
      <DialogContent className="closing-dialog" aria-describedby="closing-profile-help">
        <DialogHeader><DialogTitle>Laura Perez</DialogTitle><DialogDescription id="closing-profile-help">Transaction coordinator · Northstar Realty sample workspace.</DialogDescription></DialogHeader>
        <div className="closing-profile-detail"><span className="closing-avatar" aria-hidden="true">LP</span><p>Profile and team settings are sample content. No account is connected.</p></div>
        <DialogFooter><Button onClick={() => setProfileOpen(false)}>Done</Button></DialogFooter>
      </DialogContent>
    </Dialog>

    <Dialog open={activityOpen} onOpenChange={setActivityOpen}>
      <DialogContent className="closing-dialog" aria-describedby="closing-activity-help">
        <DialogHeader><DialogTitle>Recent activity</DialogTitle><DialogDescription id="closing-activity-help">Fictional activity from this sample workspace. No live deal feed is connected.</DialogDescription></DialogHeader>
        <ol className="closing-activity-log"><li><span>7:13 AM</span><strong>Preflight flagged seller-credit mismatch</strong><p>905 Mesa Verde Rd · $500 difference</p></li><li><span>7:12 AM</span><strong>Intake read Counter offer 2</strong><p>905 Mesa Verde Rd · pages 3 and 7</p></li><li><span>Overnight</span><strong>47 routine actions completed</strong><p>Reminders, filed attachments, and document requests</p></li></ol>
        <DialogFooter><Button onClick={() => setActivityOpen(false)}>Done</Button></DialogFooter>
      </DialogContent>
    </Dialog>

    <Toast open={toast.open} title={toast.title} onOpenChange={(open) => setToast((current) => ({ ...current, open }))} />
  </main>;
}

function Dashboard({ selectedDay, setSelectedDay, onReview }: { selectedDay: number; setSelectedDay: (day: number) => void; onReview: (id?: string) => void }) {
  const days = [16, 17, 18, 19, 20];
  const agenda: Record<number, { title: string; property: string; time: string }> = {
    16: { title: "Title commitment due", property: "905 Mesa Verde Rd", time: "Today · 2:00 PM" },
    17: { title: "HOA questionnaire", property: "2310 Harbor View Dr", time: "Tue · 10:30 AM" },
    18: { title: "Inspection response", property: "1482 Alder Way", time: "Wed · 1:00 PM" },
    19: { title: "Rate lock expires", property: "41 Larkspur Ln", time: "Thu · 4:00 PM" },
    20: { title: "Closing packet review", property: "905 Mesa Verde Rd", time: "Fri · 11:00 AM" }
  };
  const selectedAgenda = agenda[selectedDay];
  return <section className="closing-page" aria-labelledby="dashboard-heading">
    <div className="closing-page-heading">
      <div><p className="closing-eyebrow">MONDAY, NOVEMBER 16, 2026</p><h1 id="dashboard-heading">Good morning, Laura</h1><p className="closing-subtitle">Here’s what needs your attention today.</p></div>
      <Button className="closing-primary-action" onClick={() => onReview()}><InboxIcon size={16} aria-hidden="true" />Review inbox <ArrowRight size={15} aria-hidden="true" /></Button>
    </div>

    <div className="closing-stats" aria-label="Closing operations summary">
      <StatCard label="Active deals" value="23" change="4 added this month" icon={<Building2 />} tone="neutral" />
      <StatCard label="Closing this month" value="7" change="Next one in 2 days" icon={<CalendarDays />} tone="accent" />
      <StatCard label="Needs your attention" value="6" change="2 urgent · 4 to review" icon={<CircleAlert />} tone="warning" onClick={() => onReview("seller-credit")} />
      <StatCard label="Agent actions overnight" value="47" change="12 completed today" icon={<CheckCircle2 />} tone="success" />
    </div>

    <div className="closing-main-grid">
      <Card className="closing-panel closing-runway">
        <div className="closing-panel-heading"><div><p className="closing-eyebrow">UP NEXT</p><h2>Closing runway</h2><p>Deals moving toward the finish line</p></div><Button variant="ghost" size="sm" onClick={() => onReview("addendum")}>Open next deal <ChevronRight size={15} aria-hidden="true" /></Button></div>
        <div className="closing-runway-list">
          <RunwayRow date="NOV 18" title="1482 Alder Way" detail="Addendum · 11 changes ready" status="On track" tone="good" id="addendum" onReview={onReview} />
          <RunwayRow date="NOV 20" title="905 Mesa Verde Rd" detail="Seller credit · amount needs review" status="Needs you" tone="attention" id="seller-credit" onReview={onReview} />
          <RunwayRow date="NOV 24" title="2310 Harbor View Dr" detail="Appraisal report due" status="Waiting" tone="waiting" id="appraiser" onReview={onReview} />
          <RunwayRow date="DEC 02" title="41 Larkspur Ln" detail="Counter offer · missing initial" status="Needs you" tone="attention" id="counter-offer" onReview={onReview} />
        </div>
      </Card>

      <Card className="closing-panel closing-alerts">
        <div className="closing-panel-heading"><div><p className="closing-eyebrow">PRIORITY QUEUE</p><h2>Needs a closer look</h2></div><Badge className="closing-count-badge">3 open</Badge></div>
        <div className="closing-alert-list">
          <AlertRow icon={<CircleAlert />} title="Seller credit does not match" detail="905 Mesa Verde Rd · $500 apart" tag="Conflict" id="seller-credit" onReview={onReview} />
          <AlertRow icon={<Clock3 />} title="Rate lock ends before closing" detail="1482 Alder Way · 8 min ago" tag="Time sensitive" id="rate-lock" onReview={onReview} />
          <AlertRow icon={<Users />} title="Appraiser quiet for 2 days" detail="2310 Harbor View Dr · follow-up" tag="Waiting" id="appraiser" onReview={onReview} />
        </div>
        <Button variant="outline" className="closing-view-alerts" onClick={() => onReview()}>View all 6 items <ArrowRight size={15} aria-hidden="true" /></Button>
      </Card>
    </div>

    <div className="closing-bottom-grid">
      <Card className="closing-panel closing-agents">
        <div className="closing-panel-heading"><div><p className="closing-eyebrow">TEAM PULSE</p><h2>Agent activity</h2></div><Badge>47 actions</Badge></div>
        <div className="closing-agent-list">
          <AgentRow initials="SW" name="Sophia Williams" role="Listing agent · 4 open items" status="Active now" tone="active" />
          <AgentRow initials="JM" name="Jordan Miller" role="Buyer agent · 3 open items" status="12 min ago" tone="recent" />
          <AgentRow initials="AC" name="Avery Chen" role="Transaction coordinator · 2 open" status="28 min ago" tone="recent" />
        </div>
        <p className="closing-demo-note">Activity is fictional sample data.</p>
      </Card>

      <Card className="closing-panel closing-calendar">
        <div className="closing-panel-heading"><div><p className="closing-eyebrow">DEADLINES</p><h2>This week</h2></div><Button variant="ghost" size="sm" aria-label="Show this week" onClick={() => setSelectedDay(16)}>Today</Button></div>
        <div className="closing-week" role="group" aria-label="Select a deadline day">
          {days.map((day, index) => <button key={day} type="button" className={`closing-day${selectedDay === day ? " is-selected" : ""}`} aria-label={`November ${day}, 2026${agenda[day] ? ` — ${agenda[day].title}` : ""}`} aria-pressed={selectedDay === day} onClick={() => setSelectedDay(day)}><span>{["MON", "TUE", "WED", "THU", "FRI"][index]}</span><strong>{day}</strong>{agenda[day] && <i aria-hidden="true" />}</button>)}
        </div>
        <div className="closing-agenda"><span className="closing-agenda-icon"><CalendarDays size={17} aria-hidden="true" /></span><div><strong>{selectedAgenda.title}</strong><span>{selectedAgenda.property} · {selectedAgenda.time}</span></div><button type="button" aria-label={`Review ${selectedAgenda.title}`} onClick={() => onReview(selectedDay === 19 ? "rate-lock" : selectedDay === 17 ? "appraiser" : selectedDay === 18 ? "addendum" : "seller-credit")}><ChevronRight size={17} aria-hidden="true" /></button></div>
      </Card>
    </div>
  </section>;
}

function StatCard({ label, value, change, icon, tone, onClick }: { label: string; value: string; change: string; icon: React.ReactNode; tone: string; onClick?: () => void }) {
  const content = <><span className={`closing-stat-icon is-${tone}`}>{icon}</span><span className="closing-stat-copy"><span>{label}</span><strong>{value}</strong><span>{change}</span></span><span className="closing-stat-trend"><ArrowRight size={15} aria-hidden="true" /></span></>;
  return <Card className={`closing-stat-card${onClick ? " is-actionable" : ""}`}>{onClick ? <button type="button" className="closing-stat-button" aria-label={`${label}: ${value}. ${change}. Review inbox`} onClick={onClick}>{content}</button> : <div className="closing-stat-content">{content}</div>}</Card>;
}

function RunwayRow({ date, title, detail, status, tone, id, onReview }: { date: string; title: string; detail: string; status: string; tone: string; id: string; onReview: (id: string) => void }) {
  return <button type="button" className="closing-runway-row" onClick={() => onReview(id)}><span className="closing-runway-date">{date}</span><span className="closing-runway-marker" aria-hidden="true" /><span className="closing-runway-copy"><strong>{title}</strong><span>{detail}</span></span><Badge className={`closing-status is-${tone}`}>{status}</Badge><ChevronRight className="closing-row-arrow" size={16} aria-hidden="true" /></button>;
}

function AlertRow({ icon, title, detail, tag, id, onReview }: { icon: React.ReactNode; title: string; detail: string; tag: string; id: string; onReview: (id: string) => void }) {
  return <button type="button" className="closing-alert-row" onClick={() => onReview(id)}><span className="closing-alert-icon">{icon}</span><span className="closing-alert-copy"><strong>{title}</strong><span>{detail}</span></span><Badge className="closing-alert-tag">{tag}</Badge></button>;
}

function AgentRow({ initials, name, role, status, tone }: { initials: string; name: string; role: string; status: string; tone: string }) {
  return <div className="closing-agent-row"><span className="closing-agent-avatar">{initials}</span><span className="closing-agent-copy"><strong>{name}</strong><span>{role}</span></span><span className={`closing-agent-status is-${tone}`}><i aria-hidden="true" />{status}</span></div>;
}

function InboxPage({ filter, setFilter, selectedId, selectItem, visibleItems, inboxQuery, setInboxQuery, needsAttention, countFor, activeItem, draft, setDraft, sentMessage, sendMessage, decision, setDecision, messageInput, undoMessage, undoSend, onOpenActivity }: {
  filter: InboxFilter;
  setFilter: (value: InboxFilter) => void;
  selectedId: string;
  selectItem: (item: InboxItem) => void;
  visibleItems: InboxItem[];
  inboxQuery: string;
  setInboxQuery: (value: string) => void;
  needsAttention: number;
  countFor: (value: InboxFilter) => number;
  activeItem: InboxItem;
  draft: string;
  setDraft: (value: string) => void;
  sentMessage: string | null;
  sendMessage: (event: React.FormEvent<HTMLFormElement>) => void;
  decision: string | null;
  setDecision: (value: string) => void;
  messageInput: React.RefObject<HTMLTextAreaElement | null>;
  undoMessage: { id: string; text: string } | null;
  undoSend: () => void;
  onOpenActivity: () => void;
}) {
  return <section className="closing-page closing-inbox-page" aria-labelledby="inbox-heading">
    <div className="closing-inbox-heading"><div><p className="closing-eyebrow">TRANSACTION OPERATIONS</p><h1 id="inbox-heading">Inbox</h1><p className="closing-subtitle">{needsAttention} things need you. Agents settled 47 others overnight.</p></div>
      <div className="closing-inbox-tools"><label className="closing-inbox-search"><Search size={16} aria-hidden="true" /><span className="sr-only">Filter inbox items</span><Input value={inboxQuery} onChange={(event) => setInboxQuery(event.target.value)} placeholder="Filter this inbox" /></label><Button variant="outline" className="closing-activity-button" onClick={onOpenActivity}><Clock3 size={15} aria-hidden="true" />Activity</Button></div>
    </div>
    <div className="closing-filter-scroll"><div className="closing-filter-list" role="group" aria-label="Inbox filters">
      {filterOrder.map((name) => <button key={name} type="button" aria-label={`${name} ${countFor(name)}`} aria-pressed={filter === name} className={`closing-filter${filter === name ? " is-selected" : ""}`} onClick={() => setFilter(name)}><FilterIcon name={name} /><span>{name}</span><span className="closing-filter-count">{countFor(name)}</span></button>)}
    </div></div>

    <div className="closing-inbox-layout">
      <Sidebar className="closing-inbox-list" aria-label="Inbox issues">
        <div className="closing-list-label"><span>Today</span><span>{visibleItems.length} items</span></div>
        <div className="closing-issue-list">
          {visibleItems.length ? visibleItems.map((item) => {
            const Icon = item.icon;
            const isSent = item.id === selectedId && Boolean(sentMessage);
            return <button type="button" key={item.id} className={`closing-issue${selectedId === item.id ? " is-selected" : ""}`} aria-current={selectedId === item.id ? "true" : undefined} onClick={() => selectItem(item)}>
              <span className={`closing-issue-icon is-${item.filter.toLowerCase().replaceAll(" ", "-")}`}><Icon size={16} aria-hidden="true" /></span><span className="closing-issue-copy"><strong>{item.title}</strong><span>{item.property} · {isSent ? "Marked sent locally · waiting for reply" : item.detail}</span></span><span className="closing-issue-age">{isSent ? "now" : item.age}</span>
            </button>;
          }) : <p className="closing-no-results">No items match this filter. Try another category or clear search.</p>}
        </div>
        <div className="closing-overnight"><CheckCircle2 size={17} aria-hidden="true" /><span><strong>47 routine actions done overnight</strong><span>Reminders, filed attachments, and document requests</span></span><ArrowRight size={15} aria-hidden="true" /></div>
      </Sidebar>

      <article className="closing-issue-detail" aria-label={`${activeItem.title} details`}>
        <div className="closing-detail-toolbar"><div className="closing-detail-tags"><Badge className="closing-intake-badge">Intake agent</Badge><Badge>{activeItem.filter === "Conflicts" ? "Unclear read" : activeItem.filter}</Badge>{sentMessage && <Badge className="closing-sent-badge"><Check size={12} aria-hidden="true" />Asked agent</Badge>}</div><Button variant="ghost" size="sm" className="closing-detail-more" aria-label="Filter by this property" onClick={() => setInboxQuery(activeItem.property)}>More <span aria-hidden="true">···</span></Button></div>
        <h2>{activeItem.title}</h2><p className="closing-property-line">{activeItem.id === "seller-credit" ? `${activeItem.property} · $2,140,000 · Buyer side · Closes Jan 8` : `${activeItem.property} · sample closing item`}</p>
        {activeItem.id === "seller-credit" ? <>
          <p className="closing-issue-summary">Counter offer 2 gives the buyers an <strong>$8,500</strong> credit on page 3, but its signature page says <strong>$8,000</strong>. Intake will not pick one, because the number feeds escrow instructions and the closing statement.</p>
          <div className="closing-comparison" aria-label="Seller credit document comparison">
            <ComparisonCard page="p. 3 · §4" excerpt={<>Seller to credit Buyer <strong>$8,500</strong> toward nonrecurring closing costs, paid through escrow.</>} amount="$8,500" selected={decision === "$8,500"} onChoose={() => setDecision("$8,500")} />
            <ComparisonCard page="p. 7 · signatures" excerpt={<>Accepted with seller credit of <strong>$8,000</strong> as initialed by both parties on Nov 9, 2026.</>} amount="$8,000" selected={decision === "$8,000"} onChoose={() => setDecision("$8,000")} />
            <span className="closing-difference">≠ $500 apart</span>
          </div>
          <div className="closing-impact"><span>Affects</span><Badge>Escrow instructions</Badge><Badge>Closing statement</Badge><Badge>Buyer cash to close</Badge></div>
          {decision && <p className="closing-decision-note" role="status">Draft choice: use {decision}. This preview has not saved or changed closing documents.</p>}
          <div className="closing-activity-strip"><span><FileText size={15} aria-hidden="true" />Intake read Counter offer 2, 7:12 AM</span><span><CircleAlert size={15} aria-hidden="true" />Preflight flagged the mismatch, 7:13 AM</span><span><Eye size={15} aria-hidden="true" />Seen by you, not decided</span></div>
          <div className="closing-deal-note"><FileText size={15} aria-hidden="true" /><span>Also open on this deal: appraisal report due Nov 24 and 2 tasks for Sophia</span></div>
        </> : <GenericIssue item={activeItem} />}

        <form className="closing-composer" onSubmit={sendMessage}>
          <div className="closing-composer-heading"><span className="closing-sophia-avatar" aria-hidden="true">SW</span><span><strong>{activeItem.id === "seller-credit" ? "Or ask Sophia Williams to confirm" : "Send a quick follow-up"}</strong><span>{activeItem.id === "seller-credit" ? "Listing agent · replies in about 40 min" : "Sample message · not sent until you choose"}</span></span></div>
          <Label htmlFor="closing-message" className="sr-only">Message draft</Label>
          <Textarea ref={messageInput} id="closing-message" value={draft} onChange={(event) => setDraft(event.target.value)} rows={3} required disabled={Boolean(sentMessage)} aria-describedby="closing-message-note" />
          <div className="closing-composer-footer"><span id="closing-message-note">Mock message · stays in this session</span><div>{sentMessage ? <Badge className="closing-sent-badge"><Check size={13} aria-hidden="true" />Sent locally</Badge> : <><Button type="button" variant="outline" onClick={() => messageInput.current?.focus()}>Edit</Button><Button type="submit" className="closing-send-button"><Send size={15} aria-hidden="true" />{activeItem.id === "seller-credit" ? "Send to Sophia" : "Send follow-up"}</Button></>}</div></div>
        </form>
        {undoMessage && <div className="closing-undo-toast" role="status"><span>Message sent · inbox count reduced to {needsAttention}</span><Button variant="ghost" size="sm" onClick={undoSend}><Undo2 size={15} aria-hidden="true" />Undo</Button></div>}
      </article>
    </div>
  </section>;
}

function FilterIcon({ name }: { name: InboxFilter }) {
  if (name === "All") return <InboxIcon size={14} aria-hidden="true" />;
  if (name === "Approvals") return <Check size={14} aria-hidden="true" />;
  if (name === "Conflicts") return <CircleAlert size={14} aria-hidden="true" />;
  if (name === "Quiet parties") return <InboxIcon size={14} aria-hidden="true" />;
  return <Search size={14} aria-hidden="true" />;
}

function ComparisonCard({ page, excerpt, amount, selected, onChoose }: { page: string; excerpt: React.ReactNode; amount: string; selected: boolean; onChoose: () => void }) {
  return <div className={`closing-comparison-card${selected ? " is-chosen" : ""}`}><div className="closing-comparison-heading"><strong>Counter offer 2</strong><Badge><FileText size={12} aria-hidden="true" />{page}</Badge></div><p>{excerpt}</p><Button type="button" variant="outline" aria-pressed={selected} onClick={onChoose}>{selected && <Check size={14} aria-hidden="true" />}Use {amount}</Button></div>;
}

function GenericIssue({ item }: { item: InboxItem }) {
  return <div className="closing-generic-issue"><div className="closing-generic-icon"><Clock3 size={19} aria-hidden="true" /></div><p>{item.detail}. This sample issue is here to demonstrate the inbox filter and review flow.</p><div><span>Suggested next step</span><strong>Review details with the deal team before updating closing documents.</strong></div><p className="closing-demo-note">Sample data only. No document or agent status is connected.</p></div>;
}

export default ClosingDesk;

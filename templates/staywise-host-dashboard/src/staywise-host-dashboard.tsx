import * as React from "react";
import {
  ArrowDownToLine,
  ArrowRight,
  Bell,
  BedDouble,
  CalendarDays,
  Check,
  ChevronDown,
  CircleDollarSign,
  CircleHelp,
  Clock3,
  Home,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageCircle,
  MoreHorizontal,
  Plus,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Tabs,
  TabsList,
  TabsTrigger,
  Toast,
  ToastProvider
} from "@design-templates/ui";
import "./staywise-host-dashboard.css";

type Page = "Bookings" | "Home" | "Rate plans" | "Apartments" | "Pricing" | "Support";
type BookingStatus = "Approved" | "Pending";
type BookingFilter = "All" | BookingStatus;
type ApartmentStatus = "Occupied" | "Available";
type DialogKind = "booking" | "promotion" | "rate-plan" | "upgrade" | "logout" | "guide" | null;
type Booking = { id: number; property: string; guest: string; initials: string; nights: number; status: BookingStatus; price: number; date: string; tone: string };
type Apartment = { id: number; name: string; specs: string; rate: number; occupancy: number; rating: string; status: ApartmentStatus; tone: string };
type Message = { id: number; from: "host" | "concierge"; text: string };

const navigation: Array<{ id: Page; icon: typeof Home }> = [
  { id: "Home", icon: LayoutDashboard },
  { id: "Rate plans", icon: CalendarDays },
  { id: "Bookings", icon: BedDouble },
  { id: "Apartments", icon: Home },
  { id: "Pricing", icon: CircleDollarSign },
  { id: "Support", icon: MessageCircle }
];

const periods = ["1 March – 14 March", "15 March – 28 March", "1 April – 14 April"];
const chartPeriods = [
  [1450, 2210, 2560, 1260, 2310, 1290, 940, 1430, 1894.83, 1310, 950, 2320, 1310, 940],
  [1820, 1540, 2100, 2740, 1950, 1620, 2290.5, 1410, 1750, 2480, 1320, 1940, 2150, 1680],
  [2120, 2490, 1780, 1420, 2610.4, 1980, 1540, 2230, 1690, 1890, 2510, 1740, 1490, 2080]
];
const periodToday = [8, 6, 4];

const initialBookings: Booking[] = [
  { id: 1, property: "Valencia apartment", guest: "Elena Rostova", initials: "ER", nights: 3, status: "Approved", price: 580, date: "Mar 6 · 12:00", tone: "rose" },
  { id: 2, property: "Night swimming pool", guest: "Sofia Meyer", initials: "SM", nights: 1, status: "Pending", price: 1000, date: "Mar 6 · 22:00", tone: "aqua" },
  { id: 3, property: "Unique & Cozy studio", guest: "Maya Chen", initials: "MC", nights: 10, status: "Approved", price: 3844, date: "Mar 6 · 14:00", tone: "sun" },
  { id: 4, property: "Terracotta Penthouse", guest: "Lucas Meyer", initials: "LM", nights: 4, status: "Approved", price: 1240, date: "Mar 7 · 15:00", tone: "rose" },
  { id: 5, property: "Palm Breeze Loft", guest: "Mateo Silva", initials: "MS", nights: 2, status: "Pending", price: 520, date: "Mar 7 · 18:30", tone: "aqua" },
  { id: 6, property: "Nordic Sun Studio", guest: "Hannah Abbott", initials: "HA", nights: 5, status: "Approved", price: 875, date: "Mar 8 · 13:00", tone: "sun" },
  { id: 7, property: "Marina Sunset Duplex", guest: "Owen Park", initials: "OP", nights: 3, status: "Approved", price: 960, date: "Mar 8 · 16:00", tone: "rose" }
];

const initialApartments: Apartment[] = [
  { id: 1, name: "Valencia apartment", specs: "2 beds · 4 guests · pool view", rate: 195, occupancy: 92, rating: "4.96", status: "Occupied", tone: "terrace" },
  { id: 2, name: "Night swimming pool", specs: "3 beds · 6 guests · private pool", rate: 1000, occupancy: 85, rating: "4.98", status: "Occupied", tone: "pool" },
  { id: 3, name: "Unique & Cozy studio", specs: "1 bed · 2 guests · old town", rate: 384, occupancy: 94, rating: "4.91", status: "Occupied", tone: "studio" },
  { id: 4, name: "Terracotta Penthouse", specs: "2 beds · 4 guests · roof terrace", rate: 310, occupancy: 88, rating: "4.95", status: "Occupied", tone: "terrace" },
  { id: 5, name: "Palm Breeze Loft", specs: "1 bed · 3 guests · beach walk", rate: 260, occupancy: 76, rating: "4.89", status: "Available", tone: "pool" },
  { id: 6, name: "Nordic Sun Studio", specs: "1 bed · 2 guests · private patio", rate: 175, occupancy: 81, rating: "4.90", status: "Available", tone: "studio" },
  { id: 7, name: "Marina Sunset Duplex", specs: "2 beds · 5 guests · harbor balcony", rate: 320, occupancy: 89, rating: "4.94", status: "Occupied", tone: "terrace" },
  { id: 8, name: "Botanical Garden Suite", specs: "1 bed · 2 guests · courtyard", rate: 215, occupancy: 79, rating: "4.93", status: "Available", tone: "pool" }
];

const faqs = [
  { question: "When do booking payouts reach my bank?", answer: "Demo payout estimates release one day after guest check-in. The March sample payout is $1,894.83." },
  { question: "How does guest keypad access work?", answer: "In a connected product, an approved reservation can receive a time-limited entry code. This preview does not connect to a lock." },
  { question: "Can a guest extend a reservation?", answer: "Review availability and cleaning schedules before confirming an extension. This sample does not contact guests or calendars." }
];

const money = (value: number) => `$${Math.round(value).toLocaleString("en-US")}`;
const formatChartMoney = (value: number) => `$${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

export function StaywiseHostDashboard() {
  return <ToastProvider><StaywiseWorkspace /></ToastProvider>;
}

function StaywiseWorkspace() {
  const [page, setPage] = React.useState<Page>("Bookings");
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [bookings, setBookings] = React.useState(initialBookings);
  const [bookingFilter, setBookingFilter] = React.useState<BookingFilter>("All");
  const [showAllBookings, setShowAllBookings] = React.useState(false);
  const [periodIndex, setPeriodIndex] = React.useState(0);
  const [selectedDay, setSelectedDay] = React.useState(periodToday[0]);
  const [chartFilter, setChartFilter] = React.useState<"all" | "today" | "earned">("all");
  const [housekeeping, setHousekeeping] = React.useState([
    { id: 1, unit: "Valencia apartment", cleaner: "Maria G.", time: "12:00 today", status: "Ready" },
    { id: 2, unit: "Night swimming pool", cleaner: "Carlos R.", time: "22:00 today", status: "Cleaning" },
    { id: 3, unit: "Unique & Cozy studio", cleaner: "Lucia V.", time: "14:00 today", status: "Ready" },
    { id: 4, unit: "Terracotta Penthouse", cleaner: "Maria G.", time: "15:00 tomorrow", status: "Inspecting" }
  ]);
  const [ratePlans, setRatePlans] = React.useState([
    { id: 1, name: "Standard flexible", badge: "MOST POPULAR", rule: "Free cancellation up to 24 hours before arrival", yield: "$245 avg / night", active: true },
    { id: 2, name: "Early bird saver", badge: "30+ DAYS AHEAD", rule: "15% off · non-refundable deposit", yield: "$208 avg / night", active: true },
    { id: 3, name: "Weekly stay", badge: "7+ NIGHT STAY", rule: "25% off · mid-stay clean included", yield: "$1,480 avg / week", active: true },
    { id: 4, name: "Last-minute fill", badge: "SAME-DAY DEAL", rule: "20% off when a unit is vacant within 48 hours", yield: "$196 avg / night", active: false }
  ]);
  const [matrix, setMatrix] = React.useState([
    { unit: "Valencia apartment", rates: [195, 225, 225, 195, 195, 195, 210], surges: [false, true, true, false, false, false, false] },
    { unit: "Night swimming pool", rates: [950, 1100, 1100, 950, 950, 950, 1000], surges: [false, true, true, false, false, false, true] },
    { unit: "Unique & Cozy studio", rates: [360, 415, 415, 360, 360, 360, 384], surges: [false, true, true, false, false, false, false] },
    { unit: "Terracotta Penthouse", rates: [310, 355, 355, 310, 310, 310, 310], surges: [false, true, true, false, false, false, false] }
  ]);
  const [apartments, setApartments] = React.useState(initialApartments);
  const [apartmentFilter, setApartmentFilter] = React.useState<"All" | ApartmentStatus>("All");
  const [autopilot, setAutopilot] = React.useState(true);
  const [baseRate, setBaseRate] = React.useState(220);
  const [weekendSurge, setWeekendSurge] = React.useState(25);
  const [lastMinuteDiscount, setLastMinuteDiscount] = React.useState(15);
  const [pricingRules, setPricingRules] = React.useState([
    { id: 1, title: "Fill orphan nights", description: "Discount single vacant nights between stays by 15%.", active: true },
    { id: 2, title: "Local event uplift", description: "Increase rates when local demand passes 85%.", active: true },
    { id: 3, title: "Reward longer stays", description: "Apply a weekly discount to reduce turnover.", active: true }
  ]);
  const [faqOpen, setFaqOpen] = React.useState<number | null>(0);
  const [messages, setMessages] = React.useState<Message[]>([
    { id: 1, from: "concierge", text: "Hi Johathan! How can I help with bookings or payouts today?" }
  ]);
  const [dialog, setDialog] = React.useState<DialogKind>(null);
  const [toast, setToast] = React.useState({ open: false, title: "" });
  const [notificationsRead, setNotificationsRead] = React.useState(false);
  const [sessionLocked, setSessionLocked] = React.useState(false);
  const [guideTitle, setGuideTitle] = React.useState("");
  const [bookingProperty, setBookingProperty] = React.useState("Valencia apartment");
  const [bookingNights, setBookingNights] = React.useState("3");
  const [bookingPayout, setBookingPayout] = React.useState("750");
  const [promotionProperty, setPromotionProperty] = React.useState("Valencia apartment");
  const [promotionDiscount, setPromotionDiscount] = React.useState(20);
  const [planName, setPlanName] = React.useState("");
  const [planDiscount, setPlanDiscount] = React.useState("15");
  const [chatDraft, setChatDraft] = React.useState("");

  const chartValues = chartPeriods[periodIndex];
  const todayIndex = periodToday[periodIndex];
  const projectedOccupancy = Math.min(98, Math.max(68, Math.round(88 - (baseRate - 220) * 0.06 + lastMinuteDiscount * 0.35)));
  const weekendRate = Math.round(baseRate * (1 + weekendSurge / 100));
  const discountedRate = Math.round(baseRate * (1 - lastMinuteDiscount / 100));
  const projectedRevenue = Math.round((baseRate * 18 + weekendRate * 8 + discountedRate * 4) * (projectedOccupancy / 100));

  function notify(title: string) {
    setToast({ open: true, title });
  }

  function navigate(nextPage: Page | "Log out") {
    setMobileNavOpen(false);
    setQuery("");
    if (nextPage === "Log out") setDialog("logout");
    else setPage(nextPage);
  }

  function toggleBooking(id: number) {
    setBookings((current) => current.map((booking) => booking.id === id
      ? { ...booking, status: booking.status === "Approved" ? "Pending" : "Approved" }
      : booking));
    const booking = bookings.find((item) => item.id === id);
    if (booking) notify(`${booking.property} status updated.`);
  }

  function updateHousekeeping(id: number) {
    const stages = ["Cleaning", "Inspecting", "Ready"];
    setHousekeeping((current) => current.map((item) => item.id === id
      ? { ...item, status: stages[(stages.indexOf(item.status) + 1) % stages.length] }
      : item));
    notify("Turnover status updated in this preview.");
  }

  function addBooking(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const property = bookingProperty;
    setBookings((current) => [{
      id: Date.now(), property, guest: "New guest", initials: "NG", nights: Number(bookingNights),
      status: "Approved", price: Number(bookingPayout), date: "Mar 9 · 16:00", tone: "aqua"
    }, ...current]);
    setShowAllBookings(true);
    setBookingFilter("All");
    setPage("Bookings");
    setDialog(null);
    notify(`Sample reservation added for ${property}.`);
  }

  function addPromotion(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setDialog(null);
    notify(`Demo promotion (${promotionDiscount}% off) prepared for ${promotionProperty}. No listing was changed.`);
  }

  function addRatePlan(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanName = planName.trim();
    if (!cleanName) return;
    setRatePlans((current) => [{
      id: Date.now(), name: cleanName, badge: "NEW PLAN", rule: `${planDiscount}% off · managed in this preview`,
      yield: "$245 avg / night", active: true
    }, ...current]);
    setPlanName("");
    setDialog(null);
    notify(`${cleanName} added to sample rate plans.`);
  }

  function updateRateCell(rowIndex: number, columnIndex: number) {
    setMatrix((current) => current.map((row, index) => {
      if (index !== rowIndex) return row;
      const rates = [...row.rates];
      const surges = [...row.surges];
      rates[columnIndex] = surges[columnIndex] ? Math.round(rates[columnIndex] / 1.15) : Math.round(rates[columnIndex] * 1.15);
      surges[columnIndex] = !surges[columnIndex];
      return { ...row, rates, surges };
    }));
  }

  function updateApartment(id: number) {
    setApartments((current) => current.map((apartment) => apartment.id === id
      ? { ...apartment, status: apartment.status === "Occupied" ? "Available" : "Occupied" }
      : apartment));
    notify("Sample apartment availability updated.");
  }

  function updateRule(id: number) {
    setPricingRules((current) => current.map((rule) => rule.id === id ? { ...rule, active: !rule.active } : rule));
  }

  function sendMessage(text = chatDraft) {
    const message = text.trim();
    if (!message) return;
    setChatDraft("");
    const lower = message.toLowerCase();
    const reply = lower.includes("payout")
      ? "Your sample payout of $1,894.83 is marked for tomorrow at 09:00. This is demo data."
      : lower.includes("approve")
        ? "The pending sample booking is ready for review. Use its status control on Bookings to change it locally."
        : lower.includes("calendar") || lower.includes("sync")
          ? "Calendar sync is a preview-only action. No external calendar is connected."
          : "Thanks for the note. This demo concierge keeps messages in this browser session; no support ticket was sent.";
    setMessages((current) => [...current, { id: Date.now(), from: "host", text: message }, { id: Date.now() + 1, from: "concierge", text: reply }]);
  }

  function downloadReport() {
    const rows = [["Property", "Guest", "Nights", "Status", "Payout", "Arrival"], ...bookings.map((booking) => [booking.property, booking.guest, String(booking.nights), booking.status, String(booking.price), booking.date])];
    const csv = `\uFEFF${rows.map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(",")).join("\r\n")}`;
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "staywise-bookings-sample.csv";
    link.click();
    URL.revokeObjectURL(url);
    notify("Sample booking report downloaded.");
  }

  const normalizedQuery = query.trim().toLowerCase();
  const filteredBookings = bookings.filter((booking) =>
    (bookingFilter === "All" || booking.status === bookingFilter) &&
    (!normalizedQuery || `${booking.property} ${booking.guest} ${booking.status} ${booking.price}`.toLowerCase().includes(normalizedQuery))
  );
  const visibleBookings = showAllBookings || bookingFilter !== "All" || normalizedQuery ? filteredBookings : filteredBookings.slice(0, 3);
  const filteredApartments = apartments.filter((apartment) =>
    (apartmentFilter === "All" || apartment.status === apartmentFilter) &&
    (!normalizedQuery || `${apartment.name} ${apartment.specs} ${apartment.status}`.toLowerCase().includes(normalizedQuery))
  );
  const filteredHousekeeping = housekeeping.filter((item) => !normalizedQuery || `${item.unit} ${item.status} ${item.cleaner}`.toLowerCase().includes(normalizedQuery));
  const filteredPlans = ratePlans.filter((plan) => !normalizedQuery || `${plan.name} ${plan.badge} ${plan.rule}`.toLowerCase().includes(normalizedQuery));
  const filteredRules = pricingRules.filter((rule) => !normalizedQuery || `${rule.title} ${rule.description}`.toLowerCase().includes(normalizedQuery));
  const filteredFaqs = faqs.filter((faq) => !normalizedQuery || `${faq.question} ${faq.answer}`.toLowerCase().includes(normalizedQuery));
  const searchLabels: Record<Page, string> = {
    Bookings: "Search bookings, guests, prices…", Home: "Search turnovers or guests…", "Rate plans": "Search rate plans…",
    Apartments: "Search properties or status…", Pricing: "Search pricing rules…", Support: "Search help topics…"
  };

  return <main className="staywise-dashboard" aria-label="Staywise host dashboard">
    <div className="staywise-frame">
      <aside className="staywise-sidebar">
        <div className="staywise-side-top">
          <button className="staywise-brand" onClick={() => navigate("Bookings")} aria-label="Staywise home">
            <span className="staywise-brand-mark"><Home size={18} strokeWidth={2.3} /></span>
            <span>staywise<small>HOST SPACE</small></span>
          </button>
          <button className="staywise-menu-toggle" onClick={() => setMobileNavOpen((open) => !open)} aria-label={mobileNavOpen ? "Close navigation" : "Open navigation"} aria-expanded={mobileNavOpen}>
            {mobileNavOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <nav className={`staywise-nav ${mobileNavOpen ? "is-open" : ""}`} aria-label="Primary navigation">
            {navigation.map(({ id, icon: Icon }) => <button key={id} className={`staywise-nav-item ${page === id ? "is-active" : ""}`} onClick={() => navigate(id)} aria-current={page === id ? "page" : undefined}>
              <Icon size={18} strokeWidth={2} /><span>{id}</span>{id === "Support" && !notificationsRead && <i aria-label="Unread support update" />}
            </button>)}
            <button className="staywise-nav-item" onClick={() => navigate("Log out")}><LogOut size={18} /><span>Log out</span></button>
          </nav>
        </div>

        <div className="staywise-upgrade">
          <div className="upgrade-art" aria-hidden="true"><span /><i /><b /></div>
          <strong>Make hosting lighter.</strong>
          <p>Explore sample tools for your next season.</p>
          <Button variant="secondary" size="sm" onClick={() => setDialog("upgrade")}>Explore plans</Button>
        </div>
      </aside>

      <section className="staywise-workspace">
        <header className="staywise-topbar">
          <div className="staywise-search">
            <Search size={17} aria-hidden="true" />
            <label className="sr-only" htmlFor="staywise-search">Search this section</label>
            <Input id="staywise-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={searchLabels[page]} />
            {query && <button className="search-clear" onClick={() => setQuery("")} aria-label="Clear search"><X size={15} /></button>}
          </div>
          <div className="staywise-profile">
            <button className="profile-button" onClick={() => navigate("Home")} aria-label="Open host overview">
              <span>Johathan Stinson</span><i>JS</i>
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild><Button className="notification-button" variant="ghost" size="icon" aria-label="Notifications"><Bell size={18} />{!notificationsRead && <i />}</Button></DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="notification-menu">
                <DropdownMenuLabel>Notifications <span>3</span></DropdownMenuLabel>
                <DropdownMenuItem onSelect={() => navigate("Bookings")}><span className="notice-dot notice-teal" /><span><b>Valencia check-in</b><small>Today at 12:00 · $580</small></span></DropdownMenuItem>
                <DropdownMenuItem onSelect={() => navigate("Bookings")}><span className="notice-dot notice-yellow" /><span><b>Pool house pending</b><small>Awaiting host review · $1,000</small></span></DropdownMenuItem>
                <DropdownMenuItem onSelect={() => navigate("Support")}><span className="notice-dot notice-pink" /><span><b>New guest message</b><small>Early check-in request</small></span></DropdownMenuItem>
                <Button variant="ghost" size="sm" onClick={() => { setNotificationsRead(true); notify("Sample notifications marked as read."); }}>Mark all read</Button>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <nav className="staywise-mobile-nav" aria-label="Mobile navigation">
            {navigation.map(({ id, icon: Icon }) => <button key={id} className={page === id ? "is-active" : ""} onClick={() => navigate(id)} aria-current={page === id ? "page" : undefined}><Icon size={16} /><span>{id}</span></button>)}
          </nav>
        </header>

        <div className="staywise-page" key={page}>
          {page === "Bookings" && <section aria-labelledby="bookings-title">
            <div className="page-heading"><div><p className="staywise-eyebrow">YOUR STAYS · MARCH 2026</p><h1 id="bookings-title">My Bookings</h1></div><Button onClick={downloadReport}><ArrowDownToLine size={16} />Download report</Button></div>
            <div className="chart-heading"><div className="period-control"><span>Period</span><Select value={String(periodIndex)} onValueChange={(value) => { const index = Number(value); setPeriodIndex(index); setSelectedDay(periodToday[index]); }}><SelectTrigger aria-label="Booking period"><CalendarDays size={15} /><SelectValue /></SelectTrigger><SelectContent>{periods.map((period, index) => <SelectItem key={period} value={String(index)}>{period}</SelectItem>)}</SelectContent></Select></div><div className="chart-legend"><button className={chartFilter === "today" ? "selected" : ""} onClick={() => setChartFilter(chartFilter === "today" ? "all" : "today")}><i className="legend-today" />Today</button><button className={chartFilter === "earned" ? "selected" : ""} onClick={() => setChartFilter(chartFilter === "earned" ? "all" : "earned")}><i className="legend-earned" />Earned</button></div></div>
            <div className="chart-card" aria-label={`Daily earnings for ${periods[periodIndex]}`}>
              <div className="chart-y-axis" aria-hidden="true"><span>$3,000</span><span>$2,000</span><span>$1,000</span><span>$0</span></div>
              <div className="chart-plot"><div className="chart-guides" aria-hidden="true"><i /><i /><i /><i /></div><div className="chart-selected-value" style={{ left: `${((selectedDay + 0.5) / chartValues.length) * 100}%`, top: `${Math.max(3, (1 - chartValues[selectedDay] / 3000) * 150 - 48)}px` }}><b>{formatChartMoney(chartValues[selectedDay])}</b><span>{selectedDay === todayIndex ? "Today’s total" : `Day ${selectedDay + 1} earnings`}</span></div>
                <div className="chart-bars">{chartValues.map((value, index) => <button key={`${periodIndex}-${index}`} className={`chart-day ${index === selectedDay ? "is-selected" : ""} ${chartFilter === "today" && index !== todayIndex || chartFilter === "earned" && index === todayIndex ? "is-muted" : ""}`} onClick={() => setSelectedDay(index)} aria-label={`Day ${index + 1} revenue ${formatChartMoney(value)}`} aria-pressed={selectedDay === index}><span className={`chart-bar ${index === selectedDay ? "bar-today" : index === 2 || index === 11 ? "bar-cyan" : ""}`} style={{ height: `${Math.max(8, (value / 3000) * 100)}%` }} /><small>{index + 1}</small></button>)}</div>
              </div>
            </div>
            <section className="arrivals-layout" aria-labelledby="arrivals-title">
              <div className="arrivals-panel"><div className="arrivals-heading"><div className="heading-tabs"><h2 id="arrivals-title">Arriving today</h2><Tabs value={bookingFilter} onValueChange={(value) => setBookingFilter(value as BookingFilter)}><TabsList aria-label="Filter bookings"><TabsTrigger value="All">All</TabsTrigger><TabsTrigger value="Approved">Approved</TabsTrigger><TabsTrigger value="Pending">Pending</TabsTrigger></TabsList></Tabs></div><Button className="show-all-button" variant="ghost" size="sm" onClick={() => setShowAllBookings((show) => !show)}>{showAllBookings ? "Show less" : `Show all (${bookings.length})`} <ArrowRight size={14} /></Button></div>
                {visibleBookings.length ? <ul className="booking-list">{visibleBookings.map((booking) => <li key={booking.id} className="booking-row"><div className={`property-thumb tone-${booking.tone}`} aria-hidden="true"><span /><i /></div><div className="booking-main"><b>{booking.property}</b><small>{booking.guest} · {booking.nights} {booking.nights === 1 ? "night" : "nights"}</small></div><Badge className={`status-badge ${booking.status === "Approved" ? "is-approved" : "is-pending"}`}><span />{booking.status}</Badge><strong className="booking-price">{money(booking.price)}</strong><span className="booking-date">{booking.date}</span><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" aria-label={`Quick actions for ${booking.property}`}><MoreHorizontal size={17} /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuLabel>Reservation actions</DropdownMenuLabel><DropdownMenuItem onSelect={() => toggleBooking(booking.id)}>{booking.status === "Approved" ? "Mark pending" : "Approve booking"}</DropdownMenuItem><DropdownMenuItem onSelect={() => notify(`Demo check-in note prepared for ${booking.guest}.`)}>Prepare check-in note</DropdownMenuItem></DropdownMenuContent></DropdownMenu></li>)}</ul> : <div className="inline-empty">No reservations match this search.</div>}
              </div>
              <Card className="occupancy-card"><CardContent><span className="occupancy-kicker"><Sparkles size={14} /> A QUICK IDEA</span><h3>Quiet nights ahead?</h3><p>Prepare a sample offer to fill an open date.</p><Button variant="secondary" size="sm" onClick={() => setDialog("promotion")}>Create offer <ArrowRight size={14} /></Button><div className="occupancy-art" aria-hidden="true"><i /><span /><b /></div></CardContent></Card>
            </section>
            <section className="payout-strip" aria-label="Upcoming reservation activity"><div className="section-heading"><div><h2>Upcoming check-outs & payouts</h2><p>Sample reservation ledger · local preview data</p></div><Button variant="outline" size="sm" onClick={() => setDialog("booking")}><Plus size={15} />Add reservation</Button></div><div className="payout-grid"><div><span>CHECKING OUT · 11:00</span><b>Nordic Sun Studio</b><small>Lucas Meyer · 4 nights</small></div><div><span>PAYOUT PROCESSING</span><b>Terracotta Penthouse</b><small>Hannah Abbott · $930</small></div><div><span>CLEANING SCHEDULED</span><b>Palm Breeze Loft</b><small>Mateo Silva · 2 nights</small></div></div></section>
          </section>}

          {page === "Home" && <section aria-labelledby="home-title">
            <div className="page-heading"><div><Badge className="pulse-badge"><i />HOST PULSE · MARCH 2026</Badge><h1 id="home-title">Welcome back, Johathan</h1><p className="page-subtitle">A calm snapshot of your hosting day.</p></div><Button onClick={() => setDialog("booking")}><Plus size={16} />New booking</Button></div>
            <div className="metric-grid"><MetricCard label="Monthly revenue" value="$28,450" detail="+14.2% this month" icon={Wallet} tone="teal" /><MetricCard label="Occupancy rate" value="88.4%" detail="5 of 6 units occupied" icon={TrendingUp} tone="yellow" progress={88} /><MetricCard label="Check-ins today" value="6 guests" detail="2 arrivals need attention" icon={KeyRound} tone="blue" onClick={() => navigate("Bookings")} /><MetricCard label="Superhost rating" value="4.92 / 5" detail="148 guest reviews" icon={Sparkles} tone="pink" /></div>
            <div className="home-columns"><Card className="housekeeping-card"><CardHeader className="card-heading-row"><div><CardTitle>Housekeeping & room turnovers</CardTitle><p>Cycle a sample cleaning status to update your board.</p></div><Badge className="soft-badge">{housekeeping.filter((item) => item.status === "Ready").length} ready</Badge></CardHeader><CardContent className="housekeeping-list">{filteredHousekeeping.length ? filteredHousekeeping.map((item) => <div className="housekeeping-row" key={item.id}><PropertyGlyph tone={initialApartments.find((apartment) => apartment.name === item.unit)?.tone ?? "studio"} /><div><b>{item.unit}</b><small>{item.cleaner} · Check-in {item.time}</small></div><Button variant="outline" size="sm" aria-label={`Update ${item.unit} status`} onClick={() => updateHousekeeping(item.id)}>{item.status} <ChevronDown size={14} /></Button></div>) : <div className="inline-empty">No turnovers match your search.</div>}</CardContent></Card>
              <Card className="channel-card"><CardHeader><CardTitle>Channel revenue share</CardTitle><p>Illustrative booking mix · demo estimates</p></CardHeader><CardContent className="channel-list"><ChannelShare name="Staywise direct" share={54} value="$15,363" tone="teal" /><ChannelShare name="Airbnb sync" share={31} value="$8,819" tone="pink" /><ChannelShare name="Partner channels" share={15} value="$4,268" tone="yellow" /><div className="sync-row"><span>Smart-lock sample codes</span><Button variant="secondary" size="sm" onClick={() => notify("Demo key sync checked locally. No locks are connected.")}>Sync keys <Check size={14} /></Button></div></CardContent></Card>
            </div>
            <Card className="guest-message-card"><CardContent><div className="guest-monogram">ER</div><div className="guest-message-copy"><b>Elena Rostova · Valencia apartment</b><Badge className="soft-badge">Arriving at 12:00</Badge><p>“We just landed and should be there around noon!”</p></div><Button variant="outline" size="sm" onClick={() => notify("Demo welcome note prepared. No guest message was sent.")}><KeyRound size={14} />Prepare key code</Button><Button size="sm" onClick={() => navigate("Support")}>Open inbox</Button></CardContent></Card>
            <Card className="access-card"><CardHeader className="card-heading-row"><div><CardTitle>Smart-home & access overview</CardTitle><p>Illustrative device status · no connected hardware</p></div><Badge className="soft-badge"><ShieldCheck size={13} />Sample status</Badge></CardHeader><CardContent className="access-grid"><div><b>Valencia climate</b><strong>21.5°C</strong><small>Lock battery 96% · keypad ready</small></div><div><b>Pool house</b><strong>28.0°C</strong><small>Underwater lights · 20:00</small></div><div><b>Cozy studio</b><strong>Quiet · 34 dB</strong><small>Air quality optimal</small></div></CardContent></Card>
          </section>}

          {page === "Rate plans" && <section aria-labelledby="rate-plans-title">
            <div className="page-heading"><div><p className="staywise-eyebrow">STAYS · TERMS · CALENDAR</p><h1 id="rate-plans-title">Rate plans & packages</h1><p className="page-subtitle">Tune sample seasonal rates, stay offers, and cancellation rules.</p></div><Button onClick={() => setDialog("rate-plan")}><Plus size={16} />Create rate plan</Button></div>
            <div className="rate-plan-grid">{filteredPlans.map((plan, index) => <Card className={`rate-plan-card plan-tone-${index % 4}`} key={plan.id}><CardContent><div className="plan-top"><Badge className="plan-tag">{plan.badge}</Badge><Switch checked={plan.active} onCheckedChange={(checked) => setRatePlans((current) => current.map((item) => item.id === plan.id ? { ...item, active: checked } : item))} aria-label={`${plan.active ? "Pause" : "Activate"} ${plan.name}`} /></div><h2>{plan.name}</h2><p>{plan.rule}</p><div className="plan-bottom"><b>{plan.yield}</b><span className={plan.active ? "plan-active" : "plan-paused"}><i />{plan.active ? "Active plan" : "Paused"}</span></div></CardContent></Card>)}</div>
            <Card className="rate-matrix-card"><CardHeader className="card-heading-row"><div><CardTitle>Seven-day rate matrix</CardTitle><p>Select a rate to toggle a sample 15% weekend adjustment.</p></div><Badge className="soft-badge">Mar 6 – Mar 12</Badge></CardHeader><CardContent><div className="matrix-grid"><div className="matrix-header"><span>Apartment</span>{["Fri 6", "Sat 7", "Sun 8", "Mon 9", "Tue 10", "Wed 11", "Thu 12"].map((day) => <span key={day}>{day}</span>)}</div>{matrix.map((row, rowIndex) => <div className="matrix-row" key={row.unit}><b>{row.unit}</b>{row.rates.map((rate, columnIndex) => <button className={row.surges[columnIndex] ? "is-surge" : ""} key={`${row.unit}-${columnIndex}`} onClick={() => updateRateCell(rowIndex, columnIndex)} aria-label={`${row.unit}, ${["Friday", "Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"][columnIndex]} rate ${money(rate)}${row.surges[columnIndex] ? ", surge" : ""}`}>{money(rate)}</button>)}</div>)}</div></CardContent></Card>
            <Card className="extras-card"><CardHeader><CardTitle>Guest extras & flexible add-ons</CardTitle></CardHeader><CardContent className="extras-grid"><Extra label="Extra guest" value="$25 / night" note="After two guests in two-bed units." /><Extra label="Pet-friendly stay" value="$40 / stay" note="One-time sample cleaning fee." /><Extra label="Late check-out" value="+$45 flat" note="Offer when next night is available." /></CardContent></Card>
          </section>}

          {page === "Apartments" && <section aria-labelledby="apartments-title">
            <div className="page-heading"><div><p className="staywise-eyebrow">YOUR PORTFOLIO</p><h1 id="apartments-title">My apartments</h1><p className="page-subtitle">Manage eight sample stays, occupancy, and nightly rates.</p></div><div className="apartment-filters"><Tabs value={apartmentFilter} onValueChange={(value) => setApartmentFilter(value as "All" | ApartmentStatus)}><TabsList aria-label="Filter apartments"><TabsTrigger value="All">All <span>{apartments.length}</span></TabsTrigger><TabsTrigger value="Occupied">Occupied</TabsTrigger><TabsTrigger value="Available">Available</TabsTrigger></TabsList></Tabs></div></div>
            <div className="apartment-grid">{filteredApartments.map((apartment) => <Card className="apartment-card" key={apartment.id}><div className={`apartment-cover cover-${apartment.tone}`} aria-hidden="true"><div className="cover-sun" /><div className="cover-building"><i /><i /><i /><i /></div><div className="cover-ground" /></div><CardContent><div className="apartment-meta"><span className="rating">★ {apartment.rating}</span><button className={`status-badge apartment-status ${apartment.status === "Occupied" ? "is-approved" : "is-pending"}`} onClick={() => updateApartment(apartment.id)} aria-label={`Mark ${apartment.name} ${apartment.status === "Occupied" ? "available" : "occupied"}`}><span />{apartment.status}</button></div><h2>{apartment.name}</h2><p className="apartment-specs">{apartment.specs}</p><div className="occupancy-progress"><div><span>Monthly occupancy</span><b>{apartment.occupancy}%</b></div><i><span style={{ width: `${apartment.occupancy}%` }} /></i></div><div className="apartment-bottom"><span><b>{money(apartment.rate)}</b> / night</span><Button variant="ghost" size="sm" onClick={() => { setBaseRate(apartment.rate); navigate("Pricing"); }}>Adjust rate <ArrowRight size={14} /></Button></div></CardContent></Card>)}</div>
            <Card className="compliance-card"><CardHeader className="card-heading-row"><div><CardTitle>Property details & safety checks</CardTitle><p>Illustrative portfolio checklist.</p></div><Badge className="soft-badge"><Check size={13} />All sample checks clear</Badge></CardHeader><CardContent className="compliance-grid"><div><ShieldCheck size={18} /><span><b>Mesh Wi-Fi network</b><small>Sample status · online across eight units</small></span></div><div><KeyRound size={18} /><span><b>Tourism registration</b><small>Sample registry · eight license records</small></span></div></CardContent></Card>
          </section>}

          {page === "Pricing" && <section aria-labelledby="pricing-title">
            <div className="page-heading"><div><p className="staywise-eyebrow">DEMAND · YIELD · FORECAST</p><h1 id="pricing-title">Smart pricing & simulator</h1><p className="page-subtitle">Adjust sample assumptions to preview a 30-day revenue estimate.</p></div><div className="autopilot-control"><span><Sparkles size={15} />Auto-pilot pricing</span><Switch checked={autopilot} onCheckedChange={(checked) => { setAutopilot(checked); notify(`Sample auto-pilot ${checked ? "enabled" : "paused"}.`); }} aria-label="Auto-pilot pricing" /></div></div>
            <div className="simulator-grid"><Card className="simulator-controls"><CardHeader className="card-heading-row"><div><CardTitle>Dynamic yield simulator</CardTitle><p>Move sliders to update the forecast.</p></div><Badge className="soft-badge">Demo forecast</Badge></CardHeader><CardContent className="slider-list"><SliderField id="base-rate" label="Base nightly rate" value={baseRate} min={100} max={500} step={10} suffix=" / night" onChange={setBaseRate} /><SliderField id="weekend-surge" label="Weekend surge" value={weekendSurge} min={0} max={60} step={5} prefix="+" suffix="%" onChange={setWeekendSurge} /><SliderField id="last-minute" label="Last-minute discount" value={lastMinuteDiscount} min={0} max={40} step={5} prefix="−" suffix="%" onChange={setLastMinuteDiscount} /></CardContent></Card>
              <Card className="forecast-card"><CardContent><div className="forecast-heading"><div><span>PROJECTED 30-DAY REVENUE</span><strong>{money(projectedRevenue)}</strong></div><div><span>EST. OCCUPANCY</span><b>{projectedOccupancy}%</b></div></div><div className="forecast-bars" aria-label="Estimated nightly rates by day">{[discountedRate, baseRate, baseRate, baseRate, weekendRate, weekendRate, Math.round((baseRate + weekendRate) / 2)].map((value, index) => <div key={index}><b>{money(value)}</b><i><span className={index === 4 || index === 5 ? "surge-bar" : index === 0 ? "discount-bar" : ""} style={{ height: `${Math.max(18, value / Math.max(weekendRate, 400) * 100)}%` }} /></i><small>{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][index]}</small></div>)}</div><div className="forecast-footer"><span>Illustrative model · no channel rates are changed.</span><Button variant="secondary" size="sm" onClick={() => notify("Pricing strategy saved in this preview only.")}>Save strategy <Check size={14} /></Button></div></CardContent></Card></div>
            <Card className="rules-card"><CardHeader><CardTitle>Sample automation rules</CardTitle><p>Switch rules on or off in this local preview.</p></CardHeader><CardContent className="rules-grid">{filteredRules.map((rule) => <div className="rule-card" key={rule.id}><div><b>{rule.title}</b><Switch checked={rule.active} onCheckedChange={() => updateRule(rule.id)} aria-label={`${rule.active ? "Disable" : "Enable"} ${rule.title}`} /></div><p>{rule.description}</p><Badge className={rule.active ? "soft-badge" : "neutral-badge"}>{rule.active ? "ON" : "OFF"}</Badge></div>)}</CardContent></Card>
            <Card className="market-card"><CardHeader className="card-heading-row"><div><CardTitle>Local market snapshot</CardTitle><p>Sample comparison, not live competitor data.</p></div><Badge className="market-badge"><TrendingUp size={14} />+18% RevPAR estimate</Badge></CardHeader><CardContent className="market-grid"><div><span>Neighborhood average</span><b>$205 / night</b></div><div><span>Your sample average</span><b>$238 / night</b></div><div><span>Festival demand window</span><b>Mar 15–19 · +35%</b></div></CardContent></Card>
          </section>}

          {page === "Support" && <section aria-labelledby="support-title">
            <div className="page-heading"><div><p className="staywise-eyebrow">HELP · GUIDES · CONCIERGE</p><h1 id="support-title">Host support</h1><p className="page-subtitle">Find a quick answer or try the local demo concierge.</p></div><Badge className="pulse-badge"><i />SAMPLE SERVICE STATUS</Badge></div>
            <div className="support-grid"><Card className="faq-card"><CardHeader><CardTitle>Frequently asked questions</CardTitle><p>Answers are sample help content for this template.</p></CardHeader><CardContent className="faq-list">{filteredFaqs.length ? filteredFaqs.map((faq) => { const index = faqs.indexOf(faq); const open = faqOpen === index; return <div className="faq-item" key={faq.question}><button aria-expanded={open} onClick={() => setFaqOpen(open ? null : index)}><span>{faq.question}</span><ChevronDown size={17} className={open ? "is-open" : ""} /></button>{open && <p>{faq.answer}</p>}</div>; }) : <div className="inline-empty">No help topics match your search.</div>}<div className="maintenance-callout"><div><b>Need urgent property help?</b><p>Sample local request · no service team is connected.</p></div><Button variant="secondary" size="sm" onClick={() => notify("Demo maintenance request recorded locally; no call was placed.")}>Request a call</Button></div></CardContent></Card>
              <Card className="concierge-card"><CardHeader className="concierge-header"><div className="concierge-avatar">C<i /></div><div><CardTitle>Clara · host concierge</CardTitle><p>Simulated replies · no support agent connected</p></div><Badge className="ticket-badge">DEMO TICKET</Badge></CardHeader><CardContent className="chat-content"><div className="chat-messages" aria-live="polite">{messages.map((message) => <div key={message.id} className={`chat-line ${message.from === "host" ? "from-host" : "from-concierge"}`}><p>{message.text}</p></div>)}</div><div className="quick-prompts"><button onClick={() => sendMessage("When is my next payout arriving?")}><Wallet size={13} />Next payout</button><button onClick={() => sendMessage("Approve pending booking")}><Check size={13} />Booking status</button><button onClick={() => sendMessage("Sync my calendar")}><CalendarDays size={13} />Calendar sync</button></div><form className="chat-form" onSubmit={(event) => { event.preventDefault(); sendMessage(); }}><label className="sr-only" htmlFor="concierge-message">Message demo concierge</label><Input id="concierge-message" value={chatDraft} onChange={(event) => setChatDraft(event.target.value)} placeholder="Write a message…" /><Button size="icon" aria-label="Send message" type="submit"><Send size={16} /></Button></form></CardContent></Card></div>
            <Card className="resources-card"><CardHeader><CardTitle>Host guides & resources</CardTitle><p>Open a sample guide summary.</p></CardHeader><CardContent className="resource-grid"><ResourceButton icon={Wallet} title="Host payout summary" note="Sample statement · 2026" onClick={() => { setGuideTitle("Host payout summary"); setDialog("guide"); }} /><ResourceButton icon={KeyRound} title="Smart keypad setup" note="Guest access guide" onClick={() => { setGuideTitle("Smart keypad setup"); setDialog("guide"); }} /><ResourceButton icon={ShieldCheck} title="Host protection" note="Sample policy overview" onClick={() => { setGuideTitle("Host protection"); setDialog("guide"); }} /></CardContent></Card>
          </section>}
        </div>
        <footer className="staywise-footer"><span>Sample host workspace · changes stay in this preview</span><span><CircleHelp size={13} />Help & resources</span></footer>
      </section>
    </div>

    <Dialog open={dialog !== null} onOpenChange={(open) => !open && setDialog(null)}>
      {dialog && <DialogContent aria-describedby="staywise-dialog-description" className="staywise-dialog">
        {dialog === "booking" && <><DialogHeader><DialogTitle>Add a direct booking</DialogTitle><DialogDescription id="staywise-dialog-description">Create a sample reservation in local preview state.</DialogDescription></DialogHeader><form className="dialog-form" onSubmit={addBooking}><Label htmlFor="booking-property">Apartment</Label><Select value={bookingProperty} onValueChange={setBookingProperty}><SelectTrigger id="booking-property"><SelectValue /></SelectTrigger><SelectContent>{initialApartments.slice(0, 4).map((apartment) => <SelectItem key={apartment.id} value={apartment.name}>{apartment.name}</SelectItem>)}</SelectContent></Select><div className="dialog-two-fields"><div><Label htmlFor="booking-nights">Nights</Label><Input id="booking-nights" type="number" min="1" max="30" value={bookingNights} onChange={(event) => setBookingNights(event.target.value)} required /></div><div><Label htmlFor="booking-payout">Payout estimate</Label><Input id="booking-payout" type="number" min="100" max="99999" value={bookingPayout} onChange={(event) => setBookingPayout(event.target.value)} required /></div></div><DialogFooter><Button variant="outline" type="button" onClick={() => setDialog(null)}>Cancel</Button><Button type="submit">Add reservation</Button></DialogFooter></form></>}
        {dialog === "promotion" && <><DialogHeader><DialogTitle>Prepare a quiet-night offer</DialogTitle><DialogDescription id="staywise-dialog-description">This form updates a local demo message only; no listing changes.</DialogDescription></DialogHeader><form className="dialog-form" onSubmit={addPromotion}><Label htmlFor="promotion-property">Apartment</Label><Select value={promotionProperty} onValueChange={setPromotionProperty}><SelectTrigger id="promotion-property"><SelectValue /></SelectTrigger><SelectContent>{initialApartments.slice(0, 4).map((apartment) => <SelectItem key={apartment.id} value={apartment.name}>{apartment.name} · {money(apartment.rate)} / night</SelectItem>)}</SelectContent></Select><div className="range-label"><Label htmlFor="promotion-discount">Sample discount</Label><b>{promotionDiscount}% off</b></div><Input id="promotion-discount" type="range" className="staywise-range" min="5" max="50" step="5" value={promotionDiscount} onChange={(event) => setPromotionDiscount(Number(event.target.value))} /><DialogFooter><Button variant="outline" type="button" onClick={() => setDialog(null)}>Cancel</Button><Button type="submit">Prepare offer</Button></DialogFooter></form></>}
        {dialog === "rate-plan" && <><DialogHeader><DialogTitle>Create a rate plan</DialogTitle><DialogDescription id="staywise-dialog-description">Add a local sample plan; no connected prices are published.</DialogDescription></DialogHeader><form className="dialog-form" onSubmit={addRatePlan}><Label htmlFor="plan-name">Plan name</Label><Input id="plan-name" value={planName} onChange={(event) => setPlanName(event.target.value)} placeholder="e.g. Spring long stay" maxLength={64} required /><Label htmlFor="plan-discount">Stay discount</Label><Select value={planDiscount} onValueChange={setPlanDiscount}><SelectTrigger id="plan-discount"><SelectValue /></SelectTrigger><SelectContent>{["5", "10", "15", "20", "25"].map((discount) => <SelectItem key={discount} value={discount}>{discount}% off</SelectItem>)}</SelectContent></Select><DialogFooter><Button variant="outline" type="button" onClick={() => setDialog(null)}>Cancel</Button><Button type="submit">Add sample plan</Button></DialogFooter></form></>}
        {dialog === "upgrade" && <><DialogHeader><DialogTitle>Staywise host tools</DialogTitle><DialogDescription id="staywise-dialog-description">This is a design preview. Billing and subscription actions are not connected.</DialogDescription></DialogHeader><div className="upgrade-dialog-copy"><Sparkles size={24} /><p>Explore ideas for occupancy insights, guest messaging, and portfolio reporting. No plan or payment will be created here.</p></div><DialogFooter><Button onClick={() => setDialog(null)}>Got it</Button></DialogFooter></>}
        {dialog === "logout" && <><DialogHeader><DialogTitle>Lock this sample workspace?</DialogTitle><DialogDescription id="staywise-dialog-description">This preview will show a local locked-screen state. No account session exists.</DialogDescription></DialogHeader><div className="logout-summary"><span><Wallet size={16} />Sample earnings today</span><b>$1,894.83</b><span><Users size={16} />Arrivals ready</span><b>3 check-ins</b></div><DialogFooter><Button variant="outline" onClick={() => setDialog(null)}>Stay here</Button><Button onClick={() => { setDialog(null); setSessionLocked(true); }}>Lock preview</Button></DialogFooter></>}
        {dialog === "guide" && <><DialogHeader><DialogTitle>{guideTitle}</DialogTitle><DialogDescription id="staywise-dialog-description">Sample guide content · no external document is connected.</DialogDescription></DialogHeader><div className="guide-copy"><p>This preview summarizes the type of host resource shown in the reference. Replace with a licensed, verified guide before production use.</p><Badge className="soft-badge">Illustrative content</Badge></div><DialogFooter><Button variant="outline" onClick={() => setDialog(null)}>Close</Button></DialogFooter></>}
      </DialogContent>}
    </Dialog>

    <Dialog open={sessionLocked} onOpenChange={setSessionLocked}><DialogContent aria-describedby="staywise-lock-description" className="staywise-dialog"><DialogHeader><DialogTitle>Workspace locked</DialogTitle><DialogDescription id="staywise-lock-description">Sample host session is paused. All dashboard data is local demo content.</DialogDescription></DialogHeader><DialogFooter><Button onClick={() => setSessionLocked(false)}>Return to dashboard</Button></DialogFooter></DialogContent></Dialog>
    <Toast {...toast} description="Local preview feedback" onOpenChange={(open) => setToast((current) => ({ ...current, open }))} />
  </main>;
}

function MetricCard({ label, value, detail, icon: Icon, tone, progress, onClick }: { label: string; value: string; detail: string; icon: typeof Home; tone: string; progress?: number; onClick?: () => void }) {
  const content = <><div className="metric-top"><span>{label}</span><i className={`metric-icon metric-${tone}`}><Icon size={17} /></i></div><strong>{value}</strong><div className="metric-detail"><span>{detail}</span>{progress !== undefined && <i><span style={{ width: `${progress}%` }} /></i>}</div></>;
  return <Card className={`metric-card metric-card-${tone}`}>{onClick ? <button onClick={onClick} aria-label={`${label}: ${value}. ${detail}`}>{content}</button> : <CardContent>{content}</CardContent>}</Card>;
}

function ChannelShare({ name, share, value, tone }: { name: string; share: number; value: string; tone: string }) {
  return <div className="channel-share"><div><b>{name}</b><span>{share}% · {value}</span></div><i><span className={`share-${tone}`} style={{ width: `${share}%` }} /></i></div>;
}

function PropertyGlyph({ tone }: { tone: string }) {
  return <span className={`property-glyph tone-${tone}`} aria-hidden="true"><Home size={17} /></span>;
}

function Extra({ label, value, note }: { label: string; value: string; note: string }) {
  return <div className="extra-item"><span>{label}</span><b>{value}</b><p>{note}</p></div>;
}

function SliderField({ id, label, value, min, max, step, prefix = "", suffix = "", onChange }: { id: string; label: string; value: number; min: number; max: number; step: number; prefix?: string; suffix?: string; onChange: (value: number) => void }) {
  return <div className="slider-field"><div><Label htmlFor={id}>{label}</Label><b>{prefix}{value}{suffix}</b></div><Input id={id} className="staywise-range" type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} /></div>;
}

function ResourceButton({ icon: Icon, title, note, onClick }: { icon: typeof Home; title: string; note: string; onClick: () => void }) {
  return <button className="resource-button" onClick={onClick}><i><Icon size={17} /></i><span><b>{title}</b><small>{note}</small></span><ArrowRight size={15} /></button>;
}

export default StaywiseHostDashboard;

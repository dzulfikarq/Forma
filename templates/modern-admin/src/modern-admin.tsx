import * as React from "react";
import { MotionConfig } from "motion/react";
import {
  ArrowDownRight, ArrowUpRight, Bell, ChevronDown, CircleHelp, CreditCard, Download,
  LayoutDashboard, Menu, Moon, Plus, Search, Settings as SettingsIcon,
  ShoppingBag, Sun, Wallet
} from "lucide-react";
import {
  Badge, Button, Card, CardContent, CardHeader, CardTitle, ConfirmDialog, Dialog, DialogContent,
  DialogDescription, DialogFooter, DialogHeader, DialogTitle, DropdownMenu,
  DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger, EmptyState,
  Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Switch, Table,
  ResponsiveNavigation, Sidebar, TableBody, TableCell, TableHead, TableHeader, TableRow, Tabs,
  TabsContent, TabsList, TabsTrigger, Toast, ToastProvider, Topbar, useTheme
} from "@design-templates/ui";
import "./modern-admin.css";

type Page = "overview" | "sales" | "orders" | "settings";
type Order = { id: string; customer: string; product: string; amount: string; time: string; status: "New" | "Packing" | "On the way" | "Delivered" };

const initialOrders: Order[] = [
  { id: "HW-48346", customer: "The Copper Kettle", product: "12 items", amount: "£712.80", time: "37 min ago", status: "New" },
  { id: "HW-48345", customer: "Zora Becker", product: "1 item", amount: "£88.00", time: "41 min ago", status: "New" },
  { id: "HW-48343", customer: "Mina Howell", product: "6 items", amount: "£324.00", time: "1 hr ago", status: "Packing" },
  { id: "HW-48339", customer: "Oliver Chen", product: "3 items", amount: "£194.00", time: "2 hr ago", status: "Packing" },
  { id: "HW-48336", customer: "Lena Pritchard", product: "4 items", amount: "£148.00", time: "3 hr ago", status: "On the way" },
  { id: "HW-48331", customer: "Owen Becker", product: "2 items", amount: "£194.00", time: "Yesterday", status: "Delivered" }
];
const navItems: Array<{ id: Page; label: string; icon: React.ElementType }> = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "sales", label: "Sales", icon: ArrowUpRight },
  { id: "orders", label: "Orders", icon: ShoppingBag },
  { id: "settings", label: "Settings", icon: SettingsIcon }
];
const chartValues = [58, 84, 72, 96, 62, 89, 68, 92, 80, 86, 55, 72];

export function formatCsv(rows: string[][]) {
  const escapeCell = (value: string) => {
    const safeValue = /^[\s]*[=+\-@]/.test(value) ? `'${value}` : value;
    return `"${safeValue.replaceAll('"', '""')}"`;
  };
  return `\uFEFF${rows.map((row) => row.map(escapeCell).join(",")).join("\r\n")}`;
}

function downloadCsv(filename: string, rows: string[][]) {
  const url = URL.createObjectURL(new Blob([formatCsv(rows)], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function ModernAdmin() {
  const [page, setPage] = React.useState<Page>("overview");
  const [orders, setOrders] = React.useState(initialOrders);
  const [query, setQuery] = React.useState("");
  const [range, setRange] = React.useState("14 days");
  const [newOrderOpen, setNewOrderOpen] = React.useState(false);
  const [confirmOrder, setConfirmOrder] = React.useState<Order | null>(null);
  const [newCustomer, setNewCustomer] = React.useState("");
  const [toast, setToast] = React.useState({ open: false, title: "", description: "" });
  const [orderTab, setOrderTab] = React.useState("Dispatch board");
  const searchRef = React.useRef<HTMLInputElement>(null);
  const { theme, toggleTheme } = useTheme();
  const notify = (title: string, description: string) => setToast({ open: true, title, description });
  const filteredOrders = orders.filter((order) => `${order.id} ${order.customer} ${order.product} ${order.status}`.toLowerCase().includes(query.toLowerCase()));

  React.useEffect(() => {
    function focusSearch(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchRef.current?.focus();
      }
    }
    document.addEventListener("keydown", focusSearch);
    return () => document.removeEventListener("keydown", focusSearch);
  }, []);

  function addOrder(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const customer = newCustomer.trim();
    if (!customer) return;
    setOrders((current) => {
      const nextNumber = Math.max(...current.map((order) => Number(order.id.slice(3)))) + 1;
      return [{ id: `HW-${nextNumber}`, customer, product: "1 item", amount: "£48.00", time: "Just now", status: "New" }, ...current];
    });
    setNewCustomer("");
    setNewOrderOpen(false);
    notify("Order created", `Mock order added for ${customer}.`);
  }

  function completeOrder() {
    if (!confirmOrder) return;
    setOrders((current) => current.map((order) => order.id === confirmOrder.id ? { ...order, status: order.status === "New" ? "Packing" : order.status === "Packing" ? "On the way" : "Delivered" } : order));
    notify("Order updated", `${confirmOrder.id} moved to the next dispatch stage.`);
    setConfirmOrder(null);
  }

  return <MotionConfig reducedMotion="user"><ToastProvider>
    <div className="admin-shell min-h-[720px] bg-[#1f2123] text-[#f1f2f3]">
      <Sidebar className="admin-sidebar" aria-label="Primary sidebar">
        <div className="admin-brand"><span className="brand-mark">i</span><span><b>Ignara</b><small>Heartwell networks</small></span></div>
        <Button className="new-button" size="sm" variant="outline" onClick={() => setNewOrderOpen(true)}><Plus size={14} />New order<span className="shortcut">N</span></Button>
        <p className="nav-caption">Workspace</p>
        <nav aria-label="Main navigation" className="admin-nav">
          {navItems.map(({ id, label, icon: Icon }) => <button key={id} className={`admin-nav-item ${page === id ? "active" : ""}`} onClick={() => setPage(id)}><Icon size={16} /><span>{label}</span>{id === "orders" && <span className="nav-count" aria-hidden="true">38</span>}</button>)}
        </nav>
        <div className="sidebar-spacer" />
        <div className="target-mini"><div className="target-ring"><span>34%</span></div><div><small>Today so far</small><b>£1,339</b><small>7 orders · goal £2,800</small></div></div>
        <button className="help-link" onClick={() => notify("Help center", "Help content is a showcase placeholder.")}><CircleHelp size={15} />Help center</button>
      </Sidebar>

      <div className="admin-main">
        <Topbar className="admin-topbar">
          <ResponsiveNavigation items={navItems.map(({ id, label, icon: Icon }) => ({ id, label, icon: <Icon size={16} /> }))} activeId={page} onSelect={(id) => setPage(id as Page)} trigger={<Menu size={19} />} />
          <label className="global-search"><Search size={15} /><span className="sr-only">Search orders</span><input ref={searchRef} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search orders, products, customers" /><kbd aria-hidden="true">⌘ K</kbd></label>
          <div className="topbar-actions"><span className="top-date"><span className="live-dot" />Tuesday 10 November</span><Button variant="ghost" size="icon" aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`} onClick={toggleTheme}>{theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}</Button><Button variant="ghost" size="icon" aria-label="Notifications" onClick={() => notify("All caught up", "You have no new notifications.")}><Bell size={16} /><i className="notification-dot" /></Button><DropdownMenu><DropdownMenuTrigger asChild><button className="profile-trigger"><span className="avatar">NC</span><span className="profile-name"><b>Noor Castellanos</b><small>Head of Sales</small></span><ChevronDown size={13} /></button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuLabel>Account</DropdownMenuLabel><DropdownMenuItem onSelect={() => setPage("settings")}>Profile settings</DropdownMenuItem><DropdownMenuItem onSelect={() => notify("Signed in", "This preview uses mock account data.")}>Account status</DropdownMenuItem></DropdownMenuContent></DropdownMenu></div>
        </Topbar>

        <main className="admin-content">
          {page === "overview" && <Overview range={range} setRange={setRange} orders={filteredOrders} openOrders={() => setPage("orders")} openNewOrder={() => setNewOrderOpen(true)} notify={notify} />}
          {page === "sales" && <Sales range={range} setRange={setRange} notify={notify} />}
          {page === "orders" && <OrdersPage orders={filteredOrders} tab={orderTab} setTab={setOrderTab} openNewOrder={() => setNewOrderOpen(true)} confirmOrder={setConfirmOrder} notify={notify} />}
          {page === "settings" && <Settings notify={notify} />}
        </main>
      </div>

      <Dialog open={newOrderOpen} onOpenChange={setNewOrderOpen}><DialogContent><DialogHeader><DialogTitle>Create order</DialogTitle><DialogDescription>Add a mock order to the local preview. Data resets when page reloads.</DialogDescription></DialogHeader><form onSubmit={addOrder} className="form-stack"><Label htmlFor="customer-name">Customer name</Label><Input id="customer-name" autoFocus placeholder="e.g. Alex Morgan" value={newCustomer} onChange={(event) => setNewCustomer(event.target.value)} required /><DialogFooter><Button type="button" variant="outline" onClick={() => setNewOrderOpen(false)}>Cancel</Button><Button type="submit">Create order</Button></DialogFooter></form></DialogContent></Dialog>
      <ConfirmDialog open={Boolean(confirmOrder)} onOpenChange={(open) => !open && setConfirmOrder(null)} title="Update order status?" description={`${confirmOrder?.id} will move to the next dispatch stage. This mock change cannot be undone.`} confirmLabel="Update status" destructive onConfirm={completeOrder} />
      <Toast {...toast} onOpenChange={(open) => setToast((current) => ({ ...current, open }))} />
    </div>
  </ToastProvider></MotionConfig>;
}

function PageHeading({ eyebrow, title, description, actions }: { eyebrow?: string; title: string; description?: string; actions?: React.ReactNode }) {
  return <div className="page-heading"><div>{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h1>{title}</h1>{description && <p className="page-description">{description}</p>}</div>{actions && <div className="heading-actions">{actions}</div>}</div>;
}

function Overview({ range, setRange, orders, openOrders, openNewOrder, notify }: { range: string; setRange: (range: string) => void; orders: Order[]; openOrders: () => void; openNewOrder: () => void; notify: (title: string, description: string) => void }) {
  return <>
    <PageHeading eyebrow="Good morning, Noor" title="Heartwell today" description="£1,339 taken from 7 orders since midnight · 38 waiting to ship · 3 products running low." actions={<><Button variant="outline" onClick={() => { downloadCsv("sales-report.csv", [["Metric", "Value"], ["Takings", "£28,483"], ["Orders", "224"], ["Average basket", "£127.16"], ["Returns", "1.3%"]]); notify("Sales report downloaded", "CSV generated from mock dashboard data."); }}><Download size={14} />Sales report</Button><Button onClick={openNewOrder}><Plus size={15} />New order</Button></>} />
    <div className="overview-grid">
      <div className="overview-primary">
        <div className="stat-grid">
          <StatCard label="Takings · November" value="£28,483" change="34% of £84k" trend="up" primary />
          <StatCard label="Orders" value="224" change="+8.1%" trend="up" />
          <StatCard label="Avg. basket" value="£127.16" change="+3.4%" trend="up" />
          <StatCard label="Returns" value="1.3%" change="−1.2%" trend="down" />
        </div>
          <Card className="sales-chart-card"><CardHeader className="chart-heading"><div><CardTitle>Takings against target</CardTitle><p>Every sale, every channel — remember the day best fits target.</p></div><Select value={range} onValueChange={setRange}><SelectTrigger className="range-select"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="14 days">14 days</SelectItem><SelectItem value="30 days">30 days</SelectItem><SelectItem value="12 weeks">12 weeks</SelectItem></SelectContent></Select></CardHeader><CardContent><div className="chart-summary"><div><small>Takings</small><strong>£41,965</strong></div><span><small>Best target</small><b>9 of 14 days</b></span><span><small>Target</small><b>£2,800 a day</b></span><span><small>Best day</small><b>£3,821 Fri 30</b></span></div><RevenueChart range={range} /></CardContent></Card>
        <Card className="table-card"><CardHeader className="table-heading"><div><CardTitle>Recent orders</CardTitle><p>Latest activity from your store.</p></div><Button size="sm" variant="ghost" onClick={openOrders}>View all <ArrowUpRight size={13} /></Button></CardHeader><CardContent className="table-wrap"><Table><TableHead><TableRow><TableHeader>Order</TableHeader><TableHeader>Customer</TableHeader><TableHeader>Amount</TableHeader><TableHeader>Status</TableHeader></TableRow></TableHead><TableBody>{orders.slice(0, 4).map((order) => <TableRow key={order.id}><TableCell className="font-semibold">{order.id}</TableCell><TableCell>{order.customer}</TableCell><TableCell>{order.amount}</TableCell><TableCell><StatusBadge status={order.status} /></TableCell></TableRow>)}</TableBody></Table>{orders.length === 0 && <EmptyState title="No matching orders" description="Try another search or clear search terms." />}</CardContent></Card>
      </div>
      <aside className="overview-aside"><WalletCard notify={notify} /><TargetCard /></aside>
    </div>
  </>;
}

function StatCard({ label, value, change, trend, primary }: { label: string; value: string; change: string; trend: "up" | "down"; primary?: boolean }) {
  const Icon = trend === "up" ? ArrowUpRight : ArrowDownRight;
  return <Card className={`stat-card ${primary ? "stat-card-primary" : ""}`}><div className="stat-label"><span>{label}</span></div><strong>{value}</strong><div className="stat-foot"><Badge className={trend === "up" ? "badge-positive" : "badge-neutral"}><Icon size={11} />{change}</Badge>{primary && <span>vs target</span>}<Sparkline seed={label.length} /></div></Card>;
}

function Sparkline({ seed }: { seed: number }) {
  const points = Array.from({ length: 8 }, (_, index) => `${index * 10},${17 - ((index * (seed + 3) * 7) % 15)}`).join(" ");
  return <svg className="sparkline" viewBox="0 0 70 20" aria-hidden="true"><polyline points={points} fill="none" stroke="currentColor" strokeWidth="1.7" /></svg>;
}

function RevenueChart({ values = chartValues, range = "14 days", seriesLabel = "Daily takings" }: { values?: number[]; range?: string; seriesLabel?: string }) {
  const scale = range === "30 days" ? 1.12 : range === "12 weeks" ? 1.24 : 1;
  const chartLabel = seriesLabel === "Daily takings" ? `${seriesLabel} over ${range}` : `${seriesLabel} sales over ${range}`;
  const bars = values.map((value, index) => ({ x: 35 + index * 62, y: 220 - Math.min(100, value * scale) * 1.65, muted: [0, 4, 10, 11].includes(index) }));
  return <div className="revenue-chart" role="img" aria-label={chartLabel}><div className="chart-y-labels"><span>£4.0k</span><span>£3.0k</span><span>£2.0k</span><span>£1.0k</span></div><svg viewBox="0 0 770 245" preserveAspectRatio="none"><line x1="24" y1="55" x2="760" y2="55" className="chart-grid"/><line x1="24" y1="110" x2="760" y2="110" className="chart-grid"/><line x1="24" y1="165" x2="760" y2="165" className="chart-grid"/><line x1="24" y1="110" x2="760" y2="110" className="chart-target"/>{bars.map(({ x, y, muted }, index) => <g key={x}><line x1={x} y1="220" x2={x} y2={y} className={muted ? "chart-bar-muted" : "chart-bar"} /><circle cx={x} cy={y} r="4" className={muted ? "chart-dot-muted" : "chart-dot"} /><text x={x} y="239" textAnchor="middle" className={`chart-x-label${index % 2 ? " chart-x-label-secondary" : ""}`}>{["Wed 28", "Thu 29", "Fri 30", "Sat 31", "Sun 1", "Mon 2", "Tue 3", "Wed 4", "Thu 5", "Fri 6", "Sat 7", "Sun 8"][index]}</text></g>)}</svg></div>;
}

function WalletCard({ notify }: { notify: (title: string, description: string) => void }) {
  return <Card className="wallet-card"><div className="wallet-heading"><div><small>Wallet</small><p>Ready to pay out</p></div><span className="wallet-icon"><Wallet size={15} /></span></div><strong>£14,272.87</strong><svg viewBox="0 0 250 48" role="img" aria-label="Wallet balance trend rising"><path d="M0 37 C24 34 29 38 49 30 S81 31 105 24 137 28 163 20 192 22 216 13 235 16 250 8" fill="none" stroke="var(--template-accent)" strokeWidth="2" /></svg><div className="wallet-row"><span>Settling<br /><b>£2,506</b></span><span>Owned by stocks<br /><b>£5,029</b></span></div><Button className="w-full" onClick={() => notify("Payout requested", "Mock payout queued for this preview.")}><CreditCard size={14} />Pay out</Button><div className="overdue"><span>△</span>2 overdue</div></Card>;
}

function TargetCard() {
  return <Card className="target-card"><div className="target-heading"><div><CardTitle>November target</CardTitle><p>20 days to go</p></div></div><div className="target-content"><div className="progress-ring"><span>34%</span></div><div><small>On pace for</small><b>£8.6k</b><small>Still to sell</small><b>£55.5k</b></div></div></Card>;
}

function Sales({ range, setRange, notify }: { range: string; setRange: (range: string) => void; notify: (title: string, description: string) => void }) {
  const [tab, setTab] = React.useState("Channels");
  const [selectedChannel, setSelectedChannel] = React.useState("Web shop");
  const channels = [
    { label: "Web shop", value: "£17,284", share: "63% of sales", width: "63%", multiplier: 1 },
    { label: "Stockists", value: "£5,581", share: "20% of sales", width: "20%", multiplier: 0.68 },
    { label: "Markets", value: "£1,989", share: "7% of sales", width: "7%", multiplier: 0.42 },
    { label: "Marketplace", value: "£2,556", share: "9% of sales", width: "9%", multiplier: 0.55 }
  ];
  const channel = channels.find((item) => item.label === selectedChannel) ?? channels[0];
  const channelValues = chartValues.map((value) => Math.round(value * channel.multiplier));

  return <>
    <PageHeading title="Sales" description="What Heartwell took, where it came from, and what sold." actions={<Button variant="outline" onClick={() => { downloadCsv("sales-by-channel.csv", [["Channel", "Sales", "Share"], ...channels.map(({ label, value, share }) => [label, value, share])]); notify("Sales exported", "CSV downloaded from mock data."); }}><Download size={14} />Export CSV</Button>} />
    <Tabs value={tab} onValueChange={setTab}>
      <TabsList><TabsTrigger value="Takings">Takings</TabsTrigger><TabsTrigger value="Channels">Channels</TabsTrigger><TabsTrigger value="Best sellers">Best sellers</TabsTrigger></TabsList>
      <TabsContent value="Takings" className="mt-4">
        <Card className="sales-detail-card"><CardHeader className="chart-heading"><div><CardTitle>Takings against target</CardTitle><p>Revenue over selected period · Mock data</p></div><RangeSelect range={range} setRange={setRange} /></CardHeader><CardContent><div className="sales-total"><span>Takings</span><b>£42,025</b><Badge className="badge-positive"><ArrowUpRight size={11} />8.1%</Badge></div><RevenueChart range={range} /></CardContent></Card>
      </TabsContent>
      <TabsContent value="Channels" className="mt-4">
        <Card className="channel-card"><CardHeader><CardTitle>Where November came from</CardTitle><p>£27,410 across four channels · Mock data</p></CardHeader><CardContent>
          <div className="channel-bar" aria-label="Sales share by channel">{channels.map((item, index) => <span key={item.label} style={{ width: item.width, background: ["var(--template-accent)", "#f3a33c", "#93999d", "#719eda"][index] }} />)}</div>
          <div className="channel-grid">{channels.map((item, index) => <button type="button" className={`channel-stat ${selectedChannel === item.label ? "selected" : ""}`} aria-pressed={selectedChannel === item.label} key={item.label} onClick={() => setSelectedChannel(item.label)}><span className={`channel-dot channel-dot-${index}`} />{item.label}<b>{item.value}</b><small>{item.share}</small></button>)}</div>
        </CardContent></Card>
        <div className="sales-lower-grid">
          <Card className="sales-detail-card"><CardHeader className="chart-heading"><div><CardTitle>{selectedChannel} · {range}</CardTitle><p>Channel takings over selected period · Mock data</p></div><RangeSelect range={range} setRange={setRange} /></CardHeader><CardContent><RevenueChart range={range} values={channelValues} seriesLabel={selectedChannel} /></CardContent></Card>
          <Card className="sales-detail-card"><CardHeader><CardTitle>This month against last</CardTitle><p>First 10 days of each month, comparing sales.</p></CardHeader><CardContent>{channels.slice(0, 3).map((item, index) => <div className="compare-row" key={item.label}><span>{item.label}</span><div><i style={{ width: `${75 - index * 14}%` }} /></div><b>{item.value}</b></div>)}</CardContent></Card>
        </div>
      </TabsContent>
      <TabsContent value="Best sellers" className="mt-4">
        <Card><CardHeader><CardTitle>Best sellers</CardTitle><p>Top products by revenue · Mock data</p></CardHeader><CardContent><Table><TableHead><TableRow><TableHeader>Product</TableHeader><TableHeader>Units sold</TableHeader><TableHeader>Revenue</TableHeader><TableHeader>Change</TableHeader></TableRow></TableHead><TableBody>{[["Heartwell Daily", "182", "£8,190", "+12%"], ["Night Restore", "126", "£5,544", "+8%"], ["Calm Drops", "94", "£3,196", "+4%"]].map((row) => <TableRow key={row[0]}>{row.map((cell, index) => <TableCell key={`${row[0]}-${index}`}>{cell}</TableCell>)}</TableRow>)}</TableBody></Table></CardContent></Card>
      </TabsContent>
    </Tabs>
  </>;
}
function RangeSelect({ range, setRange }: { range: string; setRange: (range: string) => void }) { return <Select value={range} onValueChange={setRange}><SelectTrigger className="range-select"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="14 days">14 days</SelectItem><SelectItem value="30 days">30 days</SelectItem><SelectItem value="12 weeks">12 weeks</SelectItem></SelectContent></Select>; }

function OrdersPage({ orders, tab, setTab, openNewOrder, confirmOrder, notify }: { orders: Order[]; tab: string; setTab: (tab: string) => void; openNewOrder: () => void; confirmOrder: (order: Order) => void; notify: (title: string, description: string) => void }) {
  const statuses: Order["status"][] = ["New", "Packing", "On the way", "Delivered"];
  const exportOrders = () => {
    downloadCsv("orders.csv", [["Order", "Customer", "Items", "Amount", "Placed", "Status"], ...orders.map(({ id, customer, product, amount, time, status }) => [id, customer, product, amount, time, status])]);
    notify("Orders exported", "CSV downloaded from mock data.");
  };

  return <>
    <PageHeading title="Orders" description="38 orders to pack and ship · 227 in the last two days." actions={<><Button variant="outline" onClick={exportOrders}><Download size={14} />Export</Button><Button onClick={openNewOrder}><Plus size={15} />New order</Button></>} />
    <Tabs value={tab} onValueChange={setTab}>
      <TabsList><TabsTrigger value="Dispatch board">Dispatch board <span className="tab-count">38</span></TabsTrigger><TabsTrigger value="All orders">All orders</TabsTrigger></TabsList>
      <TabsContent value="Dispatch board" className="mt-4"><div className="kanban-board">{statuses.map((status) => {
        const group = orders.filter((order) => order.status === status);
        return <section className="kanban-column" key={status}>
          <header><span className={`status-dot status-${status.toLowerCase().replaceAll(" ", "-")}`} /><b>{status}</b><Badge>{group.length}</Badge><span className="column-total">{status === "New" ? "£2,109" : "£2,380"}</span></header>
          <div className="kanban-cards">{group.map((order) => <article className="order-card" key={order.id}>
            <div className="order-card-top"><b>{order.id}</b><Badge className="source-badge">Web shop</Badge></div>
            <p>{order.customer}</p><small>{order.product}</small>
            <div className="order-card-bottom"><span><b>{order.amount}</b><small>{order.time}</small></span>{status !== "Delivered" && <Button variant="outline" size="sm" onClick={() => confirmOrder(order)}>{status === "New" ? "Pack" : status === "Packing" ? "Ship" : "Deliver"}<ArrowUpRight size={12} /></Button>}</div>
          </article>)}</div>
        </section>;
      })}</div></TabsContent>
      <TabsContent value="All orders" className="mt-4"><Card className="table-card"><CardContent className="table-wrap">
        <Table><TableHead><TableRow><TableHeader>Order</TableHeader><TableHeader>Customer</TableHeader><TableHeader>Items</TableHeader><TableHeader>Amount</TableHeader><TableHeader>Placed</TableHeader><TableHeader>Status</TableHeader></TableRow></TableHead>
          <TableBody>{orders.map((order) => <TableRow key={order.id}><TableCell className="font-semibold">{order.id}</TableCell><TableCell>{order.customer}</TableCell><TableCell>{order.product}</TableCell><TableCell>{order.amount}</TableCell><TableCell>{order.time}</TableCell><TableCell><StatusBadge status={order.status} /></TableCell></TableRow>)}</TableBody>
        </Table>
        {orders.length === 0 && <EmptyState title="No matching orders" description="Try changing search terms." />}
      </CardContent></Card></TabsContent>
    </Tabs>
  </>;
}
function StatusBadge({ status }: { status: Order["status"] }) { return <Badge className={`status-badge status-badge-${status.toLowerCase().replaceAll(" ", "-")}`}><span className={`status-dot status-${status.toLowerCase().replaceAll(" ", "-")}`} />{status}</Badge>; }

function Settings({ notify }: { notify: (title: string, description: string) => void }) {
  const [section, setSection] = React.useState<"general" | "notifications" | "team">("general");
  const [workspaceName, setWorkspaceName] = React.useState("Heartwell networks");
  const [weekStarts, setWeekStarts] = React.useState("monday");
  const [emailAlerts, setEmailAlerts] = React.useState(true);
  const [lowStock, setLowStock] = React.useState(false);
  return <><PageHeading title="Settings" description="Manage your workspace preferences." /><div className="settings-layout"><nav className="settings-nav" aria-label="Settings sections"><Button variant={section === "general" ? "secondary" : "ghost"} className="justify-start" aria-current={section === "general" ? "page" : undefined} onClick={() => setSection("general")}>General</Button><Button variant={section === "notifications" ? "secondary" : "ghost"} className="justify-start" aria-current={section === "notifications" ? "page" : undefined} onClick={() => setSection("notifications")}>Notifications</Button><Button variant={section === "team" ? "secondary" : "ghost"} className="justify-start" aria-current={section === "team" ? "page" : undefined} onClick={() => setSection("team")}>Team</Button></nav><Card><CardHeader><CardTitle>{section === "general" ? "General preferences" : section === "notifications" ? "Notification preferences" : "Team members"}</CardTitle><p>{section === "team" ? "Manage people in this mock workspace." : "Customize your Heartwell workspace."}</p></CardHeader>{section === "general" && <CardContent className="settings-content"><div className="setting-row"><div><b>Workspace name</b><small>Shown to members in your workspace.</small></div><Input value={workspaceName} onChange={(event) => setWorkspaceName(event.target.value)} aria-label="Workspace name" /></div><div className="setting-row"><div><b>Week starts on</b><small>Used in reports and date ranges.</small></div><Select value={weekStarts} onValueChange={setWeekStarts}><SelectTrigger className="setting-select"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="monday">Monday</SelectItem><SelectItem value="sunday">Sunday</SelectItem></SelectContent></Select></div><div className="flex justify-end"><Button onClick={() => notify("Preferences saved", "Settings are stored for this preview session only.")}>Save changes</Button></div></CardContent>}{section === "notifications" && <CardContent className="settings-content"><div className="setting-row"><div><b>Email notifications</b><small>Receive a daily summary of sales activity.</small></div><Switch checked={emailAlerts} onCheckedChange={setEmailAlerts} aria-label="Email notifications" /></div><div className="setting-row"><div><b>Low stock alerts</b><small>Notify when a product falls below threshold.</small></div><Switch checked={lowStock} onCheckedChange={setLowStock} aria-label="Low stock alerts" /></div><div className="flex justify-end"><Button onClick={() => notify("Preferences saved", "Notification settings are stored for this preview session only.")}>Save changes</Button></div></CardContent>}{section === "team" && <CardContent className="settings-content"><div className="team-member"><span className="avatar">NC</span><span><b>Noor Castellanos</b><small>Owner · noor@heartwell.example</small></span><Badge>Owner</Badge></div><div className="team-member"><span className="avatar team-avatar">MP</span><span><b>Mina Patel</b><small>Analyst · mina@heartwell.example</small></span><Badge>Member</Badge></div><Button className="mt-4" variant="outline" onClick={() => notify("Invites are mock-only", "Team invitations are not connected in this preview.")}>Invite member</Button></CardContent>}</Card></div></>;
}

export function TemplatePreviewFrame() { return <ModernAdmin />; }

export default ModernAdmin;

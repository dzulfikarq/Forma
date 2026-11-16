import * as React from "react";
import {
  Activity, ArrowDown, ArrowRight, ArrowUp, Bell, CalendarDays, Check, CheckCircle2,
  ChevronRight, CircleAlert, Clock3, ClipboardCheck, Download, Fuel, Gauge, Map as MapIcon, MapPin,
  Package, Plus, Radio, Route, Search, Settings, ShieldCheck, Thermometer, Truck, Users, Warehouse, Zap,
  type LucideIcon
} from "lucide-react";
import {
  Badge, Button, Card, CardContent, Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, Input, Label, ResponsiveNavigation, Select, SelectContent,
  SelectItem, SelectTrigger, SelectValue, Switch, Toast, ToastProvider
} from "@design-templates/ui";
import "./transit-operations.css";

type Page = "Live map" | "Shipments" | "Fleet" | "Drivers" | "Route planner" | "Fuel & costs" | "Settings";
type DialogName = "dispatch" | "date" | "alerts" | "manifest" | "proof" | "reorder" | "search" | null;
type Shipment = { id: string; client: string; cargo: string; pallets: number; weight: string; origin: string; destination: string; status: string; plannedKm: number };
type Stop = { id: string; location: string; detail: string; time: string; distanceKm: number; pod?: boolean };
type Vehicle = { id: string; name: string; plate: string; driver: string; status: "On route" | "Ready" | "Service"; temperature: string };
type Driver = { id: string; name: string; initials: string; route: string; shift: boolean; nextCheck: string };

const navGroups: Array<{ heading: string; items: Array<{ id: Page; icon: LucideIcon }> }> = [
  { heading: "OPERATIONS", items: [{ id: "Live map", icon: MapIcon }, { id: "Shipments", icon: Package }, { id: "Fleet", icon: Truck }, { id: "Drivers", icon: Users }] },
  { heading: "INSIGHTS", items: [{ id: "Route planner", icon: Route }, { id: "Fuel & costs", icon: Fuel }, { id: "Settings", icon: Settings }] }
];
const pages = navGroups.flatMap((group) => group.items);
const initialShipments: Shipment[] = [
  { id: "TR-4827", client: "Nusa Foods", cargo: "Frozen goods", pallets: 12, weight: "8,640 kg", origin: "West Hub", destination: "North Market", status: "In transit", plannedKm: 71 },
  { id: "TR-4828", client: "Kirana Produce", cargo: "Fresh produce", pallets: 9, weight: "5,120 kg", origin: "Central Depot", destination: "River Market", status: "Loading", plannedKm: 54 },
  { id: "TR-4901", client: "Mitra Pantry", cargo: "Dry goods", pallets: 8, weight: "4,300 kg", origin: "South Hub", destination: "East Depot", status: "Delivered", plannedKm: 63 }
];
const initialStops: Stop[] = [
  { id: "west-hub", location: "West Hub", detail: "Loaded 12 pallets", time: "07:40", distanceKm: 0 },
  { id: "bekasi-north", location: "Bekasi North", detail: "Signed · Yuni K.", time: "09:05", distanceKm: 14.2, pod: true },
  { id: "pulo-market", location: "Pulo Market", detail: "Signed · Hartono", time: "10:20", distanceKm: 25.8, pod: true },
  { id: "cakung-gate", location: "Cakung Gate", detail: "4 pallets · photo POD", time: "11:46", distanceKm: 36.4, pod: true },
  { id: "kelapa-market", location: "Kelapa Market", detail: "Supermarket dock B", time: "14:20", distanceKm: 48.6 },
  { id: "sunter-depot", location: "Sunter Depot", detail: "Return containers", time: "15:30", distanceKm: 71 }
];
const cargoRows = [
  { item: "Frozen dumplings · 1 kg", sku: "NF-FRZ-104", quantity: "120 ctn", temperature: "−18 °C", status: "Loaded", tone: "gold" },
  { item: "Fresh oat milk · 1 L", sku: "NF-CHL-220", quantity: "64 ctn", temperature: "4 °C", status: "Loaded", tone: "blue" },
  { item: "Garden salad · 250 g", sku: "NF-PRD-031", quantity: "40 ctn", temperature: "4 °C", status: "Loaded", tone: "mint" }
];
const initialVehicles: Vehicle[] = [
  { id: "v1", name: "Reefer 08", plate: "B 9127 KXT", driver: "Rani Kusuma", status: "On route", temperature: "3.8 °C" },
  { id: "v2", name: "Reefer 12", plate: "B 8044 QJL", driver: "Dimas Arta", status: "Ready", temperature: "4.1 °C" },
  { id: "v3", name: "Box truck 03", plate: "B 6210 MNP", driver: "Sari Putri", status: "Service", temperature: "—" },
  { id: "v4", name: "Reefer 15", plate: "B 7712 LRD", driver: "Bayu Santoso", status: "Ready", temperature: "3.6 °C" }
];
const initialDrivers: Driver[] = [
  { id: "d1", name: "Rani Kusuma", initials: "RK", route: "West Hub → North Market", shift: true, nextCheck: "Break due in 42 min" },
  { id: "d2", name: "Dimas Arta", initials: "DA", route: "Central Depot · standby", shift: true, nextCheck: "Break due in 1 hr" },
  { id: "d3", name: "Sari Putri", initials: "SP", route: "East Depot · off shift", shift: false, nextCheck: "Next shift 14:00" },
  { id: "d4", name: "Bayu Santoso", initials: "BS", route: "South Hub · standby", shift: true, nextCheck: "Break due in 2 hr" }
];

const dateLabel = (date: string) => new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric" }).format(new Date(`${date}T12:00:00`));

export function TransitOperations() {
  return <ToastProvider><OperationsWorkspace /></ToastProvider>;
}

function OperationsWorkspace() {
  const [page, setPage] = React.useState<Page>("Shipments");
  const [depot, setDepot] = React.useState("West Hub");
  const [date, setDate] = React.useState("2026-10-19");
  const [dateDraft, setDateDraft] = React.useState(date);
  const [shipments, setShipments] = React.useState(initialShipments);
  const [selectedShipmentId, setSelectedShipmentId] = React.useState("TR-4827");
  const [stops, setStops] = React.useState(initialStops);
  const [activeStopId, setActiveStopId] = React.useState("kelapa-market");
  const [plannedDistance, setPlannedDistance] = React.useState(71);
  const [vehicles, setVehicles] = React.useState(initialVehicles);
  const [drivers, setDrivers] = React.useState(initialDrivers);
  const [vehicleFilter, setVehicleFilter] = React.useState("All vehicles");
  const [fuelRange, setFuelRange] = React.useState("Today");
  const [fuelCategory, setFuelCategory] = React.useState("All");
  const [reeferAlerts, setReeferAlerts] = React.useState(true);
  const [routeAlerts, setRouteAlerts] = React.useState(true);
  const [dialog, setDialog] = React.useState<DialogName>(null);
  const [proofLocation, setProofLocation] = React.useState("");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [draftId, setDraftId] = React.useState("");
  const [draftClient, setDraftClient] = React.useState("");
  const [draftDestination, setDraftDestination] = React.useState("");
  const [toast, setToast] = React.useState({ open: false, title: "" });

  const shipment = shipments.find((item) => item.id === selectedShipmentId) ?? shipments[0];
  const activeStopIndex = Math.max(0, stops.findIndex((stop) => stop.id === activeStopId));
  const activeStop = stops[activeStopIndex] ?? stops[0];
  const distanceDriven = activeStop?.distanceKm ?? 0;
  const progress = Math.min(100, Math.round(distanceDriven / plannedDistance * 100));
  const fuelUsed = (distanceDriven * .235).toFixed(1);
  const carbon = (distanceDriven * .6214).toFixed(1);
  const searchMatches = searchQuery.trim() ? shipments.filter((item) => `${item.id} ${item.client} ${item.destination} ${item.origin}`.toLowerCase().includes(searchQuery.trim().toLowerCase())) : [];

  function notify(title: string) { setToast({ open: true, title }); }
  function navigate(nextPage: string) {
    if (pages.some((item) => item.id === nextPage)) setPage(nextPage as Page);
  }
  function selectShipment(item: Shipment) {
    setSelectedShipmentId(item.id);
    setActiveStopId("kelapa-market");
    setPage("Shipments");
    setSearchQuery("");
    setDialog(null);
  }
  function searchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = shipments.find((item) => `${item.id} ${item.client} ${item.destination} ${item.origin}`.toLowerCase().includes(searchQuery.trim().toLowerCase()));
    if (result) selectShipment(result);
    else notify(searchQuery.trim() ? "No matching sample shipment found" : "Enter a shipment, client, or destination");
  }
  function createShipment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const id = draftId.trim().toUpperCase();
    if (shipments.some((item) => item.id === id)) { notify("Shipment ID already exists"); return; }
    const added: Shipment = { id, client: draftClient.trim(), cargo: "Mixed ambient goods", pallets: 8, weight: "5,200 kg", origin: depot, destination: draftDestination.trim(), status: "Queued", plannedKm: 42 };
    setShipments((current) => [added, ...current]);
    setSelectedShipmentId(id);
    setActiveStopId("west-hub");
    setPlannedDistance(42);
    setPage("Shipments");
    setDialog(null);
    setDraftId(""); setDraftClient(""); setDraftDestination("");
    notify(`Sample shipment ${id} added to this session`);
  }
  function saveDate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setDate(dateDraft);
    setDialog(null);
    notify("Operations date updated for this session");
  }
  function moveStop(index: number, direction: -1 | 1) {
    setStops((current) => {
      const target = index + direction;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }
  function markVehicleReady(id: string) {
    setVehicles((current) => current.map((item) => item.id === id ? { ...item, status: "Ready" } : item));
    notify("Vehicle marked ready in this sample");
  }
  function changeDriverShift(id: string) {
    setDrivers((current) => current.map((item) => item.id === id ? { ...item, shift: !item.shift } : item));
    notify("Driver shift updated in this sample");
  }

  const mobileNavItems = pages.map(({ id, icon: Icon }) => ({ id, label: id, icon: <Icon size={18} aria-hidden="true" /> }));

  return <div className="transit-operations">
    <div className="to-app">
      <aside className="to-sidebar" aria-label="Operations sidebar">
        <a className="to-brand" href="#shipments" onClick={(event) => { event.preventDefault(); setPage("Shipments"); }} aria-label="Wayline operations home">
          <span className="to-brand-icon"><Route size={21} aria-hidden="true" /></span><span>wayline<small>OPERATIONS</small></span>
        </a>
        <div className="to-depot-picker"><Warehouse size={17} aria-hidden="true" /><Select value={depot} onValueChange={(value) => { setDepot(value); notify(`${value} selected for this session`); }}><SelectTrigger aria-label="Select depot"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="West Hub">West Hub</SelectItem><SelectItem value="Central Depot">Central Depot</SelectItem><SelectItem value="South Hub">South Hub</SelectItem></SelectContent></Select></div>
        <nav className="to-sidebar-nav" aria-label="Operations navigation">
          {navGroups.map((group) => <div className="to-nav-group" key={group.heading}><p>{group.heading}</p>{group.items.map(({ id, icon: Icon }) => <Button key={id} variant="ghost" className={`to-nav-button${page === id ? " is-active" : ""}`} aria-current={page === id ? "page" : undefined} onClick={() => navigate(id)}><Icon size={18} aria-hidden="true" /><span>{id}</span>{id === "Shipments" && <small className="to-nav-count">128</small>}{id === "Fleet" && <small className="to-nav-alert">3</small>}</Button>)}</div>)}
        </nav>
        <div className="to-sidebar-bottom">
          <button className="to-delivery-card" onClick={() => setPage("Fleet")}><span>Deliveries today</span><strong>86 <small>/ 128</small></strong><i><b /></i><span>On-time rate <b>94.2%</b></span></button>
          <div className="to-user"><span className="to-avatar">RK</span><span><b>Rani Kusuma</b><small>Dispatch lead</small></span><span className="to-user-status" aria-label="On shift" /></div>
        </div>
      </aside>

      <main className="to-main">
        <header className="to-topbar">
          <div className="to-operations-title"><strong>Jakarta operations</strong><span className="to-live"><i />Sample live</span></div>
          <div className="to-top-actions">
            <div className="to-desktop-search">
              <form className="to-search-form" role="search" onSubmit={searchSubmit}><Search size={16} aria-hidden="true" /><Label className="sr-only" htmlFor="to-desktop-search">Search shipments</Label><Input id="to-desktop-search" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Shipment, driver or stop" autoComplete="off" /></form>
              {searchMatches.length > 0 && <div className="to-search-results">{searchMatches.map((item) => <button type="button" key={item.id} onClick={() => selectShipment(item)}><Package size={16} aria-hidden="true" /><span><b>{item.id}</b><small>{item.client} · {item.destination}</small></span></button>)}</div>}
            </div>
            <ResponsiveNavigation items={mobileNavItems} activeId={page} onSelect={navigate} label="Open operations navigation" trigger={<MapIcon size={18} aria-hidden="true" />} />
            <Button variant="outline" size="sm" className="to-date-button" aria-label={`Set operations date: ${dateLabel(date)}`} onClick={() => { setDateDraft(date); setDialog("date"); }}><CalendarDays size={16} aria-hidden="true" /><span>{dateLabel(date)}</span></Button>
            <Button variant="outline" size="icon" className="to-mobile-search" aria-label="Search shipments" onClick={() => setDialog("search")}><Search size={18} aria-hidden="true" /></Button>
            <Button variant="ghost" size="icon" className="to-alert-button" aria-label="Open notifications, 3 updates" onClick={() => setDialog("alerts")}><Bell size={18} aria-hidden="true" /><i /></Button>
            <Button className="to-dispatch-button" onClick={() => { setDraftId(""); setDraftClient(""); setDraftDestination(""); setDialog("dispatch"); }}><Plus size={17} aria-hidden="true" /><span>Dispatch</span></Button>
          </div>
        </header>

        <div className="to-content" data-page={page}>
          {page === "Shipments" && <ShipmentDetail shipment={shipment} stops={stops} activeStopIndex={activeStopIndex} distanceDriven={distanceDriven} fuelUsed={fuelUsed} carbon={carbon} progress={progress} plannedDistance={plannedDistance} onSelectStop={setActiveStopId} onOpenReorder={() => setDialog("reorder")} onOpenManifest={() => setDialog("manifest")} onOpenProof={(location) => { setProofLocation(location); setDialog("proof"); }} onOpenMap={() => setPage("Live map")} />}
          {page === "Live map" && <LiveMapPage stops={stops} activeStopId={activeStopId} onSelectStop={(id) => { setActiveStopId(id); setPage("Shipments"); }} onDispatch={() => setDialog("dispatch")} />}
          {page === "Fleet" && <FleetPage vehicles={vehicles} filter={vehicleFilter} setFilter={setVehicleFilter} onReady={markVehicleReady} onViewRoute={() => setPage("Shipments")} />}
          {page === "Drivers" && <DriversPage drivers={drivers} onChangeShift={changeDriverShift} />}
          {page === "Route planner" && <RoutePlannerPage stops={stops} plannedDistance={plannedDistance} onMove={moveStop} onOptimize={() => { setPlannedDistance(68.4); notify("Sample route optimized · 2.6 km saved"); }} onSelectStop={setActiveStopId} />}
          {page === "Fuel & costs" && <FuelCostsPage range={fuelRange} setRange={setFuelRange} category={fuelCategory} setCategory={setFuelCategory} />}
          {page === "Settings" && <SettingsPage depot={depot} setDepot={setDepot} reeferAlerts={reeferAlerts} setReeferAlerts={setReeferAlerts} routeAlerts={routeAlerts} setRouteAlerts={setRouteAlerts} onSave={() => notify("Preferences saved for this session")} />}
        </div>
        <footer className="to-footer"><span>Sample workspace · actions stay in this session</span><span><ShieldCheck size={14} aria-hidden="true" /> No live GPS or dispatch connection</span></footer>
      </main>
    </div>

    <Dialog open={dialog !== null} onOpenChange={(open) => !open && setDialog(null)}>
      <DialogContent className="to-dialog" aria-describedby="to-dialog-description">
        <DialogHeader><DialogTitle>{dialog === "dispatch" ? "Dispatch a shipment" : dialog === "date" ? "Operations date" : dialog === "alerts" ? "Latest updates" : dialog === "manifest" ? "Shipment manifest" : dialog === "proof" ? `Proof of delivery · ${proofLocation}` : dialog === "reorder" ? "Reorder route stops" : "Find a shipment"}</DialogTitle><DialogDescription id="to-dialog-description">{dialog === "dispatch" ? "Create a fictional shipment in this local preview." : dialog === "date" ? "Choose a date for this sample operations view." : dialog === "alerts" ? "Sample events from this workspace. No live telemetry is connected." : dialog === "manifest" ? `Cargo list for ${shipment.id}. Sample manifest only.` : dialog === "proof" ? "Illustrative delivery record. No document or signature is stored." : dialog === "reorder" ? "Change stop order for this route in the current session." : "Search the local sample shipment list."}</DialogDescription></DialogHeader>
        {dialog === "dispatch" && <form className="to-dialog-form" onSubmit={createShipment}><Label htmlFor="to-shipment-id">Shipment ID</Label><Input id="to-shipment-id" value={draftId} onChange={(event) => setDraftId(event.target.value)} placeholder="TR-5902" pattern="TR-[0-9]{4}" maxLength={7} required /><Label htmlFor="to-client">Customer</Label><Input id="to-client" value={draftClient} onChange={(event) => setDraftClient(event.target.value)} placeholder="Customer name" maxLength={60} required /><Label htmlFor="to-destination">Destination</Label><Input id="to-destination" value={draftDestination} onChange={(event) => setDraftDestination(event.target.value)} placeholder="Delivery destination" maxLength={60} required /><p className="to-form-hint">Sample shipment · no carrier or driver is contacted.</p><DialogFooter><Button type="button" variant="outline" onClick={() => setDialog(null)}>Cancel</Button><Button type="submit"><Plus size={16} aria-hidden="true" />Create shipment</Button></DialogFooter></form>}
        {dialog === "date" && <form className="to-dialog-form" onSubmit={saveDate}><Label htmlFor="to-date-input">View date</Label><Input id="to-date-input" type="date" value={dateDraft} onChange={(event) => setDateDraft(event.target.value)} required /><DialogFooter><Button type="button" variant="outline" onClick={() => setDialog(null)}>Cancel</Button><Button type="submit">Apply date</Button></DialogFooter></form>}
        {dialog === "search" && <form className="to-dialog-form" onSubmit={searchSubmit}><Label htmlFor="to-mobile-search-input">Shipment, customer, or destination</Label><Input id="to-mobile-search-input" autoFocus value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Try TR-4828" />{searchMatches.length > 0 && <div className="to-dialog-results">{searchMatches.map((item) => <button type="button" key={item.id} onClick={() => selectShipment(item)}><Package size={17} aria-hidden="true" /><span><b>{item.id}</b><small>{item.client} · {item.destination}</small></span></button>)}</div>}<DialogFooter><Button type="submit"><Search size={16} aria-hidden="true" />Search shipments</Button></DialogFooter></form>}
        {dialog === "alerts" && <div className="to-alert-list"><button onClick={() => { setActiveStopId("kelapa-market"); setPage("Shipments"); setDialog(null); }}><span className="to-alert-icon is-mint"><Thermometer size={17} aria-hidden="true" /></span><span><b>Reefer temperature stable</b><small>{shipment.id} · 3.8 °C · 4 min ago</small></span><ChevronRight size={16} aria-hidden="true" /></button><button onClick={() => { setPage("Drivers"); setDialog(null); }}><span className="to-alert-icon"><Clock3 size={17} aria-hidden="true" /></span><span><b>Driver check-in received</b><small>Rani Kusuma · 9 min ago</small></span><ChevronRight size={16} aria-hidden="true" /></button><button onClick={() => { setPage("Shipments"); setDialog(null); }}><span className="to-alert-icon is-blue"><ClipboardCheck size={17} aria-hidden="true" /></span><span><b>Delivery proof added</b><small>Bekasi North · 18 min ago</small></span><ChevronRight size={16} aria-hidden="true" /></button></div>}
        {dialog === "reorder" && <div className="to-reorder-list">{stops.map((stop, index) => <div key={stop.id}><span><small>{String(index + 1).padStart(2, "0")}</small><b>{stop.location}</b></span><span><Button variant="ghost" size="icon" aria-label={`Move ${stop.location} up`} disabled={index === 0} onClick={() => moveStop(index, -1)}><ArrowUp size={16} aria-hidden="true" /></Button><Button variant="ghost" size="icon" aria-label={`Move ${stop.location} down`} disabled={index === stops.length - 1} onClick={() => moveStop(index, 1)}><ArrowDown size={16} aria-hidden="true" /></Button></span></div>)}</div>}
        {dialog === "manifest" && <div className="to-manifest-dialog"><p><b>{shipment.client}</b><span>{shipment.cargo} · {shipment.pallets} pallets · {shipment.weight}</span></p>{cargoRows.map((row) => <div key={row.sku}><span>{row.item}<small>{row.sku}</small></span><b>{row.quantity}</b><span>{row.temperature}</span></div>)}<Button variant="outline" onClick={() => notify("Manifest export is a sample-only action")}><Download size={16} aria-hidden="true" />Export sample manifest</Button></div>}
        {dialog === "proof" && <div className="to-proof-dialog"><span className="to-proof-stamp"><CheckCircle2 size={28} aria-hidden="true" /></span><div><b>{proofLocation} handoff confirmed</b><span>Received by A. Pratama · 11:46 AM</span><span>Photo placeholder · illustrative record only</span></div><Badge className="to-status to-status-complete">Verified locally</Badge><DialogFooter><Button onClick={() => setDialog(null)}>Done</Button></DialogFooter></div>}
      </DialogContent>
    </Dialog>
    <Toast {...toast} description="Local sample feedback · resets on reload" onOpenChange={(open) => setToast((current) => ({ ...current, open }))} />
  </div>;
}

function ShipmentDetail({ shipment, stops, activeStopIndex, distanceDriven, fuelUsed, carbon, progress, plannedDistance, onSelectStop, onOpenReorder, onOpenManifest, onOpenProof, onOpenMap }: {
  shipment: Shipment; stops: Stop[]; activeStopIndex: number; distanceDriven: number; fuelUsed: string; carbon: string; progress: number; plannedDistance: number;
  onSelectStop: (id: string) => void; onOpenReorder: () => void; onOpenManifest: () => void; onOpenProof: (location: string) => void; onOpenMap: () => void;
}) {
  return <div className="to-shipment-page">
    <Card className="to-shipment-banner"><CardContent className="to-card-body to-shipment-body">
      <div className="to-shipment-top"><span className="to-shipment-mark"><Package size={21} aria-hidden="true" /></span><div className="to-shipment-ident"><div><h1>{shipment.id}</h1><Badge className={`to-status ${shipment.status === "In transit" ? "to-status-active" : "to-status-neutral"}`}>{shipment.status}</Badge></div><p>{shipment.client} · {shipment.cargo} · {shipment.pallets} pallets · {shipment.weight}</p></div><div className="to-route-endpoints"><span><b>{shipment.origin}</b><small>Departed 07:40</small></span><i><b /></i><span><b>{shipment.destination}</b><small>ETA {stops[stops.length - 1]?.time ?? "—"}</small></span></div>
      </div>
      <div className="to-progress-track" role="progressbar" aria-label="Shipment route progress" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}><i style={{ width: `${progress}%` }} /></div>
      <div className="to-progress-meta"><span>{distanceDriven.toFixed(1)} km driven</span><span>{activeStopIndex} of {stops.length} stops · {Math.max(0, plannedDistance - distanceDriven).toFixed(1)} km left</span></div>
    </CardContent></Card>

    <div className="to-shipment-layout">
      <Card className="to-stops-card"><CardContent className="to-card-body">
        <div className="to-card-heading"><div><h2>Stops</h2><p>Route sequence · {stops.length} checkpoints</p></div><Button variant="ghost" size="sm" onClick={onOpenReorder}>Reorder</Button></div>
        <div className="to-stop-list">{stops.map((stop, index) => {
          const state = index < activeStopIndex ? "complete" : index === activeStopIndex ? "current" : "upcoming";
          return <button type="button" key={stop.id} className={`to-stop-row is-${state}`} aria-current={state === "current" ? "step" : undefined} aria-label={`Set current stop: ${stop.location}`} onClick={() => onSelectStop(stop.id)}><span className="to-stop-marker">{state === "complete" ? <Check size={14} aria-hidden="true" /> : state === "upcoming" ? index + 1 : <i />}</span><span className="to-stop-copy"><b>{stop.location}</b><small>{stop.detail}</small></span><span className="to-stop-time"><b>{stop.time}</b><small>{state === "complete" ? index === 0 ? "Departed" : "On time" : state === "current" ? "Current" : "Planned"}</small></span></button>;
        })}</div>
        <div className="to-pod-section"><div className="to-pod-heading"><span>Proof of delivery</span><Badge>{stops.filter((stop) => stop.pod).length} received</Badge></div><div className="to-pod-grid">{stops.filter((stop) => stop.pod).slice(0, 3).map((stop, index) => <button type="button" key={stop.id} className={`to-pod-tile tone-${index + 1}`} aria-label={`View proof of delivery: ${stop.location}`} onClick={() => onOpenProof(stop.location)}><span><CheckCircle2 size={16} aria-hidden="true" /></span><b>{stop.location}</b><small>View handoff</small></button>)}</div></div>
      </CardContent></Card>

      <div className="to-shipment-right">
        <div className="to-metric-grid">
          <MetricCard icon={Route} label="Distance" value={`${distanceDriven.toFixed(1)} km`} detail={`of ${plannedDistance.toFixed(1)} km planned`} />
          <MetricCard icon={Clock3} label="Drive time" value="3h 12m" detail="Since 07:40 departure" />
          <MetricCard icon={Fuel} label="Fuel used" value={`${fuelUsed} L`} detail="9.1 L / 100 km" />
          <MetricCard icon={Zap} label="CO₂ so far" value={`${carbon} kg`} detail="Estimated route total" />
        </div>
        <Card className="to-temperature-card"><CardContent className="to-card-body">
          <div className="to-card-heading"><div className="to-heading-with-icon"><Thermometer size={18} aria-hidden="true" /><div><h2>Reefer temperature</h2><p>Last 6 hours · sample telemetry</p></div></div><Badge className="to-temp-badge"><i />3.8 °C now</Badge></div>
          <TemperatureChart />
          <div className="to-chart-note"><span><i />Target range 2–8 °C</span><span>Updated 2 min ago</span></div>
        </CardContent></Card>
        <Card className="to-cargo-card"><CardContent className="to-card-body">
          <div className="to-card-heading"><div><h2>Cargo for this stop</h2><p>Temperature-controlled manifest</p></div><Button variant="ghost" size="sm" onClick={onOpenManifest}>Manifest <ArrowRight size={14} aria-hidden="true" /></Button></div>
          <div className="to-table-scroll"><table className="to-cargo-table"><thead><tr><th>Item</th><th>Qty</th><th>Temp</th><th>Status</th></tr></thead><tbody>{cargoRows.map((row) => <tr key={row.sku}><td><span className={`to-cargo-icon tone-${row.tone}`}><Package size={15} aria-hidden="true" /></span><span><b>{row.item}</b><small>{row.sku}</small></span></td><td>{row.quantity}</td><td>{row.temperature}</td><td><Badge className="to-status to-status-neutral">{row.status}</Badge></td></tr>)}</tbody></table></div>
        </CardContent></Card>
        <div className="to-inline-actions"><Button variant="outline" size="sm" onClick={onOpenMap}><MapPin size={15} aria-hidden="true" />View route map</Button><span><Radio size={14} aria-hidden="true" />Sample data · not GPS-connected</span></div>
      </div>
    </div>
  </div>;
}

function MetricCard({ icon: Icon, label, value, detail }: { icon: LucideIcon; label: string; value: string; detail: string }) {
  return <Card className="to-metric-card"><CardContent className="to-card-body"><div><span className="to-metric-icon"><Icon size={17} aria-hidden="true" /></span><span>{label}</span></div><strong>{value}</strong><small>{detail}</small></CardContent></Card>;
}

function TemperatureChart() {
  return <svg className="to-temperature-chart" viewBox="0 0 640 180" role="img" aria-label="Reefer temperature stayed near 3.8 degrees Celsius, within the 2 to 8 degree target range">
    <defs><linearGradient id="to-temp-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity=".16" /><stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity=".015" /></linearGradient></defs>
    <path className="to-temp-band" d="M38 42H625V128H38Z" /><path className="to-temp-gridline" d="M38 42H625M38 85H625M38 128H625" />
    <text x="0" y="46">8°</text><text x="0" y="89">5°</text><text x="0" y="132">2°</text>
    <path className="to-temp-area" d="M38 105 C68 100 82 108 110 103 S155 98 182 104 S227 113 253 103 S295 99 323 105 S365 110 394 102 S434 96 461 104 S506 111 535 102 S578 99 608 105 L608 150 L38 150Z" />
    <path className="to-temp-line" d="M38 105 C68 100 82 108 110 103 S155 98 182 104 S227 113 253 103 S295 99 323 105 S365 110 394 102 S434 96 461 104 S506 111 535 102 S578 99 608 105" />
    <circle className="to-temp-point" cx="608" cy="105" r="5" />
    <text x="38" y="173">07:40</text><text x="132" y="173">08:40</text><text x="227" y="173">09:40</text><text x="322" y="173">10:40</text><text x="417" y="173">11:40</text><text x="512" y="173">12:40</text><text x="586" y="173">13:20</text>
  </svg>;
}

function PageHeading({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: React.ReactNode }) {
  return <div className="to-page-heading"><div><p>{eyebrow}</p><h1>{title}</h1><span>{description}</span></div>{action && <div>{action}</div>}</div>;
}

function LiveMapPage({ stops, activeStopId, onSelectStop, onDispatch }: { stops: Stop[]; activeStopId: string; onSelectStop: (id: string) => void; onDispatch: () => void }) {
  const points = [{ x: 13, y: 76 }, { x: 27, y: 58 }, { x: 42, y: 68 }, { x: 58, y: 37 }, { x: 76, y: 48 }, { x: 89, y: 22 }];
  return <><PageHeading eyebrow="OPERATIONS / LIVE MAP" title="Live fleet map" description="Route positions are illustrative sample data, not live GPS." action={<Button onClick={onDispatch}><Plus size={16} aria-hidden="true" />Dispatch shipment</Button>} />
    <div className="to-map-layout"><Card className="to-map-card"><CardContent className="to-card-body"><div className="to-card-heading"><div><h2>Jakarta delivery network</h2><p>6 stops · 4 vehicles in view</p></div><Badge className="to-live-pill"><i />Sample live</Badge></div>
      <div className="to-map-canvas"><svg viewBox="0 0 800 440" preserveAspectRatio="none" aria-hidden="true"><path className="to-map-road" d="M-20 115 C140 40 180 245 310 175 S470 65 580 150 S700 255 840 90M35 450 C90 300 205 360 295 290 S475 300 550 230 S690 345 820 275M115 -20 C220 80 185 215 280 310 S320 410 365 460M510 -20 C435 100 555 140 510 275 S585 400 650 460M760 -20 C650 75 685 170 750 240" /><path className="to-map-route" d="M80 335 C168 270 198 185 287 192 S400 276 465 239 S550 137 655 154" /></svg>
        {stops.map((stop, index) => <button type="button" key={stop.id} className={`to-map-stop${stop.id === activeStopId ? " is-active" : ""}`} style={{ left: `${points[index]?.x ?? 50}%`, top: `${points[index]?.y ?? 50}%` }} aria-label={`Select map stop ${stop.location}`} onClick={() => onSelectStop(stop.id)}><i /><span>{stop.location}</span></button>)}
        <div className="to-map-label to-map-label-one">JAKARTA</div><div className="to-map-label to-map-label-two">BEKASI</div><div className="to-map-scale"><span /><span>10 km</span></div>
      </div>
      <div className="to-map-legend"><span><i className="is-route" />Selected route</span><span><i className="is-complete" />Completed stop</span><span><i className="is-current" />Current stop</span></div>
    </CardContent></Card>
    <Card className="to-map-side"><CardContent className="to-card-body"><div className="to-card-heading"><div><h2>Route activity</h2><p>Updates for sample fleet</p></div><Activity size={18} aria-hidden="true" /></div><div className="to-route-activity"><div><span className="to-activity-icon"><Truck size={17} aria-hidden="true" /></span><span><b>TR-4827 · Reefer 08</b><small>Moving to {stops.find((stop) => stop.id === activeStopId)?.location}</small></span><Badge className="to-status to-status-active">On route</Badge></div><div><span className="to-activity-icon is-blue"><Truck size={17} aria-hidden="true" /></span><span><b>TR-4828 · Reefer 12</b><small>Loading at Central Depot</small></span><Badge className="to-status to-status-neutral">Loading</Badge></div><div><span className="to-activity-icon is-amber"><Truck size={17} aria-hidden="true" /></span><span><b>TR-4901 · Box truck 03</b><small>Last seen · East Depot</small></span><Badge className="to-status to-status-neutral">Parked</Badge></div></div><Button variant="outline" className="to-full-width" onClick={onDispatch}><Plus size={16} aria-hidden="true" />Create dispatch</Button></CardContent></Card></div>
  </>;
}

function FleetPage({ vehicles, filter, setFilter, onReady, onViewRoute }: { vehicles: Vehicle[]; filter: string; setFilter: (value: string) => void; onReady: (id: string) => void; onViewRoute: () => void }) {
  const visible = filter === "All vehicles" ? vehicles : vehicles.filter((item) => item.status === filter);
  return <><PageHeading eyebrow="OPERATIONS / FLEET" title="Fleet" description="Vehicle availability and cold-chain readiness for this sample depot." action={<Select value={filter} onValueChange={setFilter}><SelectTrigger className="to-filter-select" aria-label="Filter vehicles"><SelectValue /></SelectTrigger><SelectContent>{["All vehicles", "On route", "Ready", "Service"].map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select>} />
    <div className="to-overview-stats"><MetricCard icon={Truck} label="Vehicles" value={String(vehicles.length).padStart(2, "0")} detail="Across 3 local depots" /><MetricCard icon={CheckCircle2} label="Ready" value={String(vehicles.filter((item) => item.status === "Ready").length).padStart(2, "0")} detail="Available for dispatch" /><MetricCard icon={Route} label="On route" value={String(vehicles.filter((item) => item.status === "On route").length).padStart(2, "0")} detail="Sample active routes" /><MetricCard icon={CircleAlert} label="Service" value={String(vehicles.filter((item) => item.status === "Service").length).padStart(2, "0")} detail="Requires a check" /></div>
    <div className="to-vehicle-grid">{visible.map((vehicle) => <Card className="to-vehicle-card" key={vehicle.id}><CardContent className="to-card-body"><div className="to-vehicle-top"><span className="to-vehicle-icon"><Truck size={20} aria-hidden="true" /></span><Badge className={`to-status ${vehicle.status === "On route" ? "to-status-active" : vehicle.status === "Service" ? "to-status-warning" : "to-status-neutral"}`}>{vehicle.status}</Badge></div><h2>{vehicle.name}</h2><p className="to-vehicle-plate">{vehicle.plate}</p><div className="to-vehicle-data"><span>Assigned driver</span><b>{vehicle.driver}</b><span>Reefer reading</span><b>{vehicle.temperature}</b></div><div className="to-vehicle-actions">{vehicle.status === "Service" ? <Button size="sm" onClick={() => onReady(vehicle.id)}>Mark ready</Button> : <Button size="sm" variant="outline" onClick={onViewRoute}>{vehicle.status === "On route" ? "View route" : "Assign shipment"}</Button>}<Button variant="ghost" size="icon" aria-label={`View ${vehicle.name} details`} onClick={() => onReady(vehicle.id)}><ArrowRight size={17} aria-hidden="true" /></Button></div></CardContent></Card>)}</div>
    {visible.length === 0 && <p className="to-empty">No vehicles match this filter.</p>}
  </>;
}

function DriversPage({ drivers, onChangeShift }: { drivers: Driver[]; onChangeShift: (id: string) => void }) {
  const active = drivers.filter((driver) => driver.shift).length;
  return <><PageHeading eyebrow="OPERATIONS / DRIVERS" title="Drivers" description="Shift status and route assignments for the local dispatch team." action={<Badge className="to-live-pill"><i />{active} on shift</Badge>} />
    <Card className="to-driver-card"><CardContent className="to-card-body"><div className="to-card-heading"><div><h2>Driver roster</h2><p>Mock roster · changes stay in this session</p></div><Button variant="outline" size="sm" onClick={() => onChangeShift(drivers.find((driver) => !driver.shift)?.id ?? drivers[0].id)}><Users size={16} aria-hidden="true" />Update roster</Button></div>
      <div className="to-driver-table"><div className="to-driver-table-head"><span>Driver</span><span>Assignment</span><span>Shift check</span><span>Status</span><span /></div>{drivers.map((driver) => <div className="to-driver-row" key={driver.id}><span className="to-driver-name"><i>{driver.initials}</i><b>{driver.name}</b></span><span>{driver.route}</span><span>{driver.nextCheck}</span><span><Badge className={`to-status ${driver.shift ? "to-status-active" : "to-status-neutral"}`}>{driver.shift ? "On shift" : "Off shift"}</Badge></span><Button variant="outline" size="sm" onClick={() => onChangeShift(driver.id)}>{driver.shift ? "End shift" : "Start shift"}</Button></div>)}</div>
      <div className="to-driver-note"><ShieldCheck size={17} aria-hidden="true" /><span>Shift limits are sample indicators; no driver data is connected.</span></div>
    </CardContent></Card>
  </>;
}

function RoutePlannerPage({ stops, plannedDistance, onMove, onOptimize, onSelectStop }: { stops: Stop[]; plannedDistance: number; onMove: (index: number, direction: -1 | 1) => void; onOptimize: () => void; onSelectStop: (id: string) => void }) {
  return <><PageHeading eyebrow="INSIGHTS / ROUTE PLANNER" title="Route planner" description="Review handoffs and recalculate the sample route." action={<Button onClick={onOptimize}><Zap size={16} aria-hidden="true" />Optimize route</Button>} />
    <div className="to-route-summary-grid"><Card><CardContent className="to-card-body"><small>Planned distance</small><strong>{plannedDistance.toFixed(1)} km</strong><span>2.6 km saved after optimization</span></CardContent></Card><Card><CardContent className="to-card-body"><small>Estimated drive</small><strong>3h 12m</strong><span>Traffic model · sample only</span></CardContent></Card><Card><CardContent className="to-card-body"><small>Delivery window</small><strong>07:40–15:30</strong><span>6 route checkpoints</span></CardContent></Card></div>
    <Card className="to-planner-card"><CardContent className="to-card-body"><div className="to-card-heading"><div><h2>Stop sequence</h2><p>Choose a stop or adjust order with the arrow controls.</p></div><Badge className="to-status to-status-active">{stops.length} stops</Badge></div><div className="to-planner-list">{stops.map((stop, index) => <div key={stop.id}><button type="button" className="to-planner-stop" onClick={() => onSelectStop(stop.id)}><span className="to-planner-number">{String(index + 1).padStart(2, "0")}</span><span><b>{stop.location}</b><small>{stop.detail}</small></span><span><b>{stop.time}</b><small>{stop.distanceKm.toFixed(1)} km</small></span></button><span className="to-planner-arrows"><Button variant="ghost" size="icon" aria-label={`Move ${stop.location} earlier`} disabled={index === 0} onClick={() => onMove(index, -1)}><ArrowUp size={16} aria-hidden="true" /></Button><Button variant="ghost" size="icon" aria-label={`Move ${stop.location} later`} disabled={index === stops.length - 1} onClick={() => onMove(index, 1)}><ArrowDown size={16} aria-hidden="true" /></Button></span></div>)}</div></CardContent></Card>
  </>;
}

function FuelCostsPage({ range, setRange, category, setCategory }: { range: string; setRange: (value: string) => void; category: string; setCategory: (value: string) => void }) {
  const categories = ["All", "Diesel", "Reefer", "Tolls"];
  const fuelData = range === "Today" ? [36, 64, 48, 82, 55, 72, 43] : range === "This week" ? [50, 72, 61, 90, 55, 77, 67] : [63, 84, 72, 94, 68, 81, 58];
  return <><PageHeading eyebrow="INSIGHTS / FUEL & COSTS" title="Fuel & costs" description="Illustrative consumption and route expenses for the selected period." action={<Select value={range} onValueChange={setRange}><SelectTrigger className="to-filter-select" aria-label="Fuel cost period"><SelectValue /></SelectTrigger><SelectContent>{["Today", "This week", "This month"].map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select>} />
    <div className="to-overview-stats"><MetricCard icon={Fuel} label="Diesel used" value={range === "Today" ? "11.4 L" : range === "This week" ? "184 L" : "762 L"} detail="Across sample routes" /><MetricCard icon={Gauge} label="Avg efficiency" value="9.1 L" detail="Per 100 km" /><MetricCard icon={Zap} label="Carbon estimate" value="30.2 kg" detail="CO₂ equivalent" /><MetricCard icon={Activity} label="Fuel variance" value="−4.8%" detail="Against route plan" /></div>
    <div className="to-cost-layout"><Card className="to-cost-chart"><CardContent className="to-card-body"><div className="to-card-heading"><div><h2>Consumption trend</h2><p>{range} · sample fleet usage</p></div><Badge className="to-status to-status-active"><ArrowDown size={13} aria-hidden="true" />4.8%</Badge></div><div className="to-bar-chart" role="img" aria-label={`Fuel consumption trend for ${range}`}>{fuelData.map((height, index) => <button type="button" key={index} className={`${category !== "All" && index % 3 !== categories.indexOf(category) - 1 ? "is-dimmed" : ""}`} style={{ height: `${height}%` }} aria-label={`Route ${index + 1}: ${height} percent usage`} onClick={() => setCategory(categories[(index % 3) + 1])}><span>{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][index]}</span></button>)}</div><div className="to-chart-note"><span>Click a bar to filter category.</span><Button variant="ghost" size="sm" onClick={() => setCategory("All")}>Reset filter</Button></div></CardContent></Card>
      <Card><CardContent className="to-card-body"><div className="to-card-heading"><div><h2>Cost breakdown</h2><p>{category === "All" ? "All categories" : category}</p></div><Download size={17} aria-hidden="true" /></div><div className="to-cost-list">{[{ name: "Diesel", value: "$482.60", pct: 68, color: "diesel" }, { name: "Reefer energy", value: "$132.40", pct: 42, color: "reefer" }, { name: "Tolls & fees", value: "$86.20", pct: 27, color: "tolls" }].filter((item) => category === "All" || category === item.name.split(" ")[0]).map((item) => <div key={item.name}><span><b>{item.name}</b><strong>{item.value}</strong></span><i><b className={item.color} style={{ width: `${item.pct}%` }} /></i></div>)}</div><Button variant="outline" className="to-full-width" onClick={() => setCategory("All")}><Download size={16} aria-hidden="true" />Reset cost view</Button></CardContent></Card></div>
  </>;
}

function SettingsPage({ depot, setDepot, reeferAlerts, setReeferAlerts, routeAlerts, setRouteAlerts, onSave }: { depot: string; setDepot: (value: string) => void; reeferAlerts: boolean; setReeferAlerts: (value: boolean) => void; routeAlerts: boolean; setRouteAlerts: (value: boolean) => void; onSave: () => void }) {
  return <><PageHeading eyebrow="WORKSPACE / SETTINGS" title="Settings" description="Configure local operations preferences for this preview." />
    <div className="to-settings-layout"><Card><CardContent className="to-card-body"><div className="to-card-heading"><div><h2>Dispatch preferences</h2><p>Applied only to this sample workspace.</p></div><Settings size={18} aria-hidden="true" /></div><div className="to-setting-row"><div><Label htmlFor="to-setting-depot">Default depot</Label><small>Used as the starting point for new sample loads.</small></div><Select value={depot} onValueChange={setDepot}><SelectTrigger id="to-setting-depot" aria-label="Default depot"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="West Hub">West Hub</SelectItem><SelectItem value="Central Depot">Central Depot</SelectItem><SelectItem value="South Hub">South Hub</SelectItem></SelectContent></Select></div><div className="to-setting-row"><div><Label htmlFor="to-reefer-alerts">Reefer excursions</Label><small>Show a sample alert if cargo leaves target range.</small></div><Switch id="to-reefer-alerts" checked={reeferAlerts} onCheckedChange={setReeferAlerts} aria-label="Reefer excursions" /></div><div className="to-setting-row"><div><Label htmlFor="to-route-alerts">Route changes</Label><small>Show local ETA and route updates.</small></div><Switch id="to-route-alerts" checked={routeAlerts} onCheckedChange={setRouteAlerts} aria-label="Route changes" /></div><div className="to-settings-footer"><span><ShieldCheck size={15} aria-hidden="true" />Saved to this session only</span><Button onClick={onSave}>Save preferences</Button></div></CardContent></Card>
      <Card className="to-settings-note"><CardContent className="to-card-body"><span className="to-settings-mark"><Radio size={19} aria-hidden="true" /></span><h2>Sample environment</h2><p>This design preview does not connect to a GPS, carrier, driver account, temperature sensor, or dispatch service.</p><Badge className="to-status to-status-neutral">No live connection</Badge></CardContent></Card></div>
  </>;
}

export default TransitOperations;
